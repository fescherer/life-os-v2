'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

let hasInitializedFirstSteps = false

export function FirstStepsComponent() {
  useEffect(() => {
    async function run() {
      if (hasInitializedFirstSteps) {
        return
      }

      hasInitializedFirstSteps = true

      try {
        await fetch('/api/selects/ensure', {
          method: 'POST',
        }).then(async (res) => {
          const responseBody = await res.json().catch(() => null)

          if (!res.ok) {
            throw new Error(responseBody?.message ?? 'Erro ao configurar conta')
          }

          return responseBody
        })

        toast.success('Bem-vindo')
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error ? error.message : 'Erro ao carregar os dados'
        )

        fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level: 'error',
            context: 'FirstStepsComponent.ensureSelectsCreation',
            message:
              error instanceof Error ? error.message : 'Erro desconhecido',
            metadata: error,
          }),
        })
      }
    }

    run()
  }, [])

  return null
}
