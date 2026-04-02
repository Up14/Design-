var FORM_SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfbyM94nlVSeUsn3P4J0PtqSWQKWQue_P9CODXQU0z4OJGmKA/formResponse";

// HOW TO GET YOUR FORM ID:
// 1. Open your Google Form in edit mode
// 2. Look at the URL: https://docs.google.com/forms/d/XXXXXXXXX/edit
// 3. Copy the XXXXXXXXX part and paste it below
var FORM_ID = "PASTE_YOUR_FORM_ID_HERE";

var SLEEP_MS = 300;
var MAX_RETRIES = 3;
var TIME_LIMIT_MS = 5 * 60 * 1000;

function fixValue(val) {
  val = String(val).trim();
  val = val.replace("18-25",                  "18\u201325");
  val = val.replace("26-35",                  "26\u201335");
  val = val.replace("36-45",                  "36\u201345");
  val = val.replace("46-55",                  "46\u201355");
  val = val.replace("6 months - 1 year",      "6 months \u2013 1 year");
  val = val.replace("1 - 2 years",            "1 \u2013 2 years");
  val = val.replace("₹500-₹1000",             "₹500\u2013₹1000");
  val = val.replace("₹1000-₹2000",            "₹1000\u2013₹2000");
  val = val.replace("₹25,000 - ₹50,000",      "₹25,000 \u2013 ₹50,000");
  val = val.replace("₹50,000 - ₹1,00,000",    "₹50,000 \u2013 ₹1,00,000");
  return val;
}

function buildPayload(row) {
  return {
    "entry.303740390":  fixValue(row[1]),
    "entry.1086762157": fixValue(row[2]),
    "entry.1917937891": fixValue(row[3]),
    "entry.1289700543": fixValue(row[4]),
    "entry.1018663345": fixValue(row[5]),
    "entry.145059431":  fixValue(row[6]),
    "entry.1473844248": fixValue(row[7]),
    "entry.276124326":  fixValue(row[8]),
    "entry.376037381":  fixValue(row[9]),
    "entry.997057711":  fixValue(row[10]),
    "entry.322041317":  fixValue(row[11]),
    "entry.713338086":  fixValue(row[12]),
    "entry.1492510377": fixValue(row[13]),
    "entry.359926672":  fixValue(row[14]),
    "entry.308405531":  fixValue(row[15]),
    "entry.1629243376": fixValue(row[16]),
    "entry.1939194667": fixValue(row[17]),
    "entry.1590118948": fixValue(row[18]),
    "entry.1615960163": fixValue(row[19]),
    "entry.507725179":  fixValue(row[20]),
    "entry.1416407056": fixValue(row[21]),
    "entry.1070295807": fixValue(row[22]),
    "entry.1670494399": fixValue(row[23]),
    "entry.1913661552": fixValue(row[24]),
    "entry.1005121405": fixValue(row[25]),
    "entry.116380034":  fixValue(row[26]),
    "entry.1204708854": fixValue(row[27]),
    "entry.857822782":  fixValue(row[28]),
    "entry.354813515":  fixValue(row[29]),
    "entry.533072747":  fixValue(row[30]),
    "entry.1836552272": fixValue(row[31]),
    "entry.428589865":  fixValue(row[32]),
    "entry.177603811":  fixValue(row[33]),
    "entry.221131318":  fixValue(row[34]),
    "entry.988610216":  fixValue(row[35]),
    "entry.709759873":  fixValue(row[36]),
    "entry.610247760":  fixValue(row[37]),
    "entry.1881353047": fixValue(row[38]),
    "entry.1519084617": fixValue(row[39]),
    "entry.514368968":  fixValue(row[40]),
    "entry.124654992":  fixValue(row[41]),
    "entry.1079926378": fixValue(row[42]),
    "entry.1409137915": fixValue(row[43]),
    "entry.174421472":  fixValue(row[44]),
    "entry.540895255":  fixValue(row[45]),
    "entry.1128443509": fixValue(row[46]),
    "entry.894122149":  fixValue(row[47]),
    "entry.1091084412": fixValue(row[48]),
    "entry.692321910":  fixValue(row[49]),
    "entry.485171893":  fixValue(row[50]),
    "entry.1970281100": fixValue(row[51]),
    "entry.446279040":  fixValue(row[52]),
    "entry.1388233644": fixValue(row[53])
  };
}

