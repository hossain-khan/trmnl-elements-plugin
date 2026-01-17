#!/usr/bin/env node

/**
 * Script to generate the Element of the Day JSON file.
 * Selects an element based on the day of the year to ensure
 * variety over a 118-day cycle.
 */

const fs = require('fs');
const path = require('path');

// Read the periodic table data
const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
const periodicData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Column indices for reference
const columns = periodicData.Table.Columns.Column;
const columnIndex = {};
columns.forEach((col, idx) => {
  columnIndex[col] = idx;
});

// Get all elements
const elements = periodicData.Table.Row;

// Calculate element index based on day of year
const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 1);
const diff = now - startOfYear;
const oneDay = 1000 * 60 * 60 * 24;
const dayOfYear = Math.floor(diff / oneDay) + 1;
const elementIndex = dayOfYear % elements.length;

// Get the element for today
const element = elements[elementIndex].Cell;

// Build the element object
const elementData = {
  atomic_number: element[columnIndex['AtomicNumber']],
  symbol: element[columnIndex['Symbol']],
  name: element[columnIndex['Name']],
  atomic_mass: element[columnIndex['AtomicMass']],
  category: element[columnIndex['GroupBlock']],
  standard_state: element[columnIndex['StandardState']],
  electron_configuration: element[columnIndex['ElectronConfiguration']],
  electronegativity: element[columnIndex['Electronegativity']] || 'N/A',
  melting_point: element[columnIndex['MeltingPoint']] ? `${element[columnIndex['MeltingPoint']]} K` : 'N/A',
  boiling_point: element[columnIndex['BoilingPoint']] ? `${element[columnIndex['BoilingPoint']]} K` : 'N/A',
  density: element[columnIndex['Density']] || 'N/A',
  oxidation_states: element[columnIndex['OxidationStates']] || 'N/A',
  year_discovered: element[columnIndex['YearDiscovered']],
  updated_at: now.toISOString()
};

// Output object for TRMNL
const output = {
  element: elementData
};

// Write to api/element-of-the-day.json
const outputPath = path.join(__dirname, '..', 'api', 'element-of-the-day.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

// Also write to data.json for local testing
const dataOutputPath = path.join(__dirname, '..', 'data.json');
fs.writeFileSync(dataOutputPath, JSON.stringify(output, null, 2));

console.log(`Element of the Day: ${elementData.name} (${elementData.symbol})`);
console.log(`Updated: ${elementData.updated_at}`);
