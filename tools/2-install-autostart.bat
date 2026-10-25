@echo off
chcp 65001 >nul
setlocal
title 安裝：開機自動啟動 1E Lobby

REM ═══════════════════════════════════════════════════════════
REM  把「1-start-lobby.bat」註冊成開機任務
REM  · 雙擊即可，會自己彈 UAC（不用右鍵「以管理員身份執行」）
REM  · 以 SYSTEM 身份執行 → 不用登入桌面也會跑
REM  · 開機時觸發，不需要等任何人按鍵
REM  · 崩潰後由 start-lobby.bat 自己重啟
REM ═══════════════════════════════════════════════════════════

cd /d "%~dp0"

REM ── 自動提權：唔係管理員就重新以管理員開啟自己 ──
net session >nul 2>&1
if errorlevel 1 (
  echo 需要管理員權限，正在重新開啟...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" >nul 2>&1
  exit /b
)

echo.
echo ================================================
echo   安裝「開機自動啟動 1E Lobby」
echo ================================================
echo.

REM ── 檢查是否管理員 ─────────────────────────────────────────
net session >nul 2>&1
if errorlevel 1 (
  echo [需要管理員權限]
  echo 請在檔案上按右鍵 →「以管理員身份執行」
  echo.
  pause
  exit /b 1
)

REM ── 檢查兩個檔案都在 ───────────────────────────────────────
if not exist "%~dp01-start-lobby.bat" (
  echo [錯誤] 找不到 1-start-lobby.bat，請確認兩個檔案放在同一資料夾。
  pause
  exit /b 1
)
if not exist "%~dp0lobby.js" (
  echo [錯誤] 這裡找不到 lobby.js。
  echo 請把「1-start-lobby.bat」同「2-install-autostart.bat」一起放到 lobby.js 所在資料夾。
  echo 目前資料夾：%~dp0
  pause
  exit /b 1
)

set "TARGET=%~dp01-start-lobby.bat"

echo 任務名稱：1E-Lobby
echo 執行程式：%TARGET%
echo 觸發時機：開機時
echo 執行身份：SYSTEM（不用登入）
echo.

schtasks /create /tn "1E-Lobby" /tr "\"%TARGET%\"" /sc onstart /ru SYSTEM /rl HIGHEST /f
if errorlevel 1 (
  echo.
  echo [失敗] 建立任務出錯。請確認有管理員權限。
  pause
  exit /b 1
)

echo.
echo ── 立即試跑一次（不用等重開機）────────────────
schtasks /run /tn "1E-Lobby"
echo.

echo ================================================
echo   完成！
echo ================================================
echo.
echo   · 之後開機就會自動啟動，不需要登入桌面
echo   · 服務崩潰會自動重啟（5 秒後）
echo.
echo   現在就測試：
echo     1. 打開 chat.html → 小遊戲 → 開一局
echo     2. 如果連得上，代表服務跑起來了
echo.
echo   想確認服務在跑：
echo     tasklist ^| findstr node
echo.
echo   想取消開機自啟：
echo     schtasks /delete /tn "1E-Lobby" /f
echo.
pause
