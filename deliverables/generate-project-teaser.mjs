import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

console.log('Loading assets for executive project overview (teaser)...');
const fontCairoArabic = await readFile('node_modules/@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2');
const fontCairoLatin = await readFile('node_modules/@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2');

const logoMomayaz = await readFile('public/LOGOMOMAYAZ.png');
const shotDashboard = await readFile('audit/design/dashboard-desktop.png');
const shotQuotation = await readFile('audit/quotation/desktop.png');
const shotPayroll = await readFile('audit/batch4/payroll-Batch4-cb5a0530-031d-4153-ad7b-8eb673cedb16.png');
const shotShortage = await readFile('audit/batch3/shortage-Batch3-d4777b91-3887-4b6b-b944-76a8fea71c4f.png');

const b64 = (buf, mime) => `data:${mime};base64,${buf.toString('base64')}`;

const imgLogo = b64(logoMomayaz, 'image/png');
const imgDashboard = b64(shotDashboard, 'image/png');
const imgQuotation = b64(shotQuotation, 'image/png');
const imgPayroll = b64(shotPayroll, 'image/png');
const imgShortage = b64(shotShortage, 'image/png');

const pages = [];

// ==========================================
// PAGE 1: COVER
// ==========================================
pages.push({
  isCover: true,
  contentHtml: `
    <div class="cover-wrapper">
      <div class="cover-topbar">
        <div class="brand-badge">
          <img src="${imgLogo}" alt="مميز" class="brand-logo" />
          <div>
            <span class="brand-title">شركة مميز للحلول والبرمجيات</span>
            <span class="brand-subtitle" dir="ltr">Momayaz Digital Products &amp; Software</span>
          </div>
        </div>
        <div class="conf-tag">
          <span class="dot"></span>
          <span>ملف تعريفي تنفيذي · Executive Overview</span>
        </div>
      </div>

      <div class="cover-hero">
        <div class="pill-category">التحول الرقمي الصناعي · Industrial Cloud Solutions</div>
        <h1 class="hero-heading">
          نظام مميز لإدارة المصانع<br />
          <span class="color-highlight">Momayaz Factory ERP</span>
        </h1>
        <p class="hero-desc">
          منظومة التشغيل والرقابة المتكاملة للمصانع والمنشآت الإنتاجية، لربط المبيعات، التصنيع، المخزون، الحسابات، وأجور العمال في مساحة سحابية موحدة تجمع بين السهولة والرقابة الصارمة.
        </p>

        <div class="device-mockup">
          <div class="browser-bar">
            <span class="dot-btn red"></span>
            <span class="dot-btn yellow"></span>
            <span class="dot-btn green"></span>
            <span class="browser-url" dir="ltr">https://app.momayaz-erp.com</span>
          </div>
          <img src="${imgDashboard}" alt="لوحة التحكم" class="screen-preview" />
        </div>

        <div class="cover-quick-highlights">
          <div class="q-item">
            <span class="check-icon">✓</span>
            <div>
              <strong>نظام حقيقي ومُجرّب</strong>
              <span>مُشغّل ومختبر على خطوط إنتاج فعلية</span>
            </div>
          </div>
          <div class="q-item">
            <span class="check-icon">✓</span>
            <div>
              <strong>مصمم للبيئة الصناعية العربية</strong>
              <span>واجهة عربية واضحة بدون تعقيد برامجي</span>
            </div>
          </div>
          <div class="q-item">
            <span class="check-icon">✓</span>
            <div>
              <strong>دورة تشغيلية مغلقة</strong>
              <span>من استلام الطلب حتى التحصيل وحساب الأرباح</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cover-bottom">
        <div><strong>طبيعة المستند:</strong> نبذة تعريفية عامة عن المشروع والمنتج</div>
        <div><strong>جاهزية النظام:</strong> مكتمل تشغيلياً وجاهز للتوسع المباشر</div>
        <div><strong>التاريخ:</strong> سبتمبر 2026</div>
      </div>
    </div>
  `
});

