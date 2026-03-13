// 1. CONFIGURAÇÃO (CLIENTE OFICIAL PARA TEMPO REAL)
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

// Inicializa o cliente oficial do Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let nomeUsuarioLogado = "";
let isAdmin = false;

// 2. FUNÇÃO DE LOGIN
async function fazerLogin() {
    const emailInput = document.getElementById('userName');
    const senhaInput = document.getElementById('userPass');
    const msgErro = document.getElementById('erro');

    if (!emailInput || !senhaInput) return;

    const emailDigitado = emailInput.value.trim().toLowerCase();
    const senhaDigitada = senhaInput.value.trim();

    try {
        const { data: dados, error } = await supabaseClient
            .from('usuarios_familia')
            .select('*')
            .eq('email', emailDigitado)
            .eq('senha', senhaDigitada);

        if (dados && dados.length > 0) {
            const usuario = dados[0];
            nomeUsuarioLogado = usuario.nome_exibicao || "Usuário";
            isAdmin = (usuario.role === "admin"); 

            document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            
            // Avatar Neon
            const fotoElemento = document.getElementById('perfil-foto');
            if (fotoElemento) {
                const inicial = nomeUsuarioLogado.charAt(0).toUpperCase();
                fotoElemento.parentElement.innerHTML = `<div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; display:flex; align-items:center; justify-content:center; font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px; text-shadow: 0 0 10px #00ff00;">${inicial}</div>`;
            }

            carregarMensagens();
            configurarTempoReal(); // ATIVA O "OUVIDO" DO SITE
        } else {
            if (msgErro) msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (e) { console.error(e); }
}

// 3. FUNÇÃO DO TEMPO REAL (SEM F5)
function configurarTempoReal() {
    supabaseClient
        .channel('mural_familia_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Mural_Familia' }, (payload) => {
            console.log('Mudança detectada!', payload);
            carregarMensagens(); // Recarrega o mural sozinho para todos
        })
        .subscribe();
}

// 4. CARREGAR MENSAGENS
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    const { data: mensagens } = await supabaseClient
        .from('Mural_Familia')
        .select('*')
        .order('fixado', { ascending: false })
        .order('created_at', { ascending: false });

    mural.innerHTML = ""; 
    mensagens.forEach(msg => {
        const podeExcluir = (msg.autor === nomeUsuarioLogado || isAdmin);
        const botaoExcluir = podeExcluir ? `<button onclick="excluirPost(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; float:right;">🗑️</button>` : "";
        const botaoFixar = isAdmin ? `<button onclick="toggleFixar(${msg.id}, ${msg.fixado})" style="background:none; border:none; color:${msg.fixado ? '#FFD700' : '#666'}; cursor:pointer; float:right; margin-right:10px;">📌</button>` : "";
        const ehAdmin = (msg.autor === "Willber" || (msg.autor === nomeUsuarioLogado && isAdmin));
        
        mural.innerHTML += `
            <div class="post" style="background:${msg.fixado ? '#1a2a1a' : '#1a1a1a'}; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid ${msg.fixado ? '#00ff00' : '#333'};">
                ${botaoExcluir} ${botaoFixar}
                <strong style="color:#00ff00; ${ehAdmin ? 'text-shadow: 0 0 8px #00ff00;' : ''}">${msg.autor}</strong>
                ${ehAdmin ? '<span style="color:#FFD700; font-size:10px; margin-left:5px;">★ VERIFICADO</span>' : ''}
                <p style="color:#eee; margin:10px 0;">${msg.conteudo}</p>
                <button onclick="curtirPost(${msg.id}, ${msg.curtidas || 0})" style="background:#333; border:none; border-radius:20px; color:white; padding:5px 12px; cursor:pointer;">❤️ ${msg.curtidas || 0}</button>
            </div>`;
    });
}

// --- FUNÇÕES DE INTERAÇÃO ---
async function toggleFixar(id, estado) {
    await supabaseClient.from('Mural_Familia').update({ fixado: !estado }).eq('id', id);
}

async function postarMensagem() {
    const campo = document.getElementById('textoMensagem');
    if (!campo.value.trim()) return;
    await supabaseClient.from('Mural_Familia').insert([{ autor: nomeUsuarioLogado, conteudo: campo.value.trim(), fixado: false }]);
    campo.value = "";
}

async function curtirPost(id, curtidas) {
    if (localStorage.getItem(`curtido_${id}`)) return;
    await supabaseClient.from('Mural_Familia').update({ curtidas: curtidas + 1 }).eq('id', id);
    localStorage.setItem(`curtido_${id}`, "true");
}

async function excluirPost(id) {
    if (!confirm("Apagar?")) return;
    await supabaseClient.from('Mural_Familia').delete().eq('id', id);
}

function logout() { location.reload(); }