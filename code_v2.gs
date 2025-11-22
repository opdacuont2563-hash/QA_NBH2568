/**
 * ระบบบันทึกข้อมูล QA โรงพยาบาลหนองบัวลำภู
 * Google Apps Script Backend - Version 2.0
 * รองรับข้อมูลตามโครงสร้างใหม่
 */

// Spreadsheet ID
const SPREADSHEET_ID = '1bwfAc9P3WNbpu0N76pRTTt2MrNE8UsrBd7ln9mklWws';

/**
 * แสดงหน้าเว็บ
 */
function doGet(e) {
  const page = e.parameter.page || 'user';
  
  if (page === 'admin') {
    return HtmlService.createHtmlOutputFromFile('admin')
      .setTitle('Admin Dashboard - QA System')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createHtmlOutputFromFile('index_v2')
      .setTitle('ระบบบันทึกข้อมูล QA - โรงพยาบาลหนองบัวลำภู')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * ตรวจสอบและสร้าง Sheet ถ้ายังไม่มี
 */
function initializeSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('QAData_V2');
  
  if (!sheet) {
    sheet = ss.insertSheet('QAData_V2');

    // สร้าง Headers
    const headers = [
      'ID', 'แผนก ID', 'ชื่อแผนก', 'ปีงบประมาณ', 'เดือน', 'วันที่บันทึก',
      
      // Section 1: Patient Safety (14 fields)
      's1_1', 's1_2', 's1_3', 's1_4', 's1_5',
      's1_6_1', 's1_6_2', 's1_6_3', 's1_6_4', 'pressureUlcerRate',
      's1_7', 's1_8', 's1_9', 's1_10',
      
      // Section 2: Readmission Rate (3 fields)
      's2_1', 's2_2', 'readmissionRate',
      
      // Section 3: Average Length of Stay (3 fields)
      's3_1', 'daysInMonth', 'averageLOS',
      
      // Section 4: Productivity (9 fields)
      's4_a', 's4_b', 's4_c', 
      'rnHr', 'auxHr', 'ratioRnAux', 'actualHPPD', 'productivity',
      
      // Section 5: On-call & Unplanned (3 fields)
      's5_1', 's6_1', 's6_2',
      
      // Section 6: CPR (3 fields)
      's7_1', 's7_2', 's7_3',
      
      // Section 7: SOS Scores (5 fields)
      's8_1', 's8_2', 's8_3', 's8_4', 's8_5',
      
      // Section 8: Pain Management (10 fields)
      's9_1_1', 's9_1_2', 'painTotal',
      's9_2_1', 's9_2_2', 's9_2_3',
      's9_3_1', 's9_3_2', 'recordCompleteness',

      // Section 9: ICU-specific metrics
      'icu_unplannedReturn3Days',
      'icu_unplan_med_male', 'icu_unplan_med_female',
      'icu_unplan_surg_male', 'icu_unplan_surg_female',
      'icu_unplan_ortho', 'icu_unplan_obgyne', 'icu_unplan_ped', 'icu_unplan_ent', 'icu_unplan_uro', 'icu_unplan_neuro',

      'หมายเหตุ'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#667eea');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
    sheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  } else {
    // Ensure headers up to date when sheet already exists
    const headers = [
      'ID', 'แผนก ID', 'ชื่อแผนก', 'ปีงบประมาณ', 'เดือน', 'วันที่บันทึก',
      's1_1', 's1_2', 's1_3', 's1_4', 's1_5',
      's1_6_1', 's1_6_2', 's1_6_3', 's1_6_4', 'pressureUlcerRate',
      's1_7', 's1_8', 's1_9', 's1_10',
      's2_1', 's2_2', 'readmissionRate',
      's3_1', 'daysInMonth', 'averageLOS',
      's4_a', 's4_b', 's4_c', 'rnHr', 'auxHr', 'ratioRnAux', 'actualHPPD', 'productivity',
      's5_1', 's6_1', 's6_2',
      's7_1', 's7_2', 's7_3',
      's8_1', 's8_2', 's8_3', 's8_4', 's8_5',
      's9_1_1', 's9_1_2', 'painTotal', 's9_2_1', 's9_2_2', 's9_2_3', 's9_3_1', 's9_3_2', 'recordCompleteness',
      'icu_unplannedReturn3Days', 'icu_unplan_med_male', 'icu_unplan_med_female', 'icu_unplan_surg_male', 'icu_unplan_surg_female',
      'icu_unplan_ortho', 'icu_unplan_obgyne', 'icu_unplan_ped', 'icu_unplan_ent', 'icu_unplan_uro', 'icu_unplan_neuro',
      'หมายเหตุ'
    ];

    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (currentHeaders.length < headers.length || headers.some((h, idx) => currentHeaders[idx] !== h)) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

/**
 * สร้าง ID สำหรับข้อมูลใหม่
 */
function generateId() {
  return 'QA' + new Date().getTime();
}

/**
 * แปลงชื่อเดือนให้เป็นรูปแบบมาตรฐาน (ภาษาไทยเต็ม) เพื่อใช้เทียบข้อมูล
 */
function normalizeMonthValue(month) {
  const monthStr = String(month || '').trim();
  const monthMap = {
    '10': 'ตุลาคม', 'ตุลา': 'ตุลาคม', 'ต.ค.': 'ตุลาคม', 'october': 'ตุลาคม', 'oct': 'ตุลาคม',
    '11': 'พฤศจิกายน', 'พย': 'พฤศจิกายน', 'พ.ย.': 'พฤศจิกายน', 'november': 'พฤศจิกายน', 'nov': 'พฤศจิกายน',
    '12': 'ธันวาคม', 'ธ.ค.': 'ธันวาคม', 'december': 'ธันวาคม', 'dec': 'ธันวาคม',
    '1': 'มกราคม', 'ม.ค.': 'มกราคม', 'january': 'มกราคม', 'jan': 'มกราคม',
    '2': 'กุมภาพันธ์', 'ก.พ.': 'กุมภาพันธ์', 'february': 'กุมภาพันธ์', 'feb': 'กุมภาพันธ์',
    '3': 'มีนาคม', 'มี.ค.': 'มีนาคม', 'march': 'มีนาคม', 'mar': 'มีนาคม',
    '4': 'เมษายน', 'เม.ย.': 'เมษายน', 'april': 'เมษายน', 'apr': 'เมษายน',
    '5': 'พฤษภาคม', 'พ.ค.': 'พฤษภาคม', 'may': 'พฤษภาคม',
    '6': 'มิถุนายน', 'มิ.ย.': 'มิถุนายน', 'june': 'มิถุนายน', 'jun': 'มิถุนายน',
    '7': 'กรกฎาคม', 'ก.ค.': 'กรกฎาคม', 'july': 'กรกฎาคม', 'jul': 'กรกฎาคม',
    '8': 'สิงหาคม', 'ส.ค.': 'สิงหาคม', 'august': 'สิงหาคม', 'aug': 'สิงหาคม',
    '9': 'กันยายน', 'ก.ย.': 'กันยายน', 'september': 'กันยายน', 'sep': 'กันยายน'
  };

  const normalizedKey = monthStr.toLowerCase();
  return monthMap[normalizedKey] || monthStr; // ถ้าไม่ตรง map ให้คืนค่าที่ trim แล้ว
}

/**
 * บันทึกข้อมูล QA
 */
function saveQAData(data) {
  try {
    const sheet = initializeSheet();

    // Normalize key identifiers to avoid whitespace issues
    const departmentId = String(data.departmentId || '').trim();
    const fiscalYear = String(data.fiscalYear || '').trim();
    const month = normalizeMonthValue(data.month);

    // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      const rowDeptId = String(existingData[i][1]).trim();
      const rowFiscalYear = String(existingData[i][3]).trim();
      const rowMonth = normalizeMonthValue(existingData[i][4]);

      if (rowDeptId === departmentId &&
          rowFiscalYear === fiscalYear &&
          rowMonth === month) {
        return updateExistingRow(sheet, i + 1, data);
      }
    }

    // เพิ่มข้อมูลใหม่
    const newRow = [
      generateId(),
      departmentId,
      data.departmentName,
      fiscalYear,
      month,
      new Date(),
      
      // Section 1
      data.s1_1 || '', data.s1_2 || '', data.s1_3 || '', data.s1_4 || '', data.s1_5 || '',
      data.s1_6_1 || '', data.s1_6_2 || '', data.s1_6_3 || '', data.s1_6_4 || '', data.pressureUlcerRate || '',
      data.s1_7 || '', data.s1_8 || '', data.s1_9 || '', data.s1_10 || '',
      
      // Section 2
      data.s2_1 || '', data.s2_2 || '', data.readmissionRate || '',
      
      // Section 3
      data.s3_1 || '', data.daysInMonth || '', data.averageLOS || '',
      
      // Section 4
      data.s4_a || '', data.s4_b || '', data.s4_c || '',
      data.rnHr || '', data.auxHr || '', data.ratioRnAux || '', data.actualHPPD || '', data.productivity || '',
      
      // Section 5
      data.s5_1 || '', data.s6_1 || '', data.s6_2 || '',
      
      // Section 6
      data.s7_1 || '', data.s7_2 || '', data.s7_3 || '',
      
      // Section 7
      data.s8_1 || '', data.s8_2 || '', data.s8_3 || '', data.s8_4 || '', data.s8_5 || '',
      
      // Section 8
      data.s9_1_1 || '', data.s9_1_2 || '', data.painTotal || '',
      data.s9_2_1 || '', data.s9_2_2 || '', data.s9_2_3 || '',
      data.s9_3_1 || '', data.s9_3_2 || '', data.recordCompleteness || '',

      // Section 9
      data.icu_unplannedReturn3Days || '',
      data.icu_unplan_med_male || '', data.icu_unplan_med_female || '',
      data.icu_unplan_surg_male || '', data.icu_unplan_surg_female || '',
      data.icu_unplan_ortho || '', data.icu_unplan_obgyne || '', data.icu_unplan_ped || '', data.icu_unplan_ent || '',
      data.icu_unplan_uro || '', data.icu_unplan_neuro || '',

      data.note || ''
    ];
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (error) {
    Logger.log('Error in saveQAData: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * อัพเดทข้อมูลที่มีอยู่แล้ว
 */
function updateExistingRow(sheet, rowIndex, data) {
  try {
    // อัพเดทวันที่
    sheet.getRange(rowIndex, 6).setValue(new Date());
    sheet.getRange(rowIndex, 5).setValue(normalizeMonthValue(data.month));
    
    // อัพเดทข้อมูล
    let colIndex = 7;
    
    // Section 1 (14 fields)
    const section1 = [
      data.s1_1, data.s1_2, data.s1_3, data.s1_4, data.s1_5,
      data.s1_6_1, data.s1_6_2, data.s1_6_3, data.s1_6_4, data.pressureUlcerRate,
      data.s1_7, data.s1_8, data.s1_9, data.s1_10
    ];
    section1.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 2 (3 fields)
    const section2 = [data.s2_1, data.s2_2, data.readmissionRate];
    section2.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 3 (3 fields)
    const section3 = [data.s3_1, data.daysInMonth, data.averageLOS];
    section3.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 4 (8 fields)
    const section4 = [
      data.s4_a, data.s4_b, data.s4_c,
      data.rnHr, data.auxHr, data.ratioRnAux, data.actualHPPD, data.productivity
    ];
    section4.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 5 (3 fields)
    const section5 = [data.s5_1, data.s6_1, data.s6_2];
    section5.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 6 (3 fields)
    const section6 = [data.s7_1, data.s7_2, data.s7_3];
    section6.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 7 (5 fields)
    const section7 = [data.s8_1, data.s8_2, data.s8_3, data.s8_4, data.s8_5];
    section7.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });
    
    // Section 8 (9 fields)
    const section8 = [
      data.s9_1_1, data.s9_1_2, data.painTotal,
      data.s9_2_1, data.s9_2_2, data.s9_2_3,
      data.s9_3_1, data.s9_3_2, data.recordCompleteness
    ];
    section8.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });

    // Section 9 (ICU-specific)
    const section9 = [
      data.icu_unplannedReturn3Days,
      data.icu_unplan_med_male, data.icu_unplan_med_female,
      data.icu_unplan_surg_male, data.icu_unplan_surg_female,
      data.icu_unplan_ortho, data.icu_unplan_obgyne, data.icu_unplan_ped, data.icu_unplan_ent,
      data.icu_unplan_uro, data.icu_unplan_neuro
    ];
    section9.forEach(val => {
      sheet.getRange(rowIndex, colIndex++).setValue(val || '');
    });

    // Note
    sheet.getRange(rowIndex, colIndex).setValue(data.note || '');
    
    return { success: true, message: 'อัพเดทข้อมูลสำเร็จ' };
  } catch (error) {
    Logger.log('Error in updateExistingRow: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * ดึงข้อมูล QA ตามแผนก ปี และเดือน
 */
function getQAData(departmentId, fiscalYear, month) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    // Trim input parameters
    const deptIdStr = String(departmentId).trim();
    const fiscalYearStr = String(fiscalYear).trim();
    const monthStr = normalizeMonthValue(month);
    
    Logger.log('getQAData - Looking for: dept="' + deptIdStr + '", year="' + fiscalYearStr + '", month="' + monthStr + '"');
    
    for (let i = 1; i < data.length; i++) {
      const rowDeptId = String(data[i][1]).trim();
      const rowFiscalYear = String(data[i][3]).trim();
      const rowMonth = normalizeMonthValue(data[i][4]);
      
      if (rowDeptId === deptIdStr && 
          rowFiscalYear === fiscalYearStr && 
          rowMonth === monthStr) {
        
        Logger.log('getQAData - Found match at row ' + i);
        
        const result = {
          id: data[i][0],
          departmentId: rowDeptId,
          departmentName: String(data[i][2]).trim(),
          fiscalYear: rowFiscalYear,
          month: rowMonth,
          timestamp: data[i][5],
          
          // Section 1
          s1_1: data[i][6], s1_2: data[i][7], s1_3: data[i][8], s1_4: data[i][9], s1_5: data[i][10],
          s1_6_1: data[i][11], s1_6_2: data[i][12], s1_6_3: data[i][13], s1_6_4: data[i][14], 
          pressureUlcerRate: data[i][15],
          s1_7: data[i][16], s1_8: data[i][17], s1_9: data[i][18], s1_10: data[i][19],
          
          // Section 2
          s2_1: data[i][20], s2_2: data[i][21], readmissionRate: data[i][22],
          
          // Section 3
          s3_1: data[i][23], daysInMonth: data[i][24], averageLOS: data[i][25],
          
          // Section 4
          s4_a: data[i][26], s4_b: data[i][27], s4_c: data[i][28],
          rnHr: data[i][29], auxHr: data[i][30], ratioRnAux: data[i][31], 
          actualHPPD: data[i][32], productivity: data[i][33],
          
          // Section 5
          s5_1: data[i][34], s6_1: data[i][35], s6_2: data[i][36],
          
          // Section 6
          s7_1: data[i][37], s7_2: data[i][38], s7_3: data[i][39],
          
          // Section 7
          s8_1: data[i][40], s8_2: data[i][41], s8_3: data[i][42], s8_4: data[i][43], s8_5: data[i][44],
          
          // Section 8
          s9_1_1: data[i][45], s9_1_2: data[i][46], painTotal: data[i][47],
          s9_2_1: data[i][48], s9_2_2: data[i][49], s9_2_3: data[i][50],
          s9_3_1: data[i][51], s9_3_2: data[i][52], recordCompleteness: data[i][53],

          // Section 9
          icu_unplannedReturn3Days: data[i][54],
          icu_unplan_med_male: data[i][55], icu_unplan_med_female: data[i][56],
          icu_unplan_surg_male: data[i][57], icu_unplan_surg_female: data[i][58],
          icu_unplan_ortho: data[i][59], icu_unplan_obgyne: data[i][60], icu_unplan_ped: data[i][61],
          icu_unplan_ent: data[i][62], icu_unplan_uro: data[i][63], icu_unplan_neuro: data[i][64],

          note: data[i][65]
        };
        
        return result;
      }
    }
    
    Logger.log('getQAData - No match found');
    return null;
  } catch (error) {
    Logger.log('Error in getQAData: ' + error.toString());
    return null;
  }
}

/**
 * ดึงข้อมูลทั้งปี
 */
function getYearData(departmentId, fiscalYear) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    const result = {};
    
    // Convert fiscalYear to string and trim
    const fiscalYearStr = String(fiscalYear).trim();
    const deptIdStr = String(departmentId).trim();
    
    Logger.log('========== getYearData START ==========');
    Logger.log('Looking for Department ID: "' + deptIdStr + '"');
    Logger.log('Looking for Fiscal Year: "' + fiscalYearStr + '"');
    Logger.log('Total rows in sheet: ' + (data.length - 1));
    
    let foundCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      // Get values and trim them
      const rowDeptId = String(data[i][1]).trim();
      const rowFiscalYear = String(data[i][3]).trim();
      const rowMonth = normalizeMonthValue(data[i][4]);
      
      // Debug first 3 rows
      if (i <= 3) {
        Logger.log('Row ' + i + ' - DeptID: "' + rowDeptId + '", Year: "' + rowFiscalYear + '", Month: "' + rowMonth + '"');
      }
      
      // Compare with trimmed values
      if (rowDeptId === deptIdStr && rowFiscalYear === fiscalYearStr) {
        foundCount++;
        
        Logger.log('✓ FOUND Match at row ' + i + ': Month = "' + rowMonth + '"');
        
        const timestampCell = data[i][5];
        const parsedTimestamp = timestampCell instanceof Date
          ? timestampCell
          : new Date(timestampCell);

        const monthData = {
          id: data[i][0],
          departmentId: rowDeptId,
          departmentName: String(data[i][2]).trim(),
          fiscalYear: rowFiscalYear,
          month: rowMonth,
          timestamp: isNaN(parsedTimestamp.getTime()) ? String(timestampCell || '') : parsedTimestamp.toISOString(),
          
          // Section 1
          s1_1: data[i][6], s1_2: data[i][7], s1_3: data[i][8], s1_4: data[i][9], s1_5: data[i][10],
          s1_6_1: data[i][11], s1_6_2: data[i][12], s1_6_3: data[i][13], s1_6_4: data[i][14], 
          pressureUlcerRate: data[i][15],
          s1_7: data[i][16], s1_8: data[i][17], s1_9: data[i][18], s1_10: data[i][19],
          
          // Section 2
          s2_1: data[i][20], s2_2: data[i][21], readmissionRate: data[i][22],
          
          // Section 3
          s3_1: data[i][23], daysInMonth: data[i][24], averageLOS: data[i][25],
          
          // Section 4
          s4_a: data[i][26], s4_b: data[i][27], s4_c: data[i][28],
          rnHr: data[i][29], auxHr: data[i][30], ratioRnAux: data[i][31], 
          actualHPPD: data[i][32], productivity: data[i][33],
          
          // Section 5
          s5_1: data[i][34], s6_1: data[i][35], s6_2: data[i][36],
          
          // Section 6
          s7_1: data[i][37], s7_2: data[i][38], s7_3: data[i][39],
          
          // Section 7
          s8_1: data[i][40], s8_2: data[i][41], s8_3: data[i][42], s8_4: data[i][43], s8_5: data[i][44],
          
          // Section 8
          s9_1_1: data[i][45], s9_1_2: data[i][46], painTotal: data[i][47],
          s9_2_1: data[i][48], s9_2_2: data[i][49], s9_2_3: data[i][50],
          s9_3_1: data[i][51], s9_3_2: data[i][52], recordCompleteness: data[i][53],

          // Section 9
          icu_unplannedReturn3Days: data[i][54],
          icu_unplan_med_male: data[i][55], icu_unplan_med_female: data[i][56],
          icu_unplan_surg_male: data[i][57], icu_unplan_surg_female: data[i][58],
          icu_unplan_ortho: data[i][59], icu_unplan_obgyne: data[i][60], icu_unplan_ped: data[i][61],
          icu_unplan_ent: data[i][62], icu_unplan_uro: data[i][63], icu_unplan_neuro: data[i][64],

          note: data[i][65]
        };
        
        result[rowMonth] = monthData;
      }
    }
    
    Logger.log('========== getYearData RESULT ==========');
    Logger.log('Found ' + foundCount + ' months of data');
    Logger.log('Months: ' + Object.keys(result).join(', '));
    Logger.log('========================================');
    
    return result;
  } catch (error) {
    Logger.log('ERROR in getYearData: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return {};
  }
}

/**
 * อัพเดทข้อมูล QA
 */
function updateQAData(data) {
  try {
    const sheet = initializeSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === data.id) {
        return updateExistingRow(sheet, i + 1, data);
      }
    }
    
    return { success: false, message: 'ไม่พบข้อมูลที่ต้องการอัพเดท' };
  } catch (error) {
    Logger.log('Error in updateQAData: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * ลบข้อมูล QA
 */
function deleteQAData(departmentId, fiscalYear, month) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();

    const deptIdStr = String(departmentId || '').trim();
    const fiscalYearStr = String(fiscalYear || '').trim();
    const monthStr = normalizeMonthValue(month);

    for (let i = 1; i < data.length; i++) {
      const rowDeptId = String(data[i][1]).trim();
      const rowFiscalYear = String(data[i][3]).trim();
      const rowMonth = normalizeMonthValue(data[i][4]);

      if (rowDeptId === deptIdStr &&
          rowFiscalYear === fiscalYearStr &&
          rowMonth === monthStr) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'ลบข้อมูลสำเร็จ' };
      }
    }
    
    return { success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ' };
  } catch (error) {
    Logger.log('Error in deleteQAData: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * ดึงข้อมูลสรุปทั้งหมด (สำหรับ Admin)
 */
function getAllData(fiscalYear) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === fiscalYear) {
        const rowData = {
          id: data[i][0],
          departmentId: data[i][1],
          departmentName: data[i][2],
          fiscalYear: data[i][3],
          month: data[i][4],
          timestamp: data[i][5]
        };
        
        // Add all fields
        for (let j = 6; j < data[i].length; j++) {
          rowData['field_' + j] = data[i][j];
        }
        
        result.push(rowData);
      }
    }
    
    return result;
  } catch (error) {
    Logger.log('Error in getAllData: ' + error.toString());
    return [];
  }
}

