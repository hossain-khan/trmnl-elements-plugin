#!/usr/bin/env node

/**
 * Script to generate the Element of the Day JSON file.
 * Selects an element based on the day of the year to ensure
 * variety over a 118-day cycle.
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate the day of year from a given date
 * @param {Date} date - The date to calculate from
 * @returns {number} Day of year (1-366)
 */
function getDayOfYear(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

/**
 * Get element index based on day of year
 * @param {number} dayOfYear - Day of the year (1-366)
 * @param {number} totalElements - Total number of elements
 * @returns {number} Element index (0-based)
 */
function getElementIndex(dayOfYear, totalElements) {
  return dayOfYear % totalElements;
}

/**
 * Build element data object from raw data
 * @param {Array} element - Raw element data array
 * @param {Object} columnIndex - Column index mapping
 * @param {Date} timestamp - Timestamp for updated_at field
 * @returns {Object} Formatted element data
 */
function buildElementData(element, columnIndex, timestamp) {
  return {
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
    updated_at: timestamp.toISOString()
  };
}

/**
 * Main function to generate element of the day
 * @param {Date} date - Date to generate element for (defaults to now)
 * @param {string} dataPath - Path to periodic table data file
 * @returns {Object} Element of the day output object
 */
function generateElementOfTheDay(date = new Date(), dataPath = null) {
  // Use default path if not provided
  if (!dataPath) {
    dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
  }

  // Read the periodic table data
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
  const dayOfYear = getDayOfYear(date);
  const elementIndex = getElementIndex(dayOfYear, elements.length);

  // Get the element for today
  const element = elements[elementIndex].Cell;

  // Build the element object
  const elementData = buildElementData(element, columnIndex, date);

  // Output object for TRMNL
  return {
    element: elementData
  };
}

/**
 * Write output to files
 * @param {Object} output - Output object to write
 * @param {string} basePath - Base path for output files
 */
function writeOutputFiles(output, basePath = null) {
  if (!basePath) {
    basePath = path.join(__dirname, '..');
  }

  // Write to api/element-of-the-day.json
  const outputPath = path.join(basePath, 'api', 'element-of-the-day.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Also write to data.json for local testing
  const dataOutputPath = path.join(basePath, 'data.json');
  fs.writeFileSync(dataOutputPath, JSON.stringify(output, null, 2));
}

// Main execution (only run if called directly, not when required as a module)
if (require.main === module) {
  const now = new Date();
  const output = generateElementOfTheDay(now);
  writeOutputFiles(output);

  console.log(`Element of the Day: ${output.element.name} (${output.element.symbol})`);
  console.log(`Updated: ${output.element.updated_at}`);
}

// Export functions for testing
module.exports = {
  getDayOfYear,
  getElementIndex,
  buildElementData,
  generateElementOfTheDay,
  writeOutputFiles
};
