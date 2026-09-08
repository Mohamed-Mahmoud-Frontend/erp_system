/**
 * Arabic UI string dictionary.
 * ALL Arabic text used in UI components must come from here.
 * Do not hardcode Arabic strings inline in components.
 */
export const ar = {
  // ── App ──────────────────────────────────────────────────────────────────
  appName: "نظام إدارة مصنع الخزانات",
  appTagline: "إدارة المصنع بكفاءة واحترافية",

  // ── Navigation ───────────────────────────────────────────────────────────
  nav: {
    dashboard: "لوحة التحكم",
    clients: "العملاء",
    invoices: "الفواتير",
    orders: "الطلبات",
    materials: "المواد الخام",
    workers: "العمال",
    suppliers: "الموردون",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
  },

  // ── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginButton: "دخول",
    loggingIn: "جارٍ الدخول...",
    invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صحيحة",
    sessionExpired: "انتهت جلستك، يرجى تسجيل الدخول مجدداً",
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  clients: {
    title: "العملاء",
    add: "إضافة عميل",
    edit: "تعديل بيانات العميل",
    name: "الاسم",
    type: "النوع",
    types: {
      trader: "تاجر",
      contractor: "مقاول",
      individual: "فرد",
      company: "شركة",
      office: "مكتب",
    },
    priceTier: "فئة السعر",
    creditDays: "أيام الائتمان",
    phone: "الهاتف",
    address: "العنوان",
    balance: "الرصيد",
    createdAt: "تاريخ الإضافة",
    search: "بحث عن عميل...",
    filterByType: "تصفية حسب النوع",
    allTypes: "جميع الأنواع",
    noClients: "لا يوجد عملاء",
    invoiceHistory: "سجل الفواتير",
    paymentHistory: "سجل المدفوعات",
  },

  // ── Invoices ──────────────────────────────────────────────────────────────
  invoices: {
    title: "الفواتير",
    invoiceNumber: "رقم الفاتورة",
    total: "الإجمالي",
    balanceDue: "المبلغ المتبقي",
    createdAt: "تاريخ الإصدار",
    status: {
      paid: "مدفوعة",
      partial: "جزئياً",
      unpaid: "غير مدفوعة",
    },
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    title: "المدفوعات",
    method: "طريقة الدفع",
    methods: {
      cash: "نقداً",
      transfer: "تحويل بنكي",
      cheque: "شيك",
    },
    amount: "المبلغ",
    paidAt: "تاريخ الدفع",
  },

  // ── Cheques ───────────────────────────────────────────────────────────────
  cheques: {
    title: "الشيكات",
    dueDate: "تاريخ الاستحقاق",
    status: {
      pending: "قيد الانتظار",
      cleared: "تم الصرف",
      bounced: "مرتجع",
    },
  },

  // ── Materials ─────────────────────────────────────────────────────────────
  materials: {
    title: "المواد الخام",
    type: "النوع",
    stockQty: "الكمية في المخزن",
    unit: "الوحدة",
    units: {
      kg: "كجم",
      ton: "طن",
    },
    minThreshold: "الحد الأدنى للتنبيه",
    lowStock: "مخزون منخفض",
    movement: "حركة المواد",
    direction: {
      in: "وارد",
      out: "صادر",
    },
    isReturn: "مرتجع",
    qty: "الكمية",
  },

  // ── Workers ───────────────────────────────────────────────────────────────
  workers: {
    title: "العمال",
    name: "الاسم",
    dailyWage: "الأجر اليومي",
    attendance: "الحضور والغياب",
    workDate: "تاريخ العمل",
    status: {
      present: "حاضر",
      absent: "غائب",
      half_day: "نصف يوم",
      quarter_day: "ربع يوم",
    },
    extraUnits: "وحدات إضافية",
    transactions: "المعاملات المالية",
    transactionTypes: {
      advance: "سلفة",
      deduction: "خصم",
      bonus: "مكافأة",
    },
    weeklySummary: "ملخص الأسبوع",
  },

  // ── Suppliers ─────────────────────────────────────────────────────────────
  suppliers: {
    title: "الموردون",
    name: "الاسم",
    balance: "الرصيد",
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    title: "الطلبات",
    productSpec: "مواصفات المنتج",
    quantity: "الكمية",
    status: {
      pending: "قيد الانتظار",
      in_production: "قيد التصنيع",
      completed: "مكتمل",
      cancelled: "ملغي",
    },
  },

  // ── Quotations ────────────────────────────────────────────────────────────
  quotations: {
    title: "عروض الأسعار",
    status: {
      draft: "مسودة",
      sent: "مرسل",
      approved: "موافق عليه",
      rejected: "مرفوض",
    },
    requestQuote: "اطلب عرض سعر",
  },

  // ── Common ────────────────────────────────────────────────────────────────
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    confirm: "تأكيد",
    loading: "جارٍ التحميل...",
    saving: "جارٍ الحفظ...",
    error: "حدث خطأ",
    success: "تمت العملية بنجاح",
    required: "هذا الحقل مطلوب",
    noData: "لا توجد بيانات",
    search: "بحث",
    filter: "تصفية",
    reset: "إعادة تعيين",
    next: "التالي",
    previous: "السابق",
    page: "صفحة",
    of: "من",
    actions: "الإجراءات",
    view: "عرض",
    back: "رجوع",
    egp: "ج.م",
    date: "التاريخ",
    notes: "ملاحظات",
    total: "الإجمالي",
  },

  // ── Public site ───────────────────────────────────────────────────────────
  public: {
    heroTitle: "مصنع خزانات المياه",
    heroSubtitle: "نصنع الجودة، نوصل الثقة",
    heroDescription:
      "مصنع متخصص في تصنيع خزانات المياه بجميع الأحجام والمواصفات. نخدم المقاولين والتجار والأفراد في جميع أنحاء مصر.",
    ctaQuote: "اطلب عرض سعر الآن",
    ctaContact: "تواصل معنا",
    features: {
      quality: "جودة عالية",
      qualityDesc: "نستخدم أفضل الخامات المعتمدة",
      delivery: "توصيل سريع",
      deliveryDesc: "نصل إليك في الوقت المحدد",
      warranty: "ضمان شامل",
      warrantyDesc: "ضمان على جميع منتجاتنا",
    },
    quoteForm: {
      title: "اطلب عرض سعر",
      name: "الاسم الكامل",
      phone: "رقم الهاتف",
      tankSize: "حجم الخزان المطلوب",
      quantity: "الكمية",
      notes: "ملاحظات إضافية",
      submit: "إرسال الطلب",
      submitting: "جارٍ الإرسال...",
      successMessage: "تم استلام طلبك! سنتواصل معك قريباً.",
    },
  },
} as const;

export type ArDictionary = typeof ar;
