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

const discounts: DiscountItem[] = [
  {
    product_id: 1,
    product_detail_id: 1,
    product_unit_id: 1,
    name: "Brightening Serum Vitamin C",
    category: "Serum",
    image: productSerum,
    original_price: 189000,
    discount_percentage: 30,
    final_price: 132300,
    valid_until: "2026-05-15T23:59:59+07:00",
  },
  {
    product_id: 2,
    product_detail_id: 2,
    product_unit_id: 2,
    name: "Hydrating Toner Rose Water",
    category: "Toner",
    image: productCream,
    original_price: 145000,
    discount_percentage: 25,
    final_price: 108750,
    valid_until: "2026-05-15T23:59:59+07:00",
  },
  {
    product_id: 3,
    product_detail_id: 3,
    product_unit_id: 3,
    name: "Nourishing Face Cream SPF 30",
    category: "Moisturizer",
    image: productSunscreen,
    original_price: 220000,
    discount_percentage: 20,
    final_price: 176000,
    valid_until: "2026-05-20T23:59:59+07:00",
  },
  {
    product_id: 4,
    product_detail_id: 4,
    product_unit_id: 4,
    name: "Gentle Foam Cleanser",
    category: "Cleanser",
    image: productCleanser,
    original_price: 99000,
    discount_percentage: 15,
    final_price: 84150,
    valid_until: "2026-05-20T23:59:59+07:00",
  },
];

export default discounts;
