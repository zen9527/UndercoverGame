@echo off
title Undercover Game - Stop Script

echo ========================================
echo        Undercover Game - Stop Script
echo ========================================
echo.

echo [INFO] Stopping all Undercover Game services...
echo.

:: Kill all node and tsx processes related to the game
echo [Step 1/3] Killing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node processes terminated
) else (
    echo [INFO] No Node processes found
)

echo.
echo [Step 2/3] Killing tsx processes...
taskkill /F /IM tsx.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] TSX processes terminated
) else (
    echo [INFO] No TSX processes found
)

echo.
echo [Step 3/3] Waiting for ports to release...
timeout /t 3 /nobreak >nul

:: Verify ports are released
echo.
echo [Verification] Checking port status...
set PORT_IN_USE=0

netstat -ano | findstr ":3000 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3000 still in use
    set PORT_IN_USE=1
)

netstat -ano | findstr ":5173 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5173 still in use
    set PORT_IN_USE=1
)

if %PORT_IN_USE% equ 0 (
    echo [OK] All ports released
)

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
