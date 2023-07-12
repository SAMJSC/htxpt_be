import { BaseSchema } from "@shared/base.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { BaseServiceInterface } from "services/base.interface.service";
import { FindAllResponse } from "types/common.type";

export abstract class BaseServiceAbstract<T extends BaseSchema>
    implements BaseServiceInterface<T>
{
    constructor(private readonly repository: BaseRepositoryInterface<T>) {}

    async create(create_dto: T | any): Promise<T> {
        return await this.repository.create(create_dto);
    }

    async findAll(
        filter?: object,
        options?: object
    ): Promise<FindAllResponse<T>> {
        return await this.repository.findAll(filter, options);
    }
    async findOne(id: string) {
        return await this.repository.findOneById(id);
    }

    async findOneByCondition(filter: Partial<T>) {
        return await this.repository.findOneByCondition(filter);
    }

    async update(id: string, update_dto: Partial<T>) {
        return await this.repository.update(id, update_dto);
    }

    async remove(id: string) {
        return await this.repository.softDelete(id);
    }

    async delete(id: string) {
        return await this.repository.permanentlyDelete(id);
    }
}
