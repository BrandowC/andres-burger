import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdditionsService } from '../application/additions.service';
import { CreateAdditionDto } from './dto/create-addition.dto';
import { UpdateAdditionDto } from './dto/update-addition.dto';

@UseGuards(JwtAuthGuard)
@Controller('additions')
export class AdditionsController {
  constructor(private readonly additionsService: AdditionsService) {}

  @Get()
  findAll() {
    return this.additionsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAdditionDto) {
    return this.additionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdditionDto) {
    return this.additionsService.update(id, dto);
  }
}
