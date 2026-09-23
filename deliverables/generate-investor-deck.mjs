import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// 1. Read Font and Image Assets as Base64
console.log('Loading fonts and image assets...');
const fontCairoArabic = await readFile('node_modules/@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2');
const fontCairoLatin = await readFile('node_modules/@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2');

const logoMomayaz = await readFile('public/LOGOMOMAYAZ.png');
const shotDashboard = await readFile('audit/design/dashboard-desktop.png');
const shotQuotation = await readFile('audit/quotation/desktop.png');
const shotPayroll = await readFile('audit/batch4/payroll-Batch4-cb5a0530-031d-4153-ad7b-8eb673cedb16.png');
const shotShortage = await readFile('audit/batch3/shortage-Batch3-d4777b91-3887-4b6b-b944-76a8fea71c4f.png');

console.log('All assets loaded successfully.');

const b64 = (buf, mime) => `data:${mime};base64,${buf.toString('base64')}`;

const imgLogo = b64(logoMomayaz, 'image/png');
const imgDashboard = b64(shotDashboard, 'image/png');
const imgQuotation = b64(shotQuotation, 'image/png');
const imgPayroll = b64(shotPayroll, 'image/png');
const imgShortage = b64(shotShortage, 'image/png');

// Helper to construct pages
const pages = [];
function addPage(sectionKicker, pageTitle, contentHtml) {
  pages.push({ sectionKicker, pageTitle, contentHtml });
}

// ==========================================
// PAGE 1: COVER
// ==========================================
pages.push({
  isCover: true,
  contentHtml: `
    <div class="cover-container">
      <div class="cover-header">
        <div class="cover-brand-wrap">
          <img src="${imgLogo}" alt="شعار مميز" class="cover-logo-img" />
          <div class="cover-brand-text">
            <span class="cover-brand-name">مميز للأنظمة والمنتجات الرقمية</span>
            <span class="cover-brand-sub" dir="ltr">Momayaz Digital Products &amp; Software</span>
          </div>
        </div>
        <div class="cover-confidential-badge">
          <span>مستند استثماري سري</span>
          <span class="badge-dot"></span>
          <span dir="ltr">CONFIDENTIAL MEMORANDUM</span>
        </div>
      </div>

      <div class="cover-body">
        <div class="cover-tag">فرصة استثمارية واعدة · قطاع البرمجيات الصناعية السحابية B2B Industrial SaaS</div>
        <h1 class="cover-main-title">
          نظام مميز لإدارة المصانع<br />
          <span class="gradient-text">Momayaz Factory ERP</span>
        </h1>
        <p class="cover-lead-desc">
          منظومة التشغيل والرقابة المتكاملة للمصانع والمنشآت الإنتاجية (The All-in-One Manufacturing OS)، لربط المبيعات، التصنيع، المخزون، الحسابات، وأجور العمال في مساحة سحابية موحدة فائقة الأمان.
        </p>

        <div class="cover-mockup-wrapper">
          <div class="mockup-frame">
            <div class="mockup-topbar">
              <span class="mockup-dot red"></span>
              <span class="mockup-dot yellow"></span>
              <span class="mockup-dot green"></span>
              <span class="mockup-url" dir="ltr">app.momayaz-erp.com/dashboard</span>
            </div>
            <img src="${imgDashboard}" alt="لوحة التحكم" class="mockup-img" />
          </div>
        </div>

        <div class="cover-pills-row">
          <div class="cover-pill">
            <span class="pill-icon">✓</span>
            <div>
              <strong>منتج ناضج ومُثبت ميدانياً</strong>
              <p>مُشغّل ومختبر على خطوط إنتاج حقيقية</p>
            </div>
          </div>
          <div class="cover-pill">
            <span class="pill-icon">✓</span>
            <div>
              <strong>ذكاء اصطناعي وأمان عسكري</strong>
              <p>عروض أسعار ذكية وتشفير AES-256</p>
            </div>
          </div>
          <div class="cover-pill">
            <span class="pill-icon">✓</span>
            <div>
              <strong>سوق مستهدف ضخم</strong>
              <p>1.8 مليار دولار في الشرق الأوسط</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cover-footer-meta">
        <div class="meta-item">
          <span class="meta-label">طبيعة المستند</span>
          <span class="meta-val">مذكرة استثمارية (Seed Round)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">التاريخ والنسخة</span>
          <span class="meta-val">سبتمبر 2026 · إصدار 1.0</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">الجهة المطوّرة</span>
          <span class="meta-val">شركة مميز للحلول والبرمجيات</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">التوجيه الاستثماري</span>
          <span class="meta-val">لصناديق رأس المال والمستثمرين المؤهلين</span>
        </div>
      </div>
    </div>
  `
});

// ==========================================
// PAGE 2: EXECUTIVE SUMMARY & INVESTMENT PILLARS
// ==========================================
addPage('الملخص التنفيذي · Executive Summary', 'الرؤية الاستثمارية وركائز النمو الاستراتيجي', `
  <div class="section-intro">
    يمثل <strong>نظام مميز لإدارة المصانع</strong> قفزة نوعية في رقمنة القطاع الصناعي في منطقة الشرق الأوسط وشمال أفريقيا، حيث ينقل المصانع المتوسطة والصغيرة من عشوائية الدفاتر الورقية وجداول الإكسيل المشتتة إلى منظومة تشغيل سحابية محكمة تضبط تدفق الخامات، توقف الهدر المالي، وتربط إدارة المصنع بالإنتاج لحظة بلحظة.
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-num" dir="ltr">46+</div>
      <div class="kpi-label">جدول وكيان تشغيلي</div>
      <div class="kpi-desc">بنية بيانات مؤسسية تغطي دورة العمل المغلقة بالكامل دون ثغرات</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" dir="ltr">35%</div>
      <div class="kpi-label">متوسط خفض الهدر والتسريب</div>
      <div class="kpi-desc">في استهلاك الخامات وأجور العمالة غير المحسوبة والمشتريات</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num" dir="ltr">$1.8B+</div>
      <div class="kpi-label">حجم السوق المتاح (TAM)</div>
      <div class="kpi-desc">أكثر من 120 ألف مصنع وورشة إنتاجية في الشرق الأوسط وشمال أفريقيا</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-num highlight" dir="ltr">16.6x</div>
      <div class="kpi-label">نسبة LTV / CAC المستهدفة</div>
      <div class="kpi-desc">اقتصاديات وحدة فائقة الكفاءة بفضل نموذج B2B SaaS عالي الالتصاق</div>
    </div>
  </div>

  <h3 class="subsection-title">ركائز الاستثمار الأربع الأساسية (Core Investment Pillars)</h3>

  <div class="pillars-grid">
    <div class="pillar-box">
      <div class="pillar-header">
        <span class="pillar-num">٠١</span>
        <h4>منتج ناضج ومُتحقق منه ميدانياً (Battle-Tested Product)</h4>
      </div>
      <p>
        ليس مجرد نموذج أولي أو تصميم على ورق؛ النظام مبني ومختبر في بيئة تشغيل لمصنع حقيقي (صناعة خزانات وبلاستيك تحويلي). تم التحقق من 30 ترقية قاعدة بيانات، ومعادلات التصنيع (BOM)، والفوترة، والعمالة، مع صفر أخطاء تشغيلية واعتماد كامل من فرق العمل الميدانية.
      </p>
    </div>

    <div class="pillar-box">
      <div class="pillar-header">
        <span class="pillar-num">٠٢</span>
        <h4>فجوة سوقية هائلة وغير مخدومة (Massive Underserved Market)</h4>
      </div>
      <p>
        تعاني المصانع من فجوة مريرة بين برامج الحسابات البسيطة التي تعجز عن فهم التصنيع، والبرمجيات العالمية (SAP, Oracle) الباهظة والبالغة التعقيد. يمثل "مميز" الخيار الأمثل والوحيد المصمم خصيصاً للواقع الصناعي العربي من البوابة إلى الخزينة.
      </p>
    </div>

    <div class="pillar-box">
      <div class="pillar-header">
        <span class="pillar-num">٠٣</span>
        <h4>نموذج إيرادات سحابي متكرر عالي الالتصاق (High Sticky SaaS)</h4>
      </div>
      <p>
        بمجرد أن يبدأ المصنع في إدارة خاماته ووصفات منتجاته وحسابات عماله ومورديه عبر النظام، تصبح تكلفة الانتقال لنظام آخر شبه مستحيلة (High Switching Cost)، مما يضمن معدل استبقاء عملاء يتجاوز 92% وإيرادات متكررة مستمرة ومتنامية تلقائياً.
      </p>
    </div>

    <div class="pillar-box">
      <div class="pillar-header">
        <span class="pillar-num">٠٤</span>
        <h4>خندق تقني وأمان مؤسسي غير مسبوق (Deep Technical Moat)</h4>
      </div>
      <p>
        بُني النظام بأحدث معايير الأمان Zero-Trust مع حماية RLS على مستوى قاعدة البيانات، وأرشفة مشفرة عسكرياً بـ AES-256-GCM مُختبرة للاستعادة الكاملة في 43 ثانية، مع خط مزامنة لحظي مع جداول Google Sheets للمرونة الإدارية الفورية.
      </p>
    </div>
  </div>

  <div class="key-takeaways-panel">
    <div class="takeaway-item">
      <strong>جاهزية التوسع المباشر:</strong> النظام لا يتطلب سنوات تطوير إضافية؛ المعمارية جاهزة للتوسع السحابي الفوري في مصر والسعودية.
    </div>
    <div class="takeaway-item">
      <strong>كفاءة رأسمالية استثنائية:</strong> لا نحرق أموالاً طائلة على الاستحواذ العشوائي؛ استراتيجية البيع المباشر للمجمعات الصناعية تحقق عائداً سريعاً.
    </div>
  </div>

  <div class="callout-box">
    <strong>خلاصة الفرصة:</strong> نحن نستثمر في شركة تمتلك منتجاً برمجياً جاهزاً للتوسع السريع، في توقيت يشهد فيه العالم العربي طفرة صناعية حكومية كبرى وإلزاماً متزايداً للتحول الرقمي والفوترة الإلكترونية وتوطين سلاسل الإمداد.
  </div>
`);

