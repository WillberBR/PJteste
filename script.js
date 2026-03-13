// CONFIGURAÇÃO DO COFRE (SUPABASE)
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF'; // Cole aquela chave que você me mandou aqui

async function fazerLogin() {
    const emailDigitado = document.getElementById('userName').value.trim().toLowerCase();
    const senhaDigitada = document.getElementById('userPass').value.trim();
    const msgErro = document.getElementById('erro');

    // Avisa que está carregando
    msgErro.style.color = "yellow";
    msgErro.innerText = "Verificando no banco de dados...";

    try {
        // Faz a busca na tabela que você criou
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailDigitado}&senha=eq.${senhaDigitada}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const dados = await resposta.json();

        // Se encontrou alguém com esse e-mail e senha
        if (dados.length > 0) {
            const usuario = dados[0];
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            document.getElementById('bemVindo').innerText = "Olá, " + usuario.nome_exibicao + "!";
            msgErro.innerText = "";
        } else {
            msgErro.style.color = "#ff4d4d";
            msgErro.innerText = "Usuário ou senha não encontrados no banco!";
        }
    } catch (erro) {
        console.error("Erro na conexão:", erro);
        msgErro.innerText = "Erro ao conectar com o servidor.";
    }
}

function logout() {
    location.reload();
}