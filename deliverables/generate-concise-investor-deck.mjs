import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

console.log('Loading assets for concise investor deck...');
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
          <span>ملخص استثماري موجز · Seed Round</span>
        </div>
      </div>

      <div class="cover-hero">
        <div class="pill-category">نظام التشغيل الرقمي للمصانع والورش الإنتاجية · B2B SaaS</div>
        <h1 class="hero-heading">
          نظام مميز لإدارة المصانع<br />
          <span class="color-highlight">Momayaz Factory ERP</span>
        </h1>
        <p class="hero-desc">
          المنصة السحابية المتكاملة لربط كل تفاصيل المصنع: من استقبال طلب العميل وعرض السعر، حتى معادلات التصنيع وخصم الخامات، والفواتير والتحصيل، وأجور العمال اليومية.
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
              <strong>نظام حقيقي ومجرّب</strong>
              <span>مُشغّل ومختبر على خطوط إنتاج فعلية</span>
            </div>
          </div>
          <div class="q-item">
            <span class="check-icon">✓</span>
            <div>
              <strong>شامل وسهل الاستخدام</strong>
              <span>واجهة عربية بسيطة بدون أي تعقيد</span>
            </div>
          </div>
          <div class="q-item">
            <span class="check-icon">✓</span>
            <div>
              <strong>سوق ضخم غير مخدوم</strong>
              <span>120,000+ مصنع في المنطقة</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cover-bottom">
        <div><strong>طبيعة المشروع:</strong> منصة سحابية باشتراك شهري/سنوي (B2B SaaS)</div>
        <div><strong>جاهزية المنتج:</strong> مكتمل 100% وجاهز للتوسع المباشر</div>
        <div><strong>التاريخ:</strong> سبتمبر 2026</div>
      </div>
    </div>
  `
});

// ==========================================
// PAGE 2: THE BIG PICTURE (Problem & Solution)
// ==========================================
pages.push({
  kicker: 'الرؤية والفرصة · The Big Picture',
  title: 'المشكلة الحقيقية في المصانع وحل "مميز" المبتكر',
  contentHtml: `
    <div class="simple-intro">
      معظم المصانع والورش المتوسطة والصغيرة في منطقتنا بتعاني من فوضى يومية بسبب اعتمادها على الدفاتر الورقية وشيتات الإكسيل. دا بيعمل هدر خامات وتسريب فلوس، وفي نفس الوقت برامج الـ ERP العالمية غالية جداً ومعقدة ومبتناسبش طريقة شغلنا.
    </div>

    <div class="two-box-compare">
      <div class="box-problem">
        <div class="box-header-tag danger">المشكلة اللي بتواجه أي صاحب مصنع</div>
        <ul class="bullet-list danger">
          <li><strong>برامج الحسابات العادية مش فاهمة تصنيع:</strong> بتسجل الفاتورة وخلاص، ومبتعرفش يعني إيه خلطة إنتاج أو هدر خامات.</li>
          <li><strong>البرامج العالمية (SAP وغيره) مكلفة ومعقدة:</strong> أسعارها بتعدي مئات الآلاف من الجنيهات وتطبيقها بياخد شهور وبتفشل مع العمالة.</li>
          <li><strong>فوضى الدفاتر والإكسيل:</strong> خامات بتضيع ومحدش عارف راحت فين، شيكات بتتأخر في التحصيل، ومشاكل أسبوعية في حساب يوميات وسلف العمال.</li>
        </ul>
      </div>

      <div class="box-solution">
        <div class="box-header-tag success">الحل البسيط والعملي مع "مميز"</div>
        <ul class="bullet-list success">
          <li><strong>مصمم خصيصاً للمصنع العربي:</strong> بيفهم دورة الشغل كاملة (خامات، مقاسات، ألوان، طبقات، ويوميات عمال).</li>
          <li><strong>سحابي وسهل ومش محتاج أجهزة معقدة:</strong> بيشتغل من أي كمبيوتر أو تابلت أو موبايل بواجهة عربية واضحة جداً لأي مستخدم.</li>
          <li><strong>دورة مقفولة بتوقف الهدر والسرقة:</strong> كل طلب بيتحول لأمر شغل، والخامات بتتخصم أوتوماتيك بدقة بالجرام والكيلو.</li>
        </ul>
      </div>
    </div>

    <h3 class="simple-subtitle">أرقام تختصر قوة المشروع والفرصة</h3>

    <div class="simple-metrics-row">
      <div class="m-card">
        <span class="m-number" dir="ltr">35%</span>
        <strong>متوسط خفض الهدر</strong>
        <p>في استهلاك المواد الخام وأجور العمالة غير المحسوبة</p>
      </div>
      <div class="m-card">
        <span class="m-number" dir="ltr">120K+</span>
        <strong>مصنع مستهدف</strong>
        <p>في مصر والسعودية والخليج وشمال أفريقيا</p>
      </div>
      <div class="m-card">
        <span class="m-number" dir="ltr">100%</span>
        <strong>جاهزية تشغيلية</strong>
        <p>مش فكرة ولا نموذج أولي، شغال ومجرّب بالفعل</p>
      </div>
      <div class="m-card">
        <span class="m-number highlight" dir="ltr">16.6x</span>
        <strong>نسبة LTV / CAC</strong>
        <p>عائد استثنائي مقارنة بتكلفة جذب المصنع المشترك</p>
      </div>
    </div>

    <div class="quote-summary-box">
      <strong>فكرة المشروع ببساطة:</strong> تقديم بديل عربي، سهل، وسريع، وبتكلفة اشتراك بسيطة جداً لأي مصنع، عشان ينقل إدارته بالكامل للكمبيوتر والموبايل في أيام معدودة.
    </div>
  `
});

// ==========================================
// PAGE 3: WHAT THE SYSTEM DOES (Modules)
// ==========================================
pages.push({
  kicker: 'مكونات النظام · Core Modules',
  title: 'ماذا يقدم "مميز" للمصنع؟ (5 أقسام مترابطة)',
  contentHtml: `
    <div class="simple-intro">
      النظام متصمم بحيث يغطي كل دورة حياة الإنتاج والبيع في المصنع بدون أي فجوات، وبطريقة مترابطة أوتوماتيكياً:
    </div>

    <div class="modules-grid-simple">
      <div class="module-card">
        <div class="mod-icon">١</div>
        <div class="mod-content">
          <h4>المبيعات وعروض الأسعار الذكية</h4>
          <p>
            تجهيز عروض أسعار احترافية في ثواني بضغطة زر واحدة (مع إمكانية تحويل نص رسالة الواتساب لعرض سعر بالذكاء الاصطناعي)، ومشاركتها مع العميل بلينك فوري وسريع على الموبايل بدون طباعة ورق.
          </p>
          <span class="mod-tag">عروض أسعار · أوامر شغل · كشف حساب عميل</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٢</div>
        <div class="mod-content">
          <h4>وصفات التصنيع والخصم الآلي للخامات</h4>
          <p>
            تسجيل وصفة كل منتج (المكونات، الأوزان، الطبقات، والنسب). وبمجرد تشغيل أمر الإنتاج، النظام بيخصم كميات الخامات بدقة من المخزن، ويمنع خروج أي جرام زيادة بدون إذن رسمي.
          </p>
          <span class="mod-tag">معادلات BOM · منع الهدر · حركات الخامات</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٣</div>
        <div class="mod-content">
          <h4>المخزون وتنبيهات النواقص والموردين</h4>
          <p>
            متابعة أرصدة الخامات لحظة بلحظة مع شاشة تنبيهات ملونة تبلغ المدير قبل ما أي خامة تنقص، وإدارة كاملة لفواتير الموردين والمدفوعات وكشوف حساباتهم التراكمية.
          </p>
          <span class="mod-tag">إنذار النواقص · كشف حساب المورد · حركة الوارد</span>
        </div>
      </div>

      <div class="module-card">
        <div class="mod-icon">٤</div>
        <div class="mod-content">
          <h4>الفواتير والتحصيل وإدارة الشيكات</h4>
          <p>
            إصدار فواتير بيع مباشر أو فواتير أوامر تشغيل بترقيم محكم يمنع أي فجوات، مع محفظة ذكية لمتابعة الشيكات البنكية (تحت التحصيل، اتحصلت، أو مرتدة) وتأثيرها على رصيد العميل.
          </p>
          <span class="mod-tag">ترقيم ذري للفواتير · محفظة شيكات · تحصيل</span>
        </div>
      </div>

      <div class="module-card wide-card">
        <div class="mod-icon">٥</div>
        <div class="mod-content">
          <h4>حسابات العمال واليوميات والرواتب الأسبوعية</h4>
          <p>
            متفصل لطبيعة العمال في المصانع: تسجيل الحضور (يوم كامل، نصف يوم، ربع يوم، غياب)، احتساب الساعات الإضافية والحوافز والسلف والخصومات، مع إقفال أسبوعي موثق يمنع صرف الأجر مرتين ويوفر ساعات الحساب اليدوي الطويلة.
          </p>
          <span class="mod-tag">حضور باليومية · سلف وإضافي · صرف أسبوعي محكم · سجل تدقيق وتصحيح</span>
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
// PAGE 4: WHY MOMAYAZ WINS (Competitive Moats)
// ==========================================
pages.push({
  kicker: 'نقاط القوة والأمان · Competitive Edge',
  title: 'لماذا يختار المصنع "مميز" دون غيره؟',
  contentHtml: `
    <div class="simple-intro">
      سر قوة "مميز" إنه مش برنامج معمول في مكاتب مغلقة؛ دا مبني ومطوّر من قلب عنبر الإنتاج، ومتجرب على أرض الواقع عشان يحل المشاكل اليومية اللي بتواجه صاحب المصنع والعمال والمهندسين.
    </div>

    <div class="four-advantages-grid">
      <div class="adv-card">
        <div class="adv-badge">سهولة الاستخدام</div>
        <h4>أي موظف أو عامل يقدر يشتغل عليه</h4>
        <p>
          واجهة عربية نظيفة ومريحة، بدون شاشات معقدة أو مصطلحات محاسبية صعبة. التدريب عليه بياخد ساعات قليلة مش شهور، ومفيش أي مقاومة من فريق العمل في استخدامه.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">رقابة ومنع تلاعب</div>
        <h4>صلاحيات صارمة وحماية من أي تلاعب</h4>
        <p>
          المدير بيحدد لكل موظف صلاحياته بدقة (مثلاً: موظف الحضور ملوش دعوة بالرواتب، وموظف المبيعات ملوش دعوة بالوصفات)، وأي تعديل أو إلغاء بيتقفل بصلاحيات المدير ويتسجل في سجل تاريخي دائم.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">أمان واسترجاع فوري</div>
        <h4>نسخ احتياطي مشفر واسترجاع بـ 43 ثانية</h4>
        <p>
          البيانات بتتنسخ يومياً بتشفير عسكري قوي (AES-256). تم اختبار استعادة بيانات المصنع كاملة في <strong>43 ثانية فقط</strong>، يعني بيانات المصنع وحساباته في أمان تام حتى لو جهاز الكمبيوتر حصله أي تلف.
        </p>
      </div>

      <div class="adv-card">
        <div class="adv-badge">متابعة لحظية</div>
        <h4>مزامنة مع Google Sheets لمتابعة الموبايل</h4>
        <p>
          النظام بيرفع ملخص الشغل أوتوماتيك لملفات Google Sheets، عشان صاحب المصنع يقدر يشوف مبيعاته وأرصدته وخاماته من موبايله في أي لحظة وبكل بساطة وهو مسافر أو برة المصنع.
        </p>
      </div>
    </div>

    <h3 class="simple-subtitle">مقارنة سريعة تلخص الفارق</h3>

    <div class="simple-comp-table-wrap">
      <table class="simple-comp-table">
        <thead>
          <tr>
            <th>وجه المقارنة</th>
            <th class="col-momayaz">نظام مميز لإدارة المصانع</th>
            <th>برامج الحسابات الشائعة</th>
            <th>الأنظمة العالمية (SAP / Odoo)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>التخصص في التصنيع والإنتاج</strong></td>
            <td class="col-momayaz win">✓ متفصل بالكامل لدورة التصنيع والخامات</td>
            <td>✗ تجاري ومحاسبي فقط</td>
            <td>▲ معقد جداً ويتطلب تعديلات ضخمة</td>
          </tr>
          <tr>
            <td><strong>حساب يوميات وسلف العمال</strong></td>
            <td class="col-momayaz win">✓ جاهز لنظام اليوميات والسلف الأسبوعية</td>
            <td>✗ رواتب شهرية مكتبية فقط</td>
            <td>✗ لا يدعم ثقافة اليومية المحلية</td>
          </tr>
          <tr>
            <td><strong>التكلفة وسرعة البدء</strong></td>
            <td class="col-momayaz win">✓ اشتراك شهري بسيط وتشغيل في أيام</td>
            <td>▲ تراخيص مكلفة ودعم ضعيف</td>
            <td>✗ تكلفة فلكية ($50K+) وشهور تطبيق</td>
          </tr>
          <tr>
            <td><strong>الارتباط بالعميل (الاستمرارية)</strong></td>
            <td class="col-momayaz win">✓ التصاق عالي جداً (من الصعب تغييره)</td>
            <td>▲ سهل الاستبدال</td>
            <td>▲ مكلف الاستبدال لكنه غير عملي</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="quote-summary-box">
      <strong>الخلاصة:</strong> نحن نقدم المنتج الذي كانت تحتاجه آلاف المصانع ولم تجده في السوق: بسيط، متخصص، غير مكلف، ويعمل بكفاءة عالية من أول يوم.
    </div>
  `
});

