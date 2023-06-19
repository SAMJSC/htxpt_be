import { ApiProperty } from "@nestjs/swagger";
import { AbstractEntity } from "common/abstract.entity";

export class AbstractDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(
        entity: AbstractEntity,
        options?: {
            excludeFile?: boolean;
        }
    ) {
        if (!options?.excludeFile) {
            this.id = entity.id;
            this.createdAt = entity.createdAt;
            this.updatedAt = entity.updatedAt;
        }
    }
}
