import { AbstractDto } from "common/dtos/abstract.dto";
import { Constructor } from "type";
import {
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

export interface IAbstractEntity<DTO extends AbstractDto, O = never> {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    toDto(options?: O): DTO;
}

export abstract class AbstractEntity<
    DTO extends AbstractDto = AbstractDto,
    O = never
> implements IAbstractEntity<DTO, O>
{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn({
        name: "created_at",
        type: "timestamp",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
        type: "timestamp",
    })
    updatedAt: Date;

    private dtoClass?: Constructor<DTO, [AbstractEntity, O?]>;

    toDto(options?: O): DTO {
        const { dtoClass } = this;
        if (!dtoClass) {
            throw new Error(
                `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`
            );
        }

        return new dtoClass(this, options);
    }
}
