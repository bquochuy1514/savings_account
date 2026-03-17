import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
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
  @Roles(UserRole.MANAGER)
  @ResponseMessage('Tạo loại tiết kiệm thành công!')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createSavingsType(@Body() createSavingsTypeDto: CreateSavingsTypeDto) {
    return this.savingsTypeService.handleCreateSavingsType(
      createSavingsTypeDto,
    );
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllSavingsType() {
    return this.savingsTypeService.handleFindAllSavingsType();
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOneSavingsType(@Param('id') id: number) {
    return this.savingsTypeService.handleFindOneSavingsType(id);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateSavingsType(
    @Param('id') id: number,
    @Body() updateSavingsTypeDto: UpdateSavingsTypeDto,
  ) {
    return this.savingsTypeService.handleUpdateSavingsType(
      id,
      updateSavingsTypeDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteSavingsType(@Param('id') id: number) {
    return this.savingsTypeService.handleDeleteSavingsType(id);
  }
}
