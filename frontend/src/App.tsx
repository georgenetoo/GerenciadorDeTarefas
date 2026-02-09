import { useState, useEffect } from "react";

interface Tarefa {
  id: number;
  titulo: string;
  concluida: number;
}

function App() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novoTitulo, setNovoTitulo] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    carregarTarefas();
  }, []);

  async function carregarTarefas() {
    const resposta = await fetch("http://localhost:3001/tarefas");
    const dados = await resposta.json();
    setTarefas(dados);
  }

  async function adicionarTarefa(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo) return;

    const resposta = await fetch("http://localhost:3001/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: novoTitulo }),
    });
    const novaTarefa = await resposta.json();
    setTarefas([...tarefas, novaTarefa]);
    setNovoTitulo("");
  }

  // --- NOVA FUNÇÃO: Marcar como Feita/Pendente ---
  async function toggleConcluida(id: number, estadoAtual: number) {
    const novoEstado = estadoAtual === 0 ? 1 : 0; // Inverte: se 0 vira 1, se 1 vira 0

    // Atualiza no Backend
    await fetch(`http://localhost:3001/tarefas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluida: novoEstado }),
    });

    // Atualiza na Tela (Sem precisar recarregar tudo)
    // O map cria uma nova lista atualizando só aquela tarefa específica
    setTarefas(
      tarefas.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: novoEstado } : tarefa,
      ),
    );
  }

  // --- NOVA FUNÇÃO: Deletar ---
  async function deletarTarefa(id: number) {
    // Avisa o Backend para apagar
    await fetch(`http://localhost:3001/tarefas/${id}`, {
      method: "DELETE",
    });

    // Atualiza na Tela
    // O filter cria uma lista nova REMOVENDO aquele item
    setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h1>Gerenciador de Tarefas 🚀</h1>

      <form
        onSubmit={adicionarTarefa}
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <input
          type="text"
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder="Nova tarefa..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          +
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tarefas.map((item) => (
          <li
            key={item.id}
            style={{
              border: "1px solid #eee",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: item.concluida ? "#f0f9f0" : "#fff", // Fica verdinho se concluída
              textDecoration: item.concluida ? "line-through" : "none", // Risca o texto se concluída
              color: item.concluida ? "#aaa" : "#000",
            }}
          >
            <span
              onClick={() => toggleConcluida(item.id, item.concluida)}
              style={{ cursor: "pointer", flex: 1 }}
            >
              {item.titulo}
            </span>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* Botão Check */}
              <button
                onClick={() => toggleConcluida(item.id, item.concluida)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                }}
              >
                {item.concluida ? "✅" : "⬜"}
              </button>

              {/* Botão Lixeira */}
              <button
                onClick={() => deletarTarefa(item.id)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
      {tarefas.length === 0 && (
        <p style={{ textAlign: "center", color: "#888" }}>
          Nenhuma tarefa ainda. Crie uma!
        </p>
      )}
    </div>
  );
}

export default App;
