// combate.js

function calcularDano(heroi) {
    let danoBase = heroi.forca * 2;
    let chanceCritico = (heroi.agilidade || 0) * 5;
    let dado = Math.random() * 100;

    if (dado < chanceCritico) {
        return danoBase * 2;
    }
    return danoBase;
}

function verificarLevelUp(heroi) {
    let xpNecessario = heroi.nivel * 20;
    if (heroi.xp >= xpNecessario) {
        heroi.nivel++;
        heroi.xp = 0;
        return true;
    }
    return false;
}

function sortearOuro(nivelMonstro) {
    let base = Math.floor(Math.random() * 5) + 1;
    return base * nivelMonstro;
}

// NOVA: Lógica de dano do monstro
function calcularDanoMonstro(nivel) {
    // Monstro causa entre 2 e 6 de dano baseados no nível
    return Math.floor(Math.random() * 5) + (nivel + 1);
}