import { ApiProperty } from "@nestjs/swagger";
import { BasePaginationRequestDto } from "@shared/base-request.dto";
import { Transform } from "class-transformer";
import { transformQuery } from "utils/transform-query";

export class GetUsersQueryReqDto extends BasePaginationRequestDto {
    @ApiProperty({ required: false })
    @Transform(({ value }: { value: string }) => transformQuery(value))
    email: string;
}
