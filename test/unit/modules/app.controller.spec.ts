import { AppController } from '@/app.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health-check', () => {
    it('should return success message', () => {
      expect(appController.getRoot()).toEqual({ message: 'Success' });
    });
  });
});
