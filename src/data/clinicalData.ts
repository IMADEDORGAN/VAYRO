import { ClinicalSampleCase, SavedExamRecord } from '../types/ophthalmology';

export const CHRONIC_CONDITIONS_LIST = [
  'السكري من النوع الثاني أو الأول',
  'ارتفاع ضغط الدم الشرياني',
  'قصر النظر الشديد (High Myopia)',
  'تاريخ عائلي للمياه الزرقاء (الجلوكوما)',
  'ارتفاع الكوليسترول والدهون الثلاثية',
  'عمليات عيون أو ليزك سابقة',
];

export const OCULAR_SYMPTOMS_LIST = [
  'تشوش أو ضبابية في الرؤية المركزية',
  'بقع عائمة أو خيوط سوداء (الذبابة الطائرة)',
  'تموج أو انحناء في الخطوط المستقيمة',
  'هالات ضوئية وتوهج ليلي حول المصابيح',
  'تراجع الرؤية المحيطية (الجانبية)',
  'إجهاد بصري أو صداع حول الحجاج',
  'بهتان الألوان وصعوبة القراءة في الإضاءة الخافتة',
];

export const CLINICAL_SAMPLE_CASES: ClinicalSampleCase[] = [
  {
    id: 'healthy-fundus',
    title: 'شبكية عين سليمة ونموذجية',
    englishTitle: 'Normal Healthy Retinal Fundus',
    category: 'فحص مرجعي سليم',
    imagePath: '/src/assets/images/retina_healthy_fundus_1790893459022.jpg',
    defaultPatientContext: {
      eye: 'OD',
      age: 34,
      conditions: [],
      symptoms: [],
      notes: 'فحص دوري وقائي لقاع العين والشبكية.',
    },
    hotspotAnnotations: [
      {
        id: 'hs-1',
        x: 68,
        y: 48,
        label: 'القرص البصري (Optic Disc)',
        detail: 'حواف عصبية واضحة ولون وردي صحي مع نسبة تقعر طبيعية 0.28 C/D.',
        severity: 'normal',
      },
      {
        id: 'hs-2',
        x: 36,
        y: 51,
        label: 'اللطخة الصفراء والنقرة (Macula & Fovea)',
        detail: 'منعكس بقعي مركزي سليم خالٍ من الارتشاحات أو النزيف.',
        severity: 'normal',
      },
      {
        id: 'hs-3',
        x: 55,
        y: 28,
        label: 'القوس الوعائي الصدغي العلوي',
        detail: 'نسبة قطر الشريان إلى الوريد 2:3 طبيعية ومسار وعائي منتظم.',
        severity: 'normal',
      },
    ],
    precomputedResult: {
      primaryDiagnosis: 'شبكية عين سليمة (قاع عين طبيعي)',
      englishDiagnosis: 'Normal Retinal Fundus Examination',
      icdCode: 'ICD-11: Z01.00',
      urgencyLevel: 'روتيني',
      severityStatus: 'سليم',
      confidenceScore: 98.4,
      riskScore: 8,
      estimatedCupToDiscRatio: '0.28',
      vesselTortuosityIndex: 'A/V 2:3 منتظم',
      maculaIntegrityScore: 98,
      executiveSummary:
        'يُظهر التحليل الرقمي لقاع العين سلامة تامة للهياكل التشريحية للشبكية. القرص البصري ذو حواف محددة بوضوح ونسبة تقعر فسيولوجية طبيعية (0.28)، كما تبدو اللطخة الصفراء والنقرة المركزية خالية من أي وذمة أو تجمعات دهنية، مع انتظام مسار الشرايين والأوردة الشبكية.',
      anatomicalAssessment: {
        opticDisc:
          'القرص البصري (Optic Nerve Head) يتميز بلون وردي برتقالي صحي، حواف واضحة غير متوذمة، ونسبة تقعر إلى القرص (C/D Ratio) تبلغ 0.28 وهي ضمن النطاق الفسيولوجي المثالي (أقل من 0.40).',
        maculaAndFovea:
          'اللطخة الصفراء (Macula) ذات تصبغ متجانس ومنعكس نقري مركزي واضح، مع غياب تام لأي ارتشاحات صلبة أو نزيف نقطي أو تغيرات تنكسية.',
        retinalVessels:
          'الأقواس الوعائية العلوية والسفلية تسير بانتظام دون تعرج مرضي أو تصالب شرياني وريدي ضاغط، ونسبة الشريان للوريد 2:3 مثالية.',
        anteriorAndMedia:
          'الأوساط الانكسارية (القرنية، العدسة، والجسم الزجاجي) شفافة تماماً مما أتاح رؤية عالية الوضوح لطبقات الشبكية.',
      },
      biomarkers: [
        {
          name: 'حواف العصب البصري (Neuroretinal Rim)',
          location: 'القرص البصري الأنفي والصدغي',
          status: 'سليم',
          description: 'سمك الألياف العصبية يتبع قاعدة ISNT الفسيولوجية دون ترقق بؤري.',
        },
        {
          name: 'المنعكس النقري (Foveal Reflex)',
          location: 'مركز اللطخة الصفراء',
          status: 'سليم',
          description: 'توزع صبغي منتظم في النقرة المركزية يدعم حدة إبصار 6/6.',
        },
        {
          name: 'الشبكة الوعائية الدقيقة (Microvasculature)',
          location: 'الأرباع الأربعة للشبكية',
          status: 'سليم',
          description: 'غياب الأمهات الدموية الدقيقة (Microaneurysms) أو النزيف الشبكي.',
        },
      ],
      solutionsAndPlan: {
        medicalInterventions: [
          'لا توجد حاجة لأي تدخل دوائي أو جراحي حالياً نظراً لسلامة الشبكية والعصب البصري.',
          'الاستمرار في الفحص الوقائي السنوي لقاع العين وقياس ضغط العين.',
        ],
        immediateActions: [
          'تطبيق قاعدة 20-20-20 عند استخدام الشاشات (النظر لمسافة 20 قدماً لمدة 20 ثانية كل 20 دقيقة).',
          'ارتداء نظارات شمسية بمعيار حماية UV400 عند التعرض لأشعة الشمس المباشرة لحماية اللطخة الصفراء.',
        ],
        lifestyleAndNutrition: [
          'تناول الأغذية الغنية بمضادات الأكسدة البصرية (اللوتين والزياكسانثين) الموجودة في السبانخ والكرنب والذرة الصفراء.',
          'الحفاظ على ترطيب الجسم وتناول أحماض أوميغا-3 لدعم طبقة الدموع والأوعية الشبكية.',
        ],
        recommendedLabTests: [
          'فحص روتيني لحدة الإبصار والانكسار كل 12 شهراً.',
          'تصوير مقطعي للترابط البصري (OCT) كخط أساس مرجعي بعد سن الأربعين.',
        ],
        followUpTimeline: 'مراجعة دورية روتينية بعد 12 شهراً',
      },
    },
  },
  {
    id: 'diabetic-retinopathy',
    title: 'اعتلال الشبكية السكري غير التكاثري',
    englishTitle: 'Moderate Non-Proliferative Diabetic Retinopathy (NPDR)',
    category: 'أمراض الأوعية والشبكية',
    imagePath: '/src/assets/images/retina_diabetic_retinopathy_1790893471024.jpg',
    defaultPatientContext: {
      eye: 'OD',
      age: 56,
      conditions: ['السكري من النوع الثاني أو الأول', 'ارتفاع ضغط الدم الشرياني'],
      symptoms: ['تشوش أو ضبابية في الرؤية المركزية', 'بقع عائمة أو خيوط سوداء (الذبابة الطائرة)'],
      notes: 'مريض سكري منذ 9 سنوات يشكو من تذبذب في وضوح القراءة خلال الشهرين الماضيين.',
    },
    hotspotAnnotations: [
      {
        id: 'dr-1',
        x: 42,
        y: 44,
        label: 'مفرزات دهنية صلبة (Hard Exudates)',
        detail: 'ترسبات دهنية صفراء لامعة قرب اللطخة الصفراء نتيجة تسرب الأوعية الدموية الدقيقة.',
        severity: 'critical',
      },
      {
        id: 'dr-2',
        x: 54,
        y: 62,
        label: 'نزيف نقطي وبقعي (Dot & Blot Hemorrhages)',
        detail: 'بؤر نزفية دقيقة في الطبقات الوسطى للشبكية ناتجة عن ضعف جدران الشعيرات.',
        severity: 'warning',
      },
      {
        id: 'dr-3',
        x: 33,
        y: 55,
        label: 'أمهات دموية دقيقة (Microaneurysms)',
        detail: 'تمددات كيسية مجهرية في الشعيرات الشبكية حول منطقة النقرة.',
        severity: 'warning',
      },
    ],
    precomputedResult: {
      primaryDiagnosis: 'اعتلال الشبكية السكري غير التكاثري المتوسط مع اشتباه وذمة بقعية',
      englishDiagnosis: 'Moderate NPDR with Suspected Diabetic Macular Edema (DME)',
      icdCode: 'ICD-11: 9B71.01',
      urgencyLevel: 'متابعة قريبة',
      severityStatus: 'متوسط',
      confidenceScore: 95.8,
      riskScore: 68,
      estimatedCupToDiscRatio: '0.34',
      vesselTortuosityIndex: 'A/V 1:2 مع تمدد وريدي طفيف',
      maculaIntegrityScore: 64,
      executiveSummary:
        'يُظهر فحص قاع العين علامات واضحة لاعتلال الشبكية السكري غير التكاثري من الدرجة المتوسطة، حيث تم رصد أمهات دموية دقيقة (Microaneurysms)، ونزيف شبكي نقطي وبقعي متفرق، بالإضافة إلى مفرزات دهنية صلبة (Hard Exudates) بالقرب من اللطخة الصفراء مما يستوجب فحص OCT لاستبعاد وذمة مركز الإبصار السكرية.',
      anatomicalAssessment: {
        opticDisc:
          'القرص البصري سليم الحواف بنسبة تقعر 0.34، ولا توجد أوعية دموية مستحدثة على القرص (No NVD) مما ينفي المرحلة التكاثرية حالياً.',
        maculaAndFovea:
          'تظهر تجمعات من المفرزات الصلبة الصفراء في القطب الخلفي على مقربة من النقرة المركزية، مما يشير إلى نفاذية وعائية مفرطة واحتمال وجود تسمك أو وذمة بقعية (Macular Edema).',
        retinalVessels:
          'احتقان طفيف في الأوردة الشبكية مع وجود أمهات دموية دقيقة متعددة ونزيف نقطي في أكثر من ربعين من أرباع الشبكية.',
        anteriorAndMedia:
          'الجسم الزجاجي خالٍ من النزيف الزجاجي الكثيف، والعدسة تسمح برؤية تفاصيل القطب الخلفي بوضوح.',
      },
      biomarkers: [
        {
          name: 'مفرزات صلبة (Hard Exudates)',
          location: 'المنطقة حول اللطخة الصفراء (Perimacular)',
          status: 'مؤشر مرضي',
          description: 'ترسبات دهنية وبروتينية متسربة من الشعيرات الدموية المتضررة بسبب ارتفاع السكر المزمن.',
        },
        {
          name: 'نزيف نقطي وبقعي (Dot-Blot Hemorrhages)',
          location: 'القوس الصدغي العلوي والسفلي',
          status: 'مؤشر مرضي',
          description: 'تجمعات دموية صغيرة داخل الطبقة النووية الداخلية والضفيرة الخارجية للشبكية.',
        },
        {
          name: 'أمهات دموية دقيقة (Microaneurysms)',
          location: 'القطب الخلفي للشبكية',
          status: 'ملاحظة خفيفة',
          description: 'أولى العلامات السريرية لاعتلال الأوعية الدقيقة السكري نتيجة فقدان الخلايا الحوطية (Pericytes).',
        },
      ],
      solutionsAndPlan: {
        medicalInterventions: [
          'في حال ثبوت وجود وذمة في مركز الإبصار عبر جهاز OCT: البدء بحقن مضادات عامل نمو بطانة الأوعية (Anti-VEGF مثل Aflibercept أو Ranibizumab أو Faricimab) داخل الجسم الزجاجي لتجفيف الارتشاح واستعادة حدة النظر.',
          'جلسات ليزر بؤري أو شبكي انتقائي إذا استدعت حالة التسرب الوعائي خارج المركز.',
          'التنسيق المباشر مع طبيب الغدد الصماء لضبط السكر التراكمي (HbA1c أقل من 7%) وضغط الدم (أقل من 130/80).',
        ],
        immediateActions: [
          'حجز موعد لدى استشاري شبكية خلال 7 إلى 14 يوماً لإجراء تصوير مقطعي لللطخة الصفراء (Macular OCT).',
          'تجنب الارتفاعات الحادة أو الهبوط المفاجئ في مستوى سكر الدم، ومراقبة مركز الإبصار يومياً باستخدام شبكة أمسلر.',
        ],
        lifestyleAndNutrition: [
          'الالتزام بنظام غذائي منخفض المؤشر الجلايسيمي وغني بالخضروات الورقية وأحماض أوميغا-3 لتقليل الالتهاب الوعائي الشبكي.',
          'الإقلاع التام عن التدخين وممارسة المشي المنتظم لتحسين التروية الدقيقة للشبكية.',
        ],
        recommendedLabTests: [
          'التصوير المقطعي للترابط البصري لللطخة الصفراء (Spectral-Domain OCT) لقياس سمك النقرة بالميكرومتر.',
          'تصوير الأوعية الشبكية بالفلوريسين أو بدون صبغة (OCT-Angiography) لتقييم التروية الشعرية.',
          'تحليل السكر التراكمي (HbA1c) ووظائف الكلى والدهون الثلاثية.',
        ],
        followUpTimeline: 'مراجعة أخصائي الشبكية خلال 7 - 14 يوماً',
      },
    },
  },
  {
    id: 'glaucoma-cupping',
    title: 'المياه الزرقاء وتقعر العصب البصري',
    englishTitle: 'Glaucomatous Optic Neuropathy (High C/D Ratio)',
    category: 'أمراض العصب البصري وضغط العين',
    imagePath: '/src/assets/images/retina_glaucoma_cupping_1790893481487.jpg',
    defaultPatientContext: {
      eye: 'OS',
      age: 62,
      conditions: ['تاريخ عائلي للمياه الزرقاء (الجلوكوما)'],
      symptoms: ['تراجع الرؤية المحيطية (الجانبية)', 'هالات ضوئية وتوهج ليلي حول المصابيح'],
      notes: 'فحص للعين اليسرى بسبب ملاحظة تقلص تدريجي في مجال الرؤية الجانبية.',
    },
    hotspotAnnotations: [
      {
        id: 'gl-1',
        x: 52,
        y: 49,
        label: 'توسع التقعر المركزي (Enlarged Optic Cup)',
        detail: 'ارتفاع نسبة التقعر إلى القرص البصري لتصل إلى 0.76 C/D مع شحوب مركزي.',
        severity: 'critical',
      },
      {
        id: 'gl-2',
        x: 54,
        y: 64,
        label: 'ترقق الحافة العصبية السفلية (Inferior Rim Thinning)',
        detail: 'فقدان بؤري في طبقة الألياف العصبية السفلية (مخالفة قاعدة ISNT).',
        severity: 'critical',
      },
      {
        id: 'gl-3',
        x: 47,
        y: 36,
        label: 'انزياح الأوعية الأنفية (Nasalization of Vessels)',
        detail: 'انحناء الأوعية الدموية عند حافة القرص البصري (Bayoneting sign).',
        severity: 'warning',
      },
    ],
    precomputedResult: {
      primaryDiagnosis: 'اشتباه قوي بالمياه الزرقاء (الجلوكوما) مع تقعر متقدم بالعصب البصري',
      englishDiagnosis: 'Suspected Open-Angle Glaucoma with Enlarged Optic Cupping',
      icdCode: 'ICD-11: 9C61.0',
      urgencyLevel: 'عاجل',
      severityStatus: 'متقدم',
      confidenceScore: 96.2,
      riskScore: 82,
      estimatedCupToDiscRatio: '0.76',
      vesselTortuosityIndex: 'انزياح أنفي للأوعية على القرص',
      maculaIntegrityScore: 86,
      executiveSummary:
        'يكشف التحليل المورفولوجي للقرص البصري عن توسع ملحوظ في الكأس البصري (نسبة التقعر C/D تبلغ 0.76 مقارنة بالمعدل الطبيعي < 0.40)، مع ترقق واضح في الحافة العصبية الشبكية السفلية والعلوية وانزياح الأوعية الدموية. هذه العلامات مميزة لاعتلال العصب البصري الجلوكومي وتستلزم قياس ضغط العين وتخطيط الساحة البصرية فوراً لحماية الألياف العصبية المتبقية.',
      anatomicalAssessment: {
        opticDisc:
          'توسع عمودي في الكأس البصري (Vertical Cup-to-Disc Ratio = 0.76) مع ترقق في الحلقة العصبية (Neuroretinal Rim) خاصة في القطب السفلي، وظهور الصفيحة المصفوية (Lamina Cribrosa) في عمق القرص.',
        maculaAndFovea:
          'اللطخة الصفراء المركزية محتفظة ببنيتها التشريحية، وهو ما يفسر بقاء حدة الإبصار المركزية جيدة رغم تأثر الألياف المحيطية.',
        retinalVessels:
          'تظهر علامة الانعطاف الحاد للأوعية عند حافة التقعر (Bayoneting Sign) مع إزاحة أنفية لجذع الأوعية المركزية.',
        anteriorAndMedia:
          'شفافية الأوساط جيدة؛ يلزم فحص زاوية الخزانة الأمامية (Gonioscopy) لتحديد ما إذا كانت الزاوية مفتوحة أو ضيقة.',
      },
      biomarkers: [
        {
          name: 'نسبة التقعر للقرص (Vertical C/D Ratio 0.76)',
          location: 'رأس العصب البصري (Optic Nerve Head)',
          status: 'مؤشر مرضي',
          description: 'تجاوز نسبة التقعر لحد 0.60 يدل على فقدان تدريجي في محاور الخلايا العقدية الشبكية.',
        },
        {
          name: 'ترقق الحافة العصبية (ISNT Rule Violation)',
          location: 'الحافة السفلية والعلوية للقرص',
          status: 'مؤشر مرضي',
          description: 'تآكل الألياف العصبية في القطب السفلي يرتبط عادة بعيوب قوسية في المجال البصري العلوي.',
        },
        {
          name: 'ضمور حول القرص (Peripapillary Atrophy)',
          location: 'المنطقة المحيطة بالحافة الصدغية للعصب',
          status: 'ملاحظة خفيفة',
          description: 'منطقة هلالية من التغير الصبغي حول القرص البصري ترفق حالات الجلوكوما المزمنة.',
        },
      ],
      solutionsAndPlan: {
        medicalInterventions: [
          'البدء الفوري بقطرات خفض ضغط العين (مثل نظائر البروستاجلاندين Latanoprost/Travoprost ليلاً، أو حاصرات بيتا Timolol) بعد قياس الضغط لدى الطبيب للوصول إلى الضغط المستهدف (Target IOP).',
          'الليزر الانتقائي لزاوية التصريف (SLT - Selective Laser Trabeculoplasty) كحل فعال وآمن لتحسين تصريف الخلط المائي.',
          'في الحالات غير المستجيبة للقطرات: جراحات الجلوكوما طفيفة التوغل (MIGS) أو عملية استئصال التربيق (Trabeculectomy).',
        ],
        immediateActions: [
          'مراجعة طبيب العيون بشكل عاجل خلال 3 إلى 5 أيام لقياس ضغط العين بجهاز Applanation Tonometry.',
          'تجنب استخدام أي قطرات تحتوي على الكورتيزون (الستيرويدات) دون إشراف طبي لأنها ترفع ضغط العين بشدة.',
        ],
        lifestyleAndNutrition: [
          'تجنب شرب كميات ضخمة من السوائل دفعة واحدة في وقت قصير، وتجنب وضعيات الرأس المنخفض لفترات طويلة.',
          'ممارسة التمارين الهوائية المعتدلة وتناول مضادات الأكسدة الداعمة لتروية العصب البصري (مثل مستخلص الجنكة بيلوبا وفيتامين B3/Nicotinamide بعد استشارة الطبيب).',
        ],
        recommendedLabTests: [
          'قياس ضغط العين الداخلي (Goldmann Applanation Tonometry) وقياس سمك القرنية المركزي (Pachymetry).',
          'التصوير المقطعي لطبقة الألياف العصبية الشبكية (RNFL & Ganglion Cell OCT).',
          'تخطيط الساحة البصرية الآلي (Humphrey Visual Field 24-2) وتنظير زاوية العين (Gonioscopy).',
        ],
        followUpTimeline: 'مراجعة عاجلة لطبيب العيون خلال 3 - 5 أيام',
      },
    },
  },
  {
    id: 'anterior-cataract',
    title: 'إعتام عدسة العين (المياه البيضاء)',
    englishTitle: 'Nuclear & Cortical Cataract (Lens Opacity)',
    category: 'أمراض الجزء الأمامي وعدسة العين',
    imagePath: '/src/assets/images/anterior_eye_cataract_1790893491629.jpg',
    defaultPatientContext: {
      eye: 'OD',
      age: 67,
      conditions: ['السكري من النوع الثاني أو الأول'],
      symptoms: [
        'تشوش أو ضبابية في الرؤية المركزية',
        'هالات ضوئية وتوهج ليلي حول المصابيح',
        'بهتان الألوان وصعوبة القراءة في الإضاءة الخافتة',
      ],
      notes: 'تراجع تدريجي غير مؤلم في وضوح الرؤية مع صعوبة القيادة ليلاً بسبب وهج الأضواء.',
    },
    hotspotAnnotations: [
      {
        id: 'cat-1',
        x: 50,
        y: 50,
        label: 'عتامة نووية بعدسة العين (Nuclear Lens Opacity)',
        detail: 'تغيم أصفر-حليبي في مركز العدسة البلورية خلف الحدقة يشتت الضوء الساقط على الشبكية.',
        severity: 'critical',
      },
      {
        id: 'cat-2',
        x: 35,
        y: 46,
        label: 'القزحية السدوية (Iris Stroma)',
        detail: 'بنية القزحية منتظمة مع استجابة حدقية محفوظة وعدم وجود التصاقات خلفية.',
        severity: 'normal',
      },
      {
        id: 'cat-3',
        x: 64,
        y: 54,
        label: 'حافة الحدقة والتشتت الضوئي',
        detail: 'انخفاض حساسية التباين البصري نتيجة تشتت الأشعة عبر الألياف البروتينية المتكتلة.',
        severity: 'warning',
      },
    ],
    precomputedResult: {
      primaryDiagnosis: 'المياه البيضاء (إعتام عدسة العين النووي المتقدم)',
      englishDiagnosis: 'Senile Nuclear Sclerotic Cataract',
      icdCode: 'ICD-11: 9B10.0',
      urgencyLevel: 'متابعة قريبة',
      severityStatus: 'متوسط',
      confidenceScore: 97.1,
      riskScore: 54,
      estimatedCupToDiscRatio: 'محجوب جزئياً بعتامة العدسة',
      vesselTortuosityIndex: 'فحص الجزء الأمامي للعين',
      maculaIntegrityScore: 88,
      executiveSummary:
        'يُظهر فحص الجزء الأمامي للعين وجود عتامة واضحة (تغيم حليبي-كهرماني) في العدسة البلورية داخل فتحة الحدقة، وهي العلامة الكلاسيكية للمياه البيضاء (الساد / Cataract). تؤدي هذه العتامة إلى تشتيت الضوء قبل وصوله إلى الشبكية، مما يفسر ضبابية الرؤية، بهتان الألوان، والوهج الليلي. الحالة قابلة للشفاء التام واستعادة الإبصار الكامل عبر إجراء سحب المياه البيضاء وزراعة عدسة ذكية.',
      anatomicalAssessment: {
        opticDisc:
          'يتطلب تقييم القرص البصري توسيع الحدقة وفحص قاع العين بالمصباح الشقي أو الموجات فوق الصوتية (B-Scan) إذا كانت العتامة كثيفة.',
        maculaAndFovea:
          'الوظيفة البقعية المتوقعة جيدة، ويُنصح بإجراء OCT لللطخة الصفراء قبل العملية لتحديد نوع العدسة المزروعة (أحادية أو متعددة البؤر).',
        retinalVessels:
          'المنعكس الأحمر لقاع العين (Red Reflex) منخفض الكثافة بسبب التصلب النووي في مركز العدسة البلورية.',
        anteriorAndMedia:
          'القرنية شفافة والخزانة الأمامية ذات عمق طبيعي، بينما تُظهر العدسة البلورية إعتاماً نووياً وقشرياً واضحاً داخل الحدقة.',
      },
      biomarkers: [
        {
          name: 'تغيم نواة العدسة (Nuclear Sclerosis)',
          location: 'العدسة البلورية خلف الحدقة',
          status: 'مؤشر مرضي',
          description: 'تراكم وتأكسد بروتينات الكريستالين داخل ألياف العدسة مما يحولها من شفافة إلى معتمة.',
        },
        {
          name: 'تراجع حساسية التباين (Reduced Contrast Sensitivity)',
          location: 'المحور البصري المركزي',
          status: 'مؤشر مرضي',
          description: 'تشتت الفوتونات الضوئية يسبب هالات حول المصابيح وانخفاض التمييز في الإضاءة المنخفضة.',
        },
        {
          name: 'سلامة القزحية والقرنية',
          location: 'الجزء الأمامي للعين',
          status: 'سليم',
          description: 'انتظام حواف الحدقة وشفافية القرنية يدعمان نجاحاً ممتازاً لعملية الفاكو.',
        },
      ],
      solutionsAndPlan: {
        medicalInterventions: [
          'الحل الجذري والنهائي: عملية سحب المياه البيضاء بالموجات فوق الصوتية (Phacoemulsification - الفاكو) أو الفيمتو-كتاراكت وزراعة عدسة مطوية عالية الدقة داخل العين (IOL Implantation).',
          'في المراحل المبكرة قبل الجراحة: تحديث مقاس النظارة الطبية مع إضافة طبقة مضادة للانعكاس والتوهج الليلي (Anti-Reflective Coating).',
        ],
        immediateActions: [
          'استخدام إضاءة موجهة قوية عند القراءة وتجنب القيادة الليلية إذا كان وهج المصابيح يعيق الرؤية.',
          'حجز موعد لإجراء قياسات عدسة العين بالليزر (Optical Biometry - IOLMaster) لتحديد قوة العدسة المزروعة بدقة.',
        ],
        lifestyleAndNutrition: [
          'ارتداء نظارات شمسية مستقطبة (Polarized UV400) لإبطاء تأكسد بروتينات العدسة وتقليل التوهج النهاري.',
          'ضبط مستوى السكر في الدم وتناول الأغذية الغنية بفيتامين C وفيتامين E والجلوتاثيون.',
        ],
        recommendedLabTests: [
          'فحص المصباح الشقي (Slit-Lamp Biomicroscopy) بعد توسيع الحدقة.',
          'قياس أبعاد العين وحساب قوة العدسة المزروعة (Optical Biometry / Keratometry).',
          'فحص OCT لللطخة الصفراء وقياس عدد خلايا بطانة القرنية (Specular Microscopy) قبل الجراحة.',
        ],
        followUpTimeline: 'مراجعة جراح العيون خلال 2 - 4 أسابيع لترتيب الفحوصات التحضيرية',
      },
    },
  },
];

