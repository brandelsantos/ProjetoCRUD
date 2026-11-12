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

// ISSO AQUI É O QUE FALTAVA - ele não deixa o backend morrer se o banco piscar
pool.on('error', (err) => {
  console.error('Erro no pool do banco:', err.message);
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
    console.error('Erro ao criar tabela, tentando de novo em 3s:', err.message);
    setTimeout(criarTabela, 3000);
  }
}
criarTabela();

app.post('/pessoas', async (req, res) => {
  try {
    const { nome, email } = req.body;
    const result = await pool.query('INSERT INTO pessoas (nome, email) VALUES ($1, $2) RETURNING *', [nome, email]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.put('/pessoas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;
    const result = await pool.query('UPDATE pessoas SET nome=$1, email=$2 WHERE id=$3 RETURNING *', [nome, email, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/pessoas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pessoas WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.listen(3001, () => console.log('Backend rodando em http://localhost:3001'));