import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Store } from "../store/store.entity";
import { OfferImages } from "./offer-images.entity";
import { SubCategory } from "../category/subcategory.entity";
@Entity()
export class Offer extends AuditableEntity{
    

 @Column()
 title_ar: string;

 @Column()
 title_en: string;
  
 @Column()
 description_ar: string;
  
 @Column()
 description_en: string;
  
 @OneToMany(() => OfferImages, (offerImages) => offerImages.offer)
 images: OfferImages[];
  
 @Column({nullable:true})
 start_date: Date;
  
 @Column({nullable:true})
 end_date: Date;
 
 @Column({ type: 'decimal', precision: 10, scale: 2,nullable: true })
 original_price: number;
 
 @Column({ type: 'decimal', precision: 10, scale: 2,nullable: true })
 offer_price: number;

 @Column({nullable:true})
 code: string;

 @ManyToMany(() => Store, (store) => store.offers)
 @JoinTable()
 stores: Store[]


 @ManyToOne(()=>SubCategory, (subcategory) => subcategory.offers)
 subcategory: SubCategory
 @Column({nullable:true})
 subcategory_id: number
}