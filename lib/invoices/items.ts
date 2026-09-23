import {z} from "zod";
import Decimal from "decimal.js";
export const invoiceLineSchema=z.object({
 description:z.string().trim().min(1).max(300),
 capacity:z.string().trim().min(1).max(300),
 quantity:z.number().int().min(1).max(1000000),
 unit_price:z.number().finite().min(0).max(1000000000).refine(n=>new Decimal(n).decimalPlaces()<=2),
});
const baseInvoiceDetailsSchema=z.object({
 items:z.array(invoiceLineSchema).min(1).max(100),
 shipping:z.number().finite().min(0).max(1000000000).refine(n=>new Decimal(n).decimalPlaces()<=2),
 discount:z.number().finite().min(0).max(1000000000).refine(n=>new Decimal(n).decimalPlaces()<=2),
 notes:z.string().max(2000),
});
export type InvoiceDetails=z.infer<typeof baseInvoiceDetailsSchema>;
export const invoiceDetailsSchema=baseInvoiceDetailsSchema.refine(value=>invoiceTotal(value).gte(0),{message:"الخصم يتجاوز الإجمالي"});

export function invoiceTotal(value:Pick<InvoiceDetails,"items"|"shipping"|"discount">){return value.items.reduce((sum,item)=>sum.plus(new Decimal(item.quantity).times(item.unit_price)),new Decimal(0)).plus(value.shipping).minus(value.discount).toDecimalPlaces(2);}
export function parseInvoiceForm(form:FormData){
 const capacities=form.getAll("capacity[]");const quantities=form.getAll("quantity[]");const prices=form.getAll("unit_price[]");
 if(capacities.length!==quantities.length||capacities.length!==prices.length)return invoiceDetailsSchema.safeParse(null);
 return invoiceDetailsSchema.safeParse({items:capacities.map((capacity,i)=>({description:capacity,capacity,quantity:Number(quantities[i]),unit_price:Number(prices[i])})),shipping:Number(form.get("shipping_amount")),discount:Number(form.get("discount_amount")),notes:String(form.get("notes")??"")});
}