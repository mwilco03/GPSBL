function Connect-GitLab{
    [void][Reflection.Assembly]::LoadWithPartialName('Microsoft.VisualBasic')
    $Title = "Token"
    $Message = "Enter Private Token"
    $Token = [Microsoft.VisualBasic.Interaction]::InputBox($Message,$Title)
    Set-PrivateToken -Token $Token
    $Title = "GitLab"
    $Message = "Enter GitLab Server"
    $Git = [Microsoft.VisualBasic.Interaction]::InputBox($Message,$Title)
    Set-GitServer -GitServer $Git
    Set-GitProject
    Get-RepoRawFiles
}
function Set-GitProject {
    param (
        $GitServer = $GitServer,
        $Header = $GitHeader
    )
    $api = "/api/v4/projects"
    $uri = "https://"+$GitServer+$API
    $project = Invoke-RestMethod -Uri $uri -Headers $Header
    $GitProject = $project | Select-Object name_with_namespace,name,id|Out-GridView -OutputMode Single 
    $script:GitRepo = $uri+"/"+$GitProject.id+"/repository"
    Write-Host -ForegroundColor Green -BackgroundColor Black "Wrote `$GitRepo $GitRepo"
}
fucntion Set-GitServer{
    param(
        $GitServer
    )
    try {
        if(Test-GitConnection -GitServer $GitServer){
            -ForegroundColor Green -BackgroundColor Black "Wrote `$GitServer $GitServer"
            $Script:GitServer = $GitServer
        }
    }   
    catch{
        Write-Host $Error
    }
}
function Test-GitConnection{
    param(
        $GitServer,
        $TimeOut=50,
        $Port=443
    )
    $RequestCallBack = $State = $null
    $Client = New-Object System.Net.Sockets.TcpClient
    $Connect = $Client.BeginConnect($GitServer,$Port,$RequestCallBack,$State)
    Start-Sleep -Milliseconds $TimeOut
    Return [System.Convert]::ToBoolean(($Client.connected))
}
function Set-PrivateToken {
    param(
        $Token
    )
    $Script:GitHeader=@{"PRIVATE-TOKEN" = $token}
    Write-Host -ForegroundColor Green -BackgroundColor Black "Wrote `$GitHeader $GitHeader"
}

function Get-RepoFileList {
    param (
        $GitRepo = $GitRepo,
        $Header = $GitHeader
    )
    $URI = $GitRepo + "/tree"
    $GitTree = Invoke-RestMethod -Uri $URI -Headers $Header 
    return $GitTree
}

function Get-RepoRawFiles {
    param (
        $File,
        $Branch = "master",
        $GitRepo = $GitRepo,
        $Header = $GitHeader
    )
    if($File){
        $URI = $GitRepo + "/files/" + $File + "/raw" + "?ref=" + $Branch
        Invoke-RestMethod -Uri $URI -Headers $Header |Tee-Object -FilePath $File
    }
    else{
        Get-RepoFileList | Out-GridView -PassThru |
        ForEach-Object{
            $URI = $GitRepo + "/files/" + $_.path + "/raw" + "?ref=" + $Branch
            Invoke-RestMethod -Uri $URI -Headers $Header | Tee-Object -FilePath $_.path
        }
    }
}
