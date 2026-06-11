// ─── STUDENT DASHBOARD WEB APP ────────────────────────────────────────────────
// Deploy as a Web App:
//   Execute as: User accessing the web app
//   Who has access: Anyone with a Google Account
//
// The URL becomes your students' bookmark — it shows their personal progress.

function doGet() {
  var userEmail = Session.getActiveUser().getEmail();
  var ss        = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var student   = _lookupStudentByEmail(ss, userEmail);

  if (!student) {
    return HtmlService.createHtmlOutput(_notEnrolledPage(userEmail))
      .setTitle('IB Physics Portal')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  var units    = _getAllUnits(ss);
  var progress = _getAllProgress(ss, student.StudentID);
  var progMap  = {};
  progress.forEach(function(p) { progMap[p.UnitID] = p; });

  var html = _buildDashboard(student, units, progMap);
  return HtmlService.createHtmlOutput(html)
    .setTitle('IB Physics Portal — ' + student.StudentName)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Dashboard HTML ────────────────────────────────────────────────────────────
function _buildDashboard(student, units, progMap) {
  var homeworkFormUrl = 'https://docs.google.com/forms/d/' + CONFIG.HOMEWORK_FORM_ID + '/viewform';

  // Group units by section
  var sections = {};
  var sectionOrder = [];
  units.forEach(function(u) {
    var key = u.SectionNum + '|' + u.SectionName;
    if (!sections[key]) { sections[key] = []; sectionOrder.push(key); }
    sections[key].push(u);
  });

  // Count complete per section for the student
  function sectionProgress(unitList) {
    var done = unitList.filter(function(u) {
      var p = progMap[u.UnitID];
      return p && p.Status === 'complete';
    }).length;
    return done + '/' + unitList.length;
  }

  var sectionsHtml = sectionOrder.map(function(key) {
    var parts    = key.split('|');
    var secNum   = parts[0];
    var secName  = parts[1];
    var unitList = sections[key];
    var prog     = sectionProgress(unitList);

    var unitsHtml = unitList.map(function(unit) {
      var p      = progMap[unit.UnitID] || { Status: 'locked' };
      var status = p.Status || 'locked';
      return _unitCard(unit, status, p, homeworkFormUrl);
    }).join('');

    return '<div class="section">' +
      '<div class="sec-header">' +
      '<span class="sec-num">' + secNum + '</span>' +
      '<span class="sec-name">' + secName + '</span>' +
      '<span class="sec-prog">' + prog + '</span>' +
      '</div>' +
      '<div class="unit-list">' + unitsHtml + '</div>' +
      '</div>';
  }).join('');

  return '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>IB Physics Portal</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">' +
    _dashboardStyles() +
    '</head><body>' +
    '<header>' +
    '<div class="header-inner">' +
    '<div><div class="portal-label">IB Physics Portal</div>' +
    '<h1>' + student.StudentName + '</h1></div>' +
    '</div>' +
    '</header>' +
    '<main>' + sectionsHtml + '</main>' +
    '</body></html>';
}

function _unitCard(unit, status, prog, homeworkFormUrl) {
  var icons   = { locked:'🔒', available:'📖', in_progress:'✏️', awaiting_review:'🟡', corrections:'❌', complete:'✅' };
  var labels  = { locked:'Locked', available:'Ready', in_progress:'In Progress', awaiting_review:'Awaiting Parent Review', corrections:'Corrections Required', complete:'Complete' };
  var classes = { locked:'locked', available:'available', in_progress:'available', awaiting_review:'pending', corrections:'corrections', complete:'complete' };

  var icon  = icons[status]   || '🔒';
  var label = labels[status]  || 'Locked';
  var cls   = classes[status] || 'locked';

  var linksHtml = '';
  if (status !== 'locked') {
    if (unit.Type === 'story') {
      linksHtml = '<div class="links"><a href="' + unit.LessonURL + '" target="_blank" class="link-btn">📖 Read Story</a></div>';
    } else {
      var lessonLink    = unit.LessonURL    ? '<a href="' + unit.LessonURL    + '" target="_blank" class="link-btn">📖 Lesson</a>'    : '';
      var classworkLink = unit.ClassworkURL ? '<a href="' + unit.ClassworkURL + '" target="_blank" class="link-btn">✏️ Classwork</a>' : '';
      var hwLink = '';
      if (status === 'available' || status === 'in_progress' || status === 'corrections') {
        var prefilled = homeworkFormUrl + '?entry.StudentName=' + encodeURIComponent(unit.UnitID + ' — ' + unit.UnitName);
        hwLink = '<a href="' + prefilled + '" target="_blank" class="link-btn submit">📤 Submit Homework</a>';
      }
      linksHtml = '<div class="links">' + lessonLink + classworkLink + hwLink + '</div>';
    }
  }

  var commentHtml = '';
  if (status === 'corrections' && prog.ParentComments) {
    commentHtml = '<div class="feedback">💬 ' + prog.ParentComments + '</div>';
  }

  return '<div class="unit-card ' + cls + '">' +
    '<div class="unit-top">' +
    '<span class="unit-icon">' + icon + '</span>' +
    '<span class="unit-name">' + unit.UnitName + '</span>' +
    '<span class="unit-status">' + label + '</span>' +
    '</div>' +
    commentHtml + linksHtml +
    '</div>';
}

function _notEnrolledPage(email) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap" rel="stylesheet">' +
    '<style>body{font-family:Nunito,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8faff;}' +
    '.box{text-align:center;background:white;padding:48px;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:420px;}' +
    'h2{color:#1d4ed8;margin-bottom:12px;}p{color:#64748b;}</style>' +
    '</head><body><div class="box"><h2>Not Enrolled</h2>' +
    '<p>The email address <strong>' + email + '</strong> is not registered in the portal.</p>' +
    '<p>Contact your teacher at <a href="mailto:' + CONFIG.ADMIN_EMAIL + '">' + CONFIG.ADMIN_EMAIL + '</a>.</p>' +
    '</div></body></html>';
}

// ── Dashboard CSS ─────────────────────────────────────────────────────────────
function _dashboardStyles() {
  return '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0;}' +
    'body{font-family:"Nunito",sans-serif;background:#f0f4f8;background-image:radial-gradient(circle,#c7d2fe 1px,transparent 1px);background-size:28px 28px;color:#0f172a;}' +
    'header{background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:white;padding:36px 24px;}' +
    '.header-inner{max-width:860px;margin:0 auto;}' +
    '.portal-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.75;margin-bottom:6px;}' +
    'header h1{font-size:1.8rem;font-weight:900;}' +
    'main{max-width:860px;margin:32px auto;padding:0 16px 60px;}' +
    '.section{margin-bottom:32px;}' +
    '.sec-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:0 4px;}' +
    '.sec-num{font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;min-width:36px;}' +
    '.sec-name{font-size:1rem;font-weight:800;color:#0f172a;flex:1;}' +
    '.sec-prog{font-size:0.78rem;font-weight:700;color:#64748b;}' +
    '.unit-list{display:flex;flex-direction:column;gap:8px;}' +
    '.unit-card{background:white;border-radius:12px;padding:14px 18px;border:2px solid #e2e8f0;transition:border-color 0.15s;}' +
    '.unit-card.available{border-color:#93c5fd;}' +
    '.unit-card.complete{border-color:#86efac;background:#f0fdf4;}' +
    '.unit-card.pending{border-color:#fde68a;background:#fffbeb;}' +
    '.unit-card.corrections{border-color:#fca5a5;background:#fff1f2;}' +
    '.unit-card.locked{opacity:0.5;}' +
    '.unit-top{display:flex;align-items:center;gap:10px;}' +
    '.unit-icon{font-size:1.1rem;flex-shrink:0;}' +
    '.unit-name{flex:1;font-size:0.92rem;font-weight:700;color:#0f172a;}' +
    '.unit-status{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;}' +
    '.links{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}' +
    '.link-btn{display:inline-block;padding:6px 14px;border-radius:8px;font-size:0.8rem;font-weight:700;text-decoration:none;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;}' +
    '.link-btn.submit{background:#1d4ed8;color:white;border-color:#1d4ed8;}' +
    '.feedback{font-size:0.82rem;color:#92400e;background:#fff7ed;border-radius:6px;padding:8px 12px;margin-top:8px;}' +
    '@media(max-width:600px){.links{flex-direction:column;}.link-btn{text-align:center;}}' +
    '</style>';
}
