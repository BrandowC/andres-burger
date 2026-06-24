import { Module } from '@nestjs/common';
import { UploadsController } from './presentation/uploads.controller';

@Module({
  controllers: [UploadsController],
})
export class UploadsModule {}
