Get-ChildItem -Path "F:/Allbirds/payload-cms" -Recurse -File | ForEach-Object {
    if ($_.FullName -notmatch 'node_modules|\.next') {
        $matches = $_ | Select-String -Pattern 'allbirds-|screenshot|workflow-material'
        if ($matches) {
            foreach ($m in $matches) {
                [PSCustomObject]@{
                    Path = $_.FullName
                    LineNumber = $m.LineNumber
                    Line = $m.Line.Trim()
                }
            }
        }
    }
}
