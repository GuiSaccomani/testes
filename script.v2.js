// ==========================================
// CONFIGURAÇÕES GERAIS
// ==========================================
const NOME_DELA = ""; // Deixe o nome aqui ou vazio
const MEU_WHATSAPP = "5511993580014"; // Seu número configurado

let estado = {
    programa: "",
    dia: "",
    horario: "",
    tentativasNo: 0,
    dataHora: ""
};

const frasesNao = [
    "tem certeza?",
    "pensa direito...",
    "o botão tá com medo de você!",
    "já era, clica no SIM",
    "última chance hein",
    "falei pra clicar no outro!"
];

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (NOME_DELA.trim() !== "") {
        document.getElementById('titulo-principal').innerText = `${NOME_DELA}, VOCÊ QUER SAIR COMIGO?`;
    }

    initBotaoNao();
    initRole();
    initCalendario();
    initHorario();
    initFinal();
});

// ==========================================
// LÓGICA DO BOTÃO "NÃO" MOBILE-FIRST
// ==========================================
function initBotaoNao() {
    const btnNao = document.getElementById('btn-nao');
    const btnSim = document.getElementById('btn-sim');
    const msgNao = document.getElementById('msg-nao');

    // Previne clique para não dar erro duplo no touch
    btnNao.addEventListener('click', (e) => e.preventDefault());

    function fugir(e) {
        e.preventDefault();
        
        // Vibração curta se o celular suportar
        if (navigator.vibrate) {
            try { navigator.vibrate(30); } catch(err) {}
        }

        if (estado.tentativasNo >= 6) {
            btnNao.style.display = 'none';
            msgNao.innerText = "agora não tem jeito!";
            msgNao.classList.remove('hidden');
            msgNao.style.position = 'relative';
            msgNao.style.marginTop = '10px';
            return;
        }

        // Pega a posição inicial antes de mudar para fixed para a transição não "pular"
        if (btnNao.style.position !== 'fixed') {
            const rect = btnNao.getBoundingClientRect();
            btnNao.style.position = 'fixed';
            btnNao.style.left = `${rect.left}px`;
            btnNao.style.top = `${rect.top}px`;
            // Força o reflow para aplicar as coordenadas antes da nova posição
            btnNao.offsetHeight; 
        }

        const btnW = btnNao.offsetWidth;
        const btnH = btnNao.offsetHeight;
        const simRect = btnSim.getBoundingClientRect();
        const contentTopRect = document.querySelector('.content-top').getBoundingClientRect();
        const margin = 16;

        let x, y;
        let valid = false;
        let tries = 0;

        // Tenta achar uma posição entre os textos e o botão SIM sem encostar nas bordas
        while (!valid && tries < 50) {
            x = margin + Math.random() * (window.innerWidth - btnW - margin * 2);
            
            const minY = contentTopRect.bottom + margin;
            const maxY = simRect.top - btnH - margin;
            
            if (maxY > minY) {
                y = minY + Math.random() * (maxY - minY);
            } else {
                // Fallback de segurança se a tela for minúscula
                y = margin + Math.random() * (window.innerHeight - btnH - margin * 2);
            }
            valid = true;
            tries++;
        }

        btnNao.style.left = `${x}px`;
        btnNao.style.top = `${y}px`;

        const index = Math.min(estado.tentativasNo, frasesNao.length - 1);
        msgNao.innerText = frasesNao[index];
        msgNao.classList.remove('hidden');
        
        // Coloca a mensagem um pouco acima do botão
        msgNao.style.position = 'fixed';
        msgNao.style.left = `${x}px`;
        msgNao.style.top = `${y - 30}px`;

        let scaleNao = 1 - (estado.tentativasNo * 0.08);
        btnNao.style.transform = `scale(${Math.max(0.6, scaleNao)})`;

        estado.tentativasNo++;
    }

    // Pointerdown é o mais ágil no celular (zero delay)
    btnNao.addEventListener('pointerdown', fugir);
    
    // Para desktop, caso o usuário chegue perto
    btnNao.addEventListener('mouseenter', (e) => {
        if (window.matchMedia("(hover: hover)").matches) {
            fugir(e);
        }
    });

    btnSim.addEventListener('click', () => {
        changeScreen('tela-1', 'tela-2');
        const stamp = document.getElementById('stamp-confirmado');
        stamp.classList.add('show');
        setTimeout(() => {
            stamp.style.display = 'none';
        }, 1200);
    });
}

// ==========================================
// TELA 2: ROLÊ
// ==========================================
function initRole() {
    const options = document.querySelectorAll('.option-item');
    const msgOpcao = document.getElementById('msg-opcao');
    let optionSelected = false;

    const svgX = `
        <svg class="drawn-x" viewBox="0 0 50 50">
            <path d="M10,12 Q25,25 40,38 M38,10 Q25,25 12,42" stroke="var(--tomato)" stroke-width="4" stroke-linecap="round" fill="none" pathLength="100" />
        </svg>
    `;

    options.forEach(opt => {
        opt.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (optionSelected) return; // Evita duplo clique rápido
            optionSelected = true;
            
            estado.programa = opt.getAttribute('data-opcao');
            opt.insertAdjacentHTML('beforeend', svgX);
            msgOpcao.classList.remove('hidden');
            
            // Avança sozinho após um momento para o X ser visto
            setTimeout(() => {
                changeScreen('tela-2', 'tela-3');
                optionSelected = false;
            }, 1000);
        });
    });
}

