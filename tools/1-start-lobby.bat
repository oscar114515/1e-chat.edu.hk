@echo off
chcp 65001 >nul
setlocal
title 1E Lobby 服務（自動重啟）

REM ═══════════════════════════════════════════════════════════
REM  1E 班網站 — WebSocket 服務啟動器
REM  放在 lobby.js 同一個資料夾，雙擊即可。
REM  崩潰會自動 5 秒後重啟，不會整晚挂掉。
REM ═══════════════════════════════════════════════════════════

cd /d "%~dp0"

REM ── 找 node.exe（三個可能位置）──────────────────────────────
set "NODE_EXE="
if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE if exist "C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-6\node.exe" set "NODE_EXE=C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"
if not defined NODE_EXE (
  where node >nul 2>&1 && set "NODE_EXE=node"
)
if not defined NODE_EXE (
  echo [錯誤] 找不到 node.exe，請先安裝 Node.js
  echo.
  pause
  exit /b 1
)

REM ── 確認 lobby.js 在附近 ────────────────────────────────────
if not exist "%~dp0lobby.js" (
  echo [錯誤] 這個資料夾找不到 lobby.js
  echo 請把這個 .bat 放到 lobby.js 同一個資料夾再雙擊。
  echo.
  echo 目前資料夾：%~dp0
  pause
  exit /b 1
)

echo.
echo ================================================
echo   1E Lobby 服務
echo   Node: %NODE_EXE%
echo   目錄: %~dp0
echo   時間: %date% %time%
echo ================================================
echo.

:loop
echo [%date% %time%] 啟動 lobby.js ...
"%NODE_EXE%" lobby.js
echo.
echo [%date% %time%] 服務結束（代碼 %ERRORLEVEL%），5 秒後重啟 ...
timeout /t 5 /nobreak >nul
goto loop
