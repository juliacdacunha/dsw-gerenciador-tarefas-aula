# 💻 Gerenciador de Tarefas Web

> **Disciplina:** Desenvolvimento de Sistemas Web  
> **Estudante:** Julia  

---

## 📌 Sumário
- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Execução](#-instalação-e-execução)
- [Testes da API](#-testes-da-api)

---

## 📝 Visão Geral
O projeto consiste em um sistema completo de **gerenciamento de tarefas multiusuário**. A aplicação permite que usuários individuais se cadastrem, autentiquem e gerenciem suas tarefas com suporte à persistência de dados em banco de dados SQLite.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem & Runtime:** [Node.js](https://nodejs.org/) / [TypeScript](https://www.typescriptlang.org/)
- **Estilização Frontend:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados:** [SQLite](https://www.sqlite.org/)
- **Testes HTTP:** REST Client (`requests.http`)

---

## ✨ Funcionalidades

- [x] **Autenticação e Escopo Multiusuário:** Acesso e gestão de tarefas isolados por usuário.
- [x] **Gestão de Tarefas (CRUD):**
  - Criação de novas tarefas.
  - Listagem e visualização de afazeres.
  - Atualização de dados e status (pendente/concluída).
  - Remoção de tarefas.
- [x] **Persistência de Dados:** Armazenamento seguro de informações no banco SQLite.

---

## 📁 Estrutura do Projeto

```text
.
├── index.html            # Interface de usuário (Frontend)
├── server.ts             # Ponto de entrada do servidor backend (API)
├── tailwind.config.js    # Configurações de estilos do Tailwind CSS
├── tsconfig.json         # Configurações do compilador TypeScript
├── package.json          # Dependências e scripts do projeto
└── requests.http         # Arquivo para testes e validação das rotas da API