export const RETINAL_DISEASE_ATLAS = [
  {
    id: 'atlas-dr',
    name: 'اعتلال الشبكية السكري (Diabetic Retinopathy)',
    icd: 'ICD-11: 9B71.0',
    prevalence: 'يصيب نحو 34% من مرضى السكري عالمياً',
    TargetLayer: 'الأوعية الشعرية الشبكية واللطخة الصفراء',
    keySigns: 'أمهات دموية دقيقة، نزيف نقطي وبقعي، مفرزات صلبة، وأوعية دموية مستحدثة هشة.',
    definitiveSolution:
      'ضبط السكر التراكمي، حقن مضادات VEGF داخل الجسم الزجاجي لعلاج ارتشاح مركز الإبصار، والليزر الشبكي (PRP) في الحالات التكاثرية.',
  },
  {
    id: 'atlas-glaucoma',
    name: 'المياه الزرقاء / الجلوكوما (Glaucoma)',
    icd: 'ICD-11: 9C61',
    prevalence: 'السبب الأول للعمى غير القابل للاسترجاع إذا لم يُكتشف مبكراً',
    TargetLayer: 'رأس العصب البصري وطبقة الألياف العصبية (RNFL)',
    keySigns: 'زيادة نسبة التقعر للقرص البصري (C/D > 0.5)، ترقق الحافة العصبية، وتقلص تدريجي في المجال البصري المحيطي.',
    definitiveSolution:
      'قطرات خفض ضغط العين اليومية، الليزر الانتقائي لزاوية التصريف (SLT)، أو الجراحات الميكروسكوبية لتصريف السائل (MIGS / Trabeculectomy).',
  },
  {
    id: 'atlas-amd',
    name: 'التنكس البقعي المرتبط بالعمر (Age-Related Macular Degeneration)',
    icd: 'ICD-11: 9B75.0',
    prevalence: 'شائع بعد سن 55 عاماً ويؤثر على الرؤية المركزية الدقيقة',
    TargetLayer: 'اللطخة الصفراء والظهارة الصبغية للشبكية (RPE)',
    keySigns: 'ترسبات الدروزن الصفراء (Drusen) تحت الشبكية، تموج الخطوط المستقيمة في شبكة أمسلر، أو أغشية وعائية مشيمية.',
    definitiveSolution:
      'مكملات تركيبة AREDS2 (لوتين، زياكسانثين، زنك، فيتامين C و E) للنوع الجاف، وحقن Anti-VEGF الدورية للنوع الرطب.',
  },
  {
    id: 'atlas-cataract',
    name: 'المياه البيضاء / الساد (Cataract)',
    icd: 'ICD-11: 9B10',
    prevalence: 'السبب الأكثر شيوعاً لضعف النظر القابل للشفاء التام جراحياً',
    TargetLayer: 'العدسة البلورية الطبيعية للعين',
    keySigns: 'ضبابية تدريجية، تغير لون الحدقة للأبيض أو الكهرماني، بهتان الألوان، وهالات شديدة حول الإضاءة ليلاً.',
    definitiveSolution:
      'إزالة العدسة المعتمة بالموجات فوق الصوتية (الفاكو) في دقائق تحت تخدير سطحي وزراعة عدسة ذكية تعيد الإبصار لـ 6/6.',
  },
  {
    id: 'atlas-hypertensive',
    name: 'اعتلال الشبكية بضغط الدم (Hypertensive Retinopathy)',
    icd: 'ICD-11: 9B71.1',
    prevalence: 'مؤشر مباشر على تأثير ضغط الدم على الأوعية الدقيقة بالجسم',
    TargetLayer: 'الشرينات الشبكية والتصالبات الشريانية الوريدية',
    keySigns: 'تضيق الشرايين الشبكية (الأسلاك النحاسية/الفضية)، علامة التصالب الضاغط (AV Nicking)، ونزيف لهبي الشكل.',
    definitiveSolution:
      'التحكم الدوائي الصارم في ضغط الدم الشرياني بالتعاون مع طبيب القلب والباطنية مع المتابعة التصويرية لقاع العين.',
  },
  {
    id: 'atlas-detachment',
    name: 'انفصال الشبكية وتمزقاتها (Retinal Detachment)',
    icd: 'ICD-11: 9B73',
    prevalence: 'حالة طوارئ بصرية تستلزم التدخل الجراحي الفوري',
    TargetLayer: 'انفصال الشبكية العصبية عن الظهارة الصبغية',
    keySigns: 'ظهور مفاجئ وكثيف للومضات الضوئية (الفلاشات)، مطر من البقع السوداء، أو ستارة مظلمة تحجب جزءاً من مجال الرؤية.',
    definitiveSolution:
      'ليزر الأرجون لتثبيت التمزقات الشبكية المبكرة، أو عملية قص السائل الزجاجي (Vitrectomy) وتثبيت الشبكية بالغاز أو السيليكون.',
  },
];

