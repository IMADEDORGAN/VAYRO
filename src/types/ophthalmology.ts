export type EyeSide = 'OD' | 'OS' | 'OU';

export interface PatientContext {
  eye: EyeSide;
  age: number;
  conditions: string[];
  symptoms: string[];
  notes: string;
}

export interface BiomarkerItem {
  name: string;
  location: string;
  status: string; // 'سليم' | 'ملاحظة خفيفة' | 'مؤشر مرضي'
  description: string;
}

export interface AnatomicalAssessment {
  opticDisc: string;
  maculaAndFovea: string;
  retinalVessels: string;
  anteriorAndMedia: string;
}

export interface SolutionsAndPlan {
  medicalInterventions: string[];
  immediateActions: string[];
  lifestyleAndNutrition: string[];
  recommendedLabTests: string[];
  followUpTimeline: string;
}

export interface RetinalAnalysisResult {
  primaryDiagnosis: string;
  englishDiagnosis: string;
  icdCode: string;
  urgencyLevel: string;
  severityStatus: string;
  confidenceScore: number;
  riskScore: number;
  estimatedCupToDiscRatio: string;
  vesselTortuosityIndex: string;
  maculaIntegrityScore: number;
  executiveSummary: string;
  anatomicalAssessment: AnatomicalAssessment;
  biomarkers: BiomarkerItem[];
  solutionsAndPlan: SolutionsAndPlan;
}

export interface VisualAcuityEyeScore {
  snellen: string; // e.g., '6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60'
  logMar: number;  // e.g., 0.00 to 1.00
  decimal: number; // e.g., 1.00, 0.67, 0.50
  estimatedDiopterHint: string;
  completedAt: string;
}

export interface AmslerGridResult {
  eye: EyeSide;
  distortedCells: string[]; // 'r-c' coordinates
  status: 'سليم تماماً' | 'تموج خفيف بالخطوط' | 'انحراف أو عتامة بؤرية باللطخة';
  affectedQuadrants: string[];
  macularFunctionalScore: number;
  completedAt: string;
}

export interface ContrastResult {
  logCS: number; // e.g., 1.95 (normal) down to 0.60
  lowestContrastPercent: number; // e.g., 1.25%
  status: 'حساسية تباين ممتازة' | 'انخفاض طفيف بالتباين' | 'ضعف ملحوظ بحساسية التباين';
  clinicalNote: string;
  completedAt: string;
}

export interface ColorAstigmatismResult {
  colorPlatesCorrect: number;
  colorPlatesTotal: number;
  colorStatus: 'تمييز ألوان طبيعي (Trichromacy)' | 'اشتباه ضعف تمييز الأحمر-الأخضر' | 'ضعف تمييز لوني يحتاج فحص شامل';
  astigmatismAxis: number | null; // null if all equal, or 15, 30, 45...180
  astigmatismStatus: string;
  completedAt: string;
}

export interface VisionSuiteResults {
  acuityOD: VisualAcuityEyeScore | null;
  acuityOS: VisualAcuityEyeScore | null;
  amsler: AmslerGridResult | null;
  contrast: ContrastResult | null;
  colorAstigmatism: ColorAstigmatismResult | null;
}

export interface IntegratedSynthesis {
  integratedCorrelation: string;
  opticalCorrectionPlan: string;
  stepByStepTreatment: {
    phase: string;
    title: string;
    details: string;
  }[];
  redFlagsWarning: string[];
  prognosisSummary: string;
}

export interface ClinicalSampleCase {
  id: string;
  title: string;
  englishTitle: string;
  category: string;
  imagePath: string;
  defaultPatientContext: PatientContext;
  precomputedResult: RetinalAnalysisResult;
  hotspotAnnotations: {
    id: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    label: string;
    detail: string;
    severity: 'normal' | 'warning' | 'critical';
  }[];
}

export interface SavedExamRecord {
  id: string;
  timestamp: string;
  patientContext: PatientContext;
  imagePreviewUrl: string;
  retinalResult: RetinalAnalysisResult;
  visionResults: VisionSuiteResults;
  synthesis?: IntegratedSynthesis | null;
}
