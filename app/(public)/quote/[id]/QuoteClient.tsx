"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Decimal from "decimal.js";
import { quotationTotals, type SharedQuotation } from "@/lib/quotations/items";
import "./quotation.css";

const number = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
const money = (value: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
    return <div className="summary-row"><span className="font-semibold text-gray-700">{label}</span><strong>{children}</strong></div>;
}

export default function QuoteClient({ data }: { data: SharedQuotation }) {
    const products = data.parsed_items.products;
    const { itemsTotal, transportationCost, grandTotal } = quotationTotals(data.parsed_items);
    const clientName = data.guest_name || "العميل";
    const created = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { timeZone: "Africa/Cairo", year: "numeric", month: "long", day: "numeric" }).format(new Date(data.created_at));
    const totalQuantity = products.reduce((total, item) => total + item.quantity, 0);
    const productDescription = products.map(item => `عدد (${number(item.quantity)}) خزانات مياه بولي إيثيلين سعة ${item.capacity}`).join("، ");
    const transportDescription = transportationCost === 0 ? "السعر يشمل النقل والتوصيل" : `تكلفة النقل والتوصيل ${money(transportationCost)} جنيه، مضافة إلى إجمالي العرض`;
    return <div className="polytex-quotation quote-document" dir="rtl">
