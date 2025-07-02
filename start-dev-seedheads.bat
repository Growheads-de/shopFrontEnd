@echo off
echo Starting ReactShop Development Server with Seedheads.de API Proxy...
echo.

REM Check if node_modules directory exists
if not exist "node_modules" (
    echo node_modules directory not found. Installing dependencies...
    echo.
    npm install .
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo node_modules found, skipping installation.
    echo.
)

REM Start the development server
echo Starting development server with Seedheads.de proxy...
echo Server will be available at: http://localhost:9500
echo API calls will be proxied to: https://seedheads.de
echo Press Ctrl+C to stop the server
echo.

REM Wait a moment then open Chrome
timeout /t 3 /nobreak >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:9500"

REM Start the npm server (this will block until stopped)
npm run start:seedheads

REM This will only execute if the server is stopped
echo.
echo Development server stopped.
pause 