import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  @Roles(UserRole.STAFF)
  @ResponseMessage('Tạo loại tiết kiệm thành công!')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createSavingsType(@Body() createSavingsTypeDto: CreateSavingsTypeDto) {
    return this.savingsTypeService.handleCreateSavingsType(
      createSavingsTypeDto,
    );
  }

  @Get()
  findAll() {
    return this.savingsTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingsTypeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavingsTypeDto: UpdateSavingsTypeDto,
  ) {
    return this.savingsTypeService.update(+id, updateSavingsTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsTypeService.remove(+id);
  }
}
