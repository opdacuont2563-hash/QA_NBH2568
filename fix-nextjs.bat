@echo off
echo ========================================
echo Fix Next.js 16 Issues for SurgiBot
echo ========================================
echo.

echo [Option 1] Downgrade to stable Next.js 14 (Recommended)
echo [Option 2] Keep Next.js 16 with fixes
echo.
set /p choice="Choose option (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Downgrading to Next.js 14...
    echo.
    
    REM Remove old packages
    rmdir /s /q node_modules
    rmdir /s /q .next
    del package-lock.json
    
    REM Install stable Next.js 14
    call npm uninstall next react react-dom
    call npm install next@14.2.21 react@18.3.1 react-dom@18.3.1
    call npm install --save-dev @types/react@18.3.18 @types/react-dom@18.3.5 @types/node@22.10.6
    
    echo.
    echo Creating next.config.js for Next.js 14...
    copy next.config.js.v14 next.config.js
    
    echo.
    echo ✅ Downgrade complete! Run: npm run dev
    
) else if "%choice%"=="2" (
    echo.
    echo Fixing Next.js 16 configuration...
    echo.
    
    REM Update next.config.js for v16
    copy next.config.js.v16 next.config.js
    
    echo.
    echo Starting with Turbopack flag...
    echo Run: npm run dev -- --turbopack
    echo.
    echo Or add this script to package.json:
    echo "dev": "next dev --turbopack"
    
) else (
    echo Invalid choice. Please run again and select 1 or 2.
)

pause
