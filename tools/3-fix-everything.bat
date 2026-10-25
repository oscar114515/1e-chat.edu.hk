@echo off
chcp 65001 >nul
setlocal
title 一鍵修復：網路位置 + WinRM + 開機自啟

REM ═══════════════════════════════════════════════════════════════
REM  為什麼需要這個：
REM  這台機器的「網路位置」不知何時變成了「公用網路」，
REM  Windows 在公用網路下預設拒絕所有入站連線
REM  → 遠端桌面 / WinRM / SSH / 檔案分享 / 8060 全部連不上
REM  → 只有 ping 還通（ICMP 有例外），所以看上去「機器冇事」
REM  → 於是自設伺服器從外面完全連不到
REM
REM  跑完這個腳本之後：
REM    · 網路位置改回「專用」
REM    · 開啟 WinRM（5985）
REM    · 裝好開機自啟任務（用同資料夾的 1-start-lobby.bat）
REM    · 立即啟動一次服務
REM
REM  ⚠ 只做一次，之後開機全自動
REM ═══════════════════════════════════════════════════════════════

cd /d "%~dp0"

REM ── 自動提權 ──
net session >nul 2>&1
if errorlevel 1 (
  echo 需要管理員權限，正在重新開啟...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" >nul 2>&1
  exit /b
)

echo.
echo ============================================================
echo   一鍵修復
echo ============================================================
echo.

REM ── 1. 網路位置改回「專用」──
echo [1/4] 檢查網路位置...
powershell -NoProfile -Command "Get-NetConnectionProfile | ForEach-Object { Write-Host ('    現在：' + $_.Name + ' = ' + $_.NetworkCategory) }"
echo.
echo     正在改為 Private（專用）...
powershell -NoProfile -Command "Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private -ErrorAction SilentlyContinue; Get-NetConnectionProfile | ForEach-Object { Write-Host ('    改後：' + $_.Name + ' = ' + $_.NetworkCategory) }"
echo.

REM ── 2. 開啟 WinRM ──
echo [2/4] 開啟 WinRM（遠端管理）...
powershell -NoProfile -Command "Enable-PSRemoting -Force -SkipNetworkProfileCheck" 2>nul
netsh advfirewall firewall add rule name="1E-WinRM-5985" dir=in action=allow protocol=TCP localport=5985 >nul 2>&1
netsh advfirewall firewall add rule name="1E-WinRM-5986" dir=in action=allow protocol=TCP localport=5986 >nul 2>&1
echo     完成（5985 / 5986 已放行）
echo.

REM ── 3. 裝開機自啟 ──
echo [3/4] 安裝開機自啟任務...
if not exist "%~dp01-start-lobby.bat" (
  echo     [跳過] 同資料夾找不到 1-start-lobby.bat
  echo            請先把它放在 lobby.js 旁邊
) else (
  if not exist "%~dp0lobby.js" (
    echo     [跳過] 這裡找不到 lobby.js
  ) else (
    schtasks /create /tn "1E-Lobby" /tr "\"%~dp01-start-lobby.bat\"" /sc onstart /ru SYSTEM /rl HIGHEST /f >nul 2>&1
    if errorlevel 1 (
      echo     [失敗] 建立任務出錯
    ) else (
      echo     完成（任務：1E-Lobby，以 SYSTEM 開機啟動）
      schtasks /run /tn "1E-Lobby" >nul 2>&1
      echo     已立即啟動服務
    )
  )
)
echo.

REM ── 4. 摘要 ──
echo [4/4] 現況
echo.
powershell -NoProfile -Command "Get-NetConnectionProfile | ForEach-Object { Write-Host ('    網路：' + $_.Name + ' = ' + $_.NetworkCategory) }"
powershell -NoProfile -Command "$s = Get-Service WinRM -ErrorAction SilentlyContinue; if ($s) { Write-Host ('    WinRM：' + $s.Status) } else { Write-Host '    WinRM：找不到服務' }"
echo.
tasklist /fi "imagename eq node.exe" 2>nul | findstr /i node >nul && echo     Node：正在執行 || echo     Node：未執行（如果 lobby.js 不在這個資料夾，屬正常）

echo.
echo ============================================================
echo   完成
echo ============================================================
echo.
echo   之後：開機自動啟動，不需要登入。
echo   遠端：現在應該連得上了。
echo.
echo   如果 Node 顯示「未執行」，代表 1-start-lobby.bat 不在
echo   這個資料夾，或者這個資料夾沒有 lobby.js。
echo.
pause
