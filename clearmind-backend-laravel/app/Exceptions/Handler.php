<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
        public function render($request, Throwable $e)
        {
            if ($request->expectsJson() || $request->is('api/*')) {
                $response = [
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Server error',
                    'exception' => class_basename($e),
                ];

                if (config('app.debug')) {
                    $response = array_merge($response, [
                        'file'  => $e->getFile(),
                        'line'  => $e->getLine(),
                        'trace' => collect($e->getTrace())->map(fn($item) => [
                            'file' => $item['file'] ?? null,
                            'line' => $item['line'] ?? null,
                            'function' => $item['function'] ?? null,
                        ])->take(10)->toArray(), // limit trace depth
                    ]);
                }

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                return response()->json($response, $status);
            }

            return parent::render($request, $e);
        }
}