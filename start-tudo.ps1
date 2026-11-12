Set-Location "$PSScriptRoot"
docker compose up -d
Write-Host "Esperando o banco ficar pronto..."
Start-Sleep -Seconds 5

Write-Host "Abrindo backend..."
cmd /c start powershell -ExecutionPolicy Bypass -NoExit -File "$PSScriptRoot\start-backend.ps1"

Start-Sleep -Seconds 3

Write-Host "Abrindo frontend..."
cmd /c start powershell -ExecutionPolicy Bypass -NoExit -File "$PSScriptRoot\start-frontend.ps1"

Write-Host "Tudo subindo! Banco + Backend + Frontend"
/*

git pull
docker ps
docker compose up
powershell -ExecutionPolicy Bypass -File .\.git\Start-tudo.ps1
git add .
git commit -m "o que mudou"
git push



*/
/* PARA INICIAR TODO ARQUIVO USAR        (git pull)     */
/* PARA INICIAR TODO ARQUIVO USAR        (     .\.git\Start-tudo.ps1     )     */                    */  

