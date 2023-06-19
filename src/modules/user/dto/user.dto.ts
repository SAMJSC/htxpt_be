import { UserRoles } from "@constants/common.constants";
import { UserEntity } from "@entities/user.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AbstractDto } from "common/dtos/abstract.dto";

export type UserDtoOptions = Partial<{
    isActive: boolean;
    resetToken: string;
    avatar: string;
    lastName: string;
    firstName: string;
}>;

export class UserDto extends AbstractDto {
    @ApiPropertyOptional()
    firstName?: string;

    @ApiPropertyOptional()
    middleName?: string;

    @ApiPropertyOptional()
    lastName?: string;

    @ApiProperty()
    userName: string;

    @ApiPropertyOptional()
    password?: string;

    @ApiPropertyOptional({ enum: UserRoles })
    role: UserRoles;

    @ApiPropertyOptional()
    email?: string;

    @ApiPropertyOptional()
    avatar?: string;

    @ApiPropertyOptional()
    phone?: string;

    @ApiPropertyOptional()
    isActive?: boolean;

    @ApiPropertyOptional()
    resetToken?: string;

    constructor(user: UserEntity, options?: UserDtoOptions) {
        super(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.createdAt = user.createdAt;
        this.userName = user.userName;
        this.password = user.password;
        this.middleName = user.middleName;
        this.phone = user.phone;
        this.resetToken = options?.resetToken;
        this.avatar = options?.avatar;
        this.role = user.role;
        this.email = user.email;
        this.isActive = options?.isActive;
    }
}
