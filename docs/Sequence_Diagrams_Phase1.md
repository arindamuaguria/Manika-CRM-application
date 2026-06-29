# Sequence Diagrams

## Lead Creation
User -> Lead Form
Lead Form -> Geo Service
Geo Service -> Locality Service
Locality Service -> BDM Assignment
BDM Assignment -> Lead Service
Lead Service -> Database

## Partner Conversion
Lead -> Deal
Deal -> Verification
Verification -> Approval
Approval -> Partner Creation
