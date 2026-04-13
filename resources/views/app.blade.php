<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="app-version" content="{{ config('app.version') }}">
    <title>Trifecta Solutions</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('/assets/img/favicon.ico') }}">
    @vite(['resources/js/app.js'])
</head>
<body>
    <div id="app">
        </div>
</body>
</html>
