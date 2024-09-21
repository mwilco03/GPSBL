Start-Transcript 
function Ask-Mack {
    param([string]$text, [switch]$NewLine)
    for ($i = 0; $i -lt $text.Length; $i++) { 
        Write-Host $text[$i] -ForegroundColor (@("Red","Yellow","Green","Cyan","Blue","Magenta")[$i % 6]) -NoNewline 
    }
    if($NewLine) { Write-Host "" }
}

function Get-WinVer {
    switch ((Get-CimInstance -ClassName Win32_OperatingSystem).OperatingSystemSKU) {
        48 { "Pro" }
        49 { "Pro N" }
        96 { "Edu" }
        97 { "Edu N" }
        98 { "Ent 2015 LTSB" }
        99 { "Ent 2015 LTSB N" }
        121 { "Pro Wks" }
        122 { "Pro Wks N" }
        125 { "Pro Edu" }
        126 { "Pro Edu N" }
        4  { "Ent" }
        Default { "Unsupported Version" }
    }
}

function Activate-Win {
    Ask-Mack "Ask Mack for this : "
    $hstName = Read-Host
    $commands = @("-upk", "-ipk W269N-WFGWX-YVC9B-4J6C9-T83GX", "-skms $hstName", "-ato", "-dlv")
    foreach ($cmd in $commands) {
        Start-Process "slmgr.vbs" -ArgumentList $cmd -Wait
        switch($cmd.split()[0]){
            "-upk" {Write-host "Uninstall Key"  -ForegroundColor Yellow}
            "-ipk" {Write-Host "Install New Key"  -ForegroundColor Yellow}
            "-skms" {Write-Host "Server Set" -ForegroundColor Yellow}
            "-ato" {Write-Host "Uninstall Key" -ForegroundColor Yellow}
            "-dlv" {Write-Host "Display Lic" -ForegroundColor Yellow}
        Start-Sleep 10
    }
    if ((Get-CimInstance -ClassName Win32_OperatingSystem).OperatingSystemSKU -in  4, 48, 96, 98, 121, 125) { Write-Host "Windows activated successfully." -ForegroundColor Green; return $true }
    else { Write-Host "Windows activation failed." -ForegroundColor Red; return $false }
}


function Enable-BLC {
    $tpm = Get-WmiObject -Namespace "Root\CIMv2\Security\MicrosoftTpm" -Class Win32_Tpm
    if ($tpm.IsEnabled -eq $true -and $tpm.IsActivated -eq $true) {
        Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector -UsedSpaceOnly
        Write-Host "TPM detected. BitLocker enabled on C: (used space only) with TPM." -ForegroundColor Green
    } else {
        $password = Read-Host -AsSecureString "No TPM detected. Enter password for BitLocker"
        Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -PasswordProtector -UsedSpaceOnly -Password $password
        Write-Host "BitLocker enabled on C: (used space only) with password." -ForegroundColor Green
    }
}

function Check-BLStat {
    $status = Get-BitLockerVolume -MountPoint "C:"
    if ($status.ProtectionStatus -eq 'On') {Write-Host "BitLocker is enabled on C:. Encryption: $($status.EncryptionPercentage)%." -ForegroundColor Green} 
    else {Write-Host "BitLocker is not enabled on C:." -ForegroundColor Red}
}

# Main Logic
Write-Host "Current Key: $((Get-WmiObject -Query "Select OA3xOriginalProductKey from SoftwareLicensingService").OA3xOriginalProductKey)" -NoNewline -ForegroundColor Yellow
Write-Host "Current Version: " -NoNewline -ForegroundColor Yellow
Write-Host $(Get-WinVer) -ForegroundColor Yellow

if (Activate-Win) {
Ask-Mack "This will now encrypt drive are you sure? : "
$Crypto=Read-host 
if($crypto -like "y*"){Enable-BLC; Check-BLStat} else { Write-host "Bailed out" -ForegroundColor Red}
else {Write-Host "BitLocker will not be enabled because Windows activation failed." -ForegroundColor Red}
}
