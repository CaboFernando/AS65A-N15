// Configurações globais
const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';
let membrosFamilia = [];
let responsavelId = null;

// Mapeamento de valores numéricos para texto - Estes serão preenchidos dinamicamente
let sexoMap = {};
let estadoCivilMap = {};

// Elementos DOM
const nomeUsuario = document.getElementById('nome-usuario');
const listaMembros = document.getElementById('lista-membros');
const mensagemElement = document.getElementById('mensagem');
const familiaForm = document.getElementById('familia-form');

// Dropdown elements
const grauParentescoSelect = document.getElementById('grauParentesco');
const sexoSelect = document.getElementById('sexo');
const estadoCivilSelect = document.getElementById('estadoCivil');

// Edit Modal Elements
const editMembroModal = document.getElementById('editMembroModal');
const editMembroForm = document.getElementById('editMembroForm');
const editMembroId = document.getElementById('editMembroId');
const editNome = document.getElementById('editNome');
const editGrauParentesco = document.getElementById('editGrauParentesco');
const editSexo = document.getElementById('editSexo');
const editEstadoCivil = document.getElementById('editEstadoCivil');
const editCpf = document.getElementById('editCpf');
const editOcupacao = document.getElementById('editOcupacao');
const editTelefone = document.getElementById('editTelefone');
const editRenda = document.getElementById('editRenda');

// Função para exibir mensagens
function exibirMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem ${tipo}`;
    setTimeout(() => {
        mensagemElement.textContent = '';
        mensagemElement.className = 'mensagem';
    }, 5000);
}

// Função para carregar dados de dropdowns
async function carregarDropdown(url, selectElement, valueField, textField, selectedValue = '') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados de ${url}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
            selectElement.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Selecione o ${selectElement.id === 'sexo' || selectElement.id === 'editSexo' ? 'sexo' : selectElement.id === 'estadoCivil' || selectElement.id === 'editEstadoCivil' ? 'estado civil' : 'grau de parentesco'}`;
            selectElement.appendChild(defaultOption);

            if (Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    if (typeof item === 'object' && item !== null) {
                        option.value = item[valueField];
                        if (item[textField] === "NaoInformado") {
                            option.textContent = "Não Informado";
                        } else {
                            option.textContent = item[textField];
                        }
                        if (selectElement.id === 'sexo' || selectElement.id === 'editSexo') {
                            sexoMap[item[valueField]] = option.textContent;
                        } else if (selectElement.id === 'estadoCivil' || selectElement.id === 'editEstadoCivil') {
                            estadoCivilMap[item[valueField]] = option.textContent;
                        }
                    } else {
                        option.value = item;
                        option.textContent = item;
                    }
                    selectElement.appendChild(option);
                });
            }
            if (selectedValue) {
                selectElement.value = selectedValue;
            }
        } else {
            exibirMensagem(`Erro ao carregar dados de ${url}: ${data.message || 'Dados inválidos'}`, 'erro');
        }
    } catch (error) {
        console.error(`Erro ao carregar dropdown de ${url}:`, error);
        exibirMensagem(`Erro ao carregar opções para ${selectElement.id}`, 'erro');
    }
}

// Função para carregar membros da família da API
async function carregarMembrosFamilia() {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('idUsuario');

    if (!token || !usuarioId) {
        alert('Você precisa estar autenticado para acessar esta página');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Parentes?idUsuario=${usuarioId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar membros da família');
        }

        const data = await response.json();
        membrosFamilia = data.data || [];

        responsavelId = null;
        membrosFamilia.forEach(membro => {
            if (membro.grauParentesco && membro.grauParentesco.toLowerCase().includes("responsável")) {
                responsavelId = membro.id;
            }
        });

        if (!responsavelId && membrosFamilia.length > 0) {
            responsavelId = membrosFamilia[0].id;
        }

        renderizarMembros();
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        exibirMensagem('Erro ao carregar membros da família', 'erro');
    }
}

// Função para renderizar os membros na tela
function renderizarMembros() {
    listaMembros.innerHTML = '';

    if (membrosFamilia.length === 0) {
        listaMembros.innerHTML = '<p class="mensagem">Nenhum membro cadastrado ainda.</p>';
        return;
    }

    const responsavel = membrosFamilia.find(membro => membro.id === responsavelId);
    if (responsavel && (responsavel.estadoCivil == 0)) {
        exibirMensagem('Por favor, preencha a renda do membro responsável pelo grupo familiar para garantir a elegibilidade ao programa.', 'alerta');
    }


    membrosFamilia.forEach(membro => {
        const membroElement = document.createElement('div');
        membroElement.className = 'membro-item';

        if (membro.id === responsavelId) {
            membroElement.style.borderLeft = '4px solid #009688';
            membroElement.style.backgroundColor = '#e0f7fa';
        }

        const sexoTexto = sexoMap[membro.sexo] || "Não Informado";
        const estadoCivilTexto = estadoCivilMap[membro.estadoCivil] || "Não Informado";

        membroElement.innerHTML = `
                    <div class="membro-info">
                        <span class="membro-nome">
                            ${membro.nome}
                            ${membro.id === responsavelId ? '<span class="responsavel-tag"></span>' : ''}
                        </span>
                        <span class="membro-detalhes">${membro.grauParentesco} | ${sexoTexto} | ${estadoCivilTexto}</span>
                        <span class="membro-detalhes">CPF: ${formatarCPF(membro.cpf)} | Ocupação: ${membro.ocupacao}</span>
                        <span class="membro-detalhes">Telefone: ${membro.telefone} | Renda: R$ ${membro.renda.toFixed(2)}</span>
                    </div>
                    <div class="membro-acoes">
                        <button class="btn-editar" onclick="abrirModalEdicao(${membro.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${membro.id !== responsavelId ?
                `<button class="btn-remover" onclick="removerMembro(${membro.id})">
                                <i class="fas fa-trash"></i> Remover
                            </button>` :
                `<button class="btn-remover" disabled title="O responsável não pode ser removido">
                                <i class="fas fa-trash"></i> Remover
                            </button>`
            }
                    </div>
                `;
        listaMembros.appendChild(membroElement);
    });
}

