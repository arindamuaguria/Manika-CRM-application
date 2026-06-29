<?php

namespace App\Modules\Partner\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'deal_id' => ['required', 'exists:deals,id'],
            'partner_type' => ['required', 'string', 'in:seller,service_person'],
            'business_name' => ['required', 'string', 'max:255'],
            'business_address' => ['required', 'string'],
        ];
    }
}
