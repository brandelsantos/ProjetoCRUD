import { useEffect, useState } from 'react'

type Pessoa = {
  id: number
  nome: string
  email: string
}

export default function App() {
  const [pessoas, setPessoas] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null) 

  async function carregar() {
    const res = await fetch('/api/pessoas')
    const data = await res.json()
    setPessoas(data)
  }

  useEffect(() => { carregar(); }, []);

  async function cadastrar() {
    await fetch('/api/pessoas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email })
    })
    setNome('')
    setEmail('')
    carregar()
  }

  async function salvarEdicao() {
    if (editandoId !== null) {
      await fetch(`/api/pessoas/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
      })
      setEditandoId(null)
      setNome('')
      setEmail('')
      carregar()
    }
  }

  async function deletar(id: number) {
    await fetch(`/api/pessoas/${id}`, { method: 'DELETE' })
    carregar()
  }

  function comecarEditar(pessoa: Pessoa) {
    setEditandoId(pessoa.id)
    setNome(pessoa.nome)
    setEmail(pessoa.email)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <div className="perfil" style={{ textAlign: 'center', marginBottom: 20 }}>
        <img 
          src="/desenho.webp" 
          alt="Meu desenho" 
          className="foto-desenho"
        />
        <h1>Cadastro de Pessoas  -   CRUD</h1>
      </div>

      <div style={{ textAlign: 'center' }}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        {editandoId === null ? (
          <button onClick={cadastrar} style={{ marginLeft: 8 }}>Cadastrar</button>
        ) : (
          <>
            <button onClick={salvarEdicao} style={{ marginLeft: 8 }}>Salvar Edição</button>
            <button onClick={cancelarEdicao} style={{ marginLeft: 8 }}>Cancelar</button>
          </>
        )}
      </div>

      <ul>
        {pessoas.map((p) => (
          <li key={p.id}>
            {p.nome} - {p.email}{' '}
            <button onClick={() => comecarEditar(p)}>Editar</button>{' '}
            <button onClick={() => deletar(p.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}