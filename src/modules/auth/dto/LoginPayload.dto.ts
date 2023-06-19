import { TokenPayloadDto } from "@modules/auth/dto/TokenPayload.dto";
import { UserDto } from "@modules/user/dto/user.dto";
import { ApiProperty } from "@nestjs/swagger";

export class LoginPayloadDto {
    @ApiProperty({ type: UserDto })
    user: UserDto;

    @ApiProperty({ type: TokenPayloadDto })
    token: TokenPayloadDto;

    constructor(user: UserDto, token: TokenPayloadDto) {
        this.user = user;
        this.token = token;
    }
}
