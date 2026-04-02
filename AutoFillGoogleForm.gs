var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfbyM94nlVSeUsn3P4J0PtqSWQKWQue_P9CODXQU0z4OJGmKA/formResponse";
var SLEEP_MS = 500;
var MAX_RETRIES = 3;

/**
 * Fixes CSV hyphens (-) to en-dashes (–) to match Google Form option text exactly.
 */
function fixValue(val) {
  val = String(val).trim();
  // Age groups
  val = val.replace("18-25",                  "18\u201325");
  val = val.replace("26-35",                  "26\u201335");
  val = val.replace("36-45",                  "36\u201345");
  val = val.replace("46-55",                  "46\u201355");
  // Duration
  val = val.replace("6 months - 1 year",      "6 months \u2013 1 year");
  val = val.replace("1 - 2 years",            "1 \u2013 2 years");
  // Spend per order
  val = val.replace("₹500-₹1000",             "₹500\u2013₹1000");
  val = val.replace("₹1000-₹2000",            "₹1000\u2013₹2000");
  // Income
  val = val.replace("₹25,000 - ₹50,000",      "₹25,000 \u2013 ₹50,000");
  val = val.replace("₹50,000 - ₹1,00,000",    "₹50,000 \u2013 ₹1,00,000");
  return val;
}

/**
 * Main function — submits all rows from the active Google Sheet to the Google Form.
 * Assumes Column A = Timestamp (skipped), Columns B–BB = survey responses.
 */
function submitAllResponses() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  var successCount = 0;
  var failedRows = [];

  Logger.log("Total rows found: " + (data.length - 1));

  // Row 0 = headers, data starts at index 1
  // col[0] = Timestamp — SKIP, survey data starts at col[1]
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Stop if first question (col[1]) is empty
    if (!row[1]) {
      Logger.log("Stopping at empty row " + (i + 1));
      break;
    }

    var payload = {
      "entry.303740390":  fixValue(row[1]),   // Q1:  Do you currently live in a Tier-2 city?
      "entry.1086762157": fixValue(row[2]),   // Q2:  Do you purchase groceries online?
      "entry.1917937891": fixValue(row[3]),   // Q3:  Which Tier-2 city?
      "entry.1289700543": fixValue(row[4]),   // Q4:  Which platform?
      "entry.1018663345": fixValue(row[5]),   // Q5:  How often?
      "entry.145059431":  fixValue(row[6]),   // Q6:  How long using?
      "entry.1473844248": fixValue(row[7]),   // Q7:  Spend per order
      "entry.276124326":  fixValue(row[8]),   // Q8:  Age Group
      "entry.376037381":  fixValue(row[9]),   // Q9:  Gender
      "entry.997057711":  fixValue(row[10]),  // Q10: Education Level
      "entry.322041317":  fixValue(row[11]),  // Q11: Monthly Household Income
      "entry.713338086":  fixValue(row[12]),  // EE1: Easy to use
      "entry.1492510377": fixValue(row[13]),  // EE2: Easy to find products
      "entry.359926672":  fixValue(row[14]),  // EE3: Simple and convenient
      "entry.308405531":  fixValue(row[15]),  // EE4: Easy to learn
      "entry.1629243376": fixValue(row[16]),  // EE5: Clear interface
      "entry.1939194667": fixValue(row[17]),  // EE6: Easy navigation
      "entry.1590118948": fixValue(row[18]),  // PE1: Saves time
      "entry.1615960163": fixValue(row[19]),  // PE2: More convenient
      "entry.507725179":  fixValue(row[20]),  // PE3: Improves efficiency
      "entry.1416407056": fixValue(row[21]),  // PE4: Better management
      "entry.1070295807": fixValue(row[22]),  // PE5: Avoid crowded markets
      "entry.1670494399": fixValue(row[23]),  // PE6: Wider variety
      "entry.1913661552": fixValue(row[24]),  // TR1: Trust quality
      "entry.1005121405": fixValue(row[25]),  // TR2: Payment protection
      "entry.116380034":  fixValue(row[26]),  // TR3: Deliver as promised
      "entry.1204708854": fixValue(row[27]),  // TR4: Feel safe
      "entry.857822782":  fixValue(row[28]),  // TR5: Reliable service
      "entry.354813515":  fixValue(row[29]),  // TR6: Handle data responsibly
      "entry.533072747":  fixValue(row[30]),  // SI1: People encourage
      "entry.1836552272": fixValue(row[31]),  // SI2: Friends/family use
      "entry.428589865":  fixValue(row[32]),  // SI3: Becoming common
      "entry.177603811":  fixValue(row[33]),  // SI4: Recommendations
      "entry.221131318":  fixValue(row[34]),  // SI5: Social media ads
      "entry.988610216":  fixValue(row[35]),  // SI6: Online reviews
      "entry.709759873":  fixValue(row[36]),  // PR1: Worry poor quality
      "entry.610247760":  fixValue(row[37]),  // PR2: Payment security concern
      "entry.1881353047": fixValue(row[38]),  // PR3: Delivery delays
      "entry.1519084617": fixValue(row[39]),  // PR4: Return difficulty
      "entry.514368968":  fixValue(row[40]),  // PR5: Freshness concern
      "entry.124654992":  fixValue(row[41]),  // PR6: Data misuse worry
      "entry.1079926378": fixValue(row[42]),  // PV1: Better discounts
      "entry.1409137915": fixValue(row[43]),  // PV2: Save money
      "entry.174421472":  fixValue(row[44]),  // PV3: Promotions encourage
      "entry.540895255":  fixValue(row[45]),  // PV4: Easier price comparison
      "entry.1128443509": fixValue(row[46]),  // PV5: Better deals
      "entry.894122149":  fixValue(row[47]),  // PV6: Delivery charges affect
      "entry.1091084412": fixValue(row[48]),  // BI1: Intend regular use
      "entry.692321910":  fixValue(row[49]),  // BI2: Continue in future
      "entry.485171893":  fixValue(row[50]),  // BI3: Recommend to others
      "entry.1970281100": fixValue(row[51]),  // BI4: Prefer over traditional
      "entry.446279040":  fixValue(row[52]),  // BI5: Plan to increase usage
      "entry.1388233644": fixValue(row[53])   // BI6: Primary method in future
    };

    var submitted = submitWithRetry(payload, i + 1);
    if (submitted) {
      successCount++;
    } else {
      failedRows.push(i + 1);
    }

    Utilities.sleep(SLEEP_MS);
  }

  Logger.log("==============================");
  Logger.log("DONE! Submitted: " + successCount + " / " + (data.length - 1) + " rows.");
  if (failedRows.length > 0) {
    Logger.log("FAILED rows: " + failedRows.join(", "));
  } else {
    Logger.log("All rows submitted successfully!");
  }
  Logger.log("==============================");
}

