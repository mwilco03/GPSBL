<#
.SYNOPSIS
    Compare SQL Server tables to find differences from baseline.

.DESCRIPTION
    Compares a collection table against a baseline table in SQL Server
    using EXCEPT to find rows that exist in the collection but not in
    the baseline. Useful for detecting changes or anomalies.

.PARAMETER DataBase
    The SQL Server database name.

.PARAMETER BaseLineTable
    The table containing baseline/known-good data.

.PARAMETER CollectionTable
    The table containing current/collected data to compare.

.PARAMETER Columns
    Comma-separated list of columns to compare.

.EXAMPLE
    Compare-Baseline -DataBase "Security" -BaseLineTable "baseline_processes" `
                     -CollectionTable "current_processes" -Columns "Name,Path,Hash"

.NOTES
    Requires: SQL Server PowerShell module (SQLPS)
    WARNING: Columns parameter is not sanitized - SQL injection risk
#>

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
