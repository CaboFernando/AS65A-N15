document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();


    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;

    if (!login || !senha) {
        alert("Por favor, preencha todos os campos");
        return;
    }

    let payload = { senha: senha };

    const cpfLimpo = login.replace(/\D/g, "");
    if (cpfLimpo.length === 11) {
        payload.cpf = cpfLimpo;
    } else {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
        if (!emailValido) {
            alert("Digite um CPF válido (11 números) ou um e-mail válido.");
            return;
        }
        payload.email = login;
    }

    fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Auths/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error("Login inválido");
        }
    })
    .then(data => {
        localStorage.setItem("token", data.token); // Ajuste conforme a resposta da API
        localStorage.setItem("idUsuario", data.idUsuario); // Armazena o ID do usuário

        console.log("ID do usuário salvo:", data.idUsuario);

        window.location.href = "home.html"; 
    })
    .catch(err => {
        alert(err.message || "Erro ao conectar com o servidor.");
    });
});
