document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("idUsuario");
    const resultadoElegibilidade = document.getElementById("resultado-elegibilidade");
    const statusIcon = document.getElementById("status-icon");
    const statusDetails = document.getElementById("status-details");

    if (!token || !usuarioId) {
        alert("Você precisa estar autenticado para visualizar esta informação.");
        window.location.href = "index.html";
        return;
    }

    verificarElegibilidade();

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
                
                if (isElegivel) {
                    statusIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50;"></i>';
                } else {
                    statusIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #f44336;"></i>';
                }
                
                if (data.data) {
                    let detailsHTML = '<h3>Detalhes da Análise</h3>';
                    detailsHTML += '<div class="info-item"><span class="info-label">Renda Familiar:</span><span class="info-value">R$ ' + data.data.rendaFamiliar.toFixed(2) + '</span></div>';
                    detailsHTML += '<div class="info-item"><span class="info-label">Limite de Renda:</span><span class="info-value">R$ ' + data.data.limiteRenda.toFixed(2) + '</span></div>';
                    detailsHTML += '<div class="info-item"><span class="info-label">Número de Membros:</span><span class="info-value">' + data.data.numeroMembros + '</span></div>';
                    detailsHTML += '<div class="info-item"><span class="info-label">Número de Crianças:</span><span class="info-value">' + (data.data.numeroCriancas || 0) + '</span></div>';
                    
                    statusDetails.innerHTML = detailsHTML;
                }
            } else {
                resultadoElegibilidade.textContent = data.message || "Não foi possível verificar a elegibilidade.";
                resultadoElegibilidade.className = "resultado-box erro";
                statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>';
            }
        })
        .catch(error => {
            console.error("Erro ao verificar elegibilidade:", error);
            resultadoElegibilidade.textContent = "Erro ao verificar elegibilidade. Por favor, tente novamente mais tarde.";
            resultadoElegibilidade.className = "resultado-box erro";
            statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>';
        });
    }
});