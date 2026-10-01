import React, { useState } from 'react';
import {
  Printer,
  BookmarkCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Stethoscope,
  Activity,
  Compass,
  Clock,
} from 'lucide-react';
import {
  IntegratedSynthesis,
  PatientContext,
  RetinalAnalysisResult,
  VisionSuiteResults,
} from '../types/ophthalmology';

interface FinalDiagnosticReportProps {
  imageSrc: string;
  patientContext: PatientContext;
  retinalResult: RetinalAnalysisResult;
  visionResults: VisionSuiteResults;
  synthesis: IntegratedSynthesis | null;
  onUpdateSynthesis: (syn: IntegratedSynthesis) => void;
  onSaveToHistory: () => void;
  savedNotice: boolean;
}

export const FinalDiagnosticReport: React.FC<FinalDiagnosticReportProps> = ({
  imageSrc,
  patientContext,
  retinalResult,
  visionResults,
  synthesis,
  onUpdateSynthesis,
  onSaveToHistory,
  savedNotice,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthError, setSynthError] = useState<string | null>(null);

  const handleGenerateIntegratedSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthError(null);
    try {
      const res = await fetch('/api/synthesize-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retinalAnalysis: retinalResult,
          visionSuite: visionResults,
          patientContext,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.synthesis) {
        throw new Error(data.error || 'تعذر توليد الخطة العلاجية المتكاملة.');
      }
      onUpdateSynthesis(data.synthesis);
    } catch (err: any) {
      setSynthError(err.message || 'حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Compute 5 radar axes (0 to 100) for the Scientific Spider Chart
  const maculaAxis = retinalResult.maculaIntegrityScore || 85;
  const cdNum = parseFloat(retinalResult.estimatedCupToDiscRatio);
  const opticNerveAxis = !isNaN(cdNum)
    ? Math.max(25, Math.min(98, Math.round((1 - Math.max(0, cdNum - 0.25)) * 100)))
    : 85;
  const vascularAxis = Math.max(25, 100 - Math.round(retinalResult.riskScore * 0.75));
  const acuityDecimal = visionResults.acuityOD?.decimal ?? visionResults.acuityOS?.decimal ?? 0.85;
  const acuityAxis = Math.round(acuityDecimal * 100);
  const contrastAxis = visionResults.contrast
    ? Math.round((visionResults.contrast.logCS / 1.95) * 100)
    : 88;

  const radarAxes = [
    { label: 'سلامة اللطخة', value: maculaAxis, angleDeg: -90 },
    { label: 'العصب البصري', value: opticNerveAxis, angleDeg: -18 },
    { label: 'كفاءة الأوعية', value: vascularAxis, angleDeg: 54 },
    { label: 'حساسية التباين', value: contrastAxis, angleDeg: 126 },
    { label: 'حدة الإبصار', value: acuityAxis, angleDeg: 198 },
  ];

  const getRadarPoint = (value: number, angleDeg: number, maxRadius = 72) => {
    const rad = (angleDeg * Math.PI) / 180;
    const r = (Math.max(15, Math.min(100, value)) / 100) * maxRadius;
    const x = 110 + r * Math.cos(rad);
    const y = 110 + r * Math.sin(rad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const radarPolygonPoints = radarAxes
    .map((a) => getRadarPoint(a.value, a.angleDeg))
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Section 1: Report Master Header & Executive Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            {/* Unboxed Metadata Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                <span
                  className={`w-2 h-2 rounded-full ${
                    retinalResult.severityStatus === 'سليم'
                      ? 'bg-emerald-500'
                      : retinalResult.severityStatus === 'متقدم'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
                التصنيف: {retinalResult.severityStatus}
              </span>
              <span aria-hidden="true">·</span>
              <span>الأولوية الطبية: {retinalResult.urgencyLevel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{retinalResult.icdCode}</span>
              <span aria-hidden="true">·</span>
              <span>
                العين: {patientContext.eye} (العمر {patientContext.age} سنة)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {retinalResult.primaryDiagnosis}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-500">
              {retinalResult.englishDiagnosis}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={onSaveToHistory}
              className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-sky-700" />
              <span>{savedNotice ? 'تم الحفظ في السجل بنجاح' : 'حفظ التقرير في السجل'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير الطبي الكامل</span>
            </button>
          </div>
        </div>

        {/* Key Quantitative Telemetry Row (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2 border-b border-slate-100 pb-6">
          <div>
            <div className="text-xs text-slate-500">نسبة ثقة الذكاء الاصطناعي</div>
            <div className="text-3xl font-mono tabular-nums font-bold text-slate-900 mt-1">
              {retinalResult.confidenceScore.toFixed(1)}
              <span className="text-xs font-mono text-slate-400 mr-1">%</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">نسبة تقعر العصب البصري (C/D)</div>
            <div className="text-3xl font-mono tabular-nums font-bold text-slate-900 mt-1">
              {retinalResult.estimatedCupToDiscRatio}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">المعدل الطبيعي &lt; 0.40</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">مؤشر سلامة اللطخة الصفراء</div>
            <div className="text-3xl font-mono tabular-nums font-bold text-sky-700 mt-1">
              {retinalResult.maculaIntegrityScore}
              <span className="text-xs font-mono text-slate-400 mr-1">%</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">مؤشر الخطورة الإكلينيكي</div>
            <div
              className={`text-3xl font-mono tabular-nums font-bold mt-1 ${
                retinalResult.riskScore >= 70
                  ? 'text-rose-600'
                  : retinalResult.riskScore >= 40
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {retinalResult.riskScore}
              <span className="text-xs font-mono text-slate-400 mr-1">/ 100</span>
            </div>
          </div>
        </div>

        {/* Executive Clinical Narrative + Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              الملخص السريري والتفسير التشريحي الشامل
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {retinalResult.executiveSummary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
              <span>
                <strong>حالة الأوعية الشبكية:</strong> {retinalResult.vesselTortuosityIndex}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>موعد المتابعة الموصى به:</strong>{' '}
                {retinalResult.solutionsAndPlan.followUpTimeline}
              </span>
            </div>
          </div>

          {/* 5-Axis Spider / Radar Parameter Calibration */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-1">
              مخطط الكفاءة الوظيفية والتشريحية للعين (5 محاور)
            </div>
            <svg viewBox="0 0 220 220" className="w-52 h-52">
              {[25, 50, 75, 100].map((ring) => (
                <polygon
                  key={ring}
                  points={radarAxes.map((a) => getRadarPoint(ring, a.angleDeg)).join(' ')}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.75"
                />
              ))}
              {radarAxes.map((a, idx) => {
                const outer = getRadarPoint(100, a.angleDeg);
                const [ox, oy] = outer.split(',').map(Number);
                const labelPt = getRadarPoint(122, a.angleDeg);
                const [lx, ly] = labelPt.split(',').map(Number);
                return (
                  <g key={idx}>
                    <line
                      x1="110"
                      y1="110"
                      x2={ox}
                      y2={oy}
                      stroke="#cbd5e1"
                      strokeWidth="0.75"
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[8px] fill-slate-600 font-semibold"
                    >
                      {a.label}
                    </text>
                  </g>
                );
              })}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(2, 132, 199, 0.22)"
                stroke="#0284c7"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Section 2: Detailed 4-Zone Anatomical Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-bold text-slate-900">
          01. التفاصيل التشريحية لطبقات الشبكية والجزء الأمامي
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-b md:border-b-0 md:border-l border-slate-100 pb-4 md:pb-0 md:pl-6 space-y-2">
            <div className="text-xs font-mono text-sky-700">OPTIC NERVE HEAD &amp; CUPPING</div>
            <h3 className="text-sm font-bold text-slate-900">
              القرص البصري وحواف العصب البصري
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {retinalResult.anatomicalAssessment.opticDisc}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-sky-700">MACULA LUTEA &amp; FOVEA CENTRALIS</div>
            <h3 className="text-sm font-bold text-slate-900">
              اللطخة الصفراء والنقرة المركزية (مركز الإبصار)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {retinalResult.anatomicalAssessment.maculaAndFovea}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 md:border-l md:pl-6 space-y-2">
            <div className="text-xs font-mono text-sky-700">RETINAL VASCULAR ARCADES</div>
            <h3 className="text-sm font-bold text-slate-900">
              الشبكة الوعائية الشبكية (الشرايين والأوردة)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {retinalResult.anatomicalAssessment.retinalVessels}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="text-xs font-mono text-sky-700">ANTERIOR SEGMENT &amp; MEDIA</div>
            <h3 className="text-sm font-bold text-slate-900">
              الأوساط الانكسارية والعدسة ومحيط الشبكية
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {retinalResult.anatomicalAssessment.anteriorAndMedia}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Biomarkers & Vision Testing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biomarkers Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            02. المؤشرات الحيوية والعلامات السريرية المرصودة
          </h2>
          <div className="divide-y divide-slate-100">
            {retinalResult.biomarkers.map((bio, index) => (
              <div key={index} className="py-3.5 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        bio.status === 'سليم'
                          ? 'bg-emerald-500'
                          : bio.status === 'مؤشر مرضي'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>{bio.name}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span>{bio.location}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-800">{bio.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-4">{bio.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Suite Results Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            03. ملخص قياسات النظر الوظيفية
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-600">حدة الإبصار - العين اليمنى (OD)</span>
              <span className="font-mono tabular-nums font-bold text-sm text-slate-900">
                {visionResults.acuityOD
                  ? `${visionResults.acuityOD.snellen} (LogMAR ${visionResults.acuityOD.logMar})`
                  : 'لم يُختبر بعد'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-600">حدة الإبصار - العين اليسرى (OS)</span>
              <span className="font-mono tabular-nums font-bold text-sm text-slate-900">
                {visionResults.acuityOS
                  ? `${visionResults.acuityOS.snellen} (LogMAR ${visionResults.acuityOS.logMar})`
                  : 'لم يُختبر بعد'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-600">شبكة أمسلر لمركز الإبصار</span>
              <span className="font-bold text-slate-900">
                {visionResults.amsler
                  ? `${visionResults.amsler.status} (${visionResults.amsler.macularFunctionalScore}%)`
                  : 'لم يُختبر بعد'}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-600">حساسية التباين الضوئي</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {visionResults.contrast
                  ? `${visionResults.contrast.logCS} LogCS (${visionResults.contrast.lowestContrastPercent}%)`
                  : 'لم يُختبر بعد'}
              </span>
            </div>

            <div className="py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">تمييز الألوان والاستجماتيزم</span>
                <span className="font-bold text-slate-900">
                  {visionResults.colorAstigmatism
                    ? `${visionResults.colorAstigmatism.colorPlatesCorrect}/${visionResults.colorAstigmatism.colorPlatesTotal}`
                    : 'لم يُختبر بعد'}
                </span>
              </div>
              {visionResults.colorAstigmatism && (
                <p className="text-slate-500">{visionResults.colorAstigmatism.astigmatismStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Comprehensive Solutions & Medical Action Plan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              04. الحلول العلاجية الشاملة وخطة العمل النهائية
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              بروتوكول متكامل يشمل التدخلات الطبية والجراحية، الإجراءات الفورية، التغذية الشبكية، والفحوصات التكميلية
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateIntegratedSynthesis}
            disabled={isSynthesizing}
            className="min-h-[44px] px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer no-print"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري توليد الخطة التكاملية بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>دمج نتائج الشبكية والنظر في خطة علاجية مخصصة</span>
              </>
            )}
          </button>
        </div>

        {synthError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {synthError}
          </div>
        )}

        {/* 4 Solution Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Medical & Surgical Solutions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>الحلول الطبية والدوائية والجراحية المتخصصة</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {retinalResult.solutionsAndPlan.medicalInterventions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-sky-700 font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2: Immediate Practical Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>الإجراءات العملية الفورية والعناية اليومية</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {retinalResult.solutionsAndPlan.immediateActions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-emerald-700 font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 3: Ocular Nutrition & Prevention */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>التغذية الداعمة للشبكية ونمط الحياة الوقائي</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {retinalResult.solutionsAndPlan.lifestyleAndNutrition.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-amber-700 font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 4: Confirmatory Clinical Imaging & Tests */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>الفحوصات التشخيصية التكميلية الموصى بها</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {retinalResult.solutionsAndPlan.recommendedLabTests.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-slate-900 font-bold shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Integrated Synthesis Output (when generated) */}
        {synthesis && (
          <div className="mt-6 pt-6 border-t-2 border-slate-200 space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-mono text-sky-700">
                AI INTEGRATED OPHTHALMIC SYNTHESIS
              </div>
              <h3 className="text-base font-bold text-slate-900">
                الخطة العلاجية والبصرية المتكاملة (ربط فحص الشبكية مع اختبارات النظر)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  الترابط الإكلينيكي بين الشبكية وحدة الإبصار:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {synthesis.integratedCorrelation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-900">
                  خطة التصحيح البصري والعدسات المقترحة:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {synthesis.opticalCorrectionPlan}
                </p>
              </div>
            </div>

            {/* Step-by-Step Phased Timeline */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900">
                البرنامج العلاجي المرحلي خطوة بخطوة:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {synthesis.stepByStepTreatment.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="text-[11px] font-mono font-bold text-sky-700">{step.phase}</div>
                    <div className="text-xs font-bold text-slate-900">{step.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-900">
                علامات الإنذار المبكر والمآل البصري المتوقع:
              </div>
              <p className="text-xs text-amber-900">{synthesis.prognosisSummary}</p>
              <ul className="text-xs text-amber-800 space-y-1 pt-1">
                {synthesis.redFlagsWarning.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
