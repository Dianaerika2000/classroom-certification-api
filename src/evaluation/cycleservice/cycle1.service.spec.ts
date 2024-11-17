import { Test, TestingModule } from '@nestjs/testing';
import { Cycle1Service } from './cycle1.service';

describe('Cycle1Service', () => {
  let service: Cycle1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Cycle1Service],
    }).compile();

    service = module.get<Cycle1Service>(Cycle1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
