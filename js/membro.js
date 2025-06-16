const form = document.getElementById("familia-form");
const lista = document.getElementById("lista-membros");
const resultado = document.getElementById("resultado-renda");

let membros = [];

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeMembro = document.getElementById("nome-membro").value;
    const parentesco = document.getElementById("parentesco").value;
    const genero = document.getElementById("genero").value;
    const estadoCivil = document.getElementById("estadoCivil").value;
    const cpfMembro = document.getElementById("cpfMembro").value;
    const ocupacao = document.getElementById("ocupacao").value;
    const renda = parseFloat(document.getElementById("renda").value); // Convertendo para número
    const telefone = document.getElementById("telefone").value;

    const novoMembro = {
        nomeMembro,
        parentesco,
        genero,
        estadoCivil,
        cpfMembro,
        ocupacao,
        renda,
        telefone
    };

    membros.push(novoMembro);
    atualizarLista();
    calcularRenda();

    const usuarioId = localStorage.getItem("usuarioId");

    // Envio para backend
    fetch("https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, ...novoMembro }) // Envia um membro por vez
    })
    .then(res => res.json())
    .then(data => {
        console.log("Dados enviados com sucesso:", data);
    })
    .catch(err => {
        console.error("Erro ao enviar dados:", err);
    });

    form.reset();
});

function atualizarLista() {
    lista.innerHTML = "";
    membros.forEach((membro, index) => {
        const li = document.createElement("li");
        li.textContent = `${membro.nomeMembro} - ${membro.parentesco} - CPF: ${membro.cpfMembro} - R$${membro.renda.toFixed(2)}`;

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => {
            const membroRemovido = membros[index];
            fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/${membroRemovido.id}`, {
                method: "DELETE"
            })
            .then(() => {
                membros.splice(index, 1);
                atualizarLista();
                calcularRenda();
            })
            .catch(err => console.error("Erro ao remover membro:", err));
        };


        li.appendChild(btnRemover);
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
        mensagem += "A família NÃO TEM direito ao Bolsa Família.";
    }

    resultado.textContent = mensagem;
}
// Carrega os membros do backend ao iniciar a página
window.addEventListener("DOMContentLoaded", () => {
    const usuarioId = localStorage.getItem("usuarioId");

    fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/usuario/${usuarioId}`)
        .then(res => res.json())
        .then(data => {
            membros = data;
            atualizarLista();
            calcularRenda();
        })
        .catch(err => console.error("Erro ao carregar membros:", err));
});
