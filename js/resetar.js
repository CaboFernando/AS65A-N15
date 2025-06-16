document.getElementById("resetar-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const novaSenha = document.getElementById("novaSenha").value;

  if (!token || !novaSenha) {
    alert("Token inválido ou senha vazia.");
    return;
  }

  const resposta = await fetch(`https://bolsafamilia-api-c3agdmbpdnhxaufz.brazilsouth-01.azurewebsites.net/api/Auths/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword: novaSenha })
  });

  const dados = await resposta.json();
  alert(dados.message || "Senha redefinida com sucesso.");
  window.location.href = "login.html";
});
