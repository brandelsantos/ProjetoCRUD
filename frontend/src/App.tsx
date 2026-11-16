import { useEffect, useState } from 'react'
import './App.css'

type Pessoa = {
  id: number
  nome: string
  email: string
  telefone?: string | null
  idade?: number | null
}

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/pessoas`

function validar(nome: string, email: string, telefone: string, idade: string) {
  if (!nome.trim()) return 'Nome é obrigatório'
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome.trim())) return 'Nome não pode ter caracteres especiais, só letras e espaço'
  if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return 'Email inválido, tem que ser tipo nome@email.com'
  if (telefone) {
    const soNumeros = telefone.replace(/\D/g, '')
    if (soNumeros.length < 10 || soNumeros.length > 11) return 'Telefone tem que ter 10 ou 11 dígitos'
  }
  if (idade !== '') {
    const n = Number(idade)
    if (isNaN(n) || n < 0 || n > 120) return 'Idade tem que ser entre 0 e 120'
  }
  return null
}

function formatarTelefone(valor: string) {
  const soNumeros = valor.replace(/\D/g, '').slice(0, 11)
  if (soNumeros.length <= 2) return soNumeros
  if (soNumeros.length <= 6) return `(${soNumeros.slice(0, 2)}) ${soNumeros.slice(2)}`
  if (soNumeros.length <= 10) return `(${soNumeros.slice(0, 2)}) ${soNumeros.slice(2, 6)}-${soNumeros.slice(6)}`
  return `(${soNumeros.slice(0, 2)}) ${soNumeros.slice(2, 7)}-${soNumeros.slice(7)}`
}

export default function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [nomeEdit, setNomeEdit] = useState('')
  const [emailEdit, setEmailEdit] = useState('')
  const [telefoneEdit, setTelefoneEdit] = useState('')
  const [idadeEdit, setIdadeEdit] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [ordenarPorNome, setOrdenarPorNome] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [aba, setAba] = useState('cadastro')
  const [logadoNova, setLogadoNova] = useState(false)
  const [usuario, setUsuario] =useState('')
  const [senha, setSenha] =useState('')
  


  async function carregar() {
    try {
      setCarregando(true)
      const res = await fetch(API)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPessoas(data)
      } else {
        setPessoas([])
        setMensagem(data.erro || 'Backend respondeu, mas não veio lista')
      }
    } catch {
      setMensagem('Erro ao carregar pessoas - backend não está rodando?')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function cadastrar() {
    const erro = validar(nomeEdit, emailEdit, telefoneEdit, idadeEdit)
    if (erro) { setMensagem(erro); return }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeEdit.trim(),
          email: emailEdit.trim(),
          telefone: telefoneEdit || null,
          idade: idadeEdit ? Number(idadeEdit) : null
        })
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao cadastrar'); return }
      setMensagem('Cadastrado com sucesso!')
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit('')
      carregar()
    } catch { setMensagem('Erro ao conectar no backend') }
  }

  async function salvarEdicao() {
    if (editandoId === null) return
    const erro = validar(nomeEdit, emailEdit, telefoneEdit, idadeEdit)
    if (erro) { setMensagem(erro); return }
    try {
      const res = await fetch(`${API}/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeEdit.trim(),
          email: emailEdit.trim(),
          telefone: telefoneEdit || null,
          idade: idadeEdit ? Number(idadeEdit) : null
})
})
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao editar'); return }
      setMensagem('Editado com sucesso!')
      setEditandoId(null)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit('')
      carregar()
    } catch { setMensagem('Erro ao conectar no backend') }
  }

  async function deletar(id: number, nomePessoa: string) {
    if (!confirm(`Tem certeza que quer deletar ${nomePessoa}?`)) return
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) { setMensagem('Erro ao deletar'); return }
      setMensagem('Deletado com sucesso!')
      carregar()
    } catch { setMensagem('Erro ao conectar no backend') }
  }

  async function limparTudo() {
    if (pessoas.length === 0) return
    if (!confirm(`Tem certeza que quer apagar TODAS as ${pessoas.length} pessoas?`)) return
    try {
      for (const p of pessoas) {
        await fetch(`${API}/${p.id}`, { method: 'DELETE' })
      }
      setMensagem('Tudo apagado com sucesso!')
      setPagina(1)
      carregar()
    } catch { setMensagem('Erro ao limpar tudo') }
  }

  function comecarEditar(pessoa: Pessoa) {
    setEditandoId(pessoa.id)
    setNomeEdit(pessoa.nome)
    setEmailEdit(pessoa.email)
    setTelefoneEdit(pessoa.telefone || '')
    setIdadeEdit(pessoa.idade != null ? String(pessoa.idade) : '')
    setMensagem('')
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNomeEdit('')
    setEmailEdit('')
    setTelefoneEdit('')
    setIdadeEdit('')
  }

  const pessoasFiltradas = pessoas
    .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (!ordenarPorNome) return 0
      return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
    })

  const porPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(pessoasFiltradas.length / porPagina))
  const inicio = (pagina - 1) * porPagina
  const pessoasDaPagina = pessoasFiltradas.slice(inicio, inicio + porPagina)

  return (
    <div style={{ padding: 24, fontFamily: 'Arial', background: '#1f2028', maxWidth: 700, margin: '40px auto', borderRadius: 16, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
      <div className="perfil" style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="/desenho.webp" alt="Meu desenho" className="foto-desenho" />
        <h1 style={{ lineHeight: 1.2, marginTop: 16, marginBottom: 8, fontSize: 32, whiteSpace: 'normal' }}>Cadastro de Pessoas - CRUD</h1>
        <p style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600, marginTop: 4 }}>Total: {pessoas.length} pessoas</p>
      </div>

      <div style={{ textAlign: 'center',display: aba === 'cadastro' ? 'block' : 'none' }}>
        <input placeholder="Nome" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
        <input placeholder="Email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} style={{ marginLeft: 8 }} />
        <br /><br />
        <input
          placeholder="Telefone (opcional)"
          value={telefoneEdit}
          onChange={(e) => setTelefoneEdit(formatarTelefone(e.target.value))}
        />
        <input
          placeholder="Idade (opcional)"
          value={idadeEdit}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, '').slice(0, 3)
            if (valor !== '' && Number(valor) > 120) valor = '120'
            setIdadeEdit(valor)
}}
          style={{ marginLeft: 8 }}
        />
        <br /><br />
        {editandoId === null ? (
          <button onClick={cadastrar} style={{ marginLeft: 8, background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cadastrar</button>
) : (
          <>
            <button onClick={salvarEdicao} style={{ marginLeft: 8, background: '#22c55e', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Salvar Edição</button>
            <button onClick={cancelarEdicao} style={{ marginLeft: 8, background: '#6b7280', color: '#ffffff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          </>
)}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button onClick={() => setAba('cadastro')}>Cadastro</button>
        <button onClick={() => setAba('nova')}>Nova Página</button>
      </div>
      

<div style={{ display: aba === 'cadastro' ? 'block' : 'none' }}> 
 
   


      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <input placeholder="Buscar por nome ou email..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />
        {busca && <button onClick={() => { setBusca(''); setPagina(1) }} style={{ marginLeft: 8, background: '#6b7280', color: '#ffffff', border: 'none', padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}>X</button>}
      </div>

      {mensagem && <p style={{ textAlign: 'center', background: mensagem.includes('sucesso') ? '#22c55e' : '#ef4444', color: '#ffffff', padding: '10px', borderRadius: 8, fontWeight: 600 }}>{mensagem}</p>}

      <p style={{ textAlign: 'center', color: '#e5e7eb', fontSize: 14 }}>Mostrando {pessoasDaPagina.length} de {pessoas.length} pessoas</p>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setOrdenarPorNome(!ordenarPorNome)} style={{ background: '#1f2028', color: '#ffffff', border: '1px solid #4b5563', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}>{ordenarPorNome ? 'Ordenado A-Z' : 'Ordenar A-Z'}</button>
        <button onClick={limparTudo} style={{ marginLeft: 8, background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Limpar Tudo</button>
      </div>

      {carregando ? <p style={{ textAlign: 'center' }}>Carregando...</p> : (
        <ul style={{ padding: 0 }}>
          {pessoasDaPagina.map((p) => (
            <li key={p.id} style={{ background: '#2e303a', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
              <span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade !== null && p.idade !== undefined && <span> - {p.idade} anos</span>}</span>
              <span>
                <button onClick={() => comecarEditar(p)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}>Editar</button>
                <button onClick={() => deletar(p.id, p.nome)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Deletar</button>
              </span>
            </li>
))}
        </ul>
)}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button>
        <span>Pagina {pagina} de {totalPaginas}</span>
        <button onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas}>Proxima</button>
        <span>Pagina {pagina} de {totalPaginas}</span>
        
      </div>


      </div>
      {aba === 'nova' && (
     <div style={{ textAlign: 'center', marginTop: 20 }}>
    {!logadoNova ? (
      <div>
        <h2>Login - Nova Página</h2>
        <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <br /><br />
        <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <br /><br />
        <button onClick={() => {
          if (usuario === 'admin' && senha === '1234') {
            setLogadoNova(true)
} else {
            alert('Usuário ou senha errados!')
}
        }}>Entrar</button>
      </div>
) : (
      <div>
        <h2>Nova Página</h2>
        <p>Você entrou na nova página!</p>

        <button onClick={() => {
          setLogadoNova(false)
          setUsuario('')
          setSenha('')
          setAba('cadastro')
}}>Sair</button>
      </div>
)}
      </div>
)}

      </div>  
)}
