import { IsNotEmpty, IsString } from 'class-validator';

export class FindCustomerByIdNumberDto {
  @IsString({ message: 'Căn cước công dân phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Căn cước công dân không được để trống' })
  idNumber: string;
}
