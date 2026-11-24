#  Diário de Classe — Configuração de Ambiente: Node.js e npm no Windows

**Data:** 18/11/2026

Ao tentar inicializar o projeto e executar `npm install` no terminal integrado do VS Code, enfrentei uma cadeia de três erros de configuração no Windows antes de conseguir instalar os pacotes e rodar a aplicação.

---

###  1. Verificação e Instalação do Node.js

Utilizei o gerenciador de pacotes do Windows para garantir a presença do ambiente:

```powershell
winget install OpenJS.NodeJS.LTS
```

O sistema retornou que o pacote já estava instalado no diretório padrão (`C:\Program Files\nodejs\`).

---

### 🔧 2. Diagnóstico e Solução dos Erros de Terminal

| Erro Encontrado | Causa Raiz | Solução Aplicada |
| :--- | :--- | :--- |
| **`O termo 'npm' não é reconhecido`** | O VS Code foi aberto *antes* da instalação do Node, mantendo a variável `PATH` desatualizada na sessão. | **Definitiva:** Fechar todas as janelas do VS Code e reabrir.<br>**Temporária (terminal atual):**<br>`$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")` |
| **`Execução de scripts foi desabilitada`** (`npm.ps1`) | O PowerShell bloqueia por padrão a execução de arquivos `.ps1` por política de segurança. | Liberar scripts locais para o usuário atual (confirmando com **S**):<br>`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`<br>*(Alternativa sem alterar regras: usar `npm.cmd install`).* |
| **`O termo 'npm.cmd' não é reconhecido`** | A atualização manual do `$env:Path` foi feita em outra aba do terminal e não persistiu na nova sessão. | Reiniciar o VS Code por completo ou invocar o executável pelo caminho absoluto:<br>`& "C:\Program Files\nodejs\npm.cmd" install` |

Para validar que o ambiente ficou operacional após os ajustes:

```powershell
node -v
npm -v
```

---

###  3. Inicialização do Projeto e Correção do `esbuild`

Com o `npm` ativo, executei os scripts do projeto:

```powershell
npm install          # Instala as dependências do back-end
npm run dev          # Sobe o servidor com reinicialização automática (watch)
npm start            # Inicia o servidor em modo padrão
npm run dev:web      # Inicia o servidor de desenvolvimento do front-end (pasta web)
```

> **Ajuste extra (`esbuild`):** Caso o npm emita aviso bloqueando o script de pós-instalação do `esbuild`, basta aprovar e recompilar o pacote:
> ```powershell
> npm install-scripts approve esbuild
> npm rebuild esbuild
> ```

---

###  Reflexão e Aprendizados

* **Importância:** Dominar o diagnóstico de variáveis de ambiente evita bloqueios ao configurar máquinas novas, como nos computadores dos laboratórios de aula.
* **Desafios superados:** Inicialmente acreditei que a instalação do Node estava corrompida, até perceber que o problema estava no cache do `PATH` do editor e no isolamento entre diferentes abas do terminal.
* **Principais lições:**
  * O **`PATH`** mapeia onde o sistema busca executáveis; alterações nele exigem reiniciar o processo pai (neste caso, fechar o VS Code inteiro).
  * A política **`RemoteSigned`** no escopo `CurrentUser` permite rodar ferramentas como o `npm` no PowerShell sem precisar de permissão de administrador.
  * Caminhos absolutos servem como alternativa imediata sempre que um comando não estiver mapeado no terminal.