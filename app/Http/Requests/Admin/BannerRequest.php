<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'image' => $this->isMethod('POST') 
                ? ['required', 'image', 'file', 'max:2048'] 
                : ['nullable', 'image', 'file', 'max:2048'],
            'link' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