export const INITIAL_SAVED_RECORDS: SavedExamRecord[] = [
  {
    id: 'rec-baseline-1',
    timestamp: '2026-09-18 10:30',
    patientContext: CLINICAL_SAMPLE_CASES[0].defaultPatientContext,
    imagePreviewUrl: CLINICAL_SAMPLE_CASES[0].imagePath,
    retinalResult: CLINICAL_SAMPLE_CASES[0].precomputedResult,
    visionResults: {
      acuityOD: {
        snellen: '6/6',
        logMar: 0.0,
        decimal: 1.0,
        estimatedDiopterHint: '0.00 D (إبصار سليم تماماً - Emmetropia)',
        completedAt: '10:28',
      },
      acuityOS: {
        snellen: '6/6',
        logMar: 0.0,
        decimal: 1.0,
        estimatedDiopterHint: '0.00 D (إبصار سليم تماماً - Emmetropia)',
        completedAt: '10:29',
      },
      amsler: {
        eye: 'OU',
        distortedCells: [],
        status: 'سليم تماماً',
        affectedQuadrants: [],
        macularFunctionalScore: 100,
        completedAt: '10:30',
      },
      contrast: {
        logCS: 1.95,
        lowestContrastPercent: 1.25,
        status: 'حساسية تباين ممتازة',
        clinicalNote: 'قدرة عالية على تمييز التباين المنخفض جداً (1.25%).',
        completedAt: '10:30',
      },
      colorAstigmatism: {
        colorPlatesCorrect: 4,
        colorPlatesTotal: 4,
        colorStatus: 'تمييز ألوان طبيعي (Trichromacy)',
        astigmatismAxis: null,
        astigmatismStatus: 'انتظام كروي للقرنية بدون لابؤرية ملحوظة',
        completedAt: '10:30',
      },
    },
  },
  {
    id: 'rec-diabetic-2',
    timestamp: '2026-09-29 18:15',
    patientContext: CLINICAL_SAMPLE_CASES[1].defaultPatientContext,
    imagePreviewUrl: CLINICAL_SAMPLE_CASES[1].imagePath,
    retinalResult: CLINICAL_SAMPLE_CASES[1].precomputedResult,
    visionResults: {
      acuityOD: {
        snellen: '6/12',
        logMar: 0.3,
        decimal: 0.5,
        estimatedDiopterHint: 'تراجع وظيفي متوسط يتطلب فحص انكسار وفحص اللطخة الصفراء',
        completedAt: '18:10',
      },
      acuityOS: {
        snellen: '6/9',
        logMar: 0.18,
        decimal: 0.67,
        estimatedDiopterHint: 'انخفاض طفيف بحدة الإبصار (-0.50 D إلى -0.75 D تقريبياً)',
        completedAt: '18:12',
      },
      amsler: {
        eye: 'OD',
        distortedCells: ['6-7', '6-8', '7-7'],
        status: 'تموج خفيف بالخطوط',
        affectedQuadrants: ['الربع العلوي الصدغي'],
        macularFunctionalScore: 78,
        completedAt: '18:13',
      },
      contrast: {
        logCS: 1.35,
        lowestContrastPercent: 5.0,
        status: 'انخفاض طفيف بالتباين',
        clinicalNote: 'انخفاض طفيف في حساسية التباين يتماشى مع الارتشاحات حول اللطخة الصفراء.',
        completedAt: '18:14',
      },
      colorAstigmatism: {
        colorPlatesCorrect: 4,
        colorPlatesTotal: 4,
        colorStatus: 'تمييز ألوان طبيعي (Trichromacy)',
        astigmatismAxis: 90,
        astigmatismStatus: 'اشتباه لابؤرية (استجماتيزم) خفيفة على المحور 90°',
        completedAt: '18:15',
      },
    },
  },
];
