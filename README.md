# Element of the Day - TRMNL Plugin 🧪

<img src="assets/icon/periodic-table-icon.svg" align="right" alt="Periodic Table Icon" width="120"/>

A TRMNL plugin that displays a different element from the Periodic Table each day. Learn chemistry one element at a time with this educational plugin for your TRMNL e-ink display!

> "The elements are the alphabet of nature." – Dmitri Mendeleev

## Features

- 🔬 **Daily Element Rotation** - See a new element every day (118-day cycle)
- ⏰ **Hourly Random Option** - Configurable hourly element changes for more variety
- 📊 **Comprehensive Data** - Atomic number, symbol, name, mass, category, and more
- 🎨 **Periodic Table Style** - Clean design inspired by classic periodic table tiles
- 📱 **Multiple Layouts** - Full screen, half horizontal, half vertical, and quadrant views
- ⚡ **Fast & Reliable** - Static data served via GitHub Pages
- ⚙️ **User Configurable** - Choose between daily or hourly display modes

## Install

**[→ Install Element of the Day](https://usetrmnl.com/recipes)**

1. Visit [TRMNL Plugins](https://usetrmnl.com/plugins)
2. Search for "**Element of the Day**"
3. Click **Install**
4. Configure your preferred **Display Mode**:
   - **Daily Rotation**: Cycles through all 118 elements based on day of year (default)
   - **Hourly Random**: Shows a different element each hour for more frequent changes
5. Add to your [Playlist](https://usetrmnl.com/playlists)

## Layouts

| Layout | Description |
|--------|-------------|
| **Full** | Large element tile with complete property details |
| **Half Horizontal** | Compact horizontal view with essential info |
| **Half Vertical** | Vertical layout perfect for side-by-side displays |
| **Quadrant** | Minimal tile showing symbol and name |

## Element Data

Each element includes:
- **Atomic Number** - Position in the periodic table
- **Symbol** - Chemical symbol (1-2 letters)
- **Name** - Full element name
- **Atomic Mass** - Mass in atomic mass units
- **Category** - Group classification (Noble gas, Transition metal, etc.)
- **Standard State** - Physical state at room temperature
- **Electron Configuration** - Orbital notation
- **Electronegativity** - Pauling scale value
- **Melting/Boiling Points** - Temperature in Kelvin
- **Density** - Mass per unit volume
- **Oxidation States** - Common ionic charges
- **Year Discovered** - Historical discovery information

## API Endpoint

The plugin uses static JSON endpoints that update automatically:

### Daily Rotation Mode
```
https://hossain-khan.github.io/trmnl-elements-plugin/api/element-of-the-day.json
```
Updates: Once per day at 2 AM UTC

### Hourly Random Mode
```
https://hossain-khan.github.io/trmnl-elements-plugin/api/element-of-the-hour.json
```
Updates: Every hour on the hour

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

## For Developers

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

3. Test locally by opening `templates/*.liquid` files

### Configuration

Users can configure the display mode through the plugin settings:

- **Display Mode**: Dropdown to choose between:
  - `Daily Rotation` - Cycles through all 118 elements based on day of year (default)
  - `Hourly Random` - Shows a different element each hour based on hour identifier

The templates automatically adapt based on the user's selection using conditional logic in `shared.liquid`.

### Testing

Run the unit tests to ensure the element selection logic works correctly:

```bash
npm test
```

Run individual test suites:

```bash
npm run test:element          # Test daily element script
npm run test:element-hourly   # Test hourly element script
npm run test:convert          # Test data conversion script
```

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

All tests are implemented using Node.js `assert` module and can be run without any external dependencies.

### Data Conversion

Convert the nested PubChem data structure to a simplified flat array format:

```bash
npm run convert
```

This generates `data-all.json` containing an array of all 118 elements with the following structure:

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
  ]
}
```

This simplified format is useful for:
- Direct array iteration and filtering via `data.elements`
- Client-side element lookups
- Building custom periodic table visualizations
- Educational applications requiring full element data
- Metadata tracking (source, generation time, totals)

### Template Architecture

The plugin uses a shared template pattern with conditional display mode logic:

**`templates/shared.liquid`**
- Central element selection logic with display mode support
- Loads `elements` from static data (all 118 elements via `data-all.json`)
- **Daily Rotation Mode**: Calculates day of year and uses modulo 118
- **Hourly Random Mode**: Calculates hour identifier (YYYYMMDDHH) and uses modulo 118
- Selects appropriate element based on user's configured display mode
- Makes `element` variable available to all templates
- Automatically included by TRMNL portal before rendering layout templates

All layout templates (`full.liquid`, `half_horizontal.liquid`, `half_vertical.liquid`, `quadrant.liquid`) access the `element` variable provided by the shared template.

This architecture allows:
- **Centralized logic**: Element selection code maintained in one place
- **Flexible modes**: Easy switching between daily and hourly displays
- **Client-side rendering**: No server-side API calls needed
- **Deterministic selection**: Same period = same element across all layouts
- **Easy testing**: Shared logic can be validated independently

### Data Source

Element data is sourced from [PubChem](https://pubchem.ncbi.nlm.nih.gov/) and stored in `data/PubChemElements_all.json`.

### GitHub Actions

Three workflows automate the plugin:

- **`pages.yml`** - Deploys to GitHub Pages on push to main
- **`update-element.yml`** - Updates daily element data at 2 AM UTC (runs daily)
- **`update-element-hourly.yml`** - Updates hourly element data (runs every hour)

Both element update workflows can be triggered manually via workflow_dispatch.

### Project Structure

```
trmnl-elements-plugin/
├── api/
│   ├── element-of-the-day.json  # Daily element endpoint
│   └── element-of-the-hour.json # Hourly element endpoint
├── assets/
│   ├── demo/                    # Demo screenshots
│   └── icon/                    # Plugin icon
├── data/
│   ├── PubChemElements_all.csv  # Raw CSV data
│   └── PubChemElements_all.json # Raw JSON data (nested structure)
├── docs/
│   ├── NEW_RECIPE_GUIDE.md      # Recipe creation guide
│   └── PRD.md                   # Product requirements
├── scripts/
│   ├── update-element-of-the-day.js       # Daily element generator
│   ├── update-element-of-the-day.test.js  # Tests for daily generator
│   ├── update-element-of-the-hour.js      # Hourly element generator
│   ├── update-element-of-the-hour.test.js # Tests for hourly generator
│   ├── convert-elements-data.js           # Data format converter
│   └── convert-elements-data.test.js      # Tests for converter
├── templates/
│   ├── shared.liquid            # Shared element selection logic (daily/hourly)
│   ├── full.liquid              # Full screen layout
│   ├── half_horizontal.liquid   # Half horizontal layout
│   ├── half_vertical.liquid     # Half vertical layout
│   └── quadrant.liquid          # Quadrant layout
├── .github/workflows/
│   ├── pages.yml                # GitHub Pages deployment
│   ├── update-element.yml       # Daily data update (2 AM UTC)
│   └── update-element-hourly.yml # Hourly data update (every hour)
├── data.json                    # Current element data
├── data-all.json                # All elements (flat array, generated)
├── package.json                 # Node scripts and metadata
├── settings.yml                 # TRMNL plugin config
└── README.md
```

## Resources

- [TRMNL Framework Documentation](https://usetrmnl.com/framework)
- [TRMNL Developer Guide](https://usetrmnl.com/developers)
- [Private Plugins Guide](https://help.usetrmnl.com/en/articles/9510536-private-plugins)

## License

See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for the TRMNL community**
