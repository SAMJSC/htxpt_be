import { Controller, Get } from "@nestjs/common";
import {
    HealthCheck,
    HealthCheckService,
    MongooseHealthIndicator,
} from "@nestjs/terminus";

@Controller("health-check")
export class HealthCheckerController {
    constructor(
        private health: HealthCheckService,
        private mongoose: MongooseHealthIndicator
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            async () => this.mongoose.pingCheck("mongoose", { timeout: 1500 }),
        ]);
    }
}
