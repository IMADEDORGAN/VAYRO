import React from 'react';
import { BookOpen, Clock, Trash2, ArrowUpLeft, Eye, CheckCircle2 } from 'lucide-react';
import { RETINAL_DISEASE_ATLAS, CLINICAL_SAMPLE_CASES } from '../data/clinicalData';
import { ClinicalSampleCase, SavedExamRecord } from '../types/ophthalmology';

interface AtlasModuleProps {
  onLoadSampleCase: (sample: ClinicalSampleCase) => void;
}

export const ClinicalAtlasView: React.FC<AtlasModuleProps> = ({ onLoadSampleCase }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            الدليل الإكلينيكي لأمراض شبكية العين والحلول العلاجية المعتمدة
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مرجع طبي مفصل لأهم أمراض الشبكية والعصب البصري وعدسة العين مع العلامات التشخيصية والحلول الجذرية
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {CLINICAL_SAMPLE_CASES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onLoadSampleCase(sample)}
              className="min-h-[40px] px-3 py-1.5 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              معاينة نموذج: {sample.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {RETINAL_DISEASE_ATLAS.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              {/* Unboxed clean metadata line */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold text-sky-700">0{idx + 1}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{item.icd}</span>
                <span aria-hidden="true">·</span>
                <span>{item.TargetLayer}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500">{item.prevalence}</p>

              <div className="pt-2 space-y-1">
                <div className="text-xs font-bold text-slate-800">
                  العلامات التشخيصية في تصوير قاع العين:
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.keySigns}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="text-xs font-bold text-emerald-800">
                الحلول الطبية والجراحية النهائية:
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{item.definitiveSolution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface HistoryModuleProps {
  records: SavedExamRecord[];
  onSelectRecord: (rec: SavedExamRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const ExamHistoryView: React.FC<HistoryModuleProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            سجل الفحوصات الطبية والمتابعة الزمنية للشبكية والنظر
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            قارن تطور نسبة تقعر العصب البصري (C/D Ratio)، سلامة اللطخة الصفراء، وحدة الإبصار عبر الزمن
          </p>
        </div>
        <div className="text-left">
          <div className="text-xs text-slate-500">إجمالي الفحوصات المحفوظة</div>
          <div className="text-2xl font-mono tabular-nums font-bold text-slate-900">
            {records.length}
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-800">لا توجد سجلات محفوظة حالياً</div>
          <p className="text-xs text-slate-500">
            قم بإجراء فحص للشبكية أو النظر ثم اضغط على &quot;حفظ التقرير في السجل&quot; للرجوع إليه لاحقاً.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                  <img
                    src={rec.imagePreviewUrl}
                    alt={rec.retinalResult.primaryDiagnosis}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">{rec.timestamp}</span>
                    <span aria-hidden="true">·</span>
                    <span>العين: {rec.patientContext.eye}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{rec.retinalResult.icdCode}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {rec.retinalResult.primaryDiagnosis}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600">
                    <span>C/D: {rec.retinalResult.estimatedCupToDiscRatio}</span>
                    <span>·</span>
                    <span>سلامة اللطخة: {rec.retinalResult.maculaIntegrityScore}%</span>
                    <span>·</span>
                    <span>
                      الإبصار OD: {rec.visionResults.acuityOD?.snellen || '—'} / OS:{' '}
                      {rec.visionResults.acuityOS?.snellen || '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectRecord(rec)}
                  className="min-h-[40px] px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>فتح التقرير الكامل</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRecord(rec.id)}
                  title="حذف السجل"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
