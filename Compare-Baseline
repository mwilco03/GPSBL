function Compare-Baseline{param(
    [Parameter(Mandatory)][string]$DataBase,
    [Parameter(Mandatory)][string]$BaseLineTable,
    [Parameter(Mandatory)][string]$CollectionTable,    
    [Parameter(Mandatory)][string]$Columns
    )
    sqlps
    $ENV:PSModulePath += ';C:\Program Files\Microsoft SQL Server\110\Tools\PowerShell\Modules\SQLPS'
    $qry="SELECT "+$Columns+" FROM ["+$DataBase+"].[dbo].["+$CollectionTable+"] EXCEPT SELECT "+$Columns+" FROM ["+$DataBase+"].[dbo].["+$BaseLineTable+"]"
    Invoke-SqlCmd -Query $qry -Database $DataBase
}
