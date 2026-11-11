$root = $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root'; docker compose up"
Start-Sleep -Seconds 15
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root\backend'; node server.js"
Start-Process powershell -ArgumentList "-NoExit -Command cd '$root\frontend'; npm run dev"


/*
git pull
powershell -ExecutionPolicy Bypass -File .\.git\Start-tudo.ps1
git add .
git commit -m "o que mudou"
git push



*/
/* PARA INICIAR TODO ARQUIVO USAR        (git pull)     */
/* PARA INICIAR TODO ARQUIVO USAR        (     .\.git\Start-tudo.ps1     )     */                    */  

