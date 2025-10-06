<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $table = 'tbl_post';
    protected $fillable = [
        'post_type','user_id','property_id','sound_id','description','metadata','hashtags',
        'video','thumbnail','views','likes','comments','saves','shares','mentioned_user_ids','is_trending','can_comment'
    ];
}
