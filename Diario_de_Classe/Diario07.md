#  Diário de Classe — Construção do Front-end com React

Nesta etapa, iniciei o desenvolvimento da interface visual na pasta `web/` utilizando **React + Vite + TypeScript**. Como a API já estava ativa em `http://localhost:3000`, o foco foi consumir os endpoints existentes sem modificar o back-end.

---

###  Experimentação e Estrutura Inicial

Antes de construir o projeto principal, criei um pequeno aplicativo de teste (um interruptor de luz com `useState`) para fixar na prática como o React re-renderiza os componentes sempre que há mudança de estado. Em seguida, estruturei o ambiente oficial em `web/` com Vite, TypeScript, ESLint e Tailwind CSS.

---

###  Arquitetura de Componentes e Camada de Rede

| Arquivo | Responsabilidade no Projeto |
| :--- | :--- |
| `App.tsx` | Gerencia a navegação condicional: exibe o **Login** se não houver usuário autenticado ou as **Tarefas** caso contrário. |
| `Login.tsx` | Concentra os formulários de autenticação e cadastro de novos usuários. |
| `Tarefas.tsx` | Controla a listagem, filtragem por busca, criação, conclusão e remoção de itens. |
| `api.ts` | Centraliza todas as chamadas `fetch`, isolando URLs e cabeçalhos HTTP dos componentes visuais. |

> **Destaque de arquitetura:** Isolar as requisições no `api.ts` manteve os componentes limpos, permitindo que as telas apenas invoquem funções semânticas como `listarTarefas()` e `criarTarefa()`.

---

###  Hooks Aplicados

* **`useState`:** Controla os dados dinâmicos exibidos na interface (lista de tarefas, campos de formulário, alertas de erro e indicadores de carregamento).
* **`useEffect`:** Dispara a busca automática de tarefas ao montar a tela e sempre que o termo de pesquisa é alterado.
* **`useRef`:** Armazena valores persistentes entre renderizações sem forçar atualizações visuais (como o controle do identificador da última requisição).

---

### 🔄 Integração, Renderização e Ajustes

* **Liberação de CORS:** Em ambiente local, o front-end roda na porta `5173` enquanto a API opera na `3000`. Para evitar o bloqueio de origens cruzadas pelo navegador, configurei o pacote `cors` no `server.ts`.
* **Exibição Dinâmica:** As tarefas retornadas são renderizadas via `.map()`, exibindo título, badge colorido de prioridade (**Baixa**, **Média**, **Alta**) e ações de **Concluir/Reabrir** e **Excluir**, além de um aviso visual quando a lista está vazia.
* **Tipagem e Tradução de Dados:** O maior desafio foi alinhar as tipagens do TypeScript com o retorno real da API. Como o servidor envia prioridades em inglês (`low`, `medium`, `high`), implementei um dicionário de mapeamento para exibir os rótulos em português apenas na camada visual.

---

###  Conclusão da Aula

A combinação de React com Vite agiliza muito a prototipação da interface, enquanto separar a lógica de comunicação HTTP em um arquivo dedicado torna a leitura e a manutenção dos componentes muito mais simples.