// ==========================================
// PAGE 5: BUSINESS MODEL & THE INVESTMENT ASK
// ==========================================
pages.push({
  kicker: 'الاستثمار ونموذج العمل · Business & The Ask',
  title: 'نموذج الربحية، خطة النمو، والعرض الاستثماري',
  contentHtml: `
    <div class="simple-intro">
      يعتمد المشروع على نموذج اشتراكات برمجية سحابية متكررة (SaaS) بهوامش ربح تتجاوز 85%، مع تدفقات نقدية مستمرة تتيح للشركة الوصول لنقطة التعادل والربحية السريعة دون الحاجة لحرق أموال طائلة.
    </div>

    <div class="two-col-invest">
      <div class="col-left-pricing">
        <h4 class="sub-heading-bar">باقات الاشتراك الشهرية والسنوية</h4>
        <div class="pricing-mini-list">
          <div class="p-tier-box">
            <div class="tier-head">
              <strong>الباقة الأساسية · Starter</strong>
              <span dir="ltr">$99 / شهر</span>
            </div>
            <p>للورش والمصانع الصغيرة (حتى 3 مستخدمين ومخزن واحد)</p>
          </div>
          <div class="p-tier-box featured">
            <div class="tier-head">
              <strong>باقة النمو · Growth (الأكثر طلباً)</strong>
              <span dir="ltr">$249 / شهر</span>
            </div>
            <p>للمصانع المتوسطة (مستخدمين غير محدودين + عروض بالـ AI + رواتب العمال + مزامنة سحابية)</p>
          </div>
          <div class="p-tier-box">
            <div class="tier-head">
              <strong>باقة المؤسسات · Enterprise</strong>
              <span dir="ltr">$499+ / شهر</span>
            </div>
            <p>للمصانع الكبرى (خادم سحابي مخصص + ربط الفاتورة الإلكترونية والضرائب ZATCA)</p>
          </div>
        </div>

        <h4 class="sub-heading-bar" style="margin-top: 10px;">التوقعات المالية لـ 3 سنوات</h4>
        <table class="mini-fin-table">
          <thead>
            <tr>
              <th>المؤشر</th>
              <th>السنة 1</th>
              <th>السنة 2</th>
              <th>السنة 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>المصانع المشتركة</td>
              <td dir="ltr">120 مصنع</td>
              <td dir="ltr">450 مصنع</td>
              <td dir="ltr">1,200 مصنع</td>
            </tr>
            <tr>
              <td>الإيراد السنوي (ARR)</td>
              <td dir="ltr">$324,000</td>
              <td dir="ltr">$1.35M</td>
              <td dir="ltr">$4.20M</td>
            </tr>
            <tr class="profit-highlight">
              <td>صافي الربح التشغيلي</td>
              <td dir="ltr">$85,000</td>
              <td dir="ltr">$520,000</td>
              <td dir="ltr">$1.89M</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-right-ask">
        <div class="the-ask-card">
          <span class="ask-tag">جولة التمويل التأسيسية المستهدفة (Seed)</span>
          <div class="ask-figure" dir="ltr">$350,000</div>
          <div class="equity-figure">مقابل حصة ملكية <strong>15% – 20%</strong></div>
          <span class="ask-sub-note">أو ما يعادلها بالعملة المحلية · مخصصة لتسريع الانتشار التجاري</span>
        </div>

        <h4 class="sub-heading-bar">خطة استخدام رأس المال</h4>
        <div class="use-funds-list">
          <div class="fund-row">
            <span class="fund-pct" dir="ltr">40%</span>
            <div><strong>فريق المبيعات والتسويق B2B:</strong> استهداف المجمعات الصناعية الكبرى والمعارض.</div>
          </div>
          <div class="fund-row">
            <span class="fund-pct" dir="ltr">30%</span>
            <div><strong>تطوير المنتج وتطبيقات الموبايل:</strong> تسريع تطبيق الهاتف الذكي للمديرين والـ AI.</div>
          </div>
          <div class="fund-row">
            <span class="fund-pct" dir="ltr">15%</span>
            <div><strong>التوسع في السعودية (ZATCA):</strong> تراخيص السوق والربط الضريبي الإلزامي.</div>
          </div>
          <div class="fund-row">
            <span class="fund-pct" dir="ltr">15%</span>
            <div><strong>البنية السحابية والسيولة الاحتياطية:</strong> تشغيل مستقر يضمن أمان 18 شهراً.</div>
          </div>
        </div>

        <div class="cta-direct-box">
          <h4>جاهزون لمناقشة التفاصيل وتجربة النظام الحية؟</h4>
          <p>يسعدنا ترتيب جلسة استعراض حية للبرنامج (Live Demo) ومناقشة تفاصيل المشاركة الاستثمارية.</p>
          <div class="cta-links">
            <span><strong>إيميل:</strong> <span dir="ltr">mohamedmahmoud.h13@gmail.com</span></span>
            <span><strong>هاتف:</strong> <span dir="ltr">+20 111 619 1687</span></span>
            <span><strong>موقع:</strong> <span dir="ltr">https://momayaz-erp.com</span></span>
          </div>
        </div>
      </div>
    </div>
  `
});

