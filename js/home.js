const from = documentgetElementById("familia-form");
const lista = documentgetElementById("lista-membros");
const resultado = documentgetElementById("resultado-renda");

let membros = [];

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nomeMembro = document.getElementById("nome-membro").value;
    const parentesco = document.getElementById("parentesco").value;
    const sexo = document.getElementById("sexo").value;
    const estadoCivil = document.getElementById("estadoCivil").value;
    const cpfMembro = document.getElementById("cpfMembro").value;
    const ocupacao = document.getElementById("ocupacao").value;
    const renda = document.getElementById("renda").value;
    const telefone = document.getElementById("telefone").value;

    const novoMembro = {
        nomeMembro,
        parentesco,
        sexo,
        estadoCivil,
        cpfMembro,
        ocupacao,
        renda,
        telefone
    }

    membros.push(novoMembro);
    atualizarLista();
    calcularRenda();

    //Faz o envio dos dados para o backend
    const usuarioId = localStorage.getItem("usuarioId");

    fetch("htttp://localhost:3000/familia",{
        method:POST,
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({usuarioId, membros})
    })
    .then(res => res.json())
    .then(data => {
        console.log("Dados enviados com sucesso:");
    })
    form.reset();
});
function atualizarLista() {
    lista.innerHTML = "";
    membros.forEach((membro, index) => {
        const item = document.createElement("li");
        item.textContent = `${membro.nomeMembro} - ${membro.parentesco} - ${membro.cpfMembro} - R$${membro.renda}`;
        lista.appendChild(item);
        li.appendChild(btnRemover);
        lista.appendChild(li);
    });
}
function calcularRenda() {
    if(membros.length === 0 ) {
        resultado.textContent = "";
        return;
    }
    const total = membros.reduce((sina, membro) => soma + membro.renda, 0);
    const perCapita = total/ membros.length;

    let mensagem = `Renda total: R$${total.toFixed(2)} | Renda per capita: R$${perCapita.toFixed(2)}`;

    if (perCapita <= 218) {
        mensagemm += "A familia tem direito ao bolsa familia";
    } else {
        mensagem += "A familia não tem direito ao bolsa familia";
    }
    resultado.textContent = mensagem;
}