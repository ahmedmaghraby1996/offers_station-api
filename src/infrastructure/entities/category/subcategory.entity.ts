import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Category } from "./category.entity";
@Entity()
export class SubCategory extends AuditableEntity {
  @Column()
  name_ar: string;
  @Column()
  name_en: string;
  @Column({ nullable: true })
  logo: string;

 @ManyToOne(() => Category, (category) => category.subcategories)
 @JoinColumn()
 category: Category

 @Column({ nullable: true })
 category_id: number;
}