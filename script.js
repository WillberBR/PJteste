// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FUNÇÃO DE CADASTRO ---
async function executarCadastro() {
    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadSenha').value.trim();

    // Validação simples
    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos do pergaminho!");
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('usuarios_familia') // Nome da sua tabela de usuários
            .insert([{ nome_exibicao: nome, email: email, senha: senha }]);

        if (error) throw error;

        alert("Conta criada com sucesso! Agora você pode entrar no reino.");
        window.location.href = "index.html"; // Volta para o login após cadastrar
    } catch (e) {
        console.error("Erro no cadastro:", e);
        alert("Erro: Este e-mail já pode estar em uso ou houve um problema de conexão.");
    }
}

// --- FUNÇÃO DE LOGIN ---
async function executarLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value.trim();

    if (!email || !senha) {
        alert("Preencha o e-mail e a senha para entrar!");
        return;
    }

    try {
        const { data: usuarios, error } = await supabaseClient
            .from('usuarios_familia')
            .select('*')
            .eq('email', email)
            .eq('senha', senha);

        if (error) throw error;

        if (usuarios.length > 0) {
            // SALVA O USUÁRIO NO NAVEGADOR (Local Storage)
            // Isso serve para a página de criação saber QUEM está logado
            localStorage.setItem("usuario_logado_email", email);
            localStorage.setItem("usuario_logado_nome", usuarios[0].nome_exibicao);

            alert("Bem-vindo de volta, " + usuarios[0].nome_exibicao + "!");
            window.location.href = "personagem.html"; // Vai para a criação de personagem
        } else {
            alert("E-mail ou senha incorretos. Tente novamente ou peça ajuda ao Mestre!");
        }
    } catch (e) {
        console.error("Erro no login:", e);
        alert("Houve um erro ao tentar acessar o reino.");
    }
}