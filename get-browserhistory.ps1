
function Publish-Instructions {
    param ([string]$filePath)
    Write-Output @"
------------------------------
Execute the following from the
Run commands prompt in falcon
------------------------------
get "$filePath"
rm "$filePath"
"@
}
function Publish-Api {
    param ([string]$filePath)
    $apiContent = @"
{"more_commands": ["get $filePath","rm $filePath"]}
"@
    Write-Output $apiContent
}
function Copy-FileWithStructure {
    param (
        [Parameter(Mandatory=$true)]
        [string]$SourceFilePath, 
        [Parameter(Mandatory=$true)]
        [string]$DestinationBasePath 
    )
    if (-not (Test-Path -Path $SourceFilePath -PathType Leaf)) {
        Write-Error "Source file does not exist."
        return
    }
    $SourceDirectory = Split-Path -Path $SourceFilePath -Parent
    $RelativePath = $SourceDirectory -replace [regex]::Escape((Get-Item -Path $SourceDirectory).PSDrive.Root), ''
    $DestinationPath = Join-Path -Path $DestinationBasePath -ChildPath $RelativePath
    if (-not (Test-Path -Path $DestinationPath)) {
        New-Item -Path $DestinationPath -ItemType Directory | Out-Null
    }
    $DestinationFilePath = Join-Path -Path $DestinationPath -ChildPath (Split-Path -Path $SourceFilePath -Leaf)
    Copy-Item -Path $SourceFilePath -Destination $DestinationFilePath
}
function Get-BrowserHistoryFiles {
    $HistFiles = Get-ChildItem -Path "C:\Users\" -Directory | ForEach-Object {
        $userDir = $_.FullName
        $searchPaths = "AppData\Local", "AppData\Roaming" | ForEach-Object { Join-Path -Path $userDir -ChildPath $_ }
        $searchPaths | ForEach-Object {
            Get-ChildItem -Path $_ -File -Recurse -ErrorAction SilentlyContinue | Where-Object {
                ($_.Name -match "history" -or $_.Name -eq "places.sqlite") -and
                ($_.FullName -match "brave|edge|firefox|vivaldi|opera|chrome|chromium|centbrowser|maxthon|iridium|palemoon") -and
                ($_.FullName -notmatch "extensions")
            } | Select-Object -ExpandProperty FullName
        }
    }
    return $HistFiles
}
function Test-TmpDir {
    param($DestinationPath)
    if (-not (Test-Path -Path $DestinationPath)) {
        New-Item -Path $DestinationPath -ItemType Directory
    }
}
function Get-BrowserHistory {
    param ([switch]$API)
    $DestinationPath="/tmp/"
    Test-TmpDir -DestinationPath $DestinationPath
    Get-BrowserHistoryFiles|%{Copy-FileWithStructure $_ -DestinationBasePath $DestinationPath}
    Compress-Archive -Path "/tmp/Users" -DestinationPath $("/tmp/" + $env:computername + ".zip") -Force
    Remove-Item -Recurse -Force /tmp/Users
    $File = get-childitem /tmp/$env:computername*
    if($API){
        Publish-Api -filePath $File
    }
    else {
        Publish-Instructions -filePath $File
    }
}

Get-BrowserHistory
