import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configuração da chave secreta do JWT
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desenvolvimento";

// Middleware para ler o corpo das requisições em formato JSON
app.use(express.json());

// Inicialização do Banco de Dados SQLite
const db = new Database("tarefa.db");

// Criação das tabelas com a regra UNIQUE no e-mail
db.exec(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    prioridade TEXT DEFAULT 'medium'
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  );
`);

console.log("Banco de dados SQLite inicializado com sucesso");

// =====================================
// TIPOS E HELPERS DE VALIDAÇÃO
// =====================================

export interface Tarefa {
  id: number;
  titulo: string;
  status: string;
  prioridade: string;
}

export interface Usuario {
  id: number;
  email: string;
  senha: string;
}

const PRIORIDADES = ["low", "medium", "high"] as const;
const STATUS_VALIDOS = ["pending", "completed"] as const;

// Helper: Validação de ID
function parsearId(idRaw: string): number | null {
  const idNum = parseInt(idRaw, 10);
  return isNaN(idNum) || idNum <= 0 ? null : idNum;
}

// Helper: Type Guard para validar título
function tituloValido(titulo: unknown): titulo is string {
  return typeof titulo === "string" && titulo.trim().length >= 3;
}

// Helper: Normalização de Prioridade (Allowlist)
function normalizarPrioridade(prioridade: unknown): string {
  if (typeof prioridade === "string" && PRIORIDADES.includes(prioridade as any)) {
    return prioridade;
  }
  return "medium";
}

// Helper: Normalização de Status (Allowlist)
function normalizarStatus(status: unknown): string {
  if (typeof status === "string" && STATUS_VALIDOS.includes(status as any)) {
    return status;
  }
  return "pending";
}

// =====================================
// STATEMENTS PREPARADOS (SINGLETONS)
// =====================================
const stmtBuscarPorId = db.prepare("SELECT * FROM tarefas WHERE id = ?");
const stmtInserirTarefa = db.prepare("INSERT INTO tarefas (titulo, prioridade) VALUES (?, ?)");
const stmtDeletarTarefa = db.prepare("DELETE FROM tarefas WHERE id = ?");

// Prepared Statements para Autenticação
const stmtBuscarUsuarioPorId = db.prepare("SELECT * FROM usuarios WHERE id = ?");
const stmtBuscarUsuarioPorEmail = db.prepare("SELECT * FROM usuarios WHERE email = ?");
const stmtInserirUsuario = db.prepare("INSERT INTO usuarios (email, senha) VALUES (?, ?)");

// =====================================
// ROTAS DE DIAGNÓSTICO
// =====================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "servidor do gestor de tarefas ativo!" });
});

app.get("/api/version", (req, res) => {
  res.json({
    appName: "Gerenciador de Tarefas Multi-Usuario",
    version: "1.0.0"
  });
});

// Listar todas as tarefas do SQLite
app.get("/api/tasks", (req, res) => {
  const tarefas = db.prepare("SELECT * FROM tarefas").all();
  res.json(tarefas);
});

// =====================================
// ROTAS DE AUTENTICAÇÃO (AULA 06)
// =====================================

// Registro de Usuários
app.post("/api/auth/register", (req, res) => {
  const { email, senha } = req.body;

  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  if (senha.trim().length < 6) {
    return res.status(400).json({ error: "A senha deve ter ao menos 6 caracteres." });
  }

  const hash = bcrypt.hashSync(senha, 10);

  try {
    const resultado = stmtInserirUsuario.run(email.trim(), hash);
    const usuario = stmtBuscarUsuarioPorId.get(resultado.lastInsertRowid) as Usuario;
    return res.status(201).json({ id: usuario.id, email: usuario.email });
  } catch {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }
});

// Login de Usuários
app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;

  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const usuario = stmtBuscarUsuarioPorEmail.get(email.trim()) as Usuario | undefined;

  // Proteção contra Timing Attacks
  const hashEsperado = usuario?.senha ?? "$2a$10$fakehashparanaquebrarcomparacao";
  const senhaOk = bcrypt.compareSync(senha, hashEsperado);

  if (!usuario || !senhaOk) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: "2h",
  });

  return res.json({ token });
});

// =====================================
// ROTAS DE ESCRITA DE TAREFAS
// =====================================

// Criar Tarefa (POST)
app.post("/api/tasks", (req, res) => {
  const { titulo, prioridade } = req.body;
  const prioridadeValida = normalizarPrioridade(prioridade);

  if (!tituloValido(titulo)) {
    return res.status(400).json({
      error: "O título da tarefa é obrigatório e deve conter pelo menos 3 caracteres válidos."
    });
  }

  try {
    const resultado = stmtInserirTarefa.run(titulo.trim(), prioridadeValida);
    const novaTarefa = stmtBuscarPorId.get(resultado.lastInsertRowid) as Tarefa;
    return res.status(201).json(novaTarefa);
  } catch {
    return res.status(500).json({ error: "Erro ao processar persistência" });
  }
});

// Excluir Tarefa (DELETE)
app.delete("/api/tasks/:id", (req, res) => {
  const idParaDeletar = parsearId(req.params.id);
  if (idParaDeletar === null) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const resultado = stmtDeletarTarefa.run(idParaDeletar);
    if (resultado.changes === 0) {
      return res.status(404).json({ error: "Tarefa não localizada para exclusão." });
    }
    res.json({ message: "Tarefa excluída do banco SQLite com sucesso!" });
  } catch {
    res.status(500).json({ error: "Erro interno ao processar a exclusão." });
  }
});

// Atualização Completa (PUT)
app.put("/api/tasks/:id", (req, res) => {
  const idParaAtualizar = parsearId(req.params.id);
  if (idParaAtualizar === null) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const { titulo, prioridade, status } = req.body;

  if (!tituloValido(titulo)) {
    return res.status(400).json({
      error: "O título da tarefa é obrigatório e deve conter pelo menos 3 caracteres válidos."
    });
  }

  const prioridadeValida = normalizarPrioridade(prioridade);
  const statusValido = normalizarStatus(status);

  try {
    const sql = "UPDATE tarefas SET titulo = ?, status = ?, prioridade = ? WHERE id = ?";
    const resultado = db.prepare(sql).run(titulo.trim(), statusValido, prioridadeValida, idParaAtualizar);

    if (resultado.changes === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada para atualização!" });
    }

    const tarefaAtualizada = stmtBuscarPorId.get(idParaAtualizar) as Tarefa;
    return res.status(200).json(tarefaAtualizada);
  } catch {
    return res.status(500).json({ error: "Erro ao processar a atualização no banco de dados." });
  }
});

// Atualização Parcial (PATCH)
app.patch("/api/tasks/:id", (req, res) => {
  const idParaAtualizar = parsearId(req.params.id);
  if (idParaAtualizar === null) {
    return res.status(400).json({ error: "ID inválido." });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nenhum campo fornecido para atualização." });
  }

  const { titulo, prioridade, status } = req.body;

  try {
    const fluxoAtualizacao = db.transaction(() => {
      const tarefaExistente = stmtBuscarPorId.get(idParaAtualizar) as Tarefa | undefined;
      if (!tarefaExistente) return null;

      const camposParaAtualizar: string[] = [];
      const valoresParaAtualizar: unknown[] = [];

      if (titulo !== undefined) {
        if (!tituloValido(titulo)) {
          throw new Error("O título da tarefa deve conter pelo menos 3 caracteres válidos.");
        }
        camposParaAtualizar.push("titulo = ?");
        valoresParaAtualizar.push(titulo.trim());
      }

      if (prioridade !== undefined) {
        if (!PRIORIDADES.includes(prioridade as typeof PRIORIDADES[number])) {
          throw new Error("Prioridade inválida. Use 'low', 'medium' ou 'high'.");
        }
        camposParaAtualizar.push("prioridade = ?");
        valoresParaAtualizar.push(prioridade);
      }

      if (status !== undefined) {
        if (!STATUS_VALIDOS.includes(status as typeof STATUS_VALIDOS[number])) {
          throw new Error("Status inválido. Use 'pending' ou 'completed'.");
        }
        camposParaAtualizar.push("status = ?");
        valoresParaAtualizar.push(status);
      }

      if (camposParaAtualizar.length === 0) return tarefaExistente;

      const sql = `UPDATE tarefas SET ${camposParaAtualizar.join(", ")} WHERE id = ?`;
      valoresParaAtualizar.push(idParaAtualizar);
      db.prepare(sql).run(...valoresParaAtualizar);

      return stmtBuscarPorId.get(idParaAtualizar) as Tarefa;
    });

    const resultado = fluxoAtualizacao();
    if (!resultado) {
      return res.status(404).json({ message: "Tarefa não encontrada para atualização parcial!" });
    }

    return res.status(200).json(resultado);
  } catch (erro) {
    if (
      erro instanceof Error &&
      (erro.message.includes("inválid") || erro.message.includes("caracteres"))
    ) {
      return res.status(400).json({ error: erro.message });
    }
    return res.status(500).json({ error: "Erro ao processar a atualização parcial no banco." });
  }
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});