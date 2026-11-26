# start-server.ps1 —— 零依赖本地静态服务器
# 仅需 Windows 自带 PowerShell，无需安装 Python / Node。
# 用法：双击同目录下的「启动服务.cmd」，或执行  powershell -File start-server.ps1
# 停止：在运行窗口按 Ctrl+C（或直接关闭窗口）

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8765

$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'application/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.md'    = 'text/markdown; charset=utf-8'
  '.txt'   = 'text/plain; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.gif'   = 'image/gif'
  '.webp'  = 'image/webp'
  '.ico'   = 'image/x-icon'
  '.mp3'   = 'audio/mpeg'
  '.woff'  = 'font/woff'
  '.woff2' = 'font/woff2'
}

function Send-Response {
  param($stream, $code, $ctype, $bytes)
  $status = 'OK'
  if ($code -eq 404) { $status = 'Not Found' }
  if ($code -eq 403) { $status = 'Forbidden' }
  $header = "HTTP/1.1 $code $status`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($hb, 0, $hb.Length)
  if ($bytes.Length -gt 0) { $stream.Write($bytes, 0, $bytes.Length) }
  $stream.Flush()
}

try {
  $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
  $listener.Start()
} catch {
  Write-Host "端口 $port 启动失败：$($_.Exception.Message)"
  Write-Host "可在本脚本开头把 `$port 改成其他端口再试。"
  exit 1
}

Write-Host "=============================================="
Write-Host "  静态服务已启动:  http://127.0.0.1:$port/"
Write-Host "  根目录: $root"
Write-Host "  停止: 按 Ctrl+C 或关闭本窗口"
Write-Host "=============================================="

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 10000
    $reader = New-Object System.IO.StreamReader($stream)
    $requestLine = $reader.ReadLine()
    while ($true) {
      $line = $reader.ReadLine()
      if ($null -eq $line -or $line -eq '') { break }
    }
    if ($null -eq $requestLine -or $requestLine -notmatch '^GET\s+(\S+)') {
      $client.Close()
      continue
    }
    $rawPath = [System.Uri]::UnescapeDataString(($Matches[1] -split '[?#]')[0])
    $rawPath = $rawPath.TrimStart('/')
    if ($rawPath -eq '' -or $rawPath.EndsWith('/')) {
      $rawPath = $rawPath + 'index.html'
    }
    $full = [System.IO.Path]::GetFullPath((Join-Path $root ($rawPath -replace '/', '\')))
    $rootFull = [System.IO.Path]::GetFullPath($root)

    if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
      Send-Response $stream 403 'text/plain; charset=utf-8' ([System.Text.Encoding]::UTF8.GetBytes('Forbidden'))
    } elseif (Test-Path -LiteralPath $full -PathType Container) {
      $idx = Join-Path $full 'index.html'
      if (Test-Path -LiteralPath $idx -PathType Leaf) {
        Send-Response $stream 200 'text/html; charset=utf-8' ([System.IO.File]::ReadAllBytes($idx))
      } else {
        Send-Response $stream 404 'text/plain; charset=utf-8' ([System.Text.Encoding]::UTF8.GetBytes('Not Found'))
      }
    } elseif (Test-Path -LiteralPath $full -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ctype = 'application/octet-stream'
      if ($mime.ContainsKey($ext)) { $ctype = $mime[$ext] }
      Send-Response $stream 200 $ctype ([System.IO.File]::ReadAllBytes($full))
    } else {
      Send-Response $stream 404 'text/plain; charset=utf-8' ([System.Text.Encoding]::UTF8.GetBytes('Not Found'))
    }
  } catch {
    # 单个请求出错直接忽略，不影响后续
  } finally {
    try { $client.Close() } catch { }
  }
}
