// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://zkeshycglokyycuplczn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iDavmG9sQzqW6jPrOCjsmQ_5ISCiZUF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function fazerCadastro() {
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const senha = document.getElementById('regPass').value.trim();

    // --- 1. VALIDAÇÃO DE QUALIDADE ---
    
    // Impede nomes vazios ou curtos demais
    if (nome.length < 3) {
        alert("O nome precisa ter pelo menos 3 letras!");
        return;
    }

    // Impede nomes gigantes que quebram o layout
    if (nome.length > 20) {
        alert("Escolha um nome ou apelido mais curto (máximo 20 letras).");
        return;
    }

    // Regra de Ouro: Apenas letras e espaços (evita símbolos que estragam o visual)
    const apenasLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!apenasLetras.test(nome)) {
        alert("Por favor, use apenas letras no seu nome de exibição.");
        return;
    }

    if (!email.includes("@") || senha.length < 6) {
        alert("Verifique o e-mail ou use uma senha com pelo menos 6 dígitos.");
        return;
    }

    // --- 2. ENVIO PARA O SUPABASE ---
    try {
        const { error } = await supabaseClient
            .from('usuarios_familia')
            .insert([{ 
                nome_exibicao: nome, 
                email: email, 
                senha: senha, 
                role: 'user', 
                bio: 'Novo na família! 🏠' 
            }]);

        if (error) {
            alert("Este e-mail já está sendo usado por outro familiar.");
        } else {
            alert("Cadastro aprovado! Agora você já pode entrar.");
            window.location.href = 'index.html';
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão. Tente novamente mais tarde.");
    }
}