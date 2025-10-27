<?php
// WARNING: This file is publicly accessible. Use once, then DELETE it immediately.
// Runs common Laravel clear/cache commands without any token protection.

declare(strict_types=1);

try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require __DIR__ . '/../bootstrap/app.php';

    /** @var \Illuminate\Contracts\Console\Kernel $kernel */
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $commands = [
        'optimize:clear',
        'config:clear',
        'route:clear',
        'cache:clear',
    ];

    foreach ($commands as $cmd) {
        $kernel->call($cmd);
    }

    header('Content-Type: text/plain');
    echo "OK\n";
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo 'ERROR: ' . $e->getMessage();
}

