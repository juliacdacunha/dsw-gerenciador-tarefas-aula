import express from "express";
import Database from "better sqlite";

const app = express();
const PORT = 3000;


// Middleware para ler o corpo das requisições em formato JSON
app.use(express.json());

const db = new Database("tarefa.db");

db.exec(`
    CREAT TABLE IF NOT EXISTS tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      status TEXT DEFAUT 'pending'
   );

   CREATE TABLE IF NOT EXIST usuarios(
    id INTEREGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    senha TEXT NOT NULL
  
   );
`);

// INSERINDO DADOS FALSOS PARA SEREM VAZADOS
const usuariosexistentes = db.prepare('SELECT COUNT(") AS count FROM usuarios').get() as any;
if (usuariosiosExistentes.count === 0){
    db.exes(
        INSERT INTO usuarios (email,senha) VALUES ('admin@gmail.com', 'senha_super_segura_123')

    );
}
    console.log("Banco de dados SQLite inicialiazado com sucesso");




    
}

// Banco de dados provisório em RAM
let bancoDeDadosProvisorio = [
  { id: 1, title: "Estudar arquitetura REST", status: "pendente" }
];

// Rota de integridade do sistema 
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "servidor do gestor de tarefas ativo!" });  
});

// Rota de versão do sistema
app.get("/api/version", (req, res) => {
    res.json({  
        appName: "Gerenciador de Tarefas Multi-Usuario",
        version: "1.0.0"
    });
});

// Rota para listar tarefas
app.get("/api/tasks", (req, res) => {
    res.json(bancoDeDadosProvisorio);
});

// Rota para criar nova tarefa
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;
    const novaTarefa = {
        id: Date.now(),
        title,
        status: "pendente"
    };

    bancoDeDadosProvisorio.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

// Rota para deletar tarefa
app.delete("/api/tasks/:id", (req, res) => {
    const idParaDeletar = parseInt(req.params.id);
    bancoDeDadosProvisorio = bancoDeDadosProvisorio.filter(t => t.id !== idParaDeletar);
    res.json({ message: "Tarefa removida com sucesso!" });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`servidor rodando em http://localhost:${PORT}`);
});