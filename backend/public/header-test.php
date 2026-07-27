<?php

header('Content-Type: application/json');

$headers = function_exists('getallheaders')
    ? getallheaders()
    : [];

echo json_encode([
    'php_sapi' => PHP_SAPI,

    'http_authorization' =>
        isset($_SERVER['HTTP_AUTHORIZATION']),

    'redirect_http_authorization' =>
        isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']),

    'getallheaders_authorization' =>
        isset($headers['Authorization'])
        || isset($headers['authorization']),
], JSON_PRETTY_PRINT);