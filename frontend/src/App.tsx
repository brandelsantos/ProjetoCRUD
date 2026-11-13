import { useEffect, useState } from 'react'
import './App.css'

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
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  async function carregar() {
    try {
      setCarregando(true)
      const res = await fetch('/api/pessoas')
      const data = await res.json()
      setPessoas(data)
    } catch {
      setMensagem('Erro ao carregar pessoas')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar(); }, []);

  async function cadastrar() {
    if (!nome.trim()) {
      setMensagem('Nome é obrigatório')
      return
    }
    if (!email.includes('@')) {
      setMensagem('Email inválido, tem que ter @')
      return
    }
    try {
      const res = await fetch('/api/pessoas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
      })
      const data = await res.json()
      if (!res.ok) {
        setMensagem(data.erro || 'Erro ao cadastrar')
        return
      }
      setMensagem('Cadastrado com sucesso!')
      setNome('')
      setEmail('')
      carregar()
    } catch {
      setMensagem('Erro ao conectar no backend')
    }
  }

  async function salvarEdicao() {
    if (editandoId !== null) {
      if (!nome.trim()) {
        setMensagem('Nome é obrigatório')
        return
      }
      if (!email.includes('@')) {
        setMensagem('Email inválido, tem que ter @')
        return
      }
      try {
        const res = await fetch(`/api/pessoas/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email })
        })
        const data = await res.json()
        if (!res.ok) {
          setMensagem(data.erro || 'Erro ao editar')
          return
        }
        setMensagem('Editado com sucesso!')
        setEditandoId(null)
        setNome('')
        setEmail('')
        carregar()
      } catch {
        setMensagem('Erro ao conectar no backend')
      }
    }
  }

  async function deletar(id: number, nomePessoa: string) {
    const confirmar = confirm(`Tem certeza que quer deletar ${nomePessoa}?`)
    if (!confirmar) return
    try {
      const res = await fetch(`/api/pessoas/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setMensagem('Erro ao deletar')
        return
      }
      setMensagem('Deletado com sucesso!')
      carregar()
    } catch {
      setMensagem('Erro ao conectar no backend')
    }
  }

  function comecarEditar(pessoa: Pessoa) {
    setEditandoId(pessoa.id)
    setNome(pessoa.nome)
    setEmail(pessoa.email)
    setMensagem('')
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
  }

  const pessoasFiltradas = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

    return (
      <div style={{
        padding: 24,
        fontFamily: 'Arial',
        background: '#1f2028',
        maxWidth: 600,
        margin: '40px auto',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}> 
      <div className="perfil" style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="/desenho.webp" alt="Meu desenho" className="foto-desenho" />
        <h1>Cadastro de Pessoas  -   CRUD</h1>
      </div>

      <div style={{ textAlign: 'center' }}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginLeft: 8 }} />
        {editandoId === null ? (
          <button onClick={cadastrar} style={{ marginLeft: 8, background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cadastrar</button>
        ) : (
          <>
            <button onClick={salvarEdicao} style={{ marginLeft: 8, background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Salvar Edição</button>
            <button onClick={cancelarEdicao} style={{ marginLeft: 8, background: '#6b7280', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          </>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {mensagem && <p style={{ textAlign: 'center' }}>{mensagem}</p>}

      {carregando ? (
        <p style={{ textAlign: 'center' }}>Carregando...</p>
      ) : (
        <ul>
          {pessoasFiltradas.map((p) => (
            <li key={p.id}>
              {p.nome} - {p.email}{' '}
              <button onClick={() => comecarEditar(p)} style={{ background: '#3b82f6', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Editar</button>{' '}
              <button onClick={() => deletar(p.id, p.nome)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Deletar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}