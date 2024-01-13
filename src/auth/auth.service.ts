import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { User, Bookmark } from '@prisma/client'

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
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

    // send back the user
    delete user.hash;
    return user;
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
