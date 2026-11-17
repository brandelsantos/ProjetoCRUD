require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Validação - bloqueia cadastro errado e limita telefone e idade
function validarPessoa(nome, email, telefone, idade, setor, usuario, senha) {
  if (!nome || !nome.trim()) {
    return 'Nome é obrigatório';
  }
  if (!email || !email.includes ('@')) {
    return 'Email inválido, tem que ter @';
  }
  if (telefone) {
    const soNumeros = String(telefone).replace(/\D/g, '');
    if (soNumeros.length < 10 || soNumeros.length > 11) {
      return 'Telefone tem que ter 10 ou 11 dígitos';
    }
  }
  if (isNaN !== null && idade !== undefined && idade !== '') {
    const idadeNum = Number(idade);
    if (idade(idadeNum) || idadeNum < 0 || idadeNum > 120) {
      return 'Idade tem que ser entre 0 e 120';
    }
  }
  const setoresValidos = ['admin', 'compras', 'marketing', 'vendas'];
  if (setor && !setoresValidos.includes(setor)) {
    return 'Setor inválido';
  }
  if (usuario) {
    if (usuario.trim().length < 3) {
      return 'Usuário tem que ter no mínimo 3 letras';
    }
    if (!/^[A-Za-z0-9._-]+$/.test(usuario.trim())) {
      return 'Usuário só pode ter letras, números, ponto, underline e traço';
    }
  }
  if (senha) {
    if (String(senha).length < 4) {
      return 'Senha tem que ter no mínimo 4 caracteres';
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
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) UNIQUE,
  senha VARCHAR(100),
  tipo VARCHAR(20) DEFAULT 'admin',
  nome VARCHAR(100)
)`);

    await pool.query(`INSERT INTO usuarios (usuario, senha, tipo, nome) VALUES
  ('admin', '1234', 'admin', 'Admin'),
  ('compras', '1234', 'compras', 'Compras'),
  ('vendas', '1234', 'vendas', 'Vendas'),
  ('marketing', '1234', 'marketing', 'Marketing')
  ON CONFLICT (usuario) DO NOTHING`);
    
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone VARCHAR(20)`);
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS idade INT`);
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS setor VARCHAR(20) DEFAULT 'admin'`);
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS usuario VARCHAR(50)`);
    await pool.query(`ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS senha VARCHAR(100)`);
    await pool.query(`UPDATE pessoas SET setor = 'admin' WHERE setor IS NULL`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoas_email_unico ON pessoas (email)`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pessoas_usuario_unico ON pessoas (usuario)`);

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

app.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body
    let result = await pool.query(
      'SELECT usuario, tipo, usuario AS nome FROM usuarios WHERE usuario = $1 AND senha = $2',
      [usuario, senha]
    )
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT nome, setor AS tipo, usuario FROM pessoas WHERE usuario = $1 AND senha = $2',
        [usuario, senha]
      )
    }
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha errados!' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('Erro no login:', err.message)
    res.status(500).json({ erro: 'Erro no banco no login' })
  }
})

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
    const { nome, email, telefone, idade, setor, usuario, senha } = req.body;
    const erro = validarPessoa(nome, email, telefone, idade, setor, usuario, senha);
    if (erro) {
      return res.status(400).json({ erro });
    }
    const result = await pool.query(
      'INSERT INTO pessoas (nome, email, telefone, idade, setor, usuario, senha) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nome.trim(), email.trim(), telefone || null, idade === '' ? null : idade, setor || 'admin', usuario ? usuario.trim() : null, senha || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
  if (err.code === '23505') {
    if (String(err.detail || '').includes('usuario')) {
      return res.status(400).json({ erro: 'Esse usuário já está cadastrado' });
    }
    return res.status(400).json({ erro: 'Esse email já está cadastrado' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro no banco' });
}
  
});

// PUT - Editar
app.put('/pessoas/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, telefone, idade, setor, usuario, senha } = req.body;

    const erro = validarPessoa(nome, email, telefone, idade, setor, usuario, senha);
    if (erro) {
      return res.status(400).json({ erro });
    }

    const result = await pool.query(
      'UPDATE pessoas SET nome = $1, email = $2, telefone = $3, idade = $4, setor = $5, usuario = $6, senha = $7 WHERE id = $8 RETURNING *',
      [nome.trim(), email.trim(), telefone || null, idade === '' ? null : idade, setor || 'admin', usuario ? usuario.trim() : null, senha || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
  if (err.code === '23505') {
    if (String(err.detail || '').includes('usuario')) {
      return res.status(400).json({ erro: 'Esse usuário já está cadastrado' });
    }
    return res.status(400).json({ erro: 'Esse email já está cadastrado' });
  }
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