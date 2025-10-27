<?php
// WARNING: Public maintenance endpoint. DELETE AFTER USE.
// Removes UTF-8 BOM from specific PHP files that can break headers.

declare(strict_types=1);

function strip_bom_if_present(string $file): array {
    if (!file_exists($file)) {
        return ['file' => $file, 'status' => 'missing'];
    }
    $data = file_get_contents($file);
    if ($data === false) {
        return ['file' => $file, 'status' => 'read_error'];
    }
    $bom = "\xEF\xBB\xBF";
    if (strncmp($data, $bom, 3) === 0) {
        $fixed = substr($data, 3);
        // also normalize leading whitespace before opening tag
        if (strpos($fixed, "<?php") !== 0) {
            $fixed = ltrim($fixed);
        }
        $ok = file_put_contents($file, $fixed);
        return ['file' => $file, 'status' => $ok !== false ? 'bom_removed' : 'write_error'];
    }
    return ['file' => $file, 'status' => 'no_bom'];
}

$root = dirname(__DIR__);
$targets = [
    $root . '/routes/api.php',
    $root . '/routes/web.php',
];

$results = [];
foreach ($targets as $t) {
    $results[] = strip_bom_if_present($t);
}

// Also clear caches to be safe
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require __DIR__ . '/../bootstrap/app.php';
    /** @var \Illuminate\Contracts\Console\Kernel $kernel */
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    foreach (['optimize:clear','config:clear','route:clear','cache:clear'] as $cmd) {
        $kernel->call($cmd);
    }
} catch (\Throwable $e) {
    $results[] = ['cache' => 'error', 'message' => $e->getMessage()];
}

header('Content-Type: application/json');
echo json_encode(['ok' => true, 'results' => $results]);

