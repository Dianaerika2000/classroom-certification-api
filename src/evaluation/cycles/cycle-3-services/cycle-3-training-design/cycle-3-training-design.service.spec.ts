import { Test, TestingModule } from '@nestjs/testing';
import { Cycle3TrainingDesignService } from './cycle-3-training-design.service';

describe('TrainingDesignService', () => {
  let service: Cycle3TrainingDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Cycle3TrainingDesignService],
    }).compile();

    service = module.get<Cycle3TrainingDesignService>(Cycle3TrainingDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