// ==========================================
// PAGE 2: PROBLEM & SOLUTION
// ==========================================
pages.push({
  kicker: 'الرؤية والفرصة · The Big Picture',
  title: 'المشكلة الحقيقية في المصانع وحل "مميز" الذكي',
  contentHtml: `
    <div class="simple-intro">
      تعتمد معظم المصانع والورش الإنتاجية في العالم العربي على مزيج متعب من الدفاتر الورقية وجداول الإكسيل المشتتة. هذا النقص في الأتمتة يتسبب في هدر الخامات، تسريب الأموال، وغياب الرؤية اللحظية لإدارة المصنع، بينما البرامج العالمية باهظة ومعقدة للغاية.
    </div>

    <div class="two-box-compare">
      <div class="box-problem">
        <div class="box-header-tag danger">الفجوة الحالية في سوق المصانع</div>
        <ul class="bullet-list danger">
          <li><strong>برامج الحسابات التقليدية غير مناسبة:</strong> تسجل الفواتير بعد حدوثها فقط، ولا تفهم يعني إيه خط إنتاج، خلطات تشغيل، أو تتبع خامات.</li>
          <li><strong>أنظمة الـ ERP العالمية معقدة وباهظة:</strong> تكاليفها خيالية وتطبيقها يستغرق شهوراً طويلة وتفشل في التأقلم مع ثقافة العمل والعمالة المحلية.</li>
          <li><strong>فوضى الدفاتر والإكسيل:</strong> هدر في الخامات دون معرفة سببه، تأخر تحصيل الشيكات، ونزاعات أسبوعية مستمرة حول يوميات وسلف العمال.</li>
        </ul>
      </div>

      <div class="box-solution">
        <div class="box-header-tag success">الحل العملي والمتكامل من "مميز"</div>
        <ul class="bullet-list success">
          <li><strong>مصمم خصيصاً للمصنع العربي:</strong> يغطي دورة الشغل كاملة (خامات، مقاسات، ألوان، طبقات، ويوميات عمالة).</li>
          <li><strong>سحابي وسهل الاستخدام:</strong> يعمل بسلاسة من أي كمبيوتر أو تابلت أو موبايل بواجهة عربية نظيفة وسريعة لأي مستخدم.</li>
          <li><strong>دورة تشغيلية محكمة توقف الهدر:</strong> تحويل كل طلب لخط إنتاج مع خصم آلي وفوري للخامات بدقة متناهية بالجرام والكيلو.</li>
        </ul>
      </div>
    </div>

    <h3 class="simple-subtitle">ركائز تميز المشروع في السوق الصناعي</h3>

    <div class="simple-metrics-row">
      <div class="m-card">
        <span class="m-badge-icon">🎯</span>
        <strong>تخصص صناعي حقيقي</strong>
        <p>مبني على فهم تفصيلي لدورة التصنيع وليس مجرد برنامج مبيعات تجاري</p>
      </div>
      <div class="m-card">
        <span class="m-badge-icon">⚡</span>
        <strong>سرعة وسهولة التشغيل</strong>
        <p>بدء العمل الفوري دون الحاجة لشهور تدريب أو إعدادات برمجية معقدة</p>
      </div>
      <div class="m-card">
        <span class="m-badge-icon">🛡️</span>
        <strong>رقابة ومنع تلاعب</strong>
        <p>صلاحيات صارمة وسجل تدقيق تاريخي يحمي أموال وخامات المصنع</p>
      </div>
      <div class="m-card">
        <span class="m-badge-icon">📈</span>
        <strong>فرصة سوقية واعدة</strong>
        <p>آلاف المصانع تبحث عن بديل عملي للتخلص من الأوراق والإكسيل</p>
      </div>
    </div>

    <div class="quote-summary-box">
      <strong>الهدف الاستراتيجي:</strong> تقديم نظام تشغيل رقمي مبسط وعصري يُمكّن صاحب المصنع من متابعة إنتاجه ومبيعاته وخاماته وعماله من أي مكان، ويوقف الهدر المالي من أول يوم تشغيل.
    </div>
  `
});

