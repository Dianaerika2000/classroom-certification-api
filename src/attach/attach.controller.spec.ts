import { Test, TestingModule } from '@nestjs/testing';
import { AttachController } from './attach.controller';
import { AttachService } from './attach.service';

describe('AttachController', () => {
  let controller: AttachController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachController],
      providers: [AttachService],
    }).compile();

    controller = module.get<AttachController>(AttachController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
