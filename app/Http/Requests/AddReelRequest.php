<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddReelRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:51200',
            'thumbnail' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'hashtags' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:999',
        ];
    }
}
