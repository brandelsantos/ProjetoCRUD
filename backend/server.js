require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Validação - bloqueia cadastro errado e limita telefone e idade
function validarPessoa(nome, email, telefone, idade) {
  if (!nome || !nome.trim()) {
    return 'Nome é obrigatório';
  }
  if (!email || !email.includes('@')) {
    return 'Email inválido, tem que ter @';
  }
  if (telefone) {
    const soNumeros = String(telefone).replace(/\D/g, '');
    if (soNumeros.length < 10 || soNumeros.length > 11) {
      return 'Telefone tem que ter 10 ou 11 dígitos';
    }
  }
  if (idade !== null && idade !== undefined && idade !== '') {
    if (Number(idade) < 0 || Number(idade) > 120) {
      return 'Idade tem que ser entre 0 e 120';
    }
  }
  return null;
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'crudstarter9'
});

pool.on('error', (err) => {
  console.error('Erro no pool do banco:', err.message);
});

async function criarTabela() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS pessoas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100),
      email VARCHAR(100),
      telefone VARCHAR(20),
      idade INT
    )`);

    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone VARCHAR(20)`);
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS idade INT`);

    console.log('Tabela pessoas pronta');
  } catch (err) {
    console.error('Erro ao criar tabela, tentando de novo em 3s:', err.message);
    setTimeout(criarTabela, 3000);
  }
}

criarTabela();

// GET - Buscar todos
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// GET - Buscar 1 por id
app.get('/pessoas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM pessoas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// POST - Cadastrar
app.post('/pessoas', async (req, res) => {
  try {
    const { nome, email, telefone, idade } = req.body;
    const erro = validarPessoa(nome, email, telefone, idade);
    if (erro) {
      return res.status(400).json({ erro });
    }
    const result = await pool.query(
      'INSERT INTO pessoas (nome, email, telefone, idade) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone || null, idade || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// PUT - Editar - AGORA SEM PUT DENTRO DE PUT
app.put('/pessoas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, telefone, idade } = req.body;

    const erro = validarPessoa(nome, email, telefone, idade);
    if (erro) {
      return res.status(400).json({ erro });
    }

    const result = await pool.query(
      'UPDATE pessoas SET nome = $1, email = $2, telefone = $3, idade = $4 WHERE id = $5 RETURNING *',
      [nome, email, telefone || null, idade || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// DELETE - Deletar
app.delete('/pessoas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query(
      'DELETE FROM pessoas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));