document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("idUsuario");
    const listaMembros = document.getElementById("lista-membros");
    const resultadoElegibilidade = document.getElementById("resultado-elegibilidade");
    const btnRemover = document.getElementById("btn-remover-membro");
    
    let membroSelecionado = null;

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para visualizar sua família.");
        window.location.href = "index.html";
        return;
    }

    carregarMembrosFamilia();

    function carregarMembrosFamilia() {
        fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes?idUsuario=${usuarioId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados dos membros da família:", data);
            
            const membros = data.data || [];
            
            exibirMembros(membros);
        })
        .catch(error => {
            console.error("Erro ao carregar os membros da família:", error);
            resultadoElegibilidade.textContent = "Erro ao carregar os membros da família.";
            resultadoElegibilidade.className = "resultado-box erro";
        });
    }

    function verificarElegibilidade() {
        fetch("https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/renda", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resposta da API de elegibilidade:", data);
            
            resultadoElegibilidade.innerHTML = "";
            
            if (data.success) {
                resultadoElegibilidade.textContent = data.message;
                
                const isElegivel = data.message.includes("elegível") && 
                                  !data.message.includes("NÃO elegível");
                
                resultadoElegibilidade.className = "resultado-box " + 
                    (isElegivel ? "elegivel" : "nao-elegivel");
            } else {
                resultadoElegibilidade.textContent = data.message || "Não foi possível verificar a elegibilidade.";
                resultadoElegibilidade.className = "resultado-box nao-elegivel";
            }
        })
        .catch(error => {
            console.error("Erro ao verificar elegibilidade:", error);
            resultadoElegibilidade.textContent = "Erro ao verificar elegibilidade.";
            resultadoElegibilidade.className = "resultado-box erro";
        });
    }

    function exibirMembros(membros) {
        listaMembros.innerHTML = "";
        
        if (!membros || membros.length === 0) {
            listaMembros.innerHTML = "<li class='membro-item'>Nenhum membro cadastrado na família</li>";
            return;
        }
        
        const responsavel = membros.find(m => 
            m.grauParentesco.toLowerCase().includes("responsável") || 
            m.grauParentesco.toLowerCase().includes("responsavel")
        );
        
        membros.forEach(membro => {
            const li = document.createElement("li");
            li.className = "membro-item";
            li.dataset.id = membro.id;
            
            const isResponsavel = responsavel && (membro.id === responsavel.id);
            
            li.innerHTML = `
                <div class="membro-info">
                    <span class="membro-nome">${membro.nome} ${isResponsavel ? '<span class="responsavel-tag">(Responsável)</span>' : ''}</span>
                    <div class="membro-detalhes">
                        ${membro.grauParentesco} | CPF: ${formatarCPF(membro.cpf)} | Renda: R$${parseFloat(membro.renda).toFixed(2)}
                    </div>
                </div>
                <div class="membro-acoes">
                    ${isResponsavel ? 
                        '<span class="responsavel-info">Não pode ser removido</span>' : 
                        '<span class="selecionador"></span>'
                    }
                </div>
            `;
            
            if (!isResponsavel) {
                li.addEventListener("click", function() {
                    if (li.classList.contains("selecionado")) {
                        li.classList.remove("selecionado");
                        membroSelecionado = null;
                        btnRemover.disabled = true;
                    } 
                    else {
                        document.querySelectorAll(".membro-item").forEach(item => {
                            item.classList.remove("selecionado");
                        });
                        
                        li.classList.add("selecionado");
                        membroSelecionado = membro;
                        btnRemover.disabled = false;
                    }
                });
            } else {
                li.classList.add("responsavel");
            }
            
            listaMembros.appendChild(li);
        });
        
        verificarElegibilidade();
    }

    function formatarCPF(cpf) {
        if (!cpf) return "Não informado";
        const numeros = cpf.replace(/\D/g, '');
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    btnRemover.addEventListener("click", function() {
        if (membroSelecionado) {
            const idParaRemover = membroSelecionado.id;
            if (idParaRemover) {
                removerParente(idParaRemover);
            } else {
                alert("ID do membro não encontrado. Não é possível remover.");
            }
        }
    });
});

function removerParente(id) {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("idUsuario");

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para realizar esta ação.");
        return;
    }

    if (confirm("Deseja remover este membro da família?")) {
        fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Parentes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Membro removido com sucesso.");
                location.reload();
            } else {
                return response.text().then(text => {
                    throw new Error(text || "Erro ao remover o membro");
                });
            }
        })
        .catch(error => {
            console.error("Erro ao remover o membro:", error);
            alert(`Erro ao remover membro: ${error.message}`);
        });
    }
}