import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class BasePaginationRequestDto {
    @ApiProperty({ required: false })
    @Min(1)
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit: number;

    @ApiProperty({ required: false })
    @Min(1)
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number;
}

export class BasePaginationResponseDto<T = any> {
    @ApiProperty() total: number;
    data: T[];

    static convertToPaginationResponse<T = any>(
        data: [any[], number],
        currentPage?: number
    ) {
        return {
            data: data[0],
            total: data[1],
            currentPage,
        } as BasePaginationResponseDto<T>;
    }
}