/**
 * สร้างรายงานสรุป
 */
function generateSummaryReport(departmentId, fiscalYear) {
  try {
    const yearData = getYearData(departmentId, fiscalYear);
    const months = ['ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 
                    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน'];
    
    const summary = {
      totalMonths: 12,
      completedMonths: 0,
      pendingMonths: [],
      completedMonthsList: [],
      completionRate: 0
    };
    
    months.forEach(month => {
      if (yearData[month]) {
        summary.completedMonths++;
        summary.completedMonthsList.push(month);
      } else {
        summary.pendingMonths.push(month);
      }
    });
    
    summary.completionRate = ((summary.completedMonths / summary.totalMonths) * 100).toFixed(2);
    
    return summary;
  } catch (error) {
    Logger.log('Error in generateSummaryReport: ' + error.toString());
    return null;
  }
}

/**
 * ส่งออกข้อมูลเป็น CSV
 */
function exportToCSV(departmentId, fiscalYear) {
  try {
    const yearData = getYearData(departmentId, fiscalYear);
    const months = ['ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 
                    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน'];
    
    let csv = 'เดือน,';
    
    // Add headers
    const headers = [
      's1_1', 's1_2', 's1_3', 's1_4', 's1_5',
      's1_6_1', 's1_6_2', 's1_6_3', 's1_6_4', 'pressureUlcerRate',
      's1_7', 's1_8', 's1_9', 's1_10',
      's2_1', 's2_2', 'readmissionRate',
      's3_1', 'averageLOS',
      's4_a', 's4_b', 's4_c', 'productivity',
      's5_1', 's6_1', 's6_2',
      's7_1', 's7_2', 's7_3',
      's8_1', 's8_2', 's8_3', 's8_4', 's8_5',
      's9_1_1', 's9_1_2', 'painTotal',
      's9_2_1', 's9_2_2', 's9_2_3',
      's9_3_1', 's9_3_2', 'recordCompleteness',
      'icu_unplannedReturn3Days', 'icu_unplan_med_male', 'icu_unplan_med_female', 'icu_unplan_surg_male', 'icu_unplan_surg_female',
      'icu_unplan_ortho', 'icu_unplan_obgyne', 'icu_unplan_ped', 'icu_unplan_ent', 'icu_unplan_uro', 'icu_unplan_neuro',
      'หมายเหตุ'
    ];
    
    csv += headers.join(',') + '\n';
    
    // Add data
    months.forEach(month => {
      csv += month + ',';
      const data = yearData[month];
      
      if (data) {
        headers.forEach(header => {
          csv += (data[header] || '') + ',';
        });
        csv += '\n';
      } else {
        csv += headers.map(() => '').join(',') + '\n';
      }
    });
    
    return csv;
  } catch (error) {
    Logger.log('Error in exportToCSV: ' + error.toString());
    return '';
  }
}

/**
 * ดึงข้อมูลทุกแผนกสำหรับ Admin Dashboard
 */
function getAllDepartmentsData(fiscalYear) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    const result = {};
    const fiscalYearStr = String(fiscalYear).trim();
    
    Logger.log('getAllDepartmentsData - Looking for year: "' + fiscalYearStr + '"');
    
    // Loop through all data rows
    for (let i = 1; i < data.length; i++) {
      const rowFiscalYear = String(data[i][3]).trim();
      
      if (rowFiscalYear === fiscalYearStr) {
        const departmentId = String(data[i][1]).trim();
        const month = normalizeMonthValue(data[i][4]);
        
        if (!result[departmentId]) {
          result[departmentId] = {};
        }
        
        const monthData = {
          id: data[i][0],
          departmentId: departmentId,
          departmentName: String(data[i][2]).trim(),
          fiscalYear: rowFiscalYear,
          month: month,
          timestamp: data[i][5]
        };
        
        // Add all field data (simplified - can add more if needed)
        for (let j = 6; j < data[i].length; j++) {
          monthData['field_' + j] = data[i][j];
        }
        
        result[departmentId][month] = monthData;
      }
    }
    
    Logger.log('getAllDepartmentsData - Found data for ' + Object.keys(result).length + ' departments');
    
    return result;
  } catch (error) {
    Logger.log('Error in getAllDepartmentsData: ' + error.toString());
    return {};
  }
}

