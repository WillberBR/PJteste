// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

let nomeUsuarioLogado = "";
let isAdmin = false; // Variável para controlar se você é o chefe

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
            
            // VERIFICA SE É ADMIN NO BANCO DE DADOS
            isAdmin = (usuario.role === "admin"); 

            // Preenche Perfil
            if(document.getElementById('perfil-nome')) document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            if(document.getElementById('perfil-bio')) document.getElementById('perfil-bio').innerText = usuario.bio || "Olá, família!";
            
            // Lógica da Foto ou Inicial (Evita o erro da imagem quebrada)
            const fotoElemento = document.getElementById('perfil-foto');
            if (fotoElemento) {
                const urlFoto = usuario.foto_url;
                if (urlFoto && urlFoto.trim() !== "" && urlFoto !== "NULL") {
                    fotoElemento.src = urlFoto;
                    fotoElemento.style.display = "block";
                } else {
                    const inicial = nomeUsuarioLogado.charAt(0).toUpperCase();
                    fotoElemento.parentElement.innerHTML = `
                        <div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; 
                                    display:flex; align-items:center; justify-content:center; 
                                    font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px;">
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
    } catch (erro) {
        console.error("Erro no login:", erro);
    }
}

// --- 2. CARREGAR MENSAGENS (COM PODER DE ADMIN) ---
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const mensagens = await resposta.json();
        mural.innerHTML = ""; 

        mensagens.forEach(msg => {
            // REGRA: Se for o autor OU se for ADMIN, mostra a lixeira
            const podeExcluir = (msg.autor === nomeUsuarioLogado || isAdmin);
            
            const botaoExcluir = podeExcluir 
                ? `<button onclick="excluirPost(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; float:right; font-size:18px;">🗑️</button>` 
                : "";

            mural.innerHTML += `
                <div class="post" style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #333;">
                    ${botaoExcluir}
                    <strong style="color:#00ff00;">${msg.autor}:</strong>
                    ${isAdmin && msg.autor !== nomeUsuarioLogado ? ' <small style="color:#666;">(Modo Admin)</small>' : ''}
                    <p style="margin:10px 0; color:#eee;">${msg.conteudo}</p>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="curtirPost(${msg.id}, ${msg.curtidas || 0})" style="background:#333; border:none; border-radius:20px; color:white; padding: 5px 12px; cursor:pointer; display:flex; align-items:center; gap:5px;">
                            ❤️ <span>${msg.curtidas || 0}</span>
                        </button>
                        <small style="color: #666;">${new Date(msg.created_at).toLocaleString('pt-BR')}</small>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

// --- 3. FUNÇÃO PARA POSTAR ---
async function postarMensagem() {
    const campo = document.getElementById('textoMensagem');
    if (!campo.value.trim()) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia`, {
            method: 'POST',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ autor: nomeUsuarioLogado, conteudo: campo.value.trim() })
        });
        campo.value = ""; 
        carregarMensagens();    
    } catch (e) { console.error(e); }
}

// --- 4. FUNÇÃO PARA CURTIR ---
async function curtirPost(id, curtidasAtuais) {
    if (localStorage.getItem(`curtido_${id}`)) {
        alert("Você já curtiu este recado! ❤️"); //
        return;
    }
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ curtidas: curtidasAtuais + 1 })
        });
        localStorage.setItem(`curtido_${id}`, "true");
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// --- 5. FUNÇÃO PARA EXCLUIR ---
async function excluirPost(id) {
    if (!confirm("Tem certeza que quer apagar este recado?")) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        carregarMensagens();
    } catch (e) { console.error(e); }
}

// --- 6. AUXILIARES ---
function toggleEdicao() {
    const area = document.getElementById('area-edicao');
    if(area) area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    location.reload();
}