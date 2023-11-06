import { AdminService } from "@modules/admin/admin.service";
import { Controller } from "@nestjs/common";

@Controller("admin")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
}
