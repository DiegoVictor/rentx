export default interface ICreateRentalDTO {
  id?: string;
  user_id: string;
  car_id: string;
  end_date?: Date;
  total?: number;
  expected_return_date: Date;
}
