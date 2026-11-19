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
    const idadeNum = Number(idade);
    if (isNaN(idadeNum) || idadeNum < 0 || idadeNum > 120) {
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
    await pool.query(`CREATE TABLE IF NOT EXISTS pessoas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      telefone VARCHAR(20),
      idade INT,
      setor VARCHAR(20) DEFAULT 'admin',
      usuario VARCHAR(50),
      senha VARCHAR(100)
    )`);

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      precisa VARCHAR(100) NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW()
    )
`);
await pool.query(`
  CREATE TABLE IF NOT EXISTS acessos_perfil (
    id SERIAL PRIMARY KEY,
    quem_viu_id INTEGER REFERENCES pessoas(id) ON DELETE SET NULL,
    quem_viu_nome VARCHAR(100),
    perfil_id INTEGER REFERENCES perfil_usuario(id) ON DELETE CASCADE,
    perfil_nome VARCHAR(100),
    criado_em TIMESTAMP DEFAULT NOW()
  )
`);

    // TABELA PERFIL_USUARIO - PERFIL DE VERDADE, NÃO CÓPIA DE PRODUTO
    await pool.query(`
      CREATE TABLE IF NOT EXISTS perfil_usuario (
        id SERIAL PRIMARY KEY,
        pessoa_id INTEGER UNIQUE REFERENCES pessoas(id) ON DELETE CASCADE,
        foto VARCHAR(255) DEFAULT '/desenho.webp',
        bio TEXT DEFAULT '',
        cargo VARCHAR(100) DEFAULT '',
        instagram VARCHAR(100) DEFAULT '',
        whatsapp VARCHAR(20) DEFAULT ''
      )
    `);
      
// TABELA DE PRODUTOS - AINDA EM TESTE TURURUU
    await pool.query(`CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      preco NUMERIC(10,2) NOT NULL DEFAULT 0,
      quantidade INT NOT NULL DEFAULT 0,
      setor VARCHAR(20) DEFAULT 'admin'
    )`);
    
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

// GET - BUSCAR TODOS
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// LOGIN - ÚNICO, SEM DUPLICATA - AQUI VAI O res.json COM id
app.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body

    // 1 - olha na tabela usuarios (os fixos)
    let result = await pool.query(
      'SELECT usuario, tipo, nome FROM usuarios WHERE usuario = $1 AND senha = $2',
      [usuario, senha]
    )
    if (result.rows.length > 0) {
      // Fixo não tem id de pessoa, então não manda id
      return res.json({ tipo: result.rows[0].tipo, nome: result.rows[0].nome || result.rows[0].usuario })
    }

    // 2 - olha na tabela pessoas (os cadastrados) - AQUI TEM O id
    result = await pool.query(
      'SELECT id, nome, setor AS tipo, usuario FROM pessoas WHERE usuario = $1 AND senha = $2',
      [usuario, senha]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha errados!' })
    }

    // AQUI É O res.json QUE VOCÊ PERGUNTOU - COM id
    return res.json({ tipo: result.rows[0].tipo, nome: result.rows[0].nome, id: result.rows[0].id })
  } catch (err) {
    console.error('Erro no login:', err.message)
    res.status(500).json({ erro: 'Erro no banco no login' })
  }
})

// BUSCAR PERFIL DE UMA PESSOA
app.get('/perfil/:pessoa_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM perfil_usuario WHERE pessoa_id = $1', [req.params.pessoa_id])
    res.json(result.rows[0] || null)
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar perfil' })
  }
})
// REGISTRAR QUE ALGUÉM VIU UM PERFIL
app.post('/perfil', async (req, res) => {
  try {
    // TRAVA: só admin pode salvar perfil
    if (req.body.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Só o admin pode editar perfil.' })
    }
    const { pessoa_id, foto, bio, cargo, instagram, whatsapp } = req.body
    if (!pessoa_id) return res.status(400).json({ erro: 'Falta pessoa_id' })
    const existe = await pool.query('SELECT id FROM perfil_usuario WHERE pessoa_id = $1', [pessoa_id])
    let result
    if (existe.rows.length > 0) {
      result = await pool.query(
        'UPDATE perfil_usuario SET foto=$1, bio=$2, cargo=$3, instagram=$4, whatsapp=$5 WHERE pessoa_id=$6 RETURNING *',
        [foto || '', bio || '', cargo || '', instagram || '', whatsapp || '', pessoa_id]
      )
    } else {
      result = await pool.query(
        'INSERT INTO perfil_usuario (pessoa_id, foto, bio, cargo, instagram, whatsapp) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [pessoa_id, foto || '', bio || '', cargo || '', instagram || '', whatsapp || '']
      )
    }
    res.json(result.rows[0])
  } catch (e) { console.log(e); res.status(500).json({ erro: 'Erro ao salvar perfil' }) }
})

// LISTAR ACESSOS - SÓ ADMIN VÊ
app.get('/acessos-perfil', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM acessos_perfil ORDER BY id DESC LIMIT 50')
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao listar acessos' })
  }
})

// SALVAR / EDITAR PERFIL
app.post('/perfil', async (req, res) => {
  try {
    const { pessoa_id, foto, bio, cargo, instagram, whatsapp } = req.body
    if (!pessoa_id) return res.status(400).json({ erro: 'pessoa_id é obrigatório' })

    const result = await pool.query(`
      INSERT INTO perfil_usuario (pessoa_id, foto, bio, cargo, instagram, whatsapp)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (pessoa_id) DO UPDATE SET
        foto = EXCLUDED.foto,
        bio = EXCLUDED.bio,
        cargo = EXCLUDED.cargo,
        instagram = EXCLUDED.instagram,
        whatsapp = EXCLUDED.whatsapp
      RETURNING *
    `, [pessoa_id, foto || '/desenho.webp', bio || '', cargo || '', instagram || '', whatsapp || ''])
    res.json(result.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Erro ao salvar perfil' })
  }
})

// SALVAR LEAD DO MARKETING
app.post('/leads', async (req, res) => {
  try {
    const { nome, whatsapp, precisa } = req.body
    if (!nome || !nome.trim()) return res.status(400).json({ erro: 'Nome é obrigatório' })
    const soNumeros = (whatsapp || '').replace(/\D/g, '')
    if (soNumeros.length < 10) return res.status(400).json({ erro: 'WhatsApp com DDD é obrigatório' })

    const result = await pool.query(
      'INSERT INTO leads (nome, whatsapp, precisa) VALUES ($1, $2, $3) RETURNING *',
      [nome.trim(), whatsapp, precisa || 'Quero mais clientes no Instagram']
    )
    res.json(result.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Erro ao salvar lead' })
  }
})

// LISTAR LEADS - SÓ ADMIN VÊ
app.get('/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY id DESC')
    res.json(result.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Erro ao listar leads' })
  }
})

// APAGAR LEAD - QUANDO JÁ ATENDEU
app.delete('/leads/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao apagar lead' })
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

// PRODUTOS - Buscar todos
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// PRODUTOS - Cadastrar
app.post('/produtos', async (req, res) => {
  try {
    const { nome, preco, quantidade, setor } = req.body;
    if (!nome || !nome.trim()) {
      return res.status(400).json({ erro: 'Nome do produto é obrigatório' });
    }
    const result = await pool.query(
      'INSERT INTO produtos (nome, preco, quantidade, setor) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome.trim(), preco || 0, quantidade || 0, setor || 'admin']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// PRODUTOS - Deletar
app.delete('/produtos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));