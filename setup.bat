@echo off
title ZeroTrace Setup Wizard
color 0a

echo ===================================================
echo     ZeroTrace - Secure P2P Communication System
echo          Professional Deployment Setup
echo ===================================================
echo.
echo [1/4] Initializing Environment...
echo.

if not exist client (
    echo Error: 'client' directory not found.
    pause
    exit
)
if not exist server (
    echo Error: 'server' directory not found.
    pause
    exit
)

echo [2/4] Installing Server Dependencies...
cd server
call npm install
echo.
echo [Server] Configuring Database...
call npx prisma generate
call npx prisma db push
cd ..
echo.

echo [3/4] Installing Client Dependencies...
cd client
call npm install
echo.
echo [Client] Building Production Bundle...
call npm run build
cd ..
echo.

echo [4/4] Cleanup & Finalization...
echo.
echo ===================================================
echo         Setup Completed Successfully!
echo ===================================================
echo.
echo To start the application, run 'start_app.bat'
echo.
pause
