# Geo Dashboard - Geo Data Analysis

## 1. Existing Location Attributes

The database schema natively stores location attributes across four models:

| Model | Table | Attribute | Data Type | GeoJSON Structure / Purpose |
|---|---|---|---|---|
| `Lead` | `leads` | `latitude` | `decimal(10,7)` | Latitude coordinate of the lead |
| `Lead` | `leads` | `longitude` | `decimal(10,7)` | Longitude coordinate of the lead |
| `Lead` | `leads` | `address` | `text` | Human-readable address description |
| `Partner` | `partners` | `latitude` | `decimal(10,7)` | Latitude coordinate of the partner business |
| `Partner` | `partners` | `longitude` | `decimal(10,7)` | Longitude coordinate of the partner business |
| `Partner` | `partners` | `business_address` | `text` | Human-readable address description |
| `Locality` | `localities` | `polygon` | `json` | GeoJSON polygon `{"type":"Polygon", "coordinates":[[[lng1,lat1],...]]]}` defining the locality boundary |
| `Locality` | `localities` | `geo_data` | `json` | Extra metadata related to geography (e.g., center point, zoom) |
| `Territory` | `territories` | `boundaries` | `json` | GeoJSON representation of the territory boundaries |

---

## 2. Relationships and Geographic Hierarchies
* **Locality to Territory**: A `Locality` belongs to a `Territory` via `territory_id`.
* **Territory to Division**: A `Territory` belongs to a `Division` via `division_id`.
* **Partner Primary Assignment**: A `Partner` is mapped to a primary `territory_id` and `locality_id`.
* **Service Person Coverage**: A Service Person partner can service multiple localities, recorded in the `partner_service_coverage_localities` table.
* **Lead Geocoding**: A `Lead` has `division_id`, `territory_id`, and `locality_id` fields.

---

## 3. Existing Geography Utilities

### Backend: `GeoService.php`
Implements the following spatial functions:
* `identifyLocality(float $lat, float $lng)`: Iterates through active localities and returns the first locality whose GeoJSON polygon contains the point.
* `isPointInPolygon(float $lat, float $lng, array $polygon)`: Ray-casting mathematical check for point containment.
* `getFullGeoChain(float $lat, float $lng)`: Returns the complete geo chain `Locality -> Territory -> Division -> BDM` for a point.

### Frontend: Map Components
The following reusable map components already exist under `src/components/maps/`:
* `MapContainer.tsx`: Handles dynamic Google Maps script loading, API key validation, error fallback states, and maps initialization.
* `MarkerLayer.tsx`: Batches marker additions and handles point clicks.
* `PolygonViewer.tsx`: Takes a list of polygons, draws them with stroke/fill styles, and fits map zoom boundaries.
* `PolygonDrawer.tsx`: Provides polygon tracing controls (Google Maps Drawing Manager integration).
* `TerritoryMapView.tsx`: Connects territory boundaries with the `PolygonViewer`.
