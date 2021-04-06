export default interface ICreateUserDTO {
  id?: string;
  name: string;
  email: string;
  password: string;
  driver_license: string;
  avatar?: string;
}
