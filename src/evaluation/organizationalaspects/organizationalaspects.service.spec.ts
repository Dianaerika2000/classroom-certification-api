import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationalaspectsService } from './organizationalaspects.service';

describe('OrganizationalaspectsService', () => {
  let service: OrganizationalaspectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationalaspectsService],
    }).compile();

    service = module.get<OrganizationalaspectsService>(OrganizationalaspectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
