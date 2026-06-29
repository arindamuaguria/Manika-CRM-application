# Module: Notification Management

## Objective
Implement in-app notifications, email notifications, and SMS notifications triggered by system events (LeadCreated, LeadAssigned, DealCreated, PartnerConverted) using Laravel's event-driven architecture and queue system.

## Dependencies
- 00_Project_Setup (must be completed)
- 01_Authentication_Module (must be completed)
- 02_RBAC_Module (must be completed)
- 04_Lead_Module (should be completed for lead events)
- 05_Deal_Module (should be completed for deal events)
- 06_Partner_Module (should be completed for partner events)

## Database Tables
- `notifications` — id, user_id (FK), type, title, message, data (JSON), channel (enum: in_app, email, sms), is_read, read_at, created_at, updated_at

## Backend Tasks
- [ ] Create Notification model with relationships (belongsTo user)
- [ ] Create `Modules/Notification/Controllers/NotificationController.php`
- [ ] Create `NotificationService.php` with business logic
- [ ] Create `NotificationRepository.php` with database operations
- [ ] Implement event listeners:
  - `LeadCreated` → Notify assigned BDM (in-app + email)
  - `LeadAssigned` → Notify BDM of new lead assignment (in-app + email)
  - `DealCreated` → Notify Admin (in-app + email)
  - `PartnerConverted` → Notify Admin + BDM (in-app + email)
- [ ] Implement Laravel Notification channels (mail, database)
- [ ] Configure queue for async notification dispatch
- [ ] Implement notification mark as read
- [ ] Implement notification mark all as read
- [ ] Implement notification count (unread)
- [ ] Implement notification preferences (optional)
- [ ] Configure SMTP for email notifications
- [ ] Create email templates (Blade/Mailable)

## Frontend Tasks
- [ ] Create Notification dropdown in header (`src/components/NotificationDropdown.tsx`)
- [ ] Create Notification List page (`src/pages/notifications/NotificationList.tsx`)
- [ ] Implement unread notification badge/counter in header
- [ ] Implement real-time notification updates (polling or WebSocket)
- [ ] Implement mark as read functionality
- [ ] Implement mark all as read
- [ ] Create notification toast/popup for new notifications
- [ ] Implement notification filtering (by type, read/unread)
- [ ] Create notification store with Zustand

## API Tasks
- [ ] `GET /api/notifications` — List user notifications (paginated)
- [ ] `GET /api/notifications/unread-count` — Get unread notification count
- [ ] `PATCH /api/notifications/{id}/read` — Mark notification as read
- [ ] `POST /api/notifications/mark-all-read` — Mark all as read
- [ ] `DELETE /api/notifications/{id}` — Delete notification

## Testing Tasks
- [ ] Test LeadCreated triggers BDM notification
- [ ] Test LeadAssigned triggers BDM notification
- [ ] Test DealCreated triggers Admin notification
- [ ] Test PartnerConverted triggers Admin + BDM notifications
- [ ] Test mark as read updates is_read and read_at
- [ ] Test unread count endpoint
- [ ] Test notification queue processing
- [ ] Test email notification sending
- [ ] Frontend: Test notification dropdown renders
- [ ] Frontend: Test unread badge updates

## Acceptance Criteria
- [ ] System events trigger appropriate notifications
- [ ] Notifications delivered in-app and via email
- [ ] Unread notification count shown in header
- [ ] Notifications can be marked as read
- [ ] Notification list supports filtering and pagination
- [ ] Queue processes notifications asynchronously
- [ ] Email templates render correctly
- [ ] All notification events logged in activity_log

## Status
Completed
