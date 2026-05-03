import productSerum from "@/assets/product-serum.jpg";
import productCream from "@/assets/product-cream.jpg";
import productSunscreen from "@/assets/product-sunscreen.jpg";
import productCleanser from "@/assets/product-cleanser.jpg";

export interface DiscountItem {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  name: string;
  category: string;
  image: string;
  original_price: number;
  discount_percentage: number;
  final_price: number;
  valid_until: string;
}

