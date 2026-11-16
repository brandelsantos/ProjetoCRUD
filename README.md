# ProjetoCRUD

CRUD de Pessoas com React + Node + PostgreSQL + Docker.

Sistema completo para cadastrar, listar, buscar, editar e deletar pessoas, com validação de telefone, idade e email único.

## Funcionalidades

- Cadastrar pessoa (nome, email, telefone, idade)
- Listar pessoas
- Editar pessoa
- Deletar pessoa
- Limpar tudo
- Buscar por nome ou email
- Ordenar de A-Z
- Paginação
- Validação no frontend e no backend
- Telefone formatado automaticamente `(11) 99999-9999`
- Telefone tem que ter 10 ou 11 dígitos
- Idade limitada de 0 a 120
- Email único - não deixa cadastrar o mesmo email 2x
- Foto / desenho no topo da página com animação flutuante

## Tecnologias

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + 【entity-Express¦canonical_name=Express】
- **Banco de dados:** PostgreSQL
- **Infra:** Docker + Docker Compose

## Como rodar

### 1. Clonar o projeto

```bash
git clone https://github.com/brandelsantos/ProjetoCRUD.git
cd ProjetoCRUD