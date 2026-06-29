<?php

namespace App\Modules\Geography\Locality\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLocalityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'territory_id' => ['required', 'exists:territories,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:localities,code,' . $this->route('locality')],
            'description' => ['nullable', 'string'],
            'polygon' => ['nullable', 'array'],
            'geo_data' => ['nullable', 'array'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
