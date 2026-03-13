// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF'; // <-- Cole sua chave aqui entre as aspas

let nomeUsuarioLogado = ""; // Variável para guardar o nome de quem logou

// --- FUNÇÃO DE LOGIN ---
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
            
            // Salva o nome de quem logou para usar no mural
            nomeUsuarioLogado = usuario.nome_exibicao; 
            
            // Troca as telas
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            document.getElementById('bemVindo').innerText = "Olá, " + nomeUsuarioLogado + "!";
            
            // Busca as mensagens no mural
            carregarMensagens();
            
            msgErro.innerText = "";
        } else {
            msgErro.style.color = "#ff4d4d";
            msgErro.innerText = "Usuário ou senha incorretos!";
        }
    } catch (erro) {
        msgErro.innerText = "Erro ao conectar com o banco de dados.";
        console.error(erro);
    }
}

// --- FUNÇÃO PARA BUSCAR RECADOS NO MURAL ---
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    if (!mural) return;

    try {
        // Buscando da tabela Mural_Familia que você criou
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}` 
            }
        });
        
        const mensagens = await resposta.json();
        mural.innerHTML = ""; // Limpa o "Carregando..."

        if (mensagens.length === 0) {
            mural.innerHTML = "<p style='color: #888;'>Nenhum recado ainda. Seja o primeiro!</p>";
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
        mural.innerHTML = "<p style='color: red;'>Erro ao carregar o mural.</p>";
    }
}

// --- FUNÇÃO PARA POSTAR NO MURAL ---
async function postarMensagem() {
    const campoTexto = document.getElementById('textoMensagem');
    const texto = campoTexto.value.trim();

    if (!texto) {
        alert("Escreva alguma coisa antes de postar!");
        return;
    }

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                autor: nomeUsuarioLogado, // Nome de quem logou
                conteudo: texto           // Texto digitado
            })
        });

        campoTexto.value = ""; // Limpa o campo depois de postar
        carregarMensagens();    // Atualiza o mural para mostrar a nova mensagem
    } catch (error) {
        alert("Erro ao postar mensagem.");
    }
}

// --- FUNÇÃO DE SAIR ---
function logout() {
    location.reload();
}