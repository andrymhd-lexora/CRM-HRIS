import { Attendance, Employee, Payroll, PTKPStatus } from '../types/crm';

// PTKP Amounts (Setahun) & Mapping to TER Category
// Landasan Hukum: PP No. 58 Tahun 2023 & PMK No. 168 Tahun 2023
export const PTKP_REFERENCE: Record<
  string,
  { ptkpYearly: number; terCategory: 'TER A' | 'TER B' | 'TER C'; description: string }
> = {
  'TK/0': { ptkpYearly: 54000000, terCategory: 'TER A', description: 'Tidak Kawin / Tanpa Tanggungan' },
  'TK/1': { ptkpYearly: 58500000, terCategory: 'TER A', description: 'Tidak Kawin / 1 Tanggungan' },
  'K/0': { ptkpYearly: 58500000, terCategory: 'TER A', description: 'Kawin / Tanpa Tanggungan' },
  'TK/2': { ptkpYearly: 63000000, terCategory: 'TER B', description: 'Tidak Kawin / 2 Tanggungan' },
  'K/1': { ptkpYearly: 63000000, terCategory: 'TER B', description: 'Kawin / 1 Tanggungan' },
  'TK/3': { ptkpYearly: 67500000, terCategory: 'TER B', description: 'Tidak Kawin / 3 Tanggungan' },
  'K/2': { ptkpYearly: 67500000, terCategory: 'TER B', description: 'Kawin / 2 Tanggungan' },
  'K/3': { ptkpYearly: 72000000, terCategory: 'TER C', description: 'Kawin / 3 Tanggungan' }
};

export const PTKP_VALUES: Record<string, number> = {
  'TK/0': 54000000,
  'TK/1': 58500000,
  'TK/2': 63000000,
  'TK/3': 67500000,
  'K/0': 58500000,
  'K/1': 63000000,
  'K/2': 67500000,
  'K/3': 72000000
};

// Maximum Salary Bases for BPJS Calculations
export const BPJS_HEALTH_MAX_SALARY = 12000000; // Rp 12.000.000 max cap
export const BPJS_JP_MAX_SALARY = 10547400; // Rp 10.547.400 max cap

export interface TERDefinitionRow {
  no: number;
  category: 'TER A' | 'TER B' | 'TER C';
  statusPTKP: string;
  minGross: number;
  maxGross: number;
  rate: number; // percentage e.g. 0.25 for 0.25%
}

