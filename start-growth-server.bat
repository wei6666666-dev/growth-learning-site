@echo off
setlocal

cd /d "%~dp0"

echo Growth local web app
echo.
echo Keep this window open while using the website.
echo Home:    http://127.0.0.1:8000/index.html
echo Physics: http://127.0.0.1:8000/physics.html
echo Phone:   http://YOUR-PC-IP:8000/index.html
echo.

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8000 --bind 0.0.0.0
  goto :end
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m http.server 8000 --bind 0.0.0.0
  goto :end
)

echo Python was not found.
echo Install Python or use VS Code Live Server to run index.html.

:end
pause
