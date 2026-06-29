<?php

namespace App\Modules\Geography\Territory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTerritoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'division_id' => ['required', 'exists:divisions,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'unique:territories,code', 'max:50'],
            'description' => ['nullable', 'string'],
            'boundaries' => ['nullable', 'array'],
        ];
    }
}
