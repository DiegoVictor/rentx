import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import IDateProvider from '../contracts/IDateProvider';

dayjs.extend(utc);

class DayjsDateProvider implements IDateProvider {
  isBefore(date: Date, compare_date: Date): boolean {
    return dayjs(this.toUTC(date)).isBefore(this.toUTC(compare_date));
  }

  toUTC(date: Date): Date {
    return dayjs(date).utc().local().toDate();
  }

  add(date: Date, number: number, unit: dayjs.OpUnitType): Date {
    return dayjs(this.toUTC(date)).add(number, unit).toDate();
  }

  diffInDays(start_date: Date, end_date: Date): number {
    return dayjs(this.toUTC(end_date)).diff(this.toUTC(start_date), 'days');
  }
}

export default DayjsDateProvider;
