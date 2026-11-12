// Erros esperados carregam status HTTP sem expor detalhes internos ao cliente.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
