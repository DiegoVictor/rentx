import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ResetUserPasswordUseCase from './ResetUserPasswordUseCase';

class ResetUserPasswordController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { token: refresh_token } = request.query;
    const { password } = request.body;

    const resetUserPasswordUseCase = container.resolve(
      ResetUserPasswordUseCase
    );
    await resetUserPasswordUseCase.execute({
      refresh_token: String(refresh_token),
      password,
    });

    return response.sendStatus(204);
  }
}

export default ResetUserPasswordController;
