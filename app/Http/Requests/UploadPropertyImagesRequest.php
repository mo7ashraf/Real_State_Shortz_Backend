<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPropertyImagesRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'images.*' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'cover_index' => 'nullable|integer|min:0',
        ];
    }
}
