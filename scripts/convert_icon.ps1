Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\jakub\Downloads\icooo.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image dimensions: $($srcImage.Width) x $($srcImage.Height)"

$targetDirs = @(
    "d:\kinguin price tracker\src\renderer\public",
    "d:\kinguin price tracker\build",
    "d:\kinguin price tracker\resources"
)

foreach ($dir in $targetDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Function to resize image with high quality bicubic interpolation
function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height
    )
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $destImage = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $destImage.SetResolution($Image.HorizontalResolution, $Image.VerticalResolution)

    $g = [System.Drawing.Graphics]::FromImage($destImage)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $wrapMode = New-Object System.Drawing.Imaging.ImageAttributes
    $wrapMode.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $g.DrawImage($Image, $destRect, 0, 0, $Image.Width, $Image.Height, [System.Drawing.GraphicsUnit]::Pixel, $wrapMode)
    $g.Dispose()

    return $destImage
}

# Generate PNG byte arrays for ICO creation
$icoSizes = @(16, 24, 32, 48, 64, 128, 256)
$pngDataList = @()

foreach ($size in $icoSizes) {
    $resized = Resize-Image -Image $srcImage -Width $size -Height $size
    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    $resized.Dispose()

    $pngDataList += [PSCustomObject]@{
        Width = $size
        Height = $size
        Bytes = $bytes
    }
}

# Save PNG sizes to targets
$allPngSizes = @(16, 32, 48, 64, 128, 256, 512)
foreach ($dir in $targetDirs) {
    foreach ($size in $allPngSizes) {
        $resized = Resize-Image -Image $srcImage -Width $size -Height $size
        $outputPath = Join-Path $dir "icon-$($size)x$($size).png"
        $resized.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        if ($size -eq 512) {
            $mainPngPath = Join-Path $dir "icon.png"
            $resized.Save($mainPngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        $resized.Dispose()
    }
}

# Build ICO binary stream with embedded PNG frames
function Create-MultiSizeIco {
    param(
        [array]$PngList,
        [string]$OutFile
    )
    $count = $PngList.Count
    $headerSize = 6
    $dirEntrySize = 16
    $dataOffset = $headerSize + ($count * $dirEntrySize)

    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)

    # ICONDIR
    $bw.Write([uint16]0) # Reserved
    $bw.Write([uint16]1) # Type 1 = ICO
    $bw.Write([uint16]$count)

    # ICONDIRENTRY list
    $currentOffset = $dataOffset
    foreach ($item in $PngList) {
        $w = if ($item.Width -ge 256) { 0 } else { [byte]$item.Width }
        $h = if ($item.Height -ge 256) { 0 } else { [byte]$item.Height }
        $bw.Write([byte]$w)
        $bw.Write([byte]$h)
        $bw.Write([byte]0) # Color count
        $bw.Write([byte]0) # Reserved
        $bw.Write([uint16]1) # Color planes
        $bw.Write([uint16]32) # Bits per pixel
        $bw.Write([uint32]$item.Bytes.Length)
        $bw.Write([uint32]$currentOffset)

        $currentOffset += $item.Bytes.Length
    }

    # Image data
    foreach ($item in $PngList) {
        $bw.Write($item.Bytes, 0, $item.Bytes.Length)
    }

    $bw.Flush()
    [System.IO.File]::WriteAllBytes($OutFile, $ms.ToArray())
    $bw.Dispose()
    $ms.Dispose()
}

foreach ($dir in $targetDirs) {
    $icoPath = Join-Path $dir "icon.ico"
    Create-MultiSizeIco -PngList $pngDataList -OutFile $icoPath
    $favPath = Join-Path $dir "favicon.ico"
    Create-MultiSizeIco -PngList $pngDataList -OutFile $favPath
}

$srcImage.Dispose()
Write-Host "Icons generated successfully in all directories."
