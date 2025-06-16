const form = document.getElementById("familia-form");
const lista = document.getElementById("lista-membros");
const resultado = document.getElementById("resultado-renda");
const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';

document.addEventListener('DOMContentLoaded', () => {
    const nomeUsuarioSpan = document.getElementById('nome-usuario');
    const btnEditarPerfil = document.getElementById('btn-editar-perfil');
    const btnConcluir = document.getElementById('btn-concluir');
    const familiaForm = document.getElementById('familia-form');
    const listaMembros = document.getElementById('lista-membros');
    const resultadoRenda = document.getElementById('resultado-renda');

    // Tentar carregar o nome do usuário do localStorage
    const userName = localStorage.getItem('userName');
    if (userName) {
        nomeUsuarioSpan.textContent = userName;
    } else {
        nomeUsuarioSpan.textContent = 'Visitante'; // Fallback se não encontrar o nome
        // Opcional: esconder a seção de perfil ou redirecionar se não estiver logado
        // document.getElementById('perfil-logado').style.display = 'none';
    }

    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener('click', () => {
            window.location.href = 'editar-perfil.html';
        });
    } 
});

let membros = [];

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Redireciona para a página de login
}

const token = localStorage.getItem("token");

if (!token) {
    alert("Você precisa estar autenticado para cadastrar a família");
    window.location.href = "index.html"; // redireciona para o login, caso não tenha token
}

// =========================================================
// Definições das funções
// =========================================================

function atualizarLista() {
    lista.innerHTML = "";

    membros.forEach(membro => {
        const renda = Number(membro.renda);
        const rendaFormatada = !isNaN(renda) ? renda.toFixed(2) : "0.00";

        const li = document.createElement("li");
        li.textContent = `${membro.nome} - ${membro.grauParentesco} - ${membro.sexo} - R$${rendaFormatada}`;
        lista.appendChild(li);
    });
}

function calcularRenda() {
    if (membros.length === 0) {
        resultado.textContent = "";
        return;
    }

    const total = membros.reduce((soma, membro) => soma + membro.renda, 0);
    const perCapita = total / membros.length;

    let mensagem = `Renda total: R$${total.toFixed(2)} | Renda per capita: R$${perCapita.toFixed(2)}. `;

    if (perCapita <= 218) {
        mensagem += "A família TEM direito ao Bolsa Família.";
    } else {
        mensagem += "A família NÃO tem direito ao Bolsa Família.";
    }

    resultado.textContent = mensagem;
}

async function cadastrarFamilia(membros) {
    const sexoMap = { "M": 1, "F": 2, "Outro": 3, "NaoInformado": 0 };
    const estadoCivilMap = {
        "NaoInformado": 0,
        "Solteiro": 1,
        "Casado": 2,
        "Divorciado": 3,
        "Viuvo": 4,
        "UniaoEstavel": 5
    };

    for (const membro of membros) {
        const body = {
            nome: membro.nome,
            cpf: membro.cpf.replace(/\D/g, ""), // Remove qualquer caractere não numérico
            grauParentesco: membro.grauParentesco,
            sexo: sexoMap[membro.sexo] ?? 0,
            estadoCivil: estadoCivilMap[membro.estadoCivil] ?? 0,
            ocupacao: membro.ocupacao,
            telefone: membro.telefone,
            renda: membro.renda
        };

        const response = await fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao cadastrar membro ${membro.nome}: ${errorData.message || response.statusText}`);
        }
    }
}

// =========================================================
// Evento de envio do formulário
// =========================================================

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const grauParentesco = document.getElementById("grauParentesco").value.trim();
    const sexo = document.getElementById("sexo").value.trim();
    const estadoCivil = document.getElementById("estadoCivil").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const ocupacao = document.getElementById("ocupacao").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const renda = parseFloat(document.getElementById("renda").value.replace(',', '.'));

    if (!nome || !grauParentesco || !sexo || !estadoCivil || !cpf || !ocupacao || !telefone || isNaN(renda)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const novoMembro = {
        nome: nome,
        grauParentesco: grauParentesco,
        sexo: sexo,
        estadoCivil: estadoCivil,
        cpf: cpf,
        ocupacao: ocupacao,
        telefone: telefone,
        renda: renda
    };

    console.log("Novo membro:", novoMembro);

    membros.push(novoMembro);
    atualizarLista(); // Atualiza a lista de membros
    calcularRenda();  // Atualiza o cálculo da renda

    form.reset(); // Limpa os campos do formulário
});

// =========================================================
// Evento do botão "Concluir Família"
// =========================================================

document.getElementById("btn-concluir").addEventListener("click", async () => {
    if (membros.length === 0) {
        alert("Adicione ao menos um membro.");
        return;
    }

    try {
        await cadastrarFamilia(membros);
        alert("Família cadastrada com sucesso!");
        membros = []; // Limpa a lista de membros após o cadastro
        atualizarLista(); // Atualiza a lista vazia
        resultado.textContent = ""; // Limpa o resultado de renda
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

// =========================================================
// Função de logout
// =========================================================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = "index.html"; // Redireciona para a página de login
}
