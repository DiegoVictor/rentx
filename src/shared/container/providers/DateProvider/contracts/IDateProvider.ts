export default interface IDateProvider {
  isBefore(date: Date, compare_date: Date): boolean;
  toUTC(date: Date): Date;
  add(date: Date, number: number, unit: string): Date;
  diffInDays(start_date: Date, end_date: Date): number;
}
