import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const RawBody = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.rawBody)
      throw new InternalServerErrorException({
        cause: 'Raw parser was not supplied',
      });

    return request.rawBody;
  },
);
