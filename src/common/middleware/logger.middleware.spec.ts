/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let logger: Logger;

  const mockLogger = {
    info: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerMiddleware,
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log the request', () => {
    const req = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest' },
    } as Request;

    let finishCallback: Function | undefined;

    const res = {
      statusCode: 200,
      on: jest.fn((event: string, callback: Function) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      }),
    } as unknown as Response;

    const next: NextFunction = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    if (finishCallback) {
      finishCallback();
    }

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'HTTP Request',
        method: 'GET',
        url: '/test',
        statusCode: 200,
        ip: '127.0.0.1',
        userAgent: 'Jest',
      }),
    );
  });
});
