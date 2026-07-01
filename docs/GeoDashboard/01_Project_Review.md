# Geo Dashboard - Project Review

## 1. Project Goal
The goal of this initiative is to design and implement a new **Geo Dashboard** module within the Manika CRM. The module will serve as a geographic command center for administrators and Business Development Managers (BDMs). It will visualize the geographic hierarchy (Divisions, Territories, and Localities) and plot the location of onboarding partners (BDMs, Sellers, and Service Persons) in real-time.

## 2. Requirements & Business Context
* **Geographic Decision Making**: Enable business leaders to identify coverage gaps, monitor territory penetration, and optimize resource allocation.
* **Partner Visualization**: Plot active, inactive, and pending partners (Sellers and Service Persons) on an interactive map.
* **BDM Coverage**: Identify which territories are assigned to which BDMs and visualize their performance boundaries.
* **Interactive Filters**: Provide side-panel filters to toggle layers (Territories, Localities, BDMs, Sellers, Service Persons) with real-time autocomplete and search bars.
* **KPI Metric Cards**: Display high-level metrics dynamically updated based on active filters (e.g., number of Territories, Localities, BDMs, Sellers, and Service Persons).

## 3. High-Fidelity UI Design Specification
The Geo Dashboard UI must follow the layout shown in the user mockup:
* **Top Header KPIs**: 5 cards in a horizontal row showing counts for:
  1. No. of Territories
  2. No. of Localities
  3. No. of BDMs
  4. No. of Sellers
  5. No. of Service Persons
* **Left-hand Filters Panel**: Vertical list containing toggle checkboxes and autocomplete search inputs for:
  * Territory
  * Locality
  * BDM
  * Seller
  * Service Person
* **Main Map Canvas**: Full-height Google Maps view featuring:
  * Search this area input floating at the top center.
  * Layer overlays rendering Polygons (Territory boundaries and Locality polygons).
  * Markers plotting partner coordinates (Sellers and Service Persons).
  * Detailed popups (InfoWindows) when clicking on polygons or markers.
