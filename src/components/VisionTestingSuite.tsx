import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Eye,
  Grid,
  Contrast,
  Palette,
  FileCheck,
} from 'lucide-react';
import {
  AmslerGridResult,
  ColorAstigmatismResult,
  ContrastResult,
  EyeSide,
  VisionSuiteResults,
  VisualAcuityEyeScore,
} from '../types/ophthalmology';

interface VisionTestingSuiteProps {
  visionResults: VisionSuiteResults;
  onUpdateVisionResults: (updated: VisionSuiteResults) => void;
  onFinishToReport: () => void;
}

type ActiveSubTest = 'acuity' | 'amsler' | 'contrast' | 'color-astigmatism';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const SNELLEN_LEVELS = [
  { snellen: '6/60', logMar: 1.0, decimal: 0.1, sizePx: 84, diopterHint: '-2.50 D أو أكثر (يحتاج فحص انكسار شامل)' },
  { snellen: '6/36', logMar: 0.78, decimal: 0.17, sizePx: 64, diopterHint: '-1.75 D إلى -2.25 D تقريبياً' },
  { snellen: '6/24', logMar: 0.6, decimal: 0.25, sizePx: 48, diopterHint: '-1.25 D إلى -1.50 D تقريبياً' },
  { snellen: '6/18', logMar: 0.48, decimal: 0.33, sizePx: 36, diopterHint: '-0.75 D إلى -1.00 D تقريبياً' },
  { snellen: '6/12', logMar: 0.3, decimal: 0.5, sizePx: 26, diopterHint: '-0.50 D إلى -0.75 D تقريبياً' },
  { snellen: '6/9', logMar: 0.18, decimal: 0.67, sizePx: 19, diopterHint: '-0.25 D (قريب جداً من الطبيعي)' },
  { snellen: '6/6', logMar: 0.0, decimal: 1.0, sizePx: 14, diopterHint: '0.00 D (حدة إبصار مثالية 6/6)' },
];

const CONTRAST_LEVELS = [
  { level: 1, contrastPercent: 100, logCS: 0.0, opacity: 1.0 },
  { level: 2, contrastPercent: 40, logCS: 0.45, opacity: 0.45 },
  { level: 3, contrastPercent: 20, logCS: 0.75, opacity: 0.25 },
  { level: 4, contrastPercent: 10, logCS: 1.05, opacity: 0.14 },
  { level: 5, contrastPercent: 5.0, logCS: 1.35, opacity: 0.08 },
  { level: 6, contrastPercent: 2.5, logCS: 1.65, opacity: 0.045 },
  { level: 7, contrastPercent: 1.25, logCS: 1.95, opacity: 0.025 },
];

const ISHIHARA_PLATES = [
  {
    id: 1,
    correctNumber: '12',
    options: ['12', '17', '21', 'لا أرى رقماً'],
    bgDotsColor: '#64748b',
    fgDotsColor: '#ea580c',
    description: 'لوحة المعايرة المرجعية (يرى الجميع الرقم 12)',
  },
  {
    id: 2,
    correctNumber: '8',
    options: ['8', '3', '5', 'لا أرى رقماً'],
    bgDotsColor: '#65a30d',
    fgDotsColor: '#dc2626',
    description: 'فحص محور الأحمر-الأخضر (Protan / Deutan)',
  },
  {
    id: 3,
    correctNumber: '29',
    options: ['29', '70', '20', 'لا أرى رقماً'],
    bgDotsColor: '#4d7c0f',
    fgDotsColor: '#e11d48',
    description: 'فحص حساسية المخاريط الحمراء والخضراء الدقيقة',
  },
  {
    id: 4,
    correctNumber: '45',
    options: ['45', '42', '15', 'لا أرى رقماً'],
    bgDotsColor: '#0284c7',
    fgDotsColor: '#d97706',
    description: 'فحص محور الأزرق-الأصفر (Tritan Axis)',
  },
];