// =========================================================================
// TABEL RESMI TER KATEGORI A (44 Lapisan Tarif)
// Status PTKP: TK/0 (54 Jt), TK/1 (58.5 Jt), K/0 (58.5 Jt)
// =========================================================================
export const TER_A_TABLE: TERDefinitionRow[] = [
  { no: 1, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 0, maxGross: 5400000, rate: 0.0 },
  { no: 2, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 5400001, maxGross: 5650000, rate: 0.25 },
  { no: 3, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 5650001, maxGross: 5950000, rate: 0.5 },
  { no: 4, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 5950001, maxGross: 6300000, rate: 0.75 },
  { no: 5, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 6300001, maxGross: 6750000, rate: 1.0 },
  { no: 6, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 6750001, maxGross: 7500000, rate: 1.25 },
  { no: 7, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 7500001, maxGross: 8550000, rate: 1.5 },
  { no: 8, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 8550001, maxGross: 9650000, rate: 1.75 },
  { no: 9, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 9650001, maxGross: 10050000, rate: 2.0 },
  { no: 10, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 10050001, maxGross: 10350000, rate: 2.25 },
  { no: 11, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 10350001, maxGross: 10700000, rate: 2.5 },
  { no: 12, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 10700001, maxGross: 11050000, rate: 3.0 },
  { no: 13, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 11050001, maxGross: 11600000, rate: 3.5 },
  { no: 14, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 11600001, maxGross: 12500000, rate: 4.0 },
  { no: 15, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 12500001, maxGross: 13750000, rate: 5.0 },
  { no: 16, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 13750001, maxGross: 15100000, rate: 6.0 },
  { no: 17, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 15100001, maxGross: 16950000, rate: 7.0 },
  { no: 18, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 16950001, maxGross: 19750000, rate: 8.0 },
  { no: 19, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 19750001, maxGross: 24150000, rate: 9.0 },
  { no: 20, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 24150001, maxGross: 26450000, rate: 10.0 },
  { no: 21, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 26450001, maxGross: 28000000, rate: 11.0 },
  { no: 22, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 28000001, maxGross: 30050000, rate: 12.0 },
  { no: 23, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 30050001, maxGross: 32400000, rate: 13.0 },
  { no: 24, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 32400001, maxGross: 35400000, rate: 14.0 },
  { no: 25, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 35400001, maxGross: 39100000, rate: 15.0 },
  { no: 26, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 39100001, maxGross: 43850000, rate: 16.0 },
  { no: 27, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 43850001, maxGross: 47800000, rate: 17.0 },
  { no: 28, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 47800001, maxGross: 51400000, rate: 18.0 },
  { no: 29, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 51400001, maxGross: 56300000, rate: 19.0 },
  { no: 30, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 56300001, maxGross: 62200000, rate: 20.0 },
  { no: 31, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 62200001, maxGross: 68600000, rate: 21.0 },
  { no: 32, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 68600001, maxGross: 77500000, rate: 22.0 },
  { no: 33, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 77500001, maxGross: 89000000, rate: 23.0 },
  { no: 34, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 89000001, maxGross: 103000000, rate: 24.0 },
  { no: 35, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 103000001, maxGross: 125000000, rate: 25.0 },
  { no: 36, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 125000001, maxGross: 157000000, rate: 26.0 },
  { no: 37, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 157000001, maxGross: 206000000, rate: 27.0 },
  { no: 38, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 206000001, maxGross: 337000000, rate: 28.0 },
  { no: 39, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 337000001, maxGross: 454000000, rate: 29.0 },
  { no: 40, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 454000001, maxGross: 550000000, rate: 30.0 },
  { no: 41, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 550000001, maxGross: 695000000, rate: 31.0 },
  { no: 42, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 695000001, maxGross: 910000000, rate: 32.0 },
  { no: 43, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 910000001, maxGross: 1400000000, rate: 33.0 },
  { no: 44, category: 'TER A', statusPTKP: 'TK/0; TK/1; K/0', minGross: 1400000001, maxGross: Infinity, rate: 34.0 }
];

