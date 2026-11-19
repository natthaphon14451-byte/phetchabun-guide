@echo off
title LINE Webhook Tunnel (Cloudflare)
cd /d "%~dp0"
echo =======================================================
echo   Starting Cloudflare Public Tunnel for LINE Webhook...
echo =======================================================
cloudflared.exe tunnel --url http://localhost:3000
pause
