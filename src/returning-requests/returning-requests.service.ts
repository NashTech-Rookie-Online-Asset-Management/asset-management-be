import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import { ToggleReturnRequestDto } from './dto';
import { Messages } from 'src/common/constants';
import {
  AccountType,
  AssetState,
  AssignmentState,
  RequestState,
} from '@prisma/client';

@Injectable()
export class ReturningRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleReturningRequest(
    admin: UserType,
    requestId: number,
    dto: ToggleReturnRequestDto,
  ) {
    const { state } = dto;

    const returnRequest = await this.prismaService.returningRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        assignment: {
          include: {
            asset: true,
          },
        },
      },
    });
    if (!returnRequest) {
      throw new NotFoundException(Messages.RETURNING_REQUEST.FAILED.NOT_FOUND);
    }

    if (returnRequest.state !== RequestState.WAITING_FOR_RETURNING) {
      throw new BadRequestException(
        Messages.RETURNING_REQUEST.FAILED.INVALID_STATE,
      );
    }

    if (
      admin.type !== AccountType.ROOT &&
      admin.location !== returnRequest.assignment.asset.location
    ) {
      throw new BadRequestException(
        Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
      );
    }
    if (state) {
      await this.prismaService.returningRequest.update({
        where: {
          id: requestId,
        },
        data: {
          state: RequestState.COMPLETED,
          returnedDate: new Date(),
          acceptedById: admin.id,
        },
      });
      await this.prismaService.asset.update({
        where: {
          id: returnRequest.assignment.asset.id,
        },
        data: {
          state: AssetState.AVAILABLE,
        },
      });
      return { message: Messages.RETURNING_REQUEST.SUCCESS.CONFIRMED };
    } else {
      await this.prismaService.assignment.update({
        where: {
          id: returnRequest.assignment.id,
        },
        data: {
          state: AssignmentState.ACCEPTED,
        },
      });
      await this.prismaService.returningRequest.delete({
        where: { id: requestId },
      });

      return { message: Messages.RETURNING_REQUEST.SUCCESS.CANCELLED };
    }
  }
}
