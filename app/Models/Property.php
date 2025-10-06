<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'user_id','title','description','property_type','listing_type',
        'price_sar','area_sqm','bedrooms','bathrooms','city','district','address','lat','lng','published_post_id'
    ];

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function post() // published feed post
    {
        return $this->belongsTo(Post::class, 'published_post_id');
    }

    public function reels()
    {
        return $this->hasMany(Post::class, 'property_id')->where('post_type', 1);
    }
}
