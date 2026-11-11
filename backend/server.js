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

pool.query(`CREATE TABLE IF NOT EXISTS pessoas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100)
)`);

app.post('/pessoas', async (req, res) => {
  const { nome, email } = req.body;
  const result = await pool.query('INSERT INTO pessoas (nome, email) VALUES ($1, $2) RETURNING *', [nome, email]);
  res.json(result.rows[0]);
});

app.get('/pessoas', async (req, res) => {
  const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
  res.json(result.rows);
});

app.put('/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  const result = await pool.query('UPDATE pessoas SET nome=$1, email=$2 WHERE id=$3 RETURNING *', [nome, email, id]);
  res.json(result.rows[0]);
});

app.delete('/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM pessoas WHERE id=$1', [id]);
  res.json({ ok: true });
});

app.listen(3001, () => console.log('Backend rodando em http://localhost:3001'));