<div id="priceOfferContent" className="sheet">

    <div className="hero avoid-break">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
                <div className="pill mb-4">
                    <span>عرض سعر فني ومالي معتمد</span>
                    <span className="ltr-text">Official Quotation</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">عرض سعر توريد خزان مياه بولي إيثيلين</h1>
                <p className="mt-3 text-blue-100 text-lg">مقدم إلى السادة / {clientName}</p>
            </div>
            <div className="text-center md:text-left">
                <Image src="/quotations/poly.png" alt="شعار شركة بولي تكس" width={1536} height={1024} loading="eager" unoptimized className="quotation-logo w-36 h-auto inline-block bg-white rounded-2xl p-3 shadow-lg" />
            </div>
        </div>
    </div>

    <div className="p-6 md:p-10">

        <div className="meta-grid mb-6 avoid-break">
            <div className="soft-card">
                <h3 className="section-title">بيانات الجهة المقدمة</h3>
                <p className="text-xl font-extrabold text-gray-900">شركة بولي تكس للصناعات البلاستيكية</p>
                <p className="text-gray-600 mt-1">م. محمد إبراهيم - المدير التنفيذي</p>
                <p className="text-gray-700 mt-3"><strong>أرقام التواصل:</strong> <span className="ltr-text">01091008926 - 01224235523</span></p>
            </div>

            <div className="soft-card">
                <h3 className="section-title">بيانات العميل</h3>
                <p className="text-xl font-extrabold text-gray-900">{clientName}</p>
                <p className="text-gray-600 mt-1">السادة / إدارة المشروعات والمشتريات المحترمين</p>
                {data.guest_phone && <p className="text-gray-700 mt-3"><strong>هاتف العميل:</strong> <bdi>{data.guest_phone}</bdi></p>}
                <p className="text-gray-700 mt-3"><strong>تاريخ العرض:</strong> <span>{created}</span></p>
                <p className="text-gray-700 mt-1"><strong>صلاحية العرض:</strong> <span className="text-blue-900 font-bold">15 يوماً من تاريخه</span></p>
            </div>
        </div>

        <div className="company-grid mb-8">
            <div className="card avoid-break">
                <h2 className="section-title">خطاب العرض</h2>
                <p className="text-lg leading-8 text-gray-700">
                    تتشرف <strong>شركة بولي تكس POLYTEX</strong> بأن تتقدم لسيادتكم بعرض السعر الخاص بتوريد
                    {products.length > 0 ? <strong> {productDescription} </strong> : " خزانات المياه وفق البنود التي يتم اعتمادها، "}
                    وفقاً للمواصفات الفنية والخامات الموضحة في بنود العرض، ومعايير تصنيع خزانات مياه الشرب.
                    <strong> {transportDescription}.</strong>
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <span className="stamp">البضاعة حاضرة في المخازن</span>
                    <span className="stamp">خامات سابك بيور 100%</span>
                </div>
            </div>

            <div className="card">
                <h2 className="section-title">البيانات الرسمية للشركة</h2>
                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">السجل التجاري</span>
                        <span className="detail-value ltr-text">59876</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">البطاقة الضريبية</span>
                        <span className="detail-value ltr-text">723497265</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">الرقم الضريبي</span>
                        <span className="detail-value ltr-text">723497265</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">المسؤول التنفيذي</span>
                        <span className="detail-value">م. محمد إبراهيم</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">أرقام التواصل</span>
                        <span className="detail-value ltr-text">01091008926 - 01224235523</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">المقر الرئيسي</span>
                        <span className="detail-value">كوبري قلما خلف السيد مكاوي</span>
                    </div>
                </div>
            </div>
        </div>


        <div className="mb-8 avoid-break">
            <h2 className="section-title">جدول العرض الفني والمالي</h2>
            <div className="card quotation-table-scroll" role="region" aria-label="جدول الأصناف والأسعار" tabIndex={0}>
                <table aria-label="بنود عرض السعر">
                    <thead>
                        <tr>
                            <th className="w-12 text-center">م</th>
                            <th className="product-description">بيان الصنف والمواصفات</th>
                            <th className="whitespace-nowrap text-center">السعة</th>
                            <th className="whitespace-nowrap text-center">الكمية</th>
                            <th className="whitespace-nowrap text-center">سعر الوحدة</th>
                            <th className="whitespace-nowrap text-center">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item, index) => (
                            <tr key={index}>
                                <td className="font-bold text-center">{index + 1}</td>
                                <td className="product-description">
                                    <p className="font-extrabold text-gray-900 text-lg mb-1">خزان مياه بولي إيثيلين — {item.capacity}</p>
                                    <div className="text-sm text-gray-600 leading-7 space-y-1">
                                        <p>• <strong>الخامة والمواصفة:</strong> {item.material || "وفق المواصفة المعتمدة للبند"}.</p>
                                        <p>• <strong>نظام العزل:</strong> طبقات متكاملة للحماية، والعزل عن الضوء، ومنع تكون الطحالب والفطريات.</p>
                                        <p>• <strong>مقاومة العوامل الجوية:</strong> مزود بمثبتات الأشعة فوق البنفسجية (UV Stabilizers) لتحمل الحرارة والشمس المباشرة.</p>
                                        <p>• <strong>التصميم:</strong> قطعة واحدة مصبوبة بدون لحامات (Rotomolding)، مزودة بأحزمة تدعيم دائرية هندسية.</p>
                                        <p>• <strong>التوصيل:</strong> <span className="text-green-700 font-bold">{transportDescription}</span>.</p>
                                    </div>
                                </td>
                                <td className="font-bold text-center"><bdi>{item.capacity}</bdi></td>
                                <td className="font-bold whitespace-nowrap text-center">{number(item.quantity)} خزانات</td>
                                <td className="font-bold text-lg whitespace-nowrap text-center"><bdi>{number(item.price)} ج</bdi></td>
                                <td className="font-bold text-lg text-blue-900 whitespace-nowrap text-center"><bdi>{number(new Decimal(item.price).times(item.quantity).toDecimalPlaces(2).toNumber())} ج</bdi></td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
            {products.length === 0 && <p role="status" className="quote-empty">لم تُحدد بنود مسعّرة بعد.</p>}
        </div>

        <div className="quotation-columns mb-8">
            <section className="pricing-card avoid-break" aria-labelledby="pricing-title">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 id="pricing-title" className="section-title mb-0">ملخص التسعير</h2>
                    <span className="calc-chip">{transportationCost === 0 ? "سعر نهائي شامل النقل" : "الإجمالي يشمل تكلفة النقل"}</span>
                </div>
                {products.length === 1 && <SummaryRow label={"سعر الوحدة (خزان " + products[0].capacity + ")"}><bdi>{money(products[0].price)} جنيه</bdi></SummaryRow>}
                <SummaryRow label="الكمية المطلوبة">{number(totalQuantity)} خزانات</SummaryRow>
                <SummaryRow label="إجمالي قيمة الخزانات"><bdi data-testid="items-total">{money(itemsTotal)} جنيه</bdi></SummaryRow>
                <SummaryRow label="النقل والتوصيل">
                    <span className="text-green-700" data-testid="transport-total">{transportationCost === 0 ? "شامل ضمن السعر" : <bdi>{money(transportationCost)} جنيه</bdi>}</span>
                </SummaryRow>
                <SummaryRow label="ضريبة القيمة المضافة (VAT)"><span className="text-amber-700">غير شامل ضريبة القيمة المضافة</span></SummaryRow>
                <div className="summary-row pt-3">
                    <span className="font-extrabold text-gray-900 text-lg">الإجمالي الصافي المستحق</span>
                    <bdi className="grand-total" data-testid="grand-total">{money(grandTotal)} جنيه</bdi>
                </div>
                <p className="text-xs text-gray-500 mt-2">جميع المبالغ الواردة في هذا العرض بالجنيه المصري.</p>
            </section>
            <section className="card avoid-break">
                <h2 className="section-title">ملخص بيانات التوريد</h2>
                <div className="space-y-3 text-gray-700 leading-7">
                    <p><strong>العميل:</strong> {clientName}.</p>
                    <p><strong>الأصناف:</strong> {products.map(item => item.capacity).join("، ") || "لم تُحدد بعد"}.</p>
                    <p><strong>الكمية:</strong> {number(totalQuantity)} خزانات.</p>
                    {products.length === 1 && <p><strong>سعر الخزان:</strong> <bdi className="font-bold">{number(products[0].price)}</bdi> جنيه.</p>}
                    <p><strong>إجمالي أمر التوريد:</strong> <bdi className="font-bold text-blue-900">{money(grandTotal)}</bdi> جنيه مصري.</p>
                    <p><strong>المواصفة الفنية:</strong> {Array.from(new Set(products.map(item => item.material).filter(Boolean))).join("، ") || "وفق البنود المعتمدة"}.</p>
                    <p><strong>وجهة التسليم:</strong> موقع العميل المتفق عليه.</p>
                    <p><strong>حالة الضريبة:</strong> الأسعار غير شاملة ضريبة القيمة المضافة.</p>
                    <p><strong>صلاحية السعر:</strong> سارٍ لمدة 15 يوماً من تاريخ تقديم العرض.</p>
                </div>
            </section>
        </div>


        <div className="mb-8 avoid-break">
            <h2 className="section-title">المواصفات الفنية التفصيلية</h2>
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 leading-8">
                    <div>
                        <h3 className="font-extrabold text-gray-900 mb-2 text-base flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
                            الخامة ونظام الطبقات (Food Grade):
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>الطبقة الخارجية (بيضاء):</strong>
                                تعمل على عكس أشعة الشمس والحرارة، ومزودة بمثبتات الأشعة فوق البنفسجية UV لحماية جسم الخزان من التآكل أو التشقق الجوي.
                            </li>
                            <li>
                                <strong>الطبقة الوسطى (سوداء معتمة كربونية):</strong>
                                تمنع نفاذ الضوء بنسبة 100% إلى داخل الخزان، مما يمنع تماماً نمو وتكاثر الطحالب والبكتيريا والفطريات ويحافظ على عذوبة ونقاء المياه.
                            </li>
                            <li>
                                <strong>الطبقة الداخلية (بيضاء ناصعة ملساء):</strong>
                                مصنعة من بولي إيثيلين بيور عالي النقاء مصرح به للأغذية ومياه الشرب (Food Grade)، سطحها فائق النعومة لمنع ترسب الأملاح والشوائب ولا يتفاعل كيميائياً مع الماء.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-gray-900 mb-2 text-base flex items-center gap-2">
                            <span className="w-3 h-3 bg-teal-600 rounded-full inline-block"></span>
                            الهيكل الهندسي والتجهيزات:
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>تصنيع قالب واحد (Rotomolding):</strong> الخزان مصنع ككتلة واحدة ملساء بدون أي فواصل أو لحامات نهائياً لتلافي حدوث أي تسريب طوال فترة التشغيل.
                            </li>
                            <li>
                                <strong>أحزمة تدعيم دائرية:</strong> حلقات تدعيم خارجية بارزة تمنح الجدران صلابة استثنائية لمقاومة ضغط وتمدد كتل المياه الضخمة.
                            </li>
                            <li>
                                <strong>جلب نحاسية معتمدة:</strong> مزود بفتحات ومخارج نحاسية أصلية مانعة للتسريب لسهولة توصيل مواسير الدخول والخروج والفايض.
                            </li>
                            <li>
                                <strong>فتحة علوية وغطاء محكم:</strong> مزود بفتحة علوية واسعة مناسبة لأعمال الكشف والصيانة الدورية مع غطاء محكم لحجب الأتربة والشوائب.
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="stamp">خامات سابك السعودية - بولي إيثيلين نقي 100% بيور</div>
                    <div className="stamp">مطابق للمواصفات القياسية لوزارة الصحة المصرية</div>
                </div>
            </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 avoid-break">
            <div className="card">
                <h2 className="section-title">الشروط والأحكام</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-7">
                    <li><strong>صلاحية عرض السعر:</strong> العرض سارٍ لمدة <strong>15 يوماً</strong> من تاريخ إصداره.</li>
                    <li><strong>النقل والشحن:</strong> {transportDescription} إلى موقع العميل المتفق عليه.</li>
                    <li><strong>الضريبة:</strong> الأسعار الموضحة أعلاه <strong>غير شاملة ضريبة القيمة المضافة</strong>.</li>
                    <li><strong>مدة التوريد:</strong> البضاعة حاضرة بالمخازن والتوريد يتم فور اعتماد أمر التوريد والتنسيق الموقعي.</li>
                    <li><strong>طريقة السداد:</strong> يتم السداد وفقاً للاتفاق المعتمد بين الطرفين.</li>
                </ol>
            </div>

            <div className="card">
                <h2 className="section-title">التوقيع والاعتماد</h2>
                <div className="mt-4">
                    <p className="font-semibold text-gray-800">وتفضلوا بقبول فائق الاحترام والتقدير،،،</p>
                    <p className="signature text-blue-800 mt-3">م. محمد إبراهيم</p>
                    <p className="text-gray-600 mt-1 font-bold">المدير التنفيذي - شركة بولي تكس POLYTEX</p>
                    <p className="text-gray-500 mt-1 text-sm">هاتف: 01091008926 - 01224235523</p>
                </div>
            </div>
        </div>

    </div>
</div>


        <div className="quotation-export">
            <button type="button" onClick={() => window.print()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                تصدير العرض بصيغة PDF
            </button>
            <p>اختر «حفظ بصيغة PDF» من نافذة الطباعة.</p>
        </div>
    </div>;
}
