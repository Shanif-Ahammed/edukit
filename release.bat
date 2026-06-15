@echo off
setlocal enabledelayedexpansion
title SISD EduKit - Release Manager
echo ==================================================
echo          SISD EduKit - Release Manager
echo ==================================================
echo.

:: Step 1: Verification
echo [1/3] Verifying environment...

:: Search for Git in common install directories and temporarily add to PATH
where git >nul 2>nul
if %ERRORLEVEL% equ 0 (
    goto :GIT_FOUND
)

if exist "C:\Program Files\Git\cmd\git.exe" (
    set "PATH=!PATH!;C:\Program Files\Git\cmd"
    goto :GIT_FOUND
)

if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "PATH=!PATH!;C:\Program Files (x86)\Git\cmd"
    goto :GIT_FOUND
)

if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" (
    set "PATH=!PATH!;%USERPROFILE%\AppData\Local\Programs\Git\cmd"
    goto :GIT_FOUND
)

for /d %%d in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%d\resources\app\git\cmd\git.exe" (
        set "PATH=!PATH!;%%d\resources\app\git\cmd"
        goto :GIT_FOUND
    )
)

:: If not found anywhere, ask to install via winget
echo [ERROR] Git is not installed or not in your system PATH.
echo.
echo 1. Download and install Git from: https://git-scm.com/
echo 2. Or let this script install it automatically using Windows Package Manager (winget).
echo.
set /p "INSTALL_GIT=Would you like to install Git automatically now? (Y/N): "
if /i "!INSTALL_GIT!"=="Y" (
    echo.
    echo [ACTION] Installing Git via winget...
    winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
    if !ERRORLEVEL! equ 0 (
        echo.
        echo [SUCCESS] Git installed successfully!
        echo [ACTION] Please RESTART your command prompt / terminal and run this script again.
        pause
        exit /b 0
    ) else (
        echo [ERROR] winget installation failed. Please install Git manually from https://git-scm.com/
    )
)
goto :EOF_ERROR

:GIT_FOUND
echo [SUCCESS] Git is available.

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in your system PATH.
    echo Please install Node.js and try again.
    goto :EOF_ERROR
)
echo [SUCCESS] npm is available.

:: Check for package.json
if not exist "package.json" (
    echo [ERROR] package.json not found in this folder.
    echo Please run this script from the project root directory.
    goto :EOF_ERROR
)

:: Verify if this is a Git repository
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] This directory is not a Git repository.
    echo [ACTION] Initializing local Git repository...
    git init
)

:: Step 2: Choose the release target branch
echo.
echo [2/3] Choose the release target:
echo.
echo    [1] main      - Commit and push the source code to the main branch
echo    [2] gh-pages  - Build the site and deploy it to GitHub Pages
echo.
set /p "TARGET=Enter your choice (1 or 2): "
if "%TARGET%"=="1" goto :PUSH_MAIN
if "%TARGET%"=="2" goto :DEPLOY_PAGES
echo.
echo [ERROR] Invalid choice "%TARGET%". Please run again and enter 1 or 2.
goto :EOF_ERROR


:: ==================================================
::  OPTION 1: PUSH SOURCE CODE TO MAIN
:: ==================================================
:PUSH_MAIN
echo.
echo [3/3] Releasing to the MAIN branch...
echo.
echo [ACTION] Running production build verification...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Production build failed!
    echo [ERROR] Commit and push aborted to maintain branch stability.
    goto :EOF_ERROR
)
echo [SUCCESS] Build verified.

echo.
echo [ACTION] Staging all modified files...
git add -A
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Staging failed!
    goto :EOF_ERROR
)

echo.
set /p "COMMIT_MSG=Enter a commit message (leave blank for default): "
if "!COMMIT_MSG!"=="" set "COMMIT_MSG=chore: update SISD EduKit source"

git commit -m "!COMMIT_MSG!"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [NOTE] Nothing to commit or commit failed. Continuing to push...
)

echo.
echo [ACTION] Pulling latest changes from remote main to stay up to date...
git pull --rebase origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Pull failed! This could be due to network issues or merge conflicts.
    echo Please resolve manually (e.g. run 'git pull --rebase origin main') and try again.
    goto :EOF_ERROR
)

echo.
echo [ACTION] Pushing changes to remote main branch...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] Push to origin main failed, attempting standard upstream push...
    git push
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Git push failed! Please check your network or repository rights.
        goto :EOF_ERROR
    )
)

echo.
echo ==================================================
echo   SUCCESS: SOURCE CODE PUSHED TO MAIN BRANCH!
echo ==================================================
echo.
pause
exit /b 0


:: ==================================================
::  OPTION 2: BUILD AND DEPLOY TO GH-PAGES
:: ==================================================
:DEPLOY_PAGES
echo.
echo [3/3] Releasing to the GH-PAGES branch...

:: Get remote URL
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set REMOTE_URL=%%i

if "%REMOTE_URL%"=="" (
    echo.
    echo [NOTICE] No Git Remote 'origin' is configured.
    set /p "REMOTE_URL=Please enter your GitHub Repo URL (e.g. https://github.com/username/repo.git): "
)

if "%REMOTE_URL%"=="" (
    echo [ERROR] Remote URL is required to push to GitHub Pages.
    goto :EOF_ERROR
)

echo [SUCCESS] Remote URL set to: %REMOTE_URL%

:: Run the production build
echo.
echo [ACTION] Building React project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed! Please resolve compilation errors.
    goto :EOF_ERROR
)
echo [SUCCESS] Build completed successfully.

:: Prepare the release directory
echo.
echo [ACTION] Preparing the release folder (dist)...
if not exist "dist" (
    echo [ERROR] Output 'dist' directory not found. Build may have failed silently.
    goto :EOF_ERROR
)

:: Create .nojekyll to ensure GitHub Pages does not ignore underscore directories
echo. > dist\.nojekyll
echo [SUCCESS] Created .nojekyll bypass file.

:: Copy index.html to 404.html to serve as fallback for SPA client-side routes
copy /y dist\index.html dist\404.html >nul
echo [SUCCESS] Created 404.html SPA router fallback file.

:: Publish build to gh-pages branch
echo.
echo [ACTION] Deploying build directory to GitHub Pages...
cd dist

:: Initialize a temp repo in the build folder
git init
git checkout -B gh-pages
git add -A
git commit -m "Deploy to GitHub Pages (automated release script)"

echo.
echo [ACTION] Force pushing build to gh-pages branch...
git push -f "%REMOTE_URL%" gh-pages:gh-pages
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Push failed. Check your network, credentials, or remote URL permissions.
    cd ..
    goto :EOF_ERROR
)

echo.
echo ==================================================
echo    DEPLOYMENT SUCCESSFUL! YOUR SITE IS LIVE!
echo ==================================================
echo.
cd ..
pause
exit /b 0

:EOF_ERROR
echo.
echo ==================================================
echo                RELEASE FAILED
echo ==================================================
echo.
pause
exit /b 1
