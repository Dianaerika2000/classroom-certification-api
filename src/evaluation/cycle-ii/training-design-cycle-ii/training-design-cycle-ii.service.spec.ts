import { Test, TestingModule } from '@nestjs/testing';
import { TrainingDesignCycleIiService } from './training-design-cycle-ii.service';

describe('TrainingDesignCycleIiService', () => {
  let service: TrainingDesignCycleIiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingDesignCycleIiService],
    }).compile();

    service = module.get<TrainingDesignCycleIiService>(TrainingDesignCycleIiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
