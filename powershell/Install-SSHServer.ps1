# Set execution policy for the current process without confirmation prompts
Set-ExecutionPolicy Bypass -Scope Process -Force

# Ensure TLS 1.2 is enabled for secure web communications
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072

# Install Chocolatey using their community script
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Define a function to comment lines containing a specified string in a file
function Comment-LinesWithSearchString {
    param(
        [Parameter(Mandatory)][string]$FilePath,       # Path to the file
        [Parameter(Mandatory)][string]$SearchString    # String to search for in the file
    )
    # Read, process, and overwrite the file
    (Get-Content $FilePath) | ForEach-Object {
        if ($_ -match $SearchString) {
            "#$_"  # Prefix line with '#' if it contains the search string
        } else {
            $_    # Leave other lines unchanged
        }
    } | Set-Content $FilePath  # Write the changes back to the same file
    Write-Host "File updated: $FilePath"
}

# Install OpenSSH capabilities if they're not already installed
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*' | ForEach-Object {
    Add-WindowsCapability -Online -Name $_.name
}

# Configure SSH services to start automatically and start them
Get-Service | Where-Object Name -Like '*ssh*' | ForEach-Object {
    Set-Service -Name $_.name -StartupType Automatic
    Start-Service -Name $_.name
}

# Create the .ssh directory and authorized_keys file, set permissions
mkdir .ssh | Out-Null
New-Item -Value "" -Path .ssh/authorized_keys
icacls.exe .ssh /inheritance:r /grant "`"$env:username`:f`" /grant "SYSTEM:f"

# Comment out specific lines in the sshd_config file
"Match Group admin", "administrators_authorized_keys" | ForEach-Object {
    Comment-LinesWithSearchString -FilePath 'C:\ProgramData\ssh\sshd_config' -SearchString $_
}

# Install Nano editor using Chocolatey and exit
powershell choco install nano-win -y ; exit;

Get-Service | Where-Object Name -Like '*ssh*' | ForEach-Object {
    ReStart-Service -Name $_.name
}
