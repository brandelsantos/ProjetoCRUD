Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$PSScriptRoot\start-docker.ps1`""
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$PSScriptRoot\start-backend.ps1`""
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$PSScriptRoot\start-frontend.ps1`""


/* PARA INICIAR TODO ARQUIVO USAR        (git pull)     */
/* PARA INICIAR TODO ARQUIVO USAR        (     .\.git\Start-tudo.ps1     )                         */  