// ==========================================
// CSS STYLING (Concise, Clean & Breathable)
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
    color: #dc2626;
    font-weight: 700;
    background: #fef2f2;
    padding: 1px 7px;
    border-radius: 4px;
    border: 1px solid #fecaca;
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

  .conf-tag .dot {
    width: 6px;
    height: 6px;
    background: #dc2626;
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

  .m-number {
    font-size: 22px;
    font-weight: 900;
    color: #1e3a8a;
    line-height: 1.1;
    display: block;
    margin-bottom: 2px;
  }

  .m-number.highlight {
    color: #059669;
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

  /* PAGE 4 (Why Momayaz Wins) */
  .four-advantages-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  .adv-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
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
    margin: 0 0 4px 0;
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
  }

  .adv-card p {
    margin: 0;
    font-size: 8.5px;
    color: #475569;
    line-height: 1.65;
  }

  .simple-comp-table-wrap {
    margin-bottom: 12px;
  }

  .simple-comp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5px;
  }

  .simple-comp-table th {
    background: #f1f5f9;
    color: #0f172a;
    padding: 7px 9px;
    border: 1px solid #cbd5e1;
    text-align: right;
    font-weight: 800;
  }

  .simple-comp-table td {
    padding: 7px 9px;
    border: 1px solid #e2e8f0;
    line-height: 1.5;
  }

  .col-momayaz {
    background: #eff6ff !important;
    font-weight: 800;
  }

  .col-momayaz.win {
    color: #15803d;
    background: #f0fdf4 !important;
  }

  /* PAGE 5 (Business & Ask) */
  .two-col-invest {
    display: grid;
    grid-template-columns: 1.15fr 1.25fr;
    gap: 14px;
    align-items: start;
  }

  .sub-heading-bar {
    font-size: 10.5px;
    font-weight: 800;
    color: #1e3a8a;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .sub-heading-bar::before {
    content: '';
    width: 3px;
    height: 11px;
    background: #2563eb;
    border-radius: 2px;
  }

  .pricing-mini-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
  }

  .p-tier-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 7px 10px;
  }

  .p-tier-box.featured {
    border: 2px solid #2563eb;
    background: #f8fbff;
  }

  .tier-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  .tier-head strong {
    font-size: 9.5px;
    color: #0f172a;
  }

  .tier-head span {
    font-size: 11px;
    font-weight: 900;
    color: #1e40af;
  }

  .p-tier-box p {
    margin: 0;
    font-size: 7.8px;
    color: #64748b;
    line-height: 1.35;
  }

  .mini-fin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8px;
  }

  .mini-fin-table th {
    background: #0f172a;
    color: #ffffff;
    padding: 5px 6px;
    border: 1px solid #334155;
    text-align: right;
  }

  .mini-fin-table td {
    padding: 5px 6px;
    border: 1px solid #e2e8f0;
  }

  .profit-highlight td {
    background: #ecfdf5;
    font-weight: 800;
    color: #047857;
  }

  .the-ask-card {
    background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);
    border-radius: 9px;
    padding: 12px 14px;
    color: #ffffff;
    text-align: center;
    margin-bottom: 10px;
  }

  .ask-tag {
    font-size: 8px;
    color: #93c5fd;
    font-weight: 700;
    display: block;
    margin-bottom: 2px;
  }

  .ask-figure {
    font-size: 24px;
    font-weight: 900;
    color: #38bdf8;
    line-height: 1.1;
  }

  .equity-figure {
    font-size: 10px;
    color: #e2e8f0;
    margin-top: 2px;
  }

  .equity-figure strong {
    color: #10b981;
    font-size: 11px;
  }

  .ask-sub-note {
    font-size: 7px;
    color: #94a3b8;
    display: block;
    margin-top: 3px;
  }

  .use-funds-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 10px;
  }

  .fund-row {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 5px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 7.8px;
  }

  .fund-pct {
    font-size: 12px;
    font-weight: 900;
    color: #2563eb;
    width: 32px;
    flex-shrink: 0;
  }

  .fund-row strong {
    color: #0f172a;
  }

  .cta-direct-box {
    background: #ffffff;
    border: 1.5px solid #2563eb;
    border-radius: 8px;
    padding: 9px 12px;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.08);
  }

  .cta-direct-box h4 {
    margin: 0 0 2px 0;
    font-size: 9.5px;
    font-weight: 800;
    color: #0f172a;
  }

  .cta-direct-box p {
    margin: 0 0 6px 0;
    font-size: 7.5px;
    color: #64748b;
    line-height: 1.4;
  }

  .cta-links {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 7.8px;
    color: #1e293b;
    border-top: 1px solid #e2e8f0;
    padding-top: 5px;
  }

  .cta-links strong {
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
        <div>${p.kicker}</div>
      </div>

      <div class="page-content-wrapper">
        <div class="kicker">${p.kicker}</div>
        <h1 class="page-title">${p.title}</h1>
        ${p.contentHtml}
      </div>

      <div class="footer">
        <div>
          <span>ملخص استثماري موجز · شركة مميز للمنتجات الرقمية</span>
          &nbsp;·&nbsp;
          <span class="footer-conf">سري للمستثمرين فقط</span>
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
  <title>مميز ERP | ملخص المشروع وعرض الاستثمار</title>
  <style>
    ${cssStyles}
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

const htmlFilePath = 'deliverables/concise-investor-deck.html';
const pdfFilePath = 'deliverables/momayaz-erp-investor-summary.pdf';

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

  // Capture preview screenshots of all 5 pages
  console.log('Capturing sample preview images...');
  for (let i = 0; i < totalPages; i++) {
    await page.locator('.page').nth(i).screenshot({ path: `deliverables/concise-preview-p${i + 1}.png` });
  }
  console.log('All 5 preview pages captured successfully.');

} finally {
  await browser.close();
}
