import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/guards/auth-guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report.dto';
import User from 'src/users/user.entity';

@Controller('reports')
export class ReportsController {
    constructor(private reportsService: ReportsService) {}

    @Post()
    @UseGuards(AuthGuard)
    @Serialize(ReportDto)
    createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
        return this.reportsService.create(body, user);
    }
}
