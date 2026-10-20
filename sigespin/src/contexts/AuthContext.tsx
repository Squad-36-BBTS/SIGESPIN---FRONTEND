import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  matricula: string
  role: string
  department: string
  initials: string
}

export const DEMO_PROFILES: Record<string, User> = {
  admin: {
    id: 'user-admin',
    name: 'Abraão Freitas',
    email: 'abraao.freitas@bbts.com.br',
    matricula: 'F7389102',
    role: 'Administrador do Sistema',
    department: 'BBTS · Diretoria de Inovação e Tecnologia',
    initials: 'AF',
  },
  gestor: {
    id: 'user-gestor',
    name: 'Carolina Vasconcelos',
    email: 'carolina.vasconcelos@bbts.com.br',
    matricula: 'F6241908',
    role: 'Gestora de Portfólio de Inovação',
    department: 'BBTS · Gerência de Inovação Aberta',
    initials: 'CV',
  },
  pmo: {
    id: 'user-pmo',
    name: 'Rodrigo Medeiros',
    email: 'rodrigo.medeiros@bbts.com.br',
    matricula: 'F4910283',
    role: 'Avaliador & PMO',
    department: 'BBTS · Escritório de Governança',
    initials: 'RM',
  },
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>
  quickLogin: (profileKey: 'admin' | 'gestor' | 'pmo') => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'sigespin_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Para uma primeira experiência amigável caso não esteja logado:
        // Mantemos deslogado para exibir a tela de login
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (
    identifier: string,
    password: string,
    remember: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulação de latência de autenticação de rede corporativa
    await new Promise((resolve) => setTimeout(resolve, 600))

    const cleanId = identifier.trim().toLowerCase()

    if (!cleanId) {
      setIsLoading(false)
      return { success: false, error: 'Informe a Chave F ou e-mail institucional.' }
    }

    if (!password || password.length < 4) {
      setIsLoading(false)
      return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' }
    }

    // Verifica se corresponde a um dos perfis pré-definidos
    let matchedProfile: User | undefined

    if (cleanId.includes('carolina') || cleanId === 'f6241908' || cleanId.includes('gestor')) {
      matchedProfile = DEMO_PROFILES.gestor
    } else if (cleanId.includes('rodrigo') || cleanId === 'f4910283' || cleanId.includes('pmo')) {
      matchedProfile = DEMO_PROFILES.pmo
    } else if (cleanId.includes('abraao') || cleanId.includes('admin') || cleanId === 'f7389102') {
      matchedProfile = DEMO_PROFILES.admin
    } else {
      // Aceita qualquer credencial de teste corporativa e gera o perfil do usuário
      const extractedName = cleanId.split('@')[0].replace(/[._-]/g, ' ')
      const capitalized = extractedName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      const initials = capitalized
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'BB'

      matchedProfile = {
        id: `user-${Date.now()}`,
        name: capitalized || 'Colaborador BBTS',
        email: cleanId.includes('@') ? cleanId : `${cleanId}@bbts.com.br`,
        matricula: cleanId.startsWith('f') ? cleanId.toUpperCase() : 'F8849201',
        role: 'Colaborador / Analista',
        department: 'BBTS · Tecnologia da Informação',
        initials,
      }
    }

    setUser(matchedProfile)

    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedProfile))
      sessionStorage.removeItem(STORAGE_KEY)
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(matchedProfile))
      localStorage.removeItem(STORAGE_KEY)
    }

    setIsLoading(false)
    return { success: true }
  }

  const quickLogin = async (profileKey: 'admin' | 'gestor' | 'pmo') => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const profile = DEMO_PROFILES[profileKey]
    setUser(profile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}

