// --- LÓGICA DE COMBATE ---

function calcularDano(heroi) {
    let danoBase = heroi.forca * 2;
    let chanceCritico = (heroi.agilidade || 0) * 5;
    let dado = Math.random() * 100;

    if (dado < chanceCritico) {
        return danoBase * 2; // Crítico!
    }
    return danoBase;
}

function verificarLevelUp(heroi) {
    let xpNecessario = heroi.nivel * 20;
    if (heroi.xp >= xpNecessario) {
        heroi.nivel++;
        heroi.xp = 0;
        heroi.pontos_livres = (heroi.pontos_livres || 0) + 5; // Ganha pontos ao subir
        return true;
    }
    return false;
}

function sortearOuro(nivelMonstro) {
    let base = Math.floor(Math.random() * 5) + 1;
    return base * nivelMonstro;
}

function calcularDanoMonstro(nivel) {
    return Math.floor(Math.random() * 5) + (nivel + 1);
}

// --- FUNÇÃO DE SALVAMENTO PÓS-VITÓRIA ---
// Chame esta função assim que o monstro morrer!
async function finalizarCombate(heroi, ouroGanho, xpGanho) {
    // Atualiza localmente
    heroi.ouro += ouroGanho;
    heroi.xp += xpGanho;
    
    const subiuDeNivel = verificarLevelUp(heroi);

    try {
        const { error } = await supabaseClient
            .from('personagens')
            .update({ 
                ouro: heroi.ouro, 
                xp: heroi.xp,
                nivel: heroi.nivel,
                hp_atual: heroi.hp_atual,
                pontos_livres: heroi.pontos_livres
            })
            .eq('id', heroi.id);

        if (error) throw error;
        
        if (subiuDeNivel) alert("✨ LEVEL UP! Você alcançou o nível " + heroi.nivel);
        console.log("💰 Ouro e XP salvos no Supabase!");
        
    } catch (e) {
        console.error("Erro ao salvar progresso:", e);
        alert("Erro ao salvar progresso no banco de dados!");
    }
}