const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function getRandomDirection(exclude?: Direction): Direction {
  const pool = exclude ? DIRECTIONS.filter((d) => d !== exclude) : DIRECTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const VisionTestingSuite: React.FC<VisionTestingSuiteProps> = ({
  visionResults,
  onUpdateVisionResults,
  onFinishToReport,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveSubTest>('acuity');

  // --- TEST 1: Visual Acuity State ---
  const [acuityEye, setAcuityEye] = useState<'OD' | 'OS'>('OD');
  const [acuityStepIndex, setAcuityStepIndex] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<Direction>('RIGHT');
  const [mistakesInCurrentEye, setMistakesInCurrentEye] = useState<number>(0);
  const [bestLevelReachedIndex, setBestLevelReachedIndex] = useState<number>(0);

  // --- TEST 2: Amsler Grid State ---
  const [amslerEye, setAmslerEye] = useState<EyeSide>('OD');
  const [distortedCells, setDistortedCells] = useState<string[]>(
    visionResults.amsler?.distortedCells || []
  );

  // --- TEST 3: Contrast Sensitivity State ---
  const [contrastIndex, setContrastIndex] = useState<number>(0);
  const [contrastDirection, setContrastDirection] = useState<Direction>('UP');
  const [bestContrastIndex, setBestContrastIndex] = useState<number>(0);

  // --- TEST 4: Color & Astigmatism State ---
  const [plateIndex, setPlateIndex] = useState<number>(0);
  const [correctPlatesCount, setCorrectPlatesCount] = useState<number>(0);
  const [colorDone, setColorDone] = useState<boolean>(false);
  const [selectedAstigmatismAxis, setSelectedAstigmatismAxis] = useState<number | null>(
    visionResults.colorAstigmatism?.astigmatismAxis ?? null
  );

  // --- Acuity Handler ---
  const handleAcuityAnswer = (chosenDir: Direction) => {
    const isCorrect = chosenDir === currentDirection;
    const nextDir = getRandomDirection(currentDirection);
    setCurrentDirection(nextDir);

    if (isCorrect) {
      const nextIdx = acuityStepIndex + 1;
      setBestLevelReachedIndex(acuityStepIndex);
      if (nextIdx >= SNELLEN_LEVELS.length) {
        // Reached 6/6!
        finalizeEyeAcuity(SNELLEN_LEVELS.length - 1);
      } else {
        setAcuityStepIndex(nextIdx);
      }
    } else {
      const newMistakes = mistakesInCurrentEye + 1;
      if (newMistakes >= 2 || acuityStepIndex === SNELLEN_LEVELS.length - 1) {
        finalizeEyeAcuity(Math.max(0, bestLevelReachedIndex));
      } else {
        setMistakesInCurrentEye(newMistakes);
      }
    }
  };

  const finalizeEyeAcuity = (levelIdx: number) => {
    const lvl = SNELLEN_LEVELS[levelIdx];
    const scoreObj: VisualAcuityEyeScore = {
      snellen: lvl.snellen,
      logMar: lvl.logMar,
      decimal: lvl.decimal,
      estimatedDiopterHint: lvl.diopterHint,
      completedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    if (acuityEye === 'OD') {
      onUpdateVisionResults({ ...visionResults, acuityOD: scoreObj });
      // Automatically switch to Left Eye (OS)
      setAcuityEye('OS');
      setAcuityStepIndex(0);
      setMistakesInCurrentEye(0);
      setBestLevelReachedIndex(0);
    } else {
      onUpdateVisionResults({ ...visionResults, acuityOS: scoreObj });
      setAcuityStepIndex(0);
      setMistakesInCurrentEye(0);
      setBestLevelReachedIndex(0);
    }
  };

  // --- Amsler Grid Handler ---
  const toggleAmslerCell = (cellKey: string) => {
    const exists = distortedCells.includes(cellKey);
    const nextCells = exists
      ? distortedCells.filter((c) => c !== cellKey)
      : [...distortedCells, cellKey];
    setDistortedCells(nextCells);
  };

  const saveAmslerResult = (overrideHealthy = false) => {
    const finalCells = overrideHealthy ? [] : distortedCells;
    if (overrideHealthy) setDistortedCells([]);

    const quadrants = new Set<string>();
    finalCells.forEach((key) => {
      const [r, c] = key.split('-').map(Number);
      if (r < 6 && c < 6) quadrants.add('الربع العلوي الأيمن');
      else if (r < 6 && c >= 6) quadrants.add('الربع العلوي الأيسر');
      else if (r >= 6 && c < 6) quadrants.add('الربع السفلي الأيمن');
      else quadrants.add('الربع السفلي الأيسر');
    });

    const status: AmslerGridResult['status'] =
      finalCells.length === 0
        ? 'سليم تماماً'
        : finalCells.length <= 4
        ? 'تموج خفيف بالخطوط'
        : 'انحراف أو عتامة بؤرية باللطخة';

    const score = Math.max(35, 100 - finalCells.length * 6);

    const amslerRes: AmslerGridResult = {
      eye: amslerEye,
      distortedCells: finalCells,
      status,
      affectedQuadrants: Array.from(quadrants),
      macularFunctionalScore: score,
      completedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateVisionResults({ ...visionResults, amsler: amslerRes });
  };

  // --- Contrast Sensitivity Handler ---
  const handleContrastAnswer = (chosenDir: Direction) => {
    const isCorrect = chosenDir === contrastDirection;
    setContrastDirection(getRandomDirection(contrastDirection));

    if (isCorrect) {
      setBestContrastIndex(contrastIndex);
      if (contrastIndex + 1 >= CONTRAST_LEVELS.length) {
        finalizeContrast(CONTRAST_LEVELS.length - 1);
      } else {
        setContrastIndex(contrastIndex + 1);
      }
    } else {
      finalizeContrast(bestContrastIndex);
    }
  };

  const finalizeContrast = (idx: number) => {
    const item = CONTRAST_LEVELS[idx];
    const status: ContrastResult['status'] =
      item.logCS >= 1.65
        ? 'حساسية تباين ممتازة'
        : item.logCS >= 1.05
        ? 'انخفاض طفيف بالتباين'
        : 'ضعف ملحوظ بحساسية التباين';

    const clinicalNote =
      item.logCS >= 1.65
        ? 'القدرة على التمييز البصري في الإضاءة الخافتة والتباين المنخفض طبيعية تماماً.'
        : item.logCS >= 1.05
        ? 'انخفاض طفيف في حساسية التباين، يظهر غالباً مع بداية إجهاد العدسة أو الجفاف البصري.'
        : 'انخفاض ملحوظ في حساسية التباين يرتبط عادةً بعتامة العدسة (المياه البيضاء) أو اعتلال اللطخة الصفراء.';

    onUpdateVisionResults({
      ...visionResults,
      contrast: {
        logCS: item.logCS,
        lowestContrastPercent: item.contrastPercent,
        status,
        clinicalNote,
        completedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setContrastIndex(0);
    setBestContrastIndex(0);
  };

  // --- Color & Astigmatism Handler ---
  const handlePlateOptionClick = (opt: string) => {
    const currentPlate = ISHIHARA_PLATES[plateIndex];
    const updatedCorrect =
      opt === currentPlate.correctNumber ? correctPlatesCount + 1 : correctPlatesCount;
    setCorrectPlatesCount(updatedCorrect);

    if (plateIndex + 1 < ISHIHARA_PLATES.length) {
      setPlateIndex(plateIndex + 1);
    } else {
      setColorDone(true);
      saveColorAndAstigmatism(updatedCorrect, selectedAstigmatismAxis);
    }
  };

  const saveColorAndAstigmatism = (correctCount: number, axis: number | null) => {
    const colorStatus: ColorAstigmatismResult['colorStatus'] =
      correctCount === ISHIHARA_PLATES.length
        ? 'تمييز ألوان طبيعي (Trichromacy)'
        : correctCount >= 2
        ? 'اشتباه ضعف تمييز الأحمر-الأخضر'
        : 'ضعف تمييز لوني يحتاج فحص شامل';

    const astigmatismStatus =
      axis === null
        ? 'انتظام كروي للقرنية بدون لابؤرية (استجماتيزم) ملحوظة'
        : `اشتباه لابؤرية قرنية (استجماتيزم) على المحور ${axis}°`;

    onUpdateVisionResults({
      ...visionResults,
      colorAstigmatism: {
        colorPlatesCorrect: correctCount,
        colorPlatesTotal: ISHIHARA_PLATES.length,
        colorStatus,
        astigmatismAxis: axis,
        astigmatismStatus,
        completedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    });
  };

  const getRotationDeg = (dir: Direction) => {
    switch (dir) {
      case 'RIGHT':
        return 0;
      case 'DOWN':
        return 90;
      case 'LEFT':
        return 180;
      case 'UP':
        return 270;
    }
  };

  const completedCount = [
    visionResults.acuityOD || visionResults.acuityOS,
    visionResults.amsler,
    visionResults.contrast,
    visionResults.colorAstigmatism,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            مختبر فحص النظر السريري التفاعلي (4 اختبارات معيارية)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أمسك الهاتف على مسافة 40 سم من العين. تُدمج نتائج هذه الاختبارات تلقائياً مع تحليل الشبكية في التقرير النهائي.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-xs text-slate-500">الاختبارات المكتملة</div>
            <div className="text-lg font-mono tabular-nums font-bold text-sky-700">
              {completedCount} / 4
            </div>
          </div>
          <button
            type="button"
            onClick={onFinishToReport}
            className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>دمج النتائج في التقرير النهائي</span>
          </button>
        </div>
      </div>

      {/* 4 Sub-Test Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('acuity')}
          className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'acuity'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="truncate">1. حدة الإبصار (6/6)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('amsler')}
          className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'amsler'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="truncate">2. شبكة أمسلر لللطخة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contrast')}
          className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'contrast'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Contrast className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="truncate">3. حساسية التباين</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('color-astigmatism')}
          className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'color-astigmatism'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="truncate">4. الألوان والاستجماتيزم</span>
        </button>
      </div>

      {/* SUB-TEST 1: SNELLEN / TUMBLING E VISUAL ACUITY */}
      {activeTab === 'acuity' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  اختبار سنيلين (Tumbling E) لقياس حدة الإبصار
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  قم بتغطية العين غير المفحوصة بيدك دون الضغط عليها، ثم حدد اتجاه فتحات حرف E
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAcuityEye('OD');
                    setAcuityStepIndex(0);
                    setMistakesInCurrentEye(0);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    acuityEye === 'OD'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  العين اليمنى (OD)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcuityEye('OS');
                    setAcuityStepIndex(0);
                    setMistakesInCurrentEye(0);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    acuityEye === 'OS'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  العين اليسرى (OS)
                </button>
              </div>
            </div>

            {/* Optotype Display Stage */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center relative">
              <div className="absolute top-3 inset-x-4 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>المستوى الحالي: {SNELLEN_LEVELS[acuityStepIndex].snellen}</span>
                <span>LogMAR: {SNELLEN_LEVELS[acuityStepIndex].logMar.toFixed(2)}</span>
                <span>المرحلة: {acuityStepIndex + 1} / 7</span>
              </div>

              {/* Precision Tumbling E SVG */}
              <div
                style={{
                  width: `${SNELLEN_LEVELS[acuityStepIndex].sizePx}px`,
                  height: `${SNELLEN_LEVELS[acuityStepIndex].sizePx}px`,
                  transform: `rotate(${getRotationDeg(currentDirection)}deg)`,
                }}
                className="transition-transform duration-150 flex items-center justify-center"
              >
                <svg viewBox="0 0 50 50" className="w-full h-full fill-slate-950">
                  <path d="M0 0 H50 V10 H10 V20 H50 V30 H10 V40 H50 V50 H0 Z" />
                </svg>
              </div>
            </div>

            {/* 4 Ergonomic Touch Direction Controls (>=48px hitboxes) */}
            <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5">
              <div />
              <button
                type="button"
                onClick={() => handleAcuityAnswer('UP')}
                className="min-h-[52px] bg-slate-100 hover:bg-sky-600 hover:text-white active:scale-95 text-slate-900 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" />
                <span>أعلى</span>
              </button>
              <div />

              <button
                type="button"
                onClick={() => handleAcuityAnswer('RIGHT')}
                className="min-h-[52px] bg-slate-100 hover:bg-sky-600 hover:text-white active:scale-95 text-slate-900 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
                <span>يمين</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAcuityStepIndex(0);
                  setMistakesInCurrentEye(0);
                  setBestLevelReachedIndex(0);
                }}
                className="min-h-[52px] bg-slate-50 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة</span>
              </button>

              <button
                type="button"
                onClick={() => handleAcuityAnswer('LEFT')}
                className="min-h-[52px] bg-slate-100 hover:bg-sky-600 hover:text-white active:scale-95 text-slate-900 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>يسار</span>
              </button>

              <div />
              <button
                type="button"
                onClick={() => handleAcuityAnswer('DOWN')}
                className="min-h-[52px] bg-slate-100 hover:bg-sky-600 hover:text-white active:scale-95 text-slate-900 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" />
                <span>أسفل</span>
              </button>
              <div />
            </div>
          </div>

          {/* Recorded Acuity Scores Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900">نتائج حدة الإبصار المسجلة</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Right Eye Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">العين اليمنى (OD)</div>
                {visionResults.acuityOD ? (
                  <>
                    <div className="text-3xl font-mono tabular-nums font-bold text-slate-900">
                      {visionResults.acuityOD.snellen}
                    </div>
                    <div className="text-xs font-mono text-sky-700">
                      LogMAR {visionResults.acuityOD.logMar.toFixed(2)} · عشري{' '}
                      {visionResults.acuityOD.decimal}
                    </div>
                    <p className="text-xs text-slate-600 pt-1">
                      {visionResults.acuityOD.estimatedDiopterHint}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 py-3">لم يتم إكمال فحص العين اليمنى بعد</p>
                )}
              </div>

              {/* Left Eye Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">العين اليسرى (OS)</div>
                {visionResults.acuityOS ? (
                  <>
                    <div className="text-3xl font-mono tabular-nums font-bold text-slate-900">
                      {visionResults.acuityOS.snellen}
                    </div>
                    <div className="text-xs font-mono text-sky-700">
                      LogMAR {visionResults.acuityOS.logMar.toFixed(2)} · عشري{' '}
                      {visionResults.acuityOS.decimal}
                    </div>
                    <p className="text-xs text-slate-600 pt-1">
                      {visionResults.acuityOS.estimatedDiopterHint}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 py-3">لم يتم إكمال فحص العين اليسرى بعد</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('amsler')}
                className="w-full min-h-[44px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                الانتقال إلى الاختبار التالي: شبكة أمسلر لللطخة الصفراء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TEST 2: AMSLER GRID MACULAR TEST */}
      {activeTab === 'amsler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  شبكة أمسلر السريرية لفحص اللطخة الصفراء (Amsler Grid)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ركّز نظرك على النقطة الزرقاء في المنتصف، واضغط على أي مربعات تبدو خطوطها متموجة أو معتمة
                </p>
              </div>
            </div>

            {/* Interactive 12x12 Amsler Grid */}
            <div className="relative max-w-[340px] mx-auto aspect-square border-2 border-slate-900 bg-white grid grid-cols-12">
              {Array.from({ length: 12 }).map((_, r) =>
                Array.from({ length: 12 }).map((__, c) => {
                  const key = `${r}-${c}`;
                  const isMarked = distortedCells.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmslerCell(key)}
                      aria-label={`مربع ${r}-${c}`}
                      className={`border border-slate-300 transition-colors ${
                        isMarked ? 'bg-rose-500/60' : 'hover:bg-sky-100/60'
                      }`}
                    />
                  );
                })
              )}
              {/* Central Fixation Dot */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => saveAmslerResult(true)}
                className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                جميع الخطوط مستقيمة وواضحة (لطخة سليمة 100%)
              </button>
              <button
                type="button"
                onClick={() => saveAmslerResult(false)}
                className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                حفظ المناطق المحددة ({distortedCells.length} منطقة)
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">تقييم وظيفة اللطخة الصفراء</h3>
            {visionResults.amsler ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">الحالة الوظيفية للمركز</span>
                  <span className="text-xs font-mono text-slate-500">
                    {visionResults.amsler.completedAt}
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900">{visionResults.amsler.status}</div>
                <div className="text-2xl font-mono tabular-nums font-bold text-sky-700">
                  {visionResults.amsler.macularFunctionalScore}%
                </div>
                {visionResults.amsler.affectedQuadrants.length > 0 ? (
                  <p className="text-xs text-rose-700">
                    الأرباع المتأثرة: {visionResults.amsler.affectedQuadrants.join('، ')}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700">
                    لا يوجد تشوه بؤري (Metamorphopsia) أو عتامة مركزية (Scotoma).
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                اختر حالة الخطوط في الشبكة لحساب مؤشر سلامة اللطخة الصفراء.
              </p>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('contrast')}
              className="w-full min-h-[44px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              الانتقال إلى الاختبار الثالث: حساسية التباين البصري
            </button>
          </div>
        </div>
      )}

      {/* SUB-TEST 3: CONTRAST SENSITIVITY */}
      {activeTab === 'contrast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                اختبار بيلي-روبسون لحساسية التباين البصري (Contrast Sensitivity)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يقيس قدرة الشبكية والعدسة على تمييز الأجسام ذات التباين الخافت جداً (يكتشف المياه البيضاء مبكراً)
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl h-56 flex flex-col items-center justify-center relative">
              <div className="absolute top-3 inset-x-4 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>التباين: {CONTRAST_LEVELS[contrastIndex].contrastPercent}%</span>
                <span>LogCS: {CONTRAST_LEVELS[contrastIndex].logCS.toFixed(2)}</span>
                <span>المستوى: {contrastIndex + 1} / 7</span>
              </div>

              <div
                style={{
                  width: '56px',
                  height: '56px',
                  opacity: CONTRAST_LEVELS[contrastIndex].opacity,
                  transform: `rotate(${getRotationDeg(contrastDirection)}deg)`,
                }}
                className="transition-all duration-150"
              >
                <svg viewBox="0 0 50 50" className="w-full h-full fill-slate-950">
                  <path d="M0 0 H50 V10 H10 V20 H50 V30 H10 V40 H50 V50 H0 Z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleContrastAnswer('UP')}
                className="min-h-[48px] bg-slate-100 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                <span>أعلى</span>
              </button>
              <button
                type="button"
                onClick={() => handleContrastAnswer('DOWN')}
                className="min-h-[48px] bg-slate-100 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
                <span>أسفل</span>
              </button>
              <button
                type="button"
                onClick={() => handleContrastAnswer('RIGHT')}
                className="min-h-[48px] bg-slate-100 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>يمين</span>
              </button>
              <button
                type="button"
                onClick={() => handleContrastAnswer('LEFT')}
                className="min-h-[48px] bg-slate-100 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>يسار</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">نتيجة حساسية التباين</h3>
            {visionResults.contrast ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500">{visionResults.contrast.status}</div>
                <div className="text-3xl font-mono tabular-nums font-bold text-slate-900">
                  {visionResults.contrast.logCS.toFixed(2)}{' '}
                  <span className="text-xs font-mono text-slate-500">LogCS</span>
                </div>
                <div className="text-xs font-mono text-sky-700">
                  أدنى تباين مميز: {visionResults.contrast.lowestContrastPercent}%
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {visionResults.contrast.clinicalNote}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                حدد اتجاه العلامة في المستويات السبعة لقياس حساسية التباين اللوغاريتمية.
              </p>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('color-astigmatism')}
              className="w-full min-h-[44px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              الانتقال إلى الاختبار الرابع: الألوان والاستجماتيزم
            </button>
          </div>
        </div>
      )}

      {/* SUB-TEST 4: COLOR VISION & ASTIGMATISM CLOCK DIAL */}
      {activeTab === 'color-astigmatism' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Color Plates Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  أولاً: لوحات إيشيهارا لتمييز الألوان
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ISHIHARA_PLATES[plateIndex].description} (اللوحة {plateIndex + 1} من{' '}
                  {ISHIHARA_PLATES.length})
                </p>
              </div>
              {colorDone && (
                <button
                  type="button"
                  onClick={() => {
                    setPlateIndex(0);
                    setCorrectPlatesCount(0);
                    setColorDone(false);
                  }}
                  className="text-xs text-sky-700 underline"
                >
                  إعادة فحص الألوان
                </button>
              )}
            </div>

            {/* SVG Pseudo-Isochromatic Plate */}
            <div className="w-52 h-52 mx-auto rounded-full bg-slate-950 p-3 flex items-center justify-center relative overflow-hidden border-4 border-slate-100">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Mosaic background dots */}
                {[
                  [40, 40, 9], [70, 30, 7], [105, 28, 10], [140, 35, 8], [165, 60, 7],
                  [28, 75, 8], [55, 70, 6], [145, 70, 9], [172, 95, 8], [25, 110, 9],
                  [50, 135, 8], [150, 130, 8], [170, 135, 6], [45, 165, 7], [80, 172, 9],
                  [115, 172, 8], [145, 162, 7], [100, 145, 6], [95, 55, 6],
                ].map(([cx, cy, r], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={ISHIHARA_PLATES[plateIndex].bgDotsColor}
                    opacity={0.75 + (i % 3) * 0.08}
                  />
                ))}
                {/* Foreground number composed of chromatic style */}
                <text
                  x="100"
                  y="124"
                  textAnchor="middle"
                  fill={ISHIHARA_PLATES[plateIndex].fgDotsColor}
                  fontSize="74"
                  fontWeight="800"
                  fontFamily="IBM Plex Mono, monospace"
                  style={{ letterSpacing: '-2px' }}
                >
                  {ISHIHARA_PLATES[plateIndex].correctNumber}
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ISHIHARA_PLATES[plateIndex].options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handlePlateOptionClick(opt)}
                  className="min-h-[46px] bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-900 font-mono font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Astigmatism Fan Dial Column */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ثانياً: قرص مروحة الاستجماتيزم (اللانقطية القرنية)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                انظر إلى وسط القرص؛ هل تبدو جميع الخطوط الشعاعية بنفس الكثافة والوضوح أم يبدو أحد المحاور أغمق؟
              </p>
            </div>

            {/* Precision 12-Axis Astigmatism Dial SVG */}
            <div className="w-52 h-52 mx-auto flex items-center justify-center bg-slate-50 rounded-full border border-slate-200 p-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {[0, 30, 60, 90, 120, 150].map((angle) => {
                  const isSelected = selectedAstigmatismAxis === angle;
                  return (
                    <g
                      key={angle}
                      transform={`rotate(${angle} 100 100)`}
                      onClick={() => {
                        setSelectedAstigmatismAxis(angle);
                        saveColorAndAstigmatism(correctPlatesCount || 4, angle);
                      }}
                      className="cursor-pointer"
                    >
                      <line
                        x1="100"
                        y1="15"
                        x2="100"
                        y2="185"
                        stroke={isSelected ? '#0284c7' : '#0f172a'}
                        strokeWidth={isSelected ? '4' : '2.2'}
                      />
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="14" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <circle cx="100" cy="100" r="4" fill="#0284c7" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedAstigmatismAxis(null);
                  saveColorAndAstigmatism(correctPlatesCount || 4, null);
                }}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedAstigmatismAxis === null
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                جميع المحاور متساوية الوضوح (قرنية منتظمة)
              </button>
              {[45, 90, 180].map((axis) => (
                <button
                  key={axis}
                  type="button"
                  onClick={() => {
                    setSelectedAstigmatismAxis(axis);
                    saveColorAndAstigmatism(correctPlatesCount || 4, axis);
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedAstigmatismAxis === axis
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  محور {axis}° أغمق
                </button>
              ))}
            </div>

            {visionResults.colorAstigmatism && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">
                  {visionResults.colorAstigmatism.colorStatus} ({visionResults.colorAstigmatism.colorPlatesCorrect}/
                  {visionResults.colorAstigmatism.colorPlatesTotal})
                </div>
                <div className="text-slate-600">{visionResults.colorAstigmatism.astigmatismStatus}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
