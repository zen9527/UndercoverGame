@echo off
setlocal enabledelayedexpansion
title Undercover Game - Start Script

echo ========================================
echo        Undercover Game - Start Script
echo ========================================
echo.

:: Check port availability
echo [1/4] Checking ports...

:: Check port 3000 (match :3000 followed by space to avoid false positives)
netstat -ano | findstr ":3000 " >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 "') do (
        set PID=%%a
    )
    echo [WARNING] Port 3000 is already in use!
    echo [INFO] Please run stop.bat first or close the process (PID: !PID!)
    pause
    exit /b 1
)

:: Check port 5173
netstat -ano | findstr ":5173 " >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
        set PID=%%a
    )
    echo [WARNING] Port 5173 is already in use!
    echo [INFO] Please run stop.bat first or close the process (PID: !PID!)
    pause
    exit /b 1
)

echo [OK] Ports 3000 and 5173 are available
echo.

:: Start WebSocket server (background window)
echo [2/4] Starting WebSocket server (port 3000)...
start "Undercover - Server" cmd /c "cd /d %~dp0 && npm run server"
timeout /t 3 /nobreak >nul

:: Verify server started
echo [3/4] Verifying server status...
netstat -ano | findstr ":3000 LISTENING" >nul
if %errorlevel% neq 0 (
    echo [ERROR] WebSocket server failed to start!
    pause
    exit /b 1
)
echo [OK] WebSocket server started
echo.

:: Start frontend dev server
echo [4/4] Starting frontend dev server (port 5173)...
start "Undercover - Frontend" cmd /c "cd /d %~dp0 && npm run dev"
echo.

echo ========================================
echo        START SUCCESS!
echo ========================================
echo.
echo Access URLs:
echo   Host Interface: http://localhost:5173/host
echo   Player Interface: http://localhost:5173/player
echo.
echo Servers are running in background windows
echo Use stop.bat to stop all services
echo ========================================

pause
