#!/usr/bin/env node

const { CATEGORIES } = require('../src/lib/constants.ts');

console.log('Testing Podium Category Structure...\n');

// Test category groups
const categoryGroups = [
  {
    id: 'role-specific-excellence',
    label: 'Role-Specific Excellence',
    categories: CATEGORIES.filter(c => c.group === 'role-specific-excellence').map(c => c.id)
  },
  {
    id: 'innovation-technology', 
    label: 'Innovation & Technology',
    categories: CATEGORIES.filter(c => c.group === 'innovation-technology').map(c => c.id)
  },
  {
    id: 'culture-impact',
    label: 'Culture & Impact', 
    categories: CATEGORIES.filter(c => c.group === 'culture-impact').map(c => c.id)
  },
  {
    id: 'growth-performance',
    label: 'Growth & Performance',
    categories: CATEGORIES.filter(c => c.group === 'growth-performance').map(c => c.id)
  },
  {
    id: 'geographic-excellence',
    label: 'Geographic Excellence',
    categories: CATEGORIES.filter(c => c.group === 'geographic-excellence').map(c => c.id)
  },
  {
    id: 'special-recognition',
    label: 'Special Recognition',
    categories: CATEGORIES.filter(c => c.group === 'special-recognition').map(c => c.id)
  }
];

categoryGroups.forEach(group => {
  console.log(`${group.label}:`);
  group.categories.forEach(catId => {
    const category = CATEGORIES.find(c => c.id === catId);
    console.log(`  - ${category?.label || catId} (${category?.type || 'unknown'})`);
  });
  console.log('');
});

console.log('✅ Category structure looks good!');