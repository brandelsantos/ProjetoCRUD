CREATE TABLE IF NOT EXISTS pessoas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  idade INTEGER 
);

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


INSERT INTO usuarios (usuario, senha, tipo) VALUES
('admin', '1234', 'admin'),
('compras', '1234, 'compras') //
('vendas', 1234, 'vendas') //
('marketing', 1234, 'marketing') //
ON CONFLICT (usuario) DO NOTHING;

