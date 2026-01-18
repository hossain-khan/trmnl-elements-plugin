# Test Suite Documentation

Comprehensive test coverage for the TRMNL Elements Plugin.

## Test Statistics

- **Total Tests**: 77 tests across 4 test files
- **Coverage Areas**: Data validation, date calculations, conversion logic, output files, edge cases, performance
- **Test Frameworks**: Custom assertion-based test runners

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites

```bash
# Comprehensive test suite (36 tests)
npm run test:comprehensive

# Element of the Day tests (15 tests)
npm run test:element

# Element of the Hour tests (12 tests)
npm run test:element-hourly

# Data conversion tests (11 tests)
npm run test:convert
```

## Test Coverage

### 1. Data Validation (13 tests)
**File**: `test-comprehensive.js`

Tests `data-all.json` integrity:
- ✓ Correct structure with metadata and elements
- ✓ Exactly 118 elements
- ✓ Sequential atomic numbers (1-118)
- ✓ Unique symbols and names
- ✓ Required properties present
- ✓ Valid atomic masses (numeric format)
- ✓ Properly formatted symbols (1-3 chars, capitalization)
- ✓ Valid standard states
- ✓ Valid categories (10 types)
- ✓ Valid discovery years
- ✓ Noble gas properties (7 elements)
- ✓ Specific well-known elements (H, C, Au, U)

### 2. Element of the Day - Core Logic (15 tests)
**File**: `update-element-of-the-day.test.js`

Tests daily element selection:
- ✓ Day of year calculation (days 1, 181, 365)
- ✓ Leap year handling (Feb 29th)
- ✓ Element index calculation (modulo 118)
- ✓ Wrapping logic (day 118, 236, 354)
- ✓ Element data building
- ✓ Missing value handling (N/A)
- ✓ Output structure validation
- ✓ Date determinism (same date = same element)
- ✓ 118-day cycle verification
- ✓ Output file creation

### 3. Element of the Day - Edge Cases (8 tests)
**File**: `test-comprehensive.js`

Tests boundary conditions:
- ✓ Leap year February 29th
- ✓ Leap vs non-leap year differences
- ✓ Year transitions (Dec 31 → Jan 1)
- ✓ Exact multiples of 118
- ✓ Day 0 edge case
- ✓ Complete 118-element coverage
- ✓ 3 full cycles (354 days)

### 4. Element of the Hour - Core Logic (12 tests)
**File**: `update-element-of-the-hour.test.js`

Tests hourly element selection:
- ✓ Hour identifier calculation (YYYYMMDDHH format)
- ✓ Midnight (00:00) handling
- ✓ 23:00 hour handling
- ✓ Element index calculation
- ✓ Modulo wrapping (118 elements)
- ✓ Element data building
- ✓ N/A value handling
- ✓ Different hours produce different elements
- ✓ Same hour produces same element (determinism)
- ✓ Output structure validation
- ✓ Output file creation

### 5. Element of the Hour - Edge Cases (6 tests)
**File**: `test-comprehensive.js`

Tests boundary conditions:
- ✓ Midnight correctly
- ✓ 23:00 correctly
- ✓ Single-digit month/day padding
- ✓ 24 unique hour identifiers per day
- ✓ Element distribution over 1000 hours
- ✓ All elements appear at least once

### 6. Data Conversion Logic (11 tests)
**File**: `convert-elements-data.test.js`

Tests PubChem → data-all.json conversion:
- ✓ Column mapping (Hydrogen, Helium)
- ✓ Empty value handling (null)
- ✓ Real data file reading
- ✓ First element (Hydrogen)
- ✓ Last element (Oganesson)
- ✓ Metadata fields
- ✓ Required fields on all elements
- ✓ Noble gas oxidation states (0)
- ✓ Specific element properties (Au, C)
- ✓ Output file creation
- ✓ JSON formatting (pretty-printed)

### 7. Data Conversion - Integrity (3 tests)
**File**: `test-comprehensive.js`

Tests conversion accuracy:
- ✓ Element count preservation
- ✓ Atomic number preservation
- ✓ Null value handling (optional fields)

### 8. Output Files Validation (3 tests)
**File**: `test-comprehensive.js`

Tests generated files:
- ✓ api/element-of-the-day.json structure
- ✓ api/element-of-the-hour.json structure
- ✓ data.json structure

### 9. Performance & Boundaries (3 tests)
**File**: `test-comprehensive.js`

Tests performance and limits:
- ✓ 100 years of date calculations (< 5s)
- ✓ Large day numbers (999,999)
- ✓ Far future dates (year 9999)

## Test Categories

### Data Integrity Tests
Validate element data structure, completeness, and accuracy:
- 118 elements with unique atomic numbers
- All required properties present
- Valid data formats and ranges
- Chemical accuracy (noble gases, well-known elements)

### Date Calculation Tests
Ensure correct day/hour calculations:
- Leap year handling
- Year boundaries
- Time zone consistency
- Deterministic behavior

### Conversion Tests
Verify PubChem data transformation:
- Column mapping accuracy
- Null value handling
- Data preservation
- Output formatting

### Edge Case Tests
Cover boundary conditions:
- Midnight and 23:00 hours
- February 29th leap years
- Year 9999
- Exact multiples of 118
- Day 0

### Performance Tests
Verify efficiency:
- 100 years of dates in < 5 seconds
- Large number handling
- Memory efficiency

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
```

All tests must pass before:
- Merging pull requests
- Deploying to production
- Releasing new versions

## Test Maintenance

### Adding New Tests

1. Identify the test category (data, conversion, edge cases, etc.)
2. Add to appropriate test file or create new file
3. Follow naming convention: `test-[category].js`
4. Update this documentation
5. Ensure all tests pass: `npm test`

### When to Add Tests

- New features or functionality
- Bug fixes (add regression test)
- Edge cases discovered
- Performance concerns
- Data format changes

## Coverage Goals

Current coverage: **Excellent** ✓

- ✅ All core functionality tested
- ✅ Edge cases covered
- ✅ Data validation complete
- ✅ Performance verified
- ✅ Output files validated

## Known Limitations

1. **Visual Testing**: UI/layout testing not covered (requires TRMNL framework)
2. **Integration Testing**: GitHub Pages deployment not tested
3. **Manual Testing**: Liquid template rendering requires manual verification

## Future Improvements

- [ ] Add visual regression testing for templates
- [ ] Add integration tests with TRMNL API
- [ ] Add mutation testing
- [ ] Add test coverage reporting
- [ ] Add performance benchmarking
