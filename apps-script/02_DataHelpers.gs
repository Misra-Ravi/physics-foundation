// ─── DATA ACCESS HELPERS ──────────────────────────────────────────────────────
// Shared read/write functions used by all trigger scripts.

// ── Roster ────────────────────────────────────────────────────────────────────
function _getAllStudents(ss) {
  var sh   = ss.getSheetByName(SHEETS.ROSTER);
  var data = sh.getDataRange().getValues();
  var hdr  = data[0];
  return data.slice(1).map(function(r) { return _rowToObj(hdr, r); })
             .filter(function(s) { return s.Active; });
}

function _lookupStudentByName(ss, name) {
  return _getAllStudents(ss).find(function(s) { return s.StudentName === name; }) || null;
}

function _lookupStudentById(ss, id) {
  return _getAllStudents(ss).find(function(s) { return s.StudentID === id; }) || null;
}

function _lookupStudentByEmail(ss, email) {
  return _getAllStudents(ss).find(function(s) { return s.StudentEmail === email; }) || null;
}

// ── Units ─────────────────────────────────────────────────────────────────────
function _getAllUnits(ss) {
  var sh   = ss.getSheetByName(SHEETS.UNITS);
  var data = sh.getDataRange().getValues();
  var hdr  = data[0];
  return data.slice(1).map(function(r) { return _rowToObj(hdr, r); });
}

function _lookupUnit(ss, unitId) {
  return _getAllUnits(ss).find(function(u) { return u.UnitID === unitId; }) || null;
}

function _getNextUnit(ss, unitId) {
  var units = _getAllUnits(ss);
  var idx   = units.findIndex(function(u) { return u.UnitID === unitId; });
  return (idx >= 0 && idx < units.length - 1) ? units[idx + 1] : null;
}

// ── Progress ──────────────────────────────────────────────────────────────────
function _getAllProgress(ss, studentId) {
  var sh   = ss.getSheetByName(SHEETS.PROGRESS);
  var data = sh.getDataRange().getValues();
  var hdr  = data[0];
  return data.slice(1)
    .map(function(r) { return _rowToObj(hdr, r); })
    .filter(function(p) { return p.StudentID === studentId; });
}

function _getProgress(ss, studentId, unitId) {
  var sh   = ss.getSheetByName(SHEETS.PROGRESS);
  var data = sh.getDataRange().getValues();
  var hdr  = data[0];
  var pid  = studentId + '_' + unitId;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === pid) return _rowToObj(hdr, data[i]);
  }
  return null;
}

function _updateProgress(ss, studentId, unitId, fields) {
  var sh   = ss.getSheetByName(SHEETS.PROGRESS);
  var data = sh.getDataRange().getValues();
  var hdr  = data[0];
  var pid  = studentId + '_' + unitId;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === pid) {
      Object.keys(fields).forEach(function(key) {
        var col = hdr.indexOf(key);
        if (col >= 0) sh.getRange(i + 1, col + 1).setValue(fields[key]);
      });
      return;
    }
  }
  // Row doesn't exist — append it
  var newRow = hdr.map(function(h) { return fields[h] !== undefined ? fields[h] : ''; });
  newRow[0] = pid;
  newRow[hdr.indexOf('StudentID')] = studentId;
  newRow[hdr.indexOf('UnitID')]    = unitId;
  sh.appendRow(newRow);
}

// ── Email Log ─────────────────────────────────────────────────────────────────
function _logEmail(ss, type, studentId, unitId, recipient, subject, status) {
  ss.getSheetByName(SHEETS.EMAIL_LOG).appendRow(
    [new Date(), type, studentId, unitId, recipient, subject, status || 'sent']
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function _rowToObj(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i]; });
  return obj;
}

function _buildPrefilledFormUrl(formId, values) {
  var form  = FormApp.openById(formId);
  var items = form.getItems();
  var url   = 'https://docs.google.com/forms/d/' + formId + '/viewform?';
  var params = [];
  items.forEach(function(item) {
    var title = item.getTitle();
    if (values[title] !== undefined) {
      params.push('entry.' + item.getId() + '=' + encodeURIComponent(values[title]));
    }
  });
  return url + params.join('&');
}

function _getOrCreateStudentFolder(studentName) {
  var parent = DriveApp.getFolderById(CONFIG.SUBMISSIONS_FOLDER_ID);
  var found  = parent.getFoldersByName(studentName);
  return found.hasNext() ? found.next() : parent.createFolder(studentName);
}
