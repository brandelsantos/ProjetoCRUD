# Sobe o banco 
docker compose up -d

Write-Host "Esperando o banco ficar pronto..."
Start-Sleep -Seconds 10

# Vai conferir se está ok 
docker logs starter_crud --tail 5

# Vai fazer o node server.js separado
Start-Process powershell -ArgumentList "-NoExit -Command cd C:\Users\fnk20\ProjetoCRUD\ProjetoCRUD\backend; node server.js"

# Cd de iniciar
Start-Sleep -Seconds 3

# Sobe o run dev separado
Start-Process powershell -ArgumentList "-NoExit -Command cd C:\Users\fnk20\ProjetoCRUD\ProjetoCRUD\frontend; npm run dev"

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

