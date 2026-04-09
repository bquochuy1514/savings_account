import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { SavingsTypeService } from './savings-type.service';
import { CreateSavingsTypeDto } from './dto/create-savings-type.dto';
import { UpdateSavingsTypeDto } from './dto/update-savings-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('savings-type')
export class SavingsTypeController {
  constructor(private readonly savingsTypeService: SavingsTypeService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ResponseMessage('Tạo loại tiết kiệm thành công!')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createSavingsType(@Body() createSavingsTypeDto: CreateSavingsTypeDto) {
    return this.savingsTypeService.handleCreateSavingsType(
      createSavingsTypeDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllSavingsType() {
    return this.savingsTypeService.handleFindAllSavingsType();
  }

  @Get('/active')
  @UseGuards(JwtAuthGuard)
  findAllActiveSavingsType() {
    return this.savingsTypeService.handleFindAllActiveSavingsType();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneSavingsType(@Param('id', ParseIntPipe) id: number) {
    return this.savingsTypeService.handleFindOneSavingsType(id);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateSavingsType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSavingsTypeDto: UpdateSavingsTypeDto,
  ) {
    return this.savingsTypeService.handleUpdateSavingsType(
      id,
      updateSavingsTypeDto,
    );
  }
}
