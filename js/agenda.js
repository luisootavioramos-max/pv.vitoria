// Lógica do Menu Hambúrguer
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Gerenciador de eventos com localStorage
class EventManager {
    constructor() {
        this.storageKey = 'pvVitoriaEvents';
        this.eventos = this.loadEvents();
    }

    loadEvents() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        // Eventos padrão
        return {
            '2026-04-15': {
                title: 'Jogo Amistoso',
                time: '19:00',
                location: 'Campo da Vila',
                opponent: 'FC União'
            },
            '2026-04-22': {
                title: 'Jogo Campeonato',
                time: '20:00',
                location: 'Estádio Central',
                opponent: 'Eagles FC'
            },
            '2026-05-02': {
                title: 'Treino Coletivo',
                time: '18:30',
                location: 'Campo da Vila',
                opponent: 'Duração: 2 horas'
            },
            '2026-05-10': {
                title: 'Jogo Campeonato',
                time: '19:30',
                location: 'Campo Rival',
                opponent: 'Atlético Força'
            }
        };
    }

    saveEvents() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.eventos));
    }

    addEvent(date, title, time, location, opponent) {
        this.eventos[date] = {
            title,
            time,
            location,
            opponent
        };
        this.saveEvents();
    }

    updateEvent(date, title, time, location, opponent) {
        this.eventos[date] = {
            title,
            time,
            location,
            opponent
        };
        this.saveEvents();
    }

    deleteEvent(date) {
        delete this.eventos[date];
        this.saveEvents();
    }

    getNextGame() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureEvents = Object.entries(this.eventos)
            .filter(([dateStr]) => new Date(dateStr) >= today)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));
        
        return futureEvents.length > 0 ? futureEvents[0] : null;
    }
}

// Sistema de Autenticação
class AuthManager {
    constructor() {
        this.PASSWORD = 'ADM123';
        this.sessionKey = 'pvVitoriaAuthSession';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.pendingAction = null;
    }

    isAuthenticated() {
        const session = sessionStorage.getItem(this.sessionKey);
        if (!session) return false;

        const sessionData = JSON.parse(session);
        const now = Date.now();

        if (now - sessionData.timestamp > this.sessionTimeout) {
            sessionStorage.removeItem(this.sessionKey);
            return false;
        }

        // Renova a sessão
        sessionData.timestamp = now;
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        return true;
    }

    authenticate(password) {
        if (password === this.PASSWORD) {
            sessionStorage.setItem(
                this.sessionKey,
                JSON.stringify({ timestamp: Date.now() })
            );
            return true;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
    }

    requireAuth(action) {
        if (this.isAuthenticated()) {
            action();
        } else {
            this.pendingAction = action;
            authModal.classList.add('show');
            authPassword.value = '';
            authPassword.focus();
        }
    }
}

const eventManager = new EventManager();
const authManager = new AuthManager();

let currentDate = new Date();
let editingDate = null;

// Seleciona elementos do DOM
const calendarDays = document.getElementById('calendarDays');
const monthYearDisplay = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const btnADM = document.getElementById('btnADM');
const eventModal = document.getElementById('eventModal');
const closeModal = document.getElementById('closeModal');
const eventForm = document.getElementById('eventForm');
const btnCancelForm = document.getElementById('btnCancelForm');
const btnDeleteEvent = document.getElementById('btnDeleteEvent');
const modalTitle = document.getElementById('modalTitle');

// Modal de Autenticação
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authPassword = document.getElementById('authPassword');
const btnCancelAuth = document.getElementById('btnCancelAuth');

// Event listeners - Autenticação
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (authManager.authenticate(authPassword.value)) {
        authModal.classList.remove('show');
        
        if (authManager.pendingAction) {
            authManager.pendingAction();
            authManager.pendingAction = null;
        }
    } else {
        authPassword.value = '';
        authPassword.placeholder = 'Senha incorreta!';
        setTimeout(() => {
            authPassword.placeholder = 'Senha';
        }, 2000);
    }
});

btnCancelAuth.addEventListener('click', () => {
    authModal.classList.remove('show');
    authManager.pendingAction = null;
});

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('show');
        authManager.pendingAction = null;
    }
});

// Event listeners - Calendário
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

btnADM.addEventListener('click', () => {
    authManager.requireAuth(() => {
        editingDate = null;
        btnDeleteEvent.style.display = 'none';
        modalTitle.textContent = 'Adicionar Compromisso';
        eventForm.reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
        eventModal.classList.add('show');
    });
});

closeModal.addEventListener('click', () => {
    eventModal.classList.remove('show');
    editingDate = null;
});

