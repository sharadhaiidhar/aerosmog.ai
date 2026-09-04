@echo off
echo.
echo ================================
echo   AeroSmog.AI Frontend
echo ================================
echo.
echo Make sure backend is running first! (start_server.bat in /backend)
echo.
cd /d "%~dp0"
npm run dev
pause
