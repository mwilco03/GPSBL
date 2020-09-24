function Set-GitProject {
    param (
        $GitServer,
        $Header = $GitHeader
    )
    $api = "/api/v4/projects"
    $uri = "https://"+$GitServer+$API
    $project = Invoke-RestMethod -Uri $uri -Headers $Header
    $GitProject = $project | Select-Object name_with_namespace,name,id|Out-GridView -OutputMode Single 
    $script:GitRepo = $uri+"/"+$GitProject.id+"/repository"
    Write-Host -ForegroundColor Green -BackgroundColor Black "Wrote `$GitRepo var"
}

function Set-PrivateToken {
    param(
        $token
    )
    $Script:GitHeader=@{"PRIVATE-TOKEN" = $token}
    Write-Host -ForegroundColor Green -BackgroundColor Black "Wrote `$GitHeader var"
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
        Invoke-RestMethod -Uri $URI -Headers $Header
    }
    else{
        Get-RepoFileList | Out-GridView -PassThru |
        ForEach-Object{
            $URI = $GitRepo + "/files/" + $_.path + "/raw" + "?ref=" + $Branch
            Invoke-RestMethod -Uri $URI -Headers $Header
        }
    }
}
