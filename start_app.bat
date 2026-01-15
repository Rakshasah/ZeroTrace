@echo off
title ZeroTrace System
color 0b

echo [SYSTEM] Starting Secure Backend Node...
start "ZeroTrace Server" /D "server" cmd /k "npm run dev"

echo [SYSTEM] Launching Client Interface...
start "ZeroTrace Client" /D "client" cmd /k "npm run dev"

echo.
echo [INFO] Systems Active.
echo [INFO] Backend: http://localhost:3000
echo [INFO] Frontend: http://localhost:5173
echo.
