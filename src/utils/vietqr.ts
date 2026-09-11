export interface BankInfo {
  code: string;
  bin: string;
  shortName: string;
  name: string;
  logo?: string;
}

export const VIETNAM_BANKS: BankInfo[] = [
  { code: 'MB', bin: '970422', shortName: 'MBBank', name: 'Ngân hàng Quân Đội (MBBank)' },
  { code: 'VCB', bin: '970436', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
  { code: 'TCB', bin: '970407', shortName: 'Techcombank', name: 'Ngân hàng Kỹ Thương Việt Nam' },
  { code: 'CTG', bin: '970415', shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam' },
  { code: 'BIDV', bin: '970418', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam' },
  { code: 'VBA', bin: '970405', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & Phát triển Nông thôn' },
  { code: 'VPB', bin: '970432', shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng' },
  { code: 'ACB', bin: '970416', shortName: 'ACB', name: 'Ngân hàng Á Châu' },
  { code: 'TPB', bin: '970458', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong' },
  { code: 'STB', bin: '970403', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín' },
  { code: 'HDB', bin: '970437', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM' },
  { code: 'VIB', bin: '970441', shortName: 'VIB', name: 'Ngân hàng Quốc Tế' },
  { code: 'SHB', bin: '970443', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội' },
  { code: 'MSB', bin: '970426', shortName: 'MSB', name: 'Ngân hàng Hàng Hải Việt Nam' },
  { code: 'OCB', bin: '970448', shortName: 'OCB', name: 'Ngân hàng Phương Đông' },
  { code: 'SSB', bin: '970440', shortName: 'SeABank', name: 'Ngân hàng Đông Nam Á' },
  { code: 'LPB', bin: '970449', shortName: 'LPBank', name: 'Ngân hàng Lộc Phát Việt Nam' },
];

/**
 * Normalizes and finds bank BIN from user input or AI string
 */
export function findBankBin(bankNameOrCode: string): string {
  if (!bankNameOrCode) return '970422'; // default MBBank
  const clean = bankNameOrCode.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const b of VIETNAM_BANKS) {
    const codeClean = b.code.toLowerCase();
    const shortClean = b.shortName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameClean = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes(codeClean) || clean.includes(shortClean) || shortClean.includes(clean) || nameClean.includes(clean)) {
      return b.bin;
    }
  }

  // Common aliases
  if (clean.includes('mb') || clean.includes('quan')) return '970422';
  if (clean.includes('vietcom') || clean.includes('vcb')) return '970436';
  if (clean.includes('techcom') || clean.includes('tcb')) return '970407';
  if (clean.includes('vietin') || clean.includes('ctg')) return '970415';
  if (clean.includes('bidv')) return '970418';
  if (clean.includes('agri') || clean.includes('nongnghiep')) return '970405';
  if (clean.includes('vp') || clean.includes('vpb')) return '970432';
  if (clean.includes('acb')) return '970416';
  if (clean.includes('tp') || clean.includes('tienphong')) return '970458';
  if (clean.includes('sacon') || clean.includes('sacom')) return '970403';

  return '970422'; // Fallback to MB
}

/**
 * Generates VietQR standard URL
 */
export function generateVietQRUrl(options: {
  bankNameOrBin: string;
  accountNumber: string;
  accountHolder?: string;
  amount?: number;
  transferContent?: string;
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}): string {
  const { bankNameOrBin, accountNumber, accountHolder = '', amount = 0, transferContent = '', template = 'compact2' } = options;
  const cleanAccount = (accountNumber || '').replace(/\s+/g, '');
  if (!cleanAccount) return '';

  const bin = /^\d{6}$/.test(bankNameOrBin) ? bankNameOrBin : findBankBin(bankNameOrBin);
  const encodedHolder = encodeURIComponent((accountHolder || '').toUpperCase().trim());
  const encodedContent = encodeURIComponent((transferContent || '').trim());

  let url = `https://api.vietqr.io/image/${bin}-${cleanAccount}-${template}.jpg`;
  const params: string[] = [];

  if (encodedHolder) params.push(`accountName=${encodedHolder}`);
  if (amount > 0) params.push(`amount=${amount}`);
  if (encodedContent) params.push(`addInfo=${encodedContent}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}
