import { Controller, Get, Header } from '@nestjs/common';
import { MenuService } from '../application/menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  getPublicMenu() {
    return this.menuService.getPublicMenu();
  }
}