// ==========================================
// PAGE 3: THE MARKET PROBLEM & OPPORTUNITY
// ==========================================
addPage('سوق الصناعة والفرصة · Market & Problem', 'المشكلة الحقيقية في المصانع وحجم الفرصة المتاحة', `
  <div class="section-intro">
    يعتمد أكثر من 85% من أصحاب المصانع الصغيرة والمتوسطة في الشرق الأوسط على مزيج فوضوي من الدفاتر الورقية وجداول الإكسيل والمذكرات الشفوية. هذا النقص الحاد في الأتمتة يتسبب في خسائر مالية فادحة تعادل 15% إلى 25% من أرباح المصنع السنوية نتيجة الهدر وعدم انضباط الحسابات.
  </div>

  <div class="pain-points-grid">
    <div class="pain-card">
      <div class="pain-badge">عجز البرامج الحسابية</div>
      <h4>برامج الحسابات التقليدية غير صالحة للمصانع</h4>
      <p>
        برامج المحاسبة المتاحة في السوق العربي صُممت للمحلات التجارية والمستودعات الثابتة؛ فهي تسجل ما حدث في الماضي فقط ولا تفهم أوامر الشغل، ولا تدعم معادلات الخلط والإنتاج، ولا تخصم الخامات آلياً مع كل تشغيلة.
      </p>
    </div>

    <div class="pain-card">
      <div class="pain-badge">فشل الأنظمة العالمية</div>
      <h4>أنظمة الـ ERP العالمية معقدة وباهظة التكلفة</h4>
      <p>
        أنظمة مثل SAP وOracle وDynamics تطلب استثمارات تفوق 50,000$ إلى 150,000$ وتستغرق شهوراً طويلة في التطبيق، وتفشل في 70% من الحالات لدى المصانع المحلية لعدم توافقها مع ثقافة العمالة والإدارة اليومية.
      </p>
    </div>

    <div class="pain-card">
      <div class="pain-badge">نزيف الأرباح والهدر</div>
      <h4>ضياع الخامات وفوضى الحسابات والعمال</h4>
      <p>
        غياب الرقابة اللحظية يؤدي إلى سرقة وهدر الخامات البلاستيكية والمعدنية، تداخل مواعيد تحصيل الشيكات، أخطاء متكررة في حسابات الموردين، ونزاعات أسبوعية في حساب أجور وسلف العمال اليومية وغياب الرؤية الربحية للمنتج.
      </p>
    </div>
  </div>

  <h3 class="subsection-title">حجم السوق المتاح والفرصة الاستثمارية (TAM - SAM - SOM)</h3>

  <div class="tam-sam-som-container">
    <div class="tam-bar">
      <div class="tam-header">
        <span class="market-tag">TAM · السوق الكلي المتاح في الشرق الأوسط وشمال أفريقيا</span>
        <strong dir="ltr">$1.8B / سنوياً</strong>
      </div>
      <p>أكثر من 120,000 مصنع وورشة إنتاجية متوسطة وصغيرة في مصر، السعودية، الإمارات، الكويت، قطر، عمان، وشمال أفريقيا، بمعدل إنفاق برمجي متوقع 15,000$ سنوياً للمصنع.</p>
    </div>

    <div class="sam-bar">
      <div class="sam-header">
        <span class="market-tag">SAM · السوق المخدوم المتاح المباشر</span>
        <strong dir="ltr">$420M / سنوياً</strong>
      </div>
      <p>35,000 مصنع نشط في مصر والمملكة العربية السعودية يركزون على الصناعات التحويلية، البلاستيك والبتروكيماويات، الخزانات، التعبئة والتغليف، المعادن، والمشغولات الهندسية.</p>
    </div>

    <div class="som-bar">
      <div class="som-header">
        <span class="market-tag">SOM · السوق المستهدف تحقيقه (3 سنوات)</span>
        <strong dir="ltr">$18M ARR</strong>
      </div>
      <p>الاستحواذ على 1,500 مصنع مشترك خلال 3 سنوات (يمثل 4.3% فقط من السوق المتاح في مصر والسعودية)، بمتوسط إيراد سنوي متكرر $12,000 لكل منشأة صناعية.</p>
    </div>
  </div>

  <div class="why-now-box">
    <h4>لماذا التوقيت الحالي هو التوقيت المثالي للاستثمار؟ (Why Now?)</h4>
    <ul>
      <li><strong>الإلزام الحكومي بالفوترة الإلكترونية:</strong> تسريع وتيرة التحول الرقمي الإجباري من قبل مصلحة الضرائب المصرية وهيئة الزكاة والضريبة والجمارك السعودية (ZATCA Phase 2).</li>
      <li><strong>التوجه القومي لتوطين الصناعة:</strong> مبادرات حكومية كبرى لتطوير المصانع المحلية وتسهيل تمويل رقمنة خطوط الإنتاج ورفع كفاءة سلاسل الإمداد.</li>
      <li><strong>صعود جيل جديد من مديري المصانع:</strong> تولي أجيال شابة ومتعلمة إدارة المصانع العائلية، تبحث عن حلول سحابية عصرية وسريعة تعمل من الموبايل والتابلت.</li>
    </ul>
  </div>
`);

// ==========================================
// PAGE 4: THE SOLUTION & COMPARISON MATRIX
// ==========================================
addPage('الحل المتكامل · The Solution', 'مميز: نظام التشغيل المتكامل للمصنع', `
  <div class="section-intro">
    يقدم <strong>مميز ERP</strong> حلاً جذرياً وشاملاً: نظام تشغيل رقمي موحد (Manufacturing OS) مصمم بالكامل باللغة العربية، يربط كافة مفاصل المصنع في دورة تشغيلية مغلقة تضمن الشفافية والرقابة من لحظة طلب العميل وحتى خروج المنتج وصرف الأرباح.
  </div>

  <div class="workflow-diagram-container">
    <div class="wf-title">دورة العمل التشغيلية المغلقة في نظام مميز (End-to-End Factory Loop)</div>
    <div class="wf-steps">
      <div class="wf-step">
        <span class="wf-num">١</span>
        <strong>العميل والطلب</strong>
        <p>عرض سعر بالـ AI ومشاركة عبر رابط تفاعلي</p>
      </div>
      <div class="wf-arrow">←</div>
      <div class="wf-step">
        <span class="wf-num">٢</span>
        <strong>أمر الشغل والمواصفات</strong>
        <p>تحديد الأبعاد، المقاسات، والطبقات بدقة</p>
      </div>
      <div class="wf-arrow">←</div>
      <div class="wf-step">
        <span class="wf-num">٣</span>
        <strong>الوصفة والتصنيع (BOM)</strong>
        <p>خصم آلي فوري للخامات ومنع الهدر</p>
      </div>
      <div class="wf-arrow">←</div>
      <div class="wf-step">
        <span class="wf-num">٤</span>
        <strong>الفوترة والتحصيل</strong>
        <p>ترقيم ذري، كشف حساب، ومحفظة شيكات</p>
      </div>
      <div class="wf-arrow">←</div>
      <div class="wf-step">
        <span class="wf-num">٥</span>
        <strong>الموردين والعمال</strong>
        <p>أجور أسبوعية وسلف وحسابات موردين محكمة</p>
      </div>
    </div>
  </div>

  <h3 class="subsection-title">مقارنة تنافسية توضح تفوق نظام "مميز" في السوق الصناعي</h3>

  <table class="comp-table">
    <thead>
      <tr>
        <th style="width: 25%;">معيار التقييم</th>
        <th style="width: 22%; background: #1e40af; color: #fff;">مميز لإدارة المصانع</th>
        <th style="width: 18%;">برامج الحسابات العربية</th>
        <th style="width: 18%;">الأنظمة العالمية (SAP/Odoo)</th>
        <th style="width: 17%;">جداول Excel والدفاتر</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>دعم منطق التصنيع الفعلي (BOM)</strong></td>
        <td class="check-pos">✓ كامل ومربوط بالخصم الآلي</td>
        <td class="check-neg">✗ غير متوفر أو شكلي فقط</td>
        <td class="check-pos">✓ متوفر ولكن شديد التعقيد</td>
        <td class="check-neg">✗ يدوي وعرضة للخطأ</td>
      </tr>
      <tr>
        <td><strong>حسابات أجور العمالة اليومية والأسبوعية</strong></td>
        <td class="check-pos">✓ مصمم لطبيعة العمالة باليومية</td>
        <td class="check-neg">✗ رواتب شهرية مكتبية فقط</td>
        <td class="check-neg">✗ يتطلب تخصيصات باهظة</td>
        <td class="check-warn">▲ دفاتر وسجلات ورقية فوضوية</td>
      </tr>
      <tr>
        <td><strong>عروض أسعار ذكية ومشاركة سريعة</strong></td>
        <td class="check-pos">✓ ذكاء اصطناعي + روابط تفاعلية</td>
        <td class="check-neg">✗ طباعة تقليدية فقط</td>
        <td class="check-neg">✗ يحتاج إعدادات وبوابات معقدة</td>
        <td class="check-neg">✗ غير مدعوم إطلاقاً</td>
      </tr>
      <tr>
        <td><strong>تكلفة الامتلاك وسرعة التشغيل</strong></td>
        <td class="check-pos">✓ اشتراك شهري معتدل، تشغيل فوري</td>
        <td class="check-warn">▲ رسوم ترخيص سنوية معقدة</td>
        <td class="check-neg">✗ تكلفة فلكية ($50k+) وتطبيق طويل</td>
        <td class="check-pos">✓ مجاني ولكن كلفته هدر وخسائر</td>
      </tr>
      <tr>
        <td><strong>سهولة الاستخدام للعمال والمهندسين</strong></td>
        <td class="check-pos">✓ واجهة عربية واضحة لأي عامل</td>
        <td class="check-warn">▲ شاشات قديمة ومحاسبية بحتة</td>
        <td class="check-neg">✗ تدريب شاق ومقاومة مستخدمين</td>
        <td class="check-warn">▲ يتطلب خبيراً متخصصاً</td>
      </tr>
      <tr>
        <td><strong>الأمان واستعادة البيانات من الكوارث</strong></td>
        <td class="check-pos">✓ تشفير AES-256 واستعادة بـ 43 ثانية</td>
        <td class="check-neg">✗ نسخ يدوي عرضة للتلف والفيروسات</td>
        <td class="check-pos">✓ أمان عالي ولكن إدارة مكلفة</td>
        <td class="check-neg">✗ انعدام الأمان وفقدان دائم محتمل</td>
      </tr>
    </tbody>
  </table>

  <div class="callout-box">
    <strong>الميزة التنافسية الحاسمة (The Moat):</strong> "مميز" لا يبيع مجرد برنامج، بل يقدم "طريقة عمل قياسية" مُجربة تثبت انضباطها في المصانع فور تفعيلها، مما يلغي تماماً الحاجة لخبراء برمجة أو مستشارين ماليين مكلفين.
  </div>
`);

