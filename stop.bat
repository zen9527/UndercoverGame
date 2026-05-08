@echo off
title Undercover Game - Stop Script

echo ========================================
echo        Undercover Game - Stop Script
echo ========================================
echo.

echo [INFO] Stopping all Undercover Game services...
echo.

:: Kill only processes listening on game ports
echo [Step 1/2] Killing process on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Process on port 3000 terminated (PID: %%a)
    )
)
netstat -ano | findstr ":3000 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 still in use
) else (
    echo [OK] Port 3000 released
)

echo.
echo [Step 2/2] Killing process on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Process on port 5173 terminated (PID: %%a)
    )
)
netstat -ano | findstr ":5173 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5173 still in use
) else (
    echo [OK] Port 5173 released
)

echo.
echo [Final Step] Waiting for ports to fully release...
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo        STOP COMPLETE!
echo ========================================
echo.
echo All Undercover Game services stopped
echo.
echo If ports are still in use, you may need to:
echo   1. Close any open command windows manually
echo   2. Wait a few more seconds
echo   3. Restart your computer (last resort)
echo ========================================

pause
