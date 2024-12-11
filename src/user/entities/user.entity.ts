import { Role } from "src/role/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column()
  username: String;

  @Column({ nullable: true})
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => Role, 
    (rol) => rol.users,
    { eager: true}
  )
  @JoinColumn({ name: 'rol_id' })
  rol: Role;
}