// ==========================================
// PAGE 5: CORE MODULES (1) SALES & AI QUOTING
// ==========================================
addPage('الوحدات الوظيفية · Core Modules', 'المبيعات وعروض الأسعار الذكية بالذكاء الاصطناعي', `
  <div class="section-intro">
    تعتبر دورة المبيعات في المصانع شريان التدفق المالي؛ لذا صُممت وحدة المبيعات في "مميز" لتمنح فريق المبيعات السرعة القصوى في الرد على العملاء، مع ضبط كامل لشروط الائتمان وفترات السداد وإصدار الفواتير فور الاعتماد.
  </div>

  <div class="feature-two-col">
    <div class="feature-list-side">
      <div class="feature-item-card">
        <div class="feat-badge">AI Assistant</div>
        <h4>محرك عروض الأسعار الذكي بالذكاء الاصطناعي</h4>
        <p>
          يقوم النظام بتحويل نصوص رسائل الواتساب أو الطلبات الهاتفية غير المنتظمة إلى عروض أسعار رسمية متكاملة بضغطة زر واحدة، مع احتساب أسعار المنتجات، المواصفات، وتكلفة النقل تلقائياً ودون تدخل يدوي.
        </p>
        <ul class="feat-bullets">
          <li>فهم ذكي للمقاسات، الأطوال، وعدد الطبقات.</li>
          <li>تطبيق سياسات الخصم المعتمدة وفق فئة العميل.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Instant Share</div>
        <h4>روابط مشاركة تفاعلية آمنة ومحمية (Tokenized Links)</h4>
        <p>
          يستطيع مسؤول المبيعات توليد رابط تفاعلي فوري ومشاركته مع العميل عبر الواتساب للاطلاع على تفاصيل عرضه دون الحاجة لطباعة ورقية أو إرسال ملفات PDF ثقيلة، مع كود تشفيري يمنع أي وصول غير مصرح به.
        </p>
        <ul class="feat-bullets">
          <li>عرض متجاوب بالكامل على شاشات الموبايل.</li>
          <li>حماية أمنية مشددة تمنع الفهرسة أو تسريب الرمز.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Client Portal &amp; CRM</div>
        <h4>إدارة العملاء وكشوف الحسابات اللحظية</h4>
        <p>
          سجل كامل لكل عميل، تصنيفه (تاجر، مقاول، مستهلك، شركة)، تحديد فترات الائتمان، كشف حساب تفصيلي يوضح الفواتير، الدفعات، الشيكات، والمرتجعات، مع تنبيه فوري بالمديونيات المتأخرة.
        </p>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Work Orders</div>
        <h4>أوامر الشغل ومواصفات المنتجات المتعددة</h4>
        <p>
          تحويل عرض السعر المعتمد مباشرة إلى أمر شغل إنتاجي بالمواصفات الهندسية (السعة، الأبعاد، عدد الطبقات، اللون، وسماكة الجدار) لضمان تسليم العميل ما طلبه حرفياً.
        </p>
      </div>
    </div>

    <div class="feature-image-side">
      <div class="screenshot-box">
        <div class="box-header">معاينة حقيقية: شاشة عروض الأسعار ومشاركتها مع العميل</div>
        <img src="${imgQuotation}" alt="شاشة عروض الأسعار" class="inner-screenshot tall-screenshot" />
        <div class="box-caption">نظام عروض الأسعار التفاعلي: يتيح حساب تكاليف النقل والمنتجات وإصدار رمز مشاركة مشفر للعميل عبر الواتساب.</div>
      </div>
      
      <div class="mini-stats-box">
        <div class="mini-stat">
          <strong dir="ltr">60 Sec</strong>
          <span>متوسط إصدار عرض سعر متكامل</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">100%</strong>
          <span>دقة الحسابات ومنع أخطاء التسعير</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">Zero</strong>
          <span>حاجة لتثبيت تطبيقات لدى العميل</span>
        </div>
      </div>

      <div class="impact-mini-panel">
        <strong>الأثر التشغيلي في المصنع:</strong> تقليص زمن إغلاق صفقات التوريد بنسبة 70% وتفادي النزاعات حول المواصفات والأسعار عبر سجل عروض موثق إلكترونياً.
      </div>
    </div>
  </div>
`);

// ==========================================
// PAGE 6: CORE MODULES (2) MANUFACTURING & INVENTORY
// ==========================================
addPage('الوحدات الوظيفية · Core Modules', 'الإنتاج ومعادلات التشغيل والمخزون والموردين', `
  <div class="section-intro">
    يعد التحكم في الخامات ومعادلات التشغيل قلب العملية الصناعية. يوفر النظام رقابة صارمة على أرصدة المواد الأولية، مع ربط مباشر بين أوامر الإنتاج وحركات المخزون الفعلية لمنع تسريب الخامات.
  </div>

  <div class="feature-two-col">
    <div class="feature-list-side">
      <div class="feature-item-card">
        <div class="feat-badge">Production BOM</div>
        <h4>معادلات الإنتاج ووصفات التشغيل (Bill of Materials)</h4>
        <p>
          تحديد المكونات الدقيقة لكل صنف (نسب البوليمر، الملدنات، صبغات الألوان، ومثبتات الـ UV)، مع ضبط أوزان الطبقات العازلة. تُحفظ الوصفات بصلاحية إدارية محكمة تمنع تلاعب العمال بمقادير الجودة.
        </p>
        <ul class="feat-bullets">
          <li>حساب التكلفة التقديرية والفعلية لكل صنف.</li>
          <li>حماية سر الصنعة ومعادلات الخلط المعتمدة.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Atomic Stock Deduction</div>
        <h4>الخصم الآلي اللحظي للخامات ومنع الهدر</h4>
        <p>
          بمجرد تسجيل إنتاج أمر الشغل، يقوم النظام بخصم كميات الخامات بدقة متناهية عبر Triggers برمجية تمنع الأرصدة السالبة وتلغي العملية تلقائياً عند عدم كفاية المخزون، مما يمنع ظاهرة الهدر والتسريب الخفي.
        </p>
        <ul class="feat-bullets">
          <li>منع الازدواجية في الخصم عند تعدد الورديات.</li>
          <li>تسجيل الهالك وإعادة التدوير بحركات وارد مستقلة.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Smart Alerts</div>
        <h4>لوحة مراقبة النواقص والحدود الدنيا للأمان</h4>
        <p>
          تنبيهات استباقية ملونة توضح الخامات التي قاربت على النفاد، مع مؤشرات واضحة للحد الأدنى اللازم لكل مادة خام لتفادي التوقف المفاجئ لخطوط الإنتاج والماكينات.
        </p>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Suppliers Ledger</div>
        <h4>إدارة حسابات الموردين وفواتير الخامات</h4>
        <p>
          كشف حساب آلي للمورد (رصيد افتتاحي + فواتير خامات مسعرة وموزونة - سداد نقدية أو شيكات)، مع منع المعاملات مجهولة المصدر لضمان سلامة التدفق المالي للمصنع.
        </p>
      </div>
    </div>

    <div class="feature-image-side">
      <div class="screenshot-box">
        <div class="box-header">معاينة حقيقية: مراقبة النواقص وأرصدة الخامات الحرجة</div>
        <img src="${imgShortage}" alt="شاشة مراقبة النواقص" class="inner-screenshot tall-screenshot" />
        <div class="box-caption">لوحة تنبيهات الخامات: إشعار فوري لمدير الإنتاج فور وصول أي مادة للحد الأدنى لطلب الشراء لتفادي تعطل الخطوط.</div>
      </div>

      <div class="mini-stats-box">
        <div class="mini-stat">
          <strong dir="ltr">0%</strong>
          <span>احتمالية حدوث رصيد مخزون سالب</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">100%</strong>
          <span>مطابقة الوارد مع فواتير الموردين</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">Real-time</strong>
          <span>تتبع استهلاك المواد في كل منتج تام</span>
        </div>
      </div>

      <div class="impact-mini-panel">
        <strong>الأثر التشغيلي في المصنع:</strong> القضاء التام على الفروقات الجردية المفاجئة في نهاية العام، وخفض تكلفة التخزين الراكد بنسبة 25% بفضل دقة إعادة الطلب.
      </div>
    </div>
  </div>
`);

// ==========================================
// PAGE 7: CORE MODULES (3) INVOICES & PAYROLL
// ==========================================
addPage('الوحدات الوظيفية · Core Modules', 'الفوترة، الشيكات، وإدارة العمالة والرواتب', `
  <div class="section-intro">
    تعتمد استدامة المصنع على انضباط التحصيل المالي ودقة احتساب أجور العمالة اليومية. صمم النظام وحدات حسابية مشددة تمنع الفجوات المالية وتضمن العدالة والشفافية التامة مع فريق العمل.
  </div>

  <div class="feature-two-col">
    <div class="feature-list-side">
      <div class="feature-item-card">
        <div class="feat-badge">Atomic Invoicing</div>
        <h4>الترقيم الذري للفواتير ومنع الفجوات المحاسبية</h4>
        <p>
          محرك فواتير ذكي يوفر ترقيماً تسلسلياً مانعاً للتكرار أو التلاعب، يدعم البيع المباشر وأوامر الشغل المتعددة، مع توافق كامل للاستعداد لمتطلبات الفاتورة الإلكترونية والربط الضريبي.
        </p>
        <ul class="feat-bullets">
          <li>فواتير نقدية وآجلة مع تسجيل الدفعات الجزئية.</li>
          <li>دعم أذون الإضافة والتسليم والخصومات والضرائب.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Cheque Lifecycle</div>
        <h4>محفظة تتبع الشيكات البنكية ومواعيد الاستحقاق</h4>
        <p>
          إدارة دورة حياة الشيك بالكامل (قيد الانتظار ➔ تم التحصيل ➔ مرفوض/مرتد)، مع تأثير محاسبي دقيق على رصيد الفاتورة والعميل وتنبيهات مبكرة بتواريخ الاستحقاق لتأمين السيولة النقدية.
        </p>
        <ul class="feat-bullets">
          <li>تحديث فوري لرصيد العميل بناءً على حالة الشيك.</li>
          <li>كشف حساب يوضح الشيكات المسلمة وموقفها البنكي.</li>
        </ul>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Weekly Industrial Payroll</div>
        <h4>محرك حساب أجور العمال الأسبوعية المتطور</h4>
        <p>
          مصمم لطبيعة عمل المصانع العربية: تسجيل الحضور بحالاته (يوم، نصف يوم، ربع يوم، غياب)، احتساب الساعات الإضافية، الحوافز، السلف، والخصومات، مع إقفال أسبوعي موثق يمنع الصرف المزدوج.
        </p>
      </div>

      <div class="feature-item-card">
        <div class="feat-badge">Audit &amp; Corrections</div>
        <h4>سجل التدقيق والتصحيحات غير القابل للحذف</h4>
        <p>
          أي تعديل أو تصحيح في أجور سابقة أو إلغاء صرف يخضع لصلاحيات المدير فقط، ويُسجل في سجل تدقيق تاريخي دائم (Audit Trail) يوضح هوية الموظف ووقت وسبب التعديل لمنع أي شبهة تلاعب.
        </p>
      </div>
    </div>

    <div class="feature-image-side">
      <div class="screenshot-box">
        <div class="box-header">معاينة حقيقية: كشوف صرف أجور العمال الأسبوعية وسجل التصحيح</div>
        <img src="${imgPayroll}" alt="شاشة الرواتب" class="inner-screenshot tall-screenshot" />
        <div class="box-caption">محرك الرواتب: تفصيل شامل لمستحقات كل عامل، السلف، الإضافي، وصافي الصرف النهائي المعتمد دون أي تضارب.</div>
      </div>

      <div class="mini-stats-box">
        <div class="mini-stat">
          <strong dir="ltr">100%</strong>
          <span>منع تكرار صرف أجر نفس الأسبوع</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">Strict</strong>
          <span>حجب بيانات الأجور عن موظفي الحضور</span>
        </div>
        <div class="mini-stat">
          <strong dir="ltr">Immutable</strong>
          <span>سجل تاريخي معتمد لكل حركة مالية</span>
        </div>
      </div>

      <div class="impact-mini-panel">
        <strong>الأثر التشغيلي في المصنع:</strong> توفير أكثر من 12 ساعة عمل أسبوعياً كان يقضيها المحاسب في مراجعة كشوف العمال اليدوية، وإنهاء النزاعات العمالية نهائياً.
      </div>
    </div>
  </div>
`);

