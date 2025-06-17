// Configurações globais
const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';
let membrosFamilia = [];
let responsavelId = null; // Para armazenar o ID do responsável

// Mapeamento de valores numéricos para texto
const sexoMap = {
    0: "Não Informado",
    1: "Masculino",
    2: "Feminino",
    3: "Outro"
};

const estadoCivilMap = {
    0: "Não Informado",
    1: "Solteiro(a)",
    2: "Casado(a)",
    3: "Divorciado(a)",
    4: "Viúvo(a)",
    5: "União Estável"
};

// Elementos DOM
const nomeUsuario = document.getElementById('nome-usuario');
const listaMembros = document.getElementById('lista-membros');
const mensagemElement = document.getElementById('mensagem');
const familiaForm = document.getElementById('familia-form');

// Função para exibir mensagens
function exibirMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem ${tipo}`;
    setTimeout(() => {
        mensagemElement.textContent = '';
        mensagemElement.className = 'mensagem';
    }, 5000);
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

        // Identificar o responsável (primeiro membro ou aquele com grau "Responsável")
        responsavelId = null;
        membrosFamilia.forEach(membro => {
            if (membro.grauParentesco.toLowerCase().includes("responsável")) {
                responsavelId = membro.id;
            }
        });

        // Se nenhum responsável foi encontrado, define o primeiro membro como responsável
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

    membrosFamilia.forEach(membro => {
        const membroElement = document.createElement('div');
        membroElement.className = 'membro-item';

        // Destacar responsável
        if (membro.id === responsavelId) {
            membroElement.style.borderLeft = '4px solid #009688';
            membroElement.style.backgroundColor = '#e0f7fa';
        }

        // Converter valores numéricos para texto para exibição
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

    // Coletar dados do formulário
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

        // Recarregar a lista de membros
        await carregarMembrosFamilia();

        // Resetar o formulário
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

        // Recarregar a lista de membros
        await carregarMembrosFamilia();

        exibirMensagem('Membro removido com sucesso!', 'sucesso');

    } catch (error) {
        console.error('Erro ao remover membro:', error);
        exibirMensagem(`Erro: ${error.message}`, 'erro');
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
document.addEventListener('DOMContentLoaded', function () {
    // Exibir nome do usuário
    const userName = localStorage.getItem('userName') || 'Visitante';
    nomeUsuario.textContent = userName;

    // Carregar membros da família
    carregarMembrosFamilia();

    // Event listeners
    familiaForm.addEventListener('submit', adicionarMembro);
});