#  Diário de Classe — Aula 10: Alinhamento Arquitetural, Front-end e Deploy

**Data:** 24/11/2026

Nesta aula, revisei todo o projeto comparando-o com dois materiais de referência: a **apresentação técnica de arquitetura** (cobrindo front-end, API, segurança, banco e deploy) e o **roteiro de estudos do front-end**. O objetivo foi identificar divergências, padronizar nomenclaturas e preparar a aplicação completa para publicação em nuvem.

---

###  Ajustes e Evoluções Implementadas

| Camada | Melhorias Aplicadas |
| :--- | :--- |
| **Back-end (`server.ts`)** | • Criação do endpoint **`/api/db-check`**, que valida a conexão e exibe a contagem de registros por tabela sem expor dados sensíveis.<br>• Atualização do tempo de expiração do token **JWT para 7 dias**.<br>• Exibição de diagnóstico seguro no banner do terminal (indicando a origem do banco e a presença do token do Turso sem revelar o segredo). |
| **Build e Deploy (`package.json` / `render.yaml`)** | • Ajuste do script `build` para `npm --prefix web install && npm run build:web && tsc`, garantindo que as dependências isoladas do monorepo (`web/`) sejam instaladas antes da compilação na nuvem.<br>• Criação do arquivo **`render.yaml`** (Blueprint do Render) definindo comandos de build/start, health check e variáveis de ambiente. |
| **Front-end (`web/src`)** | • Padronização de funções e variáveis conforme o roteiro (`getUsuario`, `clearToken`, `aoLogar`, `buscaAplicada`, `requisicaoAtual`, `carregar`, `PRIORIDADES_PT`).<br>• Clareza no fluxo de sessão no `App.tsx` com `useState(() => getUsuario())` e `const logado = usuario !== null`.<br>• **Tratamento de sessão expirada no `api.ts`:** respostas `401` em rotas autenticadas limpam o token e redirecionam ao login com aviso (*"Sua sessão expirou"*).<br>• Contrato completo na interface `Tarefa` (`usuario_id`, `descricao`, `criado_em`, `atualizado_em`), derivando `Prioridade` e `Status` diretamente dela.<br>• Filtro instantâneo por prioridade via chips (*Todas*, *Baixa*, *Média*, *Alta*) usando `useMemo`, badges padronizados (**verde**, **amarelo** e **vermelho**), spinners de carregamento, barra de progresso de conclusão e prioridade padrão definida como **Média**. |
| **Documentação** | • Atualização do `README.md` detalhando arquitetura, rotas e deploy.<br>• Criação do `COMO_RODAR.md` e do `QUESTIONARIO.md` com as 5 questões do roteiro comentadas. |

---

###  Por que Essa Revisão Importa

Consolidar a arquitetura mostrou que cada escolha técnica resolve um problema real: o **bcrypt** protege credenciais em caso de vazamento do banco; o **JWT** mantém o servidor *stateless*; o filtro por **`usuario_id`** bloqueia acessos indevidos entre contas (**IDOR**); e o **Turso** garante persistência definitiva diante do armazenamento efêmero do plano gratuito do Render. Dominar esses fundamentos prepara o projeto tanto para produção quanto para apresentações técnicas.

---

###  Desafios Enfrentados

* **Regra do ESLint no `useEffect`:** O linter acusou erro ao invocar `carregar()` diretamente dentro do efeito (*"Avoid calling setState() directly within an effect"*). Resolvi reestruturando a chamada com `.then()` e uma flag booleana `ativo` para descartar respostas obsoletas caso o filtro de busca mude durante a requisição.
* **Distinção de erros `401`:** Como um `401` na tela de login indica credenciais incorretas, condicionei o aviso de *"sessão expirada"* apenas às requisições enviadas com um token ativo.
* **Estabilidade de referências com `useCallback`:** Como `carregar` passou a depender de `aoSair` para tratar sessões expiradas, envolvi `aoSair` em um `useCallback` no `App.tsx` para evitar recriações da função a cada renderização.

---

###  Principais Aprendizados

* **Roteamento Híbrido:** Um único servidor Express gerencia as rotas da API (`/api/*`), entrega os arquivos estáticos de `web/dist` e redireciona as demais URLs para o `index.html` do React.
* **Prevenção contra IDOR:** Validar apenas o `:id` da URL permite que um usuário manipule registros alheios; incluir `AND usuario_id = ?` em todas as queries elimina essa brecha.
* **Infraestrutura como Código (IaC):** O `render.yaml` mantém toda a configuração de deploy versionada junto ao repositório.
* **`useRef` vs `useState`:** `useRef` guarda controles mutáveis (como o contador de requisições) sem disparar novas renderizações na interface.
* **`useMemo`:** Valores derivados de estados existentes (como listas filtradas) devem ser memorizados com `useMemo` em vez de duplicados em novos estados.
