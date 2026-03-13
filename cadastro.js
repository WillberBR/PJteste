// Configurações do seu Supabase
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function fazerCadastro() {
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const senha = document.getElementById('regPass').value.trim();

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos, Willber!");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('usuarios_familia')
            .insert([
                { 
                    nome_exibicao: nome, 
                    email: email, 
                    senha: senha, 
                    role: 'user', 
                    bio: 'Novo na família!' 
                }
            ]);

        if (error) {
            alert("Erro: Este e-mail já pode estar cadastrado.");
            console.error(error);
        } else {
            alert("Sucesso! Bem-vindo à família.");
            window.location.href = 'index.html'; // Volta para o login
        }
    } catch (e) {
        console.error("Erro fatal:", e);
        alert("Erro ao conectar com o servidor.");
    }
}