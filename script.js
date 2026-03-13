// 1. CONFIGURAÇÃO (NÃO ALTERAR)
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

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
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailDigitado}&senha=eq.${senhaDigitada}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const dados = await resposta.json();

        if (dados && dados.length > 0) {
            const usuario = dados[0];
            nomeUsuarioLogado = usuario.nome_exibicao || "Usuário";
            isAdmin = (usuario.role === "admin"); 

            // Atualiza Interface
            document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            
            // Avatar
            const fotoElemento = document.getElementById('perfil-foto');
            if (fotoElemento) {
                const inicial = nomeUsuarioLogado.charAt(0).toUpperCase();
                fotoElemento.parentElement.innerHTML = `<div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; display:flex; align-items:center; justify-content:center; font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px; text-shadow: 0 0 10px #00ff00;">${inicial}</div>`;
            }

            carregarMensagens();
        } else {
            if (msgErro) msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (e) { console.error("Erro Login:", e); }
}

// 3. CARREGAR MENSAGENS
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=fixado.desc,created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const mensagens = await resposta.json();
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
    } catch (e) { console.error("Erro Mural:", e); }
}

// 4. FIXAR MENSAGEM
async function toggleFixar(id, estado) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fixado: !estado })
        });
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// 5. POSTAR
async function postarMensagem() {
    const campo = document.getElementById('textoMensagem');
    if (!campo || !campo.value.trim()) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ autor: nomeUsuarioLogado, conteudo: campo.value.trim(), fixado: false })
        });
        campo.value = ""; 
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// 6. CURTIR E EXCLUIR
async function curtirPost(id, curtidas) {
    if (localStorage.getItem(`curtido_${id}`)) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ curtidas: curtidas + 1 })
        });
        localStorage.setItem(`curtido_${id}`, "true");
        carregarMensagens();
    } catch (e) { console.error(e); }
}

async function excluirPost(id) {
    if (!confirm("Apagar?")) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// 7. FUNÇÕES FINAIS
function logout() { location.reload(); }
function toggleEdicao() {
    const a = document.getElementById('area-edicao');
    if(a) a.style.display = a.style.display === 'none' ? 'block' : 'none';
}
// FIM DO ARQUIVO - TODAS AS CHAVES FECHADAS