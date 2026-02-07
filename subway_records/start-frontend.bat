@echo off
echo 正在准备地铁打卡记录小程序前端项目...
echo.

REM 检查微信开发者工具是否安装
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Tencent\微信开发者工具" >nul 2>nul
if %errorlevel% neq 0 (
    reg query "HKEY_CURRENT_USER\SOFTWARE\Tencent\微信开发者工具" >nul 2>nul
    if %errorlevel% neq 0 (
        echo 警告: 未检测到微信开发者工具
        echo 请确保已安装微信开发者工具，或手动打开项目
        echo.
        echo 项目路径: %~dp0front
        pause
        exit /b 1
    )
)

REM 显示项目信息
echo 地铁打卡记录小程序前端项目
echo =========================
echo 项目路径: %~dp0front
echo.
echo 请使用微信开发者工具打开此项目:
echo 1. 打开微信开发者工具
echo 2. 点击"导入项目"
echo 3. 选择项目路径: %~dp0front
echo 4. 填写AppID (测试号或正式号)
echo 5. 点击"导入"
echo.
echo 或使用命令行启动 (如果已配置环境变量):
echo wechatdevtools --open %~dp0front

REM 尝试自动打开微信开发者工具
where wechatdevtools >nul 2>nul
if %errorlevel% equ 0 (
    echo.
    echo 正在尝试自动打开微信开发者工具...
    start wechatdevtools --open "%~dp0front"
    echo 如果微信开发者工具未自动打开，请手动操作
) else (
    echo.
    echo 未找到wechatdevtools命令，请手动打开微信开发者工具
)

pause