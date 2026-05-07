@echo off
title Undercover Game - Stop Script

echo ========================================
echo        Undercover Game - Stop Script
echo ========================================
echo.

set PORTS=3000 5173
set MAX_ATTEMPTS=5
set DELAY=2

echo [INFO] Will forcefully stop all processes on ports: %PORTS%
echo.

:: Loop to check and terminate processes
set ATTEMPT=0
:LOOP
set /a ATTEMPT+=1
echo [Attempt %ATTEMPT%/%MAX_ATTEMPTS%] Checking ports...

set PORT_FOUND=0

for %%P in (%PORTS%) do (
    netstat -ano | findstr ":%%P LISTENING" >nul
    if %errorlevel% equ 0 (
        echo [Found] Port %%P is still in use
        set PORT_FOUND=1
        
        :: Get and kill all PIDs using this port
        for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P LISTENING"') do (
            echo [Killing] Process PID: %%A
            taskkill /F /PID %%A >nul 2>&1
        )
    )
)

if %PORT_FOUND% equ 0 (
    echo [OK] All ports are released
    goto CLEANUP
)

if %ATTEMPT% geq %MAX_ATTEMPTS% (
    echo [ERROR] Max attempts reached, ports still in use!
    echo [INFO] Please close windows manually or restart computer
    goto END
)

echo [Waiting] Retrying in %DELAY% seconds...
timeout /t %DELAY% /nobreak >nul
goto LOOP

:CLEANUP
echo.
echo ========================================
echo        STOP SUCCESS!
echo ========================================
echo.
echo All services stopped
echo Ports 3000 and 5173 are released
echo ========================================

goto END

:END
pause
