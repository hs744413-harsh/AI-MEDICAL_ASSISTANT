// ============================================================
// api.js — Central API Service
// All backend communication lives here.
// Base URL: http://localhost:8000
// ============================================================

const BASE_URL = 'http://localhost:8000';

/**
 * Generic fetch wrapper with unified error handling.
 * @param {string} endpoint  - e.g. '/research'
 * @param {object} body      - JSON-serialisable request body
 * @returns {Promise<object>} parsed JSON response
 */
async function post(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Server error (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail || err.message || message;
    } catch (_) { /* ignore parse error */ }
    throw new Error(message);
  }

  return response.json();
}

// -------------------------------------------------------
// 1. POST /research
//    Input:  { query: string }
//    Output: { summary, report, analysis }
// -------------------------------------------------------
export async function researchQuery(query) {
  return post('/research', { query });
}

// -------------------------------------------------------
// 2. POST /predict
//    Input:  { symptoms: string[] }
//    Output: { predictions: [{ disease, confidence }] }
// -------------------------------------------------------
export async function predictDisease(symptoms) {
  return post('/predict', { symptoms });
}

// -------------------------------------------------------
// 3. POST /analyze
//    Input:  { text: string }
//    Output: { extracted_symptoms, predictions, disease,
//              summary, report, analysis }
// -------------------------------------------------------
export async function analyzeText(text) {
  return post('/analyze', { text });
}
