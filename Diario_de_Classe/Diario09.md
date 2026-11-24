#  Documentação Técnica — Arquitetura da API de Tarefas (`server.ts`)

O arquivo `server.ts` concentra toda a lógica de **back-end** da aplicação. Ele processa requisições HTTP vindas do navegador ou de clientes REST, interage com o banco de dados e retorna respostas padronizadas em **JSON**.

###  Stack Tecnológica
* **Express:** Gerenciamento do servidor HTTP e roteamento de endpoints.
* **TypeScript:** Tipagem estática para prevenção de falhas em tempo de desenvolvimento.
* **SQLite:** Persistência de dados local baseada no arquivo `tarefas.db`.

---

###  Estrutura Interna do Arquivo

O código segue uma organização sequencial dividida em 7 blocos principais:
1. **Configurações:** Definição de porta, leitura do `.env` e chave secreta do JWT.
2. **Tipagem e Regras:** Contratos de dados e funções de sanitização/validação.
3. **Camada de Dados:** Criação automática das tabelas do banco.
4. **Repositório (`repo`):** Centralização das queries SQL.
5. **Middlewares:** Interceptadores de requisições (como autenticação e tratamento de JSON).
6. **Endpoints:** Definição das rotas públicas e protegidas.
7. **Bootstrap:** Inicialização segura do banco e abertura da porta do servidor.

---

###  Tipagem e Validação de Entrada

As definições de tipos são derivadas diretamente das constantes `PRIORIDADES` e `STATUS_VALIDOS`, mantendo o código sincronizado automaticamente caso novos valores sejam adicionados:

```ts
type Prioridade = "low" | "medium" | "high";
type Status = "pending" | "completed";
```

> **Nota de segurança:** Como os tipos do TypeScript existem apenas durante a compilação, a proteção real em tempo de execução é garantida pelas funções abaixo — nenhum dado externo chega ao banco sem passar por elas:

* `ehTituloValido()` → Exige textos com no mínimo 3 caracteres válidos (ignorando espaços nas pontas).
* `ehPrioridade()` / `ehStatus()` → Verificam se os valores pertencem às listas permitidas.
* `prioridadeOuPadrao()` / `statusOuPadrao()` → Aplicam valores seguros (`medium` e `pending`) caso a entrada seja inválida.
* `lerId()` → Converte o parâmetro `:id` da rota em número inteiro; entradas não numéricas (ex.: `"abc"`) retornam `null`.

---

###  Estrutura do Banco e Repositório (`repo`)

Na inicialização, o servidor garante a existência das seguintes tabelas e cria um usuário padrão (`admin@senai.com`) com senha criptografada:

* **`usuarios`:** `id`, `email`, `senha_hash`, `criado_em`
* **`tarefas`:** `id`, `usuario_id` (chave estrangeira), `titulo`, `descricao`, `status`, `prioridade`, `criado_em`, `atualizado_em`

Todas as operações SQL ficam isoladas no objeto `repo` (`listarTarefas`, `criarTarefa`, `excluirTarefa`, `usuarioPorEmail`, etc.). Essa abordagem mantém as rotas limpas, facilita manutenções e utiliza parâmetros posicionais (`?`) para blindar a aplicação contra **SQL Injection**.

---

###  Mapa de Endpoints da API

| Categoria | Método | Endpoint | Descrição |
| :--- | :--- | :--- | :--- |
| **Sistema** | `GET` | `/api/health` | Verifica a disponibilidade da API e do banco. |
| **Sistema** | `GET` | `/api/version` | Retorna a versão atual da aplicação. |
| **Auth** | `POST` | `/api/auth/register` | Registra uma nova conta de usuário. |
| **Auth** | `POST` | `/api/auth/login` | Autentica o usuário e gera o token JWT. |
| **Tarefas** | `GET` | `/api/tasks` | Lista tarefas do usuário (suporta filtro via `?search=`). |
| **Tarefas** | `POST` | `/api/tasks` | Cadastra uma nova tarefa. |
| **Tarefas** | `PUT` | `/api/tasks/:id` | Atualiza todos os campos da tarefa (título obrigatório). |
| **Tarefas** | `PATCH` | `/api/tasks/:id` | Atualiza parcialmente apenas os campos enviados (ex.: `{ "status": "completed" }`). |
| **Tarefas** | `DELETE` | `/api/tasks/:id` | Remove permanentemente uma tarefa. |

#### Códigos de Status HTTP Utilizados
* **`200` / `201`:** Requisição bem-sucedida (`201` indica criação de novo recurso).
* **`400`:** Erro de validação nos dados enviados.
* **`401`:** Acesso negado por ausência ou invalidade do token de autenticação.
* **`404`:** Recurso ou tarefa não localizada.
* **`409`:** Conflito de dados (ex.: tentativa de cadastro com e-mail já existente).
* **`500`:** Falha interna inesperada no servidor.

---

### ▶Ciclo de Inicialização

```ts
await prepararBanco();
app.listen(PORT, ...);
```

O servidor segue uma ordem estrita de subida: primeiro prepara e valida o banco de dados de forma assíncrona (`prepararBanco()`), e somente após a confirmação começa a escutar requisições na porta configurada (padrão `3000`).

---

###  Síntese
Uma API RESTful completa com operações CRUD, isolamento de dados por usuário em SQLite e validação rigorosa de todas as entradas antes da persistência.