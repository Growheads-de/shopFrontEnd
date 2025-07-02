export function sortByFuzzySimilarity(list, searchTerm) {
    const searchWords = searchTerm.toLowerCase().split(/\W+/).filter(Boolean);

    return list.slice().sort((textA, textB) => {
        const scoreA = fuzzySimilarityScore(textA, searchWords);
        const scoreB = fuzzySimilarityScore(textB, searchWords);
        return scoreB - scoreA;
    });
}

function fuzzySimilarityScore(text, searchWords) {
    const textWords = text.toLowerCase().split(/\W+/).filter(Boolean);
    let totalScore = 0;

    for (let searchWord of searchWords) {
        let bestSimilarity = 0;
        for (let word of textWords) {
            const similarity = stringSimilarity(searchWord, word);
            if (similarity > bestSimilarity) bestSimilarity = similarity;
        }
        if (bestSimilarity > 0.5) totalScore += bestSimilarity;
    }

    return totalScore;
}

function stringSimilarity(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 1 : 1 - (distance / maxLen);
}

function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= a.length; i++) matrix[i] = [i];
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a.charAt(i - 1) === b.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[a.length][b.length];
}