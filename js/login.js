document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;

    if(!login || !senha){
        alert("Por favor, preencha todos os campos")
        return;
    }

    let payload = {senha: senha};

    const cpfLimpo = login.replace(/\D/g, "");
    if (cpfLimpo.length === 11){   // CPF tem que ter 11 digitos
        payload.cpf = cpfLimpo;
    } 
    else{
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
        if (!emailValido) {
            alert("Digite um CPF válido (11 números) ou um e-mail válido.");
            return;
        }
        payload.email = login;
    }

    fetch('api/login' ,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({payload})
    })
    .then(res => {
        if(res.ok) return window.location.href = "home.html";
        alert("Login invalido");
    })
    .catch(err=> alert("Erro ao conectar com o servidor."))
});