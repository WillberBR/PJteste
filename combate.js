// REGRAS DE COMBATE
function calcularDano(heroi) {
    // Dano = 1 + (Força * 2)
    return Math.floor(1 + (heroi.forca * 2));
}

function verificarLevelUp(heroi) {
    let xpNecessario = 20 * heroi.nivel;
    if (heroi.xp >= xpNecessario) {
        heroi.nivel += 1;
        heroi.xp = 0;
        heroi.pontos_livres += 2;
        return true;
    }
    return false;
}