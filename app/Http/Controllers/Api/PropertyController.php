<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UploadPropertyImagesRequest;
use App\Http\Requests\PublishPropertyRequest;
use App\Http\Requests\AddReelRequest;
use App\Http\Requests\AddStoryRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\Post;
use App\Models\GlobalFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class PropertyController extends Controller
{
    use PropertyQueryFilters;
    /*public function store(StorePropertyRequest $request)
    {
        $userId = auth('api')->id() ?? $request->user_id;
        $prop = Property::create(array_merge($request->validated(), ['user_id' => $userId]));
        return response()->json(['property' => $prop], 201);
    }*/
        public function store(Request $request)
    {
        // If you use auth: $userId = auth()->id();
        $userId = $request->user()->id ?? (int) $request->input('user_id');
        // Fallback to our app token (AUTHTOKEN header) if not provided
        if (empty($userId)) {
            $token = $request->header('authtoken');
            if ($token) {
                $u = GlobalFunction::getUserFromAuthToken($token);
                if ($u) { $userId = (int) $u->id; }
            }
        }

        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'property_type'  => 'required|in:apartment,villa,land,shop,office,other',
            'listing_type'   => 'required|in:sale,rent',
            'price_sar'      => 'nullable|numeric',
            'area_sqm'       => 'nullable|numeric',
            'bedrooms'       => 'nullable|integer|min:0',
            'bathrooms'      => 'nullable|integer|min:0',
            'city'           => 'nullable|string|max:120',
            'district'       => 'nullable|string|max:120',
            'address'        => 'nullable|string|max:255',
            'lat'            => 'nullable|numeric',
            'lng'            => 'nullable|numeric',
          //  'attributes'     => 'nullable',         // JSON string or object
            'images.*'       => 'nullable|image|max:8192', // 8MB per image
        ]);

        // Insert property
        $propId = DB::table('properties')->insertGetId([
            'user_id'       => $userId,
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'property_type' => $data['property_type'],
            'listing_type'  => $data['listing_type'],
            'price_sar'     => $data['price_sar'] ?? null,
            'area_sqm'      => $data['area_sqm'] ?? null,
            'bedrooms'      => $data['bedrooms'] ?? null,
            'bathrooms'     => $data['bathrooms'] ?? null,
            'city'          => $data['city'] ?? null,
            'district'      => $data['district'] ?? null,
            'address'       => $data['address'] ?? null,
            'lat'           => $data['lat'] ?? null,
            'lng'           => $data['lng'] ?? null,
           // 'attributes'    => is_string($data['attributes'] ?? null) ? $data['attributes'] : json_encode($data['attributes'] ?? null),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Save images under public/uploads/properties/{id}/images
        $savedImages = [];
        if ($request->hasFile('images')) {
            $dest = public_path("uploads/properties/{$propId}/images");
            if (! is_dir($dest)) { @mkdir($dest, 0775, true); }

            $i = 0;
            foreach ($request->file('images') as $file) {
                $ext  = strtolower($file->getClientOriginalExtension());
                $name = Str::uuid()->toString() . "." . $ext;
                $file->move($dest, $name);
                $rel  = "/uploads/properties/{$propId}/images/{$name}";

                DB::table('property_images')->insert([
                    'property_id' => $propId,
                    'image_path'  => $rel,
                    'is_cover'    => $i === 0 ? 1 : 0,
                    'sort_order'  => $i,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
                $savedImages[] = $rel;
                $i++;
            }
        }

        // Fetch images as objects for response shape
        $images = DB::table('property_images')
            ->select(['id','image_path','is_cover','sort_order'])
            ->where('property_id', $propId)
            ->orderBy('sort_order')
            ->get();

        // Return
        return response()->json([
            'property' => DB::table('properties')->where('id', $propId)->first(),
            'images'   => $images,
        ], 201);
    }

    public function uploadImages($id, UploadPropertyImagesRequest $request)
    {
        $prop = Property::findOrFail($id);
        $images = $request->file('images', []);
        $coverIndex = (int) $request->input('cover_index', 0);

        $dir = public_path("uploads/properties/{$prop->id}/images");
        if (!File::exists($dir)) { File::makeDirectory($dir, 0755, true); }

        $saved = [];
        foreach ($images as $i => $file) {
            $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $name = (string) Str::uuid() . '.' . $ext;
            $file->move($dir, $name);
            $publicRel = "/uploads/properties/{$prop->id}/images/" . $name;

            $img = PropertyImage::create([
                'property_id' => $prop->id,
                'image_path' => $publicRel,
                'is_cover' => $i == $coverIndex,
                'sort_order' => $i,
            ]);
            $saved[] = $img;
        }
        return response()->json(['images' => $saved]);
    }

    public function index(Request $request)
    {
        $q = Property::with('images');

        // Apply all supported filters and sorting
        $q = $this->applyPropertyFilters($request, $q);

        $perPage = (int) ($request->query('per_page', 15));
        $perPage = $perPage > 0 ? min($perPage, 50) : 15;

        $page = $q->paginate($perPage);
        // Add absolute URLs for images in list responses as well
        $page->getCollection()->transform(function ($prop) {
            if ($prop->relationLoaded('images')) {
                $prop->images->transform(function ($img) {
                    $img->image_url = url(ltrim($img->image_path, '/'));
                    return $img;
                });
            }
            return $prop;
        });

        return response()->json($page);
    }

    public function show($id)
    {
        $prop = Property::with('images')->findOrFail($id);
        // add absolute URLs for images for convenience in clients
        if ($prop->relationLoaded('images')) {
            $prop->images->transform(function ($img) {
                $img->image_url = url(ltrim($img->image_path, '/'));
                return $img;
            });
        }
        return response()->json($prop);
    }

    public function byUser(Request $request, $id)
    {
        $perPage = (int) ($request->query('per_page', 15));
        $perPage = $perPage > 0 ? min($perPage, 50) : 15;

        $q = Property::with('images')->where('user_id', $id);
        $q = $this->applyPropertyFilters($request, $q);

        return response()->json($q->paginate($perPage));
    }

    public function posts($id)
    {
        $posts = DB::table('tbl_post')
            ->where('property_id', $id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($p) {
                $p->video_url     = $p->video ? url(ltrim($p->video, '/')) : null;
                $p->thumbnail_url = $p->thumbnail ? url(ltrim($p->thumbnail, '/')) : null;
                if (is_string($p->metadata)) {
                    $decoded = json_decode($p->metadata, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $p->metadata = $decoded;
                    }
                }
                return $p;
            });

        return response()->json($posts);
    }

    public function publishPost($id, PublishPropertyRequest $request)
    {
        $prop = Property::with('images')->findOrFail($id);
        if ($prop->images->isEmpty()) {
            return response()->json(['message' => 'Add at least one image first'], 422);
        }

        $meta = [
            'property_id' => $prop->id,
            'listing_type' => $prop->listing_type,
            'property_type' => $prop->property_type,
            'price_sar' => $prop->price_sar,
            'area_sqm' => $prop->area_sqm,
            'bedrooms' => $prop->bedrooms,
            'bathrooms' => $prop->bathrooms,
            'city' => $prop->city,
            'district' => $prop->district,
            'title' => $prop->title,
        ];

        $cover = $prop->images->firstWhere('is_cover', true) ?? $prop->images->first();

        $post = Post::create([
            'post_type' => 2,
            'user_id' => $prop->user_id,
            'property_id' => $prop->id,
            'description' => \Illuminate\Support\Str::limit($prop->description ?? $prop->title, 999, ''),
            'metadata' => json_encode($meta),
            'hashtags' => $request->input('hashtags', '#property,#' . $prop->city),
            'video' => null,
            'thumbnail' => $cover?->image_path,
            'views' => 0, 'likes' => 0, 'comments' => 0, 'saves' => 0, 'shares' => 0,
            'mentioned_user_ids' => null,
            'is_trending' => 0,
            'can_comment' => 1,
        ]);

        DB::table('post_images')->insert(
            $prop->images->sortBy('sort_order')->map(function($img) use ($post) {
                return [
                    'post_id' => $post->id,
                    'image' => $img->image_path,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->values()->toArray()
        );

        $prop->published_post_id = $post->id;
        $prop->save();

        return response()->json(['post' => $post], 201);
    }

    public function addReel($id, AddReelRequest $request)
    {
        $prop = Property::with('images')->findOrFail($id);
        $video = $request->file('video');
        $thumbFile = $request->file('thumbnail');

        $reelsDir = public_path("uploads/reels");
        if (!File::exists($reelsDir)) { File::makeDirectory($reelsDir, 0755, true); }
        $vExt = strtolower($video->getClientOriginalExtension() ?: 'mp4');
        $vName = (string) Str::uuid() . '.' . $vExt;
        $video->move($reelsDir, $vName);
        $videoPublic = "/uploads/reels/" . $vName;

        $thumbPublic = null;
        if ($thumbFile) {
            $tExt = strtolower($thumbFile->getClientOriginalExtension() ?: 'jpg');
            $tName = (string) Str::uuid() . '.' . $tExt;
            $thumbFile->move($reelsDir, $tName);
            $thumbPublic = "/uploads/reels/" . $tName;
        } else {
            $thumbPublic = optional($prop->images->first())->image_path;
        }

        $post = Post::create([
            'post_type' => 1,
            'user_id' => $prop->user_id,
            'property_id' => $prop->id,
            'description' => $request->input('description', \Illuminate\Support\Str::limit($prop->title, 999, '')),
            'metadata' => json_encode(['property_id' => $prop->id]),
            'hashtags' => $request->input('hashtags', '#property,#reel,#' . ($prop->city ?? 'KSA')),
            'video' => $videoPublic,
            'thumbnail' => $thumbPublic,
            'views' => 0, 'likes' => 0, 'comments' => 0, 'saves' => 0, 'shares' => 0,
            'mentioned_user_ids' => null,
            'is_trending' => 0,
            'can_comment' => 1,
        ]);

        return response()->json(['reel' => $post], 201);
    }

    public function addStory($id, AddStoryRequest $request)
    {
        $prop = Property::findOrFail($id);
        $type = $request->input('type') === 'video' ? 1 : 0;
        $file = $request->file('content');
        $thumb = $request->file('thumbnail');

        $dir = public_path("uploads/stories");
        if (!File::exists($dir)) { File::makeDirectory($dir, 0755, true); }
        $ext = strtolower($file->getClientOriginalExtension() ?: ($type === 1 ? 'mp4' : 'jpg'));
        $name = (string) Str::uuid() . '.' . $ext;
        $file->move($dir, $name);
        $publicFile = "/uploads/stories/" . $name;

        $thumbPublic = null;
        if ($thumb) {
            $tExt = strtolower($thumb->getClientOriginalExtension() ?: 'jpg');
            $tName = (string) Str::uuid() . '.' . $tExt;
            $thumb->move($dir, $tName);
            $thumbPublic = "/uploads/stories/" . $tName;
        }

        DB::table('stories')->insert([
            'user_id' => $prop->user_id,
            'property_id' => $prop->id,
            'type' => $type,
            'content' => $publicFile,
            'thumbnail' => $thumbPublic,
            'sound_id' => null,
            'duration' => $request->input('duration'),
            'view_by_user_ids' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Story created'], 201);
    }
}



// Shared filter logic in the same namespace (non-bracketed)
trait PropertyQueryFilters
{
    protected function applyPropertyFilters(Request $request, $q)
    {
        // Basic location filters
        $q->when($request->filled('city'), fn($qq) => $qq->where('city', $request->query('city')));
        $q->when($request->filled('district'), fn($qq) => $qq->where('district', $request->query('district')));

        // Text search on title/description
        if ($search = trim((string) $request->query('q', ''))) {
            $like = '%' . str_replace(['%','_'], ['\\%','\\_'], $search) . '%';
            $q->where(function($qq) use ($like) {
                $qq->where('title', 'like', $like)
                   ->orWhere('description', 'like', $like)
                   ->orWhere('address', 'like', $like);
            });
        }

        // Property type: single or CSV via property_type or property_types
        $typesCsv = $request->query('property_types');
        if ($typesCsv) {
            $types = array_filter(array_map('trim', explode(',', strtolower($typesCsv))));
            if (!empty($types)) {
                $q->whereIn('property_type', $types);
            }
        } elseif ($request->filled('property_type')) {
            $q->where('property_type', $request->query('property_type'));
        }

        // Listing type (sale|rent)
        if ($request->filled('listing_type')) {
            $q->where('listing_type', $request->query('listing_type'));
        }

        // Price range
        $priceMin = $request->query('price_min');
        $priceMax = $request->query('price_max');
        if ($priceMin !== null) { $q->where('price_sar', '>=', (float) $priceMin); }
        if ($priceMax !== null) { $q->where('price_sar', '<=', (float) $priceMax); }

        // Area range (sqm)
        $areaMin = $request->query('area_min');
        $areaMax = $request->query('area_max');
        if ($areaMin !== null) { $q->where('area_sqm', '>=', (float) $areaMin); }
        if ($areaMax !== null) { $q->where('area_sqm', '<=', (float) $areaMax); }

        // Bedrooms and bathrooms
        foreach ([
            ['col' => 'bedrooms',  'min' => 'bedrooms_min',  'max' => 'bedrooms_max',  'eq' => 'bedrooms'],
            ['col' => 'bathrooms', 'min' => 'bathrooms_min', 'max' => 'bathrooms_max', 'eq' => 'bathrooms'],
        ] as $cfg) {
            $eqVal  = $request->query($cfg['eq']);
            $minVal = $request->query($cfg['min']);
            $maxVal = $request->query($cfg['max']);
            if ($eqVal !== null && $eqVal !== '') {
                $q->where($cfg['col'], (int) $eqVal);
            } else {
                if ($minVal !== null && $minVal !== '') { $q->where($cfg['col'], '>=', (int) $minVal); }
                if ($maxVal !== null && $maxVal !== '') { $q->where($cfg['col'], '<=', (int) $maxVal); }
            }
        }

        // Has images
        if ($request->filled('has_images')) {
            $val = strtolower((string) $request->query('has_images'));
            $truthy = in_array($val, ['1','true','yes','y'], true);
            if ($truthy) {
                $q->whereHas('images');
            } else {
                $q->doesntHave('images');
            }
        }

        // Optional proximity filter: near_lat, near_lng, radius_km
        $lat = $request->query('near_lat');
        $lng = $request->query('near_lng');
        $rad = $request->query('radius_km');
        if ($lat !== null && $lng !== null && $rad !== null) {
            $lat = (float) $lat; $lng = (float) $lng; $rad = (float) $rad;
            // Haversine (approx) using Earth radius 6371km
            $q->selectRaw(
                'properties.*, (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) as distance_km',
                [$lat, $lng, $lat]
            );
            $q->having('distance_km', '<=', $rad);
            // If sorting not specified, default to nearest when using proximity
            $requestSortBy = strtolower((string) $request->query('sort_by', ''));
            if ($requestSortBy === '') {
                $q->orderBy('distance_km', 'asc');
            }
        }

        // Sorting
        $sortBy = strtolower((string) $request->query('sort_by', 'newest'));
        $order  = strtolower((string) $request->query('sort_order', 'desc'));
        $order  = $order === 'asc' ? 'asc' : 'desc';

        // Only apply sorting here if not already sorted by distance
        if (!collect($q->getQuery()->orders ?? [])->contains(fn($o) => isset($o['column']) && $o['column'] === 'distance_km')) {
            switch ($sortBy) {
                case 'price':
                    $q->orderBy('price_sar', $order);
                    break;
                case 'area':
                    $q->orderBy('area_sqm', $order);
                    break;
                case 'bedrooms':
                    $q->orderBy('bedrooms', $order);
                    break;
                case 'bathrooms':
                    $q->orderBy('bathrooms', $order);
                    break;
                case 'oldest':
                    $q->orderBy('id', 'asc');
                    break;
                case 'newest':
                default:
                    $q->orderBy('id', 'desc');
                    break;
            }
        }

        return $q;
    }
}

// Add shared filter logic at the end of the controller class
/* namespace App\Http\Controllers\Api { */
    /*
    use Illuminate\Http\Request;
    use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

    trait PropertyQueryFilters
    {
        protected function applyPropertyFilters(Request $request, $q)
        {
            // Basic location filters
            $q->when($request->filled('city'), fn($qq) => $qq->where('city', $request->query('city')));
            $q->when($request->filled('district'), fn($qq) => $qq->where('district', $request->query('district')));

            // Text search on title/description
            if ($search = trim((string) $request->query('q', ''))) {
                $like = '%' . str_replace(['%','_'], ['\%','\_'], $search) . '%';
                $q->where(function($qq) use ($like) {
                    $qq->where('title', 'like', $like)
                       ->orWhere('description', 'like', $like)
                       ->orWhere('address', 'like', $like);
                });
            }

            // Property type: single or CSV via property_type or property_types
            $typesCsv = $request->query('property_types');
            if ($typesCsv) {
                $types = array_filter(array_map('trim', explode(',', strtolower($typesCsv))));
                if (!empty($types)) {
                    $q->whereIn('property_type', $types);
                }
            } elseif ($request->filled('property_type')) {
                $q->where('property_type', $request->query('property_type'));
            }

            // Listing type (sale|rent)
            if ($request->filled('listing_type')) {
                $q->where('listing_type', $request->query('listing_type'));
            }

            // Price range
            $priceMin = $request->query('price_min');
            $priceMax = $request->query('price_max');
            if ($priceMin !== null) { $q->where('price_sar', '>=', (float) $priceMin); }
            if ($priceMax !== null) { $q->where('price_sar', '<=', (float) $priceMax); }

            // Area range (sqm)
            $areaMin = $request->query('area_min');
            $areaMax = $request->query('area_max');
            if ($areaMin !== null) { $q->where('area_sqm', '>=', (float) $areaMin); }
            if ($areaMax !== null) { $q->where('area_sqm', '<=', (float) $areaMax); }

            // Bedrooms and bathrooms
            foreach ([
                ['col' => 'bedrooms',  'min' => 'bedrooms_min',  'max' => 'bedrooms_max',  'eq' => 'bedrooms'],
                ['col' => 'bathrooms', 'min' => 'bathrooms_min', 'max' => 'bathrooms_max', 'eq' => 'bathrooms'],
            ] as $cfg) {
                $eqVal  = $request->query($cfg['eq']);
                $minVal = $request->query($cfg['min']);
                $maxVal = $request->query($cfg['max']);
                if ($eqVal !== null && $eqVal !== '') {
                    $q->where($cfg['col'], (int) $eqVal);
                } else {
                    if ($minVal !== null && $minVal !== '') { $q->where($cfg['col'], '>=', (int) $minVal); }
                    if ($maxVal !== null && $maxVal !== '') { $q->where($cfg['col'], '<=', (int) $maxVal); }
                }
            }

            // Has images
            if ($request->filled('has_images')) {
                $val = strtolower((string) $request->query('has_images'));
                $truthy = in_array($val, ['1','true','yes','y'], true);
                if ($truthy) {
                    $q->whereHas('images');
                } else {
                    $q->doesntHave('images');
                }
            }

            // Optional proximity filter: near_lat, near_lng, radius_km
            $lat = $request->query('near_lat');
            $lng = $request->query('near_lng');
            $rad = $request->query('radius_km');
            if ($lat !== null && $lng !== null && $rad !== null) {
                $lat = (float) $lat; $lng = (float) $lng; $rad = (float) $rad;
                // Haversine (approx) using Earth radius 6371km
                $q->selectRaw(
                    'properties.*, (6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat)))) as distance_km',
                    [$lat, $lng, $lat]
                );
                $q->having('distance_km', '<=', $rad);
                // If sorting not specified, default to nearest when using proximity
                $requestSortBy = strtolower((string) $request->query('sort_by', ''));
                if ($requestSortBy === '') {
                    $q->orderBy('distance_km', 'asc');
                }
            }

            // Sorting
            $sortBy = strtolower((string) $request->query('sort_by', 'newest'));
            $order  = strtolower((string) $request->query('sort_order', 'desc'));
            $order  = $order === 'asc' ? 'asc' : 'desc';

            // Only apply sorting here if not already sorted by distance
            if (!collect($q->getQuery()->orders ?? [])->contains(fn($o) => isset($o['column']) && $o['column'] === 'distance_km')) {
                switch ($sortBy) {
                    case 'price':
                        $q->orderBy('price_sar', $order);
                        break;
                    case 'area':
                        $q->orderBy('area_sqm', $order);
                        break;
                    case 'bedrooms':
                        $q->orderBy('bedrooms', $order);
                        break;
                    case 'bathrooms':
                        $q->orderBy('bathrooms', $order);
                        break;
                    case 'oldest':
                        $q->orderBy('id', 'asc');
                        break;
                    case 'newest':
                    default:
                        $q->orderBy('id', 'desc');
                        break;
                }
            }

            return $q;
    }
}
*/
