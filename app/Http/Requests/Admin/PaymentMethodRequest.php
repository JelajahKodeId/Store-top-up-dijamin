<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('payment_method')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('payment_methods', 'code')->ignore($id)],
            'fee_flat' => ['required', 'numeric', 'min:0'],
            'fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'Kode metode pembayaran ini sudah digunakan.',
            'fee_percent.max' => 'Fee persentase tidak boleh lebih dari 100%.',
        ];
    }
}
