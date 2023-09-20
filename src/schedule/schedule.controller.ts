import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEventDto, @Req() request) {
    const user: User = request.user;
    let start = new Date(dto.start);
    let end: Date;
    if (
      ['package 1', 'package 2', 'package 3'].includes(
        dto.summary.toLowerCase(),
      )
    ) {
      end = new Date(new Date(start).setHours(start.getHours() + 1));
    } else {
      start = new Date(new Date(start).setHours(0));
      end = new Date(new Date(start).setHours(23));
    }

    // return 'test';

    return this.scheduleService.insertEvent(start, end, dto.summary, user);
  }

  @Get()
  findAll() {
    return this.scheduleService.listEvents();
  }

  @Get('/timeslots')
  getTimeSlots() {
    return this.scheduleService.getAvailableTimeSlotss();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.scheduleService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
  //   return this.scheduleService.update(+id, updateScheduleDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.scheduleService.remove(+id);
  // }
}
