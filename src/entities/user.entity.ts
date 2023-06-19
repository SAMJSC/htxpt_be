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
    @Column({ nullable: false })
    id: string;

    @Column({ nullable: true })
    middleName?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    age?: number;

    @Column({ nullable: true })
    gender?: Gender;

    @Column({ nullable: true })
    userName: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    resetToken?: string;

    @Column({ nullable: true })
    firstName?: string;

    @Column({ nullable: false })
    lastName: string;

    @Column({ type: "enum", enum: UserRoles, default: UserRoles.USER })
    role: UserRoles;

    @Column({ unique: true, nullable: true })
    email?: string;

    @Column({ nullable: true })
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
