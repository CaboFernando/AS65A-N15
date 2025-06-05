document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuarioId"); // ID do usuário logado

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para visualizar suas famílias.");
        window.location.href = "index.html"; // Redireciona para o login se não estiver autenticado
        return;
    }

    // Buscar as famílias do usuário logado
    fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes?usuarioId=${usuarioId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(familias => {
        renderizarFamilias(familias);
    })
    .catch(err => {
        console.error("Erro ao carregar as famílias:", err);
        alert("Não foi possível carregar as famílias.");
    });

    function renderizarFamilias(familias) {
        const container = document.getElementById("familias-container");
        container.innerHTML = "";

        if (familias.length === 0) {
            container.innerHTML = "<p>Nenhuma família cadastrada.</p>";
            return;
        }

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
                    ${familia.membros.map(m => `<li>${m.nomeMembro} (${m.parentesco}) - R$${m.renda.toFixed(2)}</li>`).join('')}
                </ul>
                <p><strong>Renda total:</strong> R$${total.toFixed(2)}</p>
                <p><strong>Renda per capita:</strong> R$${perCapita.toFixed(2)}</p>
                <p><strong>Resultado:</strong> ${resultado}</p>
                <button class="remove-btn" onclick="removerFamilia(${index}, '${familia.id}')">Remover</button>
            `;

            container.appendChild(card);
        });
    }

    // Função para remover família
    function removerFamilia(index, familiaId) {
        if (confirm("Deseja remover esta família?")) {
            fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/${familiaId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            .then(res => {
                if (res.ok) {
                    alert("Família removida com sucesso.");
                    // Remove a família do array local
                    familias.splice(index, 1);
                    // Re-renderiza as famílias após a remoção
                    renderizarFamilias(familias);
                } else {
                    alert("Erro ao remover a família.");
                }
            })
            .catch(err => {
                console.error("Erro ao remover a família:", err);
                alert("Erro de conexão.");
            });
        }
    }
});
