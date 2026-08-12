import express from "express";

const app = express();
const PORT = 3000;


//rota de integridade do sistema 
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "servidor do gestor de tarefas ativo!" });  
});


// Rota de versão do sistema
app.get("/api/version", (req, res) => {
    res.json({  appName: "Gerenciador de Tarefas Multi-Usuario",version: "1.0.0"
    });
});

app.listen(PORT,() => {
    console.log('servidor rodando em http://localhost:${PORT}' );
});