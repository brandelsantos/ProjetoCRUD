# Sobe o banco
docker compose up -d

Write-Host "Esperando o banco ficar pronto..."
Start-Sleep -Seconds 10

# Confere se o banco está pronto
docker logs starter_crud --tail 5

# Sobe o backend em janela separada
Start-Process powershell -ArgumentList "-NoExit -Command cd C:\Users\fnk20\ProjetoCRUD\ProjetoCRUD\backend; node server.js"

# Espera um pouco pro backend subir
Start-Sleep -Seconds 3

# Sobe o frontend em janela separada
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