// ==========================================
// PAGE 3: CORE CAPABILITIES (Modules Overview)
// ==========================================
pages.push({
  kicker: 'إمكانيات النظام · Core Capabilities',
  title: 'ماذا يقدم "مميز" للمصنع؟ (منظومة تشغيل متكاملة)',
  contentHtml: `
    <div class="simple-intro">
      يغطي النظام كل ما يحتاجه المصنع في مساحة عمل واحدة مترابطة تلقائياً، دون الحاجة للتنقل بين عدة برامج أو سجلات منفصلة:
    </div>

    <div class="modules-grid-simple">
      <div class="module-card">
        <div class="mod-icon">١</div>
        <div class="mod-content">
          <h4>المبيعات وعروض الأسعار التفاعلية</h4>
          <p>
            إعداد عروض أسعار احترافية وسريعة، مع إمكانية مشاركة العرض فورياً مع العميل عبر رابط ويب آمن وتفاعلي على الواتساب للاطلاع والموافقة دون الحاجة لطباعة أوراق.
          </p>
          <span class="mod-tag">عروض أسعار · أوامر شغل · كشوف حسابات العملاء</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٢</div>
        <div class="mod-content">
          <h4>وصفات التصنيع والخصم الآلي للخامات (BOM)</h4>
          <p>
            تحديد مكونات ومقادير كل صنف بدقة. وبمجرد اعتماد أمر التشغيل، يقوم النظام بخصم كميات الخامات تلقائياً من الأرصدة لمنع الهدر والسرقة وضبط تكلفة الإنتاج.
          </p>
          <span class="mod-tag">معادلات الإنتاج · حماية سر الصنعة · خصم لحظي</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٣</div>
        <div class="mod-content">
          <h4>المخزون والإنذار المبكر للنواقص والموردين</h4>
          <p>
            متابعة دقيقة لأرصدة الخامات والمواد الأولية، مع لوحة تنبيهات ذكية تبلّغ الإدارة قبل نفاد أي خامة لتفادي توقف الماكينات، بالإضافة لكشوف حسابات الموردين وفواتيرهم.
          </p>
          <span class="mod-tag">إنذار النواقص · حسابات الموردين · حركة المخزن</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٤</div>
        <div class="mod-content">
          <h4>الفوترة، التحصيل، ومحفظة الشيكات البنكية</h4>
          <p>
            إصدار فواتير نقدية وآجلة بترقيم محكم مانع للثغرات، مع محفظة متكاملة لمتابعة دورة حياة الشيكات (قيد التحصيل / محصلة / مرفوضة) وتأثيرها المباشر على رصيد العميل.
          </p>
          <span class="mod-tag">ترقيم فواتير محكم · متابعة الشيكات · مديونيات</span>
        </div>
      </div>

      <div class="module-card wide-card">
        <div class="mod-icon">٥</div>
        <div class="mod-content">
          <h4>شؤون العمال واليوميات والرواتب الأسبوعية</h4>
          <p>
            مصمم لطبيعة العمالة باليومية في المصانع: تسجيل الحضور بحالاته، احتساب الساعات الإضافية، الحوافز، السلف، والخصومات، مع إقفال أسبوعي موثق يمنع تكرار الصرف ويقضي على الخلافات العمالية.
          </p>
          <span class="mod-tag">حضور باليومية · سلف وإضافي · صرف أسبوعي محكم · سجل تدقيق تاريخي</span>
        </div>
      </div>
    </div>

    <div class="simple-preview-strip">
      <div class="strip-item">
        <img src="${imgQuotation}" alt="عروض الأسعار" />
        <span>عروض الأسعار ومشاركتها</span>
      </div>
      <div class="strip-item">
        <img src="${imgShortage}" alt="مراقبة الخامات" />
        <span>مراقبة الخامات والنواقص</span>
      </div>
      <div class="strip-item">
        <img src="${imgPayroll}" alt="الرواتب والعمال" />
        <span>رواتب العمال الأسبوعية</span>
      </div>
    </div>
  `
});

