param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$DeployArgs
)

$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

$Message = ""
for ($i = 0; $i -lt $DeployArgs.Count; $i++) {
  $arg = $DeployArgs[$i]
  if ($arg -eq "--") {
    continue
  }

  if (($arg -eq "-Message" -or $arg -eq "--message") -and ($i + 1) -lt $DeployArgs.Count) {
    $Message = $DeployArgs[$i + 1]
    $i++
    continue
  }

  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = $arg
  }
}

function Invoke-Step {
  param(
    [string]$Title,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "==> $Title" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $Title"
  }
}

Invoke-Step "Build production bundle" {
  pnpm build
}

$changes = git status --porcelain
if ($changes) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    throw "Git changes exist. Re-run with: pnpm deploy:all `"your commit message`""
  }

  Invoke-Step "Stage changes" {
    git add -A
  }

  Invoke-Step "Commit changes" {
    git commit -m $Message
  }

  $branch = (git branch --show-current).Trim()
  if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Could not determine current git branch."
  }

  Invoke-Step "Push $branch to GitHub" {
    git push -u origin $branch
  }
} else {
  Write-Host ""
  Write-Host "No git changes to commit." -ForegroundColor Yellow
}

Invoke-Step "Deploy Cloudflare Pages" {
  pnpm dlx wrangler@latest pages deploy dist --project-name zhangjunjie-personal-website --commit-dirty=true
}

Write-Host ""
Write-Host "All deployments finished." -ForegroundColor Green
