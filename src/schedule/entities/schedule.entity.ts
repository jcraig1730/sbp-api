export class Schedule {
  kind: string;
  etag: string;
  summary: string;
  description: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: [];
  nextSyncToken: string;
  items: {
    kind: string;
    etag: string;
    id: string;
    status: string;
    htmlLink: string;
    created: string;
    updated: string;
    summary: string;
    creator: {
      email: string;
      displayName: string;
      self: boolean;
    };
    organizer: {
      email: string;
      displayName: string;
      self: boolean;
    };
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
    recurrence: string[];
    iCalUID: string;
    sequence: number;
    attendees: {
      email: string;
      displayName: string;
      organizer: boolean;
      self: boolean;
      responseStatus: string;
    }[];
    reminders: {
      useDefault: boolean;
    };
    eventType: string;
  }[];
}
