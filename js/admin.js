const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';
const CONFIG_ENDPOINT = '/api/Admin';
const USERS_ENDPOINT = '/api/Usuarios';

const AUTH_TOKEN = localStorage.getItem("token");

document.addEventListener('DOMContentLoaded', async () => {
    if (!AUTH_TOKEN) {
        alert('Token não encontrado. Redirecionando para login...');
        window.location.href = 'index.html';
        return;
    }

    
    const loadingOverlay = document.getElementById('loading-overlay');
    const configValorBase = document.getElementById('config-valor-base');
    const configParentescos = document.getElementById('config-parentescos');
    const valorBaseInput = document.getElementById('valorBase');
    const tiposParentescoInput = document.getElementById('tiposParentesco');
    const configForm = document.getElementById('config-form');
    const usersTable = document.getElementById('users-table');
    const configEditId = document.getElementById('config-edit-id');
    const editConfigBtn = document.getElementById('edit-config-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const configSection = document.getElementById('config-section');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const logoutCancel = document.getElementById('logout-cancel');
    const logoutConfirm = document.getElementById('logout-confirm');

    function showLoading(show) {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    function showNotification(type, message) {
        const el = document.getElementById(`${type}-notification`);
        const msg = document.getElementById(`${type}-message`);
        if (el && msg) {
            msg.textContent = message;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 3000);
        } else {
            alert(message);
        }
    }

    function toggleEditMode(enable) {
        if (enable) {
            configSection.classList.add('edit-mode');
        } else {
            configSection.classList.remove('edit-mode');
        }
    }

    function showModal(show) {
        if (logoutModal) {
            logoutModal.style.display = show ? 'flex' : 'none';
        }
    }

    async function fetchConfig() {
        showLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}${CONFIG_ENDPOINT}`, {
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.success && json.data) {
                if (configValorBase) configValorBase.textContent = `R$ ${json.data.valorBaseRendaPerCapita},00`;
                if (configParentescos) configParentescos.textContent = json.data.tiposParentescoPermitidos;
                if (valorBaseInput) valorBaseInput.value = json.data.valorBaseRendaPerCapita;
                if (tiposParentescoInput) tiposParentescoInput.value = json.data.tiposParentescoPermitidos;
                if (configEditId) configEditId.value = json.data.id;
            } else {
                throw new Error(json.message || 'Erro ao carregar configurações');
            }
        } catch (err) {
            showNotification('error', err.message);
        } finally {
            showLoading(false);
        }
    }

    async function updateConfig() {
        showLoading(true);
        try {
            const id = configEditId ? configEditId.value : null;
            if (!id) throw new Error('ID de configuração não encontrado');
            
            const data = {
                valorBaseRendaPerCapita: parseInt(valorBaseInput.value),
                tiposParentescoPermitidos: tiposParentescoInput.value
            };
            
            const res = await fetch(`${API_BASE_URL}${CONFIG_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const json = await res.json();
            if (json.success) {
                showNotification('success', 'Configurações atualizadas!');
                await fetchConfig();
                toggleEditMode(false); 
            } else {
                throw new Error(json.message || 'Erro ao atualizar configurações');
            }
        } catch (err) {
            showNotification('error', err.message);
        } finally {
            showLoading(false);
        }
    }

    async function fetchUsers() {
        showLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}${USERS_ENDPOINT}`, {
                headers: {
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            });
            const json = await res.json();
            
            
            if (!usersTable) {
                console.error('Tabela de usuários não encontrada!');
                return;
            }
            
            const tbody = usersTable.querySelector('tbody');
            if (!tbody) {
                console.error('Corpo da tabela não encontrado!');
                return;
            }
            
            tbody.innerHTML = '';
            json.data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.cpf}</td>
                    <td>${user.email}</td>
                    <td>${user.isAdmin ? 'Admin' : 'Usuário'}</td>
                    <td>${user.parentes?.length || 0}</td>`;
                tbody.appendChild(row);
            });
        } catch (err) {
            showNotification('error', err.message);
        } finally {
            showLoading(false);
        }
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.id !== 'logout-btn') {
            item.addEventListener('click', () => {
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const target = item.getAttribute('data-target');
                document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
                if (target) {
                    const section = document.getElementById(target);
                    if (section) section.classList.add('active');
                }
            });
        }
    });
    
    if (configForm) {
        configForm.addEventListener('submit', e => {
            e.preventDefault();
            updateConfig();
        });
    }
    
    if (editConfigBtn) {
        editConfigBtn.addEventListener('click', () => {
            toggleEditMode(true);
        });
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            toggleEditMode(false);
            fetchConfig(); 
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showModal(true);
        });
    }
    
    if (logoutCancel) {
        logoutCancel.addEventListener('click', () => {
            showModal(false);
        });
    }
    
    if (logoutConfirm) {
        logoutConfirm.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
    
    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                showModal(false);
            }
        });
    }
    
    await fetchConfig();
    await fetchUsers();
});