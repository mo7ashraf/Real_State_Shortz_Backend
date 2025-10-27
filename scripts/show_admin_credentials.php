<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use App\Models\Admin;

try {
    $admins = Admin::all();
    if ($admins->isEmpty()) {
        echo "NO_ADMIN_ROWS\n";
        exit(0);
    }
    foreach ($admins as $a) {
        $pass = '[non-decryptable]';
        try {
            $pass = decrypt($a->admin_password);
        } catch (Throwable $e) {
            // try Crypt facade as well
            try { $pass = Crypt::decrypt($a->admin_password); } catch (Throwable $e2) {}
        }
        echo json_encode([
            'id' => $a->id ?? null,
            'username' => $a->admin_username ?? null,
            'user_type' => $a->user_type ?? null,
            'password_plain' => $pass,
        ], JSON_UNESCAPED_SLASHES) . "\n";
    }
} catch (Throwable $e) {
    fwrite(STDERR, 'ERROR: ' . $e->getMessage() . "\n");
    exit(1);
}
