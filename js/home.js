const form = document.getElementById("familia-form");
const lista = document.getElementById("lista-membros");
const resultado = document.getElementById("resultado-renda");

// Dropdown elements
const grauParentescoSelect = document.getElementById('grauParentesco');
const sexoSelect = document.getElementById('sexo');
const estadoCivilSelect = document.getElementById('estadoCivil');

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


window.addEventListener('DOMContentLoaded', () => {
    preencherSelect(
      'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/DropDowns/tipos-parentesco',
      document.getElementById('grauParentesco')
    );
    preencherSelect(
      'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/DropDowns/generos',
      document.getElementById('sexo')
    );
    preencherSelect(
      'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/DropDowns/estados-civis',
      document.getElementById('estadoCivil')
    );
  });
  

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
    const sexoMap = { };
    const estadoCivilMap = { };

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

//função de preencher selects
async function preencherSelect(url, selectElement) {
    try {
      const response = await fetch(url);
      const result = await response.json();
  
      if (result.success && Array.isArray(result.data)) {
  
        result.data.forEach(item => {
          const option = document.createElement('option');
  
          if (typeof item === 'string') {
            // Quando o item é apenas um texto (ex: grau de parentesco)
            option.value = item;
            option.textContent = item;
          } else if (typeof item === 'object' && item !== null) {
            // Quando o item é um objeto com value e name
            option.value = item.value;
            option.textContent = item.name;
          }
  
          selectElement.appendChild(option);
        });
      } else {
        console.error('Erro ao obter dados da API:', result.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
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
    window.location.href = "index.html"; // Redireciona para a página de login
}
