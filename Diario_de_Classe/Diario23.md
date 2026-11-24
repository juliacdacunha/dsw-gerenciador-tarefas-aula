#  Diário de Classe — Refatoração Estrutural e Sistema de Autenticação

Com o avanço das aulas, o arquivo `server.ts` acumulou diversas responsabilidades misturadas (configurações, tipagens, validações, queries SQL e rotas), dificultando a leitura e a manutenção. O foco desta etapa foi reestruturar o código em módulos lógicos e implementar autenticação multi-usuário.

---

###  Nova Arquitetura do `server.ts`

O servidor foi dividido em seções sequenciais e bem delimitadas:

```text
server.ts
├── Configuração geral      (porta, JWT_SECRET, .env)
├── Tipos e regras          (Tarefa, Usuario, validações)
├── Banco de dados          (criação das tabelas e migração)
├── repo                    (centralização das consultas SQL)
├── Middlewares             (cors, json, exigirLogin)
├── Rotas públicas          (health, version, register, login)
├── Rotas de tarefas        (CRUD protegido)
├── Front-end               (entrega do build do React)
└── Inicialização
```

> **Destaque de organização:** A criação do objeto **`repo`** desacoplou o SQL das rotas. Agora os endpoints apenas invocam métodos como `repo.criarTarefa(...)` e `repo.listarTarefas(...)`, concentrando qualquer manutenção de banco em um único ponto.

---

###  Implementação da Autenticação e Isolamento de Dados

A partir desta aula, cada tarefa passou a estar vinculada a um proprietário específico através de três mecanismos principais:

| Camada | Funcionamento e Regras de Segurança |
| :--- | :--- |
| **Cadastro** (`POST /api/auth/register`) | • Valida o formato do e-mail (`@`) e exige senha com no mínimo 6 caracteres.<br>• Criptografa a senha com **bcrypt** antes de persistir no banco.<br>• Retorna erro **409** caso o e-mail já esteja em uso. |
| **Login** (`POST /api/auth/login`) | • Busca o usuário e valida a senha comparando com o hash salvo.<br>• Gera um **token JWT** com expiração de 8 horas.<br>• **Proteção contra enumeração:** Mesmo quando o e-mail não existe, executa a comparação do bcrypt contra um hash fictício para manter o tempo de resposta uniforme. |
| **Middleware** (`exigirLogin`) | • Extrai e valida a assinatura do cabeçalho `Authorization: Bearer <token>`.<br>• Injeta o `usuarioId` no objeto da requisição.<br>• Bloqueia acessos sem token ou com token inválido retornando **401**. |

* **Privacidade por Usuário:** Todas as queries de tarefas filtram explicitamente por `WHERE usuario_id = ?`. Caso um usuário tente acessar ou modificar o ID de uma tarefa pertencente a outra conta, a API responde **404** (ocultando até mesmo a existência do registro).

---

###  Funcionalidades Preservadas e Execução

Todos os recursos anteriores seguem operacionais — incluindo os endpoints de diagnóstico (`GET /api/health` e `GET /api/version`), as regras de validação de entrada e o CRUD completo em `/api/tasks` (agora protegido por login).

```bash
npm run dev     # Modo desenvolvimento (reinicia automaticamente ao salvar)
npm start       # Execução padrão do servidor
npm run build   # Verificação de tipagem do TypeScript
```

---

###  Reflexão Final
Separar o código por responsabilidades vai muito além da estética: agiliza a localização de falhas e facilita evoluções futuras. Somado ao controle de sessão com JWT, o sistema deixou de ser um protótipo único para operar como uma aplicação verdadeiramente multi-usuário.