// ==========================================
// PAGE 8: TECHNICAL ARCHITECTURE & SECURITY
// ==========================================
addPage('الهندسة البرمجية والأمان · Tech & Security', 'البنية السحابية، الأمان المشدد، والنسخ الاحتياطي', `
  <div class="section-intro">
    بُني "مميز" وفق أعلى المعايير الهندسية الحديثة، ليجمع بين سرعة واجهات الويب العصرية، وقوة وموثوقية قواعد البيانات المؤسسية المقاومة للأخطاء والانقطاعات مع عزل تام لبيانات كل مصنع.
  </div>

  <div class="arch-flow-box">
    <div class="arch-layer">
      <span class="layer-badge">طبقة الواجهة</span>
      <strong>Next.js 16 + React 19</strong>
      <p>واجهة تفاعلية سريعة RTL مع مكونات Server Components</p>
    </div>
    <div class="arch-sep">➔</div>
    <div class="arch-layer">
      <span class="layer-badge">طبقة الأمان</span>
      <strong>Zero-Trust RLS Engine</strong>
      <p>سياسات أمان مشددة على مستوى الصفوف وقفل الصلاحيات</p>
    </div>
    <div class="arch-sep">➔</div>
    <div class="arch-layer">
      <span class="layer-badge">طبقة البيانات</span>
      <strong>PostgreSQL (46 Tables)</strong>
      <p>معاملات ذرية وTriggers لحساب المخزون والفوترة</p>
    </div>
    <div class="arch-sep">➔</div>
    <div class="arch-layer">
      <span class="layer-badge">طبقة الاستعادة</span>
      <strong>AES-256 Backups &amp; Sync</strong>
      <p>أرشفة مشفرة ومزامنة Outbox لحظية مع Google Drive</p>
    </div>
  </div>

  <div class="tech-stack-overview">
    <div class="tech-col">
      <div class="tech-card">
        <div class="tech-icon-title">Frontend Excellence</div>
        <h4>واجهة عصرية فائقة السرعة والتجاوب</h4>
        <ul>
          <li><strong>Next.js 16 + React 19 + TypeScript:</strong> معمارية Server Components تضمن سرعة تحميل البرامج حتى على شبكات المصانع الضعيفة.</li>
          <li><strong>Arabic-First Design (RTL):</strong> واجهة صممت خصيصاً للمستخدم العربي بخط Cairo المدمج كلياً دون الاعتماد على شبكات خارجية وقت التشغيل.</li>
          <li><strong>Full Responsiveness:</strong> تصميم متجاوب 100% يعمل بسلاسة على شاشات المكاتب، الأجهزة اللوحية داخل العنابر، وهواتف المديرين.</li>
        </ul>
      </div>

      <div class="tech-card">
        <div class="tech-icon-title">Database &amp; Integrity</div>
        <h4>قاعدة بيانات علائقية محكمة ومحمية</h4>
        <ul>
          <li><strong>PostgreSQL Enterprise Engine:</strong> محرك بيانات فائق القوة، مع 30 migration مطبقة و46 جدولاً وview علائقياً.</li>
          <li><strong>Atomic Transactions &amp; Triggers:</strong> كافة العمليات الحساسة (خصم خامات، فواتير، أجور) تنفذ كمعاملات ذرية غير قابلة للتجزئة.</li>
          <li><strong>Zero-Trust RLS Policies:</strong> حماية الوصول داخل قاعدة البيانات نفسها، مما يمنع أي تسريب بيانات حتى لو تم استدعاء الـ API مباشرة.</li>
        </ul>
      </div>
    </div>

    <div class="tech-col">
      <div class="tech-card highlight-border">
        <div class="tech-icon-title">Military-Grade Backup</div>
        <h4>نسخ احتياطي مشفر واستعادة مثبتة في 43 ثانية</h4>
        <ul>
          <li><strong>تشفير AES-256-GCM:</strong> توليد أرشيف مشفر يومي (صيغة ERPBACKUP2) يحمل بداخله جرد الصفوف وبصمة الأمان SHA-256.</li>
          <li><strong>اختبار استعادة حقيقي مثبت:</strong> تم اختبار استعادة الأرشيف بالكامل على خادم جديد مطابق في <strong>43 ثانية فقط</strong> لجميع الـ 46 جدولاً.</li>
          <li><strong>فصل مفاتيح الأمان:</strong> مفاتيح فك التشفير معزولة تماماً ولا ترفع مع النسخ، لضمان السرية المطلقة وعدم تعرضها للقرصنة.</li>
        </ul>
      </div>

      <div class="tech-card">
        <div class="tech-icon-title">Dual Cloud Sync</div>
        <h4>مزامنة لحظية مزدوجة مع Google Drive &amp; Sheets</h4>
        <ul>
          <li><strong>Outbox Pattern Integration:</strong> مزامنة آمنة وموقعة برمجياً بـ HMAC لـ 18 ملف Google Sheets لكل جداول المصنع.</li>
          <li><strong>الوصول السريع للإدارة:</strong> يتيح لمالك المصنع مراجعة مبيعاته وأرصدته فورياً عبر هاتفه دون الحاجة للدخول للوحة التحكم.</li>
          <li><strong>استمرارية الأعمال:</strong> يعمل النظام بكفاءة محلية وسحابية مع ضمان مزامنة التغييرات فور عودة اتصال الإنترنت.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="security-matrix-summary">
    <div class="sec-item">
      <strong dir="ltr">Zero-Trust</strong>
      <span>عزل صلاحيات الموظفين</span>
    </div>
    <div class="sec-item">
      <strong dir="ltr">AES-256</strong>
      <span>تشفير النسخ الاحتياطية</span>
    </div>
    <div class="sec-item">
      <strong dir="ltr">43 Seconds</strong>
      <span>زمن الاستعادة من الكوارث</span>
    </div>
    <div class="sec-item">
      <strong dir="ltr">18 Sheets</strong>
      <span>مزامنة سحابية لحظية</span>
    </div>
    <div class="sec-item">
      <strong dir="ltr">100% Type-Safe</strong>
      <span>كود منيع ضد الثغرات</span>
    </div>
  </div>
`);

// ==========================================
// PAGE 9: BUSINESS MODEL & UNIT ECONOMICS
// ==========================================
addPage('نموذج العمل واقتصاديات الوحدة · Business Model', 'نموذج الاشتراكات السحابية ومصادر الإيرادات', `
  <div class="section-intro">
    يعتمد "مميز" على نموذج اشتراكات برمجية سحابية متكررة (B2B SaaS) ذو هوامش ربحية إجمالية تتجاوز 85%، مع مصادر دخل تكميلية تعزز من القيمة الدائمة للعميل وتخفض فترة استرداد تكلفة الاكتساب إلى أقل من شهرين.
  </div>

  <div class="pricing-tiers-grid">
    <div class="pricing-card">
      <div class="tier-type">الباقة الأساسية · Starter</div>
      <div class="tier-price" dir="ltr">$99 <span>/ شهرياً</span></div>
      <div class="tier-sub" dir="ltr">$990 سنوياً (توفير شهرين)</div>
      <div class="tier-target">مخصصة للورش والمصانع الصغيرة الناشئة</div>
      <ul class="tier-features">
        <li>✓ حتى 3 مستخدمين للنظام بصلاحيات محددة</li>
        <li>✓ إدارة العملاء وأوامر الشغل والفواتير</li>
        <li>✓ مخزن واحد وإدارة الخامات الأساسية</li>
        <li>✓ تسجيل حضور العمالة اليومية</li>
        <li>✓ نسخ احتياطي يومي مشفر واستعادة فورية</li>
      </ul>
    </div>

    <div class="pricing-card featured-tier">
      <div class="featured-badge">الأكثر طلباً واختياراً</div>
      <div class="tier-type">باقة النمو الصناعي · Growth</div>
      <div class="tier-price" dir="ltr">$249 <span>/ شهرياً</span></div>
      <div class="tier-sub" dir="ltr">$2,490 سنوياً (توفير شهرين)</div>
      <div class="tier-target">للمصانع المتوسطة متعددة الخطوط والورديات</div>
      <ul class="tier-features">
        <li>✓ مستخدمين غير محدودين بصلاحيات مشددة</li>
        <li>✓ محرك عروض الأسعار الذكي بالـ AI</li>
        <li>✓ معادلات التشغيل المتقدمة (BOM) والخصم الآلي</li>
        <li>✓ محفظة الشيكات وكشوف حسابات الموردين</li>
        <li>✓ محرك الرواتب الأسبوعية وسجل التدقيق</li>
        <li>✓ مزامنة سحابية متقدمة مع Google Sheets</li>
      </ul>
    </div>

    <div class="pricing-card">
      <div class="tier-type">باقة المؤسسات · Enterprise</div>
      <div class="tier-price" dir="ltr">$499+ <span>/ شهرياً</span></div>
      <div class="tier-sub" dir="ltr">$5,000+ سنوياً (حسب التخصيص)</div>
      <div class="tier-target">للمجموعات الصناعية والمصانع الكبرى</div>
      <ul class="tier-features">
        <li>✓ بنية سحابية مخصصة وعزل كامل للمصنع</li>
        <li>✓ ربط منظومة الفاتورة الإلكترونية والضرائب (ZATCA)</li>
        <li>✓ إدارة الفروع والمخازن المتعددة وخطوط الإنتاج</li>
        <li>✓ ربط حساسات الماكينات (IoT Gateways)</li>
        <li>✓ دعم فني وتدريب ميداني VIP مخصص 24/7</li>
      </ul>
    </div>
  </div>

  <h3 class="subsection-title">اقتصاديات الوحدة المستهدفة (Unit Economics)</h3>

  <div class="unit-eco-grid">
    <div class="eco-box">
      <div class="eco-title">متوسط الإيراد السنوي للعميل (ARPU)</div>
      <div class="eco-num" dir="ltr">$2,800</div>
      <div class="eco-sub">مزيج من باقة النمو ومبيعات الإعداد والتخصيص والربط الضريبي</div>
    </div>

    <div class="eco-box">
      <div class="eco-title">تكلفة اكتساب العميل (CAC)</div>
      <div class="eco-num" dir="ltr">$450</div>
      <div class="eco-sub">تسويق موجه ومبيعات مباشرة B2B للمناطق الصناعية والمعارض</div>
    </div>

    <div class="eco-box">
      <div class="eco-title">القيمة الدائمة للعميل (LTV)</div>
      <div class="eco-num" dir="ltr">$7,500+</div>
      <div class="eco-sub">بناءً على متوسط بقاء 3+ سنوات في منتج صناعي عالي الالتصاق</div>
    </div>

    <div class="eco-box highlight">
      <div class="eco-title">نسبة LTV / CAC</div>
      <div class="eco-num" dir="ltr">16.6x</div>
      <div class="eco-sub">المعيار الذهبي لشركات الـ SaaS هو 3x (كفاءة رأسمالية فائقة)</div>
    </div>
  </div>

  <div class="revenue-streams-row">
    <div class="rev-item">
      <strong>رسوم الإعداد والتهيئة (Onboarding):</strong> $500 إلى $1,500 لربط خطوط الإنتاج والتدريب الأولي
    </div>
    <div class="rev-item">
      <strong>الربط الضريبي والامتثال الحكومي:</strong> رسوم شهرية إضافية لربط الفاتورة الإلكترونية مع الضرائب
    </div>
    <div class="rev-item">
      <strong>بوابات الـ IoT والذكاء الاصطناعي:</strong> اشتراكات تكميلية للتحليل التنبؤي لاستهلاك الخامات
    </div>
  </div>

  <div class="expansion-strategy-panel">
    <strong>استراتيجية توسيع الإيرادات (Land &amp; Expand):</strong> يبدأ المصنع بالاشتراك الأساسي لإدارة المبيعات والخامات، وسرعان ما يقوم بالترقية لباقة النمو لتفعيل محرك الرواتب والربط السحابي، مما يرفع متوسط الإيراد لكل عميل بنسبة 40% خلال أول 6 أشهر.
  </div>
`);

