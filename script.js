const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF'; // <-- Não esqueça de colocar sua chave aqui!

let nomeUsuarioLogado = "";

async function fazerLogin() {
    const emailDigitado = document.getElementById('userName').value.trim().toLowerCase();
    const senhaDigitada = document.getElementById('userPass').value.trim();
    const msgErro = document.getElementById('erro');

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailDigitado}&senha=eq.${senhaDigitada}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });

        const dados = await resposta.json();

        if (dados.length > 0) {
            const usuario = dados[0];
            nomeUsuarioLogado = usuario.nome_exibicao;

            // PREENCHE O PERFIL COM OS DADOS DO BANCO
            document.getElementById('perfil-nome').innerText = usuario.nome_exibicao;
            document.getElementById('perfil-bio').innerText = usuario.bio || "Olá, família!";
            
            if (usuario.foto_url) {
                document.getElementById('perfil-foto').src = usuario.foto_url;
            }

            // MOSTRA O FEED E ESCONDE O LOGIN
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';

            carregarMensagens();
        } else {
            msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) {
        msgErro.innerText = "Erro ao conectar.";
    }
}

async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const mensagens = await resposta.json();
        mural.innerHTML = "";

        if (mensagens.length === 0) {
            mural.innerHTML = "<p>Nenhum recado ainda.</p>";
            return;
        }

        mensagens.forEach(msg => {
            mural.innerHTML += `
                <div class="post">
                    <strong>${msg.autor}:</strong>
                    <p>${msg.conteudo}</p>
                    <small>${new Date(msg.created_at).toLocaleString('pt-BR')}</small>
                </div>
            `;
        });
    } catch (e) {
        mural.innerHTML = "<p>Erro ao carregar mural.</p>";
    }
}

async function postarMensagem() {
    const campo = document.getElementById('textoMensagem');
    const texto = campo.value.trim();
    if (!texto) return;

    await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autor: nomeUsuarioLogado, conteudo: texto })
    });

    campo.value = "";
    carregarMensagens();
}

function logout() { location.reload(); }