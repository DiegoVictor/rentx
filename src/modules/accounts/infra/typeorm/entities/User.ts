import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

@Entity('users')
class User {
  @PrimaryColumn()
  id?: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  driver_license: string;

  @Column()
  isAdmin: boolean;

  @Column()
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @Expose({ name: 'avatar_url' })
  avatar_url(): string {
    if (!this.avatar) {
      return '';
    }

    switch (process.env.STORAGE_DRIVER) {
      case 'local':
        return `${process.env.API_URL}/avatar/${this.avatar}`;

      case 's3':
        return `${process.env.AWS_BUCKET_URL}/avatar/${this.avatar}`;

      default:
        return '';
    }
  }

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export default User;
