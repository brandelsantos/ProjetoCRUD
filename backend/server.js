const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5433,
  database: 'crudstarter9'
});

pool.on('error', (err) => {
  console.log('Erro no pool, tentando reconectar...', err.message);
});

async function criarTabela() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS pessoas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100),
      email VARCHAR(100)
    )`);
    console.log('Tabela pessoas pronta');
  } catch (err) {
    console.log('Banco ainda não pronto, tentando de novo em 2s...', err.message);
    setTimeout(criarTabela, 2000);
  }
}
criarTabela();