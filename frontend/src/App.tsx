import { useEffect, useState } from 'react'
import './App.css'
import { preconnect } from 'react-dom';

// ============================================================
// TIPOS - O QUE CADA TABELA TEM
// ============================================================
type Pessoa = { id: number; nome: string; email: string; telefone?: string | null; idade?: number | null; setor?: string | null; usuario?: string | null; senha?: string | null }
type Lead = { id: number; nome: string; whatsapp: string; precisa: string; criado_em?: string }
type Perfil = { id?: number; pessoa_id: number; foto: string; bio: string; cargo: string; instagram: string; whatsapp: string }

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/pessoas`

function validar(nome: string, email: string, telefone: string, idade: string, usuario: string, senha: string) {
  if (!nome.trim()) return 'Nome é obrigatório'
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome.trim())) return 'Nome não pode ter caracteres especiais, só letras e espaço'
  if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return 'Email inválido, tem que ser tipo nome@email.com'
  if (telefone) { const soNumeros = telefone.replace(/\D/g, ''); if (soNumeros.length < 10 || soNumeros.length > 11) return 'Telefone tem que ter 10 ou 11 dígitos' }
  if (idade !== '') { const n = Number(idade); if (isNaN(n) || n < 0 || n > 120) return 'Idade tem que ser entre 0 e 120' }
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
  // ============================================================
  // ESTADOS
  // aba = ONDE voce esta | tipoUsuario = QUEM voce e
  // ============================================================
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

  // ABA pode ser: login, perfil, perfil-compras, compras, anuncio, anuncio-marketing, anuncio-compras, anuncio-vendas, vendas, admin, perfil-vendas, perfil-marketing
  const [aba, setAba] = useState<string>('login')
  const [logadoNova, setLogadoNova] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('')
  const [nomeLogado, setNomeLogado] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('todos')
  const [produtos, setProdutos] = useState<any[]>([]);

  // ========== META E VENDIDO  ==========
const [metaVendas, setMetaVendas] = useState(10000)
const [vendidoVendas, setVendidoVendas] = useState(0)
const [novaMeta, setNovaMeta] = useState('')
const [vendaProdutoId, setVendaProdutoId] = useState('')
const [vendaQtd, setVendaQtd] = useState('1')
const [ultimasVendas, setUltimasVendas] = useState<any[]>([])
const [vendaVendedorId, setVendaVendedorId] = useState('')

  // ========== CADASTRO DE PRODUTOS ========

const [novoProdutoNome, setNovoProdutoNome] = useState('')
const [novoProdutoPreco, setNovoProdutoPreco] = useState('')
const [novoProdutoQtd, setNovoProdutoQtd] = useState ('')
const [novoProdutoDescricao, setNovoProdutoDescricao] = useState('')

  const [mostrarSobre, setMostrarSobre] = useState(false)
  const [nomeLead, setNomeLead] = useState('')
  const [whatsLead, setWhatsLead] = useState('')
  const [precisaLead, setPrecisaLead] = useState('Quero mais clientes no insta')
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

  // ============================================================
  //                 FUNCOES DO BACKEND
  // carregar, cadastrar, editar, deletar, leads, perfil
  // ============================================================
  async function carregar() {
    try {
      setCarregando(true)
      const res = await fetch(API)
      const data = await res.json()
      if (Array.isArray(data)) setPessoas(data)
      else { setPessoas([]); setMensagem(data.erro || 'Backend respondeu, mas não veio lista') }
    } catch { setMensagem('Venda registrada com SUCESSO!!?') }
    finally { setCarregando(false) }
  }
  useEffect(() => { carregar() }, [])
  useEffect(() => {
    if (tipoUsuario === 'vendas' || tipoUsuario === 'admin') {
      fetch(`http://localhost:3001/produtos?tipo=${tipoUsuario}`).then(res => res.json()).then(dados => setProdutos(dados));
    }
  }, [tipoUsuario]);

  async function cadastrar() {
    const erro = validar(nomeEdit, emailEdit, telefoneEdit, idadeEdit, usuarioEdit, senhaEdit)
    if (erro) { setMensagem(erro); return }
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nomeEdit.trim(), email: emailEdit.trim(), telefone: telefoneEdit || null, idade: idadeEdit ? Number(idadeEdit) : null, setor: setorEdit, usuario: usuarioEdit.trim(), senha: senhaEdit }) })
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
      const res = await fetch(`${API}/${editandoId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nomeEdit.trim(), email: emailEdit.trim(), telefone: telefoneEdit || null, idade: idadeEdit ? Number(idadeEdit) : null, setor: setorEdit, usuario: usuarioEdit.trim(), senha: senhaEdit }) })
      const data = await res.json()
      if (!res.ok) { setMensagem(data.erro || 'Erro ao editar'); return }
      setMensagem('Editado com sucesso!'); setEditandoId(null)
      setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin'); setUsuarioEdit(''); setSenhaEdit('')
      carregar()
    } catch { setMensagem('Erro ao conectar no backend') }
  }
  async function deletar(id: number, nomePessoa: string) {
    if (!confirm(`Tem certeza que quer deletar ${nomePessoa}?`)) return
    try { const res = await fetch(`${API}/${id}`, { method: 'DELETE' }); if (!res.ok) { setMensagem('Erro ao deletar'); return } setMensagem('Deletado com sucesso!'); carregar() } catch { setMensagem('Erro ao conectar no backend') }
  }
  async function limparTudo() {
    if (pessoas.length === 0) return
    if (!confirm(`Tem certeza que quer apagar TODAS as ${pessoas.length} pessoas?`)) return
    try { for (const p of pessoas) { await fetch(`${API}/${p.id}`, { method: 'DELETE' }) } setMensagem('Tudo apagado com sucesso!'); setPagina(1); carregar() } catch { setMensagem('Erro ao limpar tudo') }
  }
  function comecarEditar(pessoa: Pessoa) {
    setEditandoId(pessoa.id); setNomeEdit(pessoa.nome); setEmailEdit(pessoa.email); setTelefoneEdit(pessoa.telefone || ''); setIdadeEdit(pessoa.idade != null ? String(pessoa.idade) : ''); setSetorEdit(pessoa.setor || 'admin'); setUsuarioEdit(pessoa.usuario || ''); setSenhaEdit(pessoa.senha || ''); setMensagem(''); carregarPerfilAdmin(pessoa.id)
  }
  function cancelarEdicao() { setEditandoId(null); setNomeEdit(''); setEmailEdit(''); setTelefoneEdit(''); setIdadeEdit(''); setSetorEdit('admin'); setUsuarioEdit(''); setSenhaEdit('') }
  function sair() { setLogadoNova(false); setUsuario(''); setSenha(''); setTipoUsuario(''); setNomeLogado(''); setAba('login'); setIdPessoaLogada(null); setPerfil(null); setFotoPerfil('/desenho.webp'); setBioPerfil(''); setCargoPerfil(''); setInstaPerfil(''); setWhatsPerfil(''); setIdPessoaPerfilAdmin(null) }
  async function carregarLeads() { try { const res = await fetch(`${API.replace('/pessoas', '')}/leads`); const data = await res.json(); if (Array.isArray(data)) setLeads(data) } catch { } }
  async function apagarLead(id: number, nomeLeadApagar: string) { if (!confirm(`Já atendeu ${nomeLeadApagar}? Apagar da lista?`)) return; await fetch(`${API.replace('/pessoas', '')}/leads/${id}`, { method: 'DELETE' }); carregarLeads() }
  async function carregarPerfil(pessoaId: number) {
    try { const res = await fetch(`${API.replace('/pessoas', '')}/perfil/${pessoaId}`); const data = await res.json(); if (data) { setPerfil(data); setFotoPerfil(data.foto || '/desenho.webp'); setBioPerfil(data.bio || ''); setCargoPerfil(data.cargo || ''); setInstaPerfil(data.instagram || ''); setWhatsPerfil(data.whatsapp || '') } } catch { }
  }
  async function carregarPerfilAdmin(pessoaId: number) {
    setIdPessoaPerfilAdmin(pessoaId)
    try { const res = await fetch(`${API.replace('/pessoas', '')}/perfil/${pessoaId}`); const data = await res.json(); setFotoAdmin(data?.foto || '/desenho.webp'); setBioAdmin(data?.bio || ''); setCargoAdmin(data?.cargo || ''); setInstaAdmin(data?.instagram || ''); setWhatsAdmin(data?.whatsapp || '') } catch { setFotoAdmin('/desenho.webp'); setBioAdmin(''); setCargoAdmin(''); setInstaAdmin(''); setWhatsAdmin('') }
  }
  async function salvarPerfilAdmin() {
    if (tipoUsuario !== 'admin') { alert('Só o admin pode editar perfil.'); return }
    if (!idPessoaPerfilAdmin) { alert('Escolhe a pessoa primeiro.'); return }
    const res = await fetch(`${API.replace('/pessoas', '')}/perfil`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pessoa_id: idPessoaPerfilAdmin, foto: fotoAdmin, bio: bioAdmin, cargo: cargoAdmin, instagram: instaAdmin, whatsapp: whatsAdmin, tipo: 'admin' }) })
    const data = await res.json(); if (!res.ok) { alert(data.erro || 'Erro ao salvar perfil'); return }
    alert('Perfil salvo pelo admin!'); if (idPessoaLogada === idPessoaPerfilAdmin) carregarPerfil(idPessoaPerfilAdmin)
  }
  async function carregarAcessosPerfil() { try { const res = await fetch(`${API.replace('/pessoas', '')}/acessos-perfil`); const data = await res.json(); if (Array.isArray(data)) setAcessosPerfil(data) } catch { } }

   // CARREGAR METAVENDAS 
  async function carregarMetaVendas() {
  const res = await fetch('http://localhost:3001/meta-vendas')
  const data = await res.json()
  setMetaVendas(Number(data.meta))
  setVendidoVendas(Number(data.vendido))
  const resV = await fetch('http://localhost:3001/vendas')
  setUltimasVendas(await resV.json())
}
// Carrega a meta e as vendas assim que abre o app, e toda vez que trocar de aba
useEffect(() => { carregarMetaVendas() }, [])
useEffect(() => { carregarMetaVendas() }, [aba])

  const totalCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras').length
  const totalVendas = pessoas.filter(p => (p.setor || 'admin') === 'vendas').length
  const totalMarketing = pessoas.filter(p => (p.setor || 'admin') === 'marketing').length
  const totalAdmin = pessoas.filter(p => (p.setor || 'admin') === 'admin').length
  const pessoasFiltradas = pessoas.filter((p) => { const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.email.toLowerCase().includes(busca.toLowerCase()) || (p.usuario || '').toLowerCase().includes(busca.toLowerCase()); const bateSetor = filtroSetor === 'todos' || (p.setor || 'admin') === filtroSetor; return bateBusca && bateSetor }).sort((a, b) => { if (!ordenarPorNome) return 0; return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase()) })
  const pessoasCompras = pessoas.filter(p => (p.setor || 'admin') === 'compras' || (p.setor || 'admin') === 'admin')
  const porPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(pessoasFiltradas.length / porPagina))
  const inicio = (pagina - 1) * porPagina
  const pessoasDaPagina = pessoasFiltradas.slice(inicio, inicio + porPagina)
  const pessoaLogada = pessoas.find(p => p.id === idPessoaLogada)

  function ListaSetor({ lista, titulo }: { lista: Pessoa[], titulo: string }) {
    return (<div style={{ textAlign: 'center', marginTop: 8 }}><h2>{titulo}</h2><p style={{ color: '#e5e7eb' }}>Olá, {nomeLogado}! Total nesse setor: {lista.length}</p>{lista.length === 0 ? <p style={{ color: '#9ca3af' }}>Nenhuma pessoa cadastrada para esse setor ainda.</p> : (<ul style={{ padding: 0, textAlign: 'left' }}>{lista.map(p => (<li key={p.id} style={{ background: '#2e303a', padding: '12px 16px', borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}><span>{p.nome} - {p.email}{p.telefone && <span> - {p.telefone}</span>}{p.idade != null && <span> - {p.idade} anos</span>}{p.usuario && <span> - @{p.usuario}</span>}</span><span style={{ background: corSetor(p.setor), color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{p.setor || 'admin'}</span></li>))}</ul>)}</div>)
  }
  function CardDashboard({ titulo, valor, cor, ativo, aoClicar, emoji }: { titulo: string, valor: number, cor: string, ativo: boolean, aoClicar: () => void, emoji: string }) {
    return (<button onClick={() => { aoClicar(); setPagina(1) }} style={{ background: ativo ? cor : '#2e303a', color: '#fff', border: ativo ? `2px solid ${cor}` : '1px solid #4b5563', padding: '16px 12px', borderRadius: 12, cursor: 'pointer', flex: 1, minWidth: 120, textAlign: 'center' }}><div style={{ fontSize: 26 }}>{emoji}</div><div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{valor}</div><div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{titulo}</div><div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{ativo ? 'Filtrando • Clique pra limpar' : 'Clique pra filtrar'}</div></button>)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      {/* ============================================================
                  CABECALHO - some nas telas de Perfil e Anuncio
          ============================================================ */}
      {aba !== 'anuncio' && aba !== 'anuncio-marketing' && aba !== 'anuncio-compras' && aba !== 'anuncio-vendas' && aba !== 'perfil' && aba !== 'perfil-compras' && aba !== 'perfil-marketing' && aba !== 'perfil-vendas' && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/desenho.webp" alt="Meu desenho" className="foto-desenho" />
          <h1 style={{ lineHeight: 1.2, marginTop: 16, marginBottom: 8, fontSize: 32 }}>Cadastro de Pessoas - CRUD</h1>
          <p style={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600 }}>Total: {pessoas.length} pessoas</p>
          {logadoNova && <p style={{ color: '#22c55e', fontWeight: 700 }}>Logado como: {nomeLogado} ({tipoUsuario})</p>}
        </div>
      )}

      {/* ============================================================
                              BOTOES DE NAVEGACAO
          Regra: tipoUsuario = QUEM pode ver | setAba = PRA ONDE vai
          ============================================================ */}
      {logadoNova && (
        <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: (aba === 'anuncio' || aba === 'perfil' || aba === 'perfil-compras' || aba === 'perfil-vendas' || aba === 'perfil-marketing') ? 16 : 0 }}>
          {/* MEU PERFIL - so admin*/}
          {idPessoaLogada && tipoUsuario !== 'marketing' && tipoUsuario !== 'compras' && tipoUsuario !== 'vendas' && (
            <button onClick={() => { if (idPessoaLogada) carregarPerfil(idPessoaLogada); setAba('perfil') }} style={{ marginRight: 8, background: aba === 'perfil' ? '#0f766e' : '#14b8a6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>👤 Meu Perfil</button>
          )}
          {/* COMPRAS - 3 abas */}
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (<button onClick={() => { if (idPessoaLogada) carregarPerfil(idPessoaLogada); setAba('perfil-compras') }} style={{ marginRight: 8, background: aba === 'perfil-compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Perfil Compras</button>)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (<button onClick={() => setAba('compras')} style={{ marginRight: 8, background: aba === 'compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Compras</button>)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'compras') && (<button onClick={() => setAba('anuncio-compras')} style={{ marginRight: 8, background: aba === 'anuncio-compras' ? '#6d28d9' : '#8b5cf6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>📣 Anúncio Compras</button>)}
          {/* VENDAS - 3 abas */}
          {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && (<button onClick={() => { if (idPessoaLogada) carregarPerfil(idPessoaLogada); setAba('perfil-vendas') }} style={{ marginRight: 8, background: aba === 'perfil-vendas' ? '#15803d' : '#22c55e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Perfil Vendas</button>)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && (<button onClick={() => setAba('vendas')} style={{ marginRight: 8, background: aba === 'vendas' ? '#15803d' : '#22c55e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Vendas</button>)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && (<button onClick={() => setAba('anuncio-vendas')} style={{ marginRight: 8, background: aba === 'anuncio-vendas' ? '#15803d' : '#22c55e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>📣 Anúncio Vendas</button>)}
          {/* MARKETING - 2 abas  */}
          {(tipoUsuario === 'admin' || tipoUsuario === 'marketing') && (<button onClick={() => { if (idPessoaLogada) carregarPerfil(idPessoaLogada); setAba('perfil-marketing') }} style={{ marginRight: 8, background: aba === 'perfil-marketing' ? '#be185d' : '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Perfil Marketing</button>)}
          {(tipoUsuario === 'admin' || tipoUsuario === 'marketing') && (<button onClick={() => setAba('anuncio-marketing')} style={{ marginRight: 8, background: aba === 'anuncio-marketing' ? '#be185d' : '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>📣 Anúncio Marketing</button>)}
          {/* ADMIN + SAIR */}
          {tipoUsuario === 'admin' && (<button onClick={() => setAba('admin')} style={{ marginRight: 8, background: aba === 'admin' ? '#1d4ed8' : '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Admin</button>)}
          <button onClick={sair} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Sair</button>
        </div>
      )}

      {/* ============================================================
                    TELA LOGIN - decide pra qual aba vai
          ============================================================ */}
      {aba === 'login' && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h2>Login</h2>
          <p style={{ color: '#9ca3af', fontSize: 13 }}>Entre com o usuário do setor ou com o usuário da pessoa cadastrada</p>
          <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} /><br /><br />
          <input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /><br /><br />
          <button onClick={async () => {
            const res = await fetch(`${API.replace('/pessoas', '')}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario, senha }) })
            const data = await res.json()
            if (!res.ok) { alert('Usuário ou senha errados!'); return }
            setTipoUsuario(data.tipo); setNomeLogado(data.nome || usuario); setLogadoNova(true)
            if (data.id) { setIdPessoaLogada(data.id); carregarPerfil(data.id); if (data.tipo === 'marketing') setAba('perfil-marketing'); else if (data.tipo === 'compras') setAba('perfil-compras'); else if (data.tipo === 'vendas') setAba('perfil-vendas'); else setAba('perfil') }
            else { setIdPessoaLogada(null); setPerfil(null); if (data.tipo === 'marketing') setAba('perfil-marketing'); else if (data.tipo === 'compras') setAba('perfil-compras'); else if (data.tipo === 'vendas') setAba('perfil-vendas'); else setAba(data.tipo) }
          }}>Entrar</button>
        </div>
      )}

      {/* ============================================================
          PAGINAS - UMA EMBAIXO DA OUTRA!
          ============================================================ */}

      {/*  MEU PERFIL - so admin */}
      {aba === 'perfil' && (<div><h2 style={{ textAlign: 'center' }}>👤 Meu Perfil</h2><p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui você só vê. Quem edita é só o admin.</p><div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}><div style={{ background: '#1f2028', padding: 24, borderRadius: 12, width: 320, textAlign: 'center' }}><img src={perfil?.foto || fotoPerfil || '/desenho.webp'} alt="Foto" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #14b8a6' }} /><h3>{nomeLogado}</h3><p style={{ color: '#5eead4', fontWeight: 700 }}>{cargoPerfil || tipoUsuario}</p>{bioPerfil && <p>{bioPerfil}</p>}{instaPerfil && <p>📸 {instaPerfil}</p>}{whatsPerfil && <p>📱 {whatsPerfil}</p>}</div><div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 280 }}><h3>Minhas informações</h3><p><b>Nome:</b> {pessoaLogada?.nome || nomeLogado}</p><p><b>Email:</b> {pessoaLogada?.email || '-'}</p><p><b>Telefone:</b> {pessoaLogada?.telefone || '-'}</p><p><b>Setor:</b> {pessoaLogada?.setor || tipoUsuario}</p><p><b>Usuário:</b> @{pessoaLogada?.usuario || usuario}</p></div></div></div>)}

      {/* ADMIN - Dashboard + Leads + Acessos + Cadastro + Editar Perfil + Lista */}
      {aba === 'admin' && (
        <div>
          <h2 style={{ textAlign: 'center' }}>📊 Dashboard</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <CardDashboard titulo="TOTAL" valor={pessoas.length} cor="#3b82f6" ativo={filtroSetor === 'todos'} aoClicar={() => setFiltroSetor('todos')} emoji="👥" />
            <CardDashboard titulo="COMPRAS" valor={totalCompras} cor="#8b5cf6" ativo={filtroSetor === 'compras'} aoClicar={() => setFiltroSetor(filtroSetor === 'compras' ? 'todos' : 'compras')} emoji="🛒" />
            <CardDashboard titulo="VENDAS" valor={totalVendas} cor="#22c55e" ativo={filtroSetor === 'vendas'} aoClicar={() => setFiltroSetor(filtroSetor === 'vendas' ? 'todos' : 'vendas')} emoji="💰" />
            <CardDashboard titulo="MARKETING" valor={totalMarketing} cor="#ec4899" ativo={filtroSetor === 'marketing'} aoClicar={() => setFiltroSetor(filtroSetor === 'marketing' ? 'todos' : 'marketing')} emoji="📣" />
          </div>
          <div style={{ background: '#2e303a', padding: 16, borderRadius: 12, margin: '20px 0' }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>📣 Leads - {leads.length}</h2>
            {leads.length === 0 ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Nenhum lead ainda.</p> : <ul style={{ padding: 0 }}>{leads.map(l => (<li key={l.id} style={{ background: '#1f2028', padding: 12, borderRadius: 10, marginBottom: 10, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}><span><b>{l.nome}</b> - {l.whatsapp}<br /><span style={{ color: '#f9a8d4' }}>{l.precisa}</span></span><button onClick={() => apagarLead(l.id, l.nome)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Já atendi</button></li>))}</ul>}
            <p style={{ textAlign: 'center' }}><button onClick={carregarLeads} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Atualizar leads</button></p>
          </div>
          <div style={{ background: '#2e303a', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>👀 Acessos de Perfil - {acessosPerfil.length}</h2>
            {acessosPerfil.length === 0 ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Ninguém viu nenhum perfil ainda.</p> : <ul style={{ padding: 0 }}>{acessosPerfil.map(a => (<li key={a.id} style={{ background: '#1f2028', padding: 10, borderRadius: 10, marginBottom: 8, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}><span><b>{a.quem_viu_nome}</b> viu <b>{a.perfil_nome}</b></span><span style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(a.criado_em).toLocaleString('pt-BR')}</span></li>))}</ul>}
            <p style={{ textAlign: 'center' }}><button onClick={carregarAcessosPerfil} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Atualizar acessos</button></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <input placeholder="Nome" value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)} />
            <input placeholder="Email" value={emailEdit} onChange={(e) => setEmailEdit(e.target.value)} style={{ marginLeft: 8 }} /><br /><br />
            <input placeholder="Telefone" value={telefoneEdit} onChange={(e) => setTelefoneEdit(formatarTelefone(e.target.value))} />
            <input placeholder="Idade" value={idadeEdit} onChange={(e) => setIdadeEdit(e.target.value.replace(/\D/g, '').slice(0, 3))} style={{ marginLeft: 8 }} /><br /><br />
            <input placeholder="Usuário" value={usuarioEdit} onChange={(e) => setUsuarioEdit(e.target.value)} />
            <input placeholder="Senha" type={mostrarSenha ? 'text' : 'password'} value={senhaEdit} onChange={(e) => setSenhaEdit(e.target.value)} style={{ marginLeft: 8 }} />
            <button onClick={() => setMostrarSenha(!mostrarSenha)} style={{ marginLeft: 8 }}>{mostrarSenha ? '🙈' : '👁'}</button><br /><br />
            <label>Vai para qual setor? </label>
            <select value={setorEdit} onChange={(e) => setSetorEdit(e.target.value)}><option value="admin">Todos / Admin</option><option value="compras">Só Compras</option><option value="marketing">Só Marketing</option><option value="vendas">Só Vendas</option></select><br /><br />
            {editandoId === null ? <button onClick={cadastrar} style={{ background: '#22c55e', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Cadastrar</button> : <><button onClick={salvarEdicao} style={{ background: '#22c55e', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Salvar Edição</button><button onClick={cancelarEdicao} style={{ marginLeft: 8 }}>Cancelar</button></>}
          </div>
          <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, marginTop: 20 }}>
            <h2 style={{ textAlign: 'center', marginTop: 0 }}>👤 Perfil de Usuário</h2>
            <div style={{ textAlign: 'center' }}><label>Editar perfil de: </label><select value={idPessoaPerfilAdmin ?? ''} onChange={(e) => { const v = Number(e.target.value); if (v) carregarPerfilAdmin(v) }}><option value="">Escolhe a pessoa...</option>{pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} - @{p.usuario}</option>)}</select></div>
            {idPessoaPerfilAdmin ? <div style={{ textAlign: 'center', marginTop: 14 }}><img src={fotoAdmin} alt="Foto" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} /><br /><br /><input placeholder="Link da foto" value={fotoAdmin} onChange={(e) => setFotoAdmin(e.target.value)} /><br /><input placeholder="Cargo" value={cargoAdmin} onChange={(e) => setCargoAdmin(e.target.value)} /><br /><input placeholder="Insta" value={instaAdmin} onChange={(e) => setInstaAdmin(e.target.value)} /><br /><input placeholder="WhatsApp" value={whatsAdmin} onChange={(e) => setWhatsAdmin(formatarTelefone(e.target.value))} /><br /><textarea placeholder="Bio" value={bioAdmin} onChange={(e) => setBioAdmin(e.target.value)} /><br /><button onClick={salvarPerfilAdmin} style={{ background: '#ec4899', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Salvar Perfil</button></div> : <p style={{ textAlign: 'center', color: '#9ca3af' }}>Escolhe a pessoa aqui em cima.</p>}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}><input placeholder="Buscar..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1) }} />{busca && <button onClick={() => { setBusca(''); setPagina(1) }}>X</button>}</div>
          {mensagem && <p style={{ textAlign: 'center', background: mensagem.includes('sucesso') ? '#22c55e' : '#ef4444', padding: 10, borderRadius: 8 }}>{mensagem}</p>}
          <p style={{ textAlign: 'center' }}>Mostrando {pessoasDaPagina.length} de {pessoasFiltradas.length}</p>
          <div style={{ textAlign: 'center' }}><button onClick={() => setOrdenarPorNome(!ordenarPorNome)}>{ordenarPorNome ? 'Ordenado A-Z' : 'Ordenar A-Z'}</button><button onClick={limparTudo} style={{ marginLeft: 8, background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Limpar Tudo</button></div>
        {carregando ? <p style={{ textAlign: 'center' }}>Carregando...</p> : <ul style={{ padding: 0 }}>{pessoasDaPagina.map((p) => (<li key={p.id} style={{ background: '#2e303a', padding: 12, borderRadius: 10, marginBottom: 10, display: 'flex', justifyContent: 'space-between', listStyle: 'none' }}><span>{p.nome} - {p.email} {p.usuario && <span> - @{p.usuario}</span>} <span style={{ background: corSetor(p.setor), padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{p.setor || 'admin'}</span></span><span><button onClick={() => comecarEditar(p)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, marginRight: 6, cursor: 'pointer' }}>Editar</button><button onClick={() => deletar(p.id, p.nome)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Deletar</button></span></li>))}</ul>}          <div style={{ textAlign: 'center' }}><button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button><span> Pagina {pagina} de {totalPaginas} </span><button onClick={() => setPagina(pagina + 1)} disabled={pagina === totalPaginas}>Proxima</button></div>
        </div>
      )}
      {/* FIM DO ADMIN */}

      {/* PERFIL VENDAS - FORA DO ADMIN (correcao do erro admin x perfil-vendas) */}
      {aba === 'perfil-vendas' && (
        <div><h2 style={{ textAlign: 'center' }}>Perfil Vendas</h2><p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui você só vê. Quem edita é só o admin.</p><div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}><div style={{ background: '#1f2028', padding: 24, borderRadius: 12, width: 320, textAlign: 'center' }}><img src={perfil?.foto || fotoPerfil || '/desenho.webp'} alt="Foto" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #22c55e' }} /><h3>{nomeLogado}</h3><p style={{ color: '#86efac', fontWeight: 700 }}>{cargoPerfil || 'Vendas'}</p>{bioPerfil && <p>{bioPerfil}</p>}{instaPerfil && <p>📸 {instaPerfil}</p>}{whatsPerfil && <p>📱 {whatsPerfil}</p>}</div><div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 280 }}><h3>Minhas informações - Vendas</h3><p><b>Nome:</b> {pessoaLogada?.nome || nomeLogado}</p><p><b>Email:</b> {pessoaLogada?.email || '-'}</p><p><b>Telefone:</b> {pessoaLogada?.telefone || '-'}</p><p><b>Setor:</b> Vendas</p><p><b>Usuário:</b> @{pessoaLogada?.usuario || usuario}</p><div style={{ background: '#1f2028', padding: 14, borderRadius: 10, marginTop: 16 }}><h4>📌 Em breve aqui</h4><p style={{ color: '#9ca3af', fontSize: 13 }}>Metas, comissões, etc.</p></div></div></div></div>
      )}

      {/* PERFIL COMPRAS */}
      {aba === 'perfil-compras' && (
        <div><h2 style={{ textAlign: 'center' }}>Perfil Compras</h2><p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui voce so ve. Quem edita e so o admin.</p><div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}><div style={{ background: '#1f2028', padding: 24, borderRadius: 12, width: 320, textAlign: 'center' }}><img src={perfil?.foto || fotoPerfil || '/desenho.webp'} alt="Foto" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #8b5cf6' }} /><h3>{nomeLogado}</h3><p style={{ color: '#c4b5fd', fontWeight: 700 }}>{cargoPerfil || 'Compras'}</p>{bioPerfil && <p>{bioPerfil}</p>}{instaPerfil && <p>{instaPerfil}</p>}{whatsPerfil && <p>{whatsPerfil}</p>}</div><div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 280 }}><h3>Minhas informacoes - Compras</h3><p><b>Nome:</b> {pessoaLogada?.nome || nomeLogado}</p><p><b>Email:</b> {pessoaLogada?.email || '-'}</p><p><b>Telefone:</b> {pessoaLogada?.telefone || '-'}</p><p><b>Setor:</b> Compras</p><p><b>Usuario:</b> @{pessoaLogada?.usuario || usuario}</p><div style={{ background: '#1f2028', padding: 14, borderRadius: 10, marginTop: 16 }}><h4>Em breve aqui</h4><p style={{ color: '#9ca3af', fontSize: 13 }}>Pedidos, fornecedores, etc.</p></div></div></div></div>
      )}

      {/* COMPRAS - so a lista */}
      {aba === 'compras' && <ListaSetor lista={pessoasCompras} titulo="Setor de Compras" />}

            {/* ========== DASHBOARD VENDAS + TABELA DE PRODUTOS ========== */}
      {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && aba === 'vendas' && (
        <div>
          {/* TITULO */}
          <h2 style={{ textAlign: 'center' }}>💰 Dashboard Vendas</h2>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Aqui você vê quanto tem pra vender, se bateu a meta e o que está acabando!</p>

          {/* ===== CARDS DE CIMA ===== */}
          {/* Calcula tudo aqui em cima pra usar nos cards */}
          {(() => {
            const totalEstoque = produtos.reduce((soma, p) => soma + (Number(p.preco) * Number(p.quantidade)), 0)
            const totalQtd = produtos.reduce((soma, p) => soma + Number(p.quantidade), 0)
            const maisCaro = produtos.length > 0 ? produtos.reduce((a, b) => Number(a.preco) > Number(b.preco) ? a : b) : null
            const maisBarato = produtos.length > 0 ? produtos.reduce((a, b) => Number(a.preco) < Number(b.preco) ? a : b) : null
            const quaseAcabando = produtos.filter(p => Number(p.quantidade) < 5)
            const faltaMeta = Math.max(0, metaVendas - vendidoVendas)
            const pctMeta = metaVendas > 0 ? Math.min(100, Math.round((vendidoVendas / metaVendas) * 100)) : 0

            return (
              <>
                {/* - CARDS */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', border: '1px solid #22c55e' }}>
                    <div style={{ fontSize: 26 }}>💰</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>R$ {totalEstoque.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Faturamento se vender tudo</div>
                  </div>
                  <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', border: '1px solid #3b82f6' }}>
                    <div style={{ fontSize: 26 }}>📦</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{produtos.length} produtos / {totalQtd} unid.</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Total em estoque</div>
                  </div>
                  <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', border: '1px solid #f59e0b' }}>
                    <div style={{ fontSize: 26 }}>🏆</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{maisCaro ? `${maisCaro.nome} - R$ ${maisCaro.preco}` : '-'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Produto mais caro</div>
                  </div>
                  <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, flex: 1, minWidth: 160, textAlign: 'center', border: '1px solid #ec4899' }}>
                    <div style={{ fontSize: 26 }}>🔥</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{maisBarato ? `${maisBarato.nome} - R$ ${maisBarato.preco}` : '-'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Produto mais barato</div>
                  </div>
                </div>

                {/* META DO MÊS - ADMIN EDITA, VENDAS SÓ VÊ */}
<div style={{ background: '#1f2028', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid #22c55e' }}>
  <h3 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>🎯 Meta do mês</h3>

  {/* SE FOR ADMIN, MOSTRA OS CONTROLES */}
  {tipoUsuario === 'admin' && (
    <div style={{ background: '#2e303a', padding: 12, borderRadius: 10, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <label style={{ color: '#e5e7eb', fontSize: 13 }}>Nova meta R$
          <input type="number" value={novaMeta} onChange={(e) => setNovaMeta(e.target.value)} placeholder={String(metaVendas)} style={{ width: 100, padding: 6, borderRadius: 6, background: '#1f2028', color: '#fff', border: '1px solid #4b5563', marginLeft: 4 }} />
        </label>
        <button onClick={async () => {
          await fetch('http://localhost:3001/meta-vendas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: Number(novaMeta), tipo: tipoUsuario }) })
          setNovaMeta(''); carregarMetaVendas()
        }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Salvar meta</button>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <select 
          value={vendaVendedorId} 
          onChange={(e) => { 
            console.log('Escolheu vendedor:', e.target.value); // ✅ Pra ver no F12 se salvou!
            setVendaVendedorId(e.target.value) 
          }} 
          style={{ padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', fontWeight: 600 }}
        >
          <option value="">Quem vendeu?</option>
          {pessoas.filter(p => (p.setor || 'admin') === 'vendas' || (p.setor || 'admin') === 'admin').map(p => (
            <option key={p.id} value={p.id}>{p.nome} - @{p.usuario}</option>
          ))}
        </select>
        
        <select value={vendaProdutoId} onChange={(e) => setVendaProdutoId(e.target.value)} style={{ padding: 6, borderRadius: 6, background: '#1f2028', color: '#fff' }}>
          <option value="">Escolhe o produto vendido...</option>
          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco} ({p.quantidade} em estoque)</option>)}
        </select>
        <input type="number" value={vendaQtd} onChange={(e) => setVendaQtd(e.target.value)} min="1" style={{ width: 60, padding: 6, borderRadius: 6, background: '#1f2028', color: '#fff', border: '1px solid #4b5563' }} />
<button onClick={async () => {


  //  Eele vai ver o vendedor primeiro depois o produto
  if (!vendaVendedorId) { alert('Escolhe quem vendeu!'); return }
  if (!vendaProdutoId) { alert('Escolhe o produto!'); return }

  const vendedor = pessoas.find(p => p.id === Number(vendaVendedorId))
  console.log('Mandando pro backend:', { vendedor_id: Number(vendaVendedorId), produto_id: Number(vendaProdutoId) });

  const res = await fetch('http://localhost:3001/vendas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ produto_id: Number(vendaProdutoId), quantidade: Number(vendaQtd), vendedor_id: Number(vendaVendedorId), vendedor_nome: vendedor?.nome || '', tipo: tipoUsuario }) })
  const data = await res.json()
  if (!res.ok) { alert('Erro do backend: ' + data.erro); return }

  alert(`Venda registrada! ${vendedor?.nome} vendeu - R$ ${data.valorTotal}`);

  //  Limpa TUDO e recarrega com await!
  setVendaVendedorId(''); setVendaProdutoId(''); setVendaQtd('1');
  await carregarMetaVendas()
  const resP = await fetch(`http://localhost:3001/produtos?tipo=${tipoUsuario}`)
  const dadosP = await resP.json()
  setProdutos(dadosP)
}} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Registrar venda</button>      </div>
    </div>
  )}

  {/* BARRA DE PROGRESSO */} 
  {(() => {
    const faltaMeta = Math.max(0, metaVendas - vendidoVendas)
    const pctMeta = metaVendas > 0 ? Math.min(100, Math.round((vendidoVendas / metaVendas) * 100)) : 0
    return (<>
      <p style={{ textAlign: 'center', color: '#e5e7eb', fontSize: 14 }}>Meta: <b>R$ {metaVendas.toFixed(2)}</b> | Já vendido: <b style={{ color: '#22c55e' }}>R$ {vendidoVendas.toFixed(2)}</b></p>
      <div style={{ background: '#2e303a', height: 22, borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ width: `${pctMeta}%`, background: pctMeta >= 100 ? '#22c55e' : '#f59e0b', height: '100%', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: '22px' }}>{pctMeta}%</div>
      </div>
      <p style={{ textAlign: 'center', margin: '8px 0 0 0', color: '#e5e7eb', fontSize: 13 }}>
        {pctMeta >= 100 ? '🎉 Meta batida! Parabéns!' : `Falta R$ ${faltaMeta.toFixed(2)} pra bater a meta!`}
        {tipoUsuario === 'vendas' && <><br /><span style={{ color: '#9ca3af', fontSize: 12 }}>A meta e as vendas são definidas pelo admin, aqui é só visualização! 👀</span></>}
      </p>
    </>)
  })()}

  {/* ÚLTIMAS VENDAS */}
  {ultimasVendas.length > 0 && (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ textAlign: 'center' }}>🧾 Últimas vendas</h4>
      <ul style={{ padding: 0 }}>{ultimasVendas.slice(0, 5).map(v => (
        <li key={v.id} style={{ background: '#2e303a', padding: 8, borderRadius: 8, marginBottom: 6, listStyle: 'none', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
  <span><b>{v.vendedor_nome || 'Sem vendedor'}</b> vendeu {v.quantidade}x {v.produto_nome}</span><span><b>R$ {Number(v.valor_total).toFixed(2)}</b> - {new Date(v.criado_em).toLocaleDateString('pt-BR')}</span>
</li>))}</ul>
    </div>
  )}
</div>

                {/*  - ALERTA ESTOQUE BAIXO */}
                {quaseAcabando.length > 0 && (
                  <div style={{ background: '#7f1d1d', padding: 14, borderRadius: 12, marginBottom: 12, textAlign: 'center' }}>
                    <b>⚠️ Atenção! {quaseAcabando.length} produto(s) quase acabando:</b>
                    <br />
                    <span style={{ fontSize: 13 }}>{quaseAcabando.map(p => `${p.nome} (${p.quantidade} unid.)`).join(' • ')}</span>
                  </div>
                )}
              </>
            )
          })()}

          {/* =====CADASTRAR PRODUTO NOVO ====*/}
          {(tipoUsuario === 'admin' || tipoUsuario === 'vendas') && (
            <div style={{ background: '#1f2028', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid #3b82f6' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}> Cadastrar Produto Novo</h3>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Nome do produto" value={novoProdutoNome} onChange={(e) => setNovoProdutoNome(e.target.value)} style={{ padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', border: '1px solid #4b5563', minWidth: 200}} />
              <input placeholder="Preço" value={novoProdutoPreco} onChange={(e) => setNovoProdutoPreco(e.target.value)} style={{ width: 110, padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', border: '1px solid #4b5563'}} />
              <input placeholder="Qtd" value={novoProdutoQtd} onChange={(e) => setNovoProdutoQtd(e.target.value)} style={{ width: 70, padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', border: '1px solid #4b5563'}} />
              <input placeholder="Descrição" value={novoProdutoDescricao} onChange={(e) => setNovoProdutoDescricao(e.target.value)} style={{ padding: 10, borderRadius: 8, background: '#2e303a', color: '#fff', border: '1px solid #4b5563', minWidth: 100}} />
            
            <button onClick ={async () => {
              if (!novoProdutoNome.trim()) { alert('Coloca o nome do produto!'); return}
              if (!novoProdutoPreco.trim()) { alert('Coloca o preço!'); return}
              if (!novoProdutoQtd.trim()) { alert('Coloca a quantidade'); return}

            const res = await fetch('http://localhost:3001/produtos', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                nome: novoProdutoNome.trim(),
                preco: Number(novoProdutoPreco),
                quantidade: Number(novoProdutoQtd),
                descricao: novoProdutoDescricao.trim(),
                setor: 'vendas',
                tipo: tipoUsuario
              })
            })
          const data = await res.json()
          console.log('Resposta do backend', data);
          if (!res.ok) {alert('Erro: ' + data.erro); return}

            alert(`{Produto ${data.nome} cadastrado!`)
            setNovoProdutoNome(''); setNovoProdutoPreco(''); setNovoProdutoQtd(''); setNovoProdutoDescricao('')

          const resP = await fetch(`http://localhost:3001/produtos?tipo=${tipoUsuario}`)
          const dadosP = await resP.json()
          setProdutos(dadosP)
        }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
          Cadastrar produto
        </button>
      </div>
    </div>
  )}


          {/* ===== TABELA DE PRODUTOS - */}
          <h3>Controle de Produtos - Time de Vendas</h3>
          {produtos.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>Nenhum produto ainda.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#030303' }}>
              <thead>
                <tr style={{ background: '#1bbe18', color: '#030303', textAlign: 'left' }}>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>ID</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Nome</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Preço</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Qtd</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Descrição</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Total</th>
                  <th style={{ padding: 8, border: '1px solid #030303' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>{p.id}</td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}><b>{p.nome}</b></td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>R$ {p.preco}</td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>{p.quantidade}</td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>{p.descricao}</td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>R$ {(Number(p.preco) * Number(p.quantidade)).toFixed(2)}</td>
                    <td style={{ padding: 8, border: '1px solid #030303' }}>
                      {Number(p.quantidade) === 0 ? <span style={{ background: '#ef4444', padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>ESGOTADO</span>
                      : Number(p.quantidade) < 5 ? <span style={{ background: '#f59e0b', padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>QUASE ACABANDO</span>
                      : <span style={{ background: '#22c55e', padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>EM ESTOQUE</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ANUNCIO MARKETING  */}
      {(aba === 'anuncio' || aba === 'anuncio-marketing') && (
        <div>
          <div onClick={() => window.open('https://www.youtube.com/', '_blank')} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', borderRadius: 12, cursor: 'pointer', backgroundImage: 'url(/marketing.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#5a5a5a', color: '#fff', padding: '16px 20px', fontSize: 28, fontWeight: 800 }}>MARKETING IDEAL PARA VOCÊ!</div>
            <div style={{ position: 'absolute', left: 20, bottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={(e) => { e.stopPropagation(); setMostrarSobre(!mostrarSobre) }} style={{ background: '#6b6b6b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>ⓘ Sobre nós</button>
              <a href="https://wa.me/5592984883080" target="_blank" onClick={(e) => e.stopPropagation()} style={{ background: '#6b6b6b', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 18, fontWeight: 700 }}>✆ Entre em contato</a>
            </div>
          </div>
          {mostrarSobre && (<div style={{ background: '#2e303a', margin: '12px 0', padding: 20, borderRadius: 12 }}><h2 style={{ textAlign: 'center' }}>Sobre nós</h2><p>Somos o <b>Marketing Ideal Para Você!</b></p><p>✅ Campanhas, posts e anúncios<br />✅ Leads qualificados<br />✅ Logo e divulgação</p><p style={{ textAlign: 'center' }}><a href="https://wa.me/5592984883080" target="_blank" style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700 }}>Falar no WhatsApp</a><button onClick={() => setMostrarSobre(false)} style={{ marginLeft: 8 }}>Fechar</button></p></div>)}
          <div style={{ padding: '24px 0', textAlign: 'center' }}><h2>O que fazemos por você</h2><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
            <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}><div style={{ fontSize: 32 }}>📱</div><h3>Posts e Reels</h3><p>Posts que chamam atenção.</p><a href="https://wa.me/5592984883080?text=Quero%20posts" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>Quero esse</a></div>
            <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}><div style={{ fontSize: 32 }}>🎯</div><h3>Anúncios que vendem</h3><p>Leads prontos pra comprar.</p><a href="https://wa.me/5592984883080?text=Quero%20anuncios" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>Quero esse</a></div>
            <div style={{ background: '#2e303a', padding: 20, borderRadius: 12, flex: 1, minWidth: 200, maxWidth: 300 }}><div style={{ fontSize: 32 }}>✨</div><h3>Logo e Imagem</h3><p>Logo, cores e identidade.</p><a href="https://wa.me/5592984883080?text=Quero%20logo" target="_blank" style={{ background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700 }}>Quero esse</a></div>
          </div></div>
          <div style={{ background: '#2e303a', padding: 24, borderRadius: 12, textAlign: 'center' }}>
            <h2>Quero crescer 🚀</h2>
            {enviadoLead ? <div style={{ background: '#22c55e', padding: 16, borderRadius: 10, fontWeight: 700 }}>✅ Recebido, {nomeLead}! <br /><button onClick={() => { setEnviadoLead(false); setNomeLead(''); setWhatsLead('') }}>Enviar outro</button></div> : <div><input placeholder="Seu nome" value={nomeLead} onChange={(e) => setNomeLead(e.target.value)} /><br /><input placeholder="Seu WhatsApp" value={whatsLead} onChange={(e) => setWhatsLead(formatarTelefone(e.target.value))} /><br /><select value={precisaLead} onChange={(e) => setPrecisaLead(e.target.value)}><option>Quero mais clientes no insta</option><option>Quero anúncios que vendem</option><option>Quero logo e identidade visual</option><option>Quero tudo - gestão completa</option></select><br /><button disabled={enviandoLead} onClick={async () => { if (!nomeLead.trim()) { alert('Coloca seu nome!'); return } if (whatsLead.replace(/\D/g, '').length < 10) { alert('Coloca seu WhatsApp com DDD!'); return } setEnviandoLead(true); try { const res = await fetch(`${API.replace('/pessoas', '')}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nomeLead.trim(), whatsapp: whatsLead, precisa: precisaLead }) }); const data = await res.json(); if (!res.ok) { alert(data.erro || 'Erro ao enviar'); return } setEnviadoLead(true); carregarLeads() } catch { alert('Erro ao conectar no backend') } finally { setEnviandoLead(false) } }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{enviandoLead ? 'Enviando...' : 'Quero crescer →'}</button></div>}
          </div>
        </div>
      )}
    </div>
  )
}
