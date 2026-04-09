@echo off
REM Check .NET Framework 4.7.2+ is installed

echo.
echo ========================================
echo .NET Framework Version Check
echo ========================================
echo.

reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release >nul 2>&1
if errorlevel 1 (
    echo [FAIL] .NET Framework 4.x is NOT installed
    echo        Install .NET Framework 4.7.2 or later
    goto :done
)

for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release ^| findstr Release') do set RELEASE=%%a

if %RELEASE% GEQ 461808 (
    echo [OK] .NET Framework 4.7.2 or later is installed (Release: %RELEASE%)
) else (
    echo [FAIL] .NET Framework version is too old (Release: %RELEASE%)
    echo        Install .NET Framework 4.7.2 or later
)

:done
echo.
pause
