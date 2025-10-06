<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddStoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'type' => 'required|in:image,video',
            'content' => 'required|file',
            'thumbnail' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'duration' => 'nullable|string|max:10',
        ];
    }
}
