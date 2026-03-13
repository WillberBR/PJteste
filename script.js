// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

let nomeUsuarioLogado = "";
let isAdmin = false;

// --- 1. FUNÇÃO DE LOGIN ---
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

            if(document.getElementById('perfil-nome')) document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            if(document.getElementById('perfil-bio')) document.getElementById('perfil-bio').innerText = usuario.bio || "Olá, família!";
            
            const fotoElemento = document.getElementById('perfil-foto');
            if (fotoElemento) {
                const urlFoto = usuario.foto_url;
                if (urlFoto && urlFoto.trim() !== "" && urlFoto !== "NULL") {
                    fotoElemento.src = urlFoto;
                } else {
                    const inicial = nomeUsuarioLogado.charAt(0).toUpperCase();
                    fotoElemento.parentElement.innerHTML = `
                        <div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; 
                                    display:flex; align-items:center; justify-content:center; 
                                    font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px; text-shadow: 0 0 10px #00ff00;">
                            ${inicial}
                        </div>`;
                }
            }

            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            carregarMensagens();
        } else {
            if (msgErro) msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) { console.error(erro); }
}

// --- 2. CARREGAR MENSAGENS (COM FIXADOS E SELOS) ---
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        // Busca mensagens: fixadas primeiro, depois as mais recentes
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=fixado.desc,created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const mensagens = await resposta.json();
        mural.innerHTML = ""; 

        mensagens.forEach(msg => {
            const podeExcluir = (msg.autor === nomeUsuarioLogado || isAdmin);
            const botaoExcluir = podeExcluir ? `<button onclick="excluirPost(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; float:right;">🗑️</button>` : "";
            
            // Botão de Fixar (Apenas para Admin)
            const botaoFixar = isAdmin 
                ? `<button onclick="toggleFixar(${msg.id}, ${msg.fixado})" style="background:none; border:none; color:${msg.fixado ? '#FFD700' : '#666'}; cursor:pointer; float:right; margin-right:10px;">📌</button>` 
                : "";

            // Selo e Brilho para o Admin
            const ehAdmin = (msg.autor === "Willber" || msg.autor === nomeUsuarioLogado && isAdmin);
            const estiloNome = ehAdmin ? 'color:#00ff00; text-shadow: 0 0 8px #00ff00;' : 'color:#00ff00;';
            const selo = ehAdmin ? `<span style="color: #FFD700; margin-left: 5px; font-size: 12px;">★ VERIFICADO</span>` : "";

            mural.innerHTML += `
                <div class="post" style="background:${msg.fixado ? '#1a2a1a' : '#1a1a1a'}; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid ${msg.fixado ? '#00ff00' : '#333'}; position:relative;">
                    ${botaoExcluir}
                    ${botaoFixar}
                    ${msg.fixado ? '<div style="color:#00ff00; font-size:10px; font-weight:bold; margin-bottom:5px;">MENSAGEM FIXADA</div>' : ''}
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <strong style="${estiloNome}">${msg.autor}</strong>
                        ${selo}
                    </div>
                    <p style="margin:10px 0; color:#eee;">${msg.conteudo}</p>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="curtirPost(${msg.id}, ${msg.curtidas || 0})" style="background:#333; border:none; border-radius:20px; color:white; padding: 5px 12px; cursor:pointer;">
                            ❤️ <span>${msg.curtidas || 0}</span>
                        </button>
                        <small style="color: #666;">${new Date(msg.created_at).toLocaleString('pt-BR')}</small>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

// --- 3. FUNÇÃO PARA FIXAR (MODO DEUS) ---
async function toggleFixar(id, estadoAtual) {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fixado: !estadoAtual })
        });
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// --- 4. FUNÇÕES DE POSTAR, CURTIR E EXCLUIR ---
async function postarMensagem() {
    const campo = document.getElementById('textoMensagem');
    if (!campo.value.trim()) return;
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

async function curtirPost(id, curtidasAtuais) {
    if (localStorage.getItem(`curtido_${id}`)) return alert("Já curtiu! ❤️");
    try {
        await fetch(`${SUPABASE_URL}/