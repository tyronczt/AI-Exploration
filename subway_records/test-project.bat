@echo off
echo 正在测试地铁打卡记录小程序项目完整性...
echo ==================================================
echo.

echo 1. 检查项目目录结构...
if exist "front\app.json" (
    echo ✅ 前端配置文件存在
) else (
    echo ❌ 前端配置文件缺失
)

if exist "back\src\index.js" (
    echo ✅ 后端主文件存在
) else (
    echo ❌ 后端主文件缺失
)

if exist "back\src\mysql-schema.sql" (
    echo ✅ 数据库模式文件存在
) else (
    echo ❌ 数据库模式文件缺失
)

echo.
echo 2. 检查启动脚本...
if exist "start-backend.bat" (
    echo ✅ 后端启动脚本存在
) else (
    echo ❌ 后端启动脚本缺失
)

if exist "start-frontend.bat" (
    echo ✅ 前端启动脚本存在
) else (
    echo ❌ 前端启动脚本缺失
)

echo.
echo 3. 检查资源文件...
if exist "front\src\assets\icons\home.png" (
    echo ✅ TabBar图标存在
) else (
    echo ❌ TabBar图标缺失
)

if exist "front\src\assets\images\default-avatar.png" (
    echo ✅ 默认头像存在
) else (
    echo ❌ 默认头像缺失
)

echo.
echo 4. 检查关键页面...
set pages=index checkin records analysis profile station success
for %%p in (%pages%) do (
    if exist "front\src\pages\%%p\%%p.js" (
        echo ✅ %%p 页面存在
    ) else (
        echo ❌ %%p 页面缺失
    )
)

echo.
echo 5. 检查后端路由...
if exist "back\src\routes\users.js" (
    echo ✅ 用户路由存在
) else (
    echo ❌ 用户路由缺失
)

if exist "back\src\routes\checkins.js" (
    echo ✅ 打卡路由存在
) else (
    echo ❌ 打卡路由缺失
)

echo.
echo 项目完整性测试完成！
echo 如果所有项目都显示✅，说明项目结构完整。
pause