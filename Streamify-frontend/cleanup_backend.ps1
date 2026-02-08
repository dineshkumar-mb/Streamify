$port = 5001
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pid_to_kill = $conn.OwningProcess
        Write-Host "Killing process on port $port (PID: $pid_to_kill)"
        Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found on port $port"
}
