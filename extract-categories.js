#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the nominations data
const dataPath = path.join(__dirname, 'data', 'nominations.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const nominations = JSON.parse(rawData);

// Extract unique categories
const categories = new Set();
const categoryTypes = {};

nominations.forEach(nomination => {
  if (nomination.status === 'approved') {
    categories.add(nomination.category);
    categoryTypes[nomination.category] = nomination.type;
  }
});

console.log('Unique categories found:');
Array.from(categories).sort().forEach(category => {
  console.log(`- "${category}" (${categoryTypes[category]})`);
});

console.log(`\nTotal categories: ${categories.size}`);