// ==========================================
// PAGE 10: FINANCIAL PROJECTIONS (3 YEARS)
// ==========================================
addPage('التوقعات المالية · Financial Projections', 'النمو المالي ومؤشرات الأداء (2026 - 2029)', `
  <div class="section-intro">
    تعتمد توقعاتنا المالية على افتراضات متحفظة تعكس كفاءة نموذج الـ B2B SaaS، مع تحقيق نقطة التعادل والربحية التشغيلية ابتداءً من السنة الأولى بفضل انخفاض تكلفة الخوادم وجاهزية المنتج الحالية للتوزيع التجاري.
  </div>

  <table class="financial-table">
    <thead>
      <tr>
        <th style="width: 28%;">البند المالي (جميع الأرقام بالدولار الأمريكي)</th>
        <th style="width: 24%;">السنة الأولى (2026 - 2027)</th>
        <th style="width: 24%;">السنة الثانية (2027 - 2028)</th>
        <th style="width: 24%;">السنة الثالثة (2028 - 2029)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="highlight-row">
        <td><strong>عدد المصانع المشتركة النشطة (نهاية السنة)</strong></td>
        <td class="bold-cell" dir="ltr">120 مصنع</td>
        <td class="bold-cell" dir="ltr">450 مصنع</td>
        <td class="bold-cell" dir="ltr">1,200 مصنع</td>
      </tr>
      <tr>
        <td>الإيرادات المتكررة السنوية (ARR)</td>
        <td dir="ltr">$324,000</td>
        <td dir="ltr">$1,350,000</td>
        <td dir="ltr">$4,200,000</td>
      </tr>
      <tr>
        <td>إيرادات الإعداد والتهيئة والتخصيص والربط الضريبي</td>
        <td dir="ltr">$60,000</td>
        <td dir="ltr">$225,000</td>
        <td dir="ltr">$600,000</td>
      </tr>
      <tr class="subtotal-row">
        <td><strong>إجمالي الإيرادات (Total Revenue)</strong></td>
        <td class="bold-cell" dir="ltr">$384,000</td>
        <td class="bold-cell" dir="ltr">$1,575,000</td>
        <td class="bold-cell" dir="ltr">$4,800,000</td>
      </tr>
      <tr>
        <td>تكلفة الإيرادات (السيرفرات السحابية والدعم الفني)</td>
        <td dir="ltr">($69,000)</td>
        <td dir="ltr">($236,000)</td>
        <td dir="ltr">($576,000)</td>
      </tr>
      <tr class="subtotal-row">
        <td><strong>مجمل الربح (Gross Profit)</strong></td>
        <td class="bold-cell" dir="ltr">$315,000 (82%)</td>
        <td class="bold-cell" dir="ltr">$1,339,000 (85%)</td>
        <td class="bold-cell" dir="ltr">$4,224,000 (88%)</td>
      </tr>
      <tr>
        <td>مصروفات المبيعات والتسويق وتعيين الفرق الميدانية</td>
        <td dir="ltr">($120,000)</td>
        <td dir="ltr">($420,000)</td>
        <td dir="ltr">($1,200,000)</td>
      </tr>
      <tr>
        <td>مصروفات البحث والتطوير الهندسي والـ AI</td>
        <td dir="ltr">($85,000)</td>
        <td dir="ltr">($280,000)</td>
        <td dir="ltr">($800,000)</td>
      </tr>
      <tr>
        <td>المصروفات الإدارية والعمومية والتراخيص</td>
        <td dir="ltr">($25,000)</td>
        <td dir="ltr">($119,000)</td>
        <td dir="ltr">($334,000)</td>
      </tr>
      <tr class="profit-row">
        <td><strong>صافي الأرباح التشغيلية (EBITDA)</strong></td>
        <td class="bold-cell profit" dir="ltr">$85,000 (22%)</td>
        <td class="bold-cell profit" dir="ltr">$520,000 (33%)</td>
        <td class="bold-cell profit" dir="ltr">$1,890,000 (39%)</td>
      </tr>
    </tbody>
  </table>

  <h3 class="subsection-title">أبرز مؤشرات الأداء المالي المستهدفة (Key Financial KPIs)</h3>

  <div class="fin-kpis-grid">
    <div class="fin-kpi-card">
      <div class="fin-kpi-val" dir="ltr">260%</div>
      <div class="fin-kpi-title">معدل نمو الإيرادات السنوي (CAGR)</div>
      <div class="fin-kpi-sub">نمو متسارع بفضل التوسع في السوقين المصري والسعودي</div>
    </div>

    <div class="fin-kpi-card">
      <div class="fin-kpi-val" dir="ltr">85%+</div>
      <div class="fin-kpi-title">هامش مجمل ربح البرمجيات (Gross Margin)</div>
      <div class="fin-kpi-sub">انخفاض تكلفة الاستضافة السحابية بفضل كفاءة المعمارية</div>
    </div>

    <div class="fin-kpi-card">
      <div class="fin-kpi-val" dir="ltr">115%</div>
      <div class="fin-kpi-title">معدل صافي استبقاء الإيرادات (NRR)</div>
      <div class="fin-kpi-sub">ترقية المصانع لباقات أعلى وشراء وحدات الـ AI والربط الضريبي</div>
    </div>

    <div class="fin-kpi-card">
      <div class="fin-kpi-val" dir="ltr">&lt; 2 Mo</div>
      <div class="fin-kpi-title">فترة استرداد تكلفة الاكتساب (Payback Period)</div>
      <div class="fin-kpi-sub">استرداد سريع لرأس المال التشغيلي الموجه للمبيعات</div>
    </div>
  </div>

  <div class="sensitivity-panel">
    <strong>تحليل الحساسية وسيناريوهات النمو (Sensitivity Scenarios):</strong> حتى في السيناريو المتحفظ (Conservative Case) بتحقيق 60% فقط من الأهداف المستهدفة، تظل الشركة رابحة نقدياً من السنة الأولى بهامش EBITDA يتجاوز 18% ودون الحاجة لضخ سيولة طارئة.
  </div>

  <div class="callout-box">
    <strong>الاستقلالية المالية والربحية السريعة:</strong> بفضل طبيعة المنتج المنضبطة وهوامش الـ SaaS المرتفعة، لا تتطلب الشركة جولات تمويل استنزافية ضخمة للوصول للربحية، بل تحقق تدفقات نقدية موجبة تدعم استقرار المستثمر من السنة الأولى.
  </div>
`);

// ==========================================
// PAGE 11: STRATEGIC ROADMAP & EXPANSION
// ==========================================
addPage('خارطة الطريق والتوسع · Strategic Roadmap', 'مراحل التطوير وخطة الانتشار الإقليمي (2026 - 2028)', `
  <div class="section-intro">
    تتبنى الشركة استراتيجية توسع واضحة المعالم، تبدأ بتثبيت القيادة في السوق المحلي ثم التوسع المباشر نحو السوق السعودي وأسواق الخليج العربي مستفيدة من التوافق التشريعي والصناعي.
  </div>

  <div class="roadmap-phases-vertical">
    <div class="phase-card">
      <div class="phase-timeline">
        <span class="phase-badge">المرحلة الأولى · Q4 2026</span>
        <div class="phase-kpi-tag" dir="ltr">120+ Factories (Egypt)</div>
      </div>
      <h4>التدشين السحابي التجاري الموحد والسيطرة على السوق المحلي</h4>
      <p>
        اكتمال تفعيل معمارية الـ Multi-Tenancy وعزل الحسابات السحابية بنسبة 100%، إطلاق البوابة السحابية الموحدة، وتكثيف حملات المبيعات الميدانية في أكبر المجمعات الصناعية المصرية (العاشر من رمضان، 6 أكتوبر، السادات، برج العرب، قويسنا).
      </p>
      <div class="phase-details-row">
        <span><strong>الهدف الفني:</strong> عزل تام لقواعد بيانات المصانع</span>
        <span><strong>الهدف التجاري:</strong> الوصول لـ 120 مصنع مشترك</span>
        <span><strong>ARR المستهدف:</strong> 324,000 دولار</span>
      </div>
    </div>

    <div class="phase-card">
      <div class="phase-timeline">
        <span class="phase-badge">المرحلة الثانية · Q1 - Q2 2027</span>
        <div class="phase-kpi-tag" dir="ltr">Expansion to KSA &amp; Mobile</div>
      </div>
      <h4>دخول السوق السعودي وتطبيق الهاتف الذكي للقيادات</h4>
      <p>
        الحصول على اعتماد منظومة الفاتورة الإلكترونية للمرحلة الثانية من هيئة الزكاة والضريبة والجمارك (ZATCA)، تأسيس فرع المبيعات بالرياض، وإطلاق تطبيقات الموبايل (iOS &amp; Android) المخصصة لأصحاب المصانع لمراقبة الإنتاج والأموال لحظياً.
      </p>
      <div class="phase-details-row">
        <span><strong>الهدف الفني:</strong> اعتماد وتكامل ZATCA الكامل</span>
        <span><strong>الهدف التجاري:</strong> التعاقد مع 80 مصنعاً سعودياً</span>
        <span><strong>ARR المستهدف:</strong> 750,000 دولار</span>
      </div>
    </div>

    <div class="phase-card">
      <div class="phase-timeline">
        <span class="phase-badge">المرحلة الثالثة · Q3 - Q4 2027</span>
        <div class="phase-kpi-tag" dir="ltr">AI &amp; Industrial IoT</div>
      </div>
      <h4>الذكاء الاصطناعي التنبؤي وإنترنت الأشياء الصناعي (IIoT)</h4>
      <p>
        إطلاق وحدات التنبؤ الذكي باستهلاك الخامات لتحديد أنسب أوقات الشراء وتفادي تقلب أسعار البوليمرات والمعادن، مع ربط حساسات عدادات الإنتاج المباشرة (IoT Line Counters) على الماكينات لتسجيل الإنتاج الفعلي آلياً دون أي تدخل بشري.
      </p>
      <div class="phase-details-row">
        <span><strong>الهدف الفني:</strong> بوابات ربط الحساسات وML</span>
        <span><strong>الهدف التجاري:</strong> تفعيل الإضافة لدى 40% من العملاء</span>
        <span><strong>ARR المستهدف:</strong> 1.35 مليون دولار</span>
      </div>
    </div>

    <div class="phase-card">
      <div class="phase-timeline">
        <span class="phase-badge">المرحلة الرابعة · 2028</span>
        <div class="phase-kpi-tag" dir="ltr">B2B Raw Materials Network</div>
      </div>
      <h4>منصة تداول الخامات وسلاسل الإمداد الإقليمية (B2B Marketplace)</h4>
      <p>
        الاستفادة من شبكة المصانع المشتركة لإنشاء منصة وساطة لشراء المواد الخام مباشرة من كبار المصنعين ومستوردي البتروكيماويات بأسعار الجملة، مع فتح مصدر إيرادات إضافي مبني على عمولات صفقات التوريد.
      </p>
      <div class="phase-details-row">
        <span><strong>الهدف الفني:</strong> منصة التوريد الموحدة للمواد الخام</span>
        <span><strong>الهدف التجاري:</strong> خدمة 1,200 مصنع في المنطقة</span>
        <span><strong>ARR المستهدف:</strong> 4.2 مليون دولار</span>
      </div>
    </div>
  </div>

  <div class="callout-box">
    <strong>الرؤية بعيدة المدى:</strong> أن يصبح "مميز" هو منصة البنية التحتية البرمجية الرقمية الأولى للصناعة في العالم العربي، ونقطة الوصل بين المصانع، سلاسل الإمداد، والبنوك التجارية.
  </div>
`);

