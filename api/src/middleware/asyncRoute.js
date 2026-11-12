// Encaminha rejeições de controllers assíncronos ao middleware central de erros do Express.
export const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
