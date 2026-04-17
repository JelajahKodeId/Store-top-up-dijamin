<?php

namespace App\Http\Requests\Member;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MemberTopupStoreRequest extends FormRequest
{
    public const MIN_AMOUNT = 20_000;

    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('member');
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:'.self::MIN_AMOUNT, 'max:50000000'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ];
    }
}
