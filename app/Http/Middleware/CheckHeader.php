<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckHeader
{
    public function handle(Request $request, Closure $next)
    {
        // Read API key from common header names (case-insensitive) and
        // handle multiple values combined into a comma-separated string.
        $candidates = [];
        foreach (['X-API-KEY', 'apikey', 'APIKEY'] as $h) {
            $val = $request->header($h);
            if ($val !== null) { $candidates[] = $val; }
        }

        foreach ($candidates as $val) {
            // Laravel may concatenate duplicates into a single comma-separated header value
            $parts = is_array($val) ? $val : explode(',', (string)$val);
            foreach ($parts as $p) {
                if (trim($p) === 'retry123') {
                    return $next($request);
                }
            }
        }

        if (!empty($candidates)) {
            return new JsonResponse(['status' => false, 'message' => 'Invalid API Key!'], 401);
        }
        return new JsonResponse(['status' => false, 'message' => 'Unauthorized Access!'], 401);
    }
}
