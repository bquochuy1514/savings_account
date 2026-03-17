import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import {
  comparePassword,
  hashPassword,
} from 'src/common/utils/hash-password.util';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async handleRegister(registerDto: RegisterDto) {
    // 1. Check existing user
    const existingUser = await this.usersService.findUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException(
        'This email address already exists in the system. Please log in or choose a different email address.',
      );
    }

    // 2. Hash Password
    const hashedPassword = await hashPassword(registerDto.password);

    // 3. Create new user
    const newUser = await this.usersService.createUser({
      email: registerDto.email,
      fullname: registerDto.fullName,
      password: hashedPassword,
    });

    return newUser;
  }

  async validateUser(loginDto: LoginDto) {
    const existingUser = await this.usersService.findUserByEmail(
      loginDto.email,
    );

    if (!existingUser)
      throw new UnauthorizedException('Invalid email or password');

    const isPasswordMatch = await comparePassword(
      loginDto.password,
      existingUser.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, hashedRefreshToken, ...user } = existingUser;

    return user;
  }

  async handleLogin(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    const { access_token, refresh_token } = await this.generateTokens(user);
    const hashedRefreshToken = await argon2.hash(refresh_token);

    await this.usersService.updateHashedRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    return {
      // user_id: user.id,
      user,
      access_token,
      refresh_token,
    };
  }

  async handleRefreshToken(user: any) {
    const { access_token, refresh_token } = await this.generateTokens(user);

    const hashedRefreshToken = await argon2.hash(refresh_token);

    await this.usersService.updateHashedRefreshToken(
      user.id,
      hashedRefreshToken,
    );

    return {
      user_id: user.id,
      access_token,
      refresh_token,
    };
  }

  async generateTokens(user: any) {
    // return user;
    const payload = { id: user.id, email: user.email, role: user.role };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async validateRefreshToken(user: any, refreshToken: string) {
    const userDB = await this.usersService.findUserByEmail(user.email);
    if (!userDB || !userDB.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      userDB.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return user;
  }

  async handleLogout(user: any) {
    const userDB = await this.usersService.findUserByEmail(user.email);
    if (!userDB) throw new BadRequestException();

    if (!userDB.hashedRefreshToken)
      throw new BadRequestException('Internal Server Error');

    await this.usersService.updateHashedRefreshToken(userDB.id, null);
  }
}
