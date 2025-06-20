const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';

// Função logout (global)
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('userName');
    localStorage.removeItem('userCpf');
    localStorage.removeItem('userEmail');
    alert('Você foi desconectado.');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const perfilForm = document.getElementById('perfil-form');
    const editNome = document.getElementById('editNome');
    const editCpf = document.getElementById('editCpf');
    const editEmail = document.getElementById('editEmail');
    const editSenha = document.getElementById('editSenha'); 

    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('idUsuario');

    if (!token || !idUsuario) {
        alert('Você precisa estar logado para acessar esta página.');
        logout();
        return;
    }

    async function carregarDadosDoUsuario() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Usuarios/${idUsuario}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const user = result.data;

                editNome.value = user.nome || '';
                editCpf.value = user.cpf || '';
                editEmail.value = user.email || '';

                localStorage.setItem('userName', user.nome);
                localStorage.setItem('userCpf', user.cpf);
                localStorage.setItem('userEmail', user.email);
            } else if (response.status === 401 || response.status === 403) {
                alert('Sessão expirada. Faça login novamente.');
                logout();
            } else {
                alert('Erro ao buscar dados do usuário: ' + response.statusText);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            alert('Erro de rede ao carregar os dados. Verifique sua conexão.');
        }
    }

    await carregarDadosDoUsuario();

    perfilForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = editNome.value.trim();
        let cpf = editCpf.value.trim();
        const email = editEmail.value.trim();
        const senha = editSenha.value;

        cpf = cpf.replace(/\D/g, '');

        console.log('CPF sendo enviado para a API (limpo):', cpf);
        console.log('Payload completo sendo enviado:', { nome, cpf, email, Senha: senha ? '******' : '[Campo Vazio]' });


        if (!token || !idUsuario) {
            alert('Erro: Dados de sessão ausentes. Por favor, faça login novamente.');
            logout();
            return;
        }

        const usuarioUpdateDto = {
            Nome: nome,
            Cpf: cpf,
            Email: email,
        };

        if (senha.trim()) {
            usuarioUpdateDto.Senha = senha;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/Usuarios/${idUsuario}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuarioUpdateDto)
            });

            if (response.ok) {
                
                const result = await response.json(); 
                alert(result.message || 'Perfil atualizado com sucesso!'); 
                localStorage.setItem('userName', nome);
                localStorage.setItem('userCpf', cpf);
                localStorage.setItem('userEmail', email);
                window.location.href = 'home.html';
            } else if (response.status === 400) {
                const errorResult = await response.json();
                
                let errorMessage = '';
                if (errorResult.errors) {
                    for (const key in errorResult.errors) {
                        errorMessage += `${key}: ${errorResult.errors[key].join(', ')}\n`;
                    }
                }
                alert('Erro na validação dos dados:\n' + (errorMessage || errorResult.message || 'Dados inválidos.'));
            } else if (response.status === 401 || response.status === 403) {
                alert('Não autorizado. Sua sessão pode ter expirado. Faça login novamente.');
                logout();
            } else {
                alert('Erro ao atualizar perfil: ' + response.statusText);
            }
        } catch (error) {
            console.error('Erro de rede ao atualizar perfil:', error);
            alert('Não foi possível conectar para atualizar seu perfil. Verifique sua conexão.');
        }
    });
});