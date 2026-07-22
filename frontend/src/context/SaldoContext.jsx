import { createContext, useContext, useState } from 'react'
import { obtenerSaldoCliente } from '../api/usuarios'

const SaldoContext = createContext(null)

export function SaldoProvider({ children }) {
    const [saldo, setSaldo] = useState(null)

    async function refrescarSaldo() {
        try {
            const respuesta =  await obtenerSaldoCliente()
            const saldoNuevo = respuesta.data.saldo
            setSaldo(saldoNuevo)

        } catch (error) {
            setSaldo(0)

        }
    }

    const valorDelContexto = {
        saldo,
        refrescarSaldo,
    }

    return (
        <SaldoContext.Provider value={valorDelContexto}>
            {children}
        </SaldoContext.Provider>
    )

}
export function useSaldo() {
    return useContext(SaldoContext)
}