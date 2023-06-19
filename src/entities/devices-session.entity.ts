import { UserEntity } from "@entities/user.entity";
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class DeviceSessionEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @Column({
        name: "create_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt: Date;

    @UpdateDateColumn({ name: "update_at" })
    updatedAt: Date;

    @Column({ name: "user_id" })
    userId: string;

    @ManyToOne(() => UserEntity, (user) => user.deviceSessions, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user: UserEntity;
}
