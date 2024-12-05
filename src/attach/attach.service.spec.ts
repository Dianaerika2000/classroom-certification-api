import { Test, TestingModule } from '@nestjs/testing';
import { AttachService } from './attach.service';

describe('AttachService', () => {
  let service: AttachService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttachService],
    }).compile();

    service = module.get<AttachService>(AttachService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
