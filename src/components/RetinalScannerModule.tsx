import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  ScanEye,
  ZoomIn,
  ZoomOut,
  Grid,
  Crosshair,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  ClinicalSampleCase,
  EyeSide,
  PatientContext,
  RetinalAnalysisResult,
  VisionSuiteResults,
} from '../types/ophthalmology';
import {
  CLINICAL_SAMPLE_CASES,
  CHRONIC_CONDITIONS_LIST,
  OCULAR_SYMPTOMS_LIST,
} from '../data/clinicalData';

interface RetinalScannerModuleProps {
  activeSample: ClinicalSampleCase;
  onSelectSample: (sample: ClinicalSampleCase) => void;
  customImageBase64: string | null;
  customImageMime: string;
  onSetCustomImage: (base64: string | null, mime?: string) => void;
  patientContext: PatientContext;
  onUpdatePatientContext: (ctx: PatientContext) => void;
  analysisResult: RetinalAnalysisResult;
  onUpdateAnalysisResult: (res: RetinalAnalysisResult) => void;
  visionResults: VisionSuiteResults;
  onNavigateToReport: () => void;
  onNavigateToVisionTests: () => void;
}

type SourceMode = 'samples' | 'camera' | 'upload';
type OpticalFilter = 'original' | 'red-free' | 'high-contrast' | 'invert';

