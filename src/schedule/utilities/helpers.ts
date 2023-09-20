export type WeeklyHoursOfOperation = {
  Monday: TimeSlot;
  Tuesday: TimeSlot;
  Wednesday: TimeSlot;
  Thursday: TimeSlot;
  Friday: TimeSlot;
  Saturday: TimeSlot;
  Sunday: TimeSlot;
};

export type TimeSlot = {
  start: Date;
  end: Date;
};

export type GoogleCalendarTimeSlot = {
  start: { dateTime: string; timeZone?: string } | { date: string };
  end: { dateTime: string; timeZone?: string } | { date: string };
};

export const convertGoogleCalendarTimeSlots = (
  googleCalendarTimeSlots: GoogleCalendarTimeSlot[],
): TimeSlot[] => {
  return googleCalendarTimeSlots.map((slot) => ({
    // @ts-ignore
    start: new Date(slot.start.dateTime || slot.start.date),
    // @ts-ignore
    end: new Date(slot.end.dateTime || slot.end.date),
  }));
};

export const getAvailableTimeSlots = (
  weeklyHoursOfOperation: WeeklyHoursOfOperation,
  slotDuration: number,
  googleCalendarTimeSlots: GoogleCalendarTimeSlot[],
): TimeSlot[] => {
  const bookedSlots = convertGoogleCalendarTimeSlots(googleCalendarTimeSlots);
  const startDate = new Date(Date.now());
  const endDate = new Date(Date.now());
  endDate.setFullYear(endDate.getFullYear() + 1);
  const currentDate = new Date(startDate);
  const availableTimeSlots: TimeSlot[] = [];

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.toLocaleString('en-us', {
      weekday: 'long',
    }) as keyof WeeklyHoursOfOperation;
    const hoursOfOperation = weeklyHoursOfOperation[dayOfWeek];
    const slotStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hoursOfOperation.start.getHours(),
      hoursOfOperation.start.getMinutes(),
    );

    const slotEnd = new Date(slotStart);

    const closingTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hoursOfOperation.end.getHours(),
      hoursOfOperation.end.getMinutes(),
    );

    slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);

    while (slotEnd <= closingTime) {
      if (
        !bookedSlots.some(
          (bookedSlot) =>
            (slotStart >= bookedSlot.start && slotStart < bookedSlot.end) ||
            (slotEnd > bookedSlot.start && slotEnd <= bookedSlot.end),
        )
      ) {
        availableTimeSlots.push({
          start: new Date(slotStart),
          end: new Date(slotEnd),
        });
      }

      slotStart.setMinutes(slotStart.getMinutes() + slotDuration + 30);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration + 30);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableTimeSlots;
};

// Your weeklyHoursOfOperation object would look like this, filling in the appropriate time slots:
export const weeklyHoursOfOperation: WeeklyHoursOfOperation = {
  Monday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Tuesday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Wednesday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Thursday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Friday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Saturday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
  Sunday: {
    start: new Date(new Date(Date.now()).getFullYear(), 0, 0, 9, 0),
    end: new Date(new Date(Date.now()).getFullYear(), 0, 0, 17, 0),
  },
};
