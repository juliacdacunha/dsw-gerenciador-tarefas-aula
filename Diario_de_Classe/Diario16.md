# 🛡️ Diário de Classe — Blindagem e Segurança da API

O objetivo desta aula foi reforçar a proteção do back-end contra entradas malformadas ou mal-intencionadas. Partindo do princípio de **confiança zero** nos dados enviados pelo cliente, revisei todo o arquivo `server.ts` para completar e padronizar as camadas de defesa antes que qualquer informação alcance o banco de dados.

---

###  Validação de Entradas e Tratamento de Exceções

Implementei funções modulares de verificação, garantindo responsabilidade única para cada tipo de dado recebido nas requisições:

| Função | Regra de Validação | Comportamento em Caso de Falha |
| :--- | :--- | :--- |
| `ehTituloValido` | Exige tipo `string` com comprimento mínimo de 3 caracteres. | Bloqueia entradas curtas ou numéricas (`"titulo": 123`). |
| `ehPrioridade` / `ehStatus` | Verifica se os valores pertencem às listas permitidas. | Rejeita valores desconhecidos (ex.: `"status": "cancelled"`). |
| `lerId` | Converte o parâmetro da URL em número válido. | Recusa identificadores inválidos como `"abc"`. |

* **Fluxo de Erro (`400` vs `500`):** Nas rotas de atualização parcial (`PATCH`), criei a classe personalizada `ErroValidacao`. Ao detectar um campo inválido, lanço essa exceção para que o bloco `catch` diferencie falhas causadas pelo cliente (**HTTP 400**) de falhas internas inesperadas (**HTTP 500**), interrompendo o processo antes de acessar o banco.

---

###  Proteção Contra SQL Injection

Para evitar manipulação indevida de comandos no banco, todas as instruções utilizam **consultas parametrizadas** (`?`):

```ts
db.execute({ 
  sql: "DELETE FROM tarefas WHERE id = ? AND usuario_id = ?", 
  args: [id, usuarioId] 
});
```

* **Isolamento de Dados:** Os argumentos são enviados separadamente da estrutura SQL. Assim, tentativas de injeção como `' UNION SELECT ... --` são tratadas apenas como texto literal.
* **Queries Dinâmicas Seguras:** No `PATCH`, embora a consulta seja montada conforme os campos enviados, apenas nomes de colunas fixos escritos no código (`titulo = ?`, `status = ?`) são concatenados, mantendo todos os valores isolados em `args`.

---

###  Ocultação de Erros Internos e Configuração

* **Mensagens Genéricas:** Respostas de falha exibem apenas avisos neutros (como *"Erro ao salvar a tarefa."*), impedindo o vazamento de detalhes técnicos da estrutura de tabelas e colunas para possíveis atacantes.
* **Flexibilidade de Ambiente:** A porta de execução do servidor foi configurada via variável de ambiente (`PORT`).

---

###  Cenários de Teste (`request.http`)

Adicionei casos negativos no arquivo de testes para confirmar o bloqueio ativo das rotas:
* Cadastro com título curto (2 letras) ou tipo numérico;
* Envio de prioridade ou status fora dos padrões aceitos;
* Requisições com ID não numérico (`/api/tasks/abc`);
* Envio de requisição `PATCH` com corpo vazio;
* Simulação de ataque *SQL Injection* no parâmetro de busca (retornando lista vazia com segurança).

---

###  Aprendizado Principal
A segurança de uma aplicação não é uma etapa isolada, mas um requisito contínuo presente em cada rota. Combinar **validação rigorosa de entrada** com **queries parametrizadas** elimina a grande maioria das vulnerabilidades comuns em APIs.
