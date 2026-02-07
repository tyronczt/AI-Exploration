@echo off
echo 正在启动地铁打卡记录小程序后端服务...
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查MySQL是否安装
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo 警告: 未找到MySQL，请确保MySQL服务已启动或使用云数据库
    echo.
)

REM 进入后端目录
cd /d "%~dp0back\src"

REM 检查node_modules是否存在
if not exist "node_modules" (
    echo 正在安装后端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查环境变量文件
if not exist ".env" (
    echo 警告: 未找到.env文件，正在创建默认配置...
    echo DB_HOST=localhost > .env
    echo DB_PORT=3306 >> .env
    echo DB_NAME=subway_checkin >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD= >> .env
    echo PORT=3000 >> .env
    echo JWT_SECRET=subway_checkin_secret_key_2024 >> .env
    echo 已创建默认.env文件，请根据需要修改配置
    echo.
)

REM 启动后端服务
echo 正在启动后端服务...
echo 服务将运行在 http://localhost:3000
echo 按 Ctrl+C 停止服务
echo.

npm start

pause