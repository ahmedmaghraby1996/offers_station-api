import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ActionResponse } from 'src/core/base/responses/action.response';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateFcmRequest } from './dto/update-fcm.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import {
  applyQueryFilters,
  applyQueryIncludes,
} from 'src/core/helpers/service-related.helper';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/response/user-response';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { GetUserRequest } from './dto/get-user.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { RegisterResponse } from '../authentication/dto/responses/register.response';
import { UpdateProfileRequest } from './dto/update-profile-request';
import { ILike, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { toUrl } from 'src/core/helpers/file.helper';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { UpdateStoreInfoRequest } from './dto/request/update-store-info.request';
import { AddBranchRequest } from './dto/request/add-branch.request';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(REQUEST) private request: Request,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Roles(Role.ADMIN)
  @Get('')
  async getAll(@Query() query: PaginatedRequest) {
    // applyQueryFilters(query, `roles!=${Role.DRIVER}`);

    applyQueryIncludes(query, 'city');
    applyQueryIncludes(query, 'school');
    const users = await this.userService.findAll(query);
    const usersResponse = await Promise.all(
      users.map(async (user) => {
        return this._i18nResponse.entity(
          plainToInstance(UserResponse, {
            id: user.id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            phone: user.phone,
            avatar: user.avatar,
            role: user.roles[0],
            created_at: user.created_at,
          }),
        );
      }),
    );
    const total = await this.userService.count(query);

    return new PaginatedResponse(usersResponse, { meta: { total, ...query } });
  }

  @Roles(Role.ADMIN)
  @Get('profile')
  async getProile() {
    return new ActionResponse(
      plainToInstance(
        UserResponse,
        await this.userService.findOne(this.request.user.id),
        { excludeExtraneousValues: true },
      ),
    );
  }

  //update fcm token
  @Put('/fcm-token')
  async updateFcmToken(@Body() req: UpdateFcmRequest) {
    const user = await this.userService.findOne(this.request.user.id);
    user.fcm_token = req.fcm_token;
    await this.userService.update(user);
    return new ActionResponse(
      await this.userService.findOne(this.request.user.id),
    );
  }

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('avatarFile'))
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Put('update-profile')
  async updateProfile(
    @Query() query: GetUserRequest,
    @Body() request: UpdateProfileRequest,
    @UploadedFile(new UploadValidator().build())
    avatarFile: Express.Multer.File,
  ) {
    if (avatarFile) {
      request.avatarFile = avatarFile;
    }
    return new ActionResponse(
      plainToInstance(
        RegisterResponse,
        await this.userService.updateProfile(query.id, request),
        {
          excludeExtraneousValues: true,
        },
      ),
    );
  }

  //update fcm token
  @Delete('/delete')
  async deleteUser(@Query() query: GetUserRequest) {
    return new ActionResponse(
      await this.userService.deleteUser(query.id ?? this.request.user.id),
    );
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService._repo.findOne({
      where: { id: id },
      relations: { city: true },
    });
    return new ActionResponse(
      this._i18nResponse.entity(
        plainToInstance(UserResponse, {
          id: user.id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          phone: user.phone,
          avatar: user.avatar,
          role: user.roles[0],
          created_at: user.created_at,

          city: user.city,
        }),
      ),
    );
  }

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Roles(Role.STORE)
  @Put('store-info')
  async updateStoreInfo(
    @Body() req: UpdateStoreInfoRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    if (logo) {
      req.logo = logo;
    }
    const storeInfo = await this.userService.updateStoreInfo(req);
    return new ActionResponse(storeInfo);
  }

    @Roles(Role.STORE)
  @Put('add-branch')
  async addBranch(
    @Body() req: AddBranchRequest,
 
  ) {
    const branch = await this.userService.createBranch(req);
    return new ActionResponse(branch);
  }
}
