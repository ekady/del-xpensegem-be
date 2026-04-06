import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { LoggerService } from '@/common/logger/services/logger.service';
import { ILoggerLog } from '@/common/logger/interfaces/logger.interface';

describe('LoggerService', () => {
  let service: LoggerService;

  const mockWinstonLogger = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockWinstonLogger,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const requestId = 'req-123';
  const log: ILoggerLog = {
    description: 'Test log message',
    class: 'TestClass',
    function: 'testMethod',
    path: '/test',
    userEmail: 'test@example.com',
  };
  const data = { key: 'value' };

  describe('info', () => {
    it('should log info message', () => {
      service.info(requestId, log, data);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(log.description, {
        _id: requestId,
        class: log.class,
        function: log.function,
        path: log.path,
        userEmail: log.userEmail,
        data,
      });
    });

    it('should log info message without data', () => {
      service.info(requestId, log);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(log.description, {
        _id: requestId,
        class: log.class,
        function: log.function,
        path: log.path,
        userEmail: log.userEmail,
        data: undefined,
      });
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      service.debug(requestId, log, data);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(log.description, {
        _id: requestId,
        class: log.class,
        function: log.function,
        path: log.path,
        userEmail: log.userEmail,
        data,
      });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      service.warn(requestId, log, data);

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(log.description, {
        _id: requestId,
        class: log.class,
        function: log.function,
        path: log.path,
        userEmail: log.userEmail,
        data,
      });
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      service.error(requestId, log, data);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(log.description, {
        _id: requestId,
        class: log.class,
        function: log.function,
        path: log.path,
        userEmail: log.userEmail,
        data,
      });
    });
  });
});
