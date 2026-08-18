/**
 * Helper to convert numbers to Indonesian words (Terbilang)
 * e.g. 15000000 -> "Lima Belas Juta Rupiah"
 */
export function numberToTerbilang(n: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas'
  ];

  const val = Math.floor(Math.abs(n));

  if (val < 12) {
    return bilangan[val];
  } else if (val < 20) {
    return bilangan[val - 10] + ' Belas';
  } else if (val < 100) {
    const sisa = val % 10;
    return bilangan[Math.floor(val / 10)] + ' Puluh' + (sisa ? ' ' + bilangan[sisa] : '');
  } else if (val < 200) {
    return 'Seratus' + (val - 100 ? ' ' + numberToTerbilang(val - 100) : '');
  } else if (val < 1000) {
    const sisa = val % 100;
    return bilangan[Math.floor(val / 100)] + ' Ratus' + (sisa ? ' ' + numberToTerbilang(sisa) : '');
  } else if (val < 2000) {
    return 'Seribu' + (val - 1000 ? ' ' + numberToTerbilang(val - 1000) : '');
  } else if (val < 1000000) {
    const sisa = val % 1000;
    return numberToTerbilang(Math.floor(val / 1000)) + ' Ribu' + (sisa ? ' ' + numberToTerbilang(sisa) : '');
  } else if (val < 1000000000) {
    const sisa = val % 1000000;
    return numberToTerbilang(Math.floor(val / 1000000)) + ' Juta' + (sisa ? ' ' + numberToTerbilang(sisa) : '');
  } else if (val < 1000000000000) {
    const sisa = val % 1000000000;
    return numberToTerbilang(Math.floor(val / 1000000000)) + ' Miliar' + (sisa ? ' ' + numberToTerbilang(sisa) : '');
  } else {
    const sisa = val % 1000000000000;
    return numberToTerbilang(Math.floor(val / 1000000000000)) + ' Triliun' + (sisa ? ' ' + numberToTerbilang(sisa) : '');
  }
}

export function formatTerbilangRupiah(amount: number): string {
  if (!amount || amount === 0) return 'Nol Rupiah';
  const text = numberToTerbilang(amount).trim();
  return `${text} Rupiah`;
}
