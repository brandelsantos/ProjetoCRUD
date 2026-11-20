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


/* ainda falta dicionar produtos */
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  quantidade INT DEFAULT 0,
  descricao TEXT,
  setor VARCHAR(20) DEFAULT 'vendas',
  criado_em TIMESTAMPTZ DEFAULT now()
);


/* Perfil de usuarios adicionados apenas para admin modificar info das páginas*/
CREATE TABLE IF NOT EXISTS perfil_usuario (
  id SERIAL PRIMARY KEY,
  pessoa_id INTEGER REFERENCES pessoas(id) ON DELETE CASCADE,
  foto VARCHAR(255),
  bio TEXT,
  cargo VARCHAR(100),
  instagram VARCHAR(100),
  whatsapp VARCHAR(20)
);
 /* DEIXA OS ACESSOS DE PERFIL*/
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

 /* tabela com a meta do mês, e somente o admin edita o valor */
CREATE TABLE IS NOT EXISTS meta_vendas (
  id SERIAL PRIMARY KEY,
  valor NUMERIC DEFAULT 10000,
  atualizado_em TIMESTAMP DEFAULT NOW()
);
INSERT INTO meta_vendas (valor) VALUES (10000);

/* Vendas que o admin registrar  */
CREATE TABLE IF NOT EXISTS vendas_realizadas (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER REFERENCES produtos(id),
  produto_nome TEXT,
  quantidade INTEGER,
  valor_total NUMERIC,
  criado_em TIMESTAMP DEFAULT NOW()
);

/*  docker exec -it starter_crud psql -U postgres -d crudstarter9 */
/* SELECT id, nome, preco, quantidade, setor FROM produtos ORDER BY id; */
/* CASO NÃO TENHA A TABELA ELA É ADICIONADA NESSAS COLUNAS */
SELECT column_name FROM information_schema.columns WHERE table_name = 'produtos';
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS quantidade INT DEFAULT 0;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS descricao TEXT ;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS setor VARCHAR(20) DEFAULT 'vendas';
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT now();


INSERT INTO produtos (nome, preco, quantidade, descricao, setor) VALUES
  ('Tecpix', 299.90, 10, 'Camera mais vendida do mercado!', 'vendas'),
  ('Caneta', 2.99, 5, 'Caneta esferografica', 'vendas'),
  ('Mouse gamer', 699.50, 2, 'Mouse gamer ergonomico', 'vendas'),
  ('SSD SATA 3 2TB', 2999.99, 1, 'SSD elite', 'vendas'),
  ('Teclado gamer', 150, 49, 'Teclado mecanico gamer', 'vendas')
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (usuario, senha, tipo) VALUES
('admin', '1234', 'admin'),
('compras', '1234', 'compras'),
('vendas', '1234', 'vendas'),
('marketing', '1234', 'marketing')
ON CONFLICT (usuario) DO NOTHING;

