/**
 * Name Matching Service
 * Compares authenticated ShareKart user name with Aadhaar demographic name.
 * Handles casing, spacing, honorifics (Shri, Smt, Mr, Mrs), and token permutations.
 */

const HONORIFICS = new Set(['mr', 'mrs', 'ms', 'dr', 'shri', 'smt', 'kumar', 'kumari']);

/**
 * Normalizes a name string: lowercase, strips punctuation, strips common honorifics
 */
export function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0 && !HONORIFICS.has(token))
    .join(' ')
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => 
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Compares two names and returns match details and a score from 0 to 1
 *
 * @param {string} userName - Name on ShareKart account
 * @param {string} docName - Name extracted from verified Aadhaar document
 * @returns {{ matched: boolean, score: number, method: string }}
 */
export function compareNames(userName, docName) {
  const normUser = normalizeName(userName);
  const normDoc = normalizeName(docName);

  if (!normUser || !normDoc) {
    return { matched: false, score: 0.0, method: 'empty' };
  }

  // 1. Exact normalized match
  if (normUser === normDoc) {
    return { matched: true, score: 1.0, method: 'exact' };
  }

  // 2. Token set / permutation match (e.g. "Patel Aarav" vs "Aarav Patel")
  const userTokens = normUser.split(' ').sort();
  const docTokens = normDoc.split(' ').sort();

  if (userTokens.join(' ') === docTokens.join(' ')) {
    return { matched: true, score: 0.98, method: 'token_permutation' };
  }

  // 3. Token containment (e.g. "Aarav Kumar Patel" contains "Aarav Patel")
  const userSet = new Set(userTokens);
  const docSet = new Set(docTokens);
  const intersection = userTokens.filter(t => docSet.has(t));
  const union = new Set([...userTokens, ...docTokens]);
  const jaccard = intersection.length / union.size;

  if (jaccard >= 0.66) {
    return { matched: true, score: Number((0.85 + jaccard * 0.1).toFixed(2)), method: 'token_overlap' };
  }

  // 4. Levenshtein string similarity
  const maxLen = Math.max(normUser.length, normDoc.length);
  const distance = levenshteinDistance(normUser, normDoc);
  const levSimilarity = 1 - distance / maxLen;

  const score = Number(Math.max(jaccard, levSimilarity).toFixed(2));
  const matched = score >= 0.75;

  return {
    matched,
    score,
    method: 'fuzzy_similarity'
  };
}
