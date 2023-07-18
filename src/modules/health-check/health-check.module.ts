import { HealthCheckerController } from "@modules/health-check/health-check.controller";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

@Module({
    imports: [TerminusModule],
    controllers: [HealthCheckerController],
})
export class HealthCheckModule {}
