<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified - ClearMind</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; }
    </style>
</head>
<body class="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">

    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl text-center p-10">

        <!-- Big success icon -->
        <div class="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-5">
            Email Verified!
        </h1>

        <p class="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
            Your ClearMind doctor account is now active.<br>
            <span class="text-green-700">You can safely close this tab or window.</span>
        </p>

        <!-- Only close action + minimal fallback -->
        <div class="space-y-6">
            <button onclick="window.close()" 
                    class="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium text-lg py-4 px-8 rounded-xl transition shadow-md focus:outline-none focus:ring-4 focus:ring-gray-300">
                Close This Window
            </button>

            <p class="text-xs text-gray-400 mt-8">
                support@clearmind.ph
            </p>
        </div>

    </div>

</body>
</html>