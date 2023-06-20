import { DeviceSessionEntity } from "@entities/devices-session.entity";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AbstractDto } from "common/dtos/abstract.dto";

export type DeviceSessionDtoOptional = Partial<{
    name: string;
}>;

export class DeviceSessionDto extends AbstractDto {
    @ApiPropertyOptional()
    deviceId: string;

    @ApiPropertyOptional()
    name?: string;

    @ApiPropertyOptional()
    ua: string;

    @ApiPropertyOptional()
    refreshToken: string;

    @ApiPropertyOptional()
    expiredAt: Date;

    @ApiPropertyOptional()
    ipAddress: string;

    @ApiPropertyOptional()
    userId: string;

    constructor(
        deviceSession: DeviceSessionEntity,
        options?: DeviceSessionDtoOptional
    ) {
        super(deviceSession);
        this.deviceId = deviceSession.deviceId;
        this.ipAddress = deviceSession.ipAddress;
        this.ua = deviceSession.ua;
        this.userId = deviceSession.userId;
        this.name = options?.name;
    }
}
