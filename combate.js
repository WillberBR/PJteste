// REGRAS DE COMBATE E PROGRESSÃO

// Quanto de XP cada clique/vitória rende
const XP_POR_MONSTRO = 5; 

// Função que calcula o dano baseado nos seus atributos do banco de dados
function calcularDano(heroi) {
    // Dano base 1 + dobro da força + bônus por nível
    return Math.floor(1 + (heroi.forca * 2) + (heroi.nivel * 0.5));
}

// Função que controla a subida de nível
function verificarLevelUp(heroi) {
    // XP necessário aumenta a cada nível (ex: Level 1 precisa de 20 XP)
    let xpNecessario = 20 * heroi.nivel;

    if (heroi.xp >= xpNecessario) {
        heroi.nivel += 1;
        heroi.xp = 0; // Reinicia a barra de XP
        heroi.pontos_livres += 2; // Dá 2 pontos para você gastar no painel lateral
        return true; 
    }
    return false;
}