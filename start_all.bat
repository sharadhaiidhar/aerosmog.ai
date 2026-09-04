@echo off
echo.
echo ======================================
echo   AeroSmog.AI - Full Stack Launcher
echo ======================================
echo.
echo [1/2] Starting Backend (port 8000)...
start "AeroSmog Backend" cmd /k "cd /d %~dp0backend && C:\Users\DELL\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts\uvicorn.exe main:app --port 8000 --host 0.0.0.0"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (port 5173)...
start "AeroSmog Frontend" cmd /k "cd /d %~dp0frontend && node_modules\.bin\vite.cmd preview"

timeout /t 3 /nobreak >nul

echo.
echo ======================================
echo   Both servers are starting!
echo.
echo   Backend API:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   Frontend App: http://localhost:5173
echo ======================================
echo.
start "" "http://localhost:5173"
pause
