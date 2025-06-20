document.getElementById("cadastro-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Pegando os dados do formulário
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Validação dos campos
    if (!nome || !cpf || !email || !senha) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    // Validação do CPF (somente números e 11 dígitos)
    const cpfRegex = /^[0-9]{11}$/;
    if (!cpfRegex.test(cpf)) {
        alert("CPF inválido. Por favor, insira um CPF válido.");
        return;
    }

    // Validação do formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        alert("Email inválido. Por favor, insira um email válido.");
        return;
    }

    // Validação da senha (mínimo 6 caracteres)
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    // Envio da requisição para a API de cadastro
    fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: nome,
            cpf: cpf,
            email: email,
            senha: senha
        })
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(textoErro => {
                    console.error("Detalhes do erro:", textoErro);
                    throw new Error(`Erro ${res.status}: ${textoErro}`);
                });
            }
            return res.json();
        })
        .then(data => {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "index.html";
        })
        .catch(err => {
            console.error("Erro ao conectar com o servidor:", err.message);
            alert(err.message || "Erro ao conectar com o servidor.");
        });

});