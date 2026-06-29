# Detailed Database Schema

## Core Tables
- users
- roles
- permissions
- divisions
- territories
- localities
- territory_bdm_assignments
- leads
- deals
- deal_documents
- partners
- partner_service_coverage_localities
- notifications
- activity_logs

## Relationships
Division 1:N Territory
Territory 1:N Locality
BDM 1:N Territory
Lead 1:1 Deal
Deal 1:1 Partner
Partner N:N Locality
