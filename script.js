function fazerLogin() {
    // Pegamos os elementos da tela
    const campoUsuario = document.getElementById('userName');
    const campoSenha = document.getElementById('userPass');
    const msgErro = document.getElementById('erro');

    // Pegamos os valores e limpamos espaços extras
    const usuarioDigitado = campoUsuario.value.trim().toLowerCase();
    const senhaDigitada = campoSenha.value.trim();

    // LISTA DE USUÁRIOS (Verifique se a senha está exatamente como você quer)
    const usuarios = {
        "adamswilber@gmail.com": "180297dk",
        "pai": "familia01",
        "mae": "familia02"
    };

    // TESTE LÓGICO
    if (usuarios[usuarioDigitado] && usuarios[usuarioDigitado] === senhaDigitada) {
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('feed-area').style.display = 'block';
        document.getElementById('bemVindo').innerText = "Olá! Login realizado com sucesso.";
        msgErro.innerText = ""; // Limpa erro se houver
    } else {
        msgErro.innerText = "Usuário ou senha incorretos!";
        console.log("Tentativa com:", usuarioDigitado, "| Senha:", senhaDigitada);
    }
}

function logout() {
    location.reload();
}