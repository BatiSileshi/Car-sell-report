import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(email: string, password: string){
        // see if email is in use
        const users = await this.usersService.find(email);
        if (users.length){
            throw new BadRequestException('Email already exists.')
        }

        // hash user password
        // 1. Generate salt
        const salt = randomBytes(8).toString('hex');

        // 2. hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        // 3.join the hashed result and the salt
        const result = salt + '.' + hash.toString('hex');

        // create a new user and return
        const user = await this.usersService.create(email, result);
        // return user
        return user;

    }

    async signin(email: string, password: string){
        const [user] = await this.usersService.find(email);
        if (!user){
            throw new NotFoundException('User with this email not found.')
        }

        const [salt, StoredHash] = user.password.split('.');

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (StoredHash !== hash.toString('hex')){
            throw new BadRequestException('Incorrect password');
        } 
        return user;

    }
}