<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('voucher')?->id;

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($id)],
            'type' => ['required', Rule::in(['fixed', 'percent'])],
            'value' => ['required', 'numeric', 'min:0'],
            'min_transaction' => ['required', 'numeric', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'expired_at' => ['nullable', 'date', 'after:today'],
            'is_active' => ['boolean'],
        ];
    }
}
