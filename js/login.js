// js/login.js

const API_BASE_URL = 'https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net';

// Função auxiliar para decodificar JWT (mantida)
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar JWT:", e);
        return null;
    }
}

document.getElementById("login-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const loginInput = document.getElementById("login");
    const senhaInput = document.getElementById("senha");

    const login = loginInput.value.trim();
    const senha = senhaInput.value;

    if (!login || !senha) {
        alert("Por favor, preencha todos os campos");
        return;
    }

    let payload = { Senha: senha };
    let loggedInCpf = ''; 
    let loggedInEmail = '';

    const cpfPattern = /^\d{11}$/;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

    if (cpfPattern.test(login)) {
        cpfLimpo = login;
        payload.Cpf = cpfLimpo;
        loggedInCpf = cpfLimpo;
    } else if (emailValido) {
        payload.Email = login;
        loggedInEmail = login;
    } else {
        alert("Digite um CPF válido (11 números) ou um e-mail válido.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Auths/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json(); 

        console.log("Resposta completa da API de Login:", data);

        // --- CORREÇÃO CRÍTICA AQUI: Ajusta a condição de sucesso ---
        // Verifica se a resposta HTTP foi OK E se a mensagem da API indica sucesso.
        // Isso contorna o problema de data.success ser false mesmo em autenticações bem-sucedidas.
        if (response.ok && data.message === "Autenticação realizada com sucesso.") { 
            localStorage.setItem("token", data.token);
            localStorage.setItem("idUsuario", data.idUsuario);

            const decodedToken = decodeJwt(data.token);
            let userNameFromToken = 'Usuário';
            let userEmailFromToken = '';

            if (decodedToken) {
                userNameFromToken = decodedToken.unique_name || decodedToken.name || 'Usuário';
                userEmailFromToken = decodedToken.email || loggedInEmail;
            }

            localStorage.setItem('userName', userNameFromToken);
            localStorage.setItem('userCpf', loggedInCpf || (decodedToken && decodedToken.cpf ? decodedToken.cpf : '')); 
            localStorage.setItem('userEmail', userEmailFromToken);


            console.log("Dados salvos no localStorage:");
            console.log("  ID do usuário:", localStorage.getItem('idUsuario'));
            console.log("  Nome do usuário:", localStorage.getItem('userName'));
            console.log("  CPF do usuário:", localStorage.getItem('userCpf'));
            console.log("  Email do usuário:", localStorage.getItem('userEmail'));
            
            console.log("Valor de data.isAdm:", data.isAdm, typeof data.isAdm);
            
            if (data.isAdm === true) { 
                console.log("Redirecionando para admin.html...");
                window.location.href = "admin.html";
            } else {
                console.log("Redirecionando para home.html...");
                window.location.href = "home.html";
            }
        } else {
            // Se a resposta HTTP não foi OK, ou a mensagem da API não foi de sucesso.
            alert(data.message || "Login inválido. Verifique suas credenciais.");
            console.warn("Falha no login ou resposta inesperada:", data.message || "Erro desconhecido.");
        }
    } catch (err) {
        console.error("Erro na requisição de login (catch block):", err);
        alert(err.message || "Erro ao conectar com o servidor. Verifique sua conexão ou tente mais tarde.");
    }
});

// Função logout (global) - mantida
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('userName');
    localStorage.removeItem('userCpf');
    localStorage.removeItem('userEmail');
    alert('Você foi desconectado.');
    window.location.href = 'index.html';
};