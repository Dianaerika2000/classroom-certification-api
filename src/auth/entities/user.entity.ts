import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: String;

  @Column('text')
  password: string;

  @Column('text')
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
