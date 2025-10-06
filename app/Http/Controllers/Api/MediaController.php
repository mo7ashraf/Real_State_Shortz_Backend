<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class MediaController extends Controller
{
    public function storeReel(Request $request)
    {
        $userId = $request->user()->id ?? (int) $request->input('user_id');

        $data = $request->validate([
            'property_id'  => 'nullable|integer|exists:properties,id',
            'description'  => 'nullable|string|max:1000',
            'hashtags'     => 'nullable|string|max:255',
            'metadata'     => 'nullable',                 // JSON string or object
            'video'        => 'required|file|mimetypes:video/mp4,video/quicktime,video/x-matroska|max:51200', // 50MB
            'thumbnail'    => 'nullable|image|max:8192',
        ]);

        // Save video to /public/uploads/reels
        $videoDir = public_path("uploads/reels");
        if (! is_dir($videoDir)) { @mkdir($videoDir, 0775, true); }

        $vExt  = strtolower($request->file('video')->getClientOriginalExtension());
        $vName = "reel_" . Str::uuid()->toString() . "." . $vExt;
        $request->file('video')->move($videoDir, $vName);
        $videoRel = "/uploads/reels/{$vName}";

        // Save thumbnail if provided
        $thumbRel = null;
        if ($request->hasFile('thumbnail')) {
            $tExt  = strtolower($request->file('thumbnail')->getClientOriginalExtension());
            $tName = "thumb_" . Str::uuid()->toString() . "." . $tExt;
            $request->file('thumbnail')->move($videoDir, $tName);
            $thumbRel = "/uploads/reels/{$tName}";
        }

        // Insert into tbl_post as reel (post_type = 1)
        $postId = DB::table('tbl_post')->insertGetId([
            'post_type'           => 1,
            'user_id'             => $userId,
            'property_id'         => $data['property_id'] ?? null,
            'sound_id'            => null,
            'description'         => $data['description'] ?? null,
            'metadata'            => is_string($data['metadata'] ?? null) ? $data['metadata'] : json_encode($data['metadata'] ?? null),
            'hashtags'            => $data['hashtags'] ?? null,
            'video'               => $videoRel,
            'thumbnail'           => $thumbRel,
            'views'               => 0,
            'likes'               => 0,
            'comments'            => 0,
            'saves'               => 0,
            'shares'              => 0,
            'mentioned_user_ids'  => null,
            'is_trending'         => 0,
            'can_comment'         => 1,
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        // back-reference property -> published_post_id (optional)
        if (!empty($data['property_id'])) {
            DB::table('properties')->where('id', $data['property_id'])->update([
                'published_post_id' => $postId,
                'updated_at'        => now(),
            ]);
        }

        return response()->json([
            'post_id'       => $postId,
            'video_url'     => url(ltrim($videoRel, '/')),
            'thumbnail_url' => $thumbRel ? url(ltrim($thumbRel, '/')) : null,
        ], 201);
    }
}
