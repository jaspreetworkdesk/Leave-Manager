<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UseApiTokenHeader
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        if (
            ! $request->bearerToken()
            && $request->hasHeader('X-API-Token')
        ) {
            $token = trim(
                (string) $request->header('X-API-Token')
            );

            if ($token !== '') {
                $request->headers->set(
                    'Authorization',
                    'Bearer '.$token
                );

                $request->server->set(
                    'HTTP_AUTHORIZATION',
                    'Bearer '.$token
                );
            }
        }

        return $next($request);
    }
}