// =========================================================================
// TABEL RESMI TER KATEGORI B (40 Lapisan Tarif)
// Status PTKP: TK/2 (63 Jt), TK/3 (67.5 Jt), K/1 (63 Jt), K/2 (67.5 Jt)
// =========================================================================
export const TER_B_TABLE: TERDefinitionRow[] = [
  { no: 1, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 0, maxGross: 6200000, rate: 0.0 },
  { no: 2, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 6200001, maxGross: 6500000, rate: 0.25 },
  { no: 3, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 6500001, maxGross: 6850000, rate: 0.5 },
  { no: 4, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 6850001, maxGross: 7300000, rate: 0.75 },
  { no: 5, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 7300001, maxGross: 9200000, rate: 1.0 },
  { no: 6, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 9200001, maxGross: 10750000, rate: 1.5 },
  { no: 7, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 10750001, maxGross: 11250000, rate: 2.0 },
  { no: 8, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 11250001, maxGross: 11600000, rate: 2.5 },
  { no: 9, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 11600001, maxGross: 12600000, rate: 3.0 },
  { no: 10, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 12600001, maxGross: 13600000, rate: 4.0 },
  { no: 11, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 13600001, maxGross: 14950000, rate: 5.0 },
  { no: 12, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 14950001, maxGross: 16400000, rate: 6.0 },
  { no: 13, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 16400001, maxGross: 18450000, rate: 7.0 },
  { no: 14, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 18450001, maxGross: 21850000, rate: 8.0 },
  { no: 15, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 21850001, maxGross: 26000000, rate: 9.0 },
  { no: 16, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 26000001, maxGross: 27700000, rate: 10.0 },
  { no: 17, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 27700001, maxGross: 29350000, rate: 11.0 },
  { no: 18, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 29350001, maxGross: 31450000, rate: 12.0 },
  { no: 19, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 31450001, maxGross: 33950000, rate: 13.0 },
  { no: 20, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 33950001, maxGross: 37100000, rate: 14.0 },
  { no: 21, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 37100001, maxGross: 41100000, rate: 15.0 },
  { no: 22, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 41100001, maxGross: 45800000, rate: 16.0 },
  { no: 23, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 45800001, maxGross: 49500000, rate: 17.0 },
  { no: 24, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 49500001, maxGross: 53800000, rate: 18.0 },
  { no: 25, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 53800001, maxGross: 58500000, rate: 19.0 },
  { no: 26, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 58500001, maxGross: 64000000, rate: 20.0 },
  { no: 27, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 6400001, maxGross: 71000000, rate: 21.0 },
  { no: 28, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 7100001, maxGross: 80000000, rate: 22.0 },
  { no: 29, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 8000001, maxGross: 93000000, rate: 23.0 },
  { no: 30, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 9300001, maxGross: 109000000, rate: 24.0 },
  { no: 31, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 109000001, maxGross: 129000000, rate: 25.0 },
  { no: 32, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 129000001, maxGross: 163000000, rate: 26.0 },
  { no: 33, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 163000001, maxGross: 211000000, rate: 27.0 },
  { no: 34, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 211000001, maxGross: 374000000, rate: 28.0 },
  { no: 35, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 374000001, maxGross: 459000000, rate: 29.0 },
  { no: 36, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 459000001, maxGross: 555000000, rate: 30.0 },
  { no: 37, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 555000001, maxGross: 704000000, rate: 31.0 },
  { no: 38, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 704000001, maxGross: 957000000, rate: 32.0 },
  { no: 39, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 957000001, maxGross: 1405000000, rate: 33.0 },
  { no: 40, category: 'TER B', statusPTKP: 'TK/2; TK/3; K/1; K/2', minGross: 1405000001, maxGross: Infinity, rate: 34.0 }
];

