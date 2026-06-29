# Database ER Diagram

Entities:
users, roles, permissions
divisions, territories, localities
leads, deals, partners
deal_documents
territory_bdm_assignments
partner_service_coverage_localities
notifications, activity_logs

Relationships:
Division 1:N Territory
Territory 1:N Locality
BDM 1:N Territory
Lead 1:1 Deal
Deal 1:1 Partner