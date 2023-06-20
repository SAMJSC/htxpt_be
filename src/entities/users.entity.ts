import { Gender, UserRoles } from "@constants/common.constants";
import { ETableName } from "@constants/entity.constants";
import { DeviceSessionEntity } from "@entities/devices-session.entity";
import { UserDto, UserDtoOptions } from "@modules/user/dto/user.dto";
import { AbstractEntity, IAbstractEntity } from "common/abstract.entity";
import { VirtualColumn } from "decorators/virtual-column.decorator";
import { Column, Entity, OneToMany } from "typeorm";

export interface IUserEntity extends IAbstractEntity<UserDto> {
    email?: string;
    phone?: string;
    firstName?: string;
    middleName?: string;
    lastName: string;
    fullName?: string;
    role: UserRoles;
    address?: string;
    age?: number;
    gender?: Gender;
    dateOfBirth?: Date;
    avatar?: string;
}

@Entity({ name: ETableName.USER })
export class UserEntity
    extends AbstractEntity<UserDto, UserDtoOptions>
    implements IUserEntity
{
    @Column({ name: "middle_name", nullable: true })
    middleName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    age?: number;

    @Column({ nullable: true })
    gender?: Gender;

    @Column({ name: "user_name", nullable: true })
    userName: string;

    @Column({ nullable: true })
    password: string;

    @Column({ name: "reset_token", nullable: true })
    resetToken?: string;

    @Column({ name: "first_name", nullable: true })
    firstName?: string;

    @Column({ name: "last_name", nullable: false })
    lastName: string;

    @Column({ type: "enum", enum: UserRoles, default: UserRoles.USER })
    role: UserRoles;

    @Column({ unique: true, nullable: true })
    email?: string;

    @Column({ name: "date_of_birth", nullable: true })
    dateOfBirth?: Date;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    avatar?: string;

    @VirtualColumn()
    fullName?: string;

    @OneToMany(() => DeviceSessionEntity, (deviceSession) => deviceSession.user)
    deviceSessions: DeviceSessionEntity[];
}
