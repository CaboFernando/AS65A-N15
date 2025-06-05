document.getElementById("cadastro-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    
    if (!nome || !cpf || !email || !senha) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

 
    const cpfRegex = /^[0-9]{11}$/;
    if (!cpfRegex.test(cpf)) {
        alert("CPF inválido. Por favor, insira um CPF válido.");
        return;
    }

    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        alert("Email inválido. Por favor, insira um email válido.");
        return;
    }

    
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    
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
        if (res.ok) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "index.html"; // Redireciona para a página de login
        } else {
            alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao conectar com o servidor.");
    });
});