/**
 * ดึงสถิติสรุปสำหรับ Admin
 */
function getAdminStatistics(fiscalYear) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    const departments = [
      "DEPT001", "DEPT002", "DEPT003", "DEPT004", "DEPT005", "DEPT006",
      "DEPT007", "DEPT008", "DEPT009", "DEPT010", "DEPT011", "DEPT012",
      "DEPT013", "DEPT014", "DEPT015", "DEPT016", "DEPT017", "DEPT018",
      "DEPT019", "DEPT020", "DEPT021"
    ];
    
    const months = ['ตุลาคม', 'พฤศจิกายน', 'ธันวาคม', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 
                    'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน'];
    
    const stats = {
      totalDepartments: departments.length,
      completeDepartments: 0,
      incompleteDepartments: 0,
      emptyDepartments: 0,
      totalEntries: 0,
      expectedEntries: departments.length * months.length,
      monthlyBreakdown: {},
      departmentBreakdown: {}
    };
    
    // Initialize monthly breakdown
    months.forEach(month => {
      stats.monthlyBreakdown[month] = 0;
    });
    
    // Count entries
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === fiscalYear) {
        stats.totalEntries++;
        const month = data[i][4];
        if (stats.monthlyBreakdown[month] !== undefined) {
          stats.monthlyBreakdown[month]++;
        }
      }
    }
    
    // Calculate department completion
    departments.forEach(deptId => {
      let monthCount = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === deptId && data[i][3] === fiscalYear) {
          monthCount++;
        }
      }
      
      stats.departmentBreakdown[deptId] = monthCount;
      
      if (monthCount === 12) {
        stats.completeDepartments++;
      } else if (monthCount === 0) {
        stats.emptyDepartments++;
      } else {
        stats.incompleteDepartments++;
      }
    });
    
    stats.completionPercentage = ((stats.totalEntries / stats.expectedEntries) * 100).toFixed(2);
    
    return stats;
  } catch (error) {
    Logger.log('Error in getAdminStatistics: ' + error.toString());
    return null;
  }
}
