import { Certification } from "src/certification/entities/certification.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'authorities' })
export class Authority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: String;

  @Column()
  position: String;

  @Column()
  signature: String;
  
  @ManyToMany(() => Certification, certification => certification.authorities)
  @JoinTable({
    name: 'authority_certification',
    joinColumn: { name: 'authority_id' },
    inverseJoinColumn: { name: 'certification_id' }
  })
  certifications: Certification[];
}
