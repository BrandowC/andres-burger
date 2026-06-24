import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';

type RequestWithUser = Request & {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    businessId: string;
    businessSlug: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: RequestWithUser) {
    return this.authService.me(request.user.id);
  }
}
