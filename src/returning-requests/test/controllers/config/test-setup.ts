import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ReturningRequestsController } from 'src/returning-requests/returning-requests.controller';
import { ReturningRequestsService } from 'src/returning-requests/returning-requests.service';

export let controller: ReturningRequestsController;
export let service: ReturningRequestsService;
export const mockReturnRequestService = {
  getAll: jest.fn(),
  toggleReturningRequest: jest.fn(),
};

export const setupTestController = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [ReturningRequestsController],
    providers: [
      { provide: ReturningRequestsService, useValue: mockReturnRequestService },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  controller = module.get<ReturningRequestsController>(
    ReturningRequestsController,
  );
  service = module.get<ReturningRequestsService>(ReturningRequestsService);
};
