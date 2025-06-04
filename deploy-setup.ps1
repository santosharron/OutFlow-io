# OutFlo Deployment Setup Script for Windows PowerShell

Write-Host "🚀 OutFlo Deployment Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Initialize git repository if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Add all files except those in .gitignore
Write-Host "📁 Adding files to Git..." -ForegroundColor Yellow
git add .

# Check git status
Write-Host "`n📊 Git Status:" -ForegroundColor Cyan
git status

# Create initial commit
Write-Host "`n💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: OutFlo Campaign Management System - Backend: Node.js/Express with TypeScript - Frontend: React with TypeScript and Tailwind CSS - Features: Campaign management, LinkedIn integration, OpenAI integration - Ready for deployment on Railway, Render, or Vercel"

Write-Host "✅ Initial commit created" -ForegroundColor Green

# Instructions for GitHub
Write-Host "`n🌐 Next Steps for GitHub:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com and create a new repository" -ForegroundColor White
Write-Host "2. Name it 'outflo-campaign-management' or similar" -ForegroundColor White
Write-Host "3. Don't initialize with README (we already have one)" -ForegroundColor White
Write-Host "4. Copy the repository URL" -ForegroundColor White
Write-Host "5. Run these commands:" -ForegroundColor White
Write-Host "   git remote add origin [your-repo-url]" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray

Write-Host "`n🔐 Environment Variables Reminder:" -ForegroundColor Yellow
Write-Host "- Your .env files are protected by .gitignore" -ForegroundColor White
Write-Host "- Use .env.example files as templates" -ForegroundColor White
Write-Host "- Set environment variables in your deployment platform" -ForegroundColor White

Write-Host "`n🚀 Deployment Platforms:" -ForegroundColor Magenta
Write-Host "1. Railway (recommended): https://railway.app" -ForegroundColor White
Write-Host "2. Render: https://render.com" -ForegroundColor White
Write-Host "3. Vercel (frontend): https://vercel.com" -ForegroundColor White

Write-Host "`n📖 For detailed deployment instructions, see DEPLOYMENT.md" -ForegroundColor Green 