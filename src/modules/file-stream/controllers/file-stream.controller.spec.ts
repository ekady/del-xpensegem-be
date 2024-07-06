import { Test, TestingModule } from '@nestjs/testing';

import { FileStreamController } from './file-stream.controller';

describe('FileStreamController', () => {
  let controller: FileStreamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStreamController],
    }).compile();

    controller = module.get<FileStreamController>(FileStreamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
