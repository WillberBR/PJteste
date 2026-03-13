// CONFIGURAÇÕES DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let nomeUsuarioLogado = "";

async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value.trim();
    try {
        const { data: usuarios, error } = await supabaseClient
            .from('usuarios_familia')
            .select('*').eq('email', email).eq('senha', senha);
        if (error) throw error;
        if (usuarios.length > 0) {
            nomeUsuarioLogado = usuarios[0].nome_exibicao;
            gerarAvatarNeon(nomeUsuarioLogado);
            document.getElementById('perfil-nome').innerText = nomeUsuarioLogado;
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('feed-area').style.display = 'block';
            
            // Adiciona a barra de emojis dinamicamente
            mostrarBarraEmojis();
            carregarMensagens();
        } else { alert("E-mail ou senha incorretos!"); }
    } catch (e) { console.error(e); }
}

// FUNÇÃO PARA A BARRA DE EMOJIS
function mostrarBarraEmojis() {
    const areaInput = document.querySelector('.mural-input');
    if (!areaInput) return;

    const emojis = ["❤️", "😂", "🙏", "🙌", "🔥", "🚀", "😍", "👏", "☀️", "☕"];
    const divEmojis = document.createElement('div');
    divEmojis.style.cssText = "display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;";
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.innerText = emoji;
        btn.style.cssText = "background: #222; border: 1px solid #333; border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 18px;";
        btn.onclick = () => {
            const textarea = document.getElementById('novoRecado');
            textarea.value += emoji;
            textarea.focus();
        };
        divEmojis.appendChild(btn);
    });
    
    areaInput.prepend(divEmojis);
}

function gerarAvatarNeon(nome) {
    const container = document.getElementById('perfil-foto-container');
    const inicial = nome.charAt(0).toUpperCase();
    const ehWillber = (nome.toLowerCase() === "willber");
    const cor = ehWillber ? "#ff0000" : "#00ff00";
    container.innerHTML = `<div style="width: 80px; height: 80px; border-radius: 50%; background: #111; color: ${cor}; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; border: 2px solid ${cor}; box-shadow: 0 0 15px ${cor}; margin: 0 auto 15px auto;">${inicial}</div>`;
}

async function carregarMensagens() {
    const mural = document.getElementById('mural-recados');
    try {
        const { data: mensagens, error } = await supabaseClient
            .from('Mural_Familia')
            .select('*').order('created_at', { ascending: false });
        if (error) throw error;
        mural.innerHTML = "";
        mensagens.forEach(msg => {
            const ehWillber = (msg.autor.toLowerCase() === "willber");
            const corNome = ehWillber ? "#ff0000" : "#00d9ff";
            const podeApagar = (nomeUsuarioLogado.toLowerCase() === "willber" || nomeUsuarioLogado === msg.autor);
            const jaCurtiu = localStorage.getItem(`curtiu_${msg.id}`);

            mural.innerHTML += `
                <div style="border: 1px solid ${ehWillber ? '#ff0000' : '#333'}; background: #111; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: ${corNome}; text-shadow: 0 0 10px ${corNome}; text-transform: uppercase;">
                            ${msg.autor} ${ehWillber ? '👑' : ''}
                        </strong>
                        ${podeApagar ? `<button onclick="apagarMensagem(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer;">🗑️</button>` : ''}
                    </div>
                    <p style="color: #eee; margin: 12px 0;">${msg.conteudo}</p>
                    <button onclick="curtirMensagem(${msg.id}, ${msg.curtidas || 0})" 
                        style="background: ${jaCurtiu ? 'rgba(255,0,0,0.1)' : '#1a1a1a'}; border: 1px solid ${jaCurtiu ? '#ff4444' : '#333'}; color: white; padding: 6px 14px; border-radius: 20px; cursor: ${jaCurtiu ? 'default' : 'pointer'}; display: flex; align-items: center; gap: 6px;">
                        ${jaCurtiu ? '❤️' : '💖'} <span>${msg.curtidas || 0}</span>
                    </button>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function curtirMensagem(id, totalAtual) {
    if (localStorage.getItem(`curtiu_${id}`)) return; 
    const { error } = await supabaseClient.from('Mural_Familia').update({ curtidas: totalAtual + 1 }).eq('id', id);
    if (!error) {
        localStorage.setItem(`curtiu_${id}`, "true");
        carregarMensagens(); 
    }
}

async function postarRecado() {
    const campo = document.getElementById('novoRecado');
    const texto = campo.value.trim();
    if