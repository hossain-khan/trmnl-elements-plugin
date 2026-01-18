#!/usr/bin/env node

/**
 * Comprehensive test suite for TRMNL Elements Plugin
 * Tests all critical functionality with extensive edge cases
 * Run with: node scripts/test-comprehensive.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Import all modules
const convertModule = require('./convert-elements-data.js');
const dayModule = require('./update-element-of-the-day.js');
const hourModule = require('./update-element-of-the-hour.js');

// Test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  describe(suite, fn) {
    console.log(`\n📦 ${suite}`);
    fn();
  }

  test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${error.message}`);
      if (error.stack) {
        console.error(`    ${error.stack.split('\n')[1]}`);
      }
      this.failed++;
    }
  }

  skip(name) {
    console.log(`  ⊘ ${name} (skipped)`);
    this.skipped++;
  }

  summary() {
    const total = this.passed + this.failed + this.skipped;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Total: ${total} tests`);
    console.log(`✓ Passed: ${this.passed}`);
    if (this.failed > 0) console.log(`✗ Failed: ${this.failed}`);
    if (this.skipped > 0) console.log(`⊘ Skipped: ${this.skipped}`);
    console.log(`${'='.repeat(60)}\n`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

const runner = new TestRunner();

// ============================================================================
// DATA VALIDATION TESTS
// ============================================================================

runner.describe('Data Validation - data-all.json', () => {
  const dataPath = path.join(__dirname, '..', 'data-all.json');
  
  if (!fs.existsSync(dataPath)) {
    runner.skip('data-all.json exists');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  runner.test('has correct structure with metadata and elements', () => {
    assert.ok(data.metadata, 'Should have metadata');
    assert.ok(data.elements, 'Should have elements');
    assert.ok(Array.isArray(data.elements), 'Elements should be array');
  });

  runner.test('contains exactly 118 elements', () => {
    assert.strictEqual(data.elements.length, 118, 'Should have 118 elements');
    assert.strictEqual(data.metadata.total_elements, 118);
  });

  runner.test('all elements have sequential atomic numbers 1-118', () => {
    data.elements.forEach((element, index) => {
      assert.strictEqual(
        parseInt(element.atomic_number),
        index + 1,
        `Element at index ${index} should have atomic number ${index + 1}`
      );
    });
  });

  runner.test('all elements have unique symbols', () => {
    const symbols = data.elements.map(e => e.symbol);
    const uniqueSymbols = new Set(symbols);
    assert.strictEqual(symbols.length, uniqueSymbols.size, 'All symbols should be unique');
  });

  runner.test('all elements have unique names', () => {
    const names = data.elements.map(e => e.name);
    const uniqueNames = new Set(names);
    assert.strictEqual(names.length, uniqueNames.size, 'All names should be unique');
  });

  runner.test('all elements have required properties', () => {
    const required = [
      'atomic_number', 'symbol', 'name', 'atomic_mass',
      'electron_configuration', 'standard_state', 'category', 'year_discovered'
    ];

    data.elements.forEach((element, index) => {
      required.forEach(prop => {
        assert.ok(
          element.hasOwnProperty(prop) && element[prop] !== undefined,
          `Element ${index + 1} (${element.name}) missing ${prop}`
        );
      });
    });
  });

  runner.test('atomic masses are valid numbers or ranges', () => {
    data.elements.forEach(element => {
      const mass = element.atomic_mass;
      assert.ok(mass, `${element.name} should have atomic mass`);
      // Should be a number string with optional decimal
      assert.ok(
        /^\d+(\.\d+)?$/.test(mass),
        `${element.name} atomic mass should be numeric: ${mass}`
      );
    });
  });

  runner.test('symbols are 1-3 characters and properly formatted', () => {
    data.elements.forEach(element => {
      const symbol = element.symbol;
      assert.ok(symbol, `${element.name} should have symbol`);
      assert.ok(symbol.length >= 1 && symbol.length <= 3, 
        `${element.name} symbol should be 1-3 chars: ${symbol}`);
      // First letter should be uppercase
      assert.ok(
        /^[A-Z][a-z]?[a-z]?$/.test(symbol),
        `${element.name} symbol should be properly formatted: ${symbol}`
      );
    });
  });

  runner.test('standard states are valid', () => {
    const validStates = ['Solid', 'Liquid', 'Gas', 'Expected to be a Gas', 'Expected to be a Solid'];
    data.elements.forEach(element => {
      assert.ok(
        validStates.includes(element.standard_state),
        `${element.name} has invalid standard state: ${element.standard_state}`
      );
    });
  });

  runner.test('categories are valid', () => {
    const validCategories = [
      'Alkali metal', 'Alkaline earth metal', 'Transition metal',
      'Post-transition metal', 'Metalloid', 'Nonmetal', 'Halogen',
      'Noble gas', 'Lanthanide', 'Actinide'
    ];
    data.elements.forEach(element => {
      assert.ok(
        validCategories.includes(element.category),
        `${element.name} has invalid category: ${element.category}`
      );
    });
  });

  runner.test('year discovered is valid', () => {
    data.elements.forEach(element => {
      const year = element.year_discovered;
      assert.ok(year, `${element.name} should have year_discovered`);
      // Should be 'Ancient', 'Unknown', or a 4-digit year
      const isValid = year === 'Ancient' || year === 'Unknown' || 
                      /^\d{4}$/.test(year);
      assert.ok(isValid, `${element.name} has invalid year: ${year}`);
    });
  });

  runner.test('noble gases have expected properties', () => {
    const nobleGases = data.elements.filter(e => e.category === 'Noble gas');
    assert.strictEqual(nobleGases.length, 7, 'Should have 7 noble gases');
    
    const expectedSymbols = ['Ar', 'He', 'Kr', 'Ne', 'Og', 'Rn', 'Xe'];
    const actualSymbols = nobleGases.map(e => e.symbol).sort();
    assert.deepStrictEqual(actualSymbols, expectedSymbols);
  });

  runner.test('validates specific well-known elements', () => {
    // Hydrogen
    const h = data.elements.find(e => e.symbol === 'H');
    assert.strictEqual(h.atomic_number, '1');
    assert.strictEqual(h.name, 'Hydrogen');
    assert.strictEqual(h.standard_state, 'Gas');

    // Carbon
    const c = data.elements.find(e => e.symbol === 'C');
    assert.strictEqual(c.atomic_number, '6');
    assert.strictEqual(c.name, 'Carbon');
    assert.strictEqual(c.category, 'Nonmetal');

    // Gold
    const au = data.elements.find(e => e.symbol === 'Au');
    assert.strictEqual(au.atomic_number, '79');
    assert.strictEqual(au.name, 'Gold');
    assert.strictEqual(au.year_discovered, 'Ancient');

    // Uranium
    const u = data.elements.find(e => e.symbol === 'U');
    assert.strictEqual(u.atomic_number, '92');
    assert.strictEqual(u.name, 'Uranium');
    assert.strictEqual(u.year_discovered, '1789');
  });
});

// ============================================================================
// ELEMENT OF THE DAY TESTS - EDGE CASES
// ============================================================================

runner.describe('Element of the Day - Edge Cases', () => {
  const { getDayOfYear, getElementIndex } = dayModule;

  runner.test('handles leap year February 29th', () => {
    const feb29_2024 = new Date(2024, 1, 29);
    const day = getDayOfYear(feb29_2024);
    assert.strictEqual(day, 60);
  });

  runner.test('handles leap year February 28th vs non-leap', () => {
    const feb28_2024 = new Date(2024, 1, 28); // Leap year
    const feb28_2025 = new Date(2025, 1, 28); // Non-leap year
    
    assert.strictEqual(getDayOfYear(feb28_2024), 59);
    assert.strictEqual(getDayOfYear(feb28_2025), 59);
  });

  runner.test('handles March 1st in leap vs non-leap years', () => {
    const mar1_2024 = new Date(2024, 2, 1); // Leap year
    const mar1_2025 = new Date(2025, 2, 1); // Non-leap year
    
    assert.strictEqual(getDayOfYear(mar1_2024), 61); // After Feb 29
    assert.strictEqual(getDayOfYear(mar1_2025), 60); // No Feb 29
  });

  runner.test('year transitions correctly', () => {
    const dec31_2025 = new Date(2025, 11, 31);
    const jan1_2026 = new Date(2026, 0, 1);
    
    assert.strictEqual(getDayOfYear(dec31_2025), 365);
    assert.strictEqual(getDayOfYear(jan1_2026), 1);
  });

  runner.test('element index cycles correctly every 118 days', () => {
    for (let day = 1; day <= 354; day++) { // 3 full cycles (118 * 3 = 354)
      const index = getElementIndex(day, 118);
      const expectedIndex = day % 118;
      assert.strictEqual(index, expectedIndex,
        `Day ${day} should map to index ${expectedIndex}, got ${index}`);
    }
  });

  runner.test('element index handles exact multiples of 118', () => {
    assert.strictEqual(getElementIndex(118, 118), 0);
    assert.strictEqual(getElementIndex(236, 118), 0);
    assert.strictEqual(getElementIndex(354, 118), 0);
  });

  runner.test('element index handles day 0 edge case', () => {
    assert.strictEqual(getElementIndex(0, 118), 0);
  });

  runner.test('covers all 118 elements in consecutive days', () => {
    const indices = new Set();
    for (let day = 1; day <= 118; day++) {
      indices.add(getElementIndex(day, 118));
    }
    assert.strictEqual(indices.size, 118, 'Should cover all 118 elements');
  });
});

// ============================================================================
// ELEMENT OF THE HOUR TESTS - EDGE CASES
// ============================================================================

runner.describe('Element of the Hour - Edge Cases', () => {
  const { getHourIdentifier, getElementIndex } = hourModule;

  runner.test('handles midnight correctly', () => {
    const midnight = new Date('2026-01-17T00:00:00Z');
    const id = getHourIdentifier(midnight);
    assert.strictEqual(id, 2026011700);
  });

  runner.test('handles 23:00 hour correctly', () => {
    const hour23 = new Date('2026-01-17T23:00:00Z');
    const id = getHourIdentifier(hour23);
    assert.strictEqual(id, 2026011723);
  });

  runner.test('handles single-digit month correctly', () => {
    const jan = new Date('2026-01-01T12:00:00Z');
    const id = getHourIdentifier(jan);
    assert.strictEqual(id, 2026010112);
  });

  runner.test('handles single-digit day correctly', () => {
    const day1 = new Date('2026-01-01T12:00:00Z');
    const id = getHourIdentifier(day1);
    assert.strictEqual(id, 2026010112);
  });

  runner.test('hour identifiers are unique for different hours', () => {
    const ids = new Set();
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(`2026-01-17T${hour.toString().padStart(2, '0')}:00:00Z`);
      ids.add(getHourIdentifier(date));
    }
    assert.strictEqual(ids.size, 24, 'All 24 hours should produce unique identifiers');
  });

  runner.test('element index distribution is reasonable', () => {
    const elementCounts = new Array(118).fill(0);
    
    // Test 1000 different hour identifiers
    for (let i = 0; i < 1000; i++) {
      const hourId = 2026010100 + i;
      const index = getElementIndex(hourId, 118);
      elementCounts[index]++;
    }
    
    // Each element should appear at least once
    const appearsAtLeastOnce = elementCounts.every(count => count > 0);
    assert.ok(appearsAtLeastOnce, 'All elements should appear at least once in 1000 hours');
  });
});

// ============================================================================
// CONVERSION TESTS - DATA INTEGRITY
// ============================================================================

runner.describe('Data Conversion - Integrity Checks', () => {
  const sourcePath = path.join(__dirname, '..', 'data', 'PubChemElements_all.json');
  
  if (!fs.existsSync(sourcePath)) {
    runner.skip('PubChemElements_all.json exists');
    return;
  }

  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const converted = convertModule.convertElementsData(sourcePath);

  runner.test('conversion preserves element count', () => {
    assert.strictEqual(
      converted.elements.length,
      sourceData.Table.Row.length,
      'Should preserve element count'
    );
  });

  runner.test('conversion preserves atomic numbers', () => {
    const columns = sourceData.Table.Columns.Column;
    const atomicNumIndex = columns.indexOf('AtomicNumber');
    
    sourceData.Table.Row.forEach((row, i) => {
      const sourceAtomicNum = row.Cell[atomicNumIndex];
      const convertedAtomicNum = converted.elements[i].atomic_number;
      assert.strictEqual(
        convertedAtomicNum,
        sourceAtomicNum,
        `Element ${i} atomic number mismatch`
      );
    });
  });

  runner.test('conversion handles null values correctly', () => {
    converted.elements.forEach((element, i) => {
      // Check optional fields that can be null
      const optionalFields = [
        'cpk_hex_color', 'electronegativity', 'atomic_radius',
        'ionization_energy', 'electron_affinity', 'oxidation_states',
        'melting_point', 'boiling_point', 'density'
      ];
      
      optionalFields.forEach(field => {
        // Value should be either a string or null, never undefined
        assert.notStrictEqual(
          element[field],
          undefined,
          `Element ${i} (${element.name}) ${field} should not be undefined`
        );
      });
    });
  });
});

// ============================================================================
// OUTPUT FILE VALIDATION
// ============================================================================

runner.describe('Output Files - Structure Validation', () => {
  const apiDayPath = path.join(__dirname, '..', 'api', 'element-of-the-day.json');
  const apiHourPath = path.join(__dirname, '..', 'api', 'element-of-the-hour.json');
  const dataPath = path.join(__dirname, '..', 'data.json');

  if (fs.existsSync(apiDayPath)) {
    runner.test('api/element-of-the-day.json has correct structure', () => {
      const data = JSON.parse(fs.readFileSync(apiDayPath, 'utf8'));
      assert.ok(data.element, 'Should have element property');
      assert.ok(data.element.atomic_number, 'Should have atomic_number');
      assert.ok(data.element.symbol, 'Should have symbol');
      assert.ok(data.element.name, 'Should have name');
      assert.ok(data.element.updated_at, 'Should have timestamp');
    });
  } else {
    runner.skip('api/element-of-the-day.json exists');
  }

  if (fs.existsSync(apiHourPath)) {
    runner.test('api/element-of-the-hour.json has correct structure', () => {
      const data = JSON.parse(fs.readFileSync(apiHourPath, 'utf8'));
      assert.ok(data.element, 'Should have element property');
      assert.ok(data.element.atomic_number, 'Should have atomic_number');
      assert.ok(data.element.symbol, 'Should have symbol');
      assert.ok(data.element.name, 'Should have name');
      assert.ok(data.element.updated_at, 'Should have timestamp');
    });
  } else {
    runner.skip('api/element-of-the-hour.json exists');
  }

  if (fs.existsSync(dataPath)) {
    runner.test('data.json has correct structure', () => {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      assert.ok(data.element, 'Should have element property');
    });
  } else {
    runner.skip('data.json exists');
  }
});

// ============================================================================
// PERFORMANCE AND BOUNDARY TESTS
// ============================================================================

runner.describe('Performance and Boundaries', () => {
  runner.test('getDayOfYear handles 100 years of dates efficiently', () => {
    const start = Date.now();
    
    for (let year = 2000; year < 2100; year++) {
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 28; day++) { // Safe for all months
          const date = new Date(year, month, day);
          dayModule.getDayOfYear(date);
        }
      }
    }
    
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 5000, `Should complete in < 5s, took ${elapsed}ms`);
  });

  runner.test('element index calculation handles large numbers', () => {
    const largeDay = 999999;
    const index = dayModule.getElementIndex(largeDay, 118);
    assert.ok(index >= 0 && index < 118, 'Should return valid index');
  });

  runner.test('hour identifier handles year 9999', () => {
    const farFuture = new Date('9999-12-31T23:00:00Z');
    const id = hourModule.getHourIdentifier(farFuture);
    assert.strictEqual(id, 9999123123);
  });
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('\n🧪 COMPREHENSIVE TEST SUITE');
console.log('Testing TRMNL Elements Plugin\n');

runner.summary();
