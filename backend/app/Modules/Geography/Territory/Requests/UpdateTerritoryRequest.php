<?php

namespace App\Modules\Geography\Territory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTerritoryRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50', 'unique:territories,code,' . $this->route('territory')],
            'description' => ['nullable', 'string'],
            'boundaries' => ['nullable', 'array'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