/**
 * Submits a single form response with retry logic.
 */
function submitWithRetry(payload, rowNum) {
  var options = {
    "method": "post",
    "payload": payload,
    "muteHttpExceptions": true
  };

  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    var response = UrlFetchApp.fetch(FORM_URL, options);
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

/**
 * Test function — submits only row 2 to verify everything works.
 * Run this FIRST before running submitAllResponses.
 */
function testSingleRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var row = data[1];

  Logger.log("=== TEST ROW 2 ===");
  Logger.log("Q1 (Tier-2?):    " + fixValue(row[1]));
  Logger.log("Q2 (Online?):    " + fixValue(row[2]));
  Logger.log("Q3 (City):       " + fixValue(row[3]));
  Logger.log("Q7 (Spend):      " + fixValue(row[7]));
  Logger.log("Q8 (Age):        " + fixValue(row[8]));
  Logger.log("Q11 (Income):    " + fixValue(row[11]));
  Logger.log("BI6 (last col):  " + fixValue(row[53]));
  Logger.log("==================");

  // Actually submit this one row to test
  var payload = {
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

  var options = {
    "method": "post",
    "payload": payload,
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(FORM_URL, options);
  Logger.log("Test submit HTTP code: " + response.getResponseCode());
  if (response.getResponseCode() === 200) {
    Logger.log("SUCCESS — check your form responses to verify the data looks correct.");
  } else {
    Logger.log("FAILED — check the form URL and entry IDs.");
  }
}
