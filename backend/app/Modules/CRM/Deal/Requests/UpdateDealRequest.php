<?php

namespace App\Modules\CRM\Deal\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'value' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:draft,verification,documentation,approval,won,lost'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
