<?php

namespace App\Modules\Geography\Division\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDivisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'unique:divisions,code', 'max:50'],
            'description' => ['nullable', 'string'],
        ];
    }
}