// =========================================================================
// TABEL RESMI TER KATEGORI C (41 Lapisan Tarif)
// Status PTKP: K/3 (72 Jt)
// =========================================================================
export const TER_C_TABLE: TERDefinitionRow[] = [
  { no: 1, category: 'TER C', statusPTKP: 'K/3', minGross: 0, maxGross: 6600000, rate: 0.0 },
  { no: 2, category: 'TER C', statusPTKP: 'K/3', minGross: 6600001, maxGross: 6950000, rate: 0.25 },
  { no: 3, category: 'TER C', statusPTKP: 'K/3', minGross: 6950001, maxGross: 7350000, rate: 0.5 },
  { no: 4, category: 'TER C', statusPTKP: 'K/3', minGross: 7350001, maxGross: 7800000, rate: 0.75 },
  { no: 5, category: 'TER C', statusPTKP: 'K/3', minGross: 7800001, maxGross: 8850000, rate: 1.0 },
  { no: 6, category: 'TER C', statusPTKP: 'K/3', minGross: 8850001, maxGross: 9800000, rate: 1.25 },
  { no: 7, category: 'TER C', statusPTKP: 'K/3', minGross: 9800001, maxGross: 10950000, rate: 1.5 },
  { no: 8, category: 'TER C', statusPTKP: 'K/3', minGross: 10950001, maxGross: 11200000, rate: 1.75 },
  { no: 9, category: 'TER C', statusPTKP: 'K/3', minGross: 11200001, maxGross: 12050000, rate: 2.0 },
  { no: 10, category: 'TER C', statusPTKP: 'K/3', minGross: 12050001, maxGross: 12950000, rate: 3.0 },
  { no: 11, category: 'TER C', statusPTKP: 'K/3', minGross: 12950001, maxGross: 14150000, rate: 4.0 },
  { no: 12, category: 'TER C', statusPTKP: 'K/3', minGross: 14150001, maxGross: 15550000, rate: 5.0 },
  { no: 13, category: 'TER C', statusPTKP: 'K/3', minGross: 15550001, maxGross: 17050000, rate: 6.0 },
  { no: 14, category: 'TER C', statusPTKP: 'K/3', minGross: 17050001, maxGross: 19500000, rate: 7.0 },
  { no: 15, category: 'TER C', statusPTKP: 'K/3', minGross: 19500001, maxGross: 22700000, rate: 8.0 },
  { no: 16, category: 'TER C', statusPTKP: 'K/3', minGross: 22700001, maxGross: 26600000, rate: 9.0 },
  { no: 17, category: 'TER C', statusPTKP: 'K/3', minGross: 26600001, maxGross: 28100000, rate: 10.0 },
  { no: 18, category: 'TER C', statusPTKP: 'K/3', minGross: 28100001, maxGross: 30100000, rate: 11.0 },
  { no: 19, category: 'TER C', statusPTKP: 'K/3', minGross: 30100001, maxGross: 32600000, rate: 12.0 },
  { no: 20, category: 'TER C', statusPTKP: 'K/3', minGross: 32600001, maxGross: 35400000, rate: 13.0 },
  { no: 21, category: 'TER C', statusPTKP: 'K/3', minGross: 35400001, maxGross: 38900000, rate: 14.0 },
  { no: 22, category: 'TER C', statusPTKP: 'K/3', minGross: 38900001, maxGross: 43000000, rate: 15.0 },
  { no: 23, category: 'TER C', statusPTKP: 'K/3', minGross: 43000001, maxGross: 47400000, rate: 16.0 },
  { no: 24, category: 'TER C', statusPTKP: 'K/3', minGross: 47400001, maxGross: 51200000, rate: 17.0 },
  { no: 25, category: 'TER C', statusPTKP: 'K/3', minGross: 51200001, maxGross: 55800000, rate: 18.0 },
  { no: 26, category: 'TER C', statusPTKP: 'K/3', minGross: 55800001, maxGross: 60400000, rate: 19.0 },
  { no: 27, category: 'TER C', statusPTKP: 'K/3', minGross: 60400001, maxGross: 66700000, rate: 20.0 },
  { no: 28, category: 'TER C', statusPTKP: 'K/3', minGross: 66700001, maxGross: 74500000, rate: 21.0 },
  { no: 29, category: 'TER C', statusPTKP: 'K/3', minGross: 74500001, maxGross: 83200000, rate: 22.0 },
  { no: 30, category: 'TER C', statusPTKP: 'K/3', minGross: 83200001, maxGross: 95600000, rate: 23.0 },
  { no: 31, category: 'TER C', statusPTKP: 'K/3', minGross: 95600001, maxGross: 110000000, rate: 24.0 },
  { no: 32, category: 'TER C', statusPTKP: 'K/3', minGross: 110000001, maxGross: 134000000, rate: 25.0 },
  { no: 33, category: 'TER C', statusPTKP: 'K/3', minGross: 134000001, maxGross: 169000000, rate: 26.0 },
  { no: 34, category: 'TER C', statusPTKP: 'K/3', minGross: 169000001, maxGross: 221000000, rate: 27.0 },
  { no: 35, category: 'TER C', statusPTKP: 'K/3', minGross: 221000001, maxGross: 390000000, rate: 28.0 },
  { no: 36, category: 'TER C', statusPTKP: 'K/3', minGross: 39000001, maxGross: 463000000, rate: 29.0 },
  { no: 37, category: 'TER C', statusPTKP: 'K/3', minGross: 463000001, maxGross: 561000000, rate: 30.0 },
  { no: 38, category: 'TER C', statusPTKP: 'K/3', minGross: 561000001, maxGross: 709000000, rate: 31.0 },
  { no: 39, category: 'TER C', statusPTKP: 'K/3', minGross: 709000001, maxGross: 965000000, rate: 32.0 },
  { no: 40, category: 'TER C', statusPTKP: 'K/3', minGross: 965000001, maxGross: 1419000000, rate: 33.0 },
  { no: 41, category: 'TER C', statusPTKP: 'K/3', minGross: 1419000001, maxGross: Infinity, rate: 34.0 }
];

export interface TERLookupResult {
  category: 'TER A' | 'TER B' | 'TER C';
  ratePercent: number;
  rowNumber: number;
  minGross: number;
  maxGross: number;
  statusPTKP: string;
}

