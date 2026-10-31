@echo off
cd /d "D:\Odoo_Hackathon_2026"

echo ========================================================
echo [1/4] Initializing Git on D:\Odoo_Hackathon_2026...
echo ========================================================
git init -b main
git config user.name "Chandan Bagh"
git config user.email "cbagh0819@gmail.com"

echo.
echo [2/4] Staging and committing project files...
git add .
git commit -m "feat: initial hackathon scaffolding on D: drive, role rules, and evaluator info"

echo.
echo [3/4] Creating or pushing to GitHub repository odoo-hackathon-2026...
gh repo create odoo-hackathon-2026 --public --source=. --remote=origin --push

echo.
echo [4/4] Inviting Evaluators (sbbh-odoo and hackathon-odoo)...
gh api -X PUT /repos/cbagh0819-ctrl/odoo-hackathon-2026/collaborators/sbbh-odoo
gh api -X PUT /repos/cbagh0819-ctrl/odoo-hackathon-2026/collaborators/hackathon-odoo

echo.
echo ========================================================
echo SUCCESS! Your repository on D:\ is live:
echo https://github.com/cbagh0819-ctrl/odoo-hackathon-2026
echo Evaluators sbbh-odoo and hackathon-odoo have been invited!
echo ========================================================
pause
