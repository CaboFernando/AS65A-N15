document.getElementById("recuperarForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const novaSenha = document.getElementById("novaSenha").value;

  const payload = {
    cpf: cpf,
    email: email,
    novaSenha: novaSenha
  };

  try {
    const resposta = await fetch("https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Usuarios/AlterarSenha", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const mensagem = document.getElementById("mensagem");

    if (resposta.ok) {
      mensagem.textContent = "Senha alterada com sucesso!";
      mensagem.style.color = "green";
    } else {
      mensagem.textContent = "Não foi possível alterar a senha. Verifique o CPF e e-mail.";
      mensagem.style.color = "red";
    }
  } catch (erro) {
    console.error("Erro ao enviar requisição:", erro);
    document.getElementById("mensagem").textContent = "Erro ao tentar alterar a senha.";
  }
});
