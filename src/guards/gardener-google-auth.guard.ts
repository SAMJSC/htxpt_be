import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GardenerGoogleAuthGuard extends AuthGuard("google") {
    canActivate(context: ExecutionContext): any {
        const request = context.switchToHttp().getRequest();
        request.session.role = "gardener";
        return super.canActivate(context);
    }
}
