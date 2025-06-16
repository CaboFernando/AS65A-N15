document.getElementById("recuperar-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Digite seu e-mail cadastrado.");
        return;
    }

    fetch('https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Auths/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error("Não foi possível enviar o e-mail.");
        }
    })
    .then(data => {
        alert("Um link de redefinição foi enviado para seu e-mail.");
        window.location.href = "login.html";
    })
    .catch(err => {
        alert(err.message || "Erro ao conectar com o servidor.");
    });
});
