import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { GetUsersQueryReqDto } from "@modules/user/dto/user-request.dto";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { UserService } from "./user.service";

@Controller("users")
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    getUsers(@Query() options: GetUsersQueryReqDto) {
        return this.userService.getUser(options);
    }
}
