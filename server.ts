import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initFirebase, getDataset, saveDataset } from './src/firebaseServer.js';

const app = express();
const PORT = 3000;

// Initialize Firebase on boot
initFirebase();

// Increase JSON payload limit to handle image uploads for AI scanning
app.use(express.json({ limit: '20mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'server_data');
const getFilePath = (key: string) => path.join(DATA_DIR, `${key}.json`);

// 1. Get entire clan dataset
app.get('/api/data', async (req: Request, res: Response) => {
  try {
    const keys = ['members', 'contributions', 'articles', 'changeRequests', 'accounts', 'auditLogs', 'clanSettings'];
    
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const isConfigured = fs.existsSync(configPath) || fs.existsSync(DATA_DIR);
    if (!isConfigured) {
      return res.json({ initialized: false });
    }

    const data: Record<string, any> = { initialized: true };
    for (const key of keys) {
      const filePath = getFilePath(key);
      const val = await getDataset(key, filePath);
      if (val !== null) {
        data[key] = val;
      } else {
        data[key] = [];
      }
    }
    
    return res.json(data);
  } catch (error: any) {
    console.error('Error reading clan database:', error);
    return res.status(500).json({ error: 'Không thể đọc cơ sở dữ liệu từ máy chủ.', details: error.message });
  }
});

// 2. Initialize entire clan dataset
app.post('/api/data/init', async (req: Request, res: Response) => {
  try {
    const keys = ['members', 'contributions', 'articles', 'changeRequests', 'accounts', 'auditLogs', 'clanSettings'];
    for (const key of keys) {
      const value = req.body[key];
      if (value !== undefined) {
        const filePath = getFilePath(key);
        await saveDataset(key, value, filePath);
      }
    }

    return res.json({ success: true, message: 'Đã khởi tạo cơ sở dữ liệu phả tộc thành công!' });
  } catch (error: any) {
    console.error('Error initializing clan database:', error);
    return res.status(500).json({ error: 'Không thể khởi tạo cơ sở dữ liệu.', details: error.message });
  }
});

// 3. Save specific dataset key
app.post('/api/data/save', async (req: Request, res: Response) => {
  try {
    const { key, data } = req.body;
    const validKeys = ['members', 'contributions', 'articles', 'changeRequests', 'accounts', 'auditLogs', 'clanSettings'];
    
    if (!key || !validKeys.includes(key)) {
      return res.status(400).json({ error: 'Khóa dữ liệu không hợp lệ hoặc không được hỗ trợ.' });
    }

    const filePath = getFilePath(key);
    await saveDataset(key, data, filePath);
    return res.json({ success: true });
  } catch (error: any) {
    console.error(`Error saving dataset ${req.body?.key}:`, error);
    return res.status(500).json({ error: 'Không thể lưu dữ liệu lên máy chủ.', details: error.message });
  }
});

// Fallback regex extractor for Vietnamese member text / basic OCR
function heuristicMemberExtract(text: string) {
  const result: Record<string, any> = {
    fullName: '',
    gender: 'male',
    birthYear: new Date().getFullYear() - 30,
    deathYear: null,
    isAlive: true,
    generation: 4,
    branch: 'Chi 1',
    title: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    phoneNumber: '',
    email: '',
    currentAddress: '',
    workplace: '',
    bio: text.slice(0, 300),
    bankAccount: undefined,
  };

  // Extract Name (Ông/Bà/Anh/Chị/Cụ ...)
  const nameMatch = text.match(/(?:ông|bà|anh|chị|cụ|thành viên|họ và tên|họ tên|tên:?)\s+([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựýỳỷỹỵ]+(?:\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰÝỲỶỸỴ][a-zàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựýỳỷỹỵ]+){1,4})/i);
  if (nameMatch) {
    result.fullName = nameMatch[1].trim();
  }

  // Gender
  if (/(?:nữ|bà|cô|chị|thê tử|mẹ|vợ)/i.test(text)) {
    result.gender = 'female';
  } else if (/(?:nam|ông|anh|phu quân|cha|bố)/i.test(text)) {
    result.gender = 'male';
  }

  // Birth Year
  const birthMatch = text.match(/(?:sinh\s*(?:năm)?|sn|ngày sinh|năm sinh:?)\s*(\d{4})/i) || text.match(/\b(19\d{2}|20[0-2]\d)\b/);
  if (birthMatch) {
    result.birthYear = parseInt(birthMatch[1], 10);
  }

  // Death Year
  const deathMatch = text.match(/(?:mất\s*(?:năm)?|tạ thế|qua đời|hưởng thọ|năm mất:?)\s*(\d{4})/i);
  if (deathMatch) {
    result.deathYear = parseInt(deathMatch[1], 10);
    result.isAlive = false;
  }

  // Generation & Branch
  const genMatch = text.match(/(?:đời|thế hệ|thế thứ)\s*(?:thứ)?\s*(\d+)/i);
  if (genMatch) {
    result.generation = parseInt(genMatch[1], 10);
  }
  const branchMatch = text.match(/(?:chi|phái|nhánh)\s*(?:thứ)?\s*(\d+|[A-Za-z0-9\s]+)/i);
  if (branchMatch) {
    result.branch = `Chi ${branchMatch[1]}`.trim();
  }

  // Phone & Email
  const phoneMatch = text.match(/(?:0|\+84)[35789]\d{8}/);
  if (phoneMatch) result.phoneNumber = phoneMatch[0];

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  // Bank Info heuristic
  const bankMatch = text.match(/(MBBank|MB|Vietcombank|VCB|Techcombank|TCB|VietinBank|BIDV|Agribank|VPBank|ACB|TPBank|Sacombank|HDBank)/i);
  const accMatch = text.match(/(?:stk|số tk|tài khoản|stk:?|account:?)\s*([0-9]{8,16})/i) || text.match(/\b([0-9]{9,16})\b/);
  if (bankMatch || accMatch) {
    result.bankAccount = {
      bankName: bankMatch ? bankMatch[0].toUpperCase() : 'MBBank',
      accountNumber: accMatch ? accMatch[1] : '1903688889999',
      accountHolder: result.fullName ? result.fullName.toUpperCase() : 'NGUYEN VAN',
      branchName: 'Chi nhánh Trung Tâm'
    };
  }

  return result;
}

// 1. Endpoint: AI Quét thông tin Thành viên Gia phả & Ngân hàng
app.post('/api/ai/scan-member', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Cần cung cấp hình ảnh hoặc nội dung văn bản để quét thông tin.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return heuristic fallback
      const fallbackResult = heuristicMemberExtract(text || 'Thông tin mẫu thành viên');
      return res.json({
        success: true,
        data: fallbackResult,
        isFallback: true,
        message: 'Đã trích xuất thông tin cơ bản bằng bộ phân tích quy tắc (Chưa cấu hình GEMINI_API_KEY).'
      });
    }

    const systemInstruction = `Bạn là chuyên gia số hóa gia phả cổ, lý lịch thành viên và các trang tài liệu gia tộc của người Việt Nam.
Nhiệm vụ: Phân tích hình ảnh hoặc văn bản chụp từ trang sách gia phả, tờ khai lý lịch dòng họ, ghi chép dòng tộc để trích xuất chính xác các thông tin của thành viên dưới định dạng JSON chuẩn.

Các trường cần trích xuất:
- fullName: Họ và tên đầy đủ của thành viên (chữ in hoa hoặc chữ hoa chữ thường chuẩn tiếng Việt).
- gender: "male" (nếu là Nam/Ông/Cụ ông/Cụ/Anh) hoặc "female" (nếu là Nữ/Bà/Cụ bà/Chị/Dâu). Nếu tài liệu không ghi rõ giới tính, hãy suy đoán từ danh xưng (Ví dụ: "Phu nhân chính thất", "Cụ bà" -> "female"; "Thân phụ", "Cụ ông", "Tự là..." -> "male").
- birthYear: Năm sinh Dương lịch dạng số nguyên (VD: 1985). Nếu tài liệu chỉ ghi năm Âm lịch (Canh Tý, Nhâm Tuất...), hãy chuyển đổi sang năm Dương lịch tương ứng một cách chính xác nhất hoặc suy luận từ ngữ cảnh đời dòng họ, nếu không thể xác định được thì để null hoặc ước lượng.
- deathYear: Năm mất/tạ thế Dương lịch dạng số nguyên, hoặc null nếu còn sống.
- isAlive: false nếu tài liệu ghi ngày mất, hưởng thọ, tạ thế, đã mất, mộ phần ở đâu; hoặc true nếu người đó còn sống hoặc không có thông tin tạ thế.
- generation: Đời/thế hệ thứ mấy trong dòng họ (số nguyên 1, 2, 3, 4, 5...). Trích xuất trực tiếp từ các từ khóa như "Đời thứ...", "Thế hệ thứ..." hoặc ước tính hợp lý từ vai vế trong dòng tộc.
- branch: Chi phái dòng họ (VD: "Chi 1", "Chi Đệ Tam", "Ngành Trưởng", "Chi 3").
- title: Chức danh dòng tộc, tước vị hoặc học vị/chức vụ xã hội nổi bật (VD: "Trưởng Họ", "Chánh hương hội", "Thầy đồ", "Tú tài", "Liệt sĩ", "Giáo sư").
- fatherName: Họ tên thân phụ (cha/bố).
- motherName: Họ tên thân mẫu (mẹ).
- spouseName: Họ tên vợ hoặc chồng (phu nhân, đức lang quân).
- phoneNumber: Số điện thoại liên hệ (nếu có, thường ở tờ khai hiện đại).
- email: Địa chỉ email (nếu có).
- currentAddress: Quê quán, nguyên quán hoặc nơi cư trú/thường trú ghi trên tài liệu.
- workplace: Công việc, chức nghiệp hoặc hành trạng nổi bật thời sinh tiền.
- lunarDeathDate: Ngày giỗ Âm lịch (nếu có, VD: "18 tháng 7 Âm lịch", "Ngày 12 tháng Chạp").
- burialPlace: Nơi an táng, khu mộ phần (nếu đã mất, VD: "Khu lăng mộ Đồng Mơ", "Nghĩa trang quê nhà").
- bio: Tóm tắt tiểu sử hành trạng cuộc đời, các công lao đóng góp lớn cho dòng họ, đất nước (1-3 câu súc tích từ tài liệu gia phả).
- bankAccount: Thông tin tài khoản ngân hàng (nếu có ghi trên tờ khai, để null nếu không có).
- confidenceNotes: Nhận định ngắn về độ tin cậy và nguồn gốc trang gia phả đã phân tích (VD: "Trích từ Sách gia phả chi đệ tam", "Tờ khai lý lịch thành viên").

Trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ cấu trúc trên.`;

    const contents: any[] = [];

    if (imageBase64) {
      // Remove data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    contents.push({
      text: text 
        ? `Hãy trích xuất thông tin thành viên gia phả và ngân hàng từ nội dung sau:\n${text}`
        : 'Hãy phân tích hình ảnh đính kèm (giấy tờ CCCD, khai sinh, gia phả, thẻ, hoặc thông tin ngân hàng) và trích xuất thông tin thành viên dòng họ cùng tài khoản ngân hàng.'
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    }

    return res.json({
      success: true,
      data: parsedData,
      isFallback: false
    });
  } catch (error: any) {
    console.error('Gemini member scan error:', error);
    // Graceful fallback so UI remains functional
    const fallback = heuristicMemberExtract(req.body.text || '');
    return res.json({
      success: true,
      data: fallback,
      isFallback: true,
      errorNotice: error?.message || 'Có lỗi khi gọi Gemini API, chuyển sang chế độ phân tích dự phòng.'
    });
  }
});

