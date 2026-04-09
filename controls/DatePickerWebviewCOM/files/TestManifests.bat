@echo off
REM WebView2 COM Control Manifest and Dependency Test

echo.
echo ========================================
echo WebView2 COM Control Validation
echo ========================================
echo.

set ERRORS=0

REM Check DLL
if exist "Clarion\accessory\bin\DatePickerWebviewCOM.dll" (
    echo [OK] DatePickerWebviewCOM.dll
) else (
    echo [MISSING] DatePickerWebviewCOM.dll
    set /a ERRORS+=1
)

REM Check Manifest
if exist "Clarion\accessory\resources\DatePickerWebviewCOM.manifest" (
    echo [OK] DatePickerWebviewCOM.manifest
) else (
    echo [MISSING] DatePickerWebviewCOM.manifest
    set /a ERRORS+=1
)

REM Check WebView2 Dependencies
if exist "Clarion\accessory\bin\Microsoft.Web.WebView2.Core.dll" (
    echo [OK] Microsoft.Web.WebView2.Core.dll
) else (
    echo [MISSING] Microsoft.Web.WebView2.Core.dll
    set /a ERRORS+=1
)

if exist "Clarion\accessory\bin\Microsoft.Web.WebView2.WinForms.dll" (
    echo [OK] Microsoft.Web.WebView2.WinForms.dll
) else (
    echo [MISSING] Microsoft.Web.WebView2.WinForms.dll
    set /a ERRORS+=1
)

if exist "Clarion\accessory\bin\WebView2Loader.dll" (
    echo [OK] WebView2Loader.dll
) else (
    echo [MISSING] WebView2Loader.dll
    set /a ERRORS+=1
)

if exist "Clarion\accessory\bin\Newtonsoft.Json.dll" (
    echo [OK] Newtonsoft.Json.dll
) else (
    echo [MISSING] Newtonsoft.Json.dll
    set /a ERRORS+=1
)

REM Check wwwroot folder
echo.
echo --- wwwroot Folder ---
if exist "Clarion\accessory\resources\wwwroot" (
    echo [OK] wwwroot folder exists
) else (
    echo [MISSING] wwwroot folder
    set /a ERRORS+=1
)

if exist "Clarion\accessory\resources\wwwroot\controls\datepickerwebviewcom\index.html" (
    echo [OK] wwwroot\controls\datepickerwebviewcom\index.html
) else (
    echo [MISSING] wwwroot\controls\datepickerwebviewcom\index.html
    set /a ERRORS+=1
)

if exist "Clarion\accessory\resources\wwwroot\controls\datepickerwebviewcom\app.js" (
    echo [OK] wwwroot\controls\datepickerwebviewcom\app.js
) else (
    echo [MISSING] wwwroot\controls\datepickerwebviewcom\app.js
    set /a ERRORS+=1
)

REM Check metadata files
echo.
echo --- Metadata Files ---
if exist "Clarion\accessory\resources\DatePickerWebviewCOM.header" (
    echo [OK] DatePickerWebviewCOM.header
) else (
    echo [MISSING] DatePickerWebviewCOM.header
    set /a ERRORS+=1
)

if exist "Clarion\accessory\resources\DatePickerWebviewCOM.DatePickerWebviewCOMControl.details" (
    echo [OK] DatePickerWebviewCOM.DatePickerWebviewCOMControl.details
) else (
    echo [MISSING] .details file
    set /a ERRORS+=1
)

echo.
echo ========================================
if %ERRORS%==0 (
    echo All checks passed!
) else (
    echo %ERRORS% issue(s) found.
)
echo ========================================

pause
