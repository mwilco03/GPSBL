<#
.SYNOPSIS
    Base64 decoding and Windows clipboard utilities.

.DESCRIPTION
    Provides three utility functions:
    - Decode-Base64: Convert Base64 strings back to ASCII text
    - Set-ClipboardText: Copy text to Windows clipboard
    - Get-ClipboardText: Retrieve text from Windows clipboard

.FUNCTIONS
    Decode-Base64     - Decode Base64 to ASCII string (pipeline enabled)
    Set-ClipboardText - Set clipboard content (handles large text via temp file)
    Get-ClipboardText - Get current clipboard text content

.EXAMPLE
    "SGVsbG8gV29ybGQ=" | Decode-Base64
    # Returns: Hello World

.EXAMPLE
    Set-ClipboardText -text "Copy this to clipboard"
    Get-ClipboardText

.NOTES
    Clipboard functions require Windows Forms assembly
    Spawns child PowerShell process in STA mode for clipboard access
#>

function Decode-Base64{
    param([parameter(ValueFromPipeline=$true)]$String);
    $String=[Text.Encoding]::ASCII.GetString([Convert]::fromBase64String($String));
    return $String
    }
function Set-ClipboardText {
        param($text)
 
        # need to use temp file to avoid exceeding command-line length limit
        $temp = [io.path]::GetTempFileName()
 
        try {
            set-content -Path $temp -Value $text
 
            $command = {
                    add-type -an system.windows.forms
                    [System.Windows.Forms.Clipboard]::SetText((get-content $args))
            }
             
            powershell -sta -noprofile -command $command -args $temp
 
        } finally {
            if ((test-path $temp)) {
                remove-item $temp
            }
        }
}
 
function Get-ClipboardText {
        $command = {
                add-type -an system.windows.forms
                [System.Windows.Forms.Clipboard]::GetText()
        }
        powershell -sta -noprofile -command $command
}
