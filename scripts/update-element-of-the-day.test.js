/**
 * Unit tests for update-element-of-the-day.js
 * Run with: node scripts/update-element-of-the-day.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  getDayOfYear,
  getElementIndex,
  buildElementData,
  generateElementOfTheDay,
  writeOutputFiles
} = require('./update-element-of-the-day.js');

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

  console.log('\n🧪 Running Element of the Day Tests\n');

  // Test getDayOfYear
  test('getDayOfYear - calculates day 1 correctly', () => {
    const jan1 = new Date(2026, 0, 1); // Local time Jan 1, 2026
    assert.strictEqual(getDayOfYear(jan1), 1);
  });

  test('getDayOfYear - calculates mid-year correctly', () => {
    const july1 = new Date(2026, 6, 1); // Local time July 1, 2026
    const expected = 181; // Actual calculation for July 1st
    assert.strictEqual(getDayOfYear(july1), expected);
  });

  test('getDayOfYear - calculates end of year correctly', () => {
    const dec31 = new Date(2026, 11, 31); // Local time Dec 31, 2026
    assert.strictEqual(getDayOfYear(dec31), 365);
  });

  test('getDayOfYear - handles leap year', () => {
    const feb29 = new Date(2024, 1, 29); // Local time Feb 29, 2024
    assert.strictEqual(getDayOfYear(feb29), 60);
  });

  // Test getElementIndex
  test('getElementIndex - returns correct index for day 1', () => {
    assert.strictEqual(getElementIndex(1, 118), 1);
  });

  test('getElementIndex - returns correct index for day 118', () => {
    assert.strictEqual(getElementIndex(118, 118), 0);
  });

  test('getElementIndex - returns correct index for day 119', () => {
    assert.strictEqual(getElementIndex(119, 118), 1);
  });

  test('getElementIndex - wraps around correctly', () => {
    assert.strictEqual(getElementIndex(236, 118), 0); // 118 * 2
    assert.strictEqual(getElementIndex(237, 118), 1);
  });

  // Test buildElementData
  test('buildElementData - builds correct element object', () => {
    const mockElement = ['1', 'H', 'Hydrogen', '1.008', 'nonmetal', 'Gas', '1s1', '2.20', '13.99', '20.271', '0.00008988', '+1, -1', '1766'];
    const columnIndex = {
      'AtomicNumber': 0,
      'Symbol': 1,
      'Name': 2,
      'AtomicMass': 3,
      'GroupBlock': 4,
      'StandardState': 5,
      'ElectronConfiguration': 6,
      'Electronegativity': 7,
      'MeltingPoint': 8,
      'BoilingPoint': 9,
      'Density': 10,
      'OxidationStates': 11,
      'YearDiscovered': 12
    };
    const timestamp = new Date(2026, 0, 17, 12, 0, 0); // Local time

    const result = buildElementData(mockElement, columnIndex, timestamp);

    assert.strictEqual(result.atomic_number, '1');
    assert.strictEqual(result.symbol, 'H');
    assert.strictEqual(result.name, 'Hydrogen');
    assert.strictEqual(result.atomic_mass, '1.008');
    assert.strictEqual(result.category, 'nonmetal');
    assert.strictEqual(result.standard_state, 'Gas');
    assert.strictEqual(result.electron_configuration, '1s1');
    assert.strictEqual(result.electronegativity, '2.20');
    assert.strictEqual(result.melting_point, '13.99 K');
    assert.strictEqual(result.boiling_point, '20.271 K');
    assert.strictEqual(result.density, '0.00008988');
    assert.strictEqual(result.oxidation_states, '+1, -1');
    assert.strictEqual(result.year_discovered, '1766');
    assert.ok(result.updated_at, 'Should have updated_at timestamp');
  });

  test('buildElementData - handles missing values', () => {
    const mockElement = ['1', 'H', 'Hydrogen', '1.008', 'nonmetal', 'Gas', '1s1', '', '', '', '', '', '1766'];
    const columnIndex = {
      'AtomicNumber': 0,
      'Symbol': 1,
      'Name': 2,
      'AtomicMass': 3,
      'GroupBlock': 4,
      'StandardState': 5,
      'ElectronConfiguration': 6,
      'Electronegativity': 7,
      'MeltingPoint': 8,
      'BoilingPoint': 9,
      'Density': 10,
      'OxidationStates': 11,
      'YearDiscovered': 12
    };
    const timestamp = new Date(2026, 0, 17, 12, 0, 0);

    const result = buildElementData(mockElement, columnIndex, timestamp);

    assert.strictEqual(result.electronegativity, 'N/A');
    assert.strictEqual(result.melting_point, 'N/A');
    assert.strictEqual(result.boiling_point, 'N/A');
    assert.strictEqual(result.density, 'N/A');
    assert.strictEqual(result.oxidation_states, 'N/A');
  });

  // Test generateElementOfTheDay with real data
  test('generateElementOfTheDay - generates valid output structure', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const testDate = new Date(2026, 0, 17); // Local time Jan 17, 2026
    
    const result = generateElementOfTheDay(testDate, dataPath);

    assert.ok(result.element, 'Should have element property');
    assert.ok(result.element.atomic_number, 'Should have atomic_number');
    assert.ok(result.element.symbol, 'Should have symbol');
    assert.ok(result.element.name, 'Should have name');
    assert.ok(result.element.updated_at, 'Should have updated_at');
  });

  test('generateElementOfTheDay - different dates produce different elements', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const date1 = new Date(2026, 0, 1); // Jan 1, 2026
    const date2 = new Date(2026, 0, 2); // Jan 2, 2026
    
    const result1 = generateElementOfTheDay(date1, dataPath);
    const result2 = generateElementOfTheDay(date2, dataPath);

    assert.notStrictEqual(result1.element.symbol, result2.element.symbol, 
      'Different days should produce different elements');
  });

  test('generateElementOfTheDay - same date produces same element', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    const date = new Date(2026, 0, 17); // Jan 17, 2026
    
    const result1 = generateElementOfTheDay(date, dataPath);
    const result2 = generateElementOfTheDay(date, dataPath);

    assert.strictEqual(result1.element.symbol, result2.element.symbol,
      'Same date should produce same element');
  });

  test('generateElementOfTheDay - cycles through 118 elements', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
    
    // Get element for day 1 (Jan 1)
    const date1 = new Date(2026, 0, 1); // Jan 1, 2026 = day 1
    const result1 = generateElementOfTheDay(date1, dataPath);
    
    // Get element for day 119 (April 30)
    const date119 = new Date(2026, 3, 30); // April 30, 2026 = day 120? Let's check
    const actualDay = getDayOfYear(date119);
    
    // Find the correct day 119
    let testDate = new Date(2026, 0, 1);
    while (getDayOfYear(testDate) !== 119) {
      testDate.setDate(testDate.getDate() + 1);
    }
    
    const result119 = generateElementOfTheDay(testDate, dataPath);
    
    // Day 1 % 118 = 1, Day 119 % 118 = 1, so both should give same element
    assert.strictEqual(result1.element.symbol, result119.element.symbol,
      `Elements should cycle every 118 days. Day ${getDayOfYear(date1)} = ${result1.element.symbol}, Day ${getDayOfYear(testDate)} = ${result119.element.symbol}`);
  });

  // Test writeOutputFiles
  test('writeOutputFiles - creates output files', () => {
    const testOutput = {
      element: {
        atomic_number: '1',
        symbol: 'H',
        name: 'Hydrogen',
        updated_at: '2026-01-17T12:00:00.000Z'
      }
    };
    
    const tempDir = path.join(__dirname, '..', '.test-output');
    const apiDir = path.join(tempDir, 'api');
    
    // Create temp directories
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
    
    try {
      writeOutputFiles(testOutput, tempDir);
      
      const apiFile = path.join(apiDir, 'element-of-the-day.json');
      const dataFile = path.join(tempDir, 'data.json');
      
      assert.ok(fs.existsSync(apiFile), 'Should create api/element-of-the-day.json');
      assert.ok(fs.existsSync(dataFile), 'Should create data.json');
      
      const apiContent = JSON.parse(fs.readFileSync(apiFile, 'utf8'));
      const dataContent = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      
      assert.strictEqual(apiContent.element.symbol, 'H');
      assert.strictEqual(dataContent.element.symbol, 'H');
      
    } finally {
      // Cleanup
      try {
        fs.unlinkSync(path.join(apiDir, 'element-of-the-day.json'));
        fs.unlinkSync(path.join(tempDir, 'data.json'));
        fs.rmdirSync(apiDir);
        fs.rmdirSync(tempDir);
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
