import { useEffect, useState } from 'react'
import './App.css'

type Pessoa = {
  id: number
  nome: string
  email: string
  telefone?: string | null
  idade?: number | null
  setor?: string | null
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

function corSetor(setor?: string | null) {
  if (setor === 'compras') return '#8b5cf6'
  if (setor === 'marketing') return '#ec4899'
  if (setor === 'vendas') return '#22c55e'
  return '#3b82f6'
}

export default function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [nomeEdit, setNomeEdit] = useState('')
  const [emailEdit, setEmailEdit] = useState('')
  const [telefoneEdit, setTelefoneEdit] = useState('')
  const [idadeEdit, setIdadeEdit] = useState('')
  const [setorEdit, setSetorEdit] = useState('admin')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [ordenarPorNome, setOrdenarPorNome] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [aba, setAba] = useState('login')
  const [logadoNova, setLogadoNova] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('todos')

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
          idade: idadeEdit ? Number(idadeEdit) : null,
          setor: setorEdit
        })
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao cadastrar'); return }
      setMensagem(`Cadastrado com sucesso para ${setorEdit}!`)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin')
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
          idade: idadeEdit ? Number(idadeEdit) : null,
          setor: setorEdit
        })
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao editar'); return }
      setMensagem('Editado com sucesso!')
      setEditandoId(null)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin')
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
    setSetorEdit(pessoa.setor || 'admin')
    setMensagem('')
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNomeEdit('')
    setEmailEdit('')
    setTelefoneEdit('')
    setIdadeEdit('')
    setSetorEdit('admin')
  }

  function sair() {
    setLogadoNova(false)
    setUsuario('')
    setSenha('')
    setTipoUsuario('')
    setAba('login')
  }

  function fazerLogin() {
    if (usuario === 'admin' && senha === '1234') {
      setTipoUsuario('admin')
      setLogadoNova(true)
      setAba('admin')
    } else if (usuario === 'compras' && senha === '1234') {
      setTipoUsuario('compras')
      setLogadoNova(true)
      setAba('compras')
      } else if (usuario === 'vendas' && senha === '1234') {
      setTipoUsuario('vendas')
      setLogadoNova(true)
      setAba('vendas')
    } else if (usuario === 'marketing' && senha === '1234') {
      setTipoUsuario('marketing')
      setLogadoNova(true)
      setAba('marketing')
    } else {
      alert('Usuário ou senha errados!')
    }
  }

  // DASHBOARD - contas
  const totalCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras').length
  const totalVendas = pessoas.filter(p => (p.setor || 'admin') === 'vendas').length
  const totalMarketing = pessoas.filter(p => (p.setor || 'admin') === 'marketing').length
  const totalAdmin = pessoas.filter(p => (p.setor || 'admin') === 'admin').length

  const pessoasFiltradas = pessoas
    .filter((p) => {
      const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase())
      const bateSetor = filtroSetor === 'todos' || (p.setor || 'admin') === filtroSetor
      return bateBusca && bateSetor
    })
    .sort((a, b) => {
      if (!ordenarPorNome) return 0
      return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
    })

  // Cada setor só vê o dele. Quem é admin aparece em todo mundo.
  const pessoasCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras' || (p.setor || 'admin') === 'admin')
  const pessoasMarketing = pessoas.filter(p => (p.setor || 'admin') === 'marketing' || (p.setor || 'admin') === 'admin')
  const pessoasVendas = pessoas.filter(p => (p.setor || 'admin') === 'vendas' || (p.setor || 'admin') === 'admin')

  const porPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(pessoasFiltradas.length / porPagina))
  const inicio = (pagina - 1) * porPagina
  const pessoasDaPagina = pessoasFiltradas.slice(inicio, inicio + porPagina)

  function ListaSetor({ lista, titulo }: { lista: Pessoa[], titulo: string }) {
    return (
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <h2>{titulo}</h2>
        <p style={{ color: '#e5e7eb' }}>Total nesse setor: {lista.length}</p>
        {lista.length === 0 ? <p style={{ color: '#9ca3af' }}>Nenhuma pessoa cadastrada para esse setor ainda.</p> : (
          <ul style={{ padding: 0, textAlign: 'left' }}>
            {lista.map(p => (
              <li key={p.id} style={{ background: '#2e303a', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                <span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade != null && <span> - {p.idade} anos</span>}</span>
                <span style={{ background: corSetor(p.setor), color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{p.setor || 'admin'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  function CardDashboard({ titulo, valor, cor, ativo, aoClicar, emoji }: { titulo: string, valor: number, cor: string, ativo: boolean, aoClicar: () => void, emoji: string }) {
    return (
      <button onClick={() => { aoClicar(); setPagina(1) }} style={{ background: ativo ? cor : '#2e303a', color: '#fff', border: ativo ? `2px solid ${cor}` : '1px solid #4b5563', padding: '16px 12px', borderRadius: 12, cursor: 'pointer', flex: 1, minWidth: 120, textAlign: 'center' }}>
        <div style={{ fontSize: 26 }}>{emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{valor}</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{titulo}</div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{ativo ? 'Filtrando • Clique pra limpar' : 'Clique pra filtrar'}</div>
      </button>
    )
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial', background: '#1f2028', maxWidth: 700, margin: '40px auto', borderRadius: 16, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
      <div className="perfil" style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="/desenho.webp" alt="Meu desenho" className="foto-desenho" />
        <h1 style={{ lineHeight: 1.2, marginTop: 16, marginBottom: 8, fontSize: 32, whiteSpace: 'normal' }}>Cadastro de Pessoas - CRUD</h1>
        <p style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600, marginTop: 4 }}>Total: {pessoas.length} pessoas</p>
      </div>

      {logadoNova && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (
            <button onClick={() => setAba('compras')} style={{ marginRight: 8, background: aba === 'compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Compras</button>
          )}
          {(tipoUsuario === 'admin' || tipoUsuario === 'marketing') && (
            <button onClick={() => setAba('marketing')} style={{ marginRight: 8, background: aba === 'marketing' ? '#be185d' : '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Marketing</button>
          )}
          {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && (
            <button onClick={() => setAba('vendas')} style={{ marginRight: 8, background: aba === 'vendas' ? '#1bbe18' : '#ecb048', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>vendas</button>
          )}
          {tipoUsuario === 'admin' && (
            <button onClick={() => setAba('admin')} style={{ marginRight: 8, background: aba === 'admin' ? '#1d4ed8' : '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Admin</button>
          )}
          <button onClick={sair} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Sair</button>
        </div>
      )}

      {aba === 'login' && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h2>Login</h2>
          <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          <br /><br />
          <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') fazerLogin() }} />
          <br /><br />
          <button onClick={fazerLogin} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Entrar</button>
        </div>
      )}

      {aba === 'admin' && (
        <div>
          {/* DASHBOARD */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ textAlign: 'center', marginBottom: 12 }}>📊 Dashboard</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <CardDashboard titulo="TOTAL" valor={pessoas.length} cor="#3b82f6" ativo={filtroSetor === 'todos'} aoClicar={() => setFiltroSetor('todos')} emoji="👥" />
              <CardDashboard titulo="COMPRAS" valor={totalCompras} cor="#8b5cf6" ativo={filtroSetor === 'compras'} aoClicar={() => setFiltroSetor(filtroSetor === 'compras' ? 'todos' : 'compras')} emoji="🛒" />
              <CardDashboard titulo="VENDAS" valor={totalVendas} cor="#22c55e" ativo={filtroSetor === 'vendas'} aoClicar={() => setFiltroSetor(filtroSetor === 'vendas' ? 'todos' : 'vendas')} emoji="💰" />
              <CardDashboard titulo="MARKETING" valor={totalMarketing} cor="#ec4899" ativo={filtroSetor === 'marketing'} aoClicar={() => setFiltroSetor(filtroSetor === 'marketing' ? 'todos' : 'marketing')} emoji="📣" />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <div style={{ background: '#2e303a', border: '1px solid #4b5563', padding: '10px 12px', borderRadius: 10, flex: 1, textAlign: 'center', color: '#e5e7eb', fontSize: 13 }}>
                <b>Todos / Admin:</b> {totalAdmin} pessoas aparecem em todos os setores
              </div>
            </div>
            {filtroSetor !== 'todos' && (
              <p style={{ textAlign: 'center', color: '#fbbf24', fontWeight: 700, marginTop: 10 }}>
                Filtrando por: {filtroSetor.toUpperCase()} • <span onClick={() => setFiltroSetor('todos')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Limpar filtro</span>
              </p>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <input placeholder="Nome" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
            <input placeholder="Email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} style={{ marginLeft: 8 }} />
            <br /><br />
            <input placeholder="Telefone (opcional)" value={telefoneEdit} onChange={(e) => setTelefoneEdit(formatarTelefone(e.target.value))} />
            <input placeholder="Idade (opcional)" value={idadeEdit} onChange={(e) => {
              let valor = e.target.value.replace(/\D/g, '').slice(0, 3)
              if (valor !== '' && Number(valor) > 120) valor = '120'
              setIdadeEdit(valor)
            }} style={{ marginLeft: 8 }} />
            <br /><br />
            <label style={{ color: '#e5e7eb', fontWeight: 600 }}>Vai para qual setor? </label>
            <select value={setorEdit} onChange={(e) => setSetorEdit(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #4b5563', background: '#2e303a', color: '#fff', fontWeight: 600 }}>
              <option value="admin">Todos / Admin - aparece em tudo</option>
              <option value="compras">Só Compras</option>
              <option value="marketing">Só Marketing</option>
              <option value="vendas">Só Vendas</option>
            </select>
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

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <input placeholder="Buscar por nome ou email..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />
            {busca && <button onClick={() => { setBusca(''); setPagina(1) }} style={{ marginLeft: 8, background: '#6b7280', color: '#ffffff', border: 'none', padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}>X</button>}
          </div>

          {mensagem && <p style={{ textAlign: 'center', background: mensagem.includes('sucesso') ? '#22c55e' : '#ef4444', color: '#ffffff', padding: '10px', borderRadius: 8, fontWeight: 600 }}>{mensagem}</p>}

          <p style={{ textAlign: 'center', color: '#e5e7eb', fontSize: 14 }}>Mostrando {pessoasDaPagina.length} de {pessoasFiltradas.length} pessoas {filtroSetor !== 'todos' ? `(filtro: ${filtroSetor})` : ''}</p>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setOrdenarPorNome(!ordenarPorNome)} style={{ background: '#1f2028', color: '#ffffff', border: '1px solid #4b5563', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}>{ordenarPorNome ? 'Ordenado A-Z' : 'Ordenar A-Z'}</button>
            <button onClick={limparTudo} style={{ marginLeft: 8, background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Limpar Tudo</button>
          </div>

          {carregando ? <p style={{ textAlign: 'center' }}>Carregando...</p> : (
            <ul style={{ padding: 0 }}>
              {pessoasDaPagina.map((p) => (
                <li key={p.id} style={{ background: '#2e303a', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                  <span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade !== null && p.idade !== undefined && <span> - {p.idade} anos</span>} <span style={{ background: corSetor(p.setor), color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginLeft: 6, textTransform: 'uppercase' }}>{p.setor || 'admin'}</span></span>
                  <span>
                    <button onClick={() => comecarEditar(p)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}>Editar</button>
                    <button onClick={() => deletar(p.id, p.nome)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Deletar</button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1} style={{ background: pagina === 1 ? '#4b5563' : '#3b82f6', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: pagina === 1 ? 'not-allowed' : 'pointer', marginRight: 8 }}>Anterior</button>
            <span style={{ color: '#e5e7eb' }}>Pagina {pagina} de {totalPaginas}</span>
            <button onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas} style={{ background: pagina === totalPaginas ? '#4b5563' : '#3b82f6', color: '#ffffff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer', marginLeft: 8 }}>Proxima</button>
          </div>
        </div>
      )}

      {aba === 'compras' && <ListaSetor lista={pessoasCompras} titulo="Setor de Compras" />}
      {aba === 'vendas' && <ListaSetor lista={pessoasVendas} titulo="Setor de vendas" />}
      {aba === 'marketing' && <ListaSetor lista={pessoasMarketing} titulo="Setor de Marketing" />}

    </div>
  )
}