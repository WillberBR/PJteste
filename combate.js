// Configurações de XP
const XP_POR_MONSTRO = 5; // Quanto ganha por clique/morte
const XP_BASE_LEVEL = 20; // XP necessário para o Level 2

// Função para calcular o dano que o herói dá
function calcularDano(heroi) {
    // Dano = 1 + (Força * 2) + (Nível * 0.5)
    return Math.floor(1 + (heroi.forca * 2) + (heroi.nivel * 0.5));
}

// Função que verifica se o herói subiu de nível
function verificarLevelUp(heroi) {
    let xpNecessario = XP_BASE_LEVEL * heroi.nivel;

    if (heroi.xp >= xpNecessario) {
        heroi.nivel += 1;
        heroi.xp = 0; // Reseta o XP (ou subtrai o necessário)
        heroi.pontos_livres += 2; // Ganha 2 pontos para distribuir!
        return true; // Subiu de nível!
    }
    return false; // Ainda não subiu
}