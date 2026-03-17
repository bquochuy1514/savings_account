import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateSavingsTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  termMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minWithdrawDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minInitDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAddDeposit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
