function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('QA Data Table')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fetch all rows from the active sheet.
 * @return {Array[]} 2D array of sheet values including header row.
 */
function getData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  return data;
}