// ==========================================
// PAGE 4: WHY MOMAYAZ & NEXT STEPS
// ==========================================
pages.push({
  kicker: 'المميزات والخطوة القادمة · Highlights & Next Steps',
  title: 'عوامل القوة التنافسية وآفاق التعاون المستقبلي',
  contentHtml: `
    <div class="simple-intro">
      ما يميز "مميز" هو واقعيته الكاملة؛ النظام ليس مجرد فكرة برمجية نظرية، بل خلاصة تجربة وتطوير في قلب مصنع حقيقي، مما منحه قوة واعتمادية عالية تلبي احتياجات الإدارة والتشغيل معاً.
    </div>

    <div class="four-advantages-grid">
      <div class="adv-card">
        <div class="adv-badge">سهولة الاستخدام</div>
        <h4>سريع الفهم ولا يتطلب خبرات تقنية</h4>
        <p>
          واجهة عربية نظيفة ومريحة، مصممة لتناسب كافة مستويات الموظفين والعمال في المصنع، مما يجعل عملية الاعتماد اليومي سريعة ودون أي مقاومة للتغيير.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">فصل الصلاحيات والأمان</div>
        <h4>حوكمة مشددة وحماية تامة للبيانات</h4>
        <p>
          يحدد المدير صلاحيات كل قسم بدقة (فصل بيانات الأجور عن موظفي الحضور، وقفل تعديل الوصفات والأسعار)، مع تشفير يومي قوي للبيانات لضمان أعلى معايير الخصوصية.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">المتابعة عن بُعد</div>
        <h4>تقارير فورية على الهاتف والتابلت</h4>
        <p>
          يستطيع مالك المصنع متابعة المبيعات، حركات الخامات، الأرصدة، والمصروفات أولاً بأول من هاتفه المحمول حتى أثناء السفر أو التواجد خارج المصنع.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">التوافق والتطوير</div>
        <h4>جاهزية للتوسع والربط الإلكتروني</h4>
        <p>
          معمارية سحابية حديثة قابلة للتوسع لخدمة مئات المصانع، مع جاهزية كاملة للتكامل مع منظومات الفاتورة الإلكترونية والربط الحكومي في مصر والمملكة العربية السعودية.
        </p>
      </div>
    </div>

    <div class="next-phase-panel">
      <h4>خارطة الطريق والتوسع المستقبلي</h4>
      <div class="next-phase-steps">
        <div class="np-step">
          <strong>١. التوسع في المجمعات الصناعية</strong>
          <span>استهداف مئات المصانع في المناطق الإنتاجية الكبرى.</span>
        </div>
        <div class="np-step">
          <strong>٢. التوسع الإقليمي والربط الضريبي</strong>
          <span>التكامل مع منظومة ZATCA السعودية والفاتورة الإلكترونية.</span>
        </div>
        <div class="np-step">
          <strong>٣. تطبيق الموبايل والذكاء الاصطناعي</strong>
          <span>تطبيق مخصص لقيادات المصانع مع تحليلات تنبؤية للإنتاج.</span>
        </div>
      </div>
    </div>

    <div class="investor-contact-card">
      <div class="inv-text">
        <h4>هل ترغب في استكشاف الفرصة بالتفصيل؟</h4>
        <p>
          يسعدنا تقديم <strong>عرض تجريبي حي للنظام (Live System Demo)</strong>، ومشاركة نموذج العمل والبيانات المالية التفصيلية وخطة النمو مع المستثمرين والشركاء المهتمين.
        </p>
      </div>
      <div class="inv-action">
        <div class="inv-contact-item"><strong>البريد الإلكتروني:</strong> <span dir="ltr">mohamedmahmoud.h13@gmail.com</span></div>
        <div class="inv-contact-item"><strong>الهاتف والواتساب:</strong> <span dir="ltr">+20 111 619 1687</span></div>
        <div class="inv-contact-item"><strong>الموقع الرسمي:</strong> <span dir="ltr">https://momayaz-erp.com</span></div>
      </div>
    </div>
  `
});

