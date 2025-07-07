<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which domains are allowed to access your
    | application via HTTP requests from a web browser.
    |
    | For a detailed explanation, see:
    | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'], 

    'allowed_methods' => ['*'], 

    'allowed_origins' => ['http://localhost:5174','http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], 

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Penting jika Anda menggunakan sesi/cookie (misal: Laravel Sanctum)

];