// ==========================================
// PAGE 12: THE INVESTMENT ASK & EXIT STRATEGY
// ==========================================
addPage('العرض الاستثماري · The Investment Ask', 'العرض المالي، استخدام التمويل، ومسارات التخارج', `
  <div class="section-intro">
    نبحث عن شريك استثماري استراتيجي لديه رؤية عميقة لقيمة التحول الرقمي الصناعي، ليشاركنا قيادة هذه الثورة في السوق العربي عبر جولة تمويل أولية (Seed Round).
  </div>

  <div class="ask-box-highlight">
    <div class="ask-top">
      <div class="ask-main">
        <span class="ask-label">جولة التمويل التأسيسية المستهدفة (Seed Round)</span>
        <div class="ask-amount" dir="ltr">$350,000</div>
        <span class="ask-notes">أو ما يعادلها بالعملة المحلية · تقييم ما قبل التمويل مبني على الجاهزية التشغيلية</span>
      </div>
      <div class="ask-equity">
        <span class="equity-label">حصة الملكية المعروضة</span>
        <div class="equity-amount" dir="ltr">15% – 20%</div>
        <span class="equity-notes">أسهم ممتازة / عادية بحسب هيكل الاستثمار والخبرة المضافة</span>
      </div>
    </div>
  </div>

  <h3 class="subsection-title">خطة توزيع واستخدام رأس المال (Allocation of Funds)</h3>

  <div class="fund-alloc-grid">
    <div class="alloc-card">
      <div class="alloc-pct" dir="ltr">40%</div>
      <div class="alloc-title">المبيعات والتسويق واكتساب المصانع</div>
      <p>بناء وتدريب فريق مبيعات B2B ميداني، المشاركة في المعارض الصناعية الدولية، وحملات استهداف رقمية مكثفة لأصحاب المصانع.</p>
    </div>

    <div class="alloc-card">
      <div class="alloc-pct" dir="ltr">30%</div>
      <div class="alloc-title">تطوير المنتج والهندسة البرمجية</div>
      <p>تعيين كفاءات برمجية سحابية، استكمال محركات الـ AI، تطبيقات الهاتف الذكي (iOS/Android)، وبوابات الربط مع حساسات الإنتاج.</p>
    </div>

    <div class="alloc-card">
      <div class="alloc-pct" dir="ltr">15%</div>
      <div class="alloc-title">التوسع الإقليمي والامتثال الحكومي</div>
      <p>تأسيس المقر التجاري بالمملكة العربية السعودية، إنجاز تراخيص واعتماد ZATCA، وتعيين فريق المبيعات والتشغيل الميداني بالرياض.</p>
    </div>

    <div class="alloc-card">
      <div class="alloc-pct" dir="ltr">15%</div>
      <div class="alloc-title">البنية السحابية واحتياطي الأمان المالي</div>
      <p>تأمين خوادم سحابية عالية الأمان وفائقة الاعتمادية، مع سيولة احتياطية تشغيلية تكفي لمدة 18 شهراً من العمل المستقر.</p>
    </div>
  </div>

  <h3 class="subsection-title">مسارات التخارج والعائد المتوقع للمستثمر (Exit Strategy &amp; ROI)</h3>

  <div class="exit-options-grid">
    <div class="exit-card">
      <strong>١. الاستحواذ الاستراتيجي (Strategic M&amp;A)</strong>
      <p>الاستحواذ من قبل شركات برمجيات عالمية (SAP, Odoo, Sage) أو مجموعات تقنية وصناعية إقليمية تسعى للسيطرة على قطاع المصانع بالمنطقة.</p>
    </div>
    <div class="exit-card">
      <strong>٢. جولة تمويل استثمارية كبرى (Series A)</strong>
      <p>فرصة تخارج جزئي أو كلي بمضاعف تقييم متوقع (3x إلى 5x) خلال 18 إلى 24 شهراً مع دخول صناديق رأس مال جريء إقليمية.</p>
    </div>
    <div class="exit-card">
      <strong>٣. تدفقات أرباح نقدية سنوية (High-Dividend SaaS)</strong>
      <p>نموذج هوامش الـ 85% يتيح توزيع أرباح نقدية سنوية سخية ومستدامة للمستثمرين في حال الرغبة في الاحتفاظ بالحصة على المدى الطويل.</p>
    </div>
  </div>

  <div class="term-sheet-summary-box">
    <div class="term-item"><strong>مقعد مجلس الإدارة:</strong> مقعد مراقب / عضو مجلس للمستثمر الرئيسي</div>
    <div class="term-item"><strong>حقوق الشفعة:</strong> Pro-rata rights في الجولات التمويلية اللاحقة</div>
    <div class="term-item"><strong>التقارير المالية:</strong> تقارير تشغيلية ومالية ربع سنوية مدققة</div>
  </div>

  <div class="cta-contact-box">
    <div class="cta-text">
      <h4>جاهزون لخطوتك الاستثمارية القادمة؟</h4>
      <p>يسعدنا ترتيب جلسة استعراض حية للنظام (Live Demo)، ومناقشة تفاصيل بنود الاتفاق الاستثماري ومشاركة نموذج التوقعات المالية التفصيلي.</p>
    </div>
    <div class="cta-contact-info">
      <div><strong>البريد الإلكتروني:</strong> <span dir="ltr">investors@momayaz-erp.com</span></div>
      <div><strong>الهاتف والواتساب:</strong> <span dir="ltr">+20 100 000 0000</span></div>
      <div><strong>الموقع الإلكتروني:</strong> <span dir="ltr">https://momayaz-erp.com</span></div>
    </div>
  </div>
`);