/**
 * Returns TER Category (A, B, C) and rate percentage based on PTKP Status and Monthly Gross Income
 */
export function getTERCategoryAndRate(taxStatus: string, monthlyGross: number): TERLookupResult {
  const status = (taxStatus || 'TK/0').trim().toUpperCase();

  let category: 'TER A' | 'TER B' | 'TER C' = 'TER A';
  let table = TER_A_TABLE;

  if (['TK/0', 'TK/1', 'K/0'].includes(status)) {
    category = 'TER A';
    table = TER_A_TABLE;
  } else if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(status)) {
    category = 'TER B';
    table = TER_B_TABLE;
  } else if (status === 'K/3') {
    category = 'TER C';
    table = TER_C_TABLE;
  }

  const match = table.find((row) => monthlyGross <= row.maxGross) || table[table.length - 1];

  return {
    category,
    ratePercent: match.rate,
    rowNumber: match.no,
    minGross: match.minGross,
    maxGross: match.maxGross,
    statusPTKP: match.statusPTKP
  };
}

/**
 * Calculates progressive PPh 21 Tax amount per year based on PKP (Penghasilan Kena Pajak)
 * Bracket (UU HPP No. 7/2021):
 * 0 - 60jt : 5%
 * 60jt - 250jt : 15%
 * 250jt - 500jt : 25%
 * 500jt - 5 Miliar : 30%
 * > 5 Miliar : 35%
 */
export function calculateAnnualPPh21(pkp: number, hasNPWP: boolean = true): number {
  if (pkp <= 0) return 0;

  let tax = 0;
  let remaining = pkp;

  // Bracket 1: 0 - 60,000,000 (5%)
  const b1 = Math.min(remaining, 60000000);
  tax += b1 * 0.05;
  remaining -= b1;

  if (remaining > 0) {
    // Bracket 2: 60,000,000 - 250,000,000 (15%)
    const b2 = Math.min(remaining, 190000000);
    tax += b2 * 0.15;
    remaining -= b2;
  }

  if (remaining > 0) {
    // Bracket 3: 250,000,000 - 500,000,000 (25%)
    const b3 = Math.min(remaining, 250000000);
    tax += b3 * 0.25;
    remaining -= b3;
  }

  if (remaining > 0) {
    // Bracket 4: 500,000,000 - 5,000,000,000 (30%)
    const b4 = Math.min(remaining, 4500000000);
    tax += b4 * 0.3;
    remaining -= b4;
  }

  if (remaining > 0) {
    // Bracket 5: > 5,000,000,000 (35%)
    tax += remaining * 0.35;
  }

  // 20% surcharge if employee has no NPWP
  if (!hasNPWP) {
    tax = tax * 1.2;
  }

  return Math.round(tax);
}

/**
 * Full Enterprise Payroll Engine Calculator (PP 58/2023 & PMK 168/2023 Compliant)
 * Processes base salary, allowances, overtime, BPJS (employee & employer), PPh 21 TER, and attendance deductions.
 */
