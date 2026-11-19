CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco NUMERIC(10,2),
  setor VARCHAR(50) DEFAULT 'vendas'
);

CREATE TABLE IF NOT EXISTS marketing (
  id SERIAL PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco NUMERIC(10,2),
  setor VARCHAR(50) DEFAULT 'marketing'
);

CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco NUMERIC(10,2),
  setor VARCHAR(50) DEFAULT 'compras'
);


{*/ ainda falta dicionar produtos */}
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL,
  preco NUMERIC(10,2),
  setor VARCHAR(50) DEFAULT 'produtos'
);

{*/ Perfil de usuarios não adicionados */}
CREATE TABLE IF NOT EXISTS perfil_usuario (
  id SERIAL PRIMARY KEY,
  pessoa_id INTEGER REFERENCES pessoas(id) ON DELETE CASCADE,
  foto VARCHAR(255),
  bio TEXT,
  cargo VARCHAR(100),
  instagram VARCHAR(100),
  whatsapp VARCHAR(20)
);
 {*/ DEIXA OS ACESSOS DE PERFIL*/}
CREATE TABLE IF NOT EXISTS acessos_perfil (
  id SERIAL PRIMARY KEY,
  quem_viu_id INTEGER REFERENCES pessoas(id) ON DELETE SET NULL,
  quem_viu_nome VARCHAR(100),
  perfil_id INTEGER REFERENCES perfil_usuario(id) ON DELETE CASCADE,
  perfil_nome VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  precisa VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

INSERT INTO usuarios (usuario, senha, tipo) VALUES
('admin', '1234', 'admin'),
('compras', '1234', 'compras'),
('vendas', '1234', 'vendas'),
('marketing', '1234', 'marketing')
ON CONFLICT (usuario) DO NOTHING;