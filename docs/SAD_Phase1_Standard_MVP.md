# Software Architecture Document (SAD)
## Partner Ecosystem Platform - Standard MVP

## Architectural Style
Modular Monolith + REST API

## High Level Architecture

React SPA
    |
REST API
    |
Laravel Backend
    |
MySQL Database

External Services:
- Google Maps
- SMTP
- SMS Gateway

## Domains

Security Domain
- Authentication
- Authorization
- User Management

Geography Domain
- Division
- Territory
- Locality

CRM Domain
- Lead
- Deal

Partner Domain
- BDM
- Seller
- Service Person

Support Domain
- Dashboard
- Notification
- Audit
- Reports

## Backend Layers

Controller
-> Request Validation
-> Service Layer
-> Repository Layer
-> Model
-> Database

## Geographic Architecture
- Locality polygons stored as JSON
- Google Geometry library for Point-in-Polygon
- Geo hierarchy: Division -> Territory -> Locality

## Event Architecture
Events:
- LeadCreated
- LeadAssigned
- DealCreated
- PartnerConverted

Listeners:
- SendNotification
- WriteAuditLog

## Queue Architecture
Laravel Queue (Database Driver)

Jobs:
- Email Sending
- SMS Sending
- Notification Dispatch

## Security
- Laravel Sanctum
- RBAC
- Audit Logging

## Deployment
cPanel Shared Hosting
