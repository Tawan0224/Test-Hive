import fs from 'fs/promises';
// pdfjs-dist expects some browser geometry globals that are missing in Node serverless runtimes.
function ensurePdfJsPolyfills() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor() {
        this.a = 1; this.b = 0; this.c = 0;
        this.d = 1; this.e = 0; this.f = 0;
      }
      multiplySelf() { return this; }
      preMultiplySelf() { return this; }
      translateSelf() { return this; }
      scaleSelf() { return this; }
      rotateSelf() { return this; }
      invertSelf() { return this; }
    };
  }

  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
      constructor(data = null, width = 0, height = 0) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  }

  if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = class Path2D {
      constructor() {}
    };
  }
}

// ─────────────────────────────────────────────
// Extract text from PDF using pdfjs-dist
// ─────────────────────────────────────────────

async function extractTextFromPDF(filePath) {
  ensurePdfJsPolyfills();
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Vercel serverless bundles may not include pdf.worker.mjs.
  // Force parsing on the main thread instead of spawning a worker.
  GlobalWorkerOptions.workerSrc = '';

  const pdfBuffer = await fs.readFile(filePath);
  const uint8Array = new Uint8Array(pdfBuffer);
  
  const loadingTask = getDocument({
    data: uint8Array,
    disableFontFace: true,
    disableWorker: true,
    useWorkerFetch: false,
  });
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

  // Step 3: Call Claude (Anthropic)
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Please configure your API key.');
  }

  // Pick model based on complexity:
  // - Haiku: flashcards or 10-question quizzes — fast & cheap
  // - Sonnet: 15 or 20 questions — good balance
  // - Opus: only 20 questions with custom instructions (>50 chars)
  let claudeModel = 'claude-sonnet-4-20250514';
  if (quizType === 'flashcard' || count <= 10) {
    claudeModel = 'claude-haiku-4-5-20251001';
  } else if (count >= 20 && customInstructions && customInstructions.length > 50) {
    claudeModel = 'claude-opus-4-20250514';
  }

  let rawText = null;

  console.log(`🤖 Calling Claude (${claudeModel})...`);
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg.includes('rate') ? 'rate limit' : msg);
  }

  const data = await response.json();
  rawText = data.content?.[0]?.text;

  if (!rawText) {
    throw new Error('Claude returned an empty response. Please try again.');
  }

  console.log('✅ Success with Claude');

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
