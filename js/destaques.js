const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

// Classe de Autenticação
class AuthManager {
    constructor() {
        this.PASSWORD = 'ADM123';
    }

    authenticate(password) {
        return password === this.PASSWORD;
    }
}

const authManager = new AuthManager();

// Carregar dados do localStorage
function loadData() {
    const artilheiros = JSON.parse(localStorage.getItem('artilheiros')) || [];
    const assistentes = JSON.parse(localStorage.getItem('assistentes')) || [];

    renderTable('lista-artilheiros', artilheiros, 'Gols');
    renderTable('lista-assistentes', assistentes, 'Assis.');
}

function renderTable(tbodyId, data, label) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td><button class="btn-edit-row" data-index="${index}" data-type="${tbodyId === 'lista-artilheiros' ? 'artilheiros' : 'assistentes'}">Editar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Carregar dados ao iniciar
loadData();

// Event listener para botões de adicionar
document.getElementById('addArtilharia').addEventListener('click', () => {
    showAuthModal(() => addItem('artilheiros'));
});

document.getElementById('addAssistencias').addEventListener('click', () => {
    showAuthModal(() => addItem('assistentes'));
});

// Event listener para botões de remover
document.getElementById('removeArtilharia').addEventListener('click', () => {
    showAuthModal(() => removeItem('artilheiros', 'Artilharia'));
});

document.getElementById('removeAssistencias').addEventListener('click', () => {
    showAuthModal(() => removeItem('assistentes', 'Assistências'));
});

function addItem(type) {
    const nome = prompt('Nome do jogador:');
    const quantidade = parseInt(prompt('Quantidade:'));
    if (nome && !isNaN(quantidade)) {
        const data = JSON.parse(localStorage.getItem(type)) || [];
        data.push({ nome, quantidade });
        data.sort((a, b) => b.quantidade - a.quantidade);
        localStorage.setItem(type, JSON.stringify(data));
        loadData();
    }
}

function removeItem(type, title) {
    const data = JSON.parse(localStorage.getItem(type)) || [];
    if (data.length === 0) {
        alert('Nenhum atleta cadastrado.');
        return;
    }
    const nome = prompt(`${title} - Digite o nome do jogador a remover:`);
    if (nome) {
        const index = data.findIndex(item => item.nome.toLowerCase() === nome.toLowerCase());
        if (index !== -1) {
            data.splice(index, 1);
            localStorage.setItem(type, JSON.stringify(data));
            loadData();
            alert('Atleta removido com sucesso.');
        } else {
            alert('Atleta não encontrado.');
        }
    }
}

// Event listener para botões de editar linha
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit-row')) {
        showAuthModal(() => {
            const index = e.target.dataset.index;
            const type = e.target.dataset.type;
            editRow(type, index);
        });
    }
});

function editRow(type, index) {
    const data = JSON.parse(localStorage.getItem(type)) || [];
    if (data[index]) {
        const newNome = prompt('Novo nome do jogador:', data[index].nome);
        const newQuantidade = parseInt(prompt('Nova quantidade:', data[index].quantidade));
        if (newNome && !isNaN(newQuantidade)) {
            data[index] = { nome: newNome, quantidade: newQuantidade };
            data.sort((a, b) => b.quantidade - a.quantidade);
            localStorage.setItem(type, JSON.stringify(data));
            loadData();
        }
    }
}

// Modal de autenticação
function showAuthModal(callback) {
    const modal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authPassword = document.getElementById('authPassword');
    const btnCancel = document.getElementById('btnCancelAuth');

    modal.classList.add('show');
    authPassword.value = '';
    authPassword.placeholder = 'Senha';
    authPassword.focus();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (authManager.authenticate(authPassword.value)) {
            modal.classList.remove('show');
            authForm.removeEventListener('submit', handleSubmit);
            btnCancel.removeEventListener('click', handleCancel);
            callback();
        } else {
            authPassword.value = '';
            authPassword.placeholder = 'Senha incorreta!';
            authPassword.focus();
        }
    };

    const handleCancel = () => {
        modal.classList.remove('show');
        authForm.removeEventListener('submit', handleSubmit);
        btnCancel.removeEventListener('click', handleCancel);
    };

    authForm.addEventListener('submit', handleSubmit);
    btnCancel.addEventListener('click', handleCancel);
}
