# Business Analysis Document (BAD)
## Partner Ecosystem Platform - Standard MVP

### Executive Summary
A territory-driven partner onboarding and CRM platform for managing BDM, Seller, and Service Partners.

## Stakeholders
- Admin
- BDM Partner
- Seller Partner
- Service Person Partner

## Geographic Hierarchy
Division -> Territory -> Locality

Business Rules:
- One BDM can manage multiple Territories.
- One Territory can be assigned to only one BDM.
- Every Locality must have a Geo Polygon boundary.
- Geo capture is mandatory during lead creation.
- Duplicate leads are not allowed (mobile/email).
- Leads outside mapped localities are marked as Unmapped.

## Core Modules
- Authentication & Authorization
- Division Management
- Territory Management
- Locality Management
- Lead Management
- Deal Management
- Partner Management
- Dashboard & Reports
- Notifications
- Audit Trail

## Lead Lifecycle
New -> Assigned -> Qualified -> Deal Created -> Won/Lost

## Deal Lifecycle
Draft -> Verification -> Documentation -> Approval -> Won/Lost

## Partner Types
- BDM Partner
- Seller Partner
- Service Person Partner

## Google Map Features
- Territory Boundaries
- Locality Polygons
- Seller Geo Markers
- Service Partner Geo Markers
- Territory Coverage Visualization

## Out of Scope
- Ecommerce
- Orders
- Inventory
- Commission
- Payouts
- Mobile Apps
