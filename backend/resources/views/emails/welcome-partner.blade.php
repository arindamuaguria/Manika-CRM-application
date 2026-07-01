<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <!-- Header with gradient -->
    <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to Manika CRM</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">Partner Onboarding Program</p>
    </td></tr>
    <!-- Body -->
    <tr><td style="background:#fff;padding:40px 30px;">
      <p style="font-size:16px;color:#1f2937;">Dear <strong>{{ $partner->contact_name }}</strong>,</p>
      <p style="font-size:15px;color:#4b5563;line-height:1.6;">Thank you for registering as a <strong>{{ $partnerTypeName }}</strong> with Manika CRM. We're excited to have you on board!</p>

      <!-- Partner Type Badge -->
      <table cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr><td style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:20px;padding:6px 16px;">
          <span style="color:#4338ca;font-size:13px;font-weight:600;">{{ $partnerTypeName }}</span>
        </td></tr>
      </table>

      <!-- Appointment Card -->
      @if($appointmentDate)
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:24px;margin:24px 0;">
        <h3 style="margin:0 0 12px;color:#166534;font-size:16px;">&#x1F4C5; Your Onboarding Appointment</h3>
        <p style="margin:4px 0;color:#15803d;font-size:15px;"><strong>Date:</strong> {{ $appointmentDate }}</p>
        <p style="margin:4px 0;color:#15803d;font-size:15px;"><strong>Time:</strong> {{ $appointmentTime }}</p>
        <p style="margin:12px 0 0;color:#166534;font-size:13px;">&#x1F4CE; A calendar invite (.ics) file is attached to this email. Open it to add this event to your Google Calendar, Outlook, or Apple Calendar.</p>
      </div>
      @endif

      <!-- What to Expect -->
      <h3 style="color:#1f2937;font-size:16px;margin:28px 0 12px;">What to Expect</h3>
      <ul style="color:#4b5563;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>A brief introduction to our CRM platform and tools</li>
        <li>Account setup and role configuration</li>
        <li>Territory assignment and coverage area discussion</li>
        <li>Training resources and documentation overview</li>
        <li>Q&amp;A session with our onboarding team</li>
      </ul>

      <!-- Next Steps -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin:24px 0;">
        <h3 style="margin:0 0 8px;color:#1e40af;font-size:15px;">Next Steps</h3>
        <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.6;">Your application is currently under review. Once approved, you will receive your login credentials and can start using the platform immediately.</p>
      </div>

      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin-top:28px;">If you have any questions, feel free to reach out to us. We look forward to meeting you!</p>
      <p style="font-size:14px;color:#1f2937;margin-top:20px;">Best regards,<br><strong>Manika CRM Team</strong></p>
    </td></tr>
    <!-- Footer -->
    <tr><td style="background:#f9fafb;padding:24px 30px;text-align:center;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; {{ date('Y') }} Manika CRM. All rights reserved.</p>
      <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">This is an automated email. Please do not reply directly.</p>
    </td></tr>
  </table>
</body>
</html>
