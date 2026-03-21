@echo off
echo 正在测试MySQL数据库模式语法...
echo.

REM 检查MySQL是否安装
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo 警告: 未找到MySQL，请确保MySQL服务已安装
    echo 可以手动在MySQL客户端中执行 mysql-schema.sql 文件
    pause
    exit /b 1
)

REM 提示用户输入MySQL连接信息
set /p DB_HOST="请输入MySQL主机 (默认: localhost): "
set /p DB_USER="请输入MySQL用户名 (默认: root): "
set /p DB_PASSWORD="请输入MySQL密码: "

REM 设置默认值
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_USER%"=="" set DB_USER=root

REM 使用mysql命令行工具测试SQL语法
echo 正在测试SQL语法...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "source mysql-schema.sql; SHOW TABLES;" subway_checkin 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ SQL语法测试通过！
    echo 数据库模式已成功创建。
) else (
    echo.
    echo ❌ SQL语法测试失败，请检查错误信息。
    echo 建议手动在MySQL客户端中检查 mysql-schema.sql 文件。
)

pause