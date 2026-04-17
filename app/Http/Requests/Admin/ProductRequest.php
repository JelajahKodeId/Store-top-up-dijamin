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

    protected function prepareForValidation(): void
    {
        $tg = $this->input('telegram_group_invite_url');
        if ($tg === '' || $tg === null) {
            $this->merge(['telegram_group_invite_url' => null]);
        }
    }

    public function rules(): array
    {
        $id = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($id)],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
            'telegram_group_invite_url' => ['nullable', 'string', 'max:2048', 'url'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'platform_type' => ['nullable', Rule::in(['android', 'ios', 'both'])],

            // Fields validation
            'fields' => ['nullable', 'array'],
            'fields.*.id' => ['nullable', 'exists:product_fields,id'],
            'fields.*.name' => ['required', 'string', 'max:100'],
            'fields.*.label' => ['required', 'string', 'max:100'],
            'fields.*.type' => ['required', Rule::in(['text', 'number', 'email', 'textarea', 'select'])],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.validation' => ['nullable', 'string', 'max:255'],
            'fields.*.is_required' => ['nullable', 'boolean'],
            'fields.*.sort_order' => ['nullable', 'integer'],

            // Durations validation
            'durations' => ['required', 'array', 'min:1'],
            'durations.*.id' => ['nullable', 'exists:product_durations,id'],
            'durations.*.name' => ['required', 'string', 'max:100'],
            'durations.*.duration_days' => ['required', 'integer', 'min:0'],
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
