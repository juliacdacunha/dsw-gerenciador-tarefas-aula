#  Diário de Classe — Aula 09: Integração com Banco Híbrido (Local / Turso)

Nesta etapa do projeto, substituímos o driver `better-sqlite3` pelo **`@libsql/client`**. Como os endpoints da API foram preservados, toda a camada de front-end permaneceu intacta e funcional sem necessidade de ajustes.

---

###  Configuração e Variáveis de Ambiente

O sistema agora suporta dois modos de armazenamento de dados:

| Modo de Operação | Como Configurar | Comportamento |
| :--- | :--- | :--- |
| **Local (Padrão)** | Nenhuma configuração necessária | Cria e utiliza automaticamente o arquivo `tarefas.db` na máquina. |
| **Nuvem (Turso)** | Duplicar `.env.example` como `.env` e definir `TURSO_URL` e `TURSO_TOKEN` | Conecta diretamente ao banco remoto (ambas as variáveis são obrigatórias juntas). |

* **Segurança (`JWT_SECRET`):** Opcional em ambiente de desenvolvimento, mas obrigatório usar uma chave forte em produção.
* **Proteção de Credenciais:** O arquivo `.env` está listado no `.gitignore`, garantindo que tokens sensíveis nunca sejam enviados ao GitHub.

---

###  Principais Alterações no Back-end

1. **Operações Assíncronas (`async/await`):** Todas as queries foram adaptadas para lidar com a latência de rede caso o banco esteja hospedado na nuvem.
2. **Inicialização Segura (`prepararBanco()`):** O servidor aguarda a conexão e preparação do banco de dados antes de liberar a porta para receber requisições.
3. **Migração Automática (`migrarBancoAntigo()`):** Garante compatibilidade com bancos de aulas anteriores sem perda de registros (usuários ou tarefas), realizando:
   * Renomeação da coluna `senha` para `senha_hash`;
   * Criptografia automática de senhas antigas salvas em texto puro;
   * Adição das colunas de data ausentes.
4. **Monitoramento (`/api/health`):** Executa um `SELECT 1` para validar a saúde da conexão e retorna qual modo de banco (local ou nuvem) está ativo.

---

###  Unificação de Front-end e API

Após gerar o build do React, o próprio `server.ts` passa a servir os arquivos estáticos da pasta `web/dist`, centralizando toda a aplicação na **porta 3000**:
* Rotas iniciadas em `/api` que não existirem retornam erro `404` em formato JSON.
* Demais rotas são redirecionadas automaticamente para a interface React.

---

###  Passo a Passo para Execução

Execute os comandos abaixo no terminal na raiz do projeto:

```bash
# 1. Instalar dependências do back-end e do front-end
npm install
npm --prefix web install

# 2. Compilar o servidor e gerar o build da interface
npm run build
npm run build:web

# 3. Iniciar a aplicação
npm start
```

* **Interface Web:** `http://localhost:3000`
* **Status da API/Banco:** `http://localhost:3000/api/health`
* **Testes de Rotas:** Utilize o arquivo `request.http` com a extensão *REST Client* no VS Code.