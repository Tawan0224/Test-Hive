import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// ─────────────────────────────────────────────
// Extract text from PDF using pdfjs-dist
// ─────────────────────────────────────────────

async function extractTextFromPDF(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(pdfBuffer);
  
  const loadingTask = getDocument({ data: uint8Array, disableFontFace: true });
  const pdfDoc = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

// ─────────────────────────────────────────────
// Prompt builders (text-based, no PDF binary)
// ─────────────────────────────────────────────

function buildMCQPrompt(text, count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert quiz creator. Based on the following document content, generate exactly ${count} multiple-choice questions.${extra}

RULES:
- Each question must have exactly 4 options
- Exactly 1 option must be correct
- Questions must be clear and unambiguous
- Cover a range of topics from the document
- Vary difficulty (mix easy, medium, hard)

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "title": "Quiz title based on the document content",
  "questions": [
    {
      "questionText": "Question here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "timeLimit": 30,
      "points": 10
    }
  ]
}

DOCUMENT CONTENT:
${text}`;
}

function buildFlashcardPrompt(text, count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert study material creator. Based on the following document content, generate exactly ${count} flashcards.${extra}

RULES:
- Front: a clear term, concept, or question
- Back: a concise but complete answer or definition
- Cover key concepts from the document
- Keep fronts short (under 15 words)
- Keep backs informative but concise (under 50 words)
- Group related cards under the same deckName

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "title": "Flashcard deck title based on the document",
  "deckName": "Main topic or subject name",
  "cards": [
    {
      "front": "Term or question",
      "back": "Definition or answer",
      "deckName": "Subtopic name"
    }
  ]
}

DOCUMENT CONTENT:
${text}`;
}

function buildMatchingPrompt(text, count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert quiz creator. Based on the following document content, generate exactly ${count} matching pairs.${extra}

RULES:
- Left side: short terms, names, or concepts (under 10 words)
- Right side: definitions, descriptions, or values (under 20 words)
- All pairs must be from the document content
- Left and right sides must be clearly distinct
- No duplicate terms

Respond with ONLY valid JSON, no markdown, no explanation:
{
  "title": "Matching quiz title based on the document",
  "pairs": [
    {
      "left": "Term or concept",
      "right": "Definition or description"
    }
  ],
  "timeLimit": 120,
  "points": 10
}

DOCUMENT CONTENT:
${text}`;
}

// ─────────────────────────────────────────────
// Main generation function
// ─────────────────────────────────────────────

export async function generateQuizFromPDF({ filePath, quizType, count, customInstructions }) {
  // Step 1: Extract text from PDF
  const extractedText = await extractTextFromPDF(filePath);

  if (!extractedText || extractedText.length < 50) {
    throw new Error('Could not extract readable text from this PDF. Make sure it is not a scanned image-only PDF.');
  }

  // Trim to avoid token limits (~12000 chars)
  const trimmedText = extractedText.slice(0, 12000);

  // Step 2: Build prompt
  let prompt;
  if (quizType === 'multiple-choice') prompt = buildMCQPrompt(trimmedText, count, customInstructions);
  else if (quizType === 'flashcard') prompt = buildFlashcardPrompt(trimmedText, count, customInstructions);
  else if (quizType === 'matching') prompt = buildMatchingPrompt(trimmedText, count, customInstructions);
  else throw new Error(`Unknown quiz type: ${quizType}`);

  // Step 3: Send to OpenRouter — try multiple free models as fallback
  const FREE_MODELS = [
    'openrouter/free',                                    // Auto-picks any available free model
    'google/gemini-2.5-flash-image-preview:free',         // Google Gemini 2.5
    'google/gemma-3-27b-it:free',                         // Google Gemma 3
    'deepseek/deepseek-r1-0528:free',                     // DeepSeek R1
    'meta-llama/llama-3.2-11b-vision-instruct:free',      // Meta Llama 3.2
    'mistralai/mistral-small-3.1-24b-instruct:free',      // Mistral Small
  ];

  let rawText = null;
  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5001',
          'X-Title': 'TestHive',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.status === 401) {
        throw new Error('API key');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Model ${model} failed:`, errorData?.error?.message || response.status);
        lastError = errorData?.error?.message || `HTTP ${response.status}`;
        continue; // try next model
      }

      const data = await response.json();

      // OpenRouter sometimes returns 200 OK but with an error object inside
      if (data.error) {
        console.warn(`Model ${model} returned error in body:`, data.error?.message || data.error);
        lastError = data.error?.message || 'Provider error';
        continue; // try next model
      }

      rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        console.log(`✅ Success with model: ${model}`);
        break;
      }
    } catch (err) {
      if (err.message === 'API key') throw err;
      console.warn(`Model ${model} threw error:`, err.message);
      lastError = err.message;
    }
  }

  if (!rawText) {
    throw new Error(lastError?.includes('rate') ? 'rate limit' : (lastError || 'All AI models are currently unavailable. Please try again in a moment.'));
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('AI raw response:', rawText);
    throw new Error('AI returned invalid JSON. Try again or adjust your instructions.');
  }

  return parsed;
}