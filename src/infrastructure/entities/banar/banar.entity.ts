import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Offer } from '../offer/offer.entity';

@Entity()
export class Banar extends AuditableEntity {
  @Column()
  banar: string;

  @Column()
  started_at: Date;

  @Column()
  ended_at: Date;

  @Column({ nullable: true })
  order_by: number;

  @Column()
  is_active: boolean;

  @Column({ default: false })
  is_popup: boolean;

  @Column({ default: false })
  is_general: boolean;

  @Column({ nullable: true })
  offer_id: string;

  @ManyToOne(() => Offer, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'offer_id' })
  offer: Offer;
}