// ==========================================
// CSS STYLING
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
    font-size: 11.5px;
    line-height: 1.85;
  }

  .page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    background: #ffffff;
    margin: 8mm auto;
    padding: 13mm 16mm 14mm 16mm;
    position: relative;
    overflow: hidden;
    break-after: page;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .page:last-child {
    break-after: auto;
  }

  /* Header & Footer */
  .topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 12px;
    font-size: 9px;
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
    font-size: 8.5px;
    color: #94a3b8;
  }

  .footer-conf {
    color: #2563eb;
    font-weight: 700;
    background: #eff6ff;
    padding: 1px 7px;
    border-radius: 4px;
    border: 1px solid #bfdbfe;
  }

  .kicker {
    font-size: 9.5px;
    color: #2563eb;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  h1.page-title {
    font-size: 21px;
    line-height: 1.35;
    font-weight: 900;
    color: #0b192c;
    margin: 0 0 9px 0;
    letter-spacing: -0.3px;
  }

  .simple-intro {
    background: #f8fafc;
    border-right: 4px solid #2563eb;
    padding: 9px 13px;
    border-radius: 6px;
    font-size: 10.5px;
    line-height: 1.85;
    color: #334155;
    margin-bottom: 14px;
    border: 1px solid #e2e8f0;
    border-right-width: 4px;
  }

  .simple-subtitle {
    font-size: 12.5px;
    font-weight: 800;
    color: #1e3a8a;
    margin: 14px 0 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .simple-subtitle::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 14px;
    background: #2563eb;
    border-radius: 2px;
  }

  /* COVER (Page 1) */
  .cover-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 12px;
  }

  .brand-badge {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-logo {
    height: 48px;
    width: auto;
  }

  .brand-title {
    font-size: 15px;
    font-weight: 900;
    color: #0b192c;
    display: block;
  }

  .brand-subtitle {
    font-size: 8.5px;
    color: #64748b;
    font-weight: 600;
    display: block;
  }

  .conf-tag {
    background: #eff6ff;
    color: #1e40af;
    font-size: 8.5px;
    font-weight: 800;
    padding: 5px 12px;
    border-radius: 30px;
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .conf-tag .dot {
    width: 6px;
    height: 6px;
    background: #2563eb;
    border-radius: 50%;
  }

  .cover-hero {
    padding: 10px 0;
  }

  .pill-category {
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

  .hero-heading {
    font-size: 30px;
    line-height: 1.35;
    font-weight: 900;
    color: #0b192c;
    margin: 0 0 10px 0;
  }

  .color-highlight {
    background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-desc {
    font-size: 12px;
    line-height: 1.9;
    color: #475569;
    max-width: 95%;
    margin: 0 0 15px 0;
  }

  .device-mockup {
    background: #0f172a;
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.35);
    margin-bottom: 16px;
  }

  .browser-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px 6px 8px;
  }

  .dot-btn {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .dot-btn.red { background: #ef4444; }
  .dot-btn.yellow { background: #f59e0b; }
  .dot-btn.green { background: #10b981; }

  .browser-url {
    font-size: 8px;
    color: #94a3b8;
    background: #1e293b;
    padding: 2px 14px;
    border-radius: 4px;
    margin-right: auto;
  }

  .screen-preview {
    width: 100%;
    height: 86mm;
    object-fit: cover;
    object-position: top;
    border-radius: 6px;
    display: block;
  }

  .cover-quick-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .q-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 9px 12px;
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .q-item strong {
    display: block;
    font-size: 9.5px;
    color: #0f172a;
    margin-bottom: 1px;
  }

  .q-item span {
    font-size: 8px;
    color: #64748b;
    line-height: 1.35;
  }

  .check-icon {
    color: #16a34a;
    font-weight: 900;
    font-size: 14px;
    line-height: 1;
    margin-top: 1px;
  }

  .cover-bottom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    border-top: 1.5px solid #e2e8f0;
    padding-top: 12px;
    font-size: 8.5px;
    color: #475569;
  }

  .cover-bottom strong {
    color: #0f172a;
  }

  /* PAGE 2 (Problem & Solution) */
  .two-box-compare {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .box-problem, .box-solution {
    background: #ffffff;
    border-radius: 8px;
    padding: 12px 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  }

  .box-problem {
    border: 1px solid #fecaca;
    border-top: 4px solid #ef4444;
  }

  .box-solution {
    border: 1px solid #bbf7d0;
    border-top: 4px solid #10b981;
    background: #fcfdfd;
  }

  .box-header-tag {
    font-size: 9.5px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 6px;
    display: inline-block;
    margin-bottom: 8px;
  }

  .box-header-tag.danger {
    background: #fef2f2;
    color: #b91c1c;
  }

  .box-header-tag.success {
    background: #f0fdf4;
    color: #15803d;
  }

  .bullet-list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 9px;
    color: #334155;
    line-height: 1.75;
  }

  .bullet-list li {
    position: relative;
    padding-right: 14px;
    margin-bottom: 8px;
  }

  .bullet-list.danger li::before {
    content: '✗';
    position: absolute;
    right: 0;
    color: #dc2626;
    font-weight: 900;
  }

  .bullet-list.success li::before {
    content: '✓';
    position: absolute;
    right: 0;
    color: #16a34a;
    font-weight: 900;
  }

  .simple-metrics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    margin-bottom: 12px;
  }

  .m-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .m-badge-icon {
    font-size: 18px;
    display: block;
    margin-bottom: 4px;
  }

  .m-card strong {
    display: block;
    font-size: 9.5px;
    color: #0f172a;
    margin-bottom: 2px;
  }

  .m-card p {
    margin: 0;
    font-size: 7.8px;
    color: #64748b;
    line-height: 1.35;
  }

  .quote-summary-box {
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #bfdbfe;
    border-right: 4px solid #2563eb;
    border-radius: 7px;
    padding: 9px 14px;
    font-size: 9.5px;
    color: #1e3a8a;
    line-height: 1.7;
  }

  /* PAGE 3 (Modules) */
  .modules-grid-simple {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .module-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .module-card.wide-card {
    grid-column: span 2;
    background: #f8fbff;
    border-color: #bfdbfe;
  }

  .mod-icon {
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 900;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #bfdbfe;
    flex-shrink: 0;
  }

  .mod-content h4 {
    margin: 0 0 3px 0;
    font-size: 10.5px;
    font-weight: 800;
    color: #0f172a;
  }

  .mod-content p {
    margin: 0 0 5px 0;
    font-size: 8.5px;
    color: #475569;
    line-height: 1.65;
  }

  .mod-tag {
    display: inline-block;
    background: #f1f5f9;
    color: #1e40af;
    font-size: 7.5px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
  }

  .simple-preview-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
  }

  .strip-item {
    text-align: center;
  }

  .strip-item img {
    width: 100%;
    height: 48mm;
    object-fit: cover;
    object-position: top;
    border-radius: 5px;
    border: 1px solid #cbd5e1;
    display: block;
    margin-bottom: 4px;
  }

  .strip-item span {
    font-size: 8px;
    font-weight: 700;
    color: #334155;
  }

  /* PAGE 4 (Why Momayaz & Next Steps) */
  .four-advantages-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .adv-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .adv-badge {
    background: #eff6ff;
    color: #1e40af;
    font-size: 7.5px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 10px;
    display: inline-block;
    margin-bottom: 4px;
    border: 1px solid #bfdbfe;
  }

  .adv-card h4 {
    margin: 0 0 3px 0;
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
  }

  .adv-card p {
    margin: 0;
    font-size: 8.2px;
    color: #475569;
    line-height: 1.6;
  }

  .next-phase-panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 12px;
  }

  .next-phase-panel h4 {
    margin: 0 0 6px 0;
    font-size: 10px;
    font-weight: 800;
    color: #1e3a8a;
  }

  .next-phase-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .np-step {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 8px;
  }

  .np-step strong {
    display: block;
    font-size: 8.5px;
    color: #0f172a;
    margin-bottom: 2px;
  }

  .np-step span {
    font-size: 7.2px;
    color: #64748b;
    line-height: 1.35;
    display: block;
  }

  .investor-contact-card {
    background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
    border-radius: 9px;
    padding: 12px 16px;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.25);
  }

  .inv-text h4 {
    margin: 0 0 4px 0;
    font-size: 11px;
    font-weight: 800;
    color: #38bdf8;
  }

  .inv-text p {
    margin: 0;
    font-size: 8px;
    color: #e2e8f0;
    line-height: 1.5;
    max-width: 90%;
  }

  .inv-action {
    border-right: 1.5px solid rgba(255, 255, 255, 0.2);
    padding-right: 14px;
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 8px;
  }

  .inv-contact-item strong {
    color: #93c5fd;
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
        <div>${p.kicker}</div>
      </div>

      <div class="page-content-wrapper">
        <div class="kicker">${p.kicker}</div>
        <h1 class="page-title">${p.title}</h1>
        ${p.contentHtml}
      </div>

      <div class="footer">
        <div>
          <span>ملف تعريفي تنفيذي · شركة مميز للمنتجات الرقمية</span>
          &nbsp;·&nbsp;
          <span class="footer-conf">نظرة عامة على المشروع</span>
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
  <title>مميز ERP | ملف تعريفي تنفيذي بالمشروع</title>
  <style>
    ${cssStyles}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

const htmlFilePath = 'deliverables/project-teaser.html';
const pdfFilePath = 'deliverables/momayaz-erp-project-overview.pdf';

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

  // Capture preview screenshots of all 4 pages
  console.log('Capturing sample preview images...');
  for (let i = 0; i < totalPages; i++) {
    await page.locator('.page').nth(i).screenshot({ path: `deliverables/teaser-preview-p${i + 1}.png` });
  }
  console.log('All 4 preview pages captured successfully.');

} finally {
  await browser.close();
}
