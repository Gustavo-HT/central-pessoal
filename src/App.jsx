import { useEffect, useState } from 'react'
import './App.css'
import Rotina from './components/Rotina'
import Navegacao from './components/Navegacao'
import Login from './components/Login'
import { supabase } from './lib/supabaseClient'


function App() {

  const [sessao, setSessao] = useState(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)

  const [telaAtiva, setTelaAtiva] = useState('hoje')

  const [agua, setAgua] = useState(() => {
    const aguaSalva = localStorage.getItem('agua')
    return aguaSalva ? Number(aguaSalva) : 0
  })

  const [minutosEstudo, setMinutosEstudo] = useState(() => {
    const estudoSalvo = localStorage.getItem('minutosEstudo')
    return estudoSalvo ? Number(estudoSalvo) : 0
  })

  const [treinoConcluido, setTreinoConcluido] = useState(() => {
    return localStorage.getItem('treinoConcluido') === 'true'
  })

  const refeicoes = [
  'Café da manhã',
  'Almoço',
  'Lanche da tarde',
  'Jantar',
]

  const [refeicoesConcluidas, setRefeicoesConcluidas] = useState(() => {
    const refeicoesSalvas = localStorage.getItem('refeicoesConcluidas')

    return refeicoesSalvas
      ? JSON.parse(refeicoesSalvas)
      : []
  })

  const [gastos, setGastos] = useState(() => {
    const gastosSalvos = localStorage.getItem('gastos')
    return gastosSalvos ? JSON.parse(gastosSalvos) : []
  })

  const [descricaoGasto, setDescricaoGasto] = useState('')
  const [valorGasto, setValorGasto] = useState('')

  const totalGastos = gastos.reduce((total, gasto) => {
    return total + gasto.valor
  }, 0)

  const historicoDiario = JSON.parse(
    localStorage.getItem('historicoDiario') || '[]'
  )

  useEffect(() =>{
    supabase.auth.getSession().then(({ data}) => {
      setSessao(data.session)
      setVerificandoSessao(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
      setVerificandoSessao(false)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('agua', agua)
  }, [agua])

  useEffect(() => {
    localStorage.setItem('minutosEstudo', minutosEstudo)
  }, [minutosEstudo])

  useEffect(() => {
    localStorage.setItem('treinoConcluido', treinoConcluido)
  }, [treinoConcluido])

  useEffect(() => {
  localStorage.setItem(
    'refeicoesConcluidas',
    JSON.stringify(refeicoesConcluidas)
  )
  }, [refeicoesConcluidas])

  useEffect(() => {
    localStorage.setItem('gastos', JSON.stringify(gastos))
  }, [gastos])

  useEffect(() => {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const dataSalva = localStorage.getItem('dataControle')

  if (dataSalva && dataSalva !== hoje) {
    const historicoSalvo = localStorage.getItem('historicoDiario')

    const historico = historicoSalvo
      ? JSON.parse(historicoSalvo)
      : []

    const diaJaFoiSalvo = historico.some(
      (registro) => registro.data === dataSalva
    )

    if (!diaJaFoiSalvo) {
      const registroDoDia = {
        id: Date.now(),
        data: dataSalva,
        agua,
        minutosEstudo,
        treinoConcluido,
        refeicoesConcluidas,
      }

      historico.push(registroDoDia)

      localStorage.setItem(
        'historicoDiario',
        JSON.stringify(historico)
      )
    }
  }

  if (dataSalva !== hoje) {
    setAgua(0)
    setMinutosEstudo(0)
    setTreinoConcluido(false)
    setRefeicoesConcluidas([])
    localStorage.setItem('dataControle', hoje)
  }
}, [])

  function adicionarAgua() {
    if (agua < 3) {
      setAgua(agua + 0.5)
    }
  }

  function zerarAgua() {
    setAgua(0)
  }

  function adicionarEstudo() {
    setMinutosEstudo(minutosEstudo + 30)
  }

  function zerarEstudo() {
    setMinutosEstudo(0)
  }

  function alterarTreino() {
    setTreinoConcluido(!treinoConcluido)
  }

  function alterarRefeicao(nomeRefeicao) {
  const refeicaoJaConcluida =
    refeicoesConcluidas.includes(nomeRefeicao)

  if (refeicaoJaConcluida) {
    setRefeicoesConcluidas(
      refeicoesConcluidas.filter(
        (refeicao) => refeicao !== nomeRefeicao
      )
    )
  } else {
    setRefeicoesConcluidas([
      ...refeicoesConcluidas,
      nomeRefeicao,
    ])
  }
}

  function adicionarGasto(evento) {
    evento.preventDefault()

    const valorConvertido = Number(valorGasto.replace(',', '.'))

    if (descricaoGasto.trim() && valorConvertido > 0) {
      const novoGasto = {
        id: Date.now(),
        descricao: descricaoGasto,
        valor: valorConvertido,
      }

      setGastos([...gastos, novoGasto])
      setDescricaoGasto('')
      setValorGasto('')
    }
  }

  function removerGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  function zerarGastos() {
    setGastos([])
  }

  async function sair() {
    const {error} = await supabase.auth.signOut()

    if (error) {
      alert('Erro ao sair: ${error.message}')
      return
    }

    setSessao(null)
    
  }

  if (verificandoSessao) {
    return <p>Carregando...</p>
  }

  if (!sessao) {
    return <Login />
  }

  return (
    <main className="painel">
      <header className="cabecalho">
        <p>Central Pessoal</p>
        <h1>Olá, Gustavo!</h1>
        <span>Acompanhe sua evolução diária em um só lugar.</span>

        <button
          type="button"
          className="botao-sair"
          onClick={sair}
        >
          Sair
        </button>
      </header>

      <section
        className={
          telaAtiva === 'hoje'
            ? 'resumo'
            : 'resumo tela-oculta'
        }
      >
        <article className="cartao">
          <h2>Água</h2>
          <strong>{agua} / 3 litros</strong>
          <p>Meta diária</p>

          <div className="barra-progresso">
            <div
              className="progresso-agua"
              style={{ width: `${(agua / 3) * 100}%` }}
            />
          </div>

          <button
            className="botao-agua"
            onClick={adicionarAgua}
            disabled={agua >= 3}
          >
            {agua >= 3 ? 'Meta concluída!' : 'Adicionar 500 ml'}
          </button>

          <button className="botao-reset" onClick={zerarAgua}>
            Zerar água
          </button>
        </article>

        <article className="cartao">
          <h2>Estudos</h2>
          <strong>{minutosEstudo} minutos</strong>
          <p>Meta diária: 60 minutos</p>

          <div className="barra-progresso">
            <div
              className="progresso-estudo"
              style={{
                width: `${Math.min((minutosEstudo / 60) * 100, 100)}%`,
              }}
            />
          </div>

          <button className="botao-estudo" onClick={adicionarEstudo}>
            Adicionar 30 minutos
          </button>

          <button className="botao-reset" onClick={zerarEstudo}>
            Zerar estudos
          </button>
        </article>

        <article className="cartao">
          <h2>Treino</h2>

          <strong>
            {treinoConcluido ? 'Concluído' : 'Pendente'}
          </strong>

          <p>Treino de hoje</p>

          <button
            className={`botao-treino ${
              treinoConcluido ? 'treino-concluido' : ''
            }`}
            onClick={alterarTreino}
          >
            {treinoConcluido
              ? 'Desmarcar treino'
              : 'Marcar como concluído'}
          </button>
        </article>


        
      </section>

      <article className="cartao cartao-dieta">
          <h2>Dieta</h2>

          <strong>
            {refeicoesConcluidas.length} / {refeicoes.length}
          </strong>

          <p>Refeições cumpridas hoje</p>

          <div className="lista-refeicoes">
            {refeicoes.map((refeicao) => {
              const concluida =
                refeicoesConcluidas.includes(refeicao)

              return (
                <button
                  type="button"
                  className={`botao-refeicao ${
                    concluida ? 'refeicao-concluida' : ''
                  }`}
                  key={refeicao}
                  onClick={() => alterarRefeicao(refeicao)}
                >
                  <span>{refeicao}</span>
                  <strong>{concluida ? 'Concluída' : 'Pendente'}</strong>
                </button>
              )
            })}
          </div>
        </article>

        {telaAtiva === 'rotina' && <Rotina />}

        
      <section
        className={
          telaAtiva === 'evolucao'
          ? 'historico'
          : 'historico tela-oculta'
        }
      >
  <div className="titulo-historico">
    <div>
      <p>Evolução</p>
      <h2>Histórico diário</h2>
    </div>

    <span>{historicoDiario.length} dias registrados</span>
  </div>

  {historicoDiario.length === 0 ? (
    <div className="historico-vazio">
      <p>O histórico aparecerá aqui após o primeiro dia completo.</p>
    </div>
  ) : (
    <div className="lista-historico">
      {[...historicoDiario].reverse().map((registro) => (
        <article className="registro-dia" key={registro.id}>
          <h3>{registro.data}</h3>

          <div className="dados-dia">
            <p>
              Água
              <strong>{registro.agua} L</strong>
            </p>

            <p>
              Estudos
              <strong>{registro.minutosEstudo} min</strong>
            </p>

            <p>
              Treino
              <strong>
                {registro.treinoConcluido
                  ? 'Concluído'
                  : 'Não realizado'}
              </strong>
            </p>

            <p>
              Dieta
              <strong>
                {registro.refeicoesConcluidas?.length || 0} / 4 refeicoes
              </strong>
            </p>
          </div>
        </article>
      ))}
    </div>
  )}
</section>

{telaAtiva === 'financas' && (
  <section className="tela-financas">
    <div>
      <p>Controle financeiro</p>
      <h2>Finanças</h2>
    </div>

    <article className="cartao">
      <strong>
        {totalGastos.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}
      </strong>

      <p>Gastos registrados</p>

      <form
        className="formulario-gastos"
        onSubmit={adicionarGasto}
      >
        <input
          type="text"
          placeholder="Descrição de gastos"
          value={descricaoGasto}
          onChange={(evento) =>
            setDescricaoGasto(evento.target.value)
          }
        />

        <input
          type="text"
          inputMode="decimal"
          placeholder="Valor de gasto"
          value={valorGasto}
          onChange={(evento) =>
            setValorGasto(evento.target.value)
          }
        />

        <button type="submit" calssName="botao-gasto">
          Adicionar gasto
        </button>
      </form>

      {gastos.length > 0 && (
        <ul className="lista-gastos">
          {gastos.map((gastos) => (
            <li key={gasto.id}>
              <div>
                <span>{gastos.descricao}</span>

                <strong>
                  {gasto.valor.toLocaleString('pt-BR',{
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>

              <button
                type="button"
                className="remove-gastos"
                onClick={() => removerGasto(gasto.id)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>

      )}

           {gastos.length > 0 && (
        <button
          type="button"
          className="botao-reset"
          onClick={zerarGastos}
        >
          Limpar todos os gastos
        </button>
      )}
    </article>
  </section>
)}
    

<section 
  className={
    telaAtiva === 'evolucao'
    ? 'historico'
    : 'historico tela-oculta'

  }
>
  <div className="titulo-historico">
    <div>
      <p>Evolução</p>
      <h2>Histórico diário</h2>
    </div>

    <span>
      {historicoDiario.length === 0 ? (
        <div className="historico-vazio">
          <p>
            O Histórico aparecerá aqui após o primeiro dia completo.
          </p>
        </div>
      ): (
        <div className="lista-historico">
          {[...historicoDiario]
          .reverse()
          .map((registro) => (
            <articles
              classname="registro-dia"
              key={registro.id}
            >
              <h3>{registro.data}</h3>

              <div className="dados-dia">
                <p>
                  Estudos 
                  <strong>
                    {registro.minutosEstudo} min
                  </strong>
                </p>

                <p>
                  Treino 
                  <strong>
                    {registro.treinoConcluido
                      ? 'Concuído'
                      :'Não realizado'}
                  </strong>
                </p>

                <p>
                  Dieta 
                  <strong>
                    {registro.refeicaoJaConcluidas?.length || 0}
                    {' '} / 4 refeições
                  </strong>
                </p>
              </div>
            </articles>
          ))}
        </div>
      )}
    </span>
  </div>
 
</section>

<Navegacao
  telaAtiva={telaAtiva}
  aoMudarTela={setTelaAtiva}
/>
    </main>
  )
}

export default App