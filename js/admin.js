
const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';
const CONFIG_ENDPOINT = '/api/Admin';
const USERS_ENDPOINT = '/api/Usuarios';

document.addEventListener('DOMContentLoaded', async () => {
    const AUTH_TOKEN = localStorage.getItem("token");
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
        if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
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
        configSection.classList.toggle('edit-mode', enable);
    }

    function showModal(show) {
        if (logoutModal) logoutModal.style.display = show ? 'flex' : 'none';
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

            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

            const json = await res.json();
            if (json.success && json.data) {
                configValorBase.textContent = `R$ ${json.data.valorBaseRendaPerCapita},00`;
                configParentescos.textContent = json.data.tiposParentescoPermitidos;
                valorBaseInput.value = json.data.valorBaseRendaPerCapita;
                tiposParentescoInput.value = json.data.tiposParentescoPermitidos;
                configEditId.value = json.data.id;
            } else {
                throw new Error(json.message || 'Erro ao carregar configurações');
            }
        } catch (err) {
            console.error('Erro no fetchConfig:', err);
            showNotification('error', err.message);
        } finally {
            showLoading(false);
        }
    }

    async function updateConfig() {
        showLoading(true);
        try {
            const id = configEditId.value;
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

            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

            const json = await res.json();
            if (json.success) {
                showNotification('success', 'Configurações atualizadas!');
                await fetchConfig();
                toggleEditMode(false);
            } else {
                throw new Error(json.message || 'Erro ao atualizar configurações');
            }
        } catch (err) {
            console.error('Erro no updateConfig:', err);
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

            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

            const json = await res.json();

            const tbody = usersTable.querySelector('tbody');
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
            console.error('Erro no fetchUsers:', err);
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

    configForm?.addEventListener('submit', e => {
        e.preventDefault();
        updateConfig();
    });

    editConfigBtn?.addEventListener('click', () => toggleEditMode(true));

    cancelEditBtn?.addEventListener('click', () => {
        toggleEditMode(false);
        fetchConfig();
    });

    logoutBtn?.addEventListener('click', () => showModal(true));

    logoutCancel?.addEventListener('click', () => showModal(false));

    logoutConfirm?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    logoutModal?.addEventListener('click', e => {
        if (e.target === logoutModal) showModal(false);
    });

    await fetchConfig();
    await fetchUsers();
});
