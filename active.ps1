Start-Transcript -Path "C:\Path\To\Your\LogFile.txt" -Append

function Ask-Mack {
    param([string]$text, [switch]$NewLine)
    for ($i = 0; $i -lt $text.Length; $i++) { 
        Write-Host $text[$i] -ForegroundColor (@("Red","Yellow","Green","Cyan","Blue","Magenta")[$i % 6]) -NoNewline 
    }
    if ($NewLine) { Write-Host "" }
}

function Activate-Win {
    param([string]$caption)
    Ask-Mack "Ask Mack for this : "
    $hstName = Read-Host
    $commands = @("-upk", "-ipk W269N-WFGWX-YVC9B-4J6C9-T83GX", "-skms $hstName", "-ato", "-dlv")
    foreach ($cmd in $commands) {
        Start-Process "slmgr.vbs" -ArgumentList $cmd -Wait
        switch ($cmd.split()[0]) {
            "-upk" { Write-Host "Uninstalling Old Key" -ForegroundColor Green }
            "-ipk" { Write-Host "Install New Key" -ForegroundColor Green }
            "-skms" { Write-Host "Setting Server" -ForegroundColor Green }
            "-ato" { Write-Host "Activating" -ForegroundColor Green }
            "-dlv" { Write-Host "Displaying Info" -ForegroundColor Green }
        }
        Start-Sleep -Seconds 3
    }
    $newOs = (Get-CimInstance -ClassName Win32_OperatingSystem).Caption
    if ($caption -ne $newOs){Write-Host "Version Has Changed" -ForegroundColor Green }
    Write-Host $("New Version: $newOs") -ForegroundColor Yellow
    if ($newOs -like "*Pro*" -or $newOs -like "*Enterprise*" -or $newOs -like "*Education*") {
        Write-Host "Windows is activated and the version is supported." -ForegroundColor Green
        return $true
    } else {
        Write-Host "Windows activation failed or unsupported version." -ForegroundColor Red
        return $false
    }
}

function Enable-BLC {
    try {
        $tpm = Get-WmiObject -Namespace "Root\CIMv2\Security\MicrosoftTpm" -Class Win32_Tpm
        if ($tpm.IsEnabled -eq $true -and $tpm.IsActivated -eq $true) {
            Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector -UsedSpaceOnly
            Write-Host "TPM detected. BitLocker enabled on C: (used space only) with TPM." -ForegroundColor Green
        } else {
            $password = Read-Host -AsSecureString "No TPM detected. Enter password for BitLocker"
            Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -PasswordProtector -UsedSpaceOnly -Password $password
            Write-Host "BitLocker enabled on C: (used space only) with password." -ForegroundColor Green
        }
    } catch {
        Write-Host "Failed to enable BitLocker. Error: $_" -ForegroundColor Red
    }
}

function Check-BLStat {
    try {
        $status = Get-BitLockerVolume -MountPoint "C:"
        if ($status.ProtectionStatus -eq 'On') {
            Write-Host "BitLocker is enabled on C:. Encryption: $($status.EncryptionPercentage)%" -ForegroundColor Green
        } else {
            Write-Host "BitLocker is not enabled on C:." -ForegroundColor Red
        }
    } catch {
        Write-Host "Failed to retrieve BitLocker status. Error: $_" -ForegroundColor Red
    }
}

# Main Logic
$os = (Get-CimInstance -ClassName Win32_OperatingSystem).Caption
$currentKey = (Get-CimInstance -Namespace root\cimv2 -ClassName SoftwareLicensingService).OA3xOriginalProductKey
Write-Host "Current Key: $currentKey" -ForegroundColor Yellow
Write-Host "Current Version: $os " -ForegroundColor Yellow

if (Activate-Win $os) {
    Ask-Mack "This will now encrypt drive. Are you sure? : "
    $crypto = Read-Host
    if ($crypto -like "y*") {
        Enable-BLC
        Check-BLStat
    } else {
        Write-Host "Bailed out" -ForegroundColor Red
    }
} else {
    Write-Host "BitLocker will not be enabled because Windows activation failed." -ForegroundColor Red
}

Stop-Transcript
