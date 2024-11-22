import { Test, TestingModule } from '@nestjs/testing';
import { Cycle1TechnicalDesignService } from './cycle-1-technical-design.service';

describe('TechnicalDesignService', () => {
  let service: Cycle1TechnicalDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Cycle1TechnicalDesignService],
    }).compile();

    service = module.get<Cycle1TechnicalDesignService>(Cycle1TechnicalDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
