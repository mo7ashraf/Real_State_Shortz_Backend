<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Property;
use App\Models\GlobalFunction;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'all');
        $typesCsv = $request->query('types');
        $per  = min(50, max(1, (int) $request->query('per_page', 24)));
        $page = max(1, (int) $request->query('page', 1));

        $q = DB::table('tbl_post')
            ->select([
                'id','post_type','user_id','description','metadata','hashtags',
                'video','thumbnail','created_at','property_id'
            ])
            ->orderByDesc('created_at');

        // Filter by type(s)
        $map = [
            'reel' => 1,
            'image' => 2,
            'video' => 3,
            'text' => 4,
        ];
        $types = [];
        if ($typesCsv) {
            foreach (explode(',', $typesCsv) as $t) {
                $t = strtolower(trim($t));
                if (isset($map[$t])) { $types[] = $map[$t]; }
                elseif (is_numeric($t)) { $types[] = (int) $t; }
            }
        } else {
            if ($type !== 'all') {
                $types = isset($map[strtolower($type)]) ? [$map[strtolower($type)]] : [];
            }
        }
        if (!empty($types)) {
            $q->whereIn('post_type', $types);
        }

        $total = (clone $q)->count();
        $items = $q->forPage($page, $per)->get();

        $items = $items->map(function ($p) {
            $p->video_url     = $p->video     ? url(ltrim($p->video, '/'))     : null;
            $p->thumbnail_url = $p->thumbnail ? url(ltrim($p->thumbnail, '/')) : null;
            if (is_string($p->metadata)) {
                $decoded = json_decode($p->metadata, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $p->metadata = $decoded;
                }
            }
            return $p;
        });

        return response()->json([
            'data'       => $items,
            'pagination' => [
                'page'     => $page,
                'per_page' => $per,
                'total'    => $total,
                'has_more' => ($page * $per) < $total,
            ],
        ]);
    }
    public function byUser(Request $request, $id)
    {
        $type = $request->query('type', 'all');       // reel|image|all
        $per  = min(50, (int) $request->query('per_page', 24));
        $page = max(1, (int) $request->query('page', 1));

        $q = DB::table('tbl_post')
            ->select([
                'id','post_type','user_id','description','metadata','hashtags',
                'video','thumbnail','created_at','property_id'
            ])
            ->where('user_id', $id)
            ->orderByDesc('created_at');

        // post_type mapping: 1=reel, 2=image (per Constants)
        if ($type === 'reel')  { $q->where('post_type', 1); }
        if ($type === 'image') { $q->where('post_type', 2); }

        // simple manual pagination
        $total = (clone $q)->count();
        $items = $q->forPage($page, $per)->get();

        // Build absolute URLs for media under /uploads/*
        $items = $items->map(function ($p) {
            $p->video_url     = $p->video     ? url(ltrim($p->video, '/'))     : null;
            $p->thumbnail_url = $p->thumbnail ? url(ltrim($p->thumbnail, '/')) : null;

            // Optional: parse metadata JSON into object/array
            if (is_string($p->metadata)) {
                $decoded = json_decode($p->metadata, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $p->metadata = $decoded;
                }
            }
            return $p;
        });

        return response()->json([
            'data'       => $items,
            'pagination' => [
                'page'     => $page,
                'per_page' => $per,
                'total'    => $total,
                'has_more' => ($page * $per) < $total,
            ],
        ]);
    }

    // Link an existing post/reel to a property
    public function linkProperty(Request $request, $id)
    {
        $request->validate([
            'property_id' => 'required|integer|exists:properties,id',
        ]);

        $post = Post::findOrFail($id);

        // Resolve current user id from auth:api or AUTHTOKEN header
        $userId = optional($request->user())->id;
        if (!$userId) {
            $token = $request->header('authtoken');
            if ($token) {
                $u = GlobalFunction::getUserFromAuthToken($token);
                $userId = $u?->id;
            }
        }
        if (!$userId || (int)$post->user_id !== (int)$userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property = Property::findOrFail((int) $request->input('property_id'));
        if ((int)$property->user_id !== (int)$userId) {
            return response()->json(['message' => 'You can only link your own property'], 422);
        }

        $post->property_id = $property->id;
        $post->save();

        return response()->json(['success' => true, 'post' => $post]);
    }

    // Unlink property from a post/reel
    public function unlinkProperty(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $userId = optional($request->user())->id;
        if (!$userId) {
            $token = $request->header('authtoken');
            if ($token) {
                $u = GlobalFunction::getUserFromAuthToken($token);
                $userId = $u?->id;
            }
        }
        if (!$userId || (int)$post->user_id !== (int)$userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $post->property_id = null;
        $post->save();

        return response()->json(['success' => true, 'post' => $post]);
    }
}
