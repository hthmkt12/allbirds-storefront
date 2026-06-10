Add-Type -AssemblyName System.Drawing
Get-ChildItem -Path "F:/Allbirds/public" -File | ForEach-Object {
    try {
        $img = [System.Drawing.Image]::FromFile($_.FullName)
        [PSCustomObject]@{
            Name = $_.Name
            Width = $img.Width
            Height = $img.Height
            Size = $_.Length
        }
        $img.Dispose()
    } catch {
        Write-Warning "Could not read $($_.Name): $_"
    }
}
