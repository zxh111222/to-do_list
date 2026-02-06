import * as chrono from 'chrono-node';

export interface ParsedDate {
  date: Date;
  text: string; // The original text
  cleanText: string; // Text with the date part removed
}

export const parseDateFromText = (text: string): ParsedDate | null => {
  // Use chrono to parse date
  // We use zh-CN strictly if we want Chinese support, or strictly strict/casual
  // chrono.zh.parseDate for Chinese input
  // chrono.parseDate for English
  
  // Let's try to detect or just support both?
  // chrono-node's default parser handles English well. For Chinese, we need 'chrono-node/zh'?
  // Actually chrono-node exports { zh }
  
  const results = chrono.zh.parse(text);
  
  if (results.length === 0) {
    // Fallback to English parser if no Chinese date found (or if text is English)
    const enResults = chrono.parse(text);
    if (enResults.length === 0) return null;
    
    const result = enResults[0];
    const date = result.start.date();
    const matchText = result.text;
    const cleanText = text.replace(matchText, '').trim().replace(/\s+/g, ' ');
    
    return { date, text, cleanText };
  }

  const result = results[0];
  const date = result.start.date();
  const matchText = result.text;
  // Remove the detected date text from the original string
  const cleanText = text.replace(matchText, '').trim().replace(/\s+/g, ' ');

  return { date, text, cleanText };
};
