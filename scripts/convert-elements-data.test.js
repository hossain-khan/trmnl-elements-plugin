/**
 * Unit tests for convert-elements-data.js
 * Run with: node scripts/convert-elements-data.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  mapElementData,
  convertElementsData,
  writeElementsFile
} = require('./convert-elements-data.js');

// Simple test runner
function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}`);
      failed++;
    }
  }

  console.log('\n🧪 Running Element Data Conversion Tests\n');

  // Test mapElementData
  test('mapElementData - correctly maps Hydrogen data', () => {
    const hydrogenCell = ['1', 'H', 'Hydrogen', '1.0080', 'FFFFFF', '1s1', '2.2', '120', '13.598', '0.754', '+1, -1', 'Gas', '13.81', '20.28', '0.00008988', 'Nonmetal', '1766'];
    const columnIndex = {
      'AtomicNumber': 0,
      'Symbol': 1,
      'Name': 2,
      'AtomicMass': 3,
      'CPKHexColor': 4,
      'ElectronConfiguration': 5,
      'Electronegativity': 6,
      'AtomicRadius': 7,
      'IonizationEnergy': 8,
      'ElectronAffinity': 9,
      'OxidationStates': 10,
      'StandardState': 11,
      'MeltingPoint': 12,
      'BoilingPoint': 13,
      'Density': 14,
      'GroupBlock': 15,
      'YearDiscovered': 16
    };

    const result = mapElementData(hydrogenCell, columnIndex);

    assert.strictEqual(result.atomic_number, '1');
    assert.strictEqual(result.symbol, 'H');
    assert.strictEqual(result.name, 'Hydrogen');
    assert.strictEqual(result.atomic_mass, '1.0080');
    assert.strictEqual(result.cpk_hex_color, 'FFFFFF');
    assert.strictEqual(result.electron_configuration, '1s1');
    assert.strictEqual(result.electronegativity, '2.2');
    assert.strictEqual(result.atomic_radius, '120');
    assert.strictEqual(result.ionization_energy, '13.598');
    assert.strictEqual(result.electron_affinity, '0.754');
    assert.strictEqual(result.oxidation_states, '+1, -1');
    assert.strictEqual(result.standard_state, 'Gas');
    assert.strictEqual(result.melting_point, '13.81');
    assert.strictEqual(result.boiling_point, '20.28');
    assert.strictEqual(result.density, '0.00008988');
    assert.strictEqual(result.category, 'Nonmetal');
    assert.strictEqual(result.year_discovered, '1766');
  });

  test('mapElementData - handles empty values as null', () => {
    const heliumCell = ['2', 'He', 'Helium', '4.00260', 'D9FFFF', '1s2', '', '140', '24.587', '', '0', 'Gas', '0.95', '4.22', '0.0001785', 'Noble gas', '1868'];
    const columnIndex = {
      'AtomicNumber': 0,
      'Symbol': 1,
      'Name': 2,
      'AtomicMass': 3,
      'CPKHexColor': 4,
      'ElectronConfiguration': 5,
      'Electronegativity': 6,
      'AtomicRadius': 7,
      'IonizationEnergy': 8,
      'ElectronAffinity': 9,
      'OxidationStates': 10,
      'StandardState': 11,
      'MeltingPoint': 12,
      'BoilingPoint': 13,
      'Density': 14,
      'GroupBlock': 15,
      'YearDiscovered': 16
    };

    const result = mapElementData(heliumCell, columnIndex);

    assert.strictEqual(result.symbol, 'He');
    assert.strictEqual(result.electronegativity, null);
    assert.strictEqual(result.electron_affinity, null);
  });

  // Test convertElementsData with real data
  test('convertElementsData - reads and converts real data file', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    assert.ok(typeof data === 'object', 'Should return an object');
    assert.ok(data.metadata, 'Should have metadata property');
    assert.ok(data.elements, 'Should have elements property');
    assert.ok(Array.isArray(data.elements), 'Elements should be an array');
    assert.strictEqual(data.elements.length, 118, 'Should have 118 elements');
    assert.strictEqual(data.metadata.total_elements, 118, 'Metadata should show 118 elements');
  });

  test('convertElementsData - first element is Hydrogen', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    const hydrogen = data.elements[0];
    assert.strictEqual(hydrogen.atomic_number, '1');
    assert.strictEqual(hydrogen.symbol, 'H');
    assert.strictEqual(hydrogen.name, 'Hydrogen');
  });

  test('convertElementsData - last element is Oganesson', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    const oganesson = data.elements[117];
    assert.strictEqual(oganesson.atomic_number, '118');
    assert.strictEqual(oganesson.symbol, 'Og');
    assert.strictEqual(oganesson.name, 'Oganesson');
  });

  test('convertElementsData - metadata contains required fields', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    assert.ok(data.metadata.total_elements, 'Should have total_elements');
    assert.ok(data.metadata.data_source, 'Should have data_source');
    assert.ok(data.metadata.generated_at, 'Should have generated_at timestamp');
    assert.ok(data.metadata.description, 'Should have description');
    assert.strictEqual(data.metadata.data_source, 'PubChem');
  });

  test('convertElementsData - all elements have required fields', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    const requiredFields = [
      'atomic_number',
      'symbol',
      'name',
      'atomic_mass',
      'electron_configuration',
      'standard_state',
      'category',
      'year_discovered'
    ];

    data.elements.forEach((element, index) => {
      requiredFields.forEach(field => {
        assert.ok(
          element.hasOwnProperty(field),
          `Element ${index + 1} (${element.name}) should have ${field} field`
        );
        assert.ok(
          element[field] !== undefined,
          `Element ${index + 1} (${element.name}) ${field} should not be undefined`
        );
      });
    });
  });

  test('convertElementsData - Noble gases have zero oxidation states', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    const nobleGases = data.elements.filter(e => e.category === 'Noble gas');
    assert.ok(nobleGases.length >= 6, 'Should have at least 6 noble gases');

    // Check Helium
    const helium = data.elements.find(e => e.symbol === 'He');
    assert.strictEqual(helium.oxidation_states, '0');
  });

  test('convertElementsData - validates specific element properties', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const data = convertElementsData(dataPath);

    // Check Gold (Au)
    const gold = data.elements.find(e => e.symbol === 'Au');
    assert.strictEqual(gold.atomic_number, '79');
    assert.strictEqual(gold.name, 'Gold');
    assert.strictEqual(gold.category, 'Transition metal');
    assert.strictEqual(gold.year_discovered, 'Ancient');

    // Check Carbon (C)
    const carbon = data.elements.find(e => e.symbol === 'C');
    assert.strictEqual(carbon.atomic_number, '6');
    assert.strictEqual(carbon.name, 'Carbon');
    assert.strictEqual(carbon.category, 'Nonmetal');
  });

  // Test writeElementsFile
  test('writeElementsFile - creates valid JSON file', () => {
    const testData = {
      metadata: {
        total_elements: 1,
        data_source: 'PubChem',
        generated_at: new Date().toISOString(),
        description: 'Test data'
      },
      elements: [
        {
          atomic_number: '1',
          symbol: 'H',
          name: 'Hydrogen',
          atomic_mass: '1.0080',
          cpk_hex_color: 'FFFFFF',
          electron_configuration: '1s1',
          electronegativity: '2.2',
          atomic_radius: '120',
          ionization_energy: '13.598',
          electron_affinity: '0.754',
          oxidation_states: '+1, -1',
          standard_state: 'Gas',
          melting_point: '13.81',
          boiling_point: '20.28',
          density: '0.00008988',
          category: 'Nonmetal',
          year_discovered: '1766'
        }
      ]
    };

    const tempPath = path.join(__dirname, '..', '.test-data-all.json');

    try {
      writeElementsFile(testData, tempPath);

      assert.ok(fs.existsSync(tempPath), 'Should create output file');

      const content = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
      assert.ok(typeof content === 'object', 'Content should be an object');
      assert.ok(content.metadata, 'Should have metadata');
      assert.ok(content.elements, 'Should have elements array');
      assert.ok(Array.isArray(content.elements), 'Elements should be an array');
      assert.strictEqual(content.elements.length, 1, 'Should have 1 element');
      assert.strictEqual(content.elements[0].symbol, 'H', 'Element should be Hydrogen');
      assert.strictEqual(content.metadata.total_elements, 1);
    } finally {
      // Cleanup
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  test('writeElementsFile - output is properly formatted JSON', () => {
    const testData = {
      metadata: { total_elements: 2, data_source: 'Test' },
      elements: [
        { atomic_number: '1', symbol: 'H', name: 'Hydrogen' },
        { atomic_number: '2', symbol: 'He', name: 'Helium' }
      ]
    };

    const tempPath = path.join(__dirname, '..', '.test-data-all.json');

    try {
      writeElementsFile(testData, tempPath);

      const content = fs.readFileSync(tempPath, 'utf8');
      
      // Should be pretty-printed with 2-space indentation
      assert.ok(content.includes('  "metadata"'), 'Should have indented JSON');
      assert.ok(content.includes('  "elements"'), 'Should have elements key');
      assert.ok(content.includes('\n'), 'Should have newlines');
    } finally {
      // Cleanup
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  // Summary
  console.log(`\n${passed + failed} tests completed: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
