# Run this ONCE on YOUR computer in PowerShell (not in a shared chat).
# Sets GitHub Actions secrets for the Notion main-push workflow.
# Repo: https://github.com/Aurora-091/venus-ai
#
# Usage (from repo root):
#   pwsh -File scripts/set-github-secrets.ps1
#
# You will be prompted to paste the Notion integration secret and the database id.
# Nothing is printed back to the screen or committed to git.

$ErrorActionPreference = "Stop"
$repo = "Aurora-091/venus-ai"

# Verify gh
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    Write-Error "Install GitHub CLI: https://cli.github.com/  Then run: gh auth login"
}

Write-Host "Checking GitHub login..."
& gh auth status
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Paste your Notion Internal Integration secret (ntn_... or secret_...), then press Enter."
Write-Host "It will be hidden as you type in most terminals, or use paste carefully."
$tokenSecure = Read-Host -AsSecureString "NOTION_TOKEN"
$tokenBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($tokenSecure)
$notionToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto($tokenBstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenBstr)
$notionToken = $notionToken.Trim()

if ([string]::IsNullOrWhiteSpace($notionToken)) {
    Write-Error "No token provided."
}

Write-Host ""
Write-Host "Paste NOTION_DATABASE_ID only: the 32 hex chars from the database URL, no ?v= part."
$dbId = Read-Host "NOTION_DATABASE_ID"
$dbId = $dbId.Trim().Split("?")[0].Trim()

if ([string]::IsNullOrWhiteSpace($dbId)) {
    Write-Error "No database id provided."
}

Write-Host ""
Write-Host "Setting NOTION_TOKEN on $repo ..."
$notionToken | & gh secret set NOTION_TOKEN --repo $repo
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Setting NOTION_DATABASE_ID on $repo ..."
$dbId | & gh secret set NOTION_DATABASE_ID --repo $repo
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done. List (names only):"
& gh secret list --repo $repo

Write-Host ""
Write-Host "Next: push to main or open Actions -> Notion main push log to verify."
