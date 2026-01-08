<#
.SYNOPSIS
    Base64 encoding utility for PowerShell.

.DESCRIPTION
    Converts strings to Base64 encoded format using Unicode (UTF-16LE) encoding.
    Accepts pipeline input for easy integration with other commands.

.PARAMETER String
    The string to encode to Base64.

.EXAMPLE
    "Hello World" | Encode-Base64
    # Returns: SABlAGwAbABvACAAVwBvAHIAbABkAA==

.EXAMPLE
    Encode-Base64 -String "Test"
    # Returns: VABlAHMAdAA=

.NOTES
    Uses Unicode (UTF-16LE) encoding, not UTF-8
    For UTF-8 encoding, modify to use [System.Text.Encoding]::UTF8
#>

function Encode-Base64{
    param([parameter(ValueFromPipeline)]$String);
    $String=[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($string));
    return $String
    }
    
