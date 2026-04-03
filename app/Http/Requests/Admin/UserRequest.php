<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('user')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'lowercase', 
                'email', 
                'max:255', 
                Rule::unique('users', 'email')->ignore($id)
            ],
            'phone_number' => [
                'nullable', 
                'string', 
                'max:20', 
                Rule::unique('users', 'phone_number')->ignore($id)
            ],
            'password' => [
                $this->isMethod('POST') ? 'required' : 'nullable',
                'confirmed',
                'min:8'
            ],
            'role' => ['required', 'string', Rule::in(['admin', 'member'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Email ini sudah terdaftar.',
            'phone_number.unique' => 'Nomor HP ini sudah terdaftar.',
            'password.required' => 'Password wajib diisi untuk pengguna baru.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'role.in' => 'Role tidak valid.',
        ];
    }
}
