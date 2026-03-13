function fazerLogin() {
    // Pegamos o que foi digitado (convertendo para minúsculo para evitar erro de Caps Lock)
    const usuarioDigitado = document.getElementById('userName').value.toLowerCase().trim();
    const senhaDigitada = document.getElementById('userPass').value;

    // LISTA DE FAMILIARES (Aqui você define quem entra)
    const usuarios = {
        "adamswilber@gmail.com": "180297dk", // Coloque a senha que você tentou no print
        "pai": "familia01",
        "mae": "familia02"
    };

    if (usuarios[usuarioDigitado] && usuarios[usuarioDigitado] === senhaDigitada) {
        // Se acertar, esconde o login e mostra o feed
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('feed-area').style.display = 'block';
        document.getElementById('bemVindo').innerText = "Olá! Bem-vindo à rede da família.";
    } else {
        // Se errar, mostra a mensagem vermelha
        document.getElementById('erro').innerText = "Usuário ou senha incorretos!";
    }
}

function logout() {
    location.reload();
}