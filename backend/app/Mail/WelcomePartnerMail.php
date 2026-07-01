<?php

namespace App\Mail;

use App\Models\Partner;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class WelcomePartnerMail extends Mailable
{
    use Queueable, SerializesModels;

    public Partner $partner;
    public string $icsContent;

    public function __construct(Partner $partner)
    {
        $this->partner = $partner;
        $this->icsContent = $this->generateIcs();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Manika CRM — Your Onboarding Appointment is Confirmed!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-partner',
            with: [
                'partner' => $this->partner,
                'partnerTypeName' => $this->getPartnerTypeName(),
                'appointmentDate' => $this->partner->appointment_datetime?->format('l, F j, Y'),
                'appointmentTime' => $this->partner->appointment_datetime?->format('h:i A'),
            ],
        );
    }

    public function attachments(): array
    {
        if (!$this->partner->appointment_datetime) {
            return [];
        }

        return [
            Attachment::fromData(fn () => $this->icsContent, 'onboarding-appointment.ics')
                ->withMime('text/calendar'),
        ];
    }

    protected function getPartnerTypeName(): string
    {
        return match ($this->partner->partner_type) {
            'bdm' => 'Business Development Manager',
            'seller' => 'Seller Partner',
            'service_person' => 'Service Partner',
            default => 'Partner',
        };
    }

    protected function generateIcs(): string
    {
        $start = $this->partner->appointment_datetime;
        if (!$start) return '';
        
        $end = $start->copy()->addHour();
        $now = now();
        
        $dtStart = $start->format('Ymd\THis');
        $dtEnd = $end->format('Ymd\THis');
        $dtStamp = $now->format('Ymd\THis\Z');
        $uid = uniqid('manika-') . '@manika-crm.com';
        
        $partnerTypeName = $this->getPartnerTypeName();
        $description = "Onboarding meeting for {$this->partner->contact_name} ({$partnerTypeName}).\\nContact: {$this->partner->contact_mobile}";
        if ($this->partner->contact_email) {
            $description .= "\\nEmail: {$this->partner->contact_email}";
        }

        return implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Manika CRM//Partner Onboarding//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            "UID:{$uid}",
            "DTSTAMP:{$dtStamp}",
            "DTSTART:{$dtStart}",
            "DTEND:{$dtEnd}",
            'SUMMARY:Manika CRM — Partner Onboarding Meeting',
            "DESCRIPTION:{$description}",
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Reminder: Partner onboarding meeting in 30 minutes',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ]);
    }
}
