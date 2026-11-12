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
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

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

      {mensagem && <p style={{ textAlign: 'center' }}>{mensagem}</p>}

      {carregando ? (
        <p style={{ textAlign: 'center' }}>Carregando...</p>
      ) : (
        <ul>
          {pessoas.map((p) => (
            <li key={p.id}>
              {p.nome} - {p.email}{' '}
              <button onClick={() => comecarEditar(p)}>Editar</button>{' '}
              <button onClick={() => deletar(p.id, p.nome)}>Deletar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}