// Função para formatar CPF
function formatarCPF(cpf) {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para adicionar um novo membro
async function adicionarMembro(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('idUsuario');

    if (!token || !usuarioId) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'index.html';
        return;
    }

    const novoMembro = {
        idUsuario: usuarioId,
        nome: document.getElementById('nome').value,
        grauParentesco: document.getElementById('grauParentesco').value,
        sexo: parseInt(document.getElementById('sexo').value),
        estadoCivil: parseInt(document.getElementById('estadoCivil').value),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        ocupacao: document.getElementById('ocupacao').value,
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        renda: parseFloat(document.getElementById('renda').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Parentes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoMembro)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao adicionar membro');
        }

        await carregarMembrosFamilia();

        familiaForm.reset();

        exibirMensagem('Membro adicionado com sucesso!', 'sucesso');

    } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        exibirMensagem(`Erro: ${error.message}`, 'erro');
    }
}

// Função para remover um membro
async function removerMembro(membroId) {
    if (!confirm('Tem certeza que deseja remover este membro da família?')) {
        return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Parentes/${membroId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao remover membro');
        }

        await carregarMembrosFamilia();

        exibirMensagem('Membro removido com sucesso!', 'sucesso');

    } catch (error) {
        console.error('Erro ao remover membro:', error);
        exibirMensagem(`Erro: ${error.message}`, 'erro');
    }
}

// Funções para o modal de edição
async function abrirModalEdicao(membroIdToEdit) {
    const membro = membrosFamilia.find(m => m.id === membroIdToEdit);
    if (!membro) {
        exibirMensagem('Membro não encontrado para edição.', 'erro');
        return;
    }

    // Populate dropdowns in the modal
    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/tipos-parentesco`, editGrauParentesco, null, null, membro.grauParentesco);
    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/generos`, editSexo, 'value', 'name', membro.sexo.toString());
    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/estados-civis`, editEstadoCivil, 'value', 'name', membro.estadoCivil.toString());

    editMembroId.value = membro.id;
    editNome.value = membro.nome;
    editCpf.value = formatarCPF(membro.cpf);
    editOcupacao.value = membro.ocupacao;
    editTelefone.value = membro.telefone;
    editRenda.value = membro.renda;

    editMembroModal.style.display = 'block';
}

function fecharModalEdicao() {
    editMembroModal.style.display = 'none';
    editMembroForm.reset();
}

async function salvarEdicaoMembro(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const membroId = editMembroId.value;

    if (!token || !membroId) {
        alert('Erro: Dados de sessão ou ID do membro ausentes. Por favor, faça login novamente.');
        logout();
        return;
    }

    const membroAtualizado = {
        nome: editNome.value,
        grauParentesco: editGrauParentesco.value,
        sexo: parseInt(editSexo.value),
        estadoCivil: parseInt(editEstadoCivil.value),
        cpf: editCpf.value.replace(/\D/g, ''),
        ocupacao: editOcupacao.value,
        telefone: editTelefone.value.replace(/\D/g, ''),
        renda: parseFloat(editRenda.value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Parentes/${membroId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(membroAtualizado)
        });

        if (response.ok) {
            const result = await response.json();
            exibirMensagem(result.message || 'Membro atualizado com sucesso!', 'sucesso');
            fecharModalEdicao();
            await carregarMembrosFamilia();
        } else {
            const errorData = await response.json();
            exibirMensagem(`Falha ao atualizar membro: ${errorData.message || response.statusText}`, 'erro');
        }
    } catch (error) {
        console.error('Erro de rede ao atualizar membro:', error);
        exibirMensagem('Não foi possível conectar para atualizar o membro. Verifique sua conexão.', 'erro');
    }
}

// Função para logout
function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('idUsuario');
        localStorage.removeItem('userName');
        localStorage.removeItem('userCpf');
        localStorage.removeItem('userEmail');
        alert('Você foi desconectado.');
        window.location.href = 'index.html';
    }
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', async function () {
    const userName = localStorage.getItem('userName') || 'Visitante';
    nomeUsuario.textContent = userName;

    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/tipos-parentesco`, grauParentescoSelect);
    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/generos`, sexoSelect, 'value', 'name');
    await carregarDropdown(`${API_BASE_URL}/api/DropDowns/estados-civis`, estadoCivilSelect, 'value', 'name');

    await carregarMembrosFamilia();

    familiaForm.addEventListener('submit', adicionarMembro);
    editMembroForm.addEventListener('submit', salvarEdicaoMembro);
});