const form = document.getElementById("familia-form");
const lista = document.getElementById("lista-membros");
const resultado = document.getElementById("resultado-renda");

let membros = [];

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeMembro = document.getElementById("nomeMembro").value.trim();
    const parentesco = document.getElementById("parentesco").value.trim();
    const sexo = document.getElementById("sexo").value.trim();
    const estadoCivil = document.getElementById("estadoCivil").value.trim();
    const ocupacao = document.getElementById("ocupacao").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const renda = parseFloat(document.getElementById("renda").value);

    if (!nomeMembro || !parentesco || !sexo || !estadoCivil || !ocupacao || !telefone || isNaN(renda)) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    const novoMembro = {
        nomeMembro,
        parentesco,
        sexo,
        estadoCivil,
        ocupacao,
        telefone,
        renda
    };

    membros.push(novoMembro);
    atualizarLista();
    calcularRenda();

    // Envia os dados para o backend
    const usuarioId = localStorage.getItem("usuarioId"); // ajuste conforme seu armazenamento

    fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes', { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuarioId, membros })
    })
    .then(res => {
        if (res.ok) {
            console.log("Dados enviados com sucesso.");
        } else {
            console.error("Erro ao enviar dados.");
        }
    })
    .catch(err => console.error("Erro de conexão:", err));

    form.reset();
});

function atualizarLista() {
    lista.innerHTML = "";

    membros.forEach(membro => {
        const li = document.createElement("li");
        li.textContent = `${membro.nomeMembro} - ${membro.parentesco} - ${membro.sexo} - R$${membro.renda.toFixed(2)}`;
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

document.getElementById("btn-concluir").addEventListener("click", function () {
    if (membros.length === 0) {
        alert("Adicione ao menos um membro.");
        return;
    }

    const familiasSalvas = JSON.parse(localStorage.getItem("familiasCadastradas")) || [];
    familiasSalvas.push(membros);
    localStorage.setItem("familiasCadastradas", JSON.stringify(familiasSalvas));

    alert("Família cadastrada com sucesso!");
    membros = [];
    atualizarLista();
    resultado.textContent = "";
    
});