// ==========================================
// CSS STYLING (Institutional Grade Luxury)
// ==========================================
const cssStyles = `
  @font-face {
    font-family: 'Cairo';
    src: url(data:font/woff2;base64,${fontCairoArabic.toString('base64')}) format('woff2');
    font-weight: 200 1000;
  }
  @font-face {
    font-family: 'CairoLatin';
    src: url(data:font/woff2;base64,${fontCairoLatin.toString('base64')}) format('woff2');
    font-weight: 200 1000;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    margin: 0;
    padding: 0;
    background: #e2e8f0;
    color: #0f172a;
    font-family: 'Cairo', 'CairoLatin', sans-serif;
    font-size: 11px;
    line-height: 1.8;
  }

  .page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    background: #ffffff;
    margin: 8mm auto;
    padding: 12mm 16mm 13mm 16mm;
    position: relative;
    overflow: hidden;
    break-after: page;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .page:last-child {
    break-after: auto;
  }

  /* Topline and Footer */
  .topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 10px;
    font-size: 8.5px;
    color: #64748b;
    font-weight: 600;
  }

  .topline-brand {
    color: #1e3a8a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .topline-brand img {
    height: 16px;
    width: auto;
    border-radius: 3px;
  }

  .footer {
    position: absolute;
    bottom: 8mm;
    left: 16mm;
    right: 16mm;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    color: #94a3b8;
  }

  .footer-confidential {
    color: #dc2626;
    font-weight: 700;
    background: #fef2f2;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid #fecaca;
  }

  /* Headings & Texts */
  .kicker {
    font-size: 9px;
    color: #2563eb;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  h1.page-title {
    font-size: 19px;
    line-height: 1.35;
    font-weight: 900;
    color: #0b192c;
    margin: 0 0 7px 0;
    letter-spacing: -0.3px;
  }

  .section-intro {
    background: #f8fafc;
    border-right: 3.5px solid #2563eb;
    padding: 7px 11px;
    border-radius: 6px;
    font-size: 9.5px;
    line-height: 1.8;
    color: #334155;
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
    border-right-width: 3.5px;
  }

  .subsection-title {
    font-size: 11.5px;
    font-weight: 800;
    color: #1e3a8a;
    margin: 10px 0 6px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .subsection-title::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 13px;
    background: #2563eb;
    border-radius: 2px;
  }

  /* COVER STYLING */
  .cover-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 12px;
  }

  .cover-brand-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cover-logo-img {
    height: 48px;
    width: auto;
    object-fit: contain;
  }

  .cover-brand-text {
    display: flex;
    flex-direction: column;
  }

  .cover-brand-name {
    font-size: 15px;
    font-weight: 900;
    color: #0b192c;
  }

  .cover-brand-sub {
    font-size: 8.5px;
    color: #64748b;
    font-weight: 500;
  }

  .cover-confidential-badge {
    background: #fee2e2;
    color: #991b1b;
    font-size: 8.5px;
    font-weight: 800;
    padding: 5px 12px;
    border-radius: 30px;
    border: 1px solid #f87171;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    background: #dc2626;
    border-radius: 50%;
  }

  .cover-body {
    padding: 10px 0;
  }

  .cover-tag {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    font-size: 9.5px;
    font-weight: 800;
    padding: 3px 12px;
    border-radius: 20px;
    margin-bottom: 10px;
  }

  .cover-main-title {
    font-size: 29px;
    line-height: 1.35;
    font-weight: 900;
    color: #0b192c;
    margin: 0 0 10px 0;
    letter-spacing: -0.5px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover-lead-desc {
    font-size: 11.5px;
    line-height: 1.9;
    color: #475569;
    max-width: 95%;
    margin: 0 0 14px 0;
  }

  .cover-mockup-wrapper {
    margin: 12px 0;
  }

  .mockup-frame {
    background: #0f172a;
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255,255,255,0.1);
  }

  .mockup-topbar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px 6px 8px;
  }

  .mockup-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .mockup-dot.red { background: #ef4444; }
  .mockup-dot.yellow { background: #f59e0b; }
  .mockup-dot.green { background: #10b981; }

  .mockup-url {
    font-size: 7.5px;
    color: #94a3b8;
    background: #1e293b;
    padding: 2px 14px;
    border-radius: 4px;
    margin-right: auto;
  }

  .mockup-img {
    width: 100%;
    height: 82mm;
    object-fit: cover;
    object-position: top;
    border-radius: 6px;
    display: block;
  }

  .cover-pills-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 14px;
  }

  .cover-pill {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .cover-pill strong {
    display: block;
    font-size: 9px;
    color: #0f172a;
    margin-bottom: 1px;
  }

  .cover-pill p {
    margin: 0;
    font-size: 7.5px;
    color: #64748b;
    line-height: 1.3;
  }

  .pill-icon {
    color: #16a34a;
    font-weight: 900;
    font-size: 13px;
    line-height: 1;
    margin-top: 2px;
  }

  .cover-footer-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    border-top: 1.5px solid #e2e8f0;
    padding-top: 12px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: 7.5px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .meta-val {
    font-size: 9px;
    font-weight: 800;
    color: #0f172a;
  }

  /* KPI CARDS (Page 2) */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }

  .kpi-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }

  .kpi-num {
    font-size: 19px;
    font-weight: 900;
    color: #1e3a8a;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .kpi-num.highlight {
    color: #059669;
  }

  .kpi-label {
    font-size: 9px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 2px;
  }

  .kpi-desc {
    font-size: 7.5px;
    color: #64748b;
    line-height: 1.35;
  }

  /* PILLARS (Page 2) */
  .pillars-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }

  .pillar-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 11px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }

  .pillar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .pillar-num {
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 9px;
    font-weight: 900;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
  }

  .pillar-header h4 {
    margin: 0;
    font-size: 9.5px;
    font-weight: 800;
    color: #0f172a;
  }

  .pillar-box p {
    margin: 0;
    font-size: 8px;
    color: #475569;
    line-height: 1.65;
  }

  .key-takeaways-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 6px;
  }

  .takeaway-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 8px;
    color: #334155;
    line-height: 1.5;
  }

  .takeaway-item strong {
    color: #1e40af;
  }

  .callout-box {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border: 1px solid #a7f3d0;
    border-right: 4px solid #10b981;
    border-radius: 6px;
    padding: 7px 11px;
    font-size: 8.5px;
    color: #065f46;
    line-height: 1.65;
    margin-top: 6px;
  }

  /* PAIN POINTS (Page 3) */
  .pain-points-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }

  .pain-card {
    background: #ffffff;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 8px 10px;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.04);
  }

  .pain-badge {
    background: #fef2f2;
    color: #b91c1c;
    font-size: 7px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 4px;
    border: 1px solid #fca5a5;
  }

  .pain-card h4 {
    margin: 0 0 3px 0;
    font-size: 9px;
    font-weight: 800;
    color: #991b1b;
    line-height: 1.4;
  }

  .pain-card p {
    margin: 0;
    font-size: 7.5px;
    color: #475569;
    line-height: 1.6;
  }

  /* TAM SAM SOM (Page 3) */
  .tam-sam-som-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .tam-bar, .sam-bar, .som-bar {
    padding: 7px 11px;
    border-radius: 7px;
    border: 1px solid;
  }

  .tam-bar {
    background: #f1f5f9;
    border-color: #cbd5e1;
    border-right: 5px solid #64748b;
  }

  .sam-bar {
    background: #eff6ff;
    border-color: #bfdbfe;
    border-right: 5px solid #3b82f6;
    margin-right: 15px;
  }

  .som-bar {
    background: #f0fdf4;
    border-color: #bbf7d0;
    border-right: 5px solid #10b981;
    margin-right: 30px;
  }

  .tam-header, .sam-header, .som-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .market-tag {
    font-size: 8px;
    font-weight: 800;
  }

  .tam-bar .market-tag { color: #334155; }
  .sam-bar .market-tag { color: #1d4ed8; }
  .som-bar .market-tag { color: #047857; }

  .tam-header strong { font-size: 12.5px; color: #1e293b; }
  .sam-header strong { font-size: 12.5px; color: #1d4ed8; }
  .som-header strong { font-size: 13.5px; color: #047857; font-weight: 900; }

  .tam-bar p, .sam-bar p, .som-bar p {
    margin: 0;
    font-size: 7.5px;
    color: #475569;
    line-height: 1.45;
  }

  .why-now-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 7px 11px;
  }

  .why-now-box h4 {
    margin: 0 0 4px 0;
    font-size: 9px;
    font-weight: 800;
    color: #0f172a;
  }

  .why-now-box ul {
    margin: 0;
    padding-right: 14px;
    font-size: 7.5px;
    color: #334155;
    line-height: 1.65;
  }

  /* WORKFLOW & COMPARISON (Page 4) */
  .workflow-diagram-container {
    background: #0f172a;
    border-radius: 9px;
    padding: 9px 11px;
    margin-bottom: 10px;
    color: #ffffff;
  }

  .wf-title {
    font-size: 9px;
    font-weight: 800;
    color: #38bdf8;
    margin-bottom: 7px;
    text-align: center;
  }

  .wf-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }

  .wf-step {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 5px 6px;
    flex: 1;
    text-align: center;
  }

  .wf-num {
    display: inline-block;
    background: #0284c7;
    color: #fff;
    font-size: 7.5px;
    font-weight: 900;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-bottom: 2px;
  }

  .wf-step strong {
    display: block;
    font-size: 8px;
    color: #f8fafc;
    margin-bottom: 1px;
  }

  .wf-step p {
    margin: 0;
    font-size: 6.8px;
    color: #94a3b8;
    line-height: 1.3;
  }

  .wf-arrow {
    color: #38bdf8;
    font-size: 13px;
    font-weight: 900;
  }

  .comp-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 7px;
    font-size: 8px;
  }

  .comp-table th {
    background: #f1f5f9;
    color: #1e293b;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
    text-align: right;
    font-weight: 800;
    font-size: 8px;
  }

  .comp-table td {
    padding: 5px 7px;
    border: 1px solid #e2e8f0;
    font-size: 7.5px;
    line-height: 1.4;
  }

  .comp-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  .check-pos {
    color: #15803d;
    font-weight: 700;
    background: #f0fdf4 !important;
  }

  .check-neg {
    color: #b91c1c;
    background: #fef2f2 !important;
  }

  .check-warn {
    color: #b45309;
    background: #fffbeb !important;
  }

  /* TWO-COLUMN MODULE PAGES (5, 6, 7) */
  .feature-two-col {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 12px;
    align-items: start;
  }

  .feature-list-side {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .feature-item-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 6.5px 9px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .feat-badge {
    display: inline-block;
    background: #eff6ff;
    color: #1e40af;
    font-size: 6.8px;
    font-weight: 800;
    padding: 1.5px 6px;
    border-radius: 10px;
    border: 1px solid #bfdbfe;
    margin-bottom: 2px;
  }

  .feature-item-card h4 {
    margin: 0 0 2px 0;
    font-size: 9px;
    font-weight: 800;
    color: #0f172a;
  }

  .feature-item-card p {
    margin: 0;
    font-size: 7.8px;
    color: #475569;
    line-height: 1.55;
  }

  .feat-bullets {
    margin: 3px 0 0 0;
    padding-right: 14px;
    font-size: 7.2px;
    color: #2563eb;
    line-height: 1.45;
  }

  .feature-image-side {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .screenshot-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .box-header {
    font-size: 7.5px;
    font-weight: 800;
    color: #1e3a8a;
    margin-bottom: 4px;
    padding: 0 3px;
  }

  .inner-screenshot {
    width: 100%;
    object-fit: cover;
    object-position: top;
    border-radius: 5px;
    border: 1px solid #cbd5e1;
    display: block;
    background: #ffffff;
  }

  .tall-screenshot {
    height: 72mm;
  }

  .box-caption {
    font-size: 6.8px;
    color: #64748b;
    margin-top: 3px;
    padding: 0 3px;
    line-height: 1.3;
  }

  .mini-stats-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .mini-stat {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 3px;
    text-align: center;
  }

  .mini-stat strong {
    display: block;
    font-size: 10.5px;
    font-weight: 900;
    color: #0284c7;
    margin-bottom: 1px;
  }

  .mini-stat span {
    font-size: 6.5px;
    color: #64748b;
    font-weight: 600;
    line-height: 1.25;
    display: block;
  }

  .impact-mini-panel {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 7.2px;
    color: #166534;
    line-height: 1.45;
  }

  .impact-mini-panel strong {
    color: #15803d;
  }

  /* TECH STACK (Page 8) */
  .arch-flow-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0f172a;
    border-radius: 8px;
    padding: 8px 10px;
    margin-bottom: 9px;
    color: #ffffff;
  }

  .arch-layer {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 5px 8px;
    text-align: center;
    flex: 1;
  }

  .layer-badge {
    display: inline-block;
    background: #0284c7;
    color: #ffffff;
    font-size: 6.5px;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 8px;
    margin-bottom: 2px;
  }

  .arch-layer strong {
    display: block;
    font-size: 8px;
    color: #38bdf8;
    margin-bottom: 1px;
  }

  .arch-layer p {
    margin: 0;
    font-size: 6.8px;
    color: #94a3b8;
    line-height: 1.25;
  }

  .arch-sep {
    color: #38bdf8;
    font-size: 13px;
    padding: 0 4px;
  }

  .tech-stack-overview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-bottom: 9px;
  }

  .tech-col {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .tech-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 10px;
  }

  .tech-card.highlight-border {
    border-color: #3b82f6;
    background: #f8fbff;
  }

  .tech-icon-title {
    font-size: 7px;
    color: #2563eb;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .tech-card h4 {
    margin: 0 0 4px 0;
    font-size: 9px;
    font-weight: 800;
    color: #0f172a;
  }

  .tech-card ul {
    margin: 0;
    padding-right: 14px;
    font-size: 7.5px;
    color: #475569;
    line-height: 1.6;
  }

  .security-matrix-summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    background: #0f172a;
    border-radius: 7px;
    padding: 8px 6px;
    color: #ffffff;
  }

  .sec-item {
    text-align: center;
  }

  .sec-item strong {
    display: block;
    font-size: 10.5px;
    font-weight: 900;
    color: #38bdf8;
    margin-bottom: 1px;
  }

  .sec-item span {
    font-size: 6.8px;
    color: #94a3b8;
    line-height: 1.2;
    display: block;
  }

  /* PRICING & TIERS (Page 9) */
  .pricing-tiers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 9px;
  }

  .pricing-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 9px 9px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .pricing-card.featured-tier {
    border: 2px solid #2563eb;
    background: #f8fbff;
    box-shadow: 0 6px 15px -3px rgba(37, 99, 235, 0.12);
  }

  .featured-badge {
    position: absolute;
    top: -9px;
    right: 12px;
    background: #2563eb;
    color: #ffffff;
    font-size: 7px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .tier-type {
    font-size: 10px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .tier-price {
    font-size: 18px;
    font-weight: 900;
    color: #1e3a8a;
    line-height: 1.1;
  }

  .tier-price span {
    font-size: 8.5px;
    font-weight: 600;
    color: #64748b;
  }

  .tier-sub {
    font-size: 7px;
    color: #059669;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .tier-target {
    font-size: 7px;
    color: #475569;
    background: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  .tier-features {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 7.2px;
    color: #334155;
    line-height: 1.65;
  }

  .tier-features li {
    margin-bottom: 1.5px;
  }

  .unit-eco-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 8px;
  }

  .eco-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 5px;
    text-align: center;
  }

  .eco-box.highlight {
    background: #ecfdf5;
    border-color: #6ee7b7;
  }

  .eco-title {
    font-size: 7px;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 1px;
  }

  .eco-num {
    font-size: 15px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 1px;
  }

  .eco-box.highlight .eco-num {
    color: #047857;
  }

  .eco-sub {
    font-size: 6.2px;
    color: #64748b;
    line-height: 1.25;
  }

  .revenue-streams-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 6px;
  }

  .rev-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 7px;
    font-size: 7.2px;
    color: #334155;
    line-height: 1.4;
  }

  .expansion-strategy-panel {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 7.5px;
    color: #1e40af;
    line-height: 1.5;
  }

  /* FINANCIALS (Page 10) */
  .financial-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 9px;
    font-size: 7.8px;
  }

  .financial-table th {
    background: #0f172a;
    color: #ffffff;
    padding: 6px 7px;
    border: 1px solid #334155;
    text-align: right;
    font-size: 8px;
  }

  .financial-table td {
    padding: 4.5px 7px;
    border: 1px solid #e2e8f0;
  }

  .bold-cell {
    font-weight: 800;
  }

  .highlight-row td {
    background: #eff6ff;
    font-weight: 800;
    color: #1e40af;
  }

  .subtotal-row td {
    background: #f8fafc;
    font-weight: 800;
    border-top: 1.5px solid #cbd5e1;
    border-bottom: 1.5px solid #cbd5e1;
  }

  .profit-row td {
    background: #ecfdf5;
    font-weight: 900;
    font-size: 8.5px;
    border-top: 2px solid #10b981;
    border-bottom: 2px solid #10b981;
  }

  .profit-row .profit {
    color: #047857;
  }

  .fin-kpis-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 7px;
  }

  .fin-kpi-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 5px;
    text-align: center;
  }

  .fin-kpi-val {
    font-size: 16px;
    font-weight: 900;
    color: #1e3a8a;
    margin-bottom: 1px;
  }

  .fin-kpi-title {
    font-size: 7.8px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 1px;
  }

  .fin-kpi-sub {
    font-size: 6.2px;
    color: #64748b;
    line-height: 1.3;
  }

  .sensitivity-panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 7.2px;
    color: #475569;
    line-height: 1.45;
    margin-bottom: 6px;
  }

  /* ROADMAP (Page 11) */
  .roadmap-phases-vertical {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 7px;
  }

  .phase-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-right: 4px solid #2563eb;
    border-radius: 7px;
    padding: 7.5px 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .phase-timeline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
  }

  .phase-badge {
    background: #eff6ff;
    color: #1e40af;
    font-size: 7.5px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 12px;
    border: 1px solid #bfdbfe;
  }

  .phase-kpi-tag {
    font-size: 7.5px;
    font-weight: 800;
    color: #059669;
    background: #ecfdf5;
    padding: 2px 7px;
    border-radius: 12px;
    border: 1px solid #a7f3d0;
  }

  .phase-card h4 {
    margin: 0 0 2px 0;
    font-size: 9.5px;
    font-weight: 800;
    color: #0f172a;
  }

  .phase-card p {
    margin: 0 0 4px 0;
    font-size: 7.8px;
    color: #475569;
    line-height: 1.55;
  }

  .phase-details-row {
    display: flex;
    gap: 12px;
    font-size: 7px;
    color: #1e40af;
    background: #f8fafc;
    padding: 3px 6px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  /* THE ASK (Page 12) */
  .ask-box-highlight {
    background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
    border-radius: 9px;
    padding: 12px 16px;
    color: #ffffff;
    margin-bottom: 10px;
  }

  .ask-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ask-label, .equity-label {
    font-size: 8px;
    color: #93c5fd;
    font-weight: 700;
    display: block;
    margin-bottom: 2px;
  }

  .ask-amount, .equity-amount {
    font-size: 22px;
    font-weight: 900;
    color: #38bdf8;
    line-height: 1.1;
  }

  .ask-notes, .equity-notes {
    font-size: 7px;
    color: #cbd5e1;
    display: block;
    margin-top: 2px;
  }

  .fund-alloc-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 9px;
  }

  .alloc-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 7px;
    text-align: center;
  }

  .alloc-pct {
    font-size: 17px;
    font-weight: 900;
    color: #2563eb;
    margin-bottom: 1px;
  }

  .alloc-title {
    font-size: 7.8px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 2px;
    line-height: 1.3;
  }

  .alloc-card p {
    margin: 0;
    font-size: 6.8px;
    color: #64748b;
    line-height: 1.4;
  }

  .exit-options-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 8px;
  }

  .exit-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 8px;
  }

  .exit-card strong {
    font-size: 8px;
    color: #1e3a8a;
    display: block;
    margin-bottom: 2px;
  }

  .exit-card p {
    margin: 0;
    font-size: 7.2px;
    color: #475569;
    line-height: 1.45;
  }

  .term-sheet-summary-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 5px 8px;
    margin-bottom: 8px;
    font-size: 7px;
    color: #1e293b;
  }

  .cta-contact-box {
    background: #ffffff;
    border: 1.5px solid #2563eb;
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
  }

  .cta-text h4 {
    margin: 0 0 2px 0;
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
  }

  .cta-text p {
    margin: 0;
    font-size: 7.2px;
    color: #64748b;
    line-height: 1.35;
    max-width: 90%;
  }

  .cta-contact-info {
    font-size: 7.8px;
    color: #1e293b;
    line-height: 1.65;
    white-space: nowrap;
    border-right: 1.5px solid #e2e8f0;
    padding-right: 12px;
  }

  .cta-contact-info strong {
    color: #2563eb;
  }

  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    body {
      background: #ffffff;
    }
    .page {
      margin: 0;
      box-shadow: none;
    }
  }
`;

