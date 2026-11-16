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

Informações importantes:
- O banco de dados está subindo na porta 5432, em outro pc precisa mudar a porta do banco no arquivo .env do backend.
- banco de dados rodando na mesma porta, vai dar conflito. Então ou você para o outro banco ou muda a porta do postgres no docker-compose.yml.
- Para mudar a porta do banco no docker-compose.yml.
E também alterar a porta no arquivo .env do backend.

Agora pra iniciar somente usar (docker compose up -d) e depois (docker compose down) pra parar tudo. 
Já ta subindo tudo na docker então não precisa ir manual e nem no startudo.ps1 


*/