export function calculateEmployeePayroll(
  employee: Employee,
  month: number,
  year: number,
  attendances: Attendance[] = [],
  bonusAmount: number = 0,
  manualOtherDeductions: number = 0
): Payroll {
  const baseSalary = employee.baseSalary || 0;
  const transportAllowance = employee.transportAllowance || 0;
  const mealAllowance = employee.mealAllowance || 0;
  const positionAllowance = employee.positionAllowance || 0;
  const communicationAllowance = employee.communicationAllowance || 0;
  const otherAllowances = employee.otherAllowances || 0;

  // Total Fixed Allowances
  const totalAllowances =
    (employee.allowance || 0) +
    transportAllowance +
    mealAllowance +
    positionAllowance +
    communicationAllowance +
    otherAllowances;

  // 1. Calculate Overtime and Unpaid Absences from Attendance log
  const selectedMonthYearStr = `${year}-${String(month).padStart(2, '0')}`;
  const empAttendances = attendances.filter(
    (a) =>
      (String(a.employeeId) === String(employee.id) || a.employeeCode === employee.employeeCode) &&
      a.date &&
      a.date.startsWith(selectedMonthYearStr)
  );

  const totalOvertimeHours = empAttendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
  const totalLateCount = empAttendances.filter((a) => a.status === 'Terlambat').length;
  const totalAlphaCount = empAttendances.filter((a) => a.status === 'Alpha').length;

  // Hourly overtime rate formula: (Base Salary + Allowances) / 173
  const hourlyRate = (baseSalary + totalAllowances) / 173;
  const overtimePay = Math.round(totalOvertimeHours * hourlyRate * 1.5); // Standard 1.5x rate

  // Deductions from Attendance
  const dailyRate = (baseSalary + totalAllowances) / 25;
  const unpaidLeaveDeduction = Math.round(totalAlphaCount * dailyRate);
  const lateDeduction = Math.round(totalLateCount * 50000); // Rp 50.000 per late arrival

  // Total Gross Income received by employee
  const grossSalary = baseSalary + totalAllowances + overtimePay + bonusAmount;

  // 2. BPJS Calculations
  const isHealthActive = employee.bpjsKesehatanActive !== false;
  const isTKActive = employee.bpjsKetenagakerjaanActive !== false;

  // Base salary for BPJS
  const bpjsHealthBasis = isHealthActive ? Math.min(baseSalary + positionAllowance, BPJS_HEALTH_MAX_SALARY) : 0;
  const bpjsTKBasis = isTKActive ? baseSalary + totalAllowances : 0;
  const bpjsJPBasis = isTKActive ? Math.min(baseSalary + totalAllowances, BPJS_JP_MAX_SALARY) : 0;

  // BPJS Employee Deductions (Potongan Pekerja)
  const bpjsKesehatanEmployee = isHealthActive ? Math.round(bpjsHealthBasis * 0.01) : 0; // 1%
  const bpjsJHTEmployee = isTKActive ? Math.round(bpjsTKBasis * 0.02) : 0; // 2%
  const bpjsJPEmployee = isTKActive ? Math.round(bpjsJPBasis * 0.01) : 0; // 1%
  const bpjsAmount = bpjsKesehatanEmployee + bpjsJHTEmployee + bpjsJPEmployee;

  // BPJS Employer Contributions (Tanggungan Perusahaan)
  const bpjsKesehatanEmployer = isHealthActive ? Math.round(bpjsHealthBasis * 0.04) : 0; // 4%
  const bpjsJKKEmployer = isTKActive ? Math.round(bpjsTKBasis * 0.0024) : 0; // 0.24%
  const bpjsJKMEmployer = isTKActive ? Math.round(bpjsTKBasis * 0.003) : 0; // 0.3%
  const bpjsJHTEmployer = isTKActive ? Math.round(bpjsTKBasis * 0.037) : 0; // 3.7%
  const bpjsJPEmployer = isTKActive ? Math.round(bpjsJPBasis * 0.02) : 0; // 2%
  const totalBPJSEmployer =
    bpjsKesehatanEmployer + bpjsJKKEmployer + bpjsJKMEmployer + bpjsJHTEmployer + bpjsJPEmployer;

  // 3. TER PPh 21 Tax Calculation (PP 58/2023 & PMK 168/2023 TER Rules)
  const taxStatus: PTKPStatus = employee.taxStatus || 'TK/0';
  const ptkpAmount = PTKP_VALUES[taxStatus] || 54000000;
  const hasNPWP = Boolean(employee.taxId && employee.taxId.trim().length > 4);

  // Taxable Gross includes Gross Salary + Employer Insurance (JKK, JKM, Health)
  const taxableGrossMonthly = grossSalary + bpjsJKKEmployer + bpjsJKMEmployer + bpjsKesehatanEmployer;

  // Get TER Category (TER A, TER B, TER C) and TER % Rate directly from the tables
  const terLookup = getTERCategoryAndRate(taxStatus, taxableGrossMonthly);
  const terCategory = terLookup.category;
  const terRatePercent = terLookup.ratePercent;

  // TER PPh 21 Base = Taxable Monthly Gross * TER Rate %
  let pph21TER = Math.round(taxableGrossMonthly * (terRatePercent / 100));
  let npwpSurchargeApplied = false;

  // 20% surcharge penalty if employee has no NPWP
  if (!hasNPWP && terRatePercent > 0) {
    npwpSurchargeApplied = true;
    pph21TER = Math.round(pph21TER * 1.2);
  }

  const pph21Amount = pph21TER;
  const pph21Method = 'TER (PMK 168/2023)';

  // Determine PPh 21 Scheme: Ditanggung Perusahaan vs Ditanggung Karyawan
  const isBorneByEmployer =
    employee.pph21PaidBy === 'Perusahaan' ||
    employee.pph21Scheme === 'Nett' ||
    employee.pph21Scheme === 'GrossUp' ||
    employee.pph21Scheme === 'Ditanggung Perusahaan (Nett / Gross Up)';

  const pph21PaidBy: 'Karyawan' | 'Perusahaan' = isBorneByEmployer ? 'Perusahaan' : 'Karyawan';
  const pph21PaidByEmployer = isBorneByEmployer ? pph21Amount : 0;
  const pph21EmployeeDeduction = isBorneByEmployer ? 0 : pph21Amount;
  const pph21Allowance = isBorneByEmployer ? pph21Amount : 0;

  // Calculations for Annual Reference / Audit
  const biayaJabatan = Math.min(Math.round(taxableGrossMonthly * 0.05), 500000);
  const netTaxableMonthly = Math.max(0, taxableGrossMonthly - biayaJabatan - bpjsJHTEmployee - bpjsJPEmployee);
  const annualizedNet = netTaxableMonthly * 12;
  const pkpAmount = Math.max(0, annualizedNet - ptkpAmount);
  const annualPPh21 = calculateAnnualPPh21(pkpAmount, hasNPWP);

  // 4. Total Deductions & Net Take Home Pay
  const totalDeductions = unpaidLeaveDeduction + lateDeduction + manualOtherDeductions;
  const totalDeductionsAll = bpjsAmount + pph21EmployeeDeduction + totalDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductionsAll);

  // 5. Total Cost to Employer (Beban Perusahaan)
  const employerTotalCost = grossSalary + totalBPJSEmployer + pph21PaidByEmployer;

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  return {
    payrollCode: `PAY-${year}${String(month).padStart(2, '0')}-${employee.employeeCode || String(employee.id).padStart(3, '0')}`,
    month,
    year,
    periodName: `${monthNames[month - 1]} ${year}`,
    employeeId: employee.id || '',
    employeeName: employee.name,
    employeeCode: employee.employeeCode,
    department: employee.department,
    position: employee.position,

    baseSalary,
    transportAllowance,
    mealAllowance,
    positionAllowance,
    communicationAllowance,
    otherAllowances,
    allowances: totalAllowances,
    overtimePay,
    bonus: bonusAmount,
    grossSalary,

    bpjsKesehatanEmployee,
    bpjsJHTEmployee,
    bpjsJPEmployee,
    bpjsAmount,

    bpjsKesehatanEmployer,
    bpjsJKKEmployer,
    bpjsJKMEmployer,
    bpjsJHTEmployer,
    bpjsJPEmployer,
    totalBPJSEmployer,

    taxStatus,
    terCategory,
    terRatePercent,
    pph21Method,
    pph21PaidBy,
    pph21PaidByEmployer,
    pph21EmployeeDeduction,
    pph21Allowance,
    hasNPWP,
    npwpSurchargeApplied,
    taxableGross: taxableGrossMonthly,
    biayaJabatan,
    annualizedNet,
    ptkpAmount,
    pkpAmount,
    annualPPh21,
    pph21Amount,

    unpaidLeaveDeduction,
    lateDeduction,
    otherDeductions: manualOtherDeductions,
    deductions: totalDeductions,

    totalDeductionsAll,
    netSalary,
    employerTotalCost,
    paymentStatus: 'Draft',
    bankName: employee.bankName || 'BCA',
    bankAccount: employee.bankAccount || '-',
    bankAccountHolder: employee.bankAccountHolder || employee.name,
    createdAt: new Date().toISOString()
  };
}
