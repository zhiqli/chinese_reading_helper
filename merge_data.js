// Script to merge list.json with all_articles_data.js
const fs = require('fs');
const path = require('path');

// Read list.json
const listJsonPath = path.join(__dirname, 'list.json');
const listData = JSON.parse(fs.readFileSync(listJsonPath, 'utf8'));

// Read all_articles_data.js
const articlesDataPath = path.join(__dirname, 'miniprogram/utils/all_articles_data.js');
const articlesDataContent = fs.readFileSync(articlesDataPath, 'utf8');

// Extract the array from the module.exports format
const articlesDataMatch = articlesDataContent.match(/const articlesData = \s*(\[[\s\S]*\]);\s*module\.exports/);
if (!articlesDataMatch) {
    console.error('Could not parse articles data');
    process.exit(1);
}

const articlesData = JSON.parse(articlesDataMatch[1]);

// Create a map from title to article data for quick lookup
const titleToArticleMap = new Map();
articlesData.forEach(article => {
    titleToArticleMap.set(article.title, article);
});

// Helper function to normalize titles for matching
function normalizeTitle(title) {
    return title
        .replace(/[\s\p{P}]/gu, '') // Remove all punctuation and whitespace
        .toLowerCase()
        .trim();
}

// Create a normalized title map for fuzzy matching
const normalizedTitleMap = new Map();
articlesData.forEach(article => {
    const normalized = normalizeTitle(article.title);
    if (!normalizedTitleMap.has(normalized)) {
        normalizedTitleMap.set(normalized, article);
    }
});

console.log(`Found ${articlesData.length} articles in all_articles_data.js`);
console.log(`Found ${listData.length} items in list.json`);

// Merge data by title with fuzzy matching
let matchedCount = 0;
const mergedData = listData.map(item => {
    let matchingArticle = titleToArticleMap.get(item.title);
    
    // Try exact match first
    if (matchingArticle) {
        matchedCount++;
        console.log(`✓ Exact match: "${item.title}"`);
    } else {
        // Try fuzzy matching with normalized titles
        const normalizedItemTitle = normalizeTitle(item.title);
        matchingArticle = normalizedTitleMap.get(normalizedItemTitle);
        
        if (matchingArticle) {
            matchedCount++;
            console.log(`✓ Fuzzy match: "${item.title}" -> "${matchingArticle.title}"`);
        } else {
            console.log(`✗ No match found for: "${item.title}"`);
        }
    }
    
    if (matchingArticle) {
        // Add new fields while preserving original structure and order
        return {
            src: item.src,
            grade: item.grade,
            semester: item.semester,
            lesson_number: item.lesson_number,
            title: item.title,
            // Add new fields from all_articles_data.js
            emoji: matchingArticle.emoji,
            author: matchingArticle.author,
            reader: matchingArticle.reader,
            content: matchingArticle.content
        };
    } else {
        // Keep original item but add empty fields for consistency
        return {
            src: item.src,
            grade: item.grade,
            semester: item.semester,
            lesson_number: item.lesson_number,
            title: item.title,
            emoji: "",
            author: "",
            reader: "",
            content: ""
        };
    }
});

console.log(`\nMatched ${matchedCount} out of ${listData.length} items`);

// Write the merged data back to list.json
const outputPath = path.join(__dirname, 'list_merged.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');

console.log(`\nMerged data written to: ${outputPath}`);
console.log('Please review the merged file before replacing the original list.json');