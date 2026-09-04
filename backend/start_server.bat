@echo off
echo.
echo ================================
echo   AeroSmog.AI Backend Server
echo ================================
echo.
cd /d "%~dp0"
echo Starting FastAPI server on http://localhost:8000
echo API Docs at: http://localhost:8000/docs
echo.

REM Use the Python 3.13 uvicorn (installed in user packages)
set UVICORN=%LOCALAPPDATA%\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts\uvicorn.exe

if exist "%UVICORN%" (
    "%UVICORN%" main:app --reload --port 8000
) else (
    REM Fallback: try uvicorn from PATH
    uvicorn main:app --reload --port 8000
)
pause