export const RetinalScannerModule: React.FC<RetinalScannerModuleProps> = ({
  activeSample,
  onSelectSample,
  customImageBase64,
  customImageMime,
  onSetCustomImage,
  patientContext,
  onUpdatePatientContext,
  analysisResult,
  onUpdateAnalysisResult,
  visionResults,
  onNavigateToReport,
  onNavigateToVisionTests,
}) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('samples');
  const [opticalFilter, setOpticalFilter] = useState<OpticalFilter>('original');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showCaliperGrid, setShowCaliperGrid] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    activeSample.hotspotAnnotations[0]?.id || null
  );
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStepText, setAnalysisStepText] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalyzedByAI, setLastAnalyzedByAI] = useState<boolean>(false);

  useEffect(() => {
    setImageLoadFailed(false);
    setSelectedHotspotId(activeSample.hotspotAnnotations[0]?.id || null);
  }, [activeSample, customImageBase64]);

  // Cleanup camera on unmount or mode change
  useEffect(() => {
    if (sourceMode !== 'camera' && cameraActive) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [sourceMode]);

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraError(
        'تعذر الوصول إلى الكاميرا مباشره. يرجى التأكد من منح صلاحية الكاميرا للمتصفح أو استخدام خيار رفع صورة من الجهاز.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 720, video.videoHeight || 720);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSetCustomImage(dataUrl, 'image/jpeg');
    stopCamera();
    setSourceMode('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSetCustomImage(reader.result, file.type || 'image/jpeg');
        setLastAnalyzedByAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCondition = (condition: string) => {
    const exists = patientContext.conditions.includes(condition);
    const updated = exists
      ? patientContext.conditions.filter((c) => c !== condition)
      : [...patientContext.conditions, condition];
    onUpdatePatientContext({ ...patientContext, conditions: updated });
  };

  const toggleSymptom = (symptom: string) => {
    const exists = patientContext.symptoms.includes(symptom);
    const updated = exists
      ? patientContext.symptoms.filter((s) => s !== symptom)
      : [...patientContext.symptoms, symptom];
    onUpdatePatientContext({ ...patientContext, symptoms: updated });
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setCursorCoords({ x, y });
  };

  const getFilterStyle = (): React.CSSProperties => {
    switch (opticalFilter) {
      case 'red-free':
        // Simulates 540nm green monochromatic ophthalmology filter for vessel/hemorrhage contrast
        return {
          filter: 'saturate(1.8) hue-rotate(-35deg) contrast(1.35) brightness(0.95)',
          transform: `scale(${zoomLevel})`,
        };
      case 'high-contrast':
        return {
          filter: 'contrast(1.55) saturate(1.35) brightness(1.02)',
          transform: `scale(${zoomLevel})`,
        };
      case 'invert':
        return {
          filter: 'invert(0.92) hue-rotate(180deg) contrast(1.25)',
          transform: `scale(${zoomLevel})`,
        };
      default:
        return {
          filter: 'none',
          transform: `scale(${zoomLevel})`,
        };
    }
  };

  const runLiveGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStepText('جاري معايرة الصورة البصرية واستخلاص معالم القرص البصري واللطخة الصفراء...');

    const stepTimer1 = setTimeout(() => {
      setAnalysisStepText('جاري تحليل الشجرة الوعائية الشبكية والكشف عن المؤشرات الحيوية...');
    }, 1800);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStepText('جاري بناء التقرير السريري النهائي والحلول العلاجية المخصصة...');
    }, 3600);

    try {
      const visionSummary = {
        acuityOD: visionResults.acuityOD?.snellen || null,
        acuityOS: visionResults.acuityOS?.snellen || null,
        amslerStatus: visionResults.amsler?.status || null,
        contrastScore: visionResults.contrast ? `${visionResults.contrast.logCS} LogCS` : null,
        colorAstigmatismStatus: visionResults.colorAstigmatism?.astigmatismStatus || null,
      };

      const response = await fetch('/api/analyze-retina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: customImageBase64 || undefined,
          mimeType: customImageMime || 'image/jpeg',
          sampleImagePath: !customImageBase64 ? activeSample.imagePath : undefined,
          patientContext,
          visionSummary,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.result) {
        throw new Error(data.error || 'تعذر إتمام التحليل بالذكاء الاصطناعي.');
      }

      onUpdateAnalysisResult(data.result);
      setLastAnalyzedByAI(true);
    } catch (err: any) {
      setAnalysisError(err.message || 'حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      setAnalysisStepText('');
    }
  };

  const activeImageSrc = customImageBase64 || activeSample.imagePath;
  const activeHotspot = activeSample.hotspotAnnotations.find((h) => h.id === selectedHotspotId);

  return (
    <div className="space-y-8">
      {/* Top Clinical Console Split Layout: Left Parameter Column + Main Retinal Viewport Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right in RTL (First Column): Patient Context & Source Selection (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">01. مصدر صورة الشبكية والعين</h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر حالة سريرية مرجعية، أو التقط صورة مباشرة عبر الكاميرا، أو ارفع صورة قاع العين
            </p>
          </div>

          {/* Segmented Source Mode Control (Interactive Filter Tabs) */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSourceMode('samples');
                onSetCustomImage(null);
              }}
              className={`min-h-[44px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap truncate ${
                sourceMode === 'samples'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نماذج سريرية
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceMode('camera');
                startCamera();
              }}
              className={`min-h-[44px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap truncate ${
                sourceMode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كاميرا الفحص
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('upload')}
              className={`min-h-[44px] px-2 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap truncate ${
                sourceMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              رفع صورة
            </button>
          </div>

          {/* Source Mode Content */}
          {sourceMode === 'samples' && (
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-slate-600">
                اختر نموذجاً سريرياً لمعاينة المعالم التشريحية أو إعادة تحليلها بالذكاء الاصطناعي:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CLINICAL_SAMPLE_CASES.map((sample) => {
                  const isSelected = !customImageBase64 && activeSample.id === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        onSetCustomImage(null);
                        onSelectSample(sample);
                        setLastAnalyzedByAI(false);
                      }}
                      className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 min-h-[68px] ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-700 flex items-center justify-center">
                        <img
                          src={sample.imagePath}
                          alt={sample.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {sample.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {sample.category}
                        </div>
                        <div className="text-[11px] font-mono text-sky-700 mt-1">
                          C/D {sample.precomputedResult.estimatedCupToDiscRatio}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sourceMode === 'camera' && (
            <div className="space-y-3 bg-slate-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  التقاط مباشر للعين أو عدسة فحص قاع العين
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                    setFacingMode(nextMode);
                    startCamera(nextMode);
                  }}
                  className="min-h-[36px] px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors"
                >
                  تبديل العدسة ({facingMode === 'environment' ? 'الخلفية' : 'الأمامية'})
                </button>
              </div>

              {cameraError ? (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-200 space-y-2">
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setSourceMode('upload')}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs"
                  >
                    الانتقال إلى رفع صورة من الهاتف
                  </button>
                </div>
              ) : (
                <div className="relative aspect-square max-h-64 mx-auto rounded-xl overflow-hidden bg-black border border-slate-700">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Circular Retinal / Iris Alignment Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-sky-400/80 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-sky-300/50" />
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  disabled={!cameraActive}
                  className="flex-1 min-h-[44px] bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>التقاط صورة الفحص الآن</span>
                </button>
              </div>
            </div>
          )}

          {sourceMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[104px] border-2 border-dashed border-slate-300 hover:border-sky-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-50/70 transition-colors"
              >
                <Upload className="w-6 h-6 text-sky-700" />
                <span className="text-xs font-bold text-slate-800">
                  اضغط لاختيار صورة شبكية العين (Fundus) أو صورة للعين من هاتفك
                </span>
                <span className="text-[11px] text-slate-500">
                  يدعم صور كاميرا قاع العين، المصباح الشقي، وصور الماكرو عالية الدقة (JPG, PNG)
                </span>
              </button>
              {customImageBase64 && (
                <div className="flex items-center justify-between text-xs text-emerald-700 pt-1">
                  <span>تم تحميل الصورة المخصصة بنجاح وجاهزة للتحليل الذكي</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSetCustomImage(null);
                      setSourceMode('samples');
                    }}
                    className="text-slate-500 hover:text-slate-800 underline"
                  >
                    استعادة النموذج المرجعي
                  </button>
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-200" />

          {/* Patient Clinical Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              02. البيانات السريرية والأعراض المرافقة
            </h3>

            {/* Eye & Age Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  العين المفحوصة
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['OD', 'OS', 'OU'] as EyeSide[]).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => onUpdatePatientContext({ ...patientContext, eye: side })}
                      className={`min-h-[38px] text-xs font-mono font-semibold rounded-md transition-colors ${
                        patientContext.eye === side
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {side === 'OD' ? 'اليمنى OD' : side === 'OS' ? 'اليسرى OS' : 'كلتاهما'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  عمر المريض (سنة)
                </label>
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 h-[46px] px-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePatientContext({
                        ...patientContext,
                        age: Math.max(5, patientContext.age - 1),
                      })
                    }
                    className="w-9 h-9 rounded-md hover:bg-slate-200 text-slate-700 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono tabular-nums font-bold text-sm text-slate-900">
                    {patientContext.age}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePatientContext({
                        ...patientContext,
                        age: Math.min(100, patientContext.age + 1),
                      })
                    }
                    className="w-9 h-9 rounded-md hover:bg-slate-200 text-slate-700 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                التاريخ المرضي وعوامل الخطورة (اختياري):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CHRONIC_CONDITIONS_LIST.map((cond) => {
                  const active = patientContext.conditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Symptoms */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                الأعراض البصرية الحالية:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OCULAR_SYMPTOMS_LIST.map((symp) => {
                  const active = patientContext.symptoms.includes(symp);
                  return (
                    <button
                      key={symp}
                      type="button"
                      onClick={() => toggleSymptom(symp)}
                      className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {symp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary AI Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={runLiveGeminiAnalysis}
                disabled={isAnalyzing}
                className="w-full min-h-[50px] py-3 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التحليل المجهري للشبكية بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <ScanEye className="w-5 h-5" />
                    <span>تحليل الشبكية والعين بالذكاء الاصطناعي الآن</span>
                  </>
                )}
              </button>

              {isAnalyzing && analysisStepText && (
                <p className="text-xs text-sky-700 font-medium text-center mt-2">
                  {analysisStepText}
                </p>
              )}

              {analysisError && (
                <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {analysisError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left in RTL (Second Column): Main Ophthalmic Viewport Stage & Live Telemetry (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Fundus / Eye Inspection Stage */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            {/* Viewport Top Telemetry Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  منظار الشبكية الرقمي وتحليل الطبقات الوعائية
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{customImageBase64 ? 'صورة مرفوعة مخصصة' : activeSample.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    الإحداثيات ({cursorCoords.x}%, {cursorCoords.y}%)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">التكبير {zoomLevel.toFixed(1)}x</span>
                </div>
              </div>

              {/* Optical Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                {(
                  [
                    { id: 'original', label: 'طبيعي RGB' },
                    { id: 'red-free', label: 'خالٍ من الأحمر' },
                    { id: 'high-contrast', label: 'تباين الأوعية' },
                    { id: 'invert', label: 'عكس العصب' },
                  ] as { id: OpticalFilter; label: string }[]
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOpticalFilter(f.id)}
                    className={`min-h-[34px] px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                      opticalFilter === f.id
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Retinal Image Canvas */}
            <div
              onMouseMove={handleViewportMouseMove}
              className="relative aspect-square max-h-[430px] mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-crosshair select-none flex items-center justify-center"
            >
              {!imageLoadFailed ? (
                <img
                  src={activeImageSrc}
                  alt={customImageBase64 ? 'صورة العين المرفوعة' : activeSample.title}
                  referrerPolicy="no-referrer"
                  style={getFilterStyle()}
                  onError={() => setImageLoadFailed(true)}
                  className="w-full h-full object-contain transition-transform duration-150"
                />
              ) : (
                /* Zero-Broken-Image Policy Resilient Clinical SVG Fundus Fallback */
                <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-amber-900/40 via-rose-950/60 to-slate-950 p-6 text-center">
                  <ScanEye className="w-16 h-16 text-amber-400/80 mb-3" />
                  <p className="text-sm font-bold text-white">{activeSample.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{activeSample.englishTitle}</p>
                </div>
              )}

              {/* Retinal Caliper & Concentric Cup-to-Disc Measurement Grid Overlay */}
              {showCaliperGrid && (
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.6"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="55"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="25"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                  <line x1="100" y1="10" x2="100" y2="190" stroke="#38bdf8" strokeWidth="0.4" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#38bdf8" strokeWidth="0.4" />
                </svg>
              )}

              {/* Interactive Anatomical Hotspot Pins (when viewing sample cases) */}
              {showHotspots &&
                !customImageBase64 &&
                activeSample.hotspotAnnotations.map((spot, idx) => {
                  const isSelected = selectedHotspotId === spot.id;
                  const dotColor =
                    spot.severity === 'critical'
                      ? 'bg-rose-500 ring-rose-500/40'
                      : spot.severity === 'warning'
                      ? 'bg-amber-500 ring-amber-500/40'
                      : 'bg-emerald-500 ring-emerald-500/40';
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspotId(spot.id);
                      }}
                      title={spot.label}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                        isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full ring-4 ${dotColor} text-[10px] font-mono font-bold text-white flex items-center justify-center`}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              {/* Bottom HUD Coordinate & Filter Readout */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-300 bg-slate-950/75 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>العين: {patientContext.eye}</span>
                <span>C/D: {analysisResult.estimatedCupToDiscRatio}</span>
                <span>سلامة اللطخة: {analysisResult.maculaIntegrityScore}%</span>
              </div>
            </div>

            {/* Viewport Controls Bar (Zoom, Grid, Hotspots) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                  className="min-h-[38px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span>تصغير</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                  className="min-h-[38px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>تكبير</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setOpticalFilter('original');
                  }}
                  className="min-h-[38px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  إعادة ضبط
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCaliperGrid(!showCaliperGrid)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                    showCaliperGrid
                      ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>شبكة القياس</span>
                </button>
                {!customImageBase64 && (
                  <button
                    type="button"
                    onClick={() => setShowHotspots(!showHotspots)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                      showHotspots
                        ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>نقاط الفحص التشريحي</span>
                  </button>
                )}
              </div>
            </div>

            {/* Selected Hotspot Inspector Notice */}
            {showHotspots && !customImageBase64 && activeHotspot && (
              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeHotspot.severity === 'critical'
                          ? 'bg-rose-500'
                          : activeHotspot.severity === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>{activeHotspot.label}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeHotspot.detail}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  ({activeHotspot.x}%, {activeHotspot.y}%)
                </span>
              </div>
            )}
          </div>

          {/* Immediate Diagnostic Telemetry & Quick Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                {/* Unboxed metadata line per Zero-Pill Discipline */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        analysisResult.severityStatus === 'سليم'
                          ? 'bg-emerald-500'
                          : analysisResult.severityStatus === 'متقدم'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    الحالة: {analysisResult.severityStatus}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>الأولوية: {analysisResult.urgencyLevel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{analysisResult.icdCode}</span>
                  {lastAnalyzedByAI && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-sky-700 font-semibold">تم التحديث بالذكاء الاصطناعي</span>
                    </>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 pt-1">
                  {analysisResult.primaryDiagnosis}
                </h3>
                <p className="text-xs font-mono text-slate-500">{analysisResult.englishDiagnosis}</p>
              </div>

              {/* Confidence & Risk Telemetry Numerals */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] text-slate-400">ثقة التحليل</div>
                  <div className="text-2xl font-mono tabular-nums font-bold text-slate-900">
                    {analysisResult.confidenceScore.toFixed(1)}
                    <span className="text-xs text-slate-400 mr-0.5">%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">سلامة اللطخة</div>
                  <div className="text-2xl font-mono tabular-nums font-bold text-sky-700">
                    {analysisResult.maculaIntegrityScore}
                    <span className="text-xs text-slate-400 mr-0.5">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary Prose */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {analysisResult.executiveSummary}
            </p>

            {/* Key Biomarkers Preview List (Unboxed clean rows) */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-900">
                المؤشرات الحيوية المرصودة في الشبكية ({analysisResult.biomarkers.length}):
              </div>
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {analysisResult.biomarkers.map((bio, idx) => (
                  <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            bio.status === 'سليم'
                              ? 'bg-emerald-500'
                              : bio.status === 'مؤشر مرضي'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span>{bio.name}</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="font-normal text-slate-500">{bio.location}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 pr-4">{bio.description}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600 shrink-0 pr-4 sm:pr-0">
                      {bio.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTAs to Complete Vision Tests or View Full Final Report & Solutions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onNavigateToReport}
                className="min-h-[46px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>عرض التقرير النهائي الكامل والحلول العلاجية</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToVisionTests}
                className="min-h-[46px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-sky-700" />
                <span>إجراء اختبارات فحص النظر الـ 4 المرافقة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
