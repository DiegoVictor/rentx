import { Request, Response } from 'express';
import { container } from 'tsyringe';

import UploadCarImageUseCase from './UploadCarImagesUseCase';

interface IFile {
  filename: string;
}

class UploadCarImagesController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const images = request.files as IFile[];

    const uploadCarImageUseCase = container.resolve(UploadCarImageUseCase);

    await uploadCarImageUseCase.execute({
      car_id: id,
      images_name: images.map((file) => file.filename),
    });

    return response.sendStatus(201);
  }
}

export default UploadCarImagesController;
