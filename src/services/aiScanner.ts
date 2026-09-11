import { AIScannedMemberResult, AIScannedBankQRResult } from '../types';
import { generateVietQRUrl, findBankBin } from '../utils/vietqr';

export async function scanMemberWithAI(params: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<{ success: boolean; data: AIScannedMemberResult; isFallback?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/ai/scan-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to scan member data');
    }

    const data: AIScannedMemberResult = result.data;

    // If bankAccount was extracted, ensure qrCodeUrl is generated
    if (data.bankAccount && data.bankAccount.accountNumber) {
      data.bankAccount.qrCodeUrl = generateVietQRUrl({
        bankNameOrBin: data.bankAccount.bankName || 'MBBank',
        accountNumber: data.bankAccount.accountNumber,
        accountHolder: data.bankAccount.accountHolder || data.fullName,
      });
    }

    return {
      success: true,
      data,
      isFallback: result.isFallback,
    };
  } catch (err: any) {
    console.error('Error calling /api/ai/scan-member:', err);
    return {
      success: false,
      data: {},
      error: err?.message || 'Không thể kết nối với dịch vụ AI quét thông tin',
    };
  }
}

export async function scanBankQRWithAI(params: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<{ success: boolean; data: AIScannedBankQRResult; isFallback?: boolean; error?: string }> {
  try {
    const res = await fetch('/api/ai/scan-bank-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to scan bank QR data');
    }

    const data: AIScannedBankQRResult = result.data;

    // Ensure qrCodeUrl is valid and dynamic
    if (data.accountNumber) {
      data.bankCode = data.bankCode || findBankBin(data.bankName);
      data.qrCodeUrl = generateVietQRUrl({
        bankNameOrBin: data.bankCode || data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
        amount: data.amount,
        transferContent: data.transferContent,
      });
    }

    return {
      success: true,
      data,
      isFallback: result.isFallback,
    };
  } catch (err: any) {
    console.error('Error calling /api/ai/scan-bank-qr:', err);
    return {
      success: false,
      data: {
        bankName: 'MBBank',
        accountNumber: '',
        accountHolder: '',
        qrCodeUrl: '',
        detectedType: 'bank_card',
      },
      error: err?.message || 'Không thể quét thông tin ngân hàng',
    };
  }
}
