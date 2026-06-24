import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

const uploadsPath = join(process.cwd(), 'uploads', 'products');

if (!existsSync(uploadsPath)) {
  mkdirSync(uploadsPath, { recursive: true });
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('products')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsPath,
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('Solo se permiten imágenes.'),
            false,
          );
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen.');
    }

    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    return {
      filename: file.filename,
      url: `${apiUrl}/uploads/products/${file.filename}`,
    };
  }
}