btnCancelForm.addEventListener('click', () => {
    eventModal.classList.remove('show');
    editingDate = null;
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('eventDate').value;
    const title = document.getElementById('eventTitle').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const opponent = document.getElementById('eventOpponent').value;

    if (editingDate) {
        eventManager.updateEvent(date, title, time, location, opponent);
    } else {
        eventManager.addEvent(date, title, time, location, opponent);
    }

    renderCalendar();
    updateNextGame();
    eventModal.classList.remove('show');
    editingDate = null;
});

btnDeleteEvent.addEventListener('click', () => {
    if (editingDate && confirm('Deseja deletar este compromisso?')) {
        eventManager.deleteEvent(editingDate);
        renderCalendar();
        updateNextGame();
        eventModal.classList.remove('show');
        editingDate = null;
    }
});

eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.classList.remove('show');
        editingDate = null;
    }
});

// Renderiza o calendário
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Atualiza o título
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Limpa o calendário
    calendarDays.innerHTML = '';

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1).getDay();
    
    // Número de dias do mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Número de dias do mês anterior
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Cria array com todos os dias a exibir
    const allDays = [];

    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        allDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            date: new Date(year, month - 1, daysInPrevMonth - i)
        });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
        allDays.push({
            day: i,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        });
    }

    // Dias do próximo mês
    const remainingDays = 42 - allDays.length; // 6 linhas × 7 dias
    for (let i = 1; i <= remainingDays; i++) {
        allDays.push({
            day: i,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        });
    }

    // Cria linhas de semana
    for (let i = 0; i < allDays.length; i += 7) {
        const week = allDays.slice(i, i + 7);
        const row = document.createElement('tr');

        week.forEach(dayObj => {
            const cell = document.createElement('td');
            const dayNumber = document.createElement('span');
            
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = dayObj.day;
            
            cell.appendChild(dayNumber);

            if (!dayObj.isCurrentMonth) {
                cell.classList.add('other-month');
            }

            // Verifica se é hoje
            const today = new Date();
            if (dayObj.isCurrentMonth && 
                dayObj.date.getDate() === today.getDate() &&
                dayObj.date.getMonth() === today.getMonth() &&
                dayObj.date.getFullYear() === today.getFullYear()) {
                cell.classList.add('today');
            }

            // Verifica se tem evento
            const dateStr = formatDate(dayObj.date);
            if (eventManager.eventos[dateStr]) {
                cell.classList.add('event-day');
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    authManager.requireAuth(() => {
                        openEditForm(dateStr);
                    });
                });
            }

            row.appendChild(cell);
        });

        calendarDays.appendChild(row);
    }
}

// Abre formulário de edição
function openEditForm(dateStr) {
    const evento = eventManager.eventos[dateStr];
    if (!evento) return;

    editingDate = dateStr;
    modalTitle.textContent = 'Editar Compromisso';
    
    document.getElementById('eventDate').value = dateStr;
    document.getElementById('eventTitle').value = evento.title;
    document.getElementById('eventTime').value = evento.time;
    document.getElementById('eventLocation').value = evento.location;
    document.getElementById('eventOpponent').value = evento.opponent;
    
    btnDeleteEvent.style.display = 'block';
    eventModal.classList.add('show');
}

// Formata data no formato YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Atualiza o próximo jogo
function updateNextGame() {
    const nextGameContainer = document.getElementById('nextGameContainer');
    const nextGame = eventManager.getNextGame();

    if (!nextGame) {
        nextGameContainer.innerHTML = '<div class="next-game no-games"><p>Nenhum jogo agendado</p></div>';
        return;
    }

    const [dateStr, evento] = nextGame;
    const dateParts = dateStr.split('-');
    const dataObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dataFormatada = formatarDataPT(dataObj);

    nextGameContainer.innerHTML = `
        <div class="next-game">
            <time datetime="${dateStr}">${dataFormatada}</time>
            <h4>${evento.title}</h4>
            <p><strong>Horário:</strong> ${evento.time}</p>
            <p><strong>Local:</strong> ${evento.location}</p>
            <p><strong>Adversário:</strong> ${evento.opponent}</p>
            <div class="action-buttons">
                <button class="btn-edit" onclick="editGameWithAuth('${dateStr}')">Editar</button>
                <button class="btn-remove" onclick="deleteGameWithAuth('${dateStr}')">Remover</button>
            </div>
        </div>
    `;
}

function editGameWithAuth(dateStr) {
    authManager.requireAuth(() => {
        openEditForm(dateStr);
    });
}

function deleteGameWithAuth(dateStr) {
    authManager.requireAuth(() => {
        if (confirm('Deseja deletar este compromisso?')) {
            eventManager.deleteEvent(dateStr);
            renderCalendar();
            updateNextGame();
        }
    });   renderCalendar();
        updateNextGame();
    }

// Formata data em português
function formatarDataPT(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mes = meses[date.getMonth()];
    return `${dia} de ${mes}`;
}

// Inicializa
renderCalendar();
updateNextGame();
