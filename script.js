// CONFIGURAÇÃO DO SUPABASE

const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';

const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF'; // <--- COLE SUA CHAVE AQUI DENTRO DAS ASPAS



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

            

            // SE TIVER FOTO, CARREGA, SENÃO USA UMA PADRÃO

            if (usuario.foto_url) {

                document.getElementById('perfil-foto').src = usuario.foto_url;

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



    if (!texto) return;



    try {

        await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia`, {

            method: 'POST',

            headers: {

                'apikey': SUPABASE_KEY,

                'Authorization': `Bearer ${SUPABASE_KEY}`,

                'Content-Type': 'application/json'

            },

            body: JSON.stringify({

                autor: nomeUsuarioLogado,

                conteudo: texto

            })

        });



        campoTexto.value = ""; 

        carregarMensagens();    

    } catch (error) {

        alert("Erro ao postar mensagem.");

    }

}



function logout() {

    location.reload();

}


// Abre e fecha a caixinha de edição
function toggleEdicao() {
    const area = document.getElementById('area-edicao');
    area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

// Salva as mudanças no Supabase
async function salvarPerfil() {
    const novaBio = document.getElementById('edit-bio').value.trim();
    const novaFoto = document.getElementById('edit-foto').value.trim();
    const emailUsuario = document.getElementById('userName').value.trim().toLowerCase();

    if (!novaBio && !novaFoto) return alert("Preencha pelo menos um campo!");

    // Objeto com o que vamos atualizar
    const dadosAtualizados = {};
    if (novaBio) dadosAtualizados.bio = novaBio;
    if (novaFoto) dadosAtualizados.foto_url = novaFoto;

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_familia?email=eq.${emailUsuario}`, {
            method: 'PATCH', // PATCH serve para atualizar dados existentes
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(dadosAtualizados)
        });

        if (resposta.ok) {
            alert("Perfil atualizado! O site vai recarregar.");
            location.reload(); // Recarrega para mostrar as mudanças
        }
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        alert("Erro ao salvar perfil.");
    }
}



// Substitua sua função carregarMensagens por esta:
async function carregarMensagens() {
    const mural = document.getElementById('mural-mensagens');
    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?select=*&order=created_at.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const mensagens = await resposta.json();
        mural.innerHTML = "";

        mensagens.forEach(msg => {
            // Só mostra a lixeira se VOCÊ for o autor
            const botaoExcluir = msg.autor === nomeUsuarioLogado 
                ? `<button onclick="excluirPost(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; float:right; font-size:18px;">🗑️</button>` 
                : "";

            mural.innerHTML += `
                <div class="post" style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #333;">
                    ${botaoExcluir}
                    <strong style="color:#00ff00;">${msg.autor}:</strong>
                    <p style="margin:10px 0; color:#eee;">${msg.conteudo}</p>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button onclick="curtirPost(${msg.id}, ${msg.curtidas || 0})" style="background:#333; border:none; border-radius:20px; color:white; padding: 5px 12px; cursor:pointer; display:flex; align-items:center; gap:5px;">
                            ❤️ <span>${msg.curtidas || 0}</span>
                        </button>
                        <small style="color: #666;">${new Date(msg.created_at).toLocaleString('pt-BR')}</small>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

async function curtirPost(id, curtidasAtuais) {
    // 1. A TRAVA: Verifica se já existe um registro de curtida para este ID no seu PC
    if (localStorage.getItem(`curtido_${id}`)) {
        alert("Você já curtiu este recado! ❤️");
        return; // Para o código aqui e não envia nada para o banco
    }

    try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ curtidas: curtidasAtuais + 1 })
        });

        if (resposta.ok) {
            // 2. O CARIMBO: Salva no navegador que este post específico foi curtido
            localStorage.setItem(`curtido_${id}`, "true");
            carregarMensagens();
        }
    } catch (e) {
        console.error("Erro ao curtir:", e);
    }
}
}

// FUNÇÃO PARA EXCLUIR (DELETE)
async function excluirPost(id) {
    if (!confirm("Tem certeza que quer apagar este recado?")) return;

    await fetch(`${SUPABASE_URL}/rest/v1/Mural_Familia?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    carregarMensagens();
}