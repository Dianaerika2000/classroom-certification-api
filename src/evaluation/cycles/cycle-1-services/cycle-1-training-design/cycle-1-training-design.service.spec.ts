import { Test, TestingModule } from '@nestjs/testing';
import { Cycle1TrainingDesignService } from './cycle-1-training-design.service';

describe('Cycle1Service', () => {
  let service: Cycle1TrainingDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Cycle1TrainingDesignService],
    }).compile();

    service = module.get<Cycle1TrainingDesignService>(Cycle1TrainingDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