// ==========================================
// BUILD FINAL HTML
// ==========================================
const totalPages = pages.length;

const pagesHtml = pages.map((p, index) => {
  const pageNum = index + 1;
  if (p.isCover) {
    return `
      <section class="page page-cover">
        ${p.contentHtml}
      </section>
    `;
  }

  return `
    <section class="page page-${pageNum}">
      <div class="topline">
        <div class="topline-brand">
          <img src="${imgLogo}" alt="مميز" />
          <span>مميز · نظام إدارة المصانع (Momayaz Factory ERP)</span>
        </div>
        <div>${p.sectionKicker}</div>
      </div>

      <div class="page-content-wrapper">
        <div class="kicker">${p.sectionKicker}</div>
        <h1 class="page-title">${p.pageTitle}</h1>
        ${p.contentHtml}
      </div>

      <div class="footer">
        <div>
          <span>مذكرة استثمارية · شركة مميز للمنتجات الرقمية</span>
          &nbsp;·&nbsp;
          <span class="footer-confidential">سري للغاية · للمستثمرين فقط</span>
        </div>
        <div>
          <span>صفحة ${pageNum} من ${totalPages}</span>
        </div>
      </div>
    </section>
  `;
}).join('\n');

const fullHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>مميز ERP | المذكرة الاستثمارية والعرض التقديمي</title>
  <style>
    ${cssStyles}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

const htmlFilePath = 'deliverables/investor-memorandum.html';
const pdfFilePath = 'deliverables/momayaz-erp-investor-memorandum.pdf';

console.log('Writing HTML file to ' + htmlFilePath + '...');
await writeFile(htmlFilePath, fullHtml);
console.log('HTML written successfully.');

// ==========================================
// LAUNCH PLAYWRIGHT & VALIDATE OVERFLOW
// ==========================================
console.log('Launching Playwright Chrome to verify layout and print PDF...');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  // Check for overflow on every page
  const overflowReport = await page.locator('.page').evaluateAll((pageElements) => {
    return pageElements.map((el, i) => {
      const footer = el.querySelector('.footer');
      const content = el.querySelector('.page-content-wrapper') || el.firstElementChild;
      const isCover = el.classList.contains('page-cover');

      const clientHeight = el.clientHeight;
      const scrollHeight = el.scrollHeight;

      let contentBottom = 0;
      let footerTop = clientHeight;

      if (!isCover && footer && content) {
        contentBottom = content.getBoundingClientRect().bottom;
        footerTop = footer.getBoundingClientRect().top;
      }

      return {
        page: i + 1,
        isCover,
        clientHeight,
        scrollHeight,
        hasVerticalScroll: scrollHeight > clientHeight + 1,
        collidesWithFooter: !isCover && contentBottom > footerTop - 4,
        contentBottom,
        footerTop
      };
    });
  });

  console.log('Page layout audit report:');
  let hasErrors = false;
  overflowReport.forEach((r) => {
    const status = (r.hasVerticalScroll || r.collidesWithFooter) ? '❌ OVERFLOW' : '✅ OK';
    console.log(`Page ${r.page}: ${status} (scrollHeight=${r.scrollHeight}, clientHeight=${r.clientHeight}, diff=${r.footerTop - r.contentBottom}px)`);
    if (r.hasVerticalScroll || r.collidesWithFooter) {
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.warn('Warning: Some pages have content overflowing or colliding with footers. Review metrics above.');
  }

  // Generate PDF
  console.log('Generating PDF to ' + pdfFilePath + '...');
  await page.pdf({
    path: pdfFilePath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  console.log('PDF generated successfully!');

  // Capture preview screenshots of key pages
  console.log('Capturing sample preview images...');
  await page.locator('.page').nth(0).screenshot({ path: 'deliverables/preview-page-1-cover.png' });
  await page.locator('.page').nth(3).screenshot({ path: 'deliverables/preview-page-4-solution.png' });
  await page.locator('.page').nth(4).screenshot({ path: 'deliverables/preview-page-5-sales.png' });
  await page.locator('.page').nth(5).screenshot({ path: 'deliverables/preview-page-6-mfg.png' });
  await page.locator('.page').nth(6).screenshot({ path: 'deliverables/preview-page-7-payroll.png' });
  await page.locator('.page').nth(9).screenshot({ path: 'deliverables/preview-page-10-financials.png' });
  await page.locator('.page').nth(11).screenshot({ path: 'deliverables/preview-page-12-ask.png' });
  console.log('Previews captured successfully.');

} finally {
  await browser.close();
}
