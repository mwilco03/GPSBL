function Get-USB {
    $USB=Get-WmiObject Win32_USBControllerDevice -Impersonation Impersonate -Authentication PacketPrivacy|%{[Wmi]$_.Dependent}|select -Property Manufacturer,Name,Present,Service,DeviceID,PNPClass,ClassGuid,
        @{Name="host";Expression={$env:COMPUTERNAME}},
        @{Name="ts";Expression={Get-Date -Format "o"}};
    # `# KING OF THE JUICE! #` #
   return $USB}
