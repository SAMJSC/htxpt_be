import { UserEntity } from "@entities/users.entity";
import { GetUsersQueryReqDto } from "@modules/user/dto/user-request.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasePaginationResponseDto } from "@shared/base-request.dto";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}
    async getUser(options: GetUsersQueryReqDto) {
        const data = await this.userRepository
            .createQueryBuilder("user")
            .getManyAndCount();

        return BasePaginationResponseDto.convertToPaginationResponse(
            data,
            options.page || 1
        );
    }
}
