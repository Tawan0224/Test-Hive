import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// ─────────────────────────────────────────────
// Prompt builders
// ─────────────────────────────────────────────

function buildMCQPrompt(count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert quiz creator. Analyze the provided PDF and generate exactly ${count} multiple-choice questions.${extra}

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
}`;
}

function buildFlashcardPrompt(count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert study material creator. Analyze the provided PDF and generate exactly ${count} flashcards.${extra}

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
}`;
}

function buildMatchingPrompt(count, customInstructions) {
  const extra = customInstructions ? `\nAdditional instructions: ${customInstructions}` : '';
  return `You are an expert quiz creator. Analyze the provided PDF and generate exactly ${count} matching pairs.${extra}

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
}`;
}

// ─────────────────────────────────────────────
// Main generation function
// ─────────────────────────────────────────────

export async function generateQuizFromPDF({ filePath, quizType, count, customInstructions }) {
  // ✅ Initialize INSIDE the function so dotenv has already loaded by this point
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Read the PDF file as base64
  const pdfBuffer = fs.readFileSync(filePath);
  const base64PDF = pdfBuffer.toString('base64');

  // Pick the right prompt
  let prompt;
  if (quizType === 'multiple-choice') prompt = buildMCQPrompt(count, customInstructions);
  else if (quizType === 'flashcard') prompt = buildFlashcardPrompt(count, customInstructions);
  else if (quizType === 'matching') prompt = buildMatchingPrompt(count, customInstructions);
  else throw new Error(`Unknown quiz type: ${quizType}`);

  // Use Gemini 1.5 Flash (free tier)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64PDF,
      },
    },
    { text: prompt },
  ]);

  const rawText = result.response.text();

  // Strip markdown fences if Gemini wraps output in ```json ... ```
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini raw response:', rawText);
    throw new Error('Gemini returned invalid JSON. Try again or adjust your instructions.');
  }

  return parsed;
}