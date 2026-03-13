// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';

let nomeUsuarioLogado = "";

// --- FUNÇÃO DE LOGIN ---
async function fazerLogin() {
    const emailDigitado = document.getElementById('userName').value.trim().toLowerCase();
    const senhaDigitada = document.getElementById('userPass').value.trim();
    const msgErro = document.getElementById('erro');

    if (!msgErro) return; 

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailDigitado}&senha=eq.${senhaDigitada}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const dados = await resposta.json();

        if (dados.length > 0) {
            const usuario = dados[0];
            nomeUsuarioLogado = usuario.nome_exibicao;

            // PREENCHE OS DADOS DO PERFIL NO HTML
            document.getElementById('perfil-nome').innerText = usuario.nome_exibicao;
            document.getElementById('perfil-bio').innerText = usuario.bio || "Olá, família!";
            
            // --- AJUSTE DA FOTO OU INICIAL ---
            const fotoElemento = document.getElementById('perfil-foto');
            const urlFoto = usuario.foto_url;

            if (urlFoto && urlFoto.trim() !== "") {
                // Se tiver foto, garante que é uma tag <img> e coloca o link
                if (fotoElemento.tagName === 'IMG') {
                    fotoElemento.src = urlFoto;
                } else {
                    // Se antes era um círculo de letra, volta a ser uma imagem
                    fotoElemento.parentElement.innerHTML = `<img id="perfil-foto" src="${urlFoto}" style="width:80px; height:80px; border-radius:50%; border:2px solid #00ff00; object-fit: cover; margin-bottom: 10px;">`;
                }
            } else {
                // Se NÃO tiver foto, cria o círculo com a inicial
                const inicial = usuario.nome_exibicao ? usuario.nome_exibicao.charAt(0).toUpperCase() : "U";
                const paiDaFoto = fotoElemento.parentElement;
                paiDaFoto.innerHTML = `
                    <div id="perfil-foto" style="width:80px; height:80px; border-radius:50%; background:#222; color:#00ff00; 
                                display:flex; align-items:center; justify-content:center; 
                                font-size:35px; font-weight:bold; border:2px solid #00ff00; margin: 0 auto; margin-bottom: 10px;">
                        ${inicial}
                    </div>`;
            }

            // TROCA AS TELAS
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';

            carregarMensagens();
        } else {
            msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
    }
}

// --- FUNÇÃO PARA BUSCAR RECADOS NO MURAL ---
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}` 
            }
        });
        
        const mensagens = await resposta.json();
        mural.innerHTML = ""; 

        if (mensagens.length === 0) {
            mural.innerHTML = "<p style='color: #888;'>Nenhum recado ainda. Seja o primeiro!</p>";
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