/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)
 * 
 * A multi-criteria decision analysis method that ranks alternatives based on
 * their geometric distance from the ideal best and worst solutions.
 */

/**
 * Step 1: Build the decision matrix from candidates and their attribute values
 * @param {Array} candidates - Array of candidate objects with data
 * @param {Array} attributes - Array of attribute definitions
 * @returns {Array} 2D matrix [candidates x attributes]
 */
function buildDecisionMatrix(candidates, attributes) {
    return candidates.map(candidate => {
        return attributes.map(attr => {
            const dataPoint = candidate.data.find(d => d.attributeName === attr.name);
            return dataPoint ? dataPoint.value : 0;
        });
    });
}

/**
 * Step 2: Normalize the decision matrix using vector normalization
 * Each value is divided by the square root of sum of squares for that column
 * @param {Array} matrix - 2D decision matrix
 * @returns {Array} Normalized 2D matrix
 */
function normalizeMatrix(matrix) {
    if (matrix.length === 0 || matrix[0].length === 0) return matrix;

    const numAttributes = matrix[0].length;
    const numCandidates = matrix.length;

    // Calculate the denominator for each column (sqrt of sum of squares)
    const denominators = [];
    for (let j = 0; j < numAttributes; j++) {
        let sumOfSquares = 0;
        for (let i = 0; i < numCandidates; i++) {
            sumOfSquares += matrix[i][j] * matrix[i][j];
        }
        // Avoid division by zero
        denominators.push(Math.sqrt(sumOfSquares) || 1);
    }

    // Normalize each value
    return matrix.map(row =>
        row.map((value, j) => value / denominators[j])
    );
}

/**
 * Step 3: Apply weights to the normalized matrix
 * @param {Array} normalizedMatrix - Normalized 2D matrix
 * @param {Array} weights - Array of weights for each attribute
 * @returns {Array} Weighted normalized matrix
 */
function applyWeights(normalizedMatrix, weights) {
    return normalizedMatrix.map(row =>
        row.map((value, j) => value * weights[j])
    );
}

/**
 * Step 4: Determine ideal best (A+) and ideal worst (A-) solutions
 * For beneficial attributes: best = max, worst = min
 * For non-beneficial attributes: best = min, worst = max
 * @param {Array} weightedMatrix - Weighted normalized matrix
 * @param {Array} beneficial - Array of booleans indicating if attribute is beneficial
 * @returns {Object} { idealBest: Array, idealWorst: Array }
 */
function findIdealSolutions(weightedMatrix, beneficial) {
    if (weightedMatrix.length === 0) {
        return { idealBest: [], idealWorst: [] };
    }

    const numAttributes = weightedMatrix[0].length;
    const idealBest = [];
    const idealWorst = [];

    for (let j = 0; j < numAttributes; j++) {
        const columnValues = weightedMatrix.map(row => row[j]);
        const maxVal = Math.max(...columnValues);
        const minVal = Math.min(...columnValues);

        if (beneficial[j]) {
            // Higher is better
            idealBest.push(maxVal);
            idealWorst.push(minVal);
        } else {
            // Lower is better
            idealBest.push(minVal);
            idealWorst.push(maxVal);
        }
    }

    return { idealBest, idealWorst };
}

/**
 * Step 5: Calculate Euclidean distance from each alternative to ideal solutions
 * @param {Array} weightedMatrix - Weighted normalized matrix
 * @param {Array} idealBest - Ideal best solution
 * @param {Array} idealWorst - Ideal worst solution
 * @returns {Object} { distancesToBest: Array, distancesToWorst: Array }
 */
function calculateDistances(weightedMatrix, idealBest, idealWorst) {
    const distancesToBest = [];
    const distancesToWorst = [];

    for (const row of weightedMatrix) {
        let sumBest = 0;
        let sumWorst = 0;

        for (let j = 0; j < row.length; j++) {
            sumBest += Math.pow(row[j] - idealBest[j], 2);
            sumWorst += Math.pow(row[j] - idealWorst[j], 2);
        }

        distancesToBest.push(Math.sqrt(sumBest));
        distancesToWorst.push(Math.sqrt(sumWorst));
    }

    return { distancesToBest, distancesToWorst };
}

/**
 * Step 6: Calculate relative closeness score for each alternative
 * Score = Distance to Worst / (Distance to Best + Distance to Worst)
 * Higher score = closer to ideal solution = better candidate
 * @param {Array} distancesToBest - Array of distances to ideal best
 * @param {Array} distancesToWorst - Array of distances to ideal worst
 * @returns {Array} Array of closeness scores (0-1)
 */
