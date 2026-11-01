export interface ApiErrorResponse {
  status: number;
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, string> | string[];
  timestamp: string;
}

export class ApiError extends Error {
  status: number;
  codigo: string;
  detalhes?: ApiErrorResponse['detalhes'];

  constructor(status: number, codigo: string, mensagem: string, detalhes?: ApiErrorResponse['detalhes']) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}
