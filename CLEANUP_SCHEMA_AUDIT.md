# تنظيف اختبار Batch 1 ومراجعة schema

تم تنفيذ البندين فقط، دون بدء Batch 2. نجاح DeepSeek الحي يظل مؤجلًا بطلب المستخدم حتى شحن الحساب.

## 1. فاتورة الاختبار: محذوفة بالفعل، ولا حذف جديد

راجعت [سكربت الاختبار](scripts/verify-live.mjs) ونتائج تشغيله السابق. اختبار البيع المباشر أنشأ عميلًا باسم `Batch1-<UUID>` من نوع تاجر، وأوردرًا بكمية خزانين 1000 لتر، وفاتورة إجماليها 5000 ومدفوعها النقدي 1200 والمتبقي 3800. أنشأ أيضًا أوردرًا مستقلًا لنفس العميل. لم ينشئ حركات خامات مرتبطة بأوردر البيع؛ اختبار المخزون المنفصل انتهى بـ ROLLBACK.

السكربت السابق أعلن نجاح التنظيف في `finally`. لم يطبع UUID العميل أو الفاتورة، لذلك لا يوجد معرّف محفوظ يمكن استخدامه لتخمين هدف حذف. بدل ذلك فُحصت جميع الفواتير الحية وروابطها وأسماء عملائها، ثم أُجري فحص شامل لبقايا الاختبار والعلاقات اليتيمة.

النتيجة الفعلية الآن:

- الموجودتان فقط هما `INV-2026-0001` بإجمالي 80000 و`INV-2026-0002` بإجمالي 40000. بياناتهما لا تطابق اختبار البيع المباشر المذكور؛ لم تُحذفا ولم تتغيرا.
- لا يوجد عميل `Batch1-…` أو أوردر أو فاتورة أو دفعة أو حركة خامة أو عرض سعر تابع لهذا الاسم/علامة الاختبار.
- لا توجد دفعات بلا فواتير، ولا شيكات بلا دفعات، ولا فواتير بلا أوردرات، ولا أوردرات بلا عملاء، ولا حركات ذات `order_id` غير فارغ يشير إلى أوردر مفقود. الحركات التي يكون `order_id` فيها NULL أصلًا لا نعتبرها يتيمة ولا نحذفها.
- **لم ينفذ أي DELETE في هذه المراجعة**؛ صف الاختبار لم يكن موجودًا أصلًا عند الفحص، والتنظيف المطلوب متحقق بالفعل.

**فجوة الترقيم مؤكدة:** `INV-2026-0003` غير موجود، لكن `invoice_sequences.last_value` لعام 2026 ما زال **3**. هذه هي الفجوة المتسقة مع رقم الاختبار المستهلك. الإصدار العادي التالي في نفس السنة سيستخدم `0004` إذا لم تحدث إصدارات أخرى قبله. لم يُعدّل العداد ولم يُعاد ترقيم أي فاتورة، ولن يعيد المسار الطبيعي استعمال `0003`.

الإثبات المحفوظ: [cleanup-verification.json](audit/cleanup-verification.json)، مع وقت القراءة. والاستعلام قابل للإعادة من [verify-cleanup.sql](scripts/verify-cleanup.sql).

## 2. طريقة مراجعة schema وحدودها

استخرجت metadata من `information_schema.columns` و`pg_namespace` و`pg_class` و`pg_attribute` و`pg_constraint` و`pg_index` و`pg_policies` و`pg_trigger` و`pg_proc` و`pg_type` و`pg_enum` و`pg_sequence` و`pg_extension`، باستخدام [schema-catalog.sql](scripts/schema-catalog.sql). لم أستخدم `\d` ولم أصدّر محتويات الجداول.

الاستخراج يشمل **كل schemas غير النظامية**: `public`, `auth`, `extensions`, `graphql`, `graphql_public`, `realtime`, `storage`, `supabase_migrations`, `vault`. النسخة الحية تحتوي 50 جدولًا (منها جدول partitioned واحد) و3 views، بإجمالي 495 عمودًا. احتُفظ بتعريفاتها كاملة في لقطة metadata.

المقارنة التطبيقية تشمل `public` بالكامل، لأنها schema الوحيدة التي تنشئها/تعدلها migrations المشروع. بقية الجداول تخص منصة Supabase وامتداداتها، وليست عناصر تطبيق ضائعة من migrations. جردها مفصل في `platform_inventory` داخل ملفات المقارنة وتعريفاتها في لقطة القاعدة الحية؛ لم ننسخ إدارة `auth` أو `storage` إلى migrations التطبيق ولم نعدلها.

أُعيد تشغيل كل ملف من `0001` إلى `0015` بالترتيب في قاعدة PostgreSQL معزولة عبر PGlite، ثم الاستعلام من catalogs بنفس SQL. بعد المصالحة أُعيد البناء من `0001` إلى `0016`. احتُفظ بأسماء الملفات وSHA-256 لكل ملف مستخدم في كل مقارنة.

