import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//création d'un decorateur maison (magie noire)
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
