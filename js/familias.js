document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("idUsuario"); // ID do usuário logado

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para visualizar suas famílias.");
        window.location.href = "index.html"; // Redireciona para o login se não estiver autenticado
        return;
    }

    // Buscar os parentes do usuário logado
    fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes?idUsuario=${usuarioId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(response => {
        console.log("Resposta da API:", response);  // Debug: Verificar o que a API está retornando
        const parentes = response.data || [];  // Ajuste caso a resposta venha em 'data'

        if (Array.isArray(parentes)) {
            renderizarFamilias(parentes);
        } else {
            alert("A resposta da API não contém dados de parentes no formato esperado.");
        }
    })
    .catch(err => {
        console.error("Erro ao carregar os parentes:", err);
        alert("Não foi possível carregar os parentes.");
    });

    // Função para renderizar os parentes como famílias
    function renderizarFamilias(parentes) {
        const container = document.getElementById("familias-container");
        container.innerHTML = "";

        if (!parentes || parentes.length === 0) {
            container.innerHTML = "<p>Nenhum parente cadastrado.</p>";
            return;
        }

        // Agrupando os parentes em uma "família" (ajuste conforme necessário)
        const familias = agruparFamilias(parentes);

        familias.forEach((familia, index) => {
            const total = familia.membros.reduce((soma, membro) => soma + membro.renda, 0);
            const perCapita = total / familia.membros.length;
            const resultado = perCapita <= 218
                ? "TEM direito ao Bolsa Família"
                : "NÃO tem direito ao Bolsa Família";

            const card = document.createElement("div");
            card.className = "familia-card";

            card.innerHTML = `
                <h3>Família #${index + 1}</h3>
                <ul class="membros-list">
                    ${familia.membros.map(m => `<li>${m.nome} (${m.grauParentesco}) - R$${m.renda.toFixed(2)}</li>`).join('')}
                </ul>
                <p><strong>Renda total:</strong> R$${total.toFixed(2)}</p>
                <p><strong>Renda per capita:</strong> R$${perCapita.toFixed(2)}</p>
                <p><strong>Resultado:</strong> ${resultado}</p>
                <ul class="membros-list">
                    ${familia.membros.map(m => `
                        <li>
                            ${m.nome} (${m.grauParentesco}) - R$${m.renda.toFixed(2)}
                            <button onclick="removerParente(${m.idParente})">Remover</button>
                        </li>
                    `).join('')}
                </ul>
            `;

            container.appendChild(card);
        });
    }

    // Função para agrupar os parentes em famílias (ajuste conforme a lógica que você deseja)
    function agruparFamilias(parentes) {
        const familias = [];
        let familiaAtual = { membros: [] };

        parentes.forEach(parente => {
            // Supondo que todos os parentes são membros da mesma família (ajuste se necessário)
            familiaAtual.membros.push(parente);
        });

        // Se houver membros, agrupar em uma família
        if (familiaAtual.membros.length > 0) {
            familias.push(familiaAtual);
        }

        return familias;
    }
});

// Função para remover parente
function removerParente(idParente) {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("idUsuario");

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para realizar esta ação.");
        return;
    }

    if (confirm("Deseja remover este parente?")) {
        fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/{id}${familiaId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if (res.ok) {
                alert("Parente removido com sucesso.");
                // Remover o parente do array local
                location.reload(); //Recarrega a lista
                const container = document.getElementById("familias-container");
                const familia = container.querySelector(`.familia-card:nth-child(${index + 1})`);
                familia.remove(); // Remove o card da DOM

            } else {
                alert("Erro ao remover o parente.");
            }
        })
        .catch(err => {
            console.error("Erro ao remover o parente:", err);
            alert("Erro de conexão.");
        });
    }
}
