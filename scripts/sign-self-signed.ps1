# Code-signing helper for the AdminHub21 desktop demo — SELF-SIGNED certificate.
#
#   .\scripts\sign-self-signed.ps1                      # create + export, print CSC_LINK
#   .\scripts\sign-self-signed.ps1 -InstallTrust        # ...and trust it on THIS machine
#   .\scripts\sign-self-signed.ps1 -Sign "path\to.exe"  # ...and sign one binary now
#
# Read this first, because it is the whole point of the script:
#
#   A self-signed certificate does NOT remove the SmartScreen warning for anyone
#   who downloads the .exe. Windows only trusts roots it ships with, or roots an
#   administrator installed. It is useful for machines you control — your own
#   PC, your team, a client's office you can push policy to — and useless for a
#   public download. The warning disappears only after the certificate is
#   imported into LocalMachine\Root AND LocalMachine\TrustedPublisher.
#
# For a public release you need a certificate from a CA Windows already trusts
# (or Azure Trusted Signing). Everything else about this script still applies:
# the base64 output is what you paste into the CSC_LINK secret.

[CmdletBinding()]
param(
    # Identity on the certificate. Keep it stable: changing it changes the thumbprint.
    [string]$Subject = "CN=AdminHub21 Demo, O=AdminHub21",

    # Where the .pfx / .cer land.
    [string]$OutDir = ".",

    # Base name for the exported files (adminhub21-demo.pfx / .cer).
    [string]$BaseName = "adminhub21-demo",

    # Password protecting the .pfx. Prompted for when omitted.
    [string]$PfxPassword,

    # Years the certificate stays valid.
    [int]$Years = 3,

    # Binary to sign with signtool right away (optional).
    [string]$Sign,

    # Import the certificate into LocalMachine Root + TrustedPublisher (needs admin).
    [switch]$InstallTrust,

    # Overwrite existing files instead of stopping.
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Step { param($Message) Write-Host "[*] $Message" -ForegroundColor Cyan }
function Write-Ok { param($Message) Write-Host "[+] $Message" -ForegroundColor Green }
function Write-Warn2 { param($Message) Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host "[x] $Message" -ForegroundColor Red }

# ── preconditions ────────────────────────────────────────────────────────────
if (-not $IsWindows -and $PSVersionTable.PSEdition -eq "Core" -and -not ($env:OS -eq "Windows_NT")) {
    Write-Err "This script needs Windows: it uses certutil/PKI cmdlets and signs Windows binaries."
    exit 1
}

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if ($InstallTrust -and -not $isAdmin) {
    Write-Err "-InstallTrust writes to LocalMachine, so it needs an elevated PowerShell (Run as Administrator)."
    exit 1
}

if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$OutDir = (Resolve-Path $OutDir).Path
$pfxPath = Join-Path $OutDir "$BaseName.pfx"
$cerPath = Join-Path $OutDir "$BaseName.cer"

if (-not $Force) {
    foreach ($path in @($pfxPath, $cerPath)) {
        if (Test-Path $path) {
            Write-Err "$path already exists. Re-run with -Force to replace it, or pick another -BaseName."
            exit 1
        }
    }
}

# ── password ─────────────────────────────────────────────────────────────────
if (-not $PfxPassword) {
    $secure = Read-Host -AsSecureString "Choose a password for the .pfx (you will paste it into the CSC_KEY_PASSWORD secret)"
} else {
    $secure = ConvertTo-SecureString -String $PfxPassword -Force -AsPlainText
}

if ($secure.Length -lt 8) {
    Write-Err "Use at least 8 characters — the .pfx protects the only key that signs your builds."
    exit 1
}

# ── 1. create the certificate ────────────────────────────────────────────────
# 2.5.29.37 = Extended Key Usage, 1.3.6.1.5.5.7.3.3 = Code Signing.
# Without that EKU the certificate cannot sign code, which is the single most
# common way this step goes wrong.
Write-Step "Creating a code-signing certificate for `"$Subject`"..."

$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject $Subject `
    -KeyUsage DigitalSignature `
    -KeyExportPolicy Exportable `
    -FriendlyName "AdminHub21 Demo signing" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears($Years) `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3")

Write-Ok "Created $($cert.Thumbprint) (valid until $($cert.NotAfter.ToString('yyyy-MM-dd')))"

# ── 2. export .pfx (private, for signing) and .cer (public, for trusting) ────
Write-Step "Exporting $pfxPath and $cerPath..."

Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $secure | Out-Null
Export-Certificate -Cert $cert -FilePath $cerPath | Out-Null

Write-Ok "Wrote $pfxPath"
Write-Ok "Wrote $cerPath"

# ── 3. the two values GitHub Actions needs ──────────────────────────────────
# electron-builder accepts the .pfx as a path, a URL, or base64. Base64 is the
# only form that fits in a repository secret, hence the conversion here.
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($pfxPath))

# ── 4. optionally trust it locally ──────────────────────────────────────────
if ($InstallTrust) {
    Write-Step "Importing into LocalMachine\Root and LocalMachine\TrustedPublisher..."

    # Both stores. Root alone is not enough: Authenticode validates the signer
    # against TrustedPublisher, and a "Valid" signature needs the chain to build.
    Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\LocalMachine\Root" | Out-Null
    Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\LocalMachine\TrustedPublisher" | Out-Null

    Write-Ok "Trusted on this machine. Downloaded copies still carry Mark-of-the-Web — run Unblock-File before checking."
}

# ── 5. optionally sign a binary now ─────────────────────────────────────────
if ($Sign) {
    $target = (Resolve-Path $Sign).Path
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }

    $signtoolPath = $null
    $onPath = Get-Command signtool.exe -ErrorAction SilentlyContinue

    if ($onPath) {
        $signtoolPath = $onPath.Source
    } else {
        # signtool ships with the Windows SDK, not with Windows itself.
        $kitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
        $kits = Get-ChildItem $kitsRoot -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending

        foreach ($kit in $kits) {
            $candidate = Join-Path $kit.FullName "x64\signtool.exe"
            if (Test-Path $candidate) {
                $signtoolPath = $candidate
                break
            }
        }
    }

    if (-not $signtoolPath) {
        Write-Warn2 "signtool.exe not found. Install the Windows SDK, or sign from git-bash with:"
        Write-Host "    signtool sign /f `"$pfxPath`" /p <password> /fd sha256 /tr http://timestamp.digicert.com /td sha256 `"$target`""
    } else {
        Write-Step "Signing $target..."

        & $signtoolPath sign `
            /f $pfxPath `
            /p $plain `
            /fd sha256 `
            /tr "http://timestamp.digicert.com" `
            /td sha256 `
            $target

        if ($LASTEXITCODE -eq 0) {
            Write-Ok "Signed. Verify with:"
            Write-Host "    Get-AuthenticodeSignature `"$target`" | Format-List Status, SignerCertificate"
        } else {
            Write-Err "signtool exited with $LASTEXITCODE."
        }
    }
}

# ── summary ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "GitHub Actions secrets" -ForegroundColor White
Write-Host "  Settings -> Secrets and variables -> Actions -> New repository secret" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  CSC_LINK          (base64 of the .pfx, copied to your clipboard)" -ForegroundColor White
Write-Host "  CSC_KEY_PASSWORD  (the password you just chose)" -ForegroundColor White
Write-Host ""

try {
    Set-Clipboard -Value $base64
    Write-Ok "CSC_LINK value copied to the clipboard ($($base64.Length) characters)."
} catch {
    Write-Warn2 "Could not access the clipboard. The base64 value is in $OutDir\CSC_LINK.txt"
    Set-Content -Path (Join-Path $OutDir "CSC_LINK.txt") -Value $base64 -NoNewline -Encoding ascii
}

Write-Host ""
Write-Warn2 "Keep $pfxPath and its password out of git. .gitignore already excludes *.pfx and *.cer."
Write-Warn2 "A self-signed certificate does NOT stop the SmartScreen warning on other people's machines."
Write-Host ""
Write-Host "Verify a build:" -ForegroundColor White
Write-Host "  Get-AuthenticodeSignature .\AdminHub21-Demo-1.0.0-portable.exe | Format-List Status, SignerCertificate"
