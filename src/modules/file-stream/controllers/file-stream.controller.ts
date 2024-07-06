import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResProperty } from '@/shared/decorators';

import { FileStreamService } from '../services/file-stream.service';

@ApiTags('File Stream')
@Controller('file-stream')
export class FileStreamController {
  constructor(private fileStreamService: FileStreamService) {}

  @Get()
  @ApiResProperty(StreamableFile, 200, { defaultStructure: false })
  @Header('Content-Disposition', 'attachment')
  getFileStream(@Query('key') key: string) {
    return this.fileStreamService.getFileStream(key);
  }
}
