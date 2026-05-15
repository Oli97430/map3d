@echo off
title Map3D
color 0B
chcp 65001 >nul

:menu
cls
echo.
echo  ============================================================
echo                            MAP3D
echo            Generate 3D maps from OpenStreetMap data
echo  ============================================================
echo.
echo   [1]  Start dev server         (npm run dev)
echo   [2]  Build for production     (npm run build)
echo   [3]  Preview production build (npm run preview)
echo   [4]  Run tests                (npm test)
echo   [5]  Type-check               (npm run typecheck)
echo   [6]  Format code              (npm run format)
echo   [7]  Install dependencies     (npm install)
echo   [Q]  Quit
echo.
set /p choice="  Choose an option: "

if /i "%choice%"=="1" goto dev
if /i "%choice%"=="2" goto build
if /i "%choice%"=="3" goto preview
if /i "%choice%"=="4" goto test
if /i "%choice%"=="5" goto typecheck
if /i "%choice%"=="6" goto format
if /i "%choice%"=="7" goto install
if /i "%choice%"=="q" exit

goto menu

:dev
cls
echo  Starting dev server on http://localhost:5173 ...
echo.
call npm run dev
pause
goto menu

:build
cls
call npm run build
pause
goto menu

:preview
cls
echo  Previewing production build...
call npm run preview
pause
goto menu

:test
cls
call npm test
pause
goto menu

:typecheck
cls
call npm run typecheck
pause
goto menu

:format
cls
call npm run format
pause
goto menu

:install
cls
call npm install
pause
goto menu
