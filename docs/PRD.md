This is a fantastic use case for **TRMNL**. Because TRMNL uses an E-ink display, the high-contrast nature of the periodic table—with its bold symbols and clean lines—will look stunning.

Here is a **Product Requirements Document (PRD)** to help you build the "Element of the Day" plugin.

---

# PRD: TRMNL "Element of the Day" Plugin

## 1. Project Overview

A TRMNL plugin that fetches a random chemical element every 24 hours (or at a custom interval) and displays its atomic properties, a fun fact, and its position in the periodic table.

* **Goal:** Provide a daily "byte-sized" science lesson.
* **Format:** TRMNL Private Plugin (JSON-based).
* **Target Device:** TRMNL E-ink Display (Black & White).

---

## 2. User Stories

* **As a user,** I want to see a clear, bold atomic symbol so I can recognize the element from across the room.
* **As a user,** I want to learn one "fun fact" or real-world use for the element so it feels less like a textbook and more like a discovery.
* **As a developer,** I want a lightweight data source so the plugin loads quickly and reliably.

---

## 3. Functional Requirements

### A. Data Content (The "Daily Payload")

Each refresh should pull the following fields:

* **Atomic Number:** (e.g., 79)
* **Symbol:** (e.g., Au)
* **Name:** (e.g., Gold)
* **Atomic Mass:** (e.g., 196.97)
* **Category:** (e.g., Transition Metal)
* **Fun Fact/Description:** A short 1-2 sentence blurb.
* **Discovery:** Year or person (e.g., "Known since antiquity").

### B. Display Logic

* **Randomization:** The backend should rotate the element daily.
* **Formatting:** Data must be sent via JSON to the TRMNL "Private Plugin" endpoint.

---

## 4. Design & UI (The "Recipe")

Since TRMNL is E-ink, we must avoid heavy greyscale or complex images. We will use **Liquid (HTML/CSS)**.

### Layout Ideas:

* **The "Big Card":** A large square on the left for the Atomic Symbol/Number (imitating a physical tile).
* **The "Detail Column":** Text on the right for Name, Category, and Mass.
* **The "Footer":** The fun fact in an italicized or boxed-out section at the bottom.

### Recommended CSS:

* **Font:** Use `system-ui` or a bold Monospace for the symbol.
* **Border:** A 2px or 4px solid black border around the Symbol tile for that "Periodic Table" look.

---

## 5. Technical Implementation Strategy

### Step 1: The Data Source

Use the **[Bowserinator Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON)** mentioned earlier. You can host a simple script (on Vercel, Heroku, or a home server) that:

1. Picks an element based on the current date: `element = elements[day_of_year % 118]`.
2. Returns a JSON object formatted for TRMNL.

### Step 2: The TRMNL Recipe (Liquid Template)

In your TRMNL dashboard, you will create a "Custom Plugin." Here is a snippet of how the **Liquid** template might look:

```html
<div class="layout">
  <div class="element-header">
    <div class="atomic-number">{{ atomic_number }}</div>
    <div class="symbol">{{ symbol }}</div>
  </div>
  
  <div class="details">
    <h1 class="name">{{ name }}</h1>
    <p class="category">{{ category | upcase }}</p>
    <p class="mass">Mass: {{ atomic_mass }}</p>
  </div>
  
  <div class="fact">
    <p>{{ summary }}</p>
  </div>
</div>

```

---

## 6. Success Metrics

* **Readability:** The Symbol is legible from 5 feet away.
* **Variety:** The user doesn't see the same element twice in a 118-day cycle.
* **Performance:** The JSON payload remains under 2KB to ensure fast E-ink refreshing.

---
