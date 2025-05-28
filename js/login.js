document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const cpf = document.getElementById("cpf").value || null;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    fetch("https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Usuario" ,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cpf: cpf,
            email: email,
            senha: senha
        })
    })
    .then(res => {
        if(res.ok) return window.location.href = "membro.html";
        alert("Login invalido");
    })
    .catch(err=> alert("Erro ao conectar com o servidor."))
});