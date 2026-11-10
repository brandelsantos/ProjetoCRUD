import { useEffect, useState } from 'react'

export default function App() {
  const [pessoas, setPessoas] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')

  async function carregar() {
    const res = await fetch('http://localhost:3001/pessoas')
    const data = await res.json()
    setPessoas(data)
  }

  useEffect(() => { carregar() }, [])

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

  async function deletar(id: number) {
    await fetch(`http://localhost:3001/pessoas/${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <div style={{ fontFamily: 'Arial', maxWidth: '500px', margin: '30px auto' }}>
      <h1 style={{ fontSize: '28px', lineHeight: '1.2', textAlign: 'center' }}>Cadastro de Pessoas - CRUD</h1>

      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }} />
      <button onClick={cadastrar} style={{ padding: '10px 20px' }}>Cadastrar</button>

      <hr />

      {pessoas.map((p: any) => (
        <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <b>{p.nome}</b> - {p.email}
          <button onClick={() => deletar(p.id)} style={{ marginLeft: '10px', color: 'red' }}>Deletar</button>
        </div>
      ))}
    </div>
  )
}