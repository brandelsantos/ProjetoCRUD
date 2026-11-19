// ========== IMPORTS - controla as ferramentas que o backend usa ==========
// dotenv = le o backend/.env | express = cria o servidor | cors = deixa o frontend falar com o backend | Pool = fala com o Postgres
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

// ========== MIDDLEWARE - controla o que entra no backend ==========
app.use(cors()); // deixa o frontend em localhost:5173 chamar o backend
app.use(express.json()); // deixa o backend entender JSON que vem do frontend

// ========== VALIDAR PESSOA - controla as regras do cadastro no backend ==========
// Se tiver errado aqui, o backend bloqueia e nem salva no banco
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

// ========== POOL - controla a conexao com o banco ==========
// Pega do backend/.env. Se nao tiver .env, usa esses valores padrao
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

// ========== CRIAR TABELA - cria as tabelas se nao existirem, roda 1 vez quando o backend liga ==========
async function criarTabela() {
  try {
    // TABELA PESSOAS - controla o cadastro principal
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

    // TABELA USUARIOS - controla os logins fixos: admin, compras, vendas, marketing
    await pool.query(`CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(50) UNIQUE,
      senha VARCHAR(100),
      tipo VARCHAR(20) DEFAULT 'admin',
      nome VARCHAR(100)
    )`);

    // INSERT USUARIOS FIXOS - cria os 4 logins fixos se nao existirem
    await pool.query(`INSERT INTO usuarios (usuario, senha, tipo, nome) VALUES
      ('admin', '1234', 'admin', 'Admin'),
      ('compras', '1234', 'compras', 'Compras'),
      ('vendas', '1234', 'vendas', 'Vendas'),
      ('marketing', '1234', 'marketing', 'Marketing')
      ON CONFLICT (usuario) DO NOTHING`);

    // TABELA LEADS - controla os leads do Quero crescer
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      precisa VARCHAR(100) NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW()
    )
`);

    // TABELA PERFIL_USUARIO - controla o perfil de verdade, NAO copia de produto
    // TEM QUE VIR ANTES de acessos_perfil, porque acessos usa perfil_usuario
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

    // TABELA ACESSOS_PERFIL - controla quem viu qual perfil
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
      
    // TABELA PRODUTOS - AINDA EM TESTE, backend pronto, tela ainda nao feita
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco NUMERIC(10,2) NOT NULL DEFAULT 0,
        quantidade INT NOT NULL DEFAULT 0,
        descricao TEXT DEFAULT '',
        setor VARCHAR(20) DEFAULT 'vendas',
        criado_em TIMESTAMPTZ DEFAULT now()
      )`);
    
    // ALTER TABLE - controla as colunas novas pra quem ja tinha a tabela antiga
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

// CHAMA CRIAR TABELA - roda quando o backend liga
criarTabela();

// ========== GET /pessoas - BUSCAR TODOS - lista todas as pessoas pro frontend ==========
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro no banco' });
  }
});

// Busca os produtos - SO vendas e admin podem ver
app.get('/produtos', async (req, res) => {
  try {
    const tipo = req.query.tipo;

    if (tipo !== 'vendas' && tipo !== 'admin') {
      return res.status(403).json({ erro: 'So vendas e admin podem ver produtos' });
    }

    const result = await pool.query("SELECT id, nome, preco, quantidade, descricao, setor FROM produtos WHERE setor = 'vendas' ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// ========== POST /login - LOGIN UNICO, SEM DUPLICATA ==========
// 1 - olha nos fixos (usuarios) | 2 - olha nos cadastrados (pessoas) | fixo nao tem id, cadastrado tem id
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

    // AQUI É O res.json COM id - o frontend usa esse id pra cair no Meu Perfil
    return res.json({ tipo: result.rows[0].tipo, nome: result.rows[0].nome, id: result.rows[0].id })
  } catch (err) {
    console.error('Erro no login:', err.message)
    res.status(500).json({ erro: 'Erro no banco no login' })
  }
})

// ========== GET /perfil/:pessoa_id - BUSCAR PERFIL DE UMA PESSOA - so mostra, nao edita ==========
app.get('/perfil/:pessoa_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM perfil_usuario WHERE pessoa_id = $1', [req.params.pessoa_id])
    res.json(result.rows[0] || null)
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar perfil' })
  }
})

// ========== POST /perfil - SALVAR / EDITAR PERFIL - UNICO, TRAVADO SO ADMIN ==========
// ATENCAO: antes tinha 2x esse bloco, o segundo apagava a trava. Agora tem so 1.
app.post('/perfil', async (req, res) => {
  try {
    // TRAVA: só admin pode salvar perfil
    if (req.body.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Só o admin pode editar perfil.' })
    }
    const { pessoa_id, foto, bio, cargo, instagram, whatsapp } = req.body
    if (!pessoa_id) return res.status(400).json({ erro: 'Falta pessoa_id' })

    // Se ja tem perfil, atualiza. Se nao tem, cria.
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

// ========== GET /acessos-perfil - LISTAR ACESSOS - SO ADMIN VE quem viu qual perfil ==========
app.get('/acessos-perfil', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM acessos_perfil ORDER BY id DESC LIMIT 50')
    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao listar acessos' })
  }
})

// ========== POST /leads - SALVAR LEAD DO MARKETING - vem do Quero crescer ==========
app.post('/leads', async (req, res) => {
  try {
    const { nome, whatsapp, precisa } = req.body
    if (!nome || !nome.trim()) return res.status(400).json({ erro: 'Nome é obrigatório' })
    const soNumeros = (whatsapp || '').replace(/\D/g, '')
    if (soNumeros.length < 10) return res.status(400).json({ erro: 'WhatsApp com DDD é obrigatório' })

    const result = await pool.query(
      'INSERT INTO leads (nome, whatsapp, precisa) VALUES ($1, $2, $3) RETURNING *',
      [nome.trim(), whatsapp, precisa || 'Quero mais clientes no insta']
    )
    res.json(result.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Erro ao salvar lead' })
  }
})

// ========== GET /leads - LISTAR LEADS - SO ADMIN VE ==========
app.get('/leads', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY id DESC')
    res.json(result.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ erro: 'Erro ao listar leads' })
  }
})

// ========== DELETE /leads/:id - APAGAR LEAD - botao Ja atendi ==========
app.delete('/leads/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao apagar lead' })
  }
})

// ========== GET /pessoas/:id - Buscar 1 pessoa por id ==========
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

// ========== POST /pessoas - Cadastrar pessoa nova ==========
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

// ========== PUT /pessoas/:id - Editar pessoa ==========
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

// ========== DELETE /pessoas/:id - Deletar pessoa ==========
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


// ========== PRODUTOS - Cadastrar ==========
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

// ========== PRODUTOS - Deletar ==========
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

// ========== LIGAR SERVIDOR - controla a porta do backend, padrao 3001 ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));