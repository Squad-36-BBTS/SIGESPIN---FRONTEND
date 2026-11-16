import axios, { AxiosError } from 'axios';

import { ApiError, type ApiErrorResponse } from '@/types/api';

export const TOKEN_KEY = '@SIGES_PIN:token';
export const USUARIO_KEY = '@SIGES_PIN:usuario';

// Enquanto o back-end não expõe as rotas, os serviços usam o banco em memória
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// Injeta o JWT salvo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Converte qualquer erro para ApiError e trata sessão expirada (401)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login?expirado=true';
    }

    if (body?.codigo) return Promise.reject(new ApiError(status, body.codigo, body.mensagem, body.detalhes));
    if (error.code === 'ECONNABORTED') return Promise.reject(new ApiError(0, 'TIMEOUT', 'O servidor demorou para responder.'));
    if (!error.response) return Promise.reject(new ApiError(0, 'SEM_CONEXAO', 'Não foi possível conectar ao servidor.'));
    return Promise.reject(new ApiError(status, 'ERRO_INESPERADO', 'Ocorreu um erro inesperado.'));
  },
);

export function mensagemErro(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 403) return 'Seu perfil não tem permissão para esta ação.';
    if (e.status === 409) return 'Outra pessoa alterou estes dados. Recarregamos as informações.';
    return e.message;
  }
  return 'Ocorreu um erro inesperado.';
}
