import { useEffect, useState } from 'react'

function Rotina() {
  const hoje = new Date().toLocaleDateString('pt-BR')

  const [novaTarefa, setNovaTarefa] = useState('')

  const [tarefasPorData, setTarefasPorData] = useState(() => {
    const tarefasSalvas = localStorage.getItem('tarefasPorData')

    if (tarefasSalvas) {
      return JSON.parse(tarefasSalvas)
    }

    const tarefasAntigas = JSON.parse(
      localStorage.getItem('tarefasRotina') || '[]'
    )

    if (tarefasAntigas.length > 0) {
      return {
        [hoje]: tarefasAntigas,
      }
    }

    return {}
  })

  const tarefas = tarefasPorData[hoje] || []

  const tarefasConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida
  ).length

  useEffect(() => {
    localStorage.setItem(
      'tarefasPorData',
      JSON.stringify(tarefasPorData)
    )
  }, [tarefasPorData])

  function atualizarTarefas(novasTarefas) {
    setTarefasPorData({
      ...tarefasPorData,
      [hoje]: novasTarefas,
    })
  }

  function adicionarTarefa(evento) {
    evento.preventDefault()

    if (!novaTarefa.trim()) {
      return
    }

    const tarefa = {
      id: Date.now(),
      texto: novaTarefa.trim(),
      concluida: false,
    }

    atualizarTarefas([...tarefas, tarefa])
    setNovaTarefa('')
  }

  function alterarTarefa(id) {
    const tarefasAtualizadas = tarefas.map((tarefa) => {
      if (tarefa.id === id) {
        return {
          ...tarefa,
          concluida: !tarefa.concluida,
        }
      }

      return tarefa
    })

    atualizarTarefas(tarefasAtualizadas)
  }

  function excluirTarefa(id) {
    const tarefasAtualizadas = tarefas.filter(
      (tarefa) => tarefa.id !== id
    )

    atualizarTarefas(tarefasAtualizadas)
  }

  return (
    <section className="rotina">
      <div className="titulo-rotina">
        <div>
          <p>Organização</p>
          <h2>Rotina de hoje</h2>
        </div>

        <span>
          {tarefasConcluidas} de {tarefas.length} concluídas
        </span>
      </div>

      <form
        className="formulario-tarefa"
        onSubmit={adicionarTarefa}
      >
        <input
          type="text"
          placeholder="Digite uma nova tarefa"
          value={novaTarefa}
          onChange={(evento) =>
            setNovaTarefa(evento.target.value)
          }
        />

        <button type="submit">
          Adicionar tarefa
        </button>
      </form>

      {tarefas.length === 0 ? (
        <div className="rotina-vazia">
          <p>Nenhuma tarefa cadastrada para hoje.</p>
        </div>
      ) : (
        <ul className="lista-tarefas">
          {tarefas.map((tarefa) => (
            <li
              className={
                tarefa.concluida
                  ? 'tarefa-concluida'
                  : ''
              }
              key={tarefa.id}
            >
              <button
                type="button"
                className="marcar-tarefa"
                onClick={() => alterarTarefa(tarefa.id)}
              >
                {tarefa.concluida ? '✓' : ''}
              </button>

              <span>{tarefa.texto}</span>

              <button
                type="button"
                className="excluir-tarefa"
                onClick={() => excluirTarefa(tarefa.id)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Rotina