function calculateClosenessScores(distancesToBest, distancesToWorst) {
    return distancesToBest.map((dBest, i) => {
        const dWorst = distancesToWorst[i];
        const denominator = dBest + dWorst;
        // Handle edge case where both distances are 0 (single candidate or all same values)
        if (denominator === 0) return 0.5;
        return dWorst / denominator;
    });
}

/**
 * Main TOPSIS function - ranks candidates based on multi-criteria analysis
 * 
 * @param {Array} candidates - Array of candidate objects
 *   Each candidate: { _id, name, data: [{ attributeName, value }] }
 * @param {Array} attributes - Array of attribute definitions
 *   Each attribute: { name, weight, beneficial }
 * @returns {Object} Analysis results
 *   {
 *     rankings: [{ candidateId, candidateName, score, distanceToBest, distanceToWorst, rank }],
 *     idealBest: number[],
 *     idealWorst: number[],
 *     normalizedMatrix: number[][],
 *     weightedMatrix: number[][]
 *   }
 */
export function topsis(candidates, attributes) {
    // Edge case: no candidates
    if (!candidates || candidates.length === 0) {
        return {
            rankings: [],
            idealBest: [],
            idealWorst: [],
            normalizedMatrix: [],
            weightedMatrix: []
        };
    }

    // Edge case: single candidate
    if (candidates.length === 1) {
        return {
            rankings: [{
                candidateId: candidates[0]._id,
                candidateName: candidates[0].name,
                closenessScore: 1.0, // Only candidate is the best
                distanceToBest: 0,
                distanceToWorst: 0,
                rank: 1
            }],
            idealBest: [],
            idealWorst: [],
            normalizedMatrix: [],
            weightedMatrix: []
        };
    }

    // Edge case: no attributes
    if (!attributes || attributes.length === 0) {
        return {
            rankings: candidates.map((c, i) => ({
                candidateId: c._id,
                candidateName: c.name,
                closenessScore: 0.5,
                distanceToBest: 0,
                distanceToWorst: 0,
                rank: i + 1
            })),
            idealBest: [],
            idealWorst: [],
            normalizedMatrix: [],
            weightedMatrix: []
        };
    }

    // Extract weights and beneficial flags
    const weights = attributes.map(a => a.weight);
    const beneficial = attributes.map(a => a.beneficial);

    // Step 1: Build decision matrix
    const decisionMatrix = buildDecisionMatrix(candidates, attributes);

    // Step 2: Normalize the matrix
    const normalizedMatrix = normalizeMatrix(decisionMatrix);

    // Step 3: Apply weights
    const weightedMatrix = applyWeights(normalizedMatrix, weights);

    // Step 4: Find ideal solutions
    const { idealBest, idealWorst } = findIdealSolutions(weightedMatrix, beneficial);

    // Step 5: Calculate distances
    const { distancesToBest, distancesToWorst } = calculateDistances(
        weightedMatrix,
        idealBest,
        idealWorst
    );

    // Step 6: Calculate closeness scores
    const closenessScores = calculateClosenessScores(distancesToBest, distancesToWorst);

    // Create results with candidate info
    const results = candidates.map((candidate, i) => ({
        candidateId: candidate._id,
        candidateName: candidate.name,
        closenessScore: Math.round(closenessScores[i] * 10000) / 10000, // 4 decimal places
        distanceToBest: Math.round(distancesToBest[i] * 10000) / 10000,
        distanceToWorst: Math.round(distancesToWorst[i] * 10000) / 10000,
        rank: 0 // Will be assigned after sorting
    }));

    // Step 7: Rank by closeness score (higher is better)
    results.sort((a, b) => b.closenessScore - a.closenessScore);

    // Assign ranks (handle ties by giving same rank)
    let currentRank = 1;
    for (let i = 0; i < results.length; i++) {
        if (i > 0 && results[i].closenessScore < results[i - 1].closenessScore) {
            currentRank = i + 1;
        }
        results[i].rank = currentRank;
    }

    return {
        rankings: results,
        idealBest: idealBest.map(v => Math.round(v * 10000) / 10000),
        idealWorst: idealWorst.map(v => Math.round(v * 10000) / 10000),
        normalizedMatrix,
        weightedMatrix
    };
}

/**
 * Utility: Validate that candidates have all required attribute values
 * @param {Array} candidates - Array of candidates
 * @param {Array} attributes - Array of attributes
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateCandidateData(candidates, attributes) {
    const errors = [];

    for (const candidate of candidates) {
        for (const attr of attributes) {
            const dataPoint = candidate.data.find(d => d.attributeName === attr.name);
            if (!dataPoint) {
                errors.push(`${candidate.name} is missing value for "${attr.name}"`);
            } else if (typeof dataPoint.value !== 'number' || isNaN(dataPoint.value)) {
                errors.push(`${candidate.name} has invalid value for "${attr.name}"`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export default topsis;
