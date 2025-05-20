import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { SubCategory } from "./subcategory.entity";
@Entity()
export class Category extends AuditableEntity{
    @Column()
    name_ar: string;
    @Column()
    name_en: string;
    @Column({nullable: true})
    logo: string;

    @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
    subcategories: SubCategory[]
}
// 