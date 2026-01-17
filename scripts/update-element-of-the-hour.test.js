#!/usr/bin/env node

/**
 * Tests for update-element-of-the-hour.js
 * Validates hour-based element selection logic
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  getHourIdentifier,
  getElementIndex,
  buildElementData,
  generateElementOfTheHour,
  writeOutputFiles
} = require('./update-element-of-the-hour');

console.log('Running tests for update-element-of-the-hour.js...\n');

// Test 1: Hour identifier calculation
console.log('Test 1: Hour identifier for Jan 17, 2026 at 14:00');
const testDate1 = new Date('2026-01-17T14:00:00Z');
const hourId1 = getHourIdentifier(testDate1);
assert.strictEqual(hourId1, 2026011714, 'Hour identifier should be 2026011714');
console.log('✓ Passed\n');

// Test 2: Hour identifier for midnight
console.log('Test 2: Hour identifier for Jan 1, 2026 at 00:00');
const testDate2 = new Date('2026-01-01T00:00:00Z');
const hourId2 = getHourIdentifier(testDate2);
assert.strictEqual(hourId2, 2026010100, 'Hour identifier should be 2026010100');
console.log('✓ Passed\n');

// Test 3: Hour identifier for 23:00
console.log('Test 3: Hour identifier for Dec 31, 2026 at 23:00');
const testDate3 = new Date('2026-12-31T23:00:00Z');
const hourId3 = getHourIdentifier(testDate3);
assert.strictEqual(hourId3, 2026123123, 'Hour identifier should be 2026123123');
console.log('✓ Passed\n');

// Test 4: Element index calculation (first element)
console.log('Test 4: Element index for hour ID 2026011714 with 118 elements');
const elementIndex1 = getElementIndex(2026011714, 118);
const expectedIndex1 = 2026011714 % 118;
assert.strictEqual(elementIndex1, expectedIndex1, `Element index should be ${expectedIndex1}`);
console.log(`✓ Passed (index: ${elementIndex1})\n`);

// Test 5: Element index calculation (modulo wrapping)
console.log('Test 5: Element index wraps correctly with modulo 118');
const hourId5 = 118;
const elementIndex5 = getElementIndex(hourId5, 118);
assert.strictEqual(elementIndex5, 0, 'Element index should wrap to 0');
console.log('✓ Passed\n');

// Test 6: Element index calculation (118 + 1)
console.log('Test 6: Element index for hour ID 119 with 118 elements');
const elementIndex6 = getElementIndex(119, 118);
assert.strictEqual(elementIndex6, 1, 'Element index should be 1');
console.log('✓ Passed\n');

// Test 7: Build element data
console.log('Test 7: Build element data structure');
const mockElement = [1, 'H', 'Hydrogen', '1.008', 'nonmetal', 'Gas', '[He] 2s1', '2.20', '14.01', '20.28', '0.0899', '+1, -1', '1766'];
const mockColumnIndex = {
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
const testTimestamp = new Date('2026-01-17T14:00:00Z');
const elementData = buildElementData(mockElement, mockColumnIndex, testTimestamp);

assert.strictEqual(elementData.atomic_number, 1);
assert.strictEqual(elementData.symbol, 'H');
assert.strictEqual(elementData.name, 'Hydrogen');
assert.strictEqual(elementData.atomic_mass, '1.008');
assert.strictEqual(elementData.category, 'nonmetal');
assert.strictEqual(elementData.melting_point, '14.01 K');
assert.strictEqual(elementData.boiling_point, '20.28 K');
assert.strictEqual(elementData.updated_at, '2026-01-17T14:00:00.000Z');
console.log('✓ Passed\n');

// Test 8: Handle N/A values
console.log('Test 8: Handle N/A values correctly');
const mockElementWithNA = [118, 'Og', 'Oganesson', '294', 'noble gas', 'Expected to be a Gas', '[Rn] 5f14 6d10 7s2 7p6', '', '', '', '', '', '2002'];
const elementDataNA = buildElementData(mockElementWithNA, mockColumnIndex, testTimestamp);
assert.strictEqual(elementDataNA.electronegativity, 'N/A');
assert.strictEqual(elementDataNA.melting_point, 'N/A');
assert.strictEqual(elementDataNA.boiling_point, 'N/A');
assert.strictEqual(elementDataNA.density, 'N/A');
assert.strictEqual(elementDataNA.oxidation_states, 'N/A');
console.log('✓ Passed\n');

// Test 9: Different hours produce different elements (cycle test)
console.log('Test 9: Different hours produce different elements over 118-hour cycle');
const testDataPath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
if (fs.existsSync(testDataPath)) {
  const hour1 = new Date('2026-01-01T00:00:00Z');
  const hour118 = new Date('2026-01-01T01:00:00Z');
  
  const output1 = generateElementOfTheHour(hour1, testDataPath);
  const output118 = generateElementOfTheHour(hour118, testDataPath);
  
  assert.ok(output1.element.name !== output118.element.name || 
            output1.element.symbol !== output118.element.symbol,
            'Different hours should produce different elements');
  console.log(`✓ Passed (Hour 1: ${output1.element.name}, Hour 2: ${output118.element.name})\n`);
} else {
  console.log('⊘ Skipped (test data not found)\n');
}

// Test 10: Generate element of the hour output structure
console.log('Test 10: Generate element of the hour output structure');
if (fs.existsSync(testDataPath)) {
  const output = generateElementOfTheHour(testDate1, testDataPath);
  assert.ok(output.element, 'Output should have element property');
  assert.ok(output.element.atomic_number, 'Element should have atomic_number');
  assert.ok(output.element.symbol, 'Element should have symbol');
  assert.ok(output.element.name, 'Element should have name');
  assert.ok(output.element.updated_at, 'Element should have updated_at timestamp');
  console.log(`✓ Passed (${output.element.name})\n`);
} else {
  console.log('⊘ Skipped (test data not found)\n');
}

// Test 11: Write output files
console.log('Test 11: Write output files');
const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-'));
const apiDir = path.join(tempDir, 'api');
fs.mkdirSync(apiDir, { recursive: true });

const testOutput = {
  element: {
    atomic_number: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomic_mass: '1.008',
    updated_at: new Date().toISOString()
  }
};

writeOutputFiles(testOutput, tempDir);

const hourFilePath = path.join(apiDir, 'element-of-the-hour.json');
assert.ok(fs.existsSync(hourFilePath), 'element-of-the-hour.json should be created');

const hourFileContent = JSON.parse(fs.readFileSync(hourFilePath, 'utf8'));
assert.strictEqual(hourFileContent.element.name, 'Hydrogen');

// Cleanup
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('✓ Passed\n');

// Test 12: Same hour produces same element
console.log('Test 12: Same hour produces same element (deterministic)');
if (fs.existsSync(testDataPath)) {
  const sameHour1 = new Date('2026-06-15T10:00:00Z');
  const sameHour2 = new Date('2026-06-15T10:00:00Z');
  
  const output1 = generateElementOfTheHour(sameHour1, testDataPath);
  const output2 = generateElementOfTheHour(sameHour2, testDataPath);
  
  assert.strictEqual(output1.element.name, output2.element.name, 'Same hour should produce same element');
  assert.strictEqual(output1.element.symbol, output2.element.symbol, 'Same hour should produce same element');
  console.log(`✓ Passed (${output1.element.name})\n`);
} else {
  console.log('⊘ Skipped (test data not found)\n');
}

console.log('✅ All tests passed!');
