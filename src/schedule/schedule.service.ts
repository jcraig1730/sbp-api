import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { Schedule } from './entities/schedule.entity';
import Event = calendar_v3.Schema$Event;
import { User } from 'src/users/entities/user.entity';
import { AppointmentsService } from 'src/appointments/appointments.service';
import {
  getAvailableTimeSlots,
  weeklyHoursOfOperation,
} from './utilities/helpers';
import { ConfigService } from '@nestjs/config';

const workingDays = [1, 2, 3, 4, 5, 6, 0];
const hours = {
  1: [19, 21],
  2: [19, 21],
  3: [19, 21],
  4: [19, 21],
  5: [19, 21],
  6: [8, 21],
  0: [15, 19],
};

const formatTime = (hour: number, minute: number) => {
  if (hour > 12) {
    return `${hour - 12}:${String(minute).padEnd(2, '0')} PM`;
  }
  if (hour === 12) {
    return `${hour}:${String(minute).padEnd(2, '0')} PM`;
  }
  return `${hour}:${String(minute).padEnd(2, '0')} AM`;
};

const getDaySlots = (date: Date, busySlots: BusySlots) => {
  const day = date.getDay();
  const [start, stop] = hours[day];

  let dayEvents: DayEvent[] = [];
  if (busySlots[date.getFullYear()]) {
    if (busySlots[date.getFullYear()][date.getMonth()]) {
      if (busySlots[date.getFullYear()][date.getMonth()][date.getDate()]) {
        dayEvents =
          busySlots[date.getFullYear()][date.getMonth()][date.getDate()];
      }
    }
  }

  const result = [];

  for (let hour = start; hour <= stop - 1; hour++) {
    if (
      !dayEvents.some((e) =>
        doTimesOverlap(e, {
          startHour: hour,
          endHour: hour + 1,
          startMinute: 0,
          endMinute: 0,
        }),
      )
    ) {
      result.push({ hour, minute: 0, formatted: formatTime(hour, 0) });
    }
    if (stop - hour > 1) {
      if (
        !dayEvents.some((e) =>
          doTimesOverlap(e, {
            startHour: hour,
            endHour: hour + 1,
            startMinute: 30,
            endMinute: 30,
          }),
        )
      )
        result.push({ hour, minute: 30, formatted: formatTime(hour, 30) });
    }
  }

  return result;
};

interface DayEvent {
  startHour: number | string;
  startMinute: number | string;
  endHour: number | string;
  endMinute: number | string;
}
const doTimesOverlap = (event1: DayEvent, event2: DayEvent) => {
  const event1End =
    (parseInt(event1.endHour as string) + 1) * 60 +
    parseInt(event1.endMinute as string);
  const event2Start =
    (parseInt(event2.startHour as string) + 1) * 60 +
    parseInt(event2.startMinute as string);
  const event2End =
    (parseInt(event2.endHour as string) + 1) * 60 +
    parseInt(event2.endMinute as string);
  const event1Start =
    (parseInt(event1.startHour as string) + 1) * 60 +
    parseInt(event1.startMinute as string);

  const gap1 = event2Start - event1End;
  const gap2 = event1Start - event2End;

  return !(gap1 > 30 || gap2 > 30);
};

@Injectable()
export class ScheduleService {
  private calendar;
  private calendarId = 'guitarz777@gmail.com';

  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly configService: ConfigService,
  ) {
    const jwtClient = new google.auth.JWT(
      this.configService.get('GOOGLE_CLIENT_EMAIL'),
      null,
      this.configService.get('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar'],
    );

    this.calendar = google.calendar({ version: 'v3', auth: jwtClient });
  }

  async listEvents(): Promise<Schedule> {
    const res = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: new Date(),
      timeMax: new Date(
        new Date(new Date()).setFullYear(new Date().getFullYear() + 1),
      ),
    });
    return res.data;
  }

  async getTimeSlots() {
    const busyTimes = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: new Date(),
      timeMax: new Date(
        new Date(new Date()).setFullYear(new Date().getFullYear() + 1),
      ),
    });

    const result = getAvailableTimeSlots(
      weeklyHoursOfOperation,
      60,
      busyTimes.data.items,
    );

    return result;
  }

  async getAvailableTimeSlotss() {
    const res = await this.listEvents();
    const busySlots = res.items.reduce((obj, item) => {
      const startTime = new Date(item.start.dateTime);
      const endTime = new Date(item.end.dateTime);
      const dateOfMonth = startTime.getDate();
      const month = startTime.getMonth();
      const year = startTime.getFullYear();
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();

      if (!obj[year]) {
        obj[year] = {};
      }
      if (!obj[year][month]) {
        obj[year][month] = {};
      }
      if (!obj[year][month][dateOfMonth]) {
        obj[year][month][dateOfMonth] = [];
      }
      obj[year][month][dateOfMonth].push({
        startHour: startHour,
        startMinute: startMinute,
        endHour: endHour,
        endMinute: endMinute,
      });
      return obj;
    }, {});
    let counter = 0;
    const result = {};
    for (
      let date = new Date();
      date < new Date(new Date().setMonth(new Date().getMonth() + 1));
      date.setDate(date.getDate() + 1)
    ) {
      counter += 1;
      if (!result[date.getFullYear()]) {
        result[date.getFullYear()] = {};
      }
      if (!result[date.getFullYear()][date.getMonth()]) {
        result[date.getFullYear()][date.getMonth()] = {};
      }
      if (!result[date.getFullYear()][date.getMonth()][date.getDate()]) {
        result[date.getFullYear()][date.getMonth()][date.getDate()] = [];
      }
      result[date.getFullYear()][date.getMonth()][date.getDate()].push(
        ...getDaySlots(date, busySlots),
      );
    }
    return result;
  }

  async insertEvent(
    start: Date,
    end: Date,
    summary: 'package 1' | 'package 2' | 'package 3' | 'lifestyle/newborn',
    user: User,
  ): Promise<any> {
    const event: Event = {
      start: {
        dateTime: this.formatRFC3339(start),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: this.formatRFC3339(end),
        timeZone: 'America/New_York',
      },
      summary: `${summary} \n ${user.profile.firstName} ${user.profile.lastName} \n ${user.email} \n ${user.profile.phone}`,
    };

    const appointment = await this.appointmentsService.create({
      paid: true,
      startTime: start.toString(),
      type: summary,
      userId: user.id,
    });

    const res = await this.calendar.events.insert({
      calendarId: this.calendarId,
      requestBody: event,
    });

    const returnObj = {
      start: res.data.start,
      description: res.data.description,
      user: user,
      appointment,
    };

    return returnObj;
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatRFC3339(date: Date) {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (number, length = 2) => String(number).padStart(length, '0');

    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);
    const timezone = `${sign}${hours}:${minutes}`;

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hour}:${minute}:${second}${timezone}`;
  }
}

interface BusySlots {
  [year: string]: {
    [month: string]: {
      [day: string]: {
        startHour: string;
        startMinute: string;
        endHour: string;
        endMinute: string;
      }[];
    };
  };
}