تفصيل بيئة الإعادة: القاعدة الحية PostgreSQL **17.6** وPGlite **18.3**. جرى تجهيز دوري `anon` و`authenticated` ودالة `auth.uid()` اللازمة للسياسات، وتجاوز جملة تثبيت `pgcrypto` فقط لأن PGlite لا يوفر الامتداد ويملك `gen_random_uuid()` في PostgreSQL نفسه. امتداد `pgcrypto` الحي موجود بإصدار 1.3 داخل `extensions`. لهذا لا ندعي أن لقطة المنصة كلها تطابق قاعدة PGlite، بل نثبت التطابق في تعريفات التطبيق المستخرجة.

شملت المقارنة أسماء الجداول، RLS وتفعيل/فرض السياسات، ترتيب الأعمدة، الأنواع وUDT، NULL/default/identity/generated، الأطوال والدقة، التعليقات، جميع PK/FK/unique/check/exclusion constraints وتعريفاتها وحالة التحقق والتأجيل، كل الفهارس وتعريفاتها وصلاحيتها، policies، triggers، ونصوص الدوال وإعدادات تنفيذها. NULLability قورنت من الأعمدة بدل تمثيل قيود NOT NULL المختلف بين PostgreSQL 17 و18. الفارق النصي الوحيد الذي طُبّع آليًا هو CRLF مقابل LF.

الامتدادات الموجودة حيًا: `pg_stat_statements 1.11`, `pgcrypto 1.3`, `plpgsql 1.0`, `supabase_vault 0.3.1`, `uuid-ossp 1.1`. كائنات الامتدادات والمنصة يديرها Supabase؛ لم تُسجّل كفروق وظيفية في التطبيق.

## كل الفروق المكتشفة قبل المصالحة

**12 فرقًا: 6 تعليقات بصياغة مختلفة، 5 تعليقات مفقودة، وفهرس واحد مفقود.** الجدول التالي يسجل كل فرق دون اختصار قيمته. `NULL` يعني أن التعليق غير موجود.

| العنصر | الحي قبل المصالحة | الناتج من migrations حتى 0015 | الإجراء في 0016 |
|---|---|---|---|
| `attendance.extra_units` comment | `Extra production units completed today` | `Number of extra production units completed (added to daily earnings)` | اعتماد الصياغة الحية وتوثيقها |
| `invoices.invoice_number` comment | `Human-readable, e.g. INV-2024-0001 — unique per factory` | `Human-readable number, e.g. INV-2024-0001 — unique per factory` | اعتماد الصياغة الحية وتوثيقها |
| `material_movements.direction` comment | `in = arriving; out = consumed` | `in = stock arriving; out = stock consumed` | اعتماد الصياغة الحية وتوثيقها |
| `material_movements.is_return` comment | `true = return movement (written off, does NOT restore stock)` | `true = this is a return movement (written off, does NOT restore stock_qty)` | اعتماد الصياغة الحية وتوثيقها |
| `materials.min_threshold` comment | `Low-stock alert fires when stock_qty drops below this` | `Triggers low-stock alert / n8n webhook when stock_qty drops below this` | اعتماد الصياغة الحية وتوثيقها |
| `materials.stock_qty` comment | `Current stock level (exact decimal)` | `Current stock level (exact decimal, never float)` | اعتماد الصياغة الحية وتوثيقها |
| `material_movements.qty` comment | NULL | `Quantity moved (always positive; direction determines sign)` | إضافة التعليق الحي المطلوب سابقًا |
| `supplier_transactions.type` comment | NULL | `Freeform — e.g. purchase, payment, return, adjustment` | إضافة التعليق الحي المطلوب سابقًا |
| `worker_transactions.amount` comment | NULL | `Always positive; direction is determined by type` | إضافة التعليق الحي المطلوب سابقًا |
| `worker_transactions.type` comment | NULL | `advance \| deduction \| bonus` | إضافة التعليق الحي المطلوب سابقًا |
| `workers.daily_wage` comment | NULL | `Base daily wage in EGP (exact decimal)` | إضافة التعليق الحي المطلوب سابقًا |
| `worker_transactions_type_idx` | غير موجود | `CREATE INDEX worker_transactions_type_idx ON public.worker_transactions USING btree (type)` | إضافته بـ `IF NOT EXISTS` |

**لم تظهر فروق أخرى في التطبيق:** لا أعمدة زائدة أو ناقصة، ولا اختلاف نوع/default/NULLability/ترتيب أعمدة، ولا FK أو PK أو unique أو check إضافي/ناقص، ولا فرق في أسماء/تعريفات القيود أو RLS أو الدوال أو trigger. `parsed_items` الآن مطابق بفضل `0015`، وقيود FK الحالية كلها ممثلة في migrations. لم يظهر أي عنصر غريب يحتاج حذفه أو تعطيله.

