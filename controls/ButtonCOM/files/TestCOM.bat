@echo off
REM Run the VBScript COM test

echo ============================================
echo Running GridControlCOM COM Test
echo ============================================
echo.

if not exist "TestCOM.vbs" (
    echo ERROR: TestCOM.vbs not found
    pause
    exit /b 1
)

cscript //NoLogo TestCOM.vbs

echo.
if %errorLevel% equ 0 (
    echo Test completed successfully
) else (
    echo Test failed - see error messages above
)

echo.
pause
