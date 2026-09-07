@echo off
echo ===================================================
echo   AquaSentinel - Automatic Setup & Repair Script
echo ===================================================
echo.

echo 1. Pulling latest code from GitHub (origin/main)...
git fetch origin main
git reset --hard origin/main

echo.
echo 2. Checking environment configuration...
if not exist .env.local (
    copy .env.example .env.local
    echo    Created .env.local from template.
) else (
    echo    .env.local already present.
)

echo.
echo 3. Checking for corrupted Antigravity AI hook configs...
if exist "%USERPROFILE%\.gemini\config\hooks.json" (
    del /f /q "%USERPROFILE%\.gemini\config\hooks.json"
    echo    Cleared corrupted AI hooks.json config.
)

echo.
echo 4. Installing node_modules dependencies...
call npm install

echo.
echo ===================================================
echo   Setup Complete! Starting development server...
echo ===================================================
call npm run dev
