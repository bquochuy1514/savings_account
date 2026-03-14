import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingsTypeDto } from './create-savings-type.dto';

export class UpdateSavingsTypeDto extends PartialType(CreateSavingsTypeDto) {}

// export class UpdateSavingsTypeDto {
//   @IsOptional()
//   @IsString()
//   name?: string;

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   interestRate?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   overdueRate?: number;

//   @IsOptional()
//   @IsInt()
//   @Min(0)
//   minWithdrawDays?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   minInitDeposit?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   minAddDeposit?: number;

//   @IsOptional()
//   @IsBoolean()
//   isActive?: boolean;
// }
