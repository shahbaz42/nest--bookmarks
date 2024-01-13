import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { User } from '@prisma/client'
import { JwtGuard } from '../auth/guard'
import { GetUser } from 'src/auth/decorator';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
    // @UseGuards(JwtGuard)
    @Get('/me')
    getMe(@GetUser('') user: User /*, @GetUser('email') email: string */) {
        // console.log(email)
        return user
    }
    
}