// ==========================================
// TELA 3: CALENDÁRIO
// ==========================================
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initCalendario() {
    renderCalendar();
    
    document.getElementById('btn-prev-month').addEventListener('click', () => {
        currentMonth--;
        if(currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });
    
    document.getElementById('btn-next-month').addEventListener('click', () => {
        currentMonth++;
        if(currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    document.getElementById('btn-avancar-data').addEventListener('click', () => {
        changeScreen('tela-3', 'tela-4');
    });
}

function renderCalendar() {
    const cal = document.getElementById('calendar');
    // Mantém só o cabeçalho
    cal.innerHTML = `
        <div class="cal-header">D</div><div class="cal-header">S</div><div class="cal-header">T</div>
        <div class="cal-header">Q</div><div class="cal-header">Q</div><div class="cal-header">S</div>
        <div class="cal-header">S</div>
    `;
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    document.getElementById('month-label').innerText = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Dias em branco
    for (let i = 0; i < firstDay; i++) {
        cal.insertAdjacentHTML('beforeend', `<div class="cal-day disabled"></div>`);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const svgCircle = `
        <svg class="drawn-circle" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M50,10 C75,10 90,30 90,50 C90,75 70,90 50,90 C25,90 10,70 10,50 C10,25 30,10 55,12" stroke="var(--tomato)" stroke-width="6" fill="none" stroke-linecap="round" pathLength="100" />
        </svg>
    `;
    
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.innerText = i;
        
        const cellDate = new Date(currentYear, currentMonth, i);
        if (cellDate < today) {
            div.classList.add('disabled');
        } else {
            const dateStr = `${String(i).padStart(2, '0')}/${String(currentMonth+1).padStart(2, '0')}/${currentYear}`;
            
            // Restaura se já estiver selecionado
            if (estado.dia === dateStr) {
                div.insertAdjacentHTML('beforeend', svgCircle);
            }

            div.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                // Limpa seleções
                document.querySelectorAll('.cal-day').forEach(el => {
                    const svg = el.querySelector('.drawn-circle');
                    if (svg) el.removeChild(svg);
                });
                
                estado.dia = dateStr;
                div.insertAdjacentHTML('beforeend', svgCircle);
                document.getElementById('btn-avancar-data').classList.remove('hidden');
            });
        }
        cal.appendChild(div);
    }
}

// ==========================================
// TELA 4: HORÁRIO
// ==========================================
function initHorario() {
    const timeTags = document.querySelectorAll('.time-tag');
    const inputHora = document.getElementById('input-hora');
    const btnFinalizar = document.getElementById('btn-finalizar');

    function checkReady() {
        if (estado.horario && estado.horario.length >= 4) {
            btnFinalizar.classList.remove('hidden');
        } else {
            btnFinalizar.classList.add('hidden');
        }
    }

    timeTags.forEach(tag => {
        tag.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            timeTags.forEach(t => t.classList.remove('selected'));
            tag.classList.add('selected');
            inputHora.value = ''; 
            estado.horario = tag.innerText;
            checkReady();
        });
    });

    // Máscara de horário (00:00)
    inputHora.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.slice(0,2) + ':' + val.slice(2,4);
        }
        e.target.value = val;

        timeTags.forEach(t => t.classList.remove('selected'));
        estado.horario = val;
        checkReady();
    });

    btnFinalizar.addEventListener('click', async () => {
        btnFinalizar.innerText = "ENVIANDO...";
        estado.dataHora = new Date().toLocaleString('pt-BR');
        
        await sendFormWithRetry();
        montarIngresso();
    });
}

// Envio com 1 tentativa de fallback
async function sendFormWithRetry(retries = 1) {
    const payload = new URLSearchParams({
        'form-name': 'convite',
        'programa': estado.programa,
        'dia': estado.dia,
        'horario': estado.horario,
        'tentativas_no': estado.tentativasNo,
        'data_hora_resposta': estado.dataHora
    }).toString();

    const attempt = async () => {
        const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        });
        if (!res.ok) throw new Error('Falha no envio');
    };

    try {
        await attempt();
    } catch (err) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, 1000));
            try {
                await attempt();
            } catch (err2) {
                console.error('Falha final', err2);
            }
        }
    }
}

// ==========================================
// TELA 5: INGRESSO E WHATSAPP
// ==========================================
function montarIngresso() {
    document.getElementById('ticket-role').innerText = estado.programa.toUpperCase();
    document.getElementById('ticket-dia').innerText = estado.dia;
    document.getElementById('ticket-hora').innerText = estado.horario;
    
    changeScreen('tela-4', 'tela-5');
}

function initFinal() {
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    
    btnWhatsapp.addEventListener('click', () => {
        let msg = `Opa! Acabei de responder o seu convite!\n\n`;
        msg += `*Rolê:* ${estado.programa}\n`;
        msg += `*Dia:* ${estado.dia}\n`;
        msg += `*Horário:* ${estado.horario}\n\n`;
        msg += `Mal posso esperar!`;
        
        const url = `https://wa.me/${MEU_WHATSAPP}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    });
}

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
function changeScreen(idAtual, idProxima) {
    const atual = document.getElementById(idAtual);
    const proxima = document.getElementById(idProxima);
    
    atual.classList.remove('active');
    proxima.classList.add('active');
    
    window.scrollTo(0, 0); // Garante que a nova tela abra no topo
}
