import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
// import { User, Bookmark } from '@prisma/client'

@Injectable({})
export class AuthService{
    constructor(private prisma: PrismaService){}
    signin(){
        return {
            msg : "I have  signed in."
        }
    }

    async signup(dto: AuthDto){
        // generate the password hash
        const hash = await argon.hash(dto.password);

        // save the new user in the db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash: hash 
                },
            });
            delete user.hash;
            return user;
        } catch (error) {
            if ( error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Email already exists.')
                }
            }
        }
    }
}