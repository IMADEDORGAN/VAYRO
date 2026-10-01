/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScanEye, Eye, FileText, BookOpen, Clock } from 'lucide-react';
import {
  ClinicalSampleCase,
  IntegratedSynthesis,
  PatientContext,
  RetinalAnalysisResult,
  SavedExamRecord,
  VisionSuiteResults,
} from './types/ophthalmology';
import { CLINICAL_SAMPLE_CASES, INITIAL_SAVED_RECORDS } from './data/clinicalData';
import { RetinalScannerModule } from './components/RetinalScannerModule';
import { VisionTestingSuite } from './components/VisionTestingSuite';
import { FinalDiagnosticReport } from './components/FinalDiagnosticReport';
import { ClinicalAtlasView, ExamHistoryView } from './components/AtlasAndHistoryModule';

type ActiveSection = 'scanner' | 'vision-tests' | 'final-report' | 'atlas' | 'history';

const STORAGE_KEY = 'baseera_ophthalmic_records_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('scanner');

  // Active clinical sample or custom uploaded/captured retinal image
  const [activeSample, setActiveSample] = useState<ClinicalSampleCase>(CLINICAL_SAMPLE_CASES[1]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customImageMime, setCustomImageMime] = useState<string>('image/jpeg');

  // Patient Clinical Context
  const [patientContext, setPatientContext] = useState<PatientContext>(
    CLINICAL_SAMPLE_CASES[1].defaultPatientContext
  );

  // Active Retinal AI Analysis Result
  const [analysisResult, setAnalysisResult] = useState<RetinalAnalysisResult>(
    CLINICAL_SAMPLE_CASES[1].precomputedResult
  );

  // Vision Testing Suite Results
  const [visionResults, setVisionResults] = useState<VisionSuiteResults>(
    INITIAL_SAVED_RECORDS[1].visionResults
  );

  // AI Integrated Synthesis
  const [synthesis, setSynthesis] = useState<IntegratedSynthesis | null>(null);

  // Saved History Records
  const [savedRecords, setSavedRecords] = useState<SavedExamRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore localStorage error
    }
    return INITIAL_SAVED_RECORDS;
  });

  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    } catch {
      // ignore storage quota errors
    }
  }, [savedRecords]);

  const handleSelectSampleCase = (sample: ClinicalSampleCase) => {
    setActiveSample(sample);
    setCustomImageBase64(null);
    setPatientContext(sample.defaultPatientContext);
    setAnalysisResult(sample.precomputedResult);
    setSynthesis(null);
    setSavedNotice(false);
  };

  const handleSetCustomImage = (base64: string | null, mime = 'image/jpeg') => {
    setCustomImageBase64(base64);
    setCustomImageMime(mime);
    setSynthesis(null);
    setSavedNotice(false);
  };

  const handleSaveToHistory = () => {
    const newRecord: SavedExamRecord = {
      id: `rec-${Date.now()}`,
      timestamp: new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      patientContext,
      imagePreviewUrl: customImageBase64 || activeSample.imagePath,
      retinalResult: analysisResult,
      visionResults,
      synthesis,
    };
    setSavedRecords((prev) => [newRecord, ...prev]);
    setSavedNotice(true);
  };

  const handleLoadSavedRecord = (rec: SavedExamRecord) => {
    setPatientContext(rec.patientContext);
    setAnalysisResult(rec.retinalResult);
    setVisionResults(rec.visionResults);
    setSynthesis(rec.synthesis || null);
    if (rec.imagePreviewUrl.startsWith('data:image')) {
      setCustomImageBase64(rec.imagePreviewUrl);
    } else {
      setCustomImageBase64(null);
      const matched = CLINICAL_SAMPLE_CASES.find((c) => c.imagePath === rec.imagePreviewUrl);
      if (matched) setActiveSample(matched);
    }
    setActiveSection('final-report');
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStartFreshScan = () => {
    handleSelectSampleCase(CLINICAL_SAMPLE_CASES[0]);
    setActiveSection('scanner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-10">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#scanner"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('scanner');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          بصيرة
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#scanner"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('scanner');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              activeSection === 'scanner' ? 'text-slate-900 font-bold underline' : ''
            }`}
          >
            فحص الشبكية
          </a>
          <a
            href="#vision-tests"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('vision-tests');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              activeSection === 'vision-tests' ? 'text-slate-900 font-bold underline' : ''
            }`}
          >
            اختبارات النظر
          </a>
          <a
            href="#final-report"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('final-report');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              activeSection === 'final-report' ? 'text-slate-900 font-bold underline' : ''
            }`}
          >
            التقرير النهائي
          </a>
          <a
            href="#atlas"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('atlas');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              activeSection === 'atlas' ? 'text-slate-900 font-bold underline' : ''
            }`}
          >
            الأطلس السريري
          </a>
          <a
            href="#history"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('history');
            }}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap ${
              activeSection === 'history' ? 'text-slate-900 font-bold underline' : ''
            }`}
          >
            سجل الفحوصات
          </a>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartFreshScan}
            className="min-h-[38px] px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            فحص جديد
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Integrity + Fluid Mobile Touch Layout) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Contextual Banner with Quick Summary & Navigation */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>منظومة التشخيص البصري الذكي</span>
              <span aria-hidden="true">·</span>
              <span>تحليل قاع العين والشبكية بالذكاء الاصطناعي</span>
              <span aria-hidden="true">·</span>
              <span>4 اختبارات نظر معيارية</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              اكتشاف أمراض الشبكية والعين وفحص النظر الشامل بالذكاء الاصطناعي
            </h1>
          </div>

          {/* Interactive Workflow Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('scanner')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'scanner'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              1. تصوير وتحليل الشبكية
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('vision-tests')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'vision-tests'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              2. اختبارات النظر (4)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('final-report')}
              className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'final-report'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              3. النتائج النهائية والحلول
            </button>
          </div>
        </section>

        {/* Active Module Workspace */}
        {activeSection === 'scanner' && (
          <RetinalScannerModule
            activeSample={activeSample}
            onSelectSample={handleSelectSampleCase}
            customImageBase64={customImageBase64}
            customImageMime={customImageMime}
            onSetCustomImage={handleSetCustomImage}
            patientContext={patientContext}
            onUpdatePatientContext={setPatientContext}
            analysisResult={analysisResult}
            onUpdateAnalysisResult={(res) => {
              setAnalysisResult(res);
              setSynthesis(null);
            }}
            visionResults={visionResults}
            onNavigateToReport={() => setActiveSection('final-report')}
            onNavigateToVisionTests={() => setActiveSection('vision-tests')}
          />
        )}

        {activeSection === 'vision-tests' && (
          <VisionTestingSuite
            visionResults={visionResults}
            onUpdateVisionResults={setVisionResults}
            onFinishToReport={() => setActiveSection('final-report')}
          />
        )}

        {activeSection === 'final-report' && (
          <FinalDiagnosticReport
            imageSrc={customImageBase64 || activeSample.imagePath}
            patientContext={patientContext}
            retinalResult={analysisResult}
            visionResults={visionResults}
            synthesis={synthesis}
            onUpdateSynthesis={setSynthesis}
            onSaveToHistory={handleSaveToHistory}
            savedNotice={savedNotice}
          />
        )}

        {activeSection === 'atlas' && (
          <ClinicalAtlasView
            onLoadSampleCase={(sample) => {
              handleSelectSampleCase(sample);
              setActiveSection('scanner');
            }}
          />
        )}

        {activeSection === 'history' && (
          <ExamHistoryView
            records={savedRecords}
            onSelectRecord={handleLoadSavedRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}
      </main>

      {/* Quiet Clinical Disclaimer Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-xs text-slate-500 border-t border-slate-200 mt-12 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
        <p>
          بصيرة — نظام مساندة القرار الطبي لتحليل شبكية العين وقياس كفاءة الإبصار. النتائج إرشادية ولا تغني عن الفحص السريري المباشر لدى طبيب العيون.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveSection('atlas')}
            className="hover:text-slate-900 underline"
          >
            الأطلس المرجعي
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className="hover:text-slate-900 underline"
          >
            السجل الطبي ({savedRecords.length})
          </button>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Ergonomic Thumb Zone < md) */}
      <nav
        aria-label="التنقل السفلي للهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-14 no-print"
      >
        <button
          type="button"
          onClick={() => setActiveSection('scanner')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'scanner' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ScanEye className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">فحص الشبكية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('vision-tests')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'vision-tests' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">فحص النظر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('final-report')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'final-report' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">التقرير والحل</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('atlas')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'atlas' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">الأطلس الطبي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className={`min-h-[44px] flex flex-col items-center justify-center ${
            activeSection === 'history' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">السجل</span>
        </button>
      </nav>
    </div>
  );
}
