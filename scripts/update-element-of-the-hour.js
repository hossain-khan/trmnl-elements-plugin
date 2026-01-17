#!/usr/bin/env node

/**
 * Script to generate the Element of the Hour JSON file.
 * Selects an element based on the current hour to provide
 * hourly variety over a 118-hour cycle.
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate a unique hour identifier from a given date
 * Format: YYYYMMDDHH (e.g., 2026011714 for Jan 17, 2026, 2 PM)
 * @param {Date} date - The date to calculate from
 * @returns {number} Unique hour identifier
 */
function getHourIdentifier(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  return parseInt(`${year}${month}${day}${hour}`);
}

/**
 * Get element index based on hour identifier
 * @param {number} hourIdentifier - Unique hour identifier
 * @param {number} totalElements - Total number of elements
 * @returns {number} Element index (0-based)
 */
function getElementIndex(hourIdentifier, totalElements) {
  return hourIdentifier % totalElements;
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
 * Main function to generate element of the hour
 * @param {Date} date - Date to generate element for (defaults to now)
 * @param {string} dataPath - Path to periodic table data file
 * @returns {Object} Element of the hour output object
 */
function generateElementOfTheHour(date = new Date(), dataPath = null) {
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

  // Calculate element index based on hour identifier
  const hourIdentifier = getHourIdentifier(date);
  const elementIndex = getElementIndex(hourIdentifier, elements.length);

  // Get the element for this hour
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

  // Write to api/element-of-the-hour.json
  const outputPath = path.join(basePath, 'api', 'element-of-the-hour.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
}

// Main execution (only run if called directly, not when required as a module)
if (require.main === module) {
  const now = new Date();
  const output = generateElementOfTheHour(now);
  writeOutputFiles(output);

  console.log(`Element of the Hour: ${output.element.name} (${output.element.symbol})`);
  console.log(`Hour ID: ${getHourIdentifier(now)}`);
  console.log(`Updated: ${output.element.updated_at}`);
}

// Export functions for testing
module.exports = {
  getHourIdentifier,
  getElementIndex,
  buildElementData,
  generateElementOfTheHour,
  writeOutputFiles
};
