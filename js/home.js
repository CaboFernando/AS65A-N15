const form = document.getElementById("familia-form");
const lista = document.getElementById("lista-membros");
const resultado = document.getElementById("resultado-renda");

let membros = [];

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Redireciona para a página de login
}

const token = localStorage.getItem("token");

if (!token) {
    alert("Você precisa estar autenticado para cadastrar a familia");
    window.location.href = "index.html"; // redireciona para o login, caso não tenha token
}

// =========================================================
// Mova as definições das funções para AQUI (antes de serem chamadas)
// =========================================================

function atualizarLista() {
    lista.innerHTML = "";

    membros.forEach(membro => {
        const li = document.createElement("li");
        li.textContent = `${membro.Nome} - ${membro.GrauParentesco} - ${membro.Sexo} - R$${membro.Renda.toFixed(2)}`;
        lista.appendChild(li);
    });
}

function calcularRenda() {
    if (membros.length === 0) {
        resultado.textContent = "";
        return;
    }

    const total = membros.reduce((soma, membro) => soma + membro.Renda, 0);
    const perCapita = total / membros.length;

    let mensagem = `Renda total: R$${total.toFixed(2)} | Renda per capita: R$${perCapita.toFixed(2)}. `;

    if (perCapita <= 218) {
        mensagem += "A família TEM direito ao Bolsa Família.";
    } else {
        mensagem += "A família NÃO tem direito ao Bolsa Família.";
    }

    resultado.textContent = mensagem;
}

// =========================================================
// O addEventListener vem depois das funções serem definidas
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
    const renda = parseFloat(document.getElementById("renda").value);

    if (!nome || !grauParentesco || !sexo || !estadoCivil || !cpf || !ocupacao || !telefone || isNaN(renda)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const novoMembro = {
        Nome: nome,
        GrauParentesco: grauParentesco,
        Sexo: sexo, // Cuidado se o backend espera um int aqui
        EstadoCivil: estadoCivil, // Cuidado se o backend espera um int aqui
        Cpf: cpf,
        Ocupacao: ocupacao,
        Telefone: telefone,
        Renda: renda
    };

    membros.push(novoMembro);
    atualizarLista(); // Chamada aqui
    calcularRenda();  // Chamada aqui

    form.reset();
});


document.getElementById("btn-concluir").addEventListener("click", function () {
    if (membros.length === 0) {
        alert("Adicione ao menos um membro.");
        return;
    }

    const usuarioId = localStorage.getItem("usuarioId");
    fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ UsuarioId: usuarioId, Parentes: membros })
    })
    .then(res => {
        if (res.ok) {
            alert("Família cadastrada com sucesso!");
            membros = [];
            atualizarLista();
            resultado.textContent = "";
        } else {
            res.json().then(errorData => {
                console.error("Erro ao cadastrar a família:", errorData);
                alert("Erro ao cadastrar a família. Detalhes no console.");
            }).catch(() => {
                console.error("Erro ao cadastrar a família. Status:", res.status);
                alert("Erro ao cadastrar a família. Verifique o console.");
            });
        }
    })
    .catch(err => {
        console.error("Erro de conexão:", err);
        alert("Erro de conexão com o servidor. Tente novamente.");
    });
});