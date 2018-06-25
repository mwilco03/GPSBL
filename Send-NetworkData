###I barrowed this code###
function Send-NetworkData {[CmdletBinding()]
    param([Parameter(Mandatory)]
              [string]$Server,
          [Parameter(Mandatory)]
              [ValidateRange(1, 65535)][Int16]$Port,
          [Parameter(ValueFromPipeline)][string[]]$Data,
          [System.Text.Encoding]$Encoding = [System.Text.Encoding]::ASCII,[TimeSpan]$Timeout = [System.Threading.Timeout]::InfiniteTimeSpan
          );
    
    begin {
        $Client = New-Object -TypeName System.Net.Sockets.TcpClient;$Client.Connect($Server, $Port);
        $Stream = $Client.GetStream();
        $Writer = New-Object -Type System.IO.StreamWriter -ArgumentList $Stream, $Encoding, $Client.SendBufferSize, $true
        };
    process {foreach ($Line in $Data){$Writer.WriteLine($Line)}}
        end {
        $Writer.Flush();
        $Writer.Dispose();
        $Client.Client.Shutdown('Send');
        $Stream.ReadTimeout = [System.Threading.Timeout]::Infinite;
        if ($Timeout -ne [System.Threading.Timeout]::InfiniteTimeSpan) {$Stream.ReadTimeout = $Timeout.TotalMilliseconds};
                $Result = '';
                $Buffer = New-Object -TypeName System.Byte[] -ArgumentList $Client.ReceiveBufferSize;
    do {
        try {$ByteCount = $Stream.Read($Buffer, 0, $Buffer.Length)} 
        catch [System.IO.IOException] {$ByteCount = 0}
        if ($ByteCount -gt 0) {$Result += $Encoding.GetString($Buffer, 0, $ByteCount)}
       } 
    while ($Stream.DataAvailable -or $Client.Client.Connected);
    Write-Output $Result;$Stream.Dispose();$Client.Dispose();}}
