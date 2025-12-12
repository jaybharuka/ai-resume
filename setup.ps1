# =============================================================================
# AI RESUME TAILOR - Setup Script
# =============================================================================
# This script helps you set up the project step by step
# Run this after cloning the repository
# =============================================================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "AI RESUME TAILOR - Setup Wizard" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check if npm is installed
$npmVersion = npm --version 2>$null
Write-Host "npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Set up environment file
Write-Host "Step 2: Setting up environment file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "WARNING: .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You need to edit .env and add:" -ForegroundColor Cyan
    Write-Host "  1. DATABASE_URL - Your PostgreSQL connection string" -ForegroundColor White
    Write-Host "  2. OPENAI_API_KEY - Your OpenAI API key" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key after you've updated .env..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
Write-Host ""

# Step 3: Create uploads directory
Write-Host "Step 3: Creating uploads directory..." -ForegroundColor Yellow
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    Write-Host "Created uploads directory" -ForegroundColor Green
} else {
    Write-Host "Uploads directory already exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Database setup
Write-Host "Step 4: Setting up database..." -ForegroundColor Yellow
Write-Host "Generating Prisma client..." -ForegroundColor Gray
npm run postinstall
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing schema to database..." -ForegroundColor Gray
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push database schema!" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env" -ForegroundColor Red
    exit 1
}
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "======================================" -ForegroundColor Green
Write-Host "Setup Complete! ✓" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Test with a resume and job description" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - QUICKSTART.md - Quick start guide" -ForegroundColor White
Write-Host "  - SETUP.md - Detailed setup instructions" -ForegroundColor White
Write-Host "  - README.md - Full documentation" -ForegroundColor White
Write-Host ""
Write-Host "Would you like to start the dev server now? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Starting development server..." -ForegroundColor Green
    npm run dev
}
