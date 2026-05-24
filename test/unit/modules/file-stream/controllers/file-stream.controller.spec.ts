import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';

import { FileStreamController } from '@/modules/file-stream/controllers/file-stream.controller';
import { FileStreamService } from '@/modules/file-stream/services/file-stream.service';

describe('FileStreamController', () => {
  let controller: FileStreamController;
  let service: FileStreamService;

  const mockFileStreamService = {
    getFileStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStreamController],
      providers: [
        {
          provide: FileStreamService,
          useValue: mockFileStreamService,
        },
      ],
    }).compile();

    controller = module.get<FileStreamController>(FileStreamController);
    service = module.get<FileStreamService>(FileStreamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFileStream', () => {
    it('should return a streamable file', async () => {
      const key = 'private/profile/picture.png';
      const mockStreamableFile = {} as StreamableFile;

      mockFileStreamService.getFileStream.mockResolvedValue(mockStreamableFile);

      const result = await controller.getFileStream(key);

      expect(service.getFileStream).toHaveBeenCalledWith(key);
      expect(result).toEqual(mockStreamableFile);
    });

    it('should propagate errors from service', async () => {
      const key = 'non-existent.png';

      mockFileStreamService.getFileStream.mockRejectedValue(
        new Error('File not found'),
      );

      await expect(controller.getFileStream(key)).rejects.toThrow(
        'File not found',
      );
    });
  });
});
