@echo off
title 谁是卧底 - 游戏服务器

echo ========================================
echo        谁是卧底 - 启动脚本
echo ========================================
echo.

:: 检查端口占用
echo [1/4] 检查端口状态...
netstat -ano | findstr ":3000 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [警告] 端口 3000 已被占用！
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 LISTENING"') do (
        set PID=%%a
    )
    echo [提示] 请先停止占用端口的进程 (PID: %PID%)
    pause
    exit /b 1
)

netstat -ano | findstr ":5173 LISTENING" >nul
if %errorlevel% equ 0 (
    echo [警告] 端口 5173 已被占用！
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 LISTENING"') do (
        set PID=%%a
    )
    echo [提示] 请先停止占用端口的进程 (PID: %PID%)
    pause
    exit /b 1
)

echo [OK] 端口 3000 和 5173 可用
echo.

:: 启动 WebSocket 服务器（后台窗口）
echo [2/4] 启动 WebSocket 服务器 (端口 3000)...
start "谁是卧底 - 服务器" cmd /c "cd /d %~dp0 && npm run server"
timeout /t 3 /nobreak >nul

:: 验证服务器启动
echo [3/4] 验证服务器状态...
netstat -ano | findstr ":3000 LISTENING" >nul
if %errorlevel% neq 0 (
    echo [错误] WebSocket 服务器启动失败！
    pause
    exit /b 1
)
echo [OK] WebSocket 服务器已启动
echo.

:: 启动前端开发服务器
echo [4/4] 启动前端开发服务器 (端口 5173)...
start "谁是卧底 - 前端" cmd /c "cd /d %~dp0 && npm run dev"
echo.

echo ========================================
echo        启动成功！
echo ========================================
echo.
echo 访问地址:
echo   房主界面：http://localhost:5173/host
echo   玩家界面：http://localhost:5173/player
echo.
echo 服务器在后台窗口运行
echo 使用 stop.bat 停止所有服务
echo ========================================

pause
