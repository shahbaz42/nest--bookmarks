import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { User, Bookmark } from '@prisma/client'

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const access_token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: this.config.get('JWT_SECRET'),
      },
    );

    return {
      access_token: access_token,
    };
  }

  async signin(dto: AuthDto) {
    // find email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    // email doesn't exist throw exception
    if (!user)
      throw new ForbiddenException(
        'Email not registered.',
      );

    // compare password if incorrect throw exception
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );
    if (!pwMatches)
      throw new ForbiddenException(
        'Incorrect password.',
      );

    // send token
    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon.hash(dto.password);

    // save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Email already exists.',
          );
        }
      }
    }
  }
}
