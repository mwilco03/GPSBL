<#
.SYNOPSIS
    Enumerate USB devices connected to the system.

.DESCRIPTION
    Retrieves information about all USB controller devices using WMI.
    Returns device details including manufacturer, name, device ID,
    and adds hostname and timestamp for logging/forensics purposes.

.OUTPUTS
    PSCustomObject with properties:
    - Manufacturer, Name, Present, Service, DeviceID, PNPClass, ClassGuid
    - host: Computer name
    - ts: ISO 8601 timestamp

.EXAMPLE
    Get-USB | Format-Table
    # Lists all USB devices with details

.EXAMPLE
    Get-USB | ConvertTo-Json | Out-File usb_inventory.json
    # Export USB inventory to JSON

.NOTES
    Uses WMI (Get-WmiObject) - consider updating to Get-CimInstance
    Useful for asset inventory and forensic collection
#>

function Get-USB {
    $USB=Get-WmiObject Win32_USBControllerDevice -Impersonation Impersonate -Authentication PacketPrivacy|%{[Wmi]$_.Dependent}|select -Property Manufacturer,Name,Present,Service,DeviceID,PNPClass,ClassGuid,
        @{Name="host";Expression={$env:COMPUTERNAME}},
        @{Name="ts";Expression={Get-Date -Format "o"}};
    # `# KING OF THE JUICE! #` #
   return $USB}
