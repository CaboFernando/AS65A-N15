document.getElementById("cadastro-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    // Validação simples
    if (!nome || !cpf || !email || !senha) {
        alert("Todos os campos são obrigatórios.");
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
            window.location.href = "login.html";
        } else {
            alert("Erro ao cadastrar. Verifique os dados e tente novamente.");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao conectar com o servidor.");
    });
});
