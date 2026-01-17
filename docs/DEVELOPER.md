# Developer Documentation

Complete technical documentation for developers who want to fork, customize, or contribute to the Element of the Day plugin.

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Testing](#testing)
- [Data Conversion](#data-conversion)
- [Template Architecture](#template-architecture)
- [GitHub Actions](#github-actions)
- [Project Structure](#project-structure)
- [Resources](#resources)

## Quick Start

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/hossain-khan/trmnl-elements-plugin.git
   cd trmnl-elements-plugin
   ```

2. Generate element data
   ```bash
   # For daily rotation
   node scripts/update-element-of-the-day.js
   
   # For hourly random
   node scripts/update-element-of-the-hour.js
   ```

3. Test locally by opening `templates/*.liquid` files or use the TRMNL preview feature

## API Endpoints

The plugin uses static JSON endpoints hosted on GitHub Pages:

### Daily Rotation Mode
```
https://hossain-khan.github.io/trmnl-elements-plugin/api/element-of-the-day.json
```
- **Updates**: Once per day at 2 AM UTC
- **Logic**: Calculates day of year, applies modulo 118

### Hourly Random Mode
```
https://hossain-khan.github.io/trmnl-elements-plugin/api/element-of-the-hour.json
```
- **Updates**: Every hour (workflow currently disabled)
- **Logic**: Calculates hour identifier (YYYYMMDDHH), applies modulo 118

### Example Response

```json
{
  "element": {
    "atomic_number": "79",
    "symbol": "Au",
    "name": "Gold",
    "atomic_mass": "196.96657",
    "category": "Transition metal",
    "standard_state": "Solid",
    "electron_configuration": "[Xe]6s1 4f14 5d10",
    "electronegativity": "2.54",
    "melting_point": "1337.33 K",
    "boiling_point": "3129 K",
    "density": "19.282",
    "oxidation_states": "+3, +1",
    "year_discovered": "Ancient",
    "updated_at": "2024-01-15T02:00:00.000Z"
  }
}
```

## Configuration

### User Settings

Users configure the plugin through `custom-fields.yml`:

- **Display Mode**: Dropdown to choose between:
  - `Daily Rotation` - Cycles through all 118 elements based on day of year
  - `Hourly Random` - Shows a different element each hour (default)

### Plugin Settings

Core configuration in `settings.yml`:

```yaml
uuid: trmnl-elements-plugin
name: Element of the Day
author: Hossain Khan
author_email: trmnl@hossain.dev
homepage: https://github.com/hossain-khan/trmnl-elements-plugin
strategy: merge_tag
refresh_frequency: 86400  # 24 hours

merge_tag:
  - tag_name: data
    source: https://hossain-khan.github.io/trmnl-elements-plugin/api/element-of-the-day.json
    merge_object: false
```

## Testing

### Run All Tests

```bash
npm test
```

### Individual Test Suites

```bash
npm run test:element          # Test daily element script
npm run test:element-hourly   # Test hourly element script
npm run test:convert          # Test data conversion script
```

### Test Coverage

The test suites verify:
- ✅ Day of year calculations (including leap years)
- ✅ Hour identifier calculations (YYYYMMDDHH format)
- ✅ Element index mapping (118-cycle for both daily and hourly)
- ✅ Data formatting and N/A handling
- ✅ File output generation
- ✅ Cycle consistency (deterministic selection)
- ✅ Data conversion from nested to flat structure
- ✅ Proper field mapping and null handling
- ✅ Complete element data validation

All tests are implemented using Node.js `assert` module with zero external dependencies.

## Data Conversion

### Converting PubChem Data

Convert the nested PubChem data structure to a simplified flat array format:

```bash
npm run convert
```

This generates `data-all.json` with the following structure:

```json
{
  "metadata": {
    "total_elements": 118,
    "data_source": "PubChem",
    "generated_at": "2026-01-17T12:00:00.000Z",
    "description": "Complete periodic table data with all 118 elements"
  },
  "elements": [
    {
      "atomic_number": "1",
      "symbol": "H",
      "name": "Hydrogen",
      "atomic_mass": "1.0080",
      "cpk_hex_color": "FFFFFF",
      "electron_configuration": "1s1",
      "electronegativity": "2.2",
      "atomic_radius": "120",
      "ionization_energy": "13.598",
      "electron_affinity": "0.754",
      "oxidation_states": "+1, -1",
      "standard_state": "Gas",
      "melting_point": "13.81",
      "boiling_point": "20.28",
      "density": "0.00008988",
      "category": "Nonmetal",
      "year_discovered": "1766"
    }
    // ... 117 more elements
  ]
}
```

### Use Cases

- Direct array iteration and filtering via `data.elements`
- Client-side element lookups
- Building custom periodic table visualizations
- Educational applications requiring full element data
- Metadata tracking (source, generation time, totals)

### Data Source

Element data is sourced from [PubChem](https://pubchem.ncbi.nlm.nih.gov/) (National Center for Biotechnology Information) and stored in:
- `data/PubChemElements_all.json` - Raw nested format
- `data/PubChemElements_all.csv` - CSV format
- `data-all.json` - Converted flat array format (generated)

## Template Architecture

### Shared Template Pattern

The plugin uses a centralized template pattern for element selection:

**`templates/shared.liquid`**

This file contains:
- Central element selection logic with display mode support
- Loads `elements` from static data (all 118 elements via `data-all.json`)
- **Daily Rotation Mode**: Calculates day of year and uses modulo 118
- **Hourly Random Mode**: Calculates hour identifier (YYYYMMDDHH) and uses modulo 118
- Selects appropriate element based on user's configured display mode
- Makes `element` variable available to all templates
- Atom icon data URI for title bars
- Automatically included by TRMNL portal before rendering layout templates

### Layout Templates

All layout templates access the `element` variable provided by the shared template:

- **`full.liquid`** - Responsive 1-3 column grid with element card and 6 properties
- **`half_horizontal.liquid`** - Horizontal layout with 6 properties in 2x3 grid
- **`half_vertical.liquid`** - Vertical layout with card and 4 essential properties
- **`quadrant.liquid`** - Minimal view with card and 2 properties

### Architecture Benefits

- **Centralized logic**: Element selection code maintained in one place
- **Flexible modes**: Easy switching between daily and hourly displays
- **Client-side rendering**: No server-side API calls needed
- **Deterministic selection**: Same period = same element across all layouts
- **Easy testing**: Shared logic can be validated independently

### Template Testing Override

For testing specific elements, uncomment the override in `templates/shared.liquid`:

```liquid
{% comment %}
  DEV TESTING: Override element_index to test specific elements
  Examples:
  - Element 99 (Einsteinium, 252.0830): {% assign element_index = 98 %}
  - Element 101 (Mendelevium, 258.09843): {% assign element_index = 100 %}
  - Element 104 (Rutherfordium, longest name): {% assign element_index = 103 %}
{% endcomment %}
{% comment %} {% assign element_index = 99 %} {% endcomment %}
```

## GitHub Actions

### Active Workflows

#### 1. GitHub Pages Deployment (`pages.yml`)
- **Trigger**: Push to main branch
- **Purpose**: Deploys site to GitHub Pages
- **URL**: https://hossain-khan.github.io/trmnl-elements-plugin/

#### 2. Daily Element Update (`update-element.yml`)
- **Trigger**: Daily at 2 AM UTC + manual dispatch
- **Purpose**: Updates `api/element-of-the-day.json`
- **Script**: `scripts/update-element-of-the-day.js`

### Disabled Workflows

#### 3. Hourly Element Update (`update-element-hourly.yml`)
- **Status**: Disabled (schedule commented out)
- **Reason**: Reduce GitHub Actions usage
- **Can run**: Manually via workflow_dispatch
- **Purpose**: Updates `api/element-of-the-hour.json`
- **Script**: `scripts/update-element-of-the-hour.js`

To enable hourly updates, uncomment the schedule trigger in `.github/workflows/update-element-hourly.yml`.

## Project Structure

```
trmnl-elements-plugin/
├── .github/
│   ├── copilot-instructions.md      # AI assistant context
│   └── workflows/
│       ├── pages.yml                # GitHub Pages deployment
│       ├── update-element.yml       # Daily data update (2 AM UTC)
│       └── update-element-hourly.yml # Hourly data update (disabled)
├── api/
│   ├── element-of-the-day.json      # Daily element endpoint
│   └── element-of-the-hour.json     # Hourly element endpoint
├── assets/
│   ├── demo/                        # Demo screenshots
│   ├── icon/                        # Plugin icons (.svg, .png, .afdesign)
│   └── images/                      # Other images (atom icon)
├── data/
│   ├── PubChemElements_all.csv      # Raw CSV data from PubChem
│   └── PubChemElements_all.json     # Raw JSON data (nested structure)
├── docs/
│   ├── DEVELOPER.md                 # This file
│   ├── NEW_RECIPE_GUIDE.md          # Recipe creation guide
│   └── PRD.md                       # Product requirements
├── scripts/
│   ├── update-element-of-the-day.js       # Daily element generator
│   ├── update-element-of-the-day.test.js  # Tests for daily generator
│   ├── update-element-of-the-hour.js      # Hourly element generator
│   ├── update-element-of-the-hour.test.js # Tests for hourly generator
│   ├── convert-elements-data.js           # Data format converter
│   └── convert-elements-data.test.js      # Tests for converter
├── templates/
│   ├── shared.liquid                # Shared element selection logic
│   ├── full.liquid                  # Full screen layout
│   ├── half_horizontal.liquid       # Half horizontal layout
│   ├── half_vertical.liquid         # Half vertical layout
│   └── quadrant.liquid              # Quadrant layout
├── custom-fields.yml                # User configuration fields
├── data.json                        # Legacy element data file
├── data-all.json                    # All elements (flat array, generated)
├── index.html                       # GitHub Pages landing page
├── package.json                     # Node scripts and metadata
├── settings.yml                     # TRMNL plugin config
├── LICENSE                          # MIT License
└── README.md                        # User documentation
```

## Resources

### TRMNL Documentation
- [TRMNL Framework Documentation](https://usetrmnl.com/framework)
- [TRMNL Developer Guide](https://usetrmnl.com/developers)
- [Private Plugins Guide](https://help.usetrmnl.com/en/articles/9510536-private-plugins)
- [Custom Plugin Form Builder](https://help.usetrmnl.com/en/articles/10513740-custom-plugin-form-builder)

### Related Docs
- [NEW_RECIPE_GUIDE.md](NEW_RECIPE_GUIDE.md) - Guide for creating new TRMNL recipes
- [PRD.md](PRD.md) - Product requirements document
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - AI development context

### External Resources
- [PubChem Database](https://pubchem.ncbi.nlm.nih.gov/)
- [Periodic Table Data](https://pubchem.ncbi.nlm.nih.gov/periodic-table/)

---

**Questions or Issues?** Open an issue on [GitHub](https://github.com/hossain-khan/trmnl-elements-plugin/issues).