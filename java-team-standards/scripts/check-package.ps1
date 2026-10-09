#requires -Version 7.2
[CmdletBinding()]
param([switch]$Rebuild, [switch]$SelfTest)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$packageRoot = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$prefix = 'java-team-standards/'
$archivePath = Join-Path $packageRoot 'java-team-standards.zip'

# 固定维护范围；IDE、target、测试、缓存及 ZIP 自身不会进入分发包。
$skillFiles = @(
    'java-team-development/SKILL.md', 'java-team-development/references/initialization.md',
    'multi-center-code-review/SKILL.md', 'multi-center-code-review/references/standards.md',
    'multi-center-code-review/references/practical-rules.md', 'multi-center-code-review/references/mysql-schema.md',
    'multi-center-code-review/references/java-project-practices.md', 'multi-center-code-review/references/redis-standards.md'
)
$sources = @('README.md', 'INSTALL.md', 'rules.md', 'evaluations/README.md', 'scripts/check-package.ps1') + $skillFiles
$exampleRoot = Join-Path $packageRoot 'examples/reference-service'
$sources += @('.editorconfig', '.gitignore', 'README.md', 'pom.xml', 'checkstyle.xml') |
    ForEach-Object { 'examples/reference-service/' + $_ }
$sourceRoot = Join-Path $exampleRoot 'src/main'
if (Get-ChildItem -LiteralPath $sourceRoot -Recurse -Force |
    Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) {
    throw '参考工程含符号链接或目录联接，停止打包。'
}
$sources += Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Force |
    Where-Object { $_.Extension -in '.java', '.properties' } |
    ForEach-Object { [IO.Path]::GetRelativePath($packageRoot, $_.FullName).Replace('\', '/') }
$sources = @($sources | Sort-Object -Unique)

function Assert-PackagePath([string]$path) {
    $fullPath = [IO.Path]::GetFullPath($path)
    if ($fullPath -ne $packageRoot -and
        -not $fullPath.StartsWith($packageRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "路径超出规范包：$path"
    }
    for ($node = $fullPath; $node.Length -ge $packageRoot.Length; $node = Split-Path $node -Parent) {
        if ((Test-Path -LiteralPath $node) -and
            ((Get-Item -LiteralPath $node -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw "符号链接或目录联接：$node"
        }
        if ($node -eq $packageRoot) { break }
    }
}

function Get-PackageBytes([string]$path) {
    $encoding = [Text.UTF8Encoding]::new($false, $true)
    $content = $encoding.GetString([IO.File]::ReadAllBytes($path))
    $content = $content.Replace(([string][char]13 + [char]10), [string][char]10)
    return ,($encoding.GetBytes($content))
}

$documents = @{}
foreach ($relative in $sources) {
    $path = Join-Path $packageRoot $relative
    Assert-PackagePath $path
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "缺少源文件：$relative" }
    if ($relative.EndsWith('.md')) { $documents[$relative] = [IO.File]::ReadAllText($path) }
}
$version = [regex]::Match($documents['INSTALL.md'], '(?m)^版本：([0-9]+\.[0-9]+\.[0-9]+)').Groups[1].Value
if (-not $version) { throw 'INSTALL.md 未声明版本。' }
$installStateVersion = [regex]::Match($documents['INSTALL.md'], '`version` 写 `([0-9]+\.[0-9]+\.[0-9]+)`').Groups[1].Value
if ($installStateVersion -ne $version) { throw '安装状态示例的 version 与当前包版本不同。' }
$versionFiles = @('INSTALL.md', 'evaluations/README.md') + @($skillFiles | Where-Object { $_ -match 'references/(?!initialization)' })
foreach ($relative in $versionFiles) {
    $declared = [regex]::Match($documents[$relative], '(?m)^版本[^0-9\r\n]*([0-9]+\.[0-9]+\.[0-9]+)').Groups[1].Value
    if ($declared -ne $version) { throw "版本不一致：$relative ($declared / $version)" }
}
if (-not $documents['README.md'].Contains("版本 **$version**")) { throw 'README 版本不一致。' }
foreach ($relative in $skillFiles) {
    if (-not $documents['INSTALL.md'].Contains("| $relative | .agents/skills/$relative |")) {
        throw "安装映射缺失：$relative"
    }
}

$ruleText = $documents['multi-center-code-review/references/practical-rules.md']
$rules = @([regex]::Matches($ruleText, '(?m)^## ([A-Z]+-[0-9]{3})：') | ForEach-Object { $_.Groups[1].Value })
$catalog = @([regex]::Matches($ruleText, '(?m)^\| ([A-Z]+-[0-9]{3}) \|') | ForEach-Object { $_.Groups[1].Value })
if ($rules.Count -ne (@($rules | Sort-Object -Unique)).Count -or
    (Compare-Object $rules $catalog -CaseSensitive) -or
    -not $documents['README.md'].Contains("$($rules.Count) 条可执行规则")) {
    throw '规则标题、目录或 README 数量不一致。'
}
foreach ($relative in $documents.Keys) {
    foreach ($match in [regex]::Matches($documents[$relative], '\b[A-Z]+-[0-9]{3}\b')) {
        if ($match.Value -ne 'SHA-256' -and $match.Value -cnotin $rules) {
            throw "未知规则编号：$relative -> $($match.Value)"
        }
    }
}

function Get-Anchors([string]$markdown) {
    $seen = @{}
    foreach ($heading in [regex]::Matches($markdown, '(?m)^#{1,6} (.+)$')) {
        $slug = $heading.Groups[1].Value.Trim().ToLowerInvariant() -replace '[^\p{L}\p{N}\p{M}_\-\s]', '' -replace '\s', '-'
        if ($seen.ContainsKey($slug)) { $seen[$slug]++; "$slug-$($seen[$slug])" }
        else { $seen[$slug] = 0; $slug }
    }
}
foreach ($relative in $documents.Keys) {
    # 忽略代码块中的安装模板；rules.md 的引用以安装后的项目根目录为基准。
    $body = [regex]::Replace($documents[$relative], '(?ms)^```[^\r\n]*\r?\n.*?^```[^\r\n]*(?:\r?\n|$)', '')
    foreach ($link in [regex]::Matches($body, '\[[^\]\r\n]*\]\(([^)\r\n]+)\)')) {
        $href = $link.Groups[1].Value.Trim('<', '>')
        if ($href -match '^[a-zA-Z][a-zA-Z0-9+.-]*:') { continue }
        if ($relative -eq 'INSTALL.md' -and $href -eq '../AGENTS.md') { continue } # 生成到 .codebuddy 的入口
        $parts = $href.Split('#', 2)
        $target = [Uri]::UnescapeDataString($parts[0])
        if ($relative -eq 'rules.md') { $target = $target -replace '^\.agents/skills/', '' }
        $targetPath = if (-not $target) { Join-Path $packageRoot $relative }
            else { Join-Path (Split-Path (Join-Path $packageRoot $relative) -Parent) $target }
        Assert-PackagePath $targetPath
        $targetRelative = [IO.Path]::GetRelativePath($packageRoot, $targetPath).Replace('\', '/')
        if ($targetRelative -cnotin $sources) { throw "无效相对引用：$relative -> $href" }
        if ($parts.Count -eq 2 -and $parts[1] -and
            [Uri]::UnescapeDataString($parts[1]) -cnotin @(Get-Anchors $documents[$targetRelative])) {
            throw "无效标题引用：$relative -> $href"
        }
    }
}

function Test-Archive([string]$path) {
    $zip = [IO.Compression.ZipFile]::OpenRead($path)
    try {
        $names = @($zip.Entries | ForEach-Object { $_.FullName })
        if ($names.Count -ne $sources.Count -or (Compare-Object $names @($sources | ForEach-Object { $prefix + $_ }) -CaseSensitive)) {
            throw 'ZIP 条目与固定维护范围不同（缺失、重复或多余文件）。'
        }
        foreach ($relative in $sources) {
            $stream = $zip.GetEntry($prefix + $relative).Open()
            try { $entryHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)) }
            finally { $stream.Dispose() }
            [byte[]]$sourceBytes = Get-PackageBytes (Join-Path $packageRoot $relative)
            $sourceHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($sourceBytes))
            if ($entryHash -ne $sourceHash) {
                throw "ZIP 内容不同：$relative"
            }
        }
    } finally { $zip.Dispose() }
}

Assert-PackagePath $archivePath
if ($Rebuild) {
    $temporaryArchive = Join-Path $packageRoot ('.package-' + [Guid]::NewGuid().ToString('N') + '.zip')
    try {
        $zip = [IO.Compression.ZipFile]::Open($temporaryArchive, [IO.Compression.ZipArchiveMode]::Create)
        try {
            foreach ($relative in $sources) {
                $stream = $zip.CreateEntry(($prefix + $relative), [IO.Compression.CompressionLevel]::Optimal).Open()
                try {
                    [byte[]]$sourceBytes = Get-PackageBytes (Join-Path $packageRoot $relative)
                    $stream.Write($sourceBytes, 0, $sourceBytes.Length)
                } finally { $stream.Dispose() }
            }
        } finally { $zip.Dispose() }
        Test-Archive $temporaryArchive
        Move-Item -LiteralPath $temporaryArchive -Destination $archivePath -Force
    } finally {
        if (Test-Path -LiteralPath $temporaryArchive) { Remove-Item -LiteralPath $temporaryArchive -Force }
    }
}
Test-Archive $archivePath

if ($SelfTest) {
    # 可运行负例：损坏副本内容必须被哈希检查拒绝；不修改正式 ZIP。
    $fixture = Join-Path ([IO.Path]::GetTempPath()) ('java-team-package-' + [Guid]::NewGuid().ToString('N') + '.zip')
    try {
        Copy-Item -LiteralPath $archivePath -Destination $fixture
        $zip = [IO.Compression.ZipFile]::Open($fixture, [IO.Compression.ZipArchiveMode]::Update)
        try {
            $zip.GetEntry($prefix + 'README.md').Delete()
            $writer = [IO.StreamWriter]::new($zip.CreateEntry($prefix + 'README.md').Open())
            try { $writer.Write('deliberately corrupted self-check content') } finally { $writer.Dispose() }
        } finally { $zip.Dispose() }
        $rejected = $false
        try { Test-Archive $fixture } catch {
            if ($_.Exception.Message -ne 'ZIP 内容不同：README.md') { throw }
            $rejected = $true
        }
        if (-not $rejected) { throw '负例未被拒绝。' }
        Write-Output '自检通过：损坏 ZIP 内容被拒绝。'
    } finally {
        if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture -Force }
    }
}
Write-Output "检查通过：版本 $version，$($rules.Count) 条规则，$($sources.Count) 个分发文件；引用、安装映射与 ZIP 字节一致。"
