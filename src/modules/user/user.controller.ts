import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { RolesGuard } from "@guards/roles.guard";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { GetUsersQueryReqDto } from "@modules/user/dto/user-request.dto";

@Controller("users")
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    getUsers(@Query() options: GetUsersQueryReqDto) {
        return this.userService.getUser(options);
    }
}
