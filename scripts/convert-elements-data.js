#!/usr/bin/env node

/**
 * Script to convert PubChemElements_all.json to a simplified data-all.json format.
 * Transforms the nested Table structure into a flat array of element objects.
 */

const fs = require('fs');
const path = require('path');

/**
 * Map element cell data to a structured object
 * @param {Array} cell - Raw element data array
 * @param {Object} columnIndex - Column index mapping
 * @returns {Object} Formatted element data
 */
function mapElementData(cell, columnIndex) {
  return {
    atomic_number: cell[columnIndex['AtomicNumber']],
    symbol: cell[columnIndex['Symbol']],
    name: cell[columnIndex['Name']],
    atomic_mass: cell[columnIndex['AtomicMass']],
    cpk_hex_color: cell[columnIndex['CPKHexColor']] || null,
    electron_configuration: cell[columnIndex['ElectronConfiguration']],
    electronegativity: cell[columnIndex['Electronegativity']] || null,
    atomic_radius: cell[columnIndex['AtomicRadius']] || null,
    ionization_energy: cell[columnIndex['IonizationEnergy']] || null,
    electron_affinity: cell[columnIndex['ElectronAffinity']] || null,
    oxidation_states: cell[columnIndex['OxidationStates']] || null,
    standard_state: cell[columnIndex['StandardState']],
    melting_point: cell[columnIndex['MeltingPoint']] || null,
    boiling_point: cell[columnIndex['BoilingPoint']] || null,
    density: cell[columnIndex['Density']] || null,
    category: cell[columnIndex['GroupBlock']],
    year_discovered: cell[columnIndex['YearDiscovered']]
  };
}

/**
 * Convert PubChem periodic table data to simplified format
 * @param {string} inputPath - Path to PubChemElements_all.json
 * @returns {Object} Object containing metadata and elements array
 */
function convertElementsData(inputPath = null) {
  // Use default path if not provided
  if (!inputPath) {
    inputPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
  }

  // Read the source data
  const periodicData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  // Extract column names and create index mapping
  const columns = periodicData.Table.Columns.Column;
  const columnIndex = {};
  columns.forEach((col, idx) => {
    columnIndex[col] = idx;
  });

  // Convert each element row to an object
  const elements = periodicData.Table.Row.map(row => 
    mapElementData(row.Cell, columnIndex)
  );

  // Return object with metadata and elements array
  return {
    metadata: {
      total_elements: elements.length,
      data_source: 'PubChem',
      generated_at: new Date().toISOString(),
      description: 'Complete periodic table data with all 118 elements'
    },
    elements: elements
  };
}

/**
 * Write elements array to output file
 * @param {Object} data - Object containing metadata and elements array
 * @param {string} outputPath - Path to output file
 */
function writeElementsFile(data, outputPath = null) {
  if (!outputPath) {
    outputPath = path.join(__dirname, '..', 'data-all.json');
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

// Main execution (only run if called directly, not when required as a module)
if (require.main === module) {
  const data = convertElementsData();
  writeElementsFile(data);

  console.log(`✓ Converted ${data.elements.length} elements to data-all.json`);
  console.log(`  First element: ${data.elements[0].name} (${data.elements[0].symbol})`);
  console.log(`  Last element: ${data.elements[data.elements.length - 1].name} (${data.elements[data.elements.length - 1].symbol})`);
}

// Export functions for testing
module.exports = {
  mapElementData,
  convertElementsData,
  writeElementsFile
};
