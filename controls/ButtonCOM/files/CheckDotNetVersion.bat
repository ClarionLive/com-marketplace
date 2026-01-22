@echo off
REM Check .NET Framework version for GridControlCOM

echo ============================================
echo .NET Framework Version Check for GridControlCOM
echo ============================================
echo.

REM Check for .NET Framework 4.7.2 or later
reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=3" %%i in ('reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release') do set RELEASE=%%i

    if %RELEASE% GEQ 528040 (
        echo [OK] .NET Framework 4.8 or later is installed
    ) else if %RELEASE% GEQ 461808 (
        echo [OK] .NET Framework 4.7.2 or later is installed
    ) else if %RELEASE% GEQ 461308 (
        echo [WARNING] .NET Framework 4.7.1 found - 4.7.2 or later recommended
    ) else (
        echo [ERROR] .NET Framework version too old
        echo Please install .NET Framework 4.7.2 or later
        echo Download: https://dotnet.microsoft.com/download/dotnet-framework
    )
) else (
    echo [ERROR] .NET Framework 4.x not found
    echo Please install .NET Framework 4.7.2 or later
    echo Download: https://dotnet.microsoft.com/download/dotnet-framework
)

echo.
echo GridControlCOM requires .NET Framework 4.7.2 or later
echo.
pause
