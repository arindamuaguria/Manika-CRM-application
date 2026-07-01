<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicPartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        $rules = [
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_mobile' => ['required', 'string', 'max:20'],
            'partner_type' => ['required', 'string', 'in:bdm,seller,service_person'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'business_address' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'appointment_datetime' => ['required', 'date', 'after:now'],
            'appointment_notes' => ['nullable', 'string', 'max:1000'],
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:100'],
            // BDM fields
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'previous_employer' => ['nullable', 'string', 'max:255'],
            'experience_description' => ['nullable', 'string', 'max:2000'],
            'education_level' => ['nullable', 'string', 'max:100'],
            'education_institution' => ['nullable', 'string', 'max:255'],
            'education_field' => ['nullable', 'string', 'max:255'],
            'preferred_territory_ids' => ['nullable', 'array'],
            'preferred_territory_ids.*' => ['integer', 'exists:territories,id'],
            // Seller fields
            'gst_number' => ['nullable', 'string', 'max:20'],
            'business_type' => ['nullable', 'string', 'max:100'],
            'annual_turnover' => ['nullable', 'string', 'max:50'],
            'product_categories' => ['nullable', 'array'],
            'product_categories.*' => ['string', 'max:100'],
            // Service Person fields
            'services_offered' => ['nullable', 'array'],
            'services_offered.*' => ['string', 'max:100'],
            'has_driving_license' => ['nullable', 'boolean'],
            'driving_license_number' => ['nullable', 'string', 'max:50'],
            'license_type' => ['nullable', 'string', 'max:30'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'vehicle_registration' => ['nullable', 'string', 'max:30'],
        ];

        // Conditional required fields based on partner_type
        if ($this->input('partner_type') === 'bdm') {
            $rules['education_level'] = ['required', 'string', 'max:100'];
        } elseif ($this->input('partner_type') === 'seller') {
            $rules['business_name'] = ['required', 'string', 'max:255'];
            $rules['business_address'] = ['required', 'string'];
            $rules['business_type'] = ['required', 'string', 'max:100'];
        } elseif ($this->input('partner_type') === 'service_person') {
            $rules['business_name'] = ['required', 'string', 'max:255'];
            $rules['services_offered'] = ['required', 'array', 'min:1'];
        }

        return $rules;
    }
}
