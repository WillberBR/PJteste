function fazerLogin() {
    const nome = document.getElementById('userName').value.toLowerCase();
    const senha = document.getElementById('userPass').value;

    // Aqui você cria os usuários e senhas da sua família
    const usuarios = {
        "pai": "senhaDoPai789",
        "mae": "senhaDaMae456",
        "irmao": "senhaIrmao321"
    };

    if (usuarios[nome] && usuarios[nome] === senha) {
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('feed-area').style.display = 'block';
        document.getElementById('bemVindo').innerText = "Olá, " + nome.charAt(0).toUpperCase() + nome.slice(1) + "!";
    } else {
        document.getElementById('erro').innerText = "Usuário ou senha incorretos!";
    }
}

function logout() {
    location.reload();
}