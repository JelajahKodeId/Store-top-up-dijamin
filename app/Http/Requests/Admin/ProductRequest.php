<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($id)],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            
            // Fields validation
            'fields' => ['nullable', 'array'],
            'fields.*.id' => ['nullable', 'exists:product_fields,id'],
            'fields.*.name' => ['required', 'string', 'max:100'],
            'fields.*.label' => ['required', 'string', 'max:100'],
            'fields.*.type' => ['required', Rule::in(['text', 'number'])],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.validation' => ['nullable', 'string', 'max:255'],
            'fields.*.is_required' => ['nullable', 'boolean'],
            'fields.*.sort_order' => ['nullable', 'integer'],

            // Durations validation
            'durations' => ['required', 'array', 'min:1'],
            'durations.*.id' => ['nullable', 'exists:product_durations,id'],
            'durations.*.name' => ['required', 'string', 'max:100'],
            'durations.*.duration_days' => ['required', 'integer', 'min:1'],
            'durations.*.price' => ['required', 'numeric', 'min:0'],
            'durations.*.is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique' => 'Slug ini sudah digunakan oleh produk lain.',
        ];
    }
}
