Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$root = Resolve-Path "$PSScriptRoot\..\public"
$src  = [System.Drawing.Image]::FromFile((Join-Path $root 'logo-gracetv.png'))

$graceBlue = [System.Drawing.Color]::FromArgb(30, 58, 138)   # #1E3A8A

# --- Helper: draw the logo (preserving aspect) centered inside a square canvas with a given bg ---
function New-SquareIcon([int]$size, $bg, [string]$out, [double]$pad = 0.18) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  if ($bg -ne $null) { $g.Clear($bg) } else { $g.Clear([System.Drawing.Color]::Transparent) }
  $avail = $size * (1 - 2 * $pad)
  $ratio = [Math]::Min($avail / $src.Width, $avail / $src.Height)
  $w = $src.Width * $ratio; $h = $src.Height * $ratio
  $x = ($size - $w) / 2; $y = ($size - $h) / 2
  $g.DrawImage($src, $x, $y, $w, $h)
  $g.Dispose()
  $bmp.Save((Join-Path $root $out), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "  -> $out ($size x $size)"
}

Write-Output "Favicons / touch icons:"
New-SquareIcon 32  $null      'favicon-32.png'
New-SquareIcon 192 $null      'favicon-192.png'
New-SquareIcon 512 $null      'favicon-512.png'
New-SquareIcon 180 $graceBlue 'apple-touch-icon.png'

# --- favicon.ico (32x32) ---
$icoBmp = New-Object System.Drawing.Bitmap((Join-Path $root 'favicon-32.png'))
$hicon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hicon)
$fs = [System.IO.File]::Create((Join-Path $root 'favicon.ico'))
$icon.Save($fs)
$fs.Close(); $icon.Dispose(); $icoBmp.Dispose()
Write-Output "  -> favicon.ico (32 x 32)"

# --- White version of the logo (recolor opaque pixels to white, keep alpha) ---
Write-Output "White logo:"
$wb = New-Object System.Drawing.Bitmap($src)
for ($yy = 0; $yy -lt $wb.Height; $yy++) {
  for ($xx = 0; $xx -lt $wb.Width; $xx++) {
    $px = $wb.GetPixel($xx, $yy)
    if ($px.A -gt 0) { $wb.SetPixel($xx, $yy, [System.Drawing.Color]::FromArgb($px.A, 255, 255, 255)) }
  }
}
$wb.Save((Join-Path $root 'logo-gracetv-white.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$wb.Dispose()
Write-Output "  -> logo-gracetv-white.png"

# --- OG image 1200x630 (PLACEHOLDER) ---
Write-Output "OG image (placeholder):"
$ogW = 1200; $ogH = 630
$og = New-Object System.Drawing.Bitmap($ogW, $ogH)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'
$g.TextRenderingHint = 'AntiAliasGridFit'
# Royal-blue gradient background
$rect = New-Object System.Drawing.Rectangle(0, 0, $ogW, $ogH)
$deep = [System.Drawing.Color]::FromArgb(15, 30, 84)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $graceBlue, $deep, 110.0)
$g.FillRectangle($grad, $rect)
# White rounded card holding the logo
$cardW = 620; $cardH = 280; $cardX = ($ogW - $cardW) / 2; $cardY = 120
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 36
$path.AddArc($cardX, $cardY, $r, $r, 180, 90)
$path.AddArc($cardX + $cardW - $r, $cardY, $r, $r, 270, 90)
$path.AddArc($cardX + $cardW - $r, $cardY + $cardH - $r, $r, $r, 0, 90)
$path.AddArc($cardX, $cardY + $cardH - $r, $r, $r, 90, 90)
$path.CloseFigure()
$g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $path)
# Logo inside card
$lpad = 50
$la = [Math]::Min(($cardW - 2*$lpad) / $src.Width, ($cardH - 2*$lpad) / $src.Height)
$lw = $src.Width * $la; $lh = $src.Height * $la
$g.DrawImage($src, $cardX + ($cardW - $lw)/2, $cardY + ($cardH - $lh)/2, $lw, $lh)
# Slogan
$fontFamilies = (New-Object System.Drawing.Text.InstalledFontCollection).Families.Name
$fname = if ($fontFamilies -contains 'Poppins') { 'Poppins' } elseif ($fontFamilies -contains 'Montserrat') { 'Montserrat' } else { 'Segoe UI' }
$font = New-Object System.Drawing.Font($fname, 44, [System.Drawing.FontStyle]::Bold)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
$g.DrawString("La Bonne Nouvelle Partout Partout", $font, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), (New-Object System.Drawing.RectangleF(60, 440, ($ogW-120), 120)), $sf)
$g.Dispose()
$og.Save((Join-Path $root 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()
Write-Output "  -> og-image.png (1200 x 630)"

$src.Dispose()
Write-Output "DONE."