// 2. Endpoint: AI Quét Mã QR & Thông Tin Ngân Hàng (Đổi mã QR và tài khoản tự động)
app.post('/api/ai/scan-bank-qr', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Cần cung cấp ảnh mã QR, ảnh thẻ ngân hàng hoặc nội dung số tài khoản.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Heuristic bank scan fallback
      const bankText = text || '';
      const bankMatch = bankText.match(/(MBBank|MB|Vietcombank|VCB|Techcombank|TCB|VietinBank|BIDV|Agribank|VPBank|ACB|TPBank|Sacombank|HDBank)/i);
      const accMatch = bankText.match(/(?:stk|số tk|tài khoản|stk:?|account:?)\s*([0-9]{8,16})/i) || bankText.match(/\b([0-9]{9,16})\b/);
      const holderMatch = bankText.match(/(?:chủ tk|tên|ctk|account holder:?)\s*([A-Z\s]{4,30})/i);
      const amountMatch = bankText.match(/(?:số tiền|amount|vnd:?)\s*([0-9.,]+)/i);

      const bankName = bankMatch ? bankMatch[0].toUpperCase() : 'MBBank';
      const accountNumber = accMatch ? accMatch[1].replace(/\D/g, '') : '1903688889999';
      const accountHolder = holderMatch ? holderMatch[1].trim() : 'BAN QUAN LY QUY DONG HO';
      const amount = amountMatch ? parseInt(amountMatch[1].replace(/\D/g, ''), 10) : 0;

      return res.json({
        success: true,
        data: {
          bankName,
          accountNumber,
          accountHolder,
          branchName: 'Chi nhánh Hội Sở',
          amount,
          transferContent: 'DONG GOP QUY HO',
          detectedType: 'bank_card',
          notes: 'Phân tích dự phòng theo mẫu văn bản'
        },
        isFallback: true
      });
    }

    const systemInstruction = `Bạn là chuyên gia nhận diện và quét mã VietQR, ảnh chụp màn hình ứng dụng ngân hàng (Vietcombank, MBBank, Techcombank, BIDV, VPBank, ACB, TPBank, Agribank, VietinBank...) và thẻ ATM ngân hàng tại Việt Nam.
Nhiệm vụ: Phân tích mã QR thanh toán hoặc thông tin chuyển khoản ngân hàng và trích xuất dữ liệu chi tiết dạng JSON chuẩn.

Các trường cần trích xuất:
- bankName: Tên ngân hàng chính xác (VD: "MBBank", "Vietcombank", "Techcombank", "BIDV", "VietinBank", "Agribank", "VPBank", "ACB", "TPBank", "Sacombank", "HDBank", "VIB", "SHB", "MSB", "OCB", "SeABank", "LPBank").
- bankCode: Mã định danh ngân hàng hoặc số BIN chuẩn nếu nhận diện được (VD: MBBank là "970422", Vietcombank là "970436", Techcombank là "970407", BIDV là "970418").
- accountNumber: Số tài khoản ngân hàng thụ hưởng (chỉ chứa các chữ số liền nhau, loại bỏ khoảng trắng hoặc dấu gạch ngang).
- accountHolder: Tên chủ tài khoản thụ hưởng (VIẾT HOA KHÔNG DẤU, VD: "NGUYEN VAN AN" hoặc "BAN QUAN LY QUY DONG HO").
- branchName: Tên chi nhánh ngân hàng (nếu có ghi trong hình ảnh/văn bản).
- amount: Số tiền chuyển khoản (số nguyên, nếu có trong mã QR hoặc thông tin hóa đơn; nếu không có thì là 0).
- transferContent: Nội dung chuyển khoản / lời nhắn thụ hưởng (nếu có, VD: "Ung ho quy ho toc", "Mung tho cu").
- detectedType: Một trong các giá trị: "vietqr" (nếu là ảnh mã QR), "bank_card" (nếu là ảnh thẻ ATM/Visa/Mastercard), "transfer_receipt" (nếu là biên lai/màn hình chuyển tiền), "text" (nếu quét từ văn bản).
- notes: Ghi chú nhận xét của AI về thông tin tài khoản vừa quét.

Trả về DUY NHẤT chuỗi JSON hợp lệ.`;

    const contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    contents.push({
      text: text
        ? `Hãy trích xuất thông tin ngân hàng và mã QR từ văn bản sau:\n${text}`
        : 'Hãy quét hình ảnh mã VietQR hoặc ảnh thẻ ngân hàng đính kèm, nhận diện ngân hàng, số tài khoản, tên chủ tài khoản và nội dung.'
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    }

    return res.json({
      success: true,
      data: parsedData,
      isFallback: false
    });
  } catch (error: any) {
    console.error('Gemini bank QR scan error:', error);
    return res.json({
      success: true,
      data: {
        bankName: 'MBBank',
        accountNumber: '1903688889999',
        accountHolder: 'BAN QUAN LY QUY DONG HO',
        branchName: 'Chi nhánh Hội Sở',
        detectedType: 'bank_card',
        notes: 'Chuyển sang chế độ dự phòng do sự cố kết nối'
      },
      isFallback: true,
      errorNotice: error?.message
    });
  }
});

// Vite middleware / Static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FullStack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
