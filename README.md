**README para o Repositório AS65A-N15**

Este repositório contém o código fonte da aplicação de front-end que será utilizada no projeto da disciplina **Certificadora De Competência Identitária** (AS65A - N15) do semestre 2025_01.

---

**Objetivo do Projeto**

- Desenvolver uma aplicação que consome um back-end, facilitando a interação e o gerenciamento de dados relacionados à competência identitária.

---

**Membros do Grupo**

- André Faria De Souza - RA 2101106
- Beatriz Aparecida Banaki De Campos - RA 2210533
- Carlos Fernando Dos Santos - RA 1692984
- Rafael De Palma Francisco - RA 2465248
- Sarah Kelly Almeida - RA 1842293

---

# Sistema de Gerenciamento de Usuários e Famílias

Este repositório contém o frontend de uma aplicação web desenvolvida em HTML, CSS e JavaScript puro, focada no gerenciamento de usuários e seus relacionamentos familiares. O projeto inclui páginas para cadastro, autenticação, edição de perfil e uma área administrativa para visualização e gestão de dados.

## Funcionalidades Principais

* **Autenticação de Usuários:**
    * **Cadastro:** Permite que novos usuários se registrem no sistema.
    * **Login:** Funcionalidade de acesso para usuários existentes.
    * **Recuperação de Senha:** Opção para usuários redefinirem suas credenciais.
* **Gerenciamento de Perfil:**
    * **Edição de Perfil:** Usuários autenticados podem visualizar e atualizar suas informações pessoais.
* **Gestão Familiar:**
    * **Famílias:** Uma seção dedicada à visualização e, possivelmente, gerenciamento dos parentes associados a um usuário. (A interação com a API de backend para carregar os parentes é um ponto chave aqui).
* **Painel Administrativo:**
    * Uma área restrita (`admin.html`) para usuários com permissões especiais, permitindo a gestão geral do sistema (ex: listagem de todos os usuários, etc.).

## Tecnologias Utilizadas

Este projeto é construído exclusivamente com as tecnologias fundamentais da web para o frontend:

* **HTML5:** Estruturação das páginas e conteúdo.
* **CSS3:** Estilização e design responsivo da interface.
    * `css/style.css`: Estilos globais e comuns.
    * `css/home-style.css`: Estilos específicos da página inicial.
    * `css/admin-style.css`: Estilos para o painel administrativo.
* **JavaScript (ES6+):** Lógica interativa do frontend, validações e comunicação com o backend (via Fetch API ou XMLHttpRequest).
    * `js/login.js`: Gerencia a autenticação.
    * `js/cadastro.js`: Lida com o processo de registro de novos usuários.
    * `js/recuperar.js`: Implementa a lógica de recuperação de senha.
    * `js/editar-perfil.js`: Controla a atualização de dados do perfil.
    * `js/familias.js`: Manipula a exibição e interações com os dados de parentes.
    * `js/admin.js`: Lógica para as funcionalidades do painel administrativo.
    * `js/home.js`: Scripts específicos para a página inicial.

**Observação:** A comunicação com o backend (API) para operações de dados (como listar usuários, carregar parentes, salvar dados, etc.) é feita através de requisições HTTP (`fetch` ou `XMLHttpRequest`) a um serviço externo não incluído neste repositório.

## Estrutura do Projeto

A organização dos arquivos segue uma estrutura clara para separar as responsabilidades:

```
.
├── .gitignore          # Arquivos e diretórios a serem ignorados pelo Git
├── README.md           # Este arquivo
├── admin.html          # Painel administrativo
├── cadastro.html       # Página de cadastro de novos usuários
├── css/
│   ├── admin-style.css # Estilos para o painel administrativo
│   ├── home-style.css  # Estilos para a página inicial
│   └── style.css       # Estilos globais e de componentes
├── editar-perfil.html  # Página de edição de perfil do usuário
├── familias.html       # Página para visualizar e gerenciar famílias/parentes
├── home.html           # Página inicial (após login, se aplicável)
├── index.html          # Página principal de entrada (ex: antes do login)
├── js/
│   ├── admin.js        # Lógica JavaScript do painel administrativo
│   ├── cadastro.js     # Lógica JavaScript para o cadastro
│   ├── editar-perfil.js # Lógica JavaScript para edição de perfil
│   ├── familias.js     # Lógica JavaScript para a seção de famílias
│   ├── home.js         # Lógica JavaScript da página inicial
│   ├── login.js        # Lógica JavaScript para o login
│   └── recuperar.js    # Lógica JavaScript para recuperação de senha
├── package-lock.json   # Gerado pelo npm, mantém a versão exata das dependências (removível se não usar Node.js para build)
├── package.json        # Configurações de dependências e scripts do Node.js (removível se não usar Node.js para build)
└── recuperar.html      # Página de recuperação de senha
```

## Como Abrir e Visualizar o Projeto

Como este é um projeto frontend com HTML, CSS e JavaScript puro, você pode visualizá-lo diretamente em um navegador web:

1.  **Baixe ou clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [nome-do-seu-repositorio]
    ```
2.  **Abra o arquivo `index.html` (ou `home.html`) no seu navegador de preferência.**
    * Você pode fazer isso clicando duas vezes no arquivo no seu explorador de arquivos, ou arrastando-o para a janela do navegador.

**Para desenvolvimento local com um servidor simples:**

Se você precisar de um servidor local para testar requisições AJAX ou outras funcionalidades que exigem um ambiente de servidor (como CORS), você pode usar o `live-server` (que está indicado nas suas dependências `package.json`):

1.  **Instale o `live-server` globalmente (se ainda não tiver):**
    ```bash
    npm install -g live-server
    ```
2.  **Navegue até a pasta raiz do projeto no terminal e execute:**
    ```bash
    live-server --port=5500
    ```
    Isso iniciará um servidor em `http://127.0.0.1:5500/` (ou outra porta disponível) e abrirá a página no seu navegador. Ele também oferece recarregamento automático ao salvar alterações.

```
