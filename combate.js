// combate.js

function calcularDano(heroi) {
    let danoBase = heroi.forca * 2;
    
    // Cada ponto de Agilidade dá 5% de chance de crítico
    let chanceCritico = (heroi.agilidade || 0) * 5;
    let dado = Math.random() * 100;

    if (dado < chanceCritico) {
        return danoBase * 2; // Dano crítico dobra o valor
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

// Função que define quanto ouro o monstro solta
function sortearOuro(nivelMonstro) {
    // Sorteia entre 1 e 5 de ouro, multiplicado pelo nível do monstro
    let base = Math.floor(Math.random() * 5) + 1;
    return base * nivelMonstro;
}