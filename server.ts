import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large base64 images from camera/uploads
app.use(express.json({ limit: '25mb' }));

function getGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/analyze-retina
app.post('/api/analyze-retina', async (req, res) => {
  try {
    const { imageBase64, mimeType, sampleImagePath, patientContext, visionSummary } = req.body;

    let finalBase64 = imageBase64;
    let finalMimeType = mimeType || 'image/jpeg';

    if (!finalBase64 && sampleImagePath) {
      const sanitizedRelative = sampleImagePath.replace(/^\/+/, '');
      const fullPath = path.resolve(process.cwd(), sanitizedRelative);
      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        finalBase64 = fileBuffer.toString('base64');
        finalMimeType = fullPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      }
    }

    if (!finalBase64) {
      return res.status(400).json({ error: 'لم يتم توفير صورة الشبكية أو العين للتحليل.' });
    }

    // Strip data URL prefix if present
    finalBase64 = finalBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const ai = getGeminiClient();

    const eyeLabel =
      patientContext?.eye === 'OD'
        ? 'العين اليمنى (OD)'
        : patientContext?.eye === 'OS'
        ? 'العين اليسرى (OS)'
        : 'كلتا العينين (OU)';

    const conditionsText =
      Array.isArray(patientContext?.conditions) && patientContext.conditions.length > 0
        ? patientContext.conditions.join('، ')
        : 'لا توجد أمراض مزمنة مسجلة';

    const symptomsText =
      Array.isArray(patientContext?.symptoms) && patientContext.symptoms.length > 0
        ? patientContext.symptoms.join('، ')
        : 'فحص دوري وقائي بدون أعراض حادة';

    const visionText = visionSummary
      ? `نتائج فحص النظر المرافقة: حدة الإبصار اليمنى (${visionSummary.acuityOD || 'غير مقاس'})، اليسرى (${visionSummary.acuityOS || 'غير مقاس'})، شبكة أمسلر لللطخة الصفراء (${visionSummary.amslerStatus || 'غير مقاس'})، حساسية التباين (${visionSummary.contrastScore || 'غير مقاس'})، تمييز الألوان والاستجماتيزم (${visionSummary.colorAstigmatismStatus || 'غير مقاس'}).`
      : 'لم يتم إرفاق اختبارات نظر إضافية بعد.';

    const promptText = `أنت استشاري طب وجراحة العيون وأمراض الشبكية والذكاء الاصطناعي البصري.
قم بتحليل صورة العين أو قاع العين (الشبكية - Retinal Fundus / Anterior Eye Segment) المرفقة بدقة علمية وسريرية عالية باللغة العربية.

بيانات المريض السريرية:
- العين المفحوصة: ${eyeLabel}
- العمر: ${patientContext?.age || 42} سنة
- التاريخ المرضي: ${conditionsText}
- الأعراض الحالية: ${symptomsText}
- ملاحظات إضافية: ${patientContext?.notes || 'لا يوجد'}
- ${visionText}

المطلوب تقديم تقرير تشخيصي شامل ومفصل يتضمن:
1. التشخيص الرئيسي الدقيق مع رمز التصنيف الطبي الدولي (ICD-11) ومستوى الأولوية الطبية ونسبة ثقة التحليل ومؤشر الخطورة من 100.
2. القياسات التشريحية للشبكية والعين (نسبة تقعر القرص البصري المقدرة Cup-to-Disc Ratio، حالة اللطخة الصفراء والنقرة المركزية، حالة الأوعية الدموية الشبكية الشرايين والأوردة، وشفافية الأوساط الانكسارية).
3. قائمة مفصلة بالمؤشرات الحيوية والعلامات المرضية المرصودة في الصورة (Biomarkers) مع تحديد الموقع التشريحي، درجة الشدة، والتفسير العلمي لكل علامة.
4. الحلول العلاجية الشاملة وخطة العمل النهائية:
   - الحلول الطبية أو الجراحية المتخصصة (مثل الحقن داخل الجسم الزجاجي، الليزر الشبكي، قطرات خفض ضغط العين، عملية الفاكو، أو المتابعة الدورية حسب الحالة).
   - الإجراءات الفورية ونصائح العناية اليومية والتغذية الداعمة للشبكية.
   - الفحوصات التشخيصية التكميلية المطلوبة للتأكيد النهائي (مثل OCT، تصوير الأوعية بالفلوريسين، قياس ضغط العين، تخطيط الساحة البصرية).
   - الإطار الزمني الموصى به لمراجعة طبيب العيون.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: finalMimeType,
              data: finalBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryDiagnosis: {
              type: Type.STRING,
              description: 'الاسم الطبي العربي الدقيق للتشخيص أو الحالة المرصودة',
            },
            englishDiagnosis: {
              type: Type.STRING,
              description: 'المصطلح الطبي الإنجليزي المقابل للتشخيص',
            },
            icdCode: {
              type: Type.STRING,
              description: 'رمز التصنيف الدولي للأمراض ICD-11 مثل 9B71.0 أو 9C61.0 أو Normal',
            },
            urgencyLevel: {
              type: Type.STRING,
              description: 'مستوى الأولوية: روتيني | متابعة قريبة | عاجل',
            },
            severityStatus: {
              type: Type.STRING,
              description: 'حالة الشدة: سليم | خفيف | متوسط | متقدم',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'نسبة الثقة في قراءة الصورة من 75 إلى 99.5',
            },
            riskScore: {
              type: Type.NUMBER,
              description: 'مؤشر الخطورة الإجمالي من 5 (سليم تماماً) إلى 95 (حرج)',
            },
            estimatedCupToDiscRatio: {
              type: Type.STRING,
              description: 'نسبة تقعر القرص البصري المقدرة بالأرقام مثل 0.30 أو 0.72 أو غير قابل للقياس للجزء الأمامي',
            },
            vesselTortuosityIndex: {
              type: Type.STRING,
              description: 'تقييم انتظام الأوعية الدموية ونسبة الشريان للوريد مثل A/V 2:3 منتظم أو متعرج',
            },
            maculaIntegrityScore: {
              type: Type.NUMBER,
              description: 'نسبة سلامة اللطخة الصفراء ومركز الإبصار من 0 إلى 100',
            },
            executiveSummary: {
              type: Type.STRING,
              description: 'ملخص سريري شامل وواضح يشرح النتيجة النهائية بلغة طبية دقيقة ومفهومة للمريض',
            },
            anatomicalAssessment: {
              type: Type.OBJECT,
              properties: {
                opticDisc: {
                  type: Type.STRING,
                  description: 'تحليل مفصل للقرص البصري وحواف العصب البصري والتقعر المركزي',
                },
                maculaAndFovea: {
                  type: Type.STRING,
                  description: 'تحليل مفصل لللطخة الصفراء والنقرة المركزية والمنعكس البقعي',
                },
                retinalVessels: {
                  type: Type.STRING,
                  description: 'تحليل مفصل للشرايين والأوردة الشبكية والنزيف أو الأمهات الدموية الدقيقة',
                },
                anteriorAndMedia: {
                  type: Type.STRING,
                  description: 'تحليل شفافية العدسة والقرنية والجسم الزجاجي ومحيط الشبكية',
                },
              },
              required: ['opticDisc', 'maculaAndFovea', 'retinalVessels', 'anteriorAndMedia'],
            },
            biomarkers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'اسم العلامة أو المؤشر الحيوي' },
                  location: { type: Type.STRING, description: 'الموقع التشريحي الدقيق في الشبكية أو العين' },
                  status: { type: Type.STRING, description: 'سليم | ملاحظة خفيفة | مؤشر مرضي' },
                  description: { type: Type.STRING, description: 'تفسير طبي تفصيلي لهذه العلامة' },
                },
                required: ['name', 'location', 'status', 'description'],
              },
            },
            solutionsAndPlan: {
              type: Type.OBJECT,
              properties: {
                medicalInterventions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'الحلول الطبية أو الدوائية أو الجراحية المتخصصة لحل المشكلة',
                },
                immediateActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'الخطوات العملية الفورية التي يجب على المريض اتخاذها',
                },
                lifestyleAndNutrition: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'برنامج الوقاية والتغذية الداعمة للشبكية والعين (مثل اللوتين والزياكسانثين وضبط السكر)',
                },
                recommendedLabTests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'الفحوصات التصويرية والسريرية التكميلية المطلوبة لتأكيد التشخيص',
                },
                followUpTimeline: {
                  type: Type.STRING,
                  description: 'الجدول الزمني المحدد للمراجعة الطبية القادمة',
                },
              },
              required: [
                'medicalInterventions',
                'immediateActions',
                'lifestyleAndNutrition',
                'recommendedLabTests',
                'followUpTimeline',
              ],
            },
          },
          required: [
            'primaryDiagnosis',
            'englishDiagnosis',
            'icdCode',
            'urgencyLevel',
            'severityStatus',
            'confidenceScore',
            'riskScore',
            'estimatedCupToDiscRatio',
            'vesselTortuosityIndex',
            'maculaIntegrityScore',
            'executiveSummary',
            'anatomicalAssessment',
            'biomarkers',
            'solutionsAndPlan',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return res.status(502).json({ error: 'لم يتم استلام استجابة تحليلية من نموذج الذكاء الاصطناعي.' });
    }

    const parsed = JSON.parse(rawText.trim());
    return res.json({ result: parsed });
  } catch (error: any) {
    console.error('Error in /api/analyze-retina:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء تحليل صورة الشبكية بالذكاء الاصطناعي.',
    });
  }
});

// POST /api/synthesize-solution
app.post('/api/synthesize-solution', async (req, res) => {
  try {
    const { retinalAnalysis, visionSuite, patientContext } = req.body;
    const ai = getGeminiClient();

    const prompt = `أنت رئيس قسم طب وجراحة العيون والشبكية والبصريات الإكلينيكية.
قم بدمج نتائج تحليل شبكية العين بالذكاء الاصطناعي مع نتائج اختبارات فحص النظر الأربعة لإصدار "الخطة العلاجية والبصرية النهائية المتكاملة" للمريض باللغة العربية.

1. بيانات المريض:
العمر: ${patientContext?.age || 42} سنة | العين: ${patientContext?.eye || 'OU'}
الأمراض المزمنة: ${(patientContext?.conditions || []).join('، ') || 'لا يوجد'}
الأعراض: ${(patientContext?.symptoms || []).join('، ') || 'لا يوجد'}

2. نتيجة تحليل الشبكية والجزء الأمامي:
${retinalAnalysis ? JSON.stringify({
  diagnosis: retinalAnalysis.primaryDiagnosis,
  english: retinalAnalysis.englishDiagnosis,
  severity: retinalAnalysis.severityStatus,
  cdRatio: retinalAnalysis.estimatedCupToDiscRatio,
  maculaScore: retinalAnalysis.maculaIntegrityScore,
  summary: retinalAnalysis.executiveSummary,
}) : 'لم يتم إجراء تصوير الشبكية بعد'}

3. نتائج اختبارات النظر السريرية الأربعة:
${JSON.stringify(visionSuite || {})}

قدم خطة علاجية وبصرية متكاملة ومفصلة تشمل:
- التقييم التكاملي للربط بين حالة الشبكية وحدة الإبصار الفعلية.
- التوصية البصرية والانكسارية (تصحيح النظر، نوع العدسات الطبية أو الفلاتر الضوئية المناسبة).
- بروتوكول العلاج الطبي الدقيق خطوة بخطوة.
- مؤشرات الإنذار المبكر التي تستوجب التوجه للطوارئ البصرية فوراً.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            integratedCorrelation: {
              type: Type.STRING,
              description: 'تحليل علمي يربط بين نتائج تصوير الشبكية ونتائج فحص النظر الأربعة',
            },
            opticalCorrectionPlan: {
              type: Type.STRING,
              description: 'توصيات دقيقة لتصحيح النظر والنظارات أو العدسات والفلاتر الضوئية المناسبة',
            },
            stepByStepTreatment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'المرحلة العلاجية (مثلاً: الأسبوع الأول، الشهر الأول)' },
                  title: { type: Type.STRING, description: 'عنوان الإجراء العلاجي أو التشخيصي' },
                  details: { type: Type.STRING, description: 'شرح تفصيلي للخطوة والهدف الطبي منها' },
                },
                required: ['phase', 'title', 'details'],
              },
            },
            redFlagsWarning: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'أعراض الإنذار المبكر التي تستدعي تدخلاً طبياً طارئاً',
            },
            prognosisSummary: {
              type: Type.STRING,
              description: 'توقعات التحسن والمآل البصري عند الالتزام بالخطة العلاجية',
            },
          },
          required: [
            'integratedCorrelation',
            'opticalCorrectionPlan',
            'stepByStepTreatment',
            'redFlagsWarning',
            'prognosisSummary',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return res.status(502).json({ error: 'تعذر توليد الخطة العلاجية المتكاملة.' });
    }

    return res.json({ synthesis: JSON.parse(rawText.trim()) });
  } catch (error: any) {
    console.error('Error in /api/synthesize-solution:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء توليد الخطة العلاجية الشاملة.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Baseera Retinal AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
