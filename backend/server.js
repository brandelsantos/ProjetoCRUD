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
  port: 5432,
  database: 'crudstarter9'
});

pool.query(`CREATE type backend\server.jsTABLE IF NOT EXISTS pessoas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100)
)`);

app.post('/pessoas', async (req, res) => {
  const { nome, email } = req.body;
  const result = await pool.query('INSERT INTO pessoas (nome, email) VALUES ($1, $2) RETURNING *', [nome, email]);
  res.json(result.rows[0]);
});

// app.get esse é utilizado para buscar todos
app.get('/pessoas', async (req, res) => {
  const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
  res.json(result.rows);
});

//app.get esse get já é utilizado para buscar por ID
app.get('/pessoas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const result = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ erro: 'Pessoa não encontrada' });
  }
  res.json(result.rows[0]);
});

app.put('/pessoas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, email } = req.body;
  const result = await pool.query(
    'UPDATE pessoas SET nome= $1, email= $2 WHERE id= $3 RETURNING * ',
     [nome, email, id]);
  res.json(result.rows[0]);
});

app.delete('/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM pessoas WHERE id=$1', [id]);
  res.json({ ok: true });
});

app.listen(3001, () => console.log('Backend rodando em http://localhost:3001'));