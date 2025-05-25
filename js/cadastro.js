document.getElementById("cadastro-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value || null;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !cpf || !email || !senha) {
        alert("Todos os campos são obrigatórios.");
        return;
    }

    fetch('api/cadastro' ,{
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
        if(res.ok) {
            return window.location.href = "login.html";
        }else {
            alert("Erro ao cadastrar");
        }
    })
    .catch(err=> alert("Erro ao conectar com o servidor."))
})
