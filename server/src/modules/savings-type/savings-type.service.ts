import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSavingsTypeDto } from './dto/create-savings-type.dto';
import { UpdateSavingsTypeDto } from './dto/update-savings-type.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SavingsTypeService {
  constructor(private prisma: PrismaService) {}
  async handleCreateSavingsType(dto: CreateSavingsTypeDto) {
    const existing = await this.prisma.savingsType.findFirst({
      where: { termMonths: dto.termMonths, isActive: true },
    });

    if (existing) {
      if (existing.termMonths === 0)
        throw new ConflictException(`Đã tồn tại loại tiết kiệm không kỳ hạn`);
      else
        throw new ConflictException(
          `Đã tồn tại loại tiết kiệm với kỳ hạn ${dto.termMonths} tháng`,
        );
    }

    return this.prisma.savingsType.create({ data: dto });
  }

  findAll() {
    return `This action returns all savingsType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savingsType`;
  }

  update(id: number, updateSavingsTypeDto: UpdateSavingsTypeDto) {
    return `This action updates a #${id} savingsType`;
  }

  remove(id: number) {
    return `This action removes a #${id} savingsType`;
  }
}
