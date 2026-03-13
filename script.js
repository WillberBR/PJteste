// CONFIGURAÇÕES DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let nomeUsuarioLogado = "";

// FUNÇÃO DE LOGIN
async function fazerLogin() {
    const emailElement = document.getElementById('loginEmail');
    const senhaElement = document.getElementById('loginSenha');

    if (!emailElement || !senhaElement) {
        alert("Erro técnico: Campos de login não encontrados no HTML.");
        return;
    }

    const email = emailElement.value.trim().toLowerCase();
    const senha = senhaElement.value.trim();

    try {
        const { data: usuarios, error } = await supabaseClient
            .from('usuarios_familia')
            .select('*')
            .eq('email', email)
            .eq('senha', senha);

        if (error) throw error;

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            nomeUsuarioLogado = usuario.nome_exibicao;

            gerarAvatarNeon(nomeUsuarioLogado);

            document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';

            carregarMensagens();
        } else {
            alert("E-mail ou senha incorretos!");
        }
    } catch (e) {
        console.error(e);
        alert("Erro ao entrar. Verifique sua conexão.");
    }
}

// FUNÇÃO PARA GERAR O AVATAR NEON
function gerarAvatarNeon(nome) {
    const container = document.getElementById('perfil-foto-container');
    if (!container) return;
    
    const inicial = nome.charAt(0).toUpperCase();
    const ehWillber = (nome.toLowerCase() === "willber");
    const corBrilho = ehWillber ? "#ff0000" : "#00ff00";

    container.innerHTML = `
        <div style="width: 80px; height: 80px; border-radius: 50%; background: #111; color: ${corBrilho}; 
        display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; 
        border: 2px solid ${corBrilho}; box-shadow: 0 0 15px ${corBrilho}; text-shadow: 0 0 10px ${corBrilho}; margin: 0 auto 15px auto;">
            ${inicial}
        </div>
    `;
}

// FUNÇÃO PARA CARREGAR MURAL
async function carregarMensagens() {
    const mural = document.getElementById('mural-recados');
    if (!mural) return;
    
    mural.innerHTML = "Carregando recados...";

    try {
        const { data: mensagens, error } = await supabaseClient
            .from('Mural_Familia') 
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        mural.innerHTML = "";
        mensagens.forEach(msg => {
            const ehWillber = (msg.autor.toLowerCase() === "willber");
            const corNome = ehWillber ? "#ff0000" : "#00d9ff";
            const brilhoSombra = ehWillber ? "0 0 15px #ff0000" : "0 0 10px #00d9ff";

            const iconesAdmin = ehWillber ? `
                <span style="color:#FFD700; text-shadow: 0 0 10px #FFD700; font-size:16px; margin-left:8px;">👑</span>
                <span style="color:#FFD700; font-size:10px; margin-left:4px; font-weight: bold;">★ VERIFICADO</span>
            ` : '';

            const podeApagar = (nomeUsuarioLogado.toLowerCase() === "willber" || nomeUsuarioLogado === msg.autor);

            mural.innerHTML += `
                <div style="border: 1px solid ${ehWillber ? '#ff0000' : '#333'}; background: #111; padding: 15px; border-radius: 12px; margin-bottom: 15px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center;">
                            <strong style="color: ${corNome}; text-shadow: ${brilhoSombra}; font-size: 1.1em; text-transform: uppercase;">
                                ${msg.autor}
                            </strong>
                            ${iconesAdmin}
                        </div>
                        ${podeApagar ? `<button onclick="apagarMensagem(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:18px;" title="Apagar">🗑️</button>` : ''}
                    </div>
                    <p style="color: #eee; line-height: 1.5; margin: 0;">${msg.conteudo}</p>
                </div>
            `;
        });
    } catch (e) {
        mural.innerHTML = "Erro ao carregar mural.";
        console.error(e);
    }
}

// FUNÇÃO PARA POSTAR
async function postarRecado() {
    const textoArea = document.getElementById('novoRecado');
    const texto = textoArea ? textoArea.value.trim() : "";
    
    if (!texto) return;

    const { error } = await supabaseClient
        .from('Mural_Familia')
        .insert([{ autor: nomeUsuarioLogado, conteudo: texto }]);

    if (!error) {
        textoArea.value = "";
        carregarMensagens();
    } else {
        alert("Erro ao postar: " + error.message);
    }
}

// FUNÇÃO PARA APAGAR MENSAGEM
async function apagarMensagem(id) {
    if (!confirm("Tem certeza que deseja apagar este recado?")) return;

    const { error } = await supabaseClient
        .from('Mural_Familia')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Erro ao apagar: " + error.message);
    } else {
        carregarMensagens();
    }
}

function sair() {
    location.reload();
}