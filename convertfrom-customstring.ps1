function ConvertFrom-CustomString {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline=$true)]
        [string]$InputString
    )

    process {
        if ($InputString -ne $null) {
            $pattern = '(?:"(?:\\.|[^"\\])*"|\[(?:\\.|[^\]\\])*]|\((?:\\.|[^\\)])*\)|\{(?:\\.|[^\\}])*\}|\S+)'
            $matches = [regex]::Matches($InputString, $pattern)
            $tokens = @()
            
            foreach ($match in $matches) {
                $token = $match.Value
                
                # Remove surrounding quotes or delimiters and unescape any escaped characters
                switch -Regex ($token) {
                    '^".*"$' { $token = $token.Substring(1, $token.Length - 2) -replace '\\"', '"' }
                    '^\[.*\]$' { $token = $token.Substring(1, $token.Length - 2) -replace '\\\]', ']' }
                    '^\(.*\)$' { $token = $token.Substring(1, $token.Length - 2) -replace '\\\)', ')' }
                    '^\{.*\}$' { $token = $token.Substring(1, $token.Length - 2) -replace '\\\}', '}' }
                }

                $tokens += $token
            }

            # Create a custom object with properties P1, P2, P3, ...
            $obj = New-Object -TypeName PSObject
            for ($i = 0; $i -lt $tokens.Count; $i++) {
                Add-Member -InputObject $obj -MemberType NoteProperty -Name ("P" + ($i + 1)) -Value $tokens[$i]
            }
            
            return $obj
        }
    }
}
