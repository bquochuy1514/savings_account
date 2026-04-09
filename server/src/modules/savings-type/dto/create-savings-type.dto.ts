import { IsBoolean, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateSavingsTypeDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  termMonths: number;

  @IsNumber()
  @Min(0)
  interestRate: number;

  @IsInt()
  @Min(0)
  minWithdrawDays: number;

  @IsNumber()
  @Min(0)
  minInitDeposit: number;

  @IsNumber()
  @Min(0)
  minAddDeposit: number;

  @IsBoolean()
  isActive: boolean;
}
