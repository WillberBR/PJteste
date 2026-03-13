// CONFIGURAÇÕES DO SUPABASE (Mantenha as suas chaves reais aqui)
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let nomeUsuarioLogado = "";

// INJETA O CSS DA ANIMAÇÃO NO TOQUE DA PÁGINA
(function adicionarEstilosAnimacao() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes popIn {
            0% { transform: scale(1); }
            50% { transform: scale(1.6); }
            100% { transform: scale(1); }
        }
        .emoji-clicado {
            animation: popIn 0.3s ease-out;
            pointer-events: none; /* Impede cliques extras durante a animação */
        }
    `;
    document.head.appendChild(style);
})();

async function fazerLogin() {
    const emailField = document.getElementById('loginEmail');
    const senhaField = document.getElementById('loginSenha');
    if (!emailField || !senhaField) return;
    const email = emailField.value.trim().toLowerCase();
    const senha = senhaField.value.trim();
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
            carregarMensagens();
        } else { alert("E-mail ou senha incorretos!"); }
    } catch (e) { console.error("Erro no login:", e); }
}

function formatarTempo(dataISO) {
    const agora = new Date();
    const postagem = new Date(dataISO);
    const segundos = Math.floor((agora - postagem) / 1000);
    if (segundos < 60) return "agora";
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    return `${Math.floor(horas / 24)}d`;
}

function gerarAvatarNeon(nome) {
    const container = document.getElementById('perfil-foto-container');
    if (!container) return;
    const inicial = nome.charAt(0).toUpperCase();
    const ehWillber = (nome.toLowerCase() === "willber");
    const cor = ehWillber ? "#ff0000" : "#00ff00";
    container.innerHTML = `<div style="width: 80px; height: 80px; border-radius: 50%; background: #111; color: ${cor}; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; border: 2px solid ${cor}; box-shadow: 0 0 15px ${cor}; margin: 0 auto 10px auto;">${inicial}</div>`;
}

async function carregarMensagens() {
    const mural = document.getElementById('mural-recados');
    if (!mural) return;
    try {
        const { data: mensagens, error } = await supabaseClient
            .from('Mural_Familia')
            .select('*').order('created_at', { ascending: false });
        if (error) throw error;
        mural.innerHTML = "";
        
        const emojisReacao = ["❤️", "😂", "🙏", "🔥", "👏"];

        mensagens.forEach(msg => {
            const ehWillber = (msg.autor.toLowerCase() === "willber");
            const corNome = ehWillber ? "#ff0000" : "#00d9ff";
            const podeApagar = (nomeUsuarioLogado.toLowerCase() === "willber" || nomeUsuarioLogado === msg.autor);
            const jaReagiu = localStorage.getItem(`reagiu_${msg.id}`);
            const tempo = formatarTempo(msg.created_at);

            let botoesReacao = "";
            emojisReacao.forEach(emoji => {
                botoesReacao += `
                    <button onclick="reagirMensagem(${msg.id}, ${msg.curtidas || 0}, '${emoji}', this)" 
                        style="background: none; border: none; cursor: ${jaReagiu ? 'default' : 'pointer'}; font-size: 18px; filter: ${jaReagiu ? 'grayscale(100%)' : 'none'}; opacity: ${jaReagiu ? '0.5' : '1'}; transition: 0.2s; display: inline-block;">
                        ${emoji}
                    </button>`;
            });

            mural.innerHTML += `
                <div style="border: 1px solid ${ehWillber ? '#ff0000' : '#333'}; background: #111; padding: 15px; border-radius: 12px; margin-bottom: 15px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: ${corNome}; font-weight: bold; text-shadow: 0 0 5px ${corNome}; text-transform: uppercase; font-size: 13px;">${msg.autor} ${ehWillber ? '👑' : ''}</span>
                        <span style="color: #555; font-size: 10px;">postado ${tempo}</span>
                    </div>
                    <p style="color: #eee; margin-bottom: 15px; font-size: 14px; line-height: 1.4;">${msg.conteudo}</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #222; padding-top: 10px;">
                        <div style="display: flex; gap: 8px;">
                            ${botoesReacao}
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <span style="color: #00ff00; font-weight: bold; font-size: 14px;">${msg.curtidas || 0}</span>
                            ${podeApagar ? `<button onclick="apagarMensagem(${msg.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size: 16px; margin-left: 10px;">🗑️</button>` : ''}
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { console.error("Erro ao carregar mural:", e); }
}

async function reagirMensagem(id, totalAtual, emoji, botao) {
    if (localStorage.getItem(`reagiu_${id}`)) return; 
    
    // ATIVA A ANIMAÇÃO NO BOTÃO CLICADO
    botao.classList.add('emoji-clicado');

    try {
        const { error } = await supabaseClient
            .from('Mural_Familia')
            .update({ curtidas: totalAtual + 1 })
            .eq('id', id);

        if (!error) {
            localStorage.setItem(`reagiu_${id}`, "true");
            // Pequeno atraso para a animação terminar antes de recarregar a tela
            setTimeout(() => carregarMensagens(), 350); 
        }
    } catch (e) { console.error("Erro ao reagir:", e); }
}

async function postarRecado() {
    const campo = document.getElementById('novoRecado');
    if (!campo || !campo.value.trim()) return;
    const { error } = await supabaseClient
        .from('Mural_Familia')
        .insert([{ autor: nomeUsuarioLogado, conteudo: campo.value.trim(), curtidas: 0 }]);
    if (!error) { campo.value = ""; carregarMensagens(); }
}

async function apagarMensagem(id) {
    if (!confirm("Deseja mesmo apagar esse recado?")) return;
    await supabaseClient.from('Mural_Familia').delete().eq('id', id);
    carregarMensagens();
}

function sair() { location.reload(); }