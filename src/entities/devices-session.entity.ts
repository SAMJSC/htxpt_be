import { ETableName } from "@constants/entity.constants";
import { UserEntity } from "@entities/users.entity";
import {
    DeviceSessionDto,
    DeviceSessionDtoOptional as DeviceSessionDtoOptions,
} from "@modules/auth/dto/Session.dto";
import { AbstractEntity, IAbstractEntity } from "common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

export interface IDeviceSessionEntity
    extends IAbstractEntity<DeviceSessionDto> {
    deviceId: string;
    name?: string;
    ua: string;
    refreshToken: string;
    expiredAt: Date;
    ipAddress: string;
    userId: string;
}

@Entity({ name: ETableName.DEVICE_SESSION })
export class DeviceSessionEntity
    extends AbstractEntity<DeviceSessionDto, DeviceSessionDtoOptions>
    implements IDeviceSessionEntity
{
    @Column({ name: "device_id" })
    deviceId: string;

    @Column({ nullable: true })
    name: string;

    @Column()
    ua: string;

    @Column({ name: "refresh_token", type: "longtext" })
    refreshToken: string;

    @Column({ name: "expired_at" })
    expiredAt: Date;

    @Column({ name: "ip_address" })
    ipAddress: string;

    @Column({ name: "user_id" })
    userId: string;

    @ManyToOne(() => UserEntity, (user) => user.deviceSessions, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user: UserEntity;
}
