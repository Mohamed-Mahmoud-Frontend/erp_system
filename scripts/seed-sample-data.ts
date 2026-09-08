/**
 * scripts/seed-sample-data.ts
 *
 * One-off script to create sample data in the linked Supabase DB.
 * Run with: npx tsx scripts/seed-sample-data.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("⏳ Seeding sample data...");

  // 1. Clients
  const { data: clients, error: clientsErr } = await supabase
    .from("clients")
    .insert([
      { name: "أحمد محمد (تاجر)", type: "trader", phone: "01000000001", credit_days: 0 },
      { name: "شركة المقاولات الحديثة", type: "company", phone: "01111111111", credit_days: 0 },
      { name: "مكتب هندسي", type: "office", credit_days: 15 },
    ])
    .select();
  if (clientsErr) throw clientsErr;
  console.log(`✅ Inserted ${clients.length} clients`);

  // 2. Suppliers
  const { data: suppliers, error: suppErr } = await supabase
    .from("suppliers")
    .insert([{ name: "مورد البلاستيك الخام", balance: 0 }])
    .select();
  if (suppErr) throw suppErr;
  console.log(`✅ Inserted ${suppliers.length} suppliers`);

  // 3. Materials
  // We'll insert materials with 0 stock_qty, then insert "in" movements to trigger the stock increase
  // just to test the trigger in both directions!
  const { data: materials, error: matErr } = await supabase
    .from("materials")
    .insert([
      { type: "بولي إيثيلين عالي الكثافة", unit: "ton", min_threshold: 5 },
      { type: "مادة عازلة", unit: "kg", min_threshold: 100 },
      { type: "صبغة زرقاء", unit: "kg", min_threshold: 50 },
    ])
    .select();
  if (matErr) throw matErr;
  console.log(`✅ Inserted ${materials.length} materials`);

  // 4. Test Trigger: Insert 'in' movement
  const polyMaterial = materials[0];
  const supplierId = suppliers[0].id;
  
  const { error: moveInErr } = await supabase.from("material_movements").insert({
    material_id: polyMaterial.id,
    supplier_id: supplierId,
    direction: "in",
    qty: 20, // 20 tons
    is_return: false,
  });
  if (moveInErr) throw moveInErr;

  // 5. Test Trigger: Insert an Order
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .insert([{
      client_id: clients[0].id,
      quantity: 5,
      status: "in_production",
      product_spec: { size: "1000L", color: "blue" }
    }])
    .select();
  if (orderErr) throw orderErr;

  // Fetch stock BEFORE 'out' movement
  const { data: stockBefore } = await supabase
    .from("materials")
    .select("stock_qty")
    .eq("id", polyMaterial.id)
    .single();

  // 6. Test Trigger: Insert 'out' movement
  const { error: moveOutErr } = await supabase.from("material_movements").insert({
    material_id: polyMaterial.id,
    order_id: orders[0].id,
    direction: "out",
    qty: 2.5, // Used 2.5 tons for the order
    is_return: false,
  });
  if (moveOutErr) throw moveOutErr;

  // Fetch stock AFTER 'out' movement
  const { data: stockAfter } = await supabase
    .from("materials")
    .select("stock_qty")
    .eq("id", polyMaterial.id)
    .single();

  console.log(`✅ Trigger verified: poly stock was ${stockBefore?.stock_qty}, now is ${stockAfter?.stock_qty} (expected ${Number(stockBefore?.stock_qty) - 2.5})`);

  // 7. Workers
  const { data: workers, error: workErr } = await supabase
    .from("workers")
    .insert([
      { name: "عامل 1", daily_wage: 150 },
      { name: "عامل 2", daily_wage: 120 },
    ])
    .select();
  if (workErr) throw workErr;
  console.log(`✅ Inserted ${workers.length} workers`);

  console.log("🎉 Seeding completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
