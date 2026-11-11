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
    const res = await fetch('http://localhost:3001/pessoas')
    const data = await res.json()
    setPessoas(data)
  }

  useEffect(() => { carregar(); }, []);

  async function cadastrar() {
    await fetch('http://localhost:3001/pessoas', {
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
      fetch(`http://localhost:3001/pessoas/${editandoId}`, {
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
    await fetch(`http://localhost:3001/pessoas/${id}`, { method: 'DELETE' })
    carregar()
  }

  function comecarEditar(pessoas: Pessoa) {
    setEditandoId(pessoas.id)
    setNome(pessoas.nome)
    setEmail(pessoas.email)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
  }

   return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Cadastro</h1>
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