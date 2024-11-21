import { Test, TestingModule } from '@nestjs/testing';
import { TrainingDesignService } from './training-design.service';

describe('TrainingDesignService', () => {
  let service: TrainingDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingDesignService],
    }).compile();

    service = module.get<TrainingDesignService>(TrainingDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
