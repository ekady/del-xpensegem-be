import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';

import { FileStreamService } from '@/modules/file-stream/services/file-stream.service';
import { AwsS3Service } from '@/common/aws/services/aws.s3.service';

describe('FileStreamService', () => {
  let service: FileStreamService;

  const mockAwsS3Service = {
    getItemInBucket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStreamService,
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
      ],
    }).compile();

    service = module.get<FileStreamService>(FileStreamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFileStream', () => {
    it('should return a StreamableFile from S3', async () => {
      const filepath = 'private/profile/picture.png';
      const mockFile = {
        Body: Buffer.from('file-content'),
        ContentType: 'image/png',
      };

      mockAwsS3Service.getItemInBucket.mockResolvedValue(mockFile);

      const result = await service.getFileStream(filepath);

      expect(mockAwsS3Service.getItemInBucket).toHaveBeenCalledWith(filepath);
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should propagate errors from S3', async () => {
      const filepath = 'non-existent/file.png';

      mockAwsS3Service.getItemInBucket.mockRejectedValue(
        new Error('File not found'),
      );

      await expect(service.getFileStream(filepath)).rejects.toThrow(
        'File not found',
      );
    });
  });
});
