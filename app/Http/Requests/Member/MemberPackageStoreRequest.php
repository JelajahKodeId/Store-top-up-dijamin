<?php

namespace App\Http\Requests\Member;

use App\Enums\MemberTier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberPackageStoreRequest extends FormRequest
{
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
            'target_tier' => ['required', 'string', Rule::in(array_map(fn (MemberTier $t) => $t->value, MemberTier::purchasableTiers()))],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function tier(): MemberTier
    {
        return MemberTier::from($this->validated('target_tier'));
    }
}
