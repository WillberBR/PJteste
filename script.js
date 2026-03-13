// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

let nomeUsuarioLogado = "";

// --- 1. FUNÇÃO DE LOGIN (VERSÃO BLINDADA) ---
async function fazerLogin() {
    const emailDigitado = document.getElementById('userName').value.trim().toLowerCase();
    const senhaDigitada = document.getElementById('userPass').value.trim();
    const msgErro = document.getElementById('erro');

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailDigitado}&senha=eq.${senhaDigitada}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const dados = await resposta.json();

        if (dados && dados.length > 0) {
            const usuario = dados[0];
            
            // Define o nome (tenta diferentes colunas para garantir)
            nomeUsuarioLogado = usuario.nome_exibicao || usuario.nome || "Usuário";

            // Preenche dados do perfil
            if(document.getElementById('perfil-nome')) document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            if(document.getElementById('perfil-bio')) document.getElementById('perfil-bio').innerText = usuario.bio || "Olá, família!";
            
            // Lógica da Foto ou Inicial
            const fotoElemento = document.getElementById('perfil-foto');
            if (fotoElemento) {
                const urlFoto = usuario.foto_url || usuario.foto;
                
                if (urlFoto && urlFoto.trim() !== "") {
                    fotoElemento.src = urlFoto;
                } else {
                    const inicial = nomeUsuarioLogado.charAt(0).toUpperCase();
                    const pai = fotoElemento.parentElement;
                    pai.innerHTML = `
                        <div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; 
                                    display:flex; align-items:center; justify-content:center; 
                                    font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px;">
                            ${inicial}
                        </div>`;
                }
            }

            // Troca as telas
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';

            carregarMensagens();
        } else {
            if (msgErro) msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Erro técnico ao tentar logar.");
    }
}

// --- 2. CARREGAR MENSAGENS ---
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        
        const mensagens = await resposta.json();
        mural.innerHTML = ""; 

        if (mensagens.length === 0) {
            mural.innerHTML = "<p style='color: #888;'>Nenhum recado ainda.</p>";
            return;
        }

        mensagens.forEach(msg => {
            const botaoExcluir = msg.autor === nomeUsuarioLogado 
                ? `<button onclick="excluirPost(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; float:right; font-size:18px;">🗑️</button>` 
                : "";

            mural.innerHTML += `
                <div class="post" style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #333;">
                    ${botaoExcluir}
                    <strong style="color:#00ff00;">${msg.autor}:</strong>
                    <p style="margin:10px 0; color:#eee;">${msg.conteudo}</p>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="curtirPost(${msg.id}, ${msg.curtidas || 0})" style="background:#333; border:none; border-radius:20px; color:white; padding: 5