// ============================================================
// STEP 1: Run this FIRST to delete all old responses
// ============================================================
function deleteAllResponses() {
  var form = FormApp.openById(FORM_ID);
  form.deleteAllResponses();
  Logger.log("ALL OLD RESPONSES DELETED from the form.");
  Logger.log("Now run submitAllResponses to fill fresh data.");
}

// ============================================================
// STEP 2: Run this to submit all 600 rows (auto-resumes)
// ============================================================
function submitAllResponses() {
  var props = PropertiesService.getScriptProperties();
  var startRow = Number(props.getProperty("LAST_ROW") || 1);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var totalRows = data.length - 1;

  var successCount = 0;
  var failedRows = [];
  var startTime = new Date().getTime();

  Logger.log("Total rows: " + totalRows + " | Resuming from row " + (startRow + 1));

  for (var i = startRow; i < data.length; i++) {
    var row = data[i];

    if (!row[1]) {
      Logger.log("Stopping at empty row " + (i + 1));
      break;
    }

    var elapsed = new Date().getTime() - startTime;
    if (elapsed > TIME_LIMIT_MS) {
      props.setProperty("LAST_ROW", String(i));
      Logger.log("==============================");
      Logger.log("TIME LIMIT — paused at row " + (i + 1));
      Logger.log("Submitted " + successCount + " rows this run.");
      Logger.log("Click RUN again to continue from row " + (i + 1));
      Logger.log("==============================");
      return;
    }

    var payload = buildPayload(row);
    var submitted = submitWithRetry(payload, i + 1);

    if (submitted) {
      successCount++;
    } else {
      failedRows.push(i + 1);
    }

    Utilities.sleep(SLEEP_MS);
  }

  props.deleteProperty("LAST_ROW");

  Logger.log("==============================");
  Logger.log("ALL DONE! Submitted: " + successCount + " rows this run.");
  Logger.log("Total rows in sheet: " + totalRows);
  if (failedRows.length > 0) {
    Logger.log("FAILED rows: " + failedRows.join(", "));
  } else {
    Logger.log("All rows submitted successfully!");
  }
  Logger.log("==============================");
}

function submitWithRetry(payload, rowNum) {
  var options = {
    "method": "post",
    "payload": payload,
    "muteHttpExceptions": true
  };

  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    var response = UrlFetchApp.fetch(FORM_SUBMIT_URL, options);
    var code = response.getResponseCode();

    if (code === 200) {
      Logger.log("Row " + rowNum + " OK" + (attempt > 1 ? " (attempt " + attempt + ")" : ""));
      return true;
    }

    Logger.log("Row " + rowNum + " FAIL attempt " + attempt + ": HTTP " + code);
    if (attempt < MAX_RETRIES) Utilities.sleep(SLEEP_MS * attempt * 2);
  }

  Logger.log("Row " + rowNum + " PERMANENTLY FAILED.");
  return false;
}

// ============================================================
// OPTIONAL: Test with 1 row first
// ============================================================
function testSingleRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var row = data[1];

  Logger.log("=== TEST ROW 2 ===");
  Logger.log("Q1 (Tier-2?):    " + fixValue(row[1]));
  Logger.log("Q3 (City):       " + fixValue(row[3]));
  Logger.log("Q8 (Age):        " + fixValue(row[8]));
  Logger.log("Q11 (Income):    " + fixValue(row[11]));
  Logger.log("BI6 (last col):  " + fixValue(row[53]));

  var payload = buildPayload(row);
  var options = { "method": "post", "payload": payload, "muteHttpExceptions": true };
  var response = UrlFetchApp.fetch(FORM_SUBMIT_URL, options);

  if (response.getResponseCode() === 200) {
    Logger.log("SUCCESS");
  } else {
    Logger.log("FAILED — HTTP " + response.getResponseCode());
  }
}

// ============================================================
// OPTIONAL: Reset progress to start over from row 1
// ============================================================
function resetProgress() {
  PropertiesService.getScriptProperties().deleteProperty("LAST_ROW");
  Logger.log("Progress reset. Next run starts from row 2.");
}
