// CONFIGURAÇÃO DO COFRE (SUPABASE)
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_AQUI'; // <-- Coloque sua chave sb_publishable aqui

let nomeUsuarioLogado = ""; // Variável para guardar o nome de quem logou

async function fazerLogin() {
    const emailDigitado = document.getElementById('userName').value.trim().toLowerCase();
    const senhaDigitada = document.getElementById('userPass').value.trim();
    const msgErro = document.getElementById('erro');

    msgErro.style.color = "yellow";
    msgErro.innerText = "Verificando...";

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
            
            // --- AQUI ESTÁ O PULO DO GATO ---
            nomeUsuarioLogado = usuario.nome_exibicao; // Guarda o nome do banco
            
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            document.getElementById('bemVindo').innerText = "Olá, " + nomeUsuarioLogado + "!";
            
            carregarMensagens(); // Busca os recados assim que logar
            // -------------------------------
            
            msgErro.innerText = "";
        } else {
            msgErro.style.color = "#ff4d4d";
            msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) {
        msgErro.innerText = "Erro ao conectar.";
    }
}

// FUNÇÃO PARA BUSCAR MENSAGENS NO BANCO
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/mensagens?select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        
        const mensagens = await resposta.json();
        mural.innerHTML = ""; 

        mensagens.forEach(msg => {
            mural.innerHTML += `
                <div class="post" style="background: #333; padding: 10px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #00ff00;">
                    <strong style="color: #00ff00;">${msg.autor}:</strong>
                    <p style="margin: 5px 0;">${msg.conteudo}</p>
                    <small style="color: #888;">${new Date(msg.created_at).toLocaleString('pt-BR')}</small>
                </div>
            `;
        });
    } catch (e) {
        console.log("Erro ao carregar mensagens");
    }
}

// FUNÇÃO PARA ENVIAR NOVA MENSAGEM
async function postarMensagem() {
    const texto = document.getElementById('textoMensagem').value;
    if (!texto) return alert("Escreva algo primeiro!");

    await fetch(`${SUPABASE_URL}/rest/v1/mensagens`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            autor: nomeUsuarioLogado, // Usa o nome de quem fez login
            conteudo: texto
        })
    });

    document.getElementById('textoMensagem').value = ""; 
    carregarMensagens(); 
}

function logout() {
    location.reload();
}