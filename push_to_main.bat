@echo off
title SISD Comment Assistant - Git Push Automator
color 0B
echo =====================================================================
echo  SISD Teacher Portal - Git Push Automator
echo =====================================================================
echo.
echo [+] Step 1: Running production build verification...
echo.
call npm run build
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [x] ERROR: Production build failed! 
    echo [x] Commit and push aborted to maintain branch stability.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [+] Step 2: Staging all modified files...
git add .
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [x] ERROR: Staging failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [+] Step 3: Committing changes with description...
git commit -m "feat(comments): update comments.json structure with separate strength/improvement subdivisions and update CommentGenerator UI"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] NOTE: Nothing to commit or commit failed. Continuing to push...
)

echo.
echo [+] Step 4: Pushing changes to remote main branch...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Warning: Push to origin main failed, attempting standard upstream push...
    git push
)

if %ERRORLEVEL% eq 0 (
    color 0A
    echo.
    echo =====================================================================
    echo  SUCCESS: All updates pushed to the remote main branch!
    echo =====================================================================
) else (
    color 0C
    echo.
    echo [x] ERROR: Git push failed! Please check your network or repository rights.
)
echo.
pause
