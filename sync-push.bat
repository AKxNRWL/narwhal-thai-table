@echo off
cd /d "%~dp0"
if exist "%~dp0.git\index.lock" del /f /q "%~dp0.git\index.lock"
git config user.email "special.akusa@gmail.com"
git config user.name "Kunanan"
set "LOG=%~dp0deploy-log.txt"
echo Building + committing + syncing to GitHub... (log: deploy-log.txt)
echo === BUILD === > "%LOG%"
cd /d "%~dp0Narwhal Thai Table"
call npm run build >> "%LOG%" 2>&1
if errorlevel 1 goto failed
echo BUILD_OK >> "%LOG%"
cd /d "%~dp0"
echo === COMMIT === >> "%LOG%"
git add -A >> "%LOG%" 2>&1
set "MSG=%~1"
if "%MSG%"=="" set "MSG=Website update via sync-push"
git commit -m "%MSG%" >> "%LOG%" 2>&1
echo === FETCH+PUSH (reconcile) === >> "%LOG%"
git fetch origin >> "%LOG%" 2>&1
git push --force-with-lease origin main >> "%LOG%" 2>&1
echo PUSH_ERRORLEVEL=%errorlevel% >> "%LOG%"
git log --oneline -3 >> "%LOG%" 2>&1
echo === TRIGGER NETLIFY DEPLOY (build hook: claude-deploy) === >> "%LOG%"
curl -s -X POST -d "{}" https://api.netlify.com/build_hooks/6a77f34abb09f72d3955c755 >> "%LOG%" 2>&1
echo.
echo DONE. Netlify deploy triggered automatically -- no manual click needed.
echo Watch progress at https://app.netlify.com/projects/nrwlhb/deploys
echo (If errors, send deploy-log.txt to Claude.)
pause
exit /b 0
:failed
echo BUILD FAILED - see deploy-log.txt
pause
exit /b 1
