function fazerLogin() {
    const usuarioDigitado = document.getElementById('userName').value.toLowerCase().trim();
    const senhaDigitada = document.getElementById('userPass').value.trim();

    // Isso vai mostrar um aviso na tela assim que você clicar no botão
    alert("Você digitou o usuário: " + usuarioDigitado);

    const usuarios = {
        "adamswilber@gmail.com": "180297dk",
        "pai": "familia01"
    };

    if (usuarios[usuarioDigitado] && usuarios[usuarioDigitado] === senhaDigitada) {
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('feed-area').style.display = 'block';
        document.getElementById('bemVindo').innerText = "Olá! Finalmente funcionou.";
    } else {
        document.getElementById('erro').innerText = "O código leu: " + usuarioDigitado + " e a senha: " + senhaDigitada;
    }
}

function logout() {
    location.reload();
}