function Navegacao({ telaAtiva, aoMudarTela }) {
  const itens = [
    { id: 'hoje', nome: 'Hoje' },
    { id: 'rotina', nome: 'Rotina' },
    { id: 'financas', nome: 'Finanças' },
    { id: 'evolucao', nome: 'Evolução' },
  ]

  return (
    <nav className="navegacao-mobile">
      {itens.map((item) => (
        <button
          type="button"
          className={
            telaAtiva === item.id
              ? 'item-navegacao ativo'
              : 'item-navegacao'
          }
          key={item.id}
          onClick={() => aoMudarTela(item.id)}
        >

          <span>{item.nome}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navegacao