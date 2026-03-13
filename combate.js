// combate.js
function calcularDano(heroi) {
    let danoBase = heroi.forca * 2;
    
    // Cada ponto de Agilidade dá 5% de chance de crítico
    let chanceCritico = (heroi.agilidade || 0) * 5;
    let dado = Math.random() * 100;

    if (dado < chanceCritico) {
        console.log("🔥 CRÍTICO!");
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