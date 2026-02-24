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
- Focus on key concepts, definitions, facts, and ideas from the ACTUAL CONTENT — NOT on document structure (chapter numbers, headings, page numbers, or the document title)
- NEVER create questions about figures, images, diagrams, charts, tables, or graphs — these are not visible to the quiz taker. Only ask about information stated in the text itself
- Cover a range of topics from the document
- Vary difficulty (mix easy, medium, hard)
- CRITICAL FORMATTING RULE: Every option must be between 3-12 words. Write the correct answer FIRST, then write 3 wrong answers that are the SAME length (± 2 words). If the correct answer is 6 words, all wrong answers must also be 5-8 words. NEVER let the correct answer be noticeably longer than the others
- Randomize where the correct answer appears (not always the same position)

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
- Front: a clear term, concept, or question drawn from the ACTUAL CONTENT
- Back: a concise but complete answer or definition
- IMPORTANT: Focus on key concepts, definitions, facts, and ideas — NOT on document structure like chapter titles, section headings, page numbers, or the document's own title
- NEVER reference figures, images, diagrams, charts, tables, or graphs — these are not visible to the quiz taker
- Cover important and testable concepts from the document
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
- Left side: key terms, concepts, names, or vocabulary from the ACTUAL CONTENT (under 10 words)
- Right side: their corresponding definitions, descriptions, or explanations (under 20 words)
- IMPORTANT: Focus on substantive concepts, facts, and terminology from the document — NOT on document structure like chapter titles, section headings, page numbers, or the document's own title
- NEVER reference figures, images, diagrams, charts, tables, or graphs — these are not visible to the quiz taker
- Each pair should test knowledge of the material (e.g., term → definition, cause → effect, concept → example)
- Left and right sides must be clearly distinct
- No duplicate terms
- Pairs should be challenging — avoid trivially obvious matches

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

  // Step 3: Try Claude (Anthropic) first, then fall back to OpenRouter free models
  let rawText = null;
  let lastError = null;

  // --- Try Claude first ---
  if (process.env.ANTHROPIC_API_KEY) {
    // Pick model based on complexity:
    // - Haiku: flashcards or small quizzes (≤5 items) — fast & cheap
    // - Sonnet: default for most quizzes — good balance
    // - Opus: large quizzes (>15 items) with custom instructions — highest quality
    let claudeModel = 'claude-sonnet-4-20250514';
    if (quizType === 'flashcard' || count <= 5) {
      claudeModel = 'claude-haiku-4-5-20251001';
    } else if (count > 15 && customInstructions) {
      claudeModel = 'claude-opus-4-20250514';
    }

    try {
      console.log(`🤖 Trying Claude (${claudeModel})...`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        rawText = data.content?.[0]?.text;
        if (rawText) console.log('✅ Success with Claude');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Claude failed:', errorData?.error?.message || response.status);
        lastError = errorData?.error?.message || `HTTP ${response.status}`;
      }
    } catch (err) {
      console.warn('Claude threw error:', err.message);
      lastError = err.message;
    }
  }

  // --- Fall back to OpenRouter free models ---
  if (!rawText) {
    const FREE_MODELS = [
      'openrouter/free',
      'google/gemma-3-27b-it:free',
      'deepseek/deepseek-r1-0528:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'meta-llama/llama-3.2-11b-vision-instruct:free',
    ];

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
          continue;
        }

        const data = await response.json();

        if (data.error) {
          console.warn(`Model ${model} returned error in body:`, data.error?.message || data.error);
          lastError = data.error?.message || 'Provider error';
          continue;
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
