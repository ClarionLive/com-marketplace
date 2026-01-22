@echo off
REM Test registration-free COM with manifests (Manual Testing Version)

echo ============================================
echo Testing Registration-Free COM Setup
echo ============================================
echo.
echo This script validates the DLL and manifest files
echo for registration-free COM deployment.
echo.

REM Get current directory (where DLL and manifest should be)
set DEPLOY_DIR=%~dp0

echo Checking required files...
echo.

set ALL_FILES_EXIST=1

if not exist "%DEPLOY_DIR%..\bin\GridControlCOM.dll" (
    echo ERROR: GridControlCOM.dll not found in bin directory
    set ALL_FILES_EXIST=0
) else (
    echo [OK] GridControlCOM.dll found
)

if not exist "%DEPLOY_DIR%GridControlCOM.manifest" (
    echo ERROR: GridControlCOM.manifest not found in resources directory
    set ALL_FILES_EXIST=0
) else (
    echo [OK] GridControlCOM.manifest found
)

REM Also check if the WRONG filename exists
if exist "%DEPLOY_DIR%GridControlCOM.dll.manifest" (
    echo.
    echo WARNING: Found GridControlCOM.dll.manifest - this is WRONG for Clarion!
    echo Clarion requires GridControlCOM.manifest (without .dll)
    echo Please rename GridControlCOM.dll.manifest to GridControlCOM.manifest
    echo.
    set ALL_FILES_EXIST=0
)

if %ALL_FILES_EXIST%==0 (
    echo.
    echo Missing or incorrectly named files for registration-free COM
    echo.
    echo The following files must be present:
    echo   - ..\bin\GridControlCOM.dll
    echo   - GridControlCOM.manifest (NOT GridControlCOM.dll.manifest!)
    echo.
    pause
    exit /b 1
)

echo.
echo All required files found.
echo.

REM Check if DLL is registered
echo Checking if DLL is currently registered with COM...
reg query "HKEY_CLASSES_ROOT\GridControlCOM.GridControl" >nul 2>&1
if %errorLevel% equ 0 (
    echo.
    echo WARNING: GridControlCOM.dll is currently REGISTERED with COM
    echo.
    echo WARNING: Registration interferes with registration-free COM activation!
    echo This component is designed for registration-free deployment only.
    echo For correct operation, the DLL must NOT be registered.
    echo.
    echo Press any key to continue testing anyway...
    pause >nul
) else (
    echo [OK] DLL is NOT registered (correct for registration-free COM)
)

echo.
echo ============================================
echo Manifest Validation
echo ============================================
echo.

REM Parse and validate manifest file
echo Checking GridControlCOM.manifest...

findstr /C:"8862E2C2-809F-421E-9785-6DDDE4335CBF" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
if %errorLevel% equ 0 (
    echo   [OK] Contains correct CLSID
) else (
    echo   [ERROR] CLSID not found
    echo   Expected: {8862E2C2-809F-421E-9785-6DDDE4335CBF}
)

findstr /C:"GridControlCOM.GridControl" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
if %errorLevel% equ 0 (
    echo   [OK] Contains correct ProgID
) else (
    echo   [ERROR] ProgID not found
    echo   Expected: GridControlCOM.GridControl
)

findstr /C:"clrClass" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
if %errorLevel% equ 0 (
    echo   [OK] Uses clrClass element (correct for .NET COM)
) else (
    echo   [WARNING] clrClass element not found - may use comClass instead
    findstr /C:"comClass" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
    if %errorLevel% equ 0 (
        echo   [ERROR] Uses comClass - this is WRONG for .NET COM components!
        echo   Should use clrClass element with runtimeVersion
    )
)

findstr /C:"runtimeVersion" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
if %errorLevel% equ 0 (
    echo   [OK] Runtime version specified
) else (
    echo   [WARNING] Runtime version not specified in manifest
)

findstr /C:"processorArchitecture=\"x86\"" "%DEPLOY_DIR%GridControlCOM.manifest" >nul
if %errorLevel% equ 0 (
    echo   [OK] Processor architecture set to x86
) else (
    echo   [ERROR] Processor architecture not x86
)

echo.
echo ============================================
echo File Timestamps
echo ============================================
echo.
echo Checking file dates...
dir "%DEPLOY_DIR%..\bin\GridControlCOM.*" /T:W
dir "%DEPLOY_DIR%GridControlCOM.*" /T:W

echo.
echo ============================================
echo Next Steps for Integration
echo ============================================
echo.
echo To use this COM component in your Clarion application:
echo.
echo 1. Copy these files to your Clarion application directory:
echo      - GridControlCOM.dll (from bin folder)
echo      - GridControlCOM.manifest (from resources folder)
echo.
echo 2. In your Clarion app, use this ProgId:
echo      GridControlCOM.GridControl
echo.
echo 3. Available COM methods include:
echo      - ExecuteQuery(query) - Load data from SQL query
echo      - SetConnection(...) - Configure database connection
echo      - GetCellValue(row, col) - Get cell value
echo      - SetCellValue(row, col, value) - Set cell value
echo      - SelectRow(index) - Select a row
echo      - SortByColumn(name, asc) - Sort by column
echo      - SetColumnFilter(name, text) - Filter by column
echo.
echo If COM creation fails, check:
echo   - .NET Framework 4.7.2+ is installed
echo   - Manifest file is correctly named (no .dll in the name)
echo   - Both DLL and manifest are in the same folder as your executable
echo   - The DLL is NOT registered (registration-free COM requirement)
echo.

pause
