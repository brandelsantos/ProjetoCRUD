import { useEffect, useState } from 'react'
import './App.css'

type Pessoa = {
  id: number
  nome: string
  email: string
  telefone?: string | null
  idade?: number | null
  setor?: string | null
  usuario?: string | null
  senha?: string | null
}

type Lead = {
  id: number
  nome: string
  whatsapp: string
  precisa: string
  criado_em?: string
}

type Perfil = {
  id?: number
  pessoa_id: number
  foto: string
  bio: string
  cargo: string
  instagram: string
  whatsapp: string
}

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/pessoas`

function validar(nome: string, email: string, telefone: string, idade: string, usuario: string, senha: string) {
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
  if (!usuario.trim()) return 'Usuário é obrigatório pra pessoa conseguir logar'
  if (usuario.trim().length < 3) return 'Usuário tem que ter no mínimo 3 letras'
  if (!/^[A-Za-z0-9._-]+$/.test(usuario.trim())) return 'Usuário só pode ter letras, números, ponto, underline e traço'
  if (!senha) return 'Senha é obrigatória pra pessoa conseguir logar'
  if (senha.length < 4) return 'Senha tem que ter no mínimo 4 caracteres'
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
  const [usuarioEdit, setUsuarioEdit] = useState('')
  const [senhaEdit, setSenhaEdit] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
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
  const [nomeLogado, setNomeLogado] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [mostrarSobre, setMostrarSobre] = useState(false)
  const [nomeLead, setNomeLead] = useState('')
  const [whatsLead, setWhatsLead] = useState('')
  const [precisaLead, setPrecisaLead] = useState('Quero mais clientes no instagram')
  const [enviadoLead, setEnviadoLead] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [enviandoLead, setEnviandoLead] = useState(false)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [fotoPerfil, setFotoPerfil] = useState('/desenho.webp')
  const [bioPerfil, setBioPerfil] = useState('')
  const [cargoPerfil, setCargoPerfil] = useState('')
  const [instaPerfil, setInstaPerfil] = useState('')
  const [whatsPerfil, setWhatsPerfil] = useState('')
  const [idPessoaLogada, setIdPessoaLogada] = useState<number | null>(null)
  const [acessosPerfil, setAcessosPerfil] = useState<any[]>([])
  const [idPessoaPerfilAdmin, setIdPessoaPerfilAdmin] = useState<number | null>(null)
  const [fotoAdmin, setFotoAdmin] = useState('/desenho.webp')
  const [bioAdmin, setBioAdmin] = useState('')
  const [cargoAdmin, setCargoAdmin] = useState('')
  const [instaAdmin, setInstaAdmin] = useState('')
  const [whatsAdmin, setWhatsAdmin] = useState('')

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

  useEffect(() => { carregar(); carregarLeads(); carregarAcessosPerfil() }, [])

  async function cadastrar() {
    const erro = validar(nomeEdit, emailEdit, telefoneEdit, idadeEdit, usuarioEdit, senhaEdit)
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
          setor: setorEdit,
          usuario: usuarioEdit.trim(),
          senha: senhaEdit
        })
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao cadastrar'); return }
      setMensagem(`Cadastrado com sucesso para ${setorEdit}! Usuário: ${usuarioEdit}`)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin'); setUsuarioEdit(''); setSenhaEdit('')
      carregar()
    } catch { setMensagem('Erro ao conectar no backend') }
  }

  async function salvarEdicao() {
    if (editandoId === null) return
    const erro = validar(nomeEdit, emailEdit, telefoneEdit, idadeEdit, usuarioEdit, senhaEdit)
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
          setor: setorEdit,
          usuario: usuarioEdit.trim(),
          senha: senhaEdit
        })
      })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao editar'); return }
      setMensagem('Editado com sucesso!')
      setEditandoId(null)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin'); setUsuarioEdit(''); setSenhaEdit('')
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
    setUsuarioEdit(pessoa.usuario || '')
    setSenhaEdit(pessoa.senha || '')
    setMensagem('')
    carregarPerfilAdmin(pessoa.id)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNomeEdit('')
    setEmailEdit('')
    setTelefoneEdit('')
    setIdadeEdit('')
    setSetorEdit('admin')
    setUsuarioEdit('')
    setSenhaEdit('')
  }

  function sair() {
    setLogadoNova(false)
    setUsuario('')
    setSenha('')
    setTipoUsuario('')
    setNomeLogado('')
    setAba('login')
    setIdPessoaLogada(null)
    setPerfil(null)
    setFotoPerfil('/desenho.webp')
    setBioPerfil('')
    setCargoPerfil('')
    setInstaPerfil('')
    setWhatsPerfil('')
    setIdPessoaPerfilAdmin(null)
  }

  async function carregarLeads() {
    try {
      const res = await fetch(`${API.replace('/pessoas', '')}/leads`)
      const data = await res.json()
      if (Array.isArray(data)) setLeads(data)
    } catch { }
  }

  async function apagarLead(id: number, nomeLeadApagar: string) {
    if (!confirm(`Já atendeu ${nomeLeadApagar}? Apagar da lista?`)) return
    await fetch(`${API.replace('/pessoas', '')}/leads/${id}`, { method: 'DELETE' })
    carregarLeads()
  }

  async function carregarPerfil(pessoaId: number) {
    try {
      const res = await fetch(`${API.replace('/pessoas', '')}/perfil/${pessoaId}`)
      const data = await res.json()
      if (data) {
        setPerfil(data)
        setFotoPerfil(data.foto || '/desenho.webp')
        setBioPerfil(data.bio || '')
        setCargoPerfil(data.cargo || '')
        setInstaPerfil(data.instagram || '')
        setWhatsPerfil(data.whatsapp || '')
      }
    } catch { }
  }

  async function carregarPerfilAdmin(pessoaId: number) {
    setIdPessoaPerfilAdmin(pessoaId)
    try {
      const res = await fetch(`${API.replace('/pessoas', '')}/perfil/${pessoaId}`)
      const data = await res.json()
      setFotoAdmin(data?.foto || '/desenho.webp')
      setBioAdmin(data?.bio || '')
      setCargoAdmin(data?.cargo || '')
      setInstaAdmin(data?.instagram || '')
      setWhatsAdmin(data?.whatsapp || '')
    } catch {
      setFotoAdmin('/desenho.webp'); setBioAdmin(''); setCargoAdmin(''); setInstaAdmin(''); setWhatsAdmin('')
    }
  }

  async function salvarPerfilAdmin() {
    if (tipoUsuario !== 'admin') { alert('Só o admin pode editar perfil.'); return }
    if (!idPessoaPerfilAdmin) { alert('Escolhe a pessoa primeiro.'); return }
    const res = await fetch(`${API.replace('/pessoas', '')}/perfil`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pessoa_id: idPessoaPerfilAdmin, foto: fotoAdmin, bio: bioAdmin, cargo: cargoAdmin, instagram: instaAdmin, whatsapp: whatsAdmin, tipo: 'admin' })
    })
    const data = await res.json()
    if (!res.ok) { alert(data.erro || 'Erro ao salvar perfil'); return }
    alert('Perfil salvo pelo admin!')
    if (idPessoaLogada === idPessoaPerfilAdmin) carregarPerfil(idPessoaPerfilAdmin)
  }

  async function carregarAcessosPerfil() {
    try {
      const res = await fetch(`${API.replace('/pessoas', '')}/acessos-perfil`)
      const data = await res.json()
      if (Array.isArray(data)) setAcessosPerfil(data)
    } catch { }
  }

  const totalCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras').length
  const totalVendas = pessoas.filter(p => (p.setor || 'admin') === 'vendas').length
  const totalMarketing = pessoas.filter(p => (p.setor || 'admin') === 'marketing').length
  const totalAdmin = pessoas.filter(p => (p.setor || 'admin') === 'admin').length

  const pessoasFiltradas = pessoas
    .filter((p) => {
      const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase()) || (p.usuario || '').toLowerCase().includes(busca.toLowerCase())
      const bateSetor = filtroSetor === 'todos' || (p.setor || 'admin') === filtroSetor
      return bateBusca && bateSetor
    })
    .sort((a, b) => {
      if (!ordenarPorNome) return 0
      return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
    })

  const pessoasCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras' || (p.setor || 'admin') === 'admin')
  const pessoasVendas = pessoas.filter(p => (p.setor || 'admin') === 'vendas' || (p.setor || 'admin') === 'admin')

  const porPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(pessoasFiltradas.length / porPagina))
  const inicio = (pagina - 1) * porPagina
  const pessoasDaPagina = pessoasFiltradas.slice(inicio, inicio + porPagina)

  // Dados da pessoa logada pra mostrar na aba Meu Perfil
  const pessoaLogada = pessoas.find(p => p.id === idPessoaLogada)

  function ListaSetor({ lista, titulo }: { lista: Pessoa[], titulo: string }) {
    return (
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <h2>{titulo}</h2>
        <p style={{ color: '#e5e7eb' }}>Olá, {nomeLogado}! Total nesse setor: {lista.length}</p>
        {lista.length === 0 ? <p style={{ color: '#9ca3af' }}>Nenhuma pessoa cadastrada para esse setor ainda.</p> : (
          <ul style={{ padding: 0, textAlign: 'left' }}>
            {lista.map(p => (
              <li key={p.id} style={{ background: '#2e303a', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                <span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade != null && <span> - {p.idade} anos</span>}{p.usuario && <span> - @{p.usuario}</span>}</span>
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20, height: 'auto', overflow: 'visible' }}>
    {aba !== 'anuncio' && aba !== 'perfil' && aba !== 'perfil-compras' && (        <div className="perfil" style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/desenho.webp" alt="Meu desenho" className="foto-desenho" />
          <h1 style={{ lineHeight: 1.2, marginTop: 16, marginBottom: 8, fontSize: 32, whiteSpace: 'normal' }}>Cadastro de Pessoas - CRUD</h1>
          <p style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600, marginTop: 4 }}>Total: {pessoas.length} pessoas</p>
          {logadoNova && <p style={{ color: '#22c55e', fontWeight: 700 }}>Logado como: {nomeLogado} ({tipoUsuario})</p>}
        </div>
      )}

      {logadoNova && (
        <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: (aba === 'anuncio' || aba === 'perfil') ? 16 : 0 }}>
          {/* ABA 1 - MEU PERFIL - todo mundo que logou com pessoa cadastrada vê */}
          {idPessoaLogada && (
            <button onClick={() => setAba('perfil')} style={{ marginRight: 8, background: aba === 'perfil' ? '#0f766e' : '#14b8a6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>👤 Meu Perfil</button>
          )}
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (
  <button onClick={() => setAba('perfil-compras')} style={{ marginRight: 8, background: aba === 'perfil-compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Perfil Compras</button>
)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (
            <button onClick={() => setAba('compras')} style={{ marginRight: 8, background: aba === 'compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Compras</button>
          )}
          {/* ABA 2 - ANÚNCIO - era a aba Marketing */}
          {(tipoUsuario === 'admin' || tipoUsuario === 'marketing') && (
            <button onClick={() => setAba('anuncio')} style={{ marginRight: 8, background: aba === 'anuncio' ? '#be185d' : '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>📣 Anúncio</button>
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
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Entre com o usuário do setor ou com o usuário da pessoa cadastrada</p>
          <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          <br /><br />
          <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <br /><br />
          <button onClick={async () => {
            const res = await fetch(`${API.replace('/pessoas', '')}/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuario, senha })
            })
            const data = await res.json()
            if (!res.ok) {
              alert('Usuário ou senha errados!')
              return
            }
            setTipoUsuario(data.tipo)
            setNomeLogado(data.nome || usuario)
            setLogadoNova(true)
            // Se é pessoa cadastrada, cai na aba Meu Perfil. Se é usuário fixo, cai no setor dele.
            if (data.id) {
              setIdPessoaLogada(data.id)
              carregarPerfil(data.id)
              setAba('perfil')
            } else {
              setIdPessoaLogada(null)
              setPerfil(null)
              if (data.tipo === 'marketing') setAba('anuncio')
              else if (data.tipo === 'compras') setAba('perfil-compras')
              else setAba(data.tipo)            }
          }}>Entrar</button>
        </div>
      )}

      {/* ========== ABA 1 - MEU PERFIL ========== */}
      {aba === 'perfil' && (
        <div>
          <h2 style={{ textAlign: 'center' }}>👤 Meu Perfil</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui você só vê. Quem edita é só o admin, lá no cadastro.</p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
            {/* Cartão do perfil */}
            <div style={{ background: '#1f2028', padding: 24, borderRadius: 12, width: 320, textAlign: 'center' }}>
              <img src={perfil?.foto || fotoPerfil || '/desenho.webp'} alt="Foto do perfil" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ec4899' }} />
              <h3 style={{ margin: '12px 0 2px 0', fontSize: 20 }}>{nomeLogado}</h3>
              <p style={{ color: '#f9a8d4', margin: 0, fontWeight: 700 }}>{cargoPerfil || tipoUsuario}</p>
              {bioPerfil && <p style={{ color: '#e5e7eb', fontSize: 14, marginTop: 10 }}>{bioPerfil}</p>}
              {instaPerfil && <p style={{ color: '#9ca3af', fontSize: 13, margin: '6px 0 0 0' }}>📸 {instaPerfil}</p>}
              {whatsPerfil && <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 0 0' }}>📱 {whatsPerfil}</p>}
              <p style={{ color: '#6b7280', fontSize: 11, marginTop: 14, borderTop: '1px solid #333', paddingTop: 10 }}>🔒 Perfil editado só pelo admin.<br />Fala com o admin pra mudar.</p>
            </div>

            {/* Outras informações - aqui a gente vai colocando no futuro */}
            <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 280 }}>
              <h3 style={{ marginTop: 0 }}>Minhas informações</h3>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Nome:</b> {pessoaLogada?.nome || nomeLogado}</p>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Email:</b> {pessoaLogada?.email || '-'}</p>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Telefone:</b> {pessoaLogada?.telefone || '-'}</p>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Idade:</b> {pessoaLogada?.idade != null ? `${pessoaLogada.idade} anos` : '-'}</p>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Setor:</b> {pessoaLogada?.setor || tipoUsuario}</p>
              <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Usuário:</b> @{pessoaLogada?.usuario || usuario}</p>

              <div style={{ background: '#1f2028', padding: 14, borderRadius: 10, marginTop: 16 }}>
                <h4 style={{ margin: '0 0 6px 0' }}>📌 Em breve aqui</h4>
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Aqui a gente vai colocar as outras informações no futuro: avisos, tarefas, histórico, etc. Por enquanto é só o perfil + dados do cadastro.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {aba === 'admin' && (
        <div>
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

          <div style={{ background: '#2e303a', border: '1px solid #ec4899', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>📣 Leads do Marketing - {leads.length}</h2>
            {leads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>Nenhum lead ainda. Quando alguém preencher o Quero crescer, aparece aqui.</p>
            ) : (
              <ul style={{ padding: 0 }}>
                {leads.map(l => (
                  <li key={l.id} style={{ background: '#1f2028', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none', flexWrap: 'wrap', gap: 8 }}>
                    <span><b>{l.nome}</b> - {l.whatsapp} <br /><span style={{ color: '#f9a8d4', fontSize: 13 }}>{l.precisa}</span></span>
                    <span style={{ display: 'flex', gap: 6 }}>
                      <a href={`https://wa.me/55${l.whatsapp.replace(/\D/g, '')}?text=Olá ${encodeURIComponent(l.nome)}! Vi que você quer ${encodeURIComponent(l.precisa)} - bora falar do seu crescimento?`} target="_blank" style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600 }}>Chamar no WhatsApp</a>
                      <button onClick={() => apagarLead(l.id, l.nome)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Já atendi</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ textAlign: 'center', marginBottom: 0 }}><button onClick={carregarLeads} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Atualizar leads</button></p>
          </div>

          <div style={{ background: '#2e303a', border: '1px solid #3b82f6', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>👀 Acessos de Perfil - {acessosPerfil.length}</h2>
            {acessosPerfil.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>Ninguém viu nenhum perfil ainda.</p>
            ) : (
              <ul style={{ padding: 0 }}>
                {acessosPerfil.map(a => (
                  <li key={a.id} style={{ background: '#1f2028', padding: '10px 14px', borderRadius: 10, marginBottom: 8, listStyle: 'none', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <span><b>{a.quem_viu_nome}</b> viu o perfil de <b>{a.perfil_nome}</b></span>
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(a.criado_em).toLocaleString('pt-BR')}</span>
                  </li>
                ))}
              </ul>
            )}
            <p style={{ textAlign: 'center', marginBottom: 0 }}><button onClick={carregarAcessosPerfil} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Atualizar acessos</button></p>
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
            <input placeholder="Usuário pra login - ex: joao.silva" value={usuarioEdit} onChange={(e) => setUsuarioEdit(e.target.value)} />
            <input placeholder="Senha pra login" type={mostrarSenha ? 'text' : 'password'} value={senhaEdit} onChange={(e) => setSenhaEdit(e.target.value)} style={{ marginLeft: 8 }} />
            <button onClick={() => setMostrarSenha(!mostrarSenha)} style={{ marginLeft: 8, background: '#4b5563', color: '#fff', border: 'none', padding: '10px 10px', borderRadius: 8, cursor: 'pointer' }}>{mostrarSenha ? '🙈' : '👁'}</button>
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

          <div style={{ background: '#1f2028', border: '1px solid #ec4899', padding: 16, borderRadius: 12, marginTop: 20 }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>👤 Perfil da Pessoa - Só o Admin edita</h2>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 0 }}>A pessoa só vê o perfil dela. Ela não consegue editar.</p>
            <div style={{ textAlign: 'center' }}>
              <label style={{ color: '#e5e7eb', fontWeight: 600 }}>Editar perfil de: </label>
              <select value={idPessoaPerfilAdmin ?? ''} onChange={(e) => { const v = Number(e.target.value); if (v) carregarPerfilAdmin(v) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #4b5563', background: '#2e303a', color: '#fff', fontWeight: 600, minWidth: 220 }}>
                <option value="">Escolhe a pessoa...</option>
                {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} - @{p.usuario}</option>)}
              </select>
            </div>
            {idPessoaPerfilAdmin ? (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <img src={fotoAdmin} alt="Foto" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ec4899' }} />
                <br /><br />
                <input placeholder="Link da foto" value={fotoAdmin} onChange={(e) => setFotoAdmin(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 8 }} />
                <br />
                <input placeholder="Cargo - ex: Designer" value={cargoAdmin} onChange={(e) => setCargoAdmin(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 8 }} />
                <br />
                <input placeholder="Instagram - ex: @seu.nome" value={instaAdmin} onChange={(e) => setInstaAdmin(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 8 }} />
                <br />
                <input placeholder="WhatsApp" value={whatsAdmin} onChange={(e) => setWhatsAdmin(formatarTelefone(e.target.value))} style={{ width: '100%', maxWidth: 400, marginBottom: 8 }} />
                <br />
                <textarea placeholder="Bio da pessoa..." value={bioAdmin} onChange={(e) => setBioAdmin(e.target.value)} style={{ width: '100%', maxWidth: 400, minHeight: 60, padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', border: '1px solid #4b5563', boxSizing: 'border-box' }} />
                <br />
                <button onClick={salvarPerfilAdmin} style={{ marginTop: 10, background: '#ec4899', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Salvar Perfil da Pessoa</button>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>Clica em <b>Editar</b> na lista embaixo, ou escolhe a pessoa aqui em cima.</p>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <input placeholder="Buscar por nome, email ou usuário..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />
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
                  <span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade !== null && p.idade !== undefined && <span> - {p.idade} anos</span>}{p.usuario && <span> - @{p.usuario}</span>} <span style={{ background: corSetor(p.setor), color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginLeft: 6, textTransform: 'uppercase' }}>{p.setor || 'admin'}</span></span>
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

      {/* AREA COMPRAS - ABA COM PERFIL */}
{aba === 'perfil-compras' && (
  <div>
    <h2 style={{ textAlign: 'center' }}>Perfil Compras</h2>
    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui voce so ve. Quem edita e so o admin, la no cadastro.</p>

    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ background: '#1f2028', padding: 24, borderRadius: 12, width: 320, textAlign: 'center' }}>
        <img src={perfil?.foto || fotoPerfil || '/desenho.webp'} alt="Foto do perfil" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #8b5cf6' }} />
        <h3 style={{ margin: '12px 0 2px 0', fontSize: 20 }}>{nomeLogado}</h3>
        <p style={{ color: '#c4b5fd', margin: 0, fontWeight: 700 }}>{cargoPerfil || 'Compras'}</p>
        {bioPerfil && <p style={{ color: '#e5e7eb', fontSize: 14, marginTop: 10 }}>{bioPerfil}</p>}
        {instaPerfil && <p style={{ color: '#9ca3af', fontSize: 13, margin: '6px 0 0 0' }}>{instaPerfil}</p>}
        {whatsPerfil && <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 0 0' }}>{whatsPerfil}</p>}
        <p style={{ color: '#6b7280', fontSize: 11, marginTop: 14, borderTop: '1px solid #333', paddingTop: 10 }}>Perfil editado so pelo admin.</p>
      </div>

      <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 280 }}>
        <h3 style={{ marginTop: 0 }}>Minhas informacoes - Compras</h3>
        <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Nome:</b> {pessoaLogada?.nome || nomeLogado}</p>
        <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Email:</b> {pessoaLogada?.email || '-'}</p>
        <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Telefone:</b> {pessoaLogada?.telefone || '-'}</p>
        <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Setor:</b> Compras</p>
        <p style={{ color: '#e5e7eb', margin: '6px 0' }}><b>Usuario:</b> @{pessoaLogada?.usuario || usuario}</p>

        <div style={{ background: '#1f2028', padding: 14, borderRadius: 10, marginTop: 16 }}>
          <h4 style={{ margin: '0 0 6px 0' }}>Em breve aqui</h4>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Aqui a gente vai colocar as outras informacoes de Compras no futuro: pedidos, fornecedores, etc.</p>
        </div>
      </div>
    </div>
  </div>
)}

      {aba === 'compras' && <ListaSetor lista={pessoasCompras} titulo="Setor de Compras" />}
      {aba === 'vendas' && <ListaSetor lista={pessoasVendas} titulo="Setor de vendas" />}

      {/* ========== ABA 2 - ANÚNCIO (era Marketing) ========== */}
      {aba === 'anuncio' && (
        <div>
          <div
            onClick={() => window.open('https://www.youtube.com/', '_blank')}
            style={{ position: 'relative', width: '100%', height: '100vh', margin: 0, overflow: 'hidden', borderRadius: 12, display: 'block', cursor: 'pointer', backgroundImage: 'url(/marketing.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#5a5a5a', color: '#fff', padding: '16px 20px', fontSize: 28, fontWeight: 800, boxSizing: 'border-box' }}>
              MARKETING IDEAL PARA VOCÊ!
            </div>

            <div style={{ position: 'absolute', left: 20, bottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={(e) => { e.stopPropagation(); setMostrarSobre(!mostrarSobre) }} style={{ background: '#6b6b6b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 18, fontWeight: 700, width: 'fit-content', cursor: 'pointer' }}>
                ⓘ Sobre nós
              </button>
              <a href="https://wa.me/5592984883080" target="_blank" onClick={(e) => e.stopPropagation()} style={{ background: '#6b6b6b', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 18, fontWeight: 700, width: 'fit-content' }}>
                ✆ Entre em contato
              </a>
            </div>
          </div>

          {mostrarSobre && (
            <div id="sobre" style={{ background: '#2e303a', margin: '12px 0', padding: 20, borderRadius: 12, textAlign: 'left', color: '#e5e7eb', maxHeight: '60vh', overflowY: 'auto' }}>
              <h2 style={{ marginTop: 0, textAlign: 'center' }}>Sobre nós</h2>
              <p>Somos o <b>Marketing Ideal Para Você!</b> — a equipe que transforma empresas pequenas em marcas que ninguém consegue ignorar.</p>
              <p>✅ Criamos campanhas, posts e anúncios que chamam atenção<br />
              ✅ Ajudamos você a atrair leads qualificados <br />
              ✅ Cuidamos da sua imagem, do seu logo e da sua divulgação</p>
              <p>Juntos, tornaremos o ideal em números: mais leads, mais clientes, mais vendas — e uma empresa que não para de crescer.</p>
              <p style={{ textAlign: 'center', marginBottom: 0 }}>
                <a href="https://wa.me/5592984883080" target="_blank" style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700 }}>Falar no WhatsApp</a>
                <button onClick={() => setMostrarSobre(false)} style={{ marginLeft: 8, background: '#6b7280', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>Fechar</button>
              </p>
            </div>
          )}

          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 4 }}>O que fazemos por você</h2>
            <p style={{ color: '#9ca3af', marginTop: 0 }}>Escolha o que sua empresa precisa e fale com a gente</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
              <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}>
                <div style={{ fontSize: 32 }}>📱</div>
                <h3 style={{ margin: '8px 0' }}>Posts e Reels</h3>
                <p style={{ color: '#e5e7eb', fontSize: 14 }}>Posts que chamam atenção e fazem seu Instagram vender todos os dias.</p>
                <a href="https://wa.me/5592984883080?text=Quero%20posts%20e%20reels%20pro%20meu%20Instagram" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Quero esse</a>
              </div>
              <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}>
                <div style={{ fontSize: 32 }}>🎯</div>
                <h3 style={{ margin: '8px 0' }}>Anúncios que vendem</h3>
                <p style={{ color: '#e5e7eb', fontSize: 14 }}>Anúncios no Instagram e Facebook pra atrair leads qualificados prontos pra comprar.</p>
                <a href="https://wa.me/5592984883080?text=Quero%20an%C3%BAncios%20que%20vendem" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Quero esse</a>
              </div>
              <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}>
                <div style={{ fontSize: 32 }}>✨</div>
                <h3 style={{ margin: '8px 0' }}>Logo e Imagem</h3>
                <p style={{ color: '#e5e7eb', fontSize: 14 }}>Sua marca com cara de empresa grande: logo, cores e identidade visual completa.</p>
                <a href="https://wa.me/5592984883080?text=Quero%20logo%20e%20identidade%20visual" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, display: 'inline-block' }}>Quero esse</a>
              </div>
            </div>
          </div>

          <div style={{ background: '#2e303a', margin: '0 0 24px 0', padding: 24, borderRadius: 12, textAlign: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Quero crescer 🚀</h2>
            <p style={{ color: '#e5e7eb' }}>Preenche aqui que a gente te chama no WhatsApp com um plano pra sua empresa.</p>
            {enviadoLead ? (
              <div style={{ background: '#22c55e', color: '#fff', padding: 16, borderRadius: 10, fontWeight: 700 }}>
                ✅ Recebido, {nomeLead}! Já já te chamamos no WhatsApp {whatsLead}!
                <br />
                <button onClick={() => { setEnviadoLead(false); setNomeLead(''); setWhatsLead('') }} style={{ marginTop: 10, background: '#fff', color: '#22c55e', border: 'none', padding: '8px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Enviar outro</button>
              </div>
            ) : (
              <div>
                <input placeholder="Seu nome" value={nomeLead} onChange={(e) => setNomeLead(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 10 }} />
                <br />
                <input placeholder="Seu WhatsApp - ex: (92) 99999-9999" value={whatsLead} onChange={(e) => setWhatsLead(formatarTelefone(e.target.value))} style={{ width: '100%', maxWidth: 400, marginBottom: 10 }} />
                <br />
                <select value={precisaLead} onChange={(e) => setPrecisaLead(e.target.value)} style={{ width: '100%', maxWidth: 400, padding: '10px 12px', borderRadius: 8, border: '1px solid #4b5563', background: '#1f2028', color: '#fff', fontWeight: 600, marginBottom: 12 }}>
                  <option>Quero mais clientes no Instagram</option>
                  <option>Quero anúncios que vendem</option>
                  <option>Quero logo e identidade visual</option>
                  <option>Quero tudo - gestão completa</option>
                </select>
                <br />
                <button disabled={enviandoLead} onClick={async () => {
                  if (!nomeLead.trim()) { alert('Coloca seu nome!'); return }
                  if (whatsLead.replace(/\D/g, '').length < 10) { alert('Coloca seu WhatsApp com DDD!'); return }
                  setEnviandoLead(true)
                  try {
                    const res = await fetch(`${API.replace('/pessoas', '')}/leads`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ nome: nomeLead.trim(), whatsapp: whatsLead, precisa: precisaLead })
                    })
                    const data = await res.json()
                    if (!res.ok) { alert(data.erro || 'Erro ao enviar'); return }
                    setEnviadoLead(true)
                    carregarLeads()
                  } catch {
                    alert('Erro ao conectar no backend')
                  } finally {
                    setEnviandoLead(false)
                  }
                }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  {enviandoLead ? 'Enviando...' : 'Quero crescer →'}
                </button>
                <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 0 }}>Sem spam. Só vamos te chamar pra falar do seu crescimento.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}