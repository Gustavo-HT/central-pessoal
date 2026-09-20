import { useState} from 'react'
import { supabase} from '../lib/supabaseClient'

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mensagem, setMensagem] = useState('')
    const [carregando, setCarregando] = useState(false)

    async function entrar(evento) {
        evento.preventDefaut()
        setCarregando(true)
        setMensagem('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })

        if (error) {
            setMensagem('Erro: ${error.message}')
        } else {
            setMensagem('Login realizado com sucesso!')
        }

        setCarregando(false)
    }

    async function cadastrar() {
        setCarregando(true)
        setMensagem('')

        const { error } = await supabase.auth.signUp({
            email,
            password: senha,
        })

        if (error) {
            setMensagem('Erro: ${error.message}')
        } else {
            setMensagem('Cadastro realizado! Verifique seu e-mail.')
        }

        setCarregando(false)
    }

    return (
        <main className="login-container">
            <form className="login-card" onSubmit={entrar}>
                <h1>Central Pessoal</h1>
                <p>Entre para acessar seus dados</p>

                <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(evento) => setSenha(evento.target.value)} 
                    required
                />


                <input
                    type="password"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(evento) => setSenha(evento.target.value)}
                    mainLength="6"
                    required
                />


                <button type="submit" disabled={cadastrar}>
                    {carregando ? 'Aguarde...' : 'Entrar'}
                </button>


                <button type="button" onClick={cadastrar} disabled={carregando}>
                    Criar conta
                </button>


                {mensagem && <p>{mensagem}</p>}
            </form>
        </main>
    )
}

export default Login