البيانات الخام للمقارنة قبل التعديل: [comparison-before.json](audit/schema/comparison-before.json)، [live-before.json](audit/schema/live-before.json)، [replayed-before.json](audit/schema/replayed-before.json).

## المصالحة والتحقق النهائي

أُضيفت [0016_reconcile_schema_metadata.sql](supabase/migrations/0016_reconcile_schema_metadata.sql)، واجتازت إعادة التشغيل والاختبارات المعزولة، ثم أُجريت معاينة أكدت أنها migration الوحيدة المعلقة وتم تطبيقها على Supabase المرتبط.

تغييرات القاعدة مقتصرة على `COMMENT ON COLUMN` و`CREATE INDEX IF NOT EXISTS` لفهرس غير فريد. **لا تغيير لقيم السجلات ولا حذف جدول أو عمود أو قيد أو سياسة أو فهرس.** الفهرس لا يضيف قيد تفرد ولا يغير حسابات العمال.

بعد إعادة الاستخراج وإعادة تشغيل migrations من الصفر، أصبحت النتيجة **صفر فروق في الحقول المقارنة لمخطط التطبيق**:

| النوع | حي | إعادة migrations |
|---|---:|---:|
| جداول التطبيق | 14 | 14 |
| الأعمدة | 92 | 92 |
| قيود PK/FK/unique/check | 49 | 49 |
| الفهارس | 42 | 42 |
| سياسات RLS | 16 | 16 |
| triggers غير الداخلية | 1 | 1 |
| الدوال غير التابعة لامتدادات | 6 | 6 |
| أنواع enum/domain مخصصة في public | 0 | 0 |
| views / PostgreSQL sequences في public | 0 / 0 | 0 / 0 |

`invoice_sequences` جدول تطبيق عادي، ولذلك يدخل في الجداول الأربعة عشر وليس في عدد PostgreSQL sequences.

الأدلة النهائية: [comparison.json](audit/schema/comparison.json)، [live.json](audit/schema/live.json)، [replayed.json](audit/schema/replayed.json). المقارن [audit-schema.mjs](scripts/audit-schema.mjs) يرجع exit code 1 عند اكتشاف أي اختلاف، بدل تقرير نجاح مضلل.

فحوصات التسليم نجحت جميعًا: `npm run verify:batch1` و`tsc --noEmit` و`eslint . --max-warnings=0` و`npm run build`. البناء اكتمل دون خطأ، وESLint دون تحذيرات.

## الترجيح بشأن سبب الانحراف

هناك قرينتان مباشرتان:

1. التعليقات الحية الست المختلفة تطابق نصوص `supabase/schema_full.sql` القديم **حرفيًا**، وهذا الملف لا يحتوي `worker_transactions_type_idx` ويغيب عنه أيضًا التعليقات الخمس المذكورة. بالتالي نمط الفروق كله يطابق هذا المصدر البديل.
2. سجل migration `0004` الحي يحتوي فعلًا statement إنشاء الفهرس وتعليق `Number of extra production units completed…`؛ وليس مجرد سجل فارغ. لذلك لا يكفي وجود رقم migration في السجل لإثبات أن تعريف القاعدة الحالي ما زال يطابقه.

**أفضل ترجيح:** استُخدمت نسخة `schema_full.sql` أو SQL مقتبس منها يدويًا في مرحلة ما، أو استُعيدت/أعيد إنشاء أجزاء من schema من تلك النسخة، بينما بقي سجل migrations أو أُعيدت مزامنته. إضافة `parsed_items` اليدوية التي تأكدت سابقًا تدعم وجود تعديلات خارج المسار. لا توجد هنا سجلات تدقيق تثبت من نفذ ذلك أو ترتيب الأحداث، فلا أجزم باستخدام migration repair أو توقيته.

لتجنب التكرار: أي تغيير schema، حتى التعليقات، يكون في migration جديدة قبل تطبيقه؛ لا يُعاد تحرير migrations سبق تطبيقها، ولا تُستخدم النسخة التاريخية `schema_full.sql` لتجهيز قاعدة حالية. عند اضطرار لتعديل SQL مباشر، تُضاف migration تطابقه فورًا وتُعاد مقارنة catalogs. أدوات Supabase الداخلية وامتداداتها تبقى مسؤولية المنصة، مع حفظ جردها عند المراجعة.

## إعادة المقارنة لاحقًا

```powershell
node_modules/.bin/supabase.cmd db query --linked --file scripts/schema-catalog.sql --output-format json > audit/schema/live-raw.json
node scripts/audit-schema.mjs
```

الأمر الأول قراءة metadata فقط. الثاني يعيد بناء قاعدة معزولة ويحفظ المقارنة، ويحذف غلاف CLI المؤقت بعد حفظ اللقطة بصيغة UTF-8. لا يشغّل migrations على القاعدة الحية ولا يصلح الاختلافات تلقائيًا. لا تُعدّل لقطات `*-before.json`؛ فهي دليل الحالة السابقة لهذه المصالحة.
