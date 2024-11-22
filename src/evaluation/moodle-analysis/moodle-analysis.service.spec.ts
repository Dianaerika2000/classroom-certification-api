import { Test, TestingModule } from '@nestjs/testing';
import { MoodleAnalysisService } from './moodle-analysis.service';

describe('MoodleAnalysisService', () => {
  let service: MoodleAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoodleAnalysisService],
    }).compile();

    service = module.get<MoodleAnalysisService>(MoodleAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
