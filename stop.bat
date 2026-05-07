@echo off
chcp 65001 >nul
title 谁是卧底 - 停止脚本

echo ========================================
echo        谁是卧底 - 停止脚本
echo ========================================
echo.

set PORTS=3000 5173
set MAX_ATTEMPTS=5
set DELAY=2

echo [步骤] 将强制终止所有占用端口 %PORTS% 的进程
echo.

:: 循环检查并终止进程
set ATTEMPT=0
:LOOP
set /a ATTEMPT+=1
echo [尝试 %ATTEMPT%/%MAX_ATTEMPTS%] 检查端口状态...

set PORT_FOUND=0

for %%P in (%PORTS%) do (
    netstat -ano | findstr ":%%P LISTENING" >nul
    if %errorlevel% equ 0 (
        echo [发现] 端口 %%P 仍有进程占用
        set PORT_FOUND=1
        
        :: 获取并终止所有占用该端口的 PID
        for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%%P LISTENING"') do (
            echo [终止] 杀死进程 PID: %%A
            taskkill /F /PID %%A >nul 2>&1
        )
    )
)

if %PORT_FOUND% equ 0 (
    echo [OK] 所有端口已释放
    goto CLEANUP
)

if %ATTEMPT% geq %MAX_ATTEMPTS% (
    echo [错误] 已达到最大尝试次数，仍有进程占用端口！
    echo [提示] 请手动关闭相关窗口或重启电脑
    goto END
)

echo [等待] 等待 %DELAY% 秒后重试...
timeout /t %DELAY% /nobreak >nul
goto LOOP

:CLEANUP
echo.
echo ========================================
echo        停止成功！
echo ========================================
echo.
echo 所有服务已完全停止
echo 端口 3000 和 5173 已释放
echo ========================================

:END
pause
