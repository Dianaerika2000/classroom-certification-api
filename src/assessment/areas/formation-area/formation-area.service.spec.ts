import { Test, TestingModule } from '@nestjs/testing';
import { FormationAreaService } from './formation-area.service';

describe('FormationAreaService', () => {
  let service: FormationAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormationAreaService],
    }).compile();

    service = module.get<FormationAreaService>(FormationAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
