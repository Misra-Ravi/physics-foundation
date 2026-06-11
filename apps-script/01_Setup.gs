// ─── SETUP ────────────────────────────────────────────────────────────────────
// Run setupPortal() ONCE from the Apps Script editor to create all sheets,
// headers, and seed the Units table and sample roster.

function setupPortal() {
  var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  _setupRoster(ss);
  _setupUnits(ss);
  _setupProgress(ss);
  _setupEmailLog(ss);
  SpreadsheetApp.flush();
  Logger.log('Setup complete.');
}

// ── Roster ────────────────────────────────────────────────────────────────────
function _setupRoster(ss) {
  var sh = ss.getSheetByName(SHEETS.ROSTER) || ss.insertSheet(SHEETS.ROSTER);
  sh.clearContents();
  var headers = ['StudentID','StudentName','StudentEmail','ParentEmail','ParentName','StartDate','Active'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');

  // Sample roster — replace with real students before going live
  var rows = [
    ['s001','Alice Chen',   'alice.chen.student@gmail.com',   'parent.chen@gmail.com',   'Mr & Mrs Chen',   new Date(), true],
    ['s002','Bob Patel',    'bob.patel.student@gmail.com',    'parent.patel@gmail.com',  'Mr & Mrs Patel',  new Date(), true],
  ];
  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
}

// ── Units ─────────────────────────────────────────────────────────────────────
function _setupUnits(ss) {
  var sh = ss.getSheetByName(SHEETS.UNITS) || ss.insertSheet(SHEETS.UNITS);
  sh.clearContents();
  var headers = [
    'UnitID','UnitOrder','TopicNum','TopicName','SectionNum','SectionName',
    'UnitNum','UnitName','Type',
    'LessonURL','ClassworkURL','HomeworkURL',
    'TopicSlug','SectionSlug','UnitSlug',
    'AnswerKeyDriveID','PrevUnitID'
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sh.setFrozenRows(1);

  var units = _buildUnitsData();
  sh.getRange(2, 1, units.length, headers.length).setValues(units);
}

function _buildUnitsData() {
  var base = CONFIG.BASE_URL;

  // Helper to build a full unit row
  // type: 'full' (lesson+classwork+homework) or 'story' (lesson only)
  function u(id, order, topicNum, topicName, secNum, secName, unitNum, unitName, type, tSlug, sSlug, uSlug, prevId) {
    var lessonUrl    = base + tSlug + '/' + sSlug + '/' + uSlug + '/lesson.html';
    var classworkUrl = (type === 'full') ? base + tSlug + '/' + sSlug + '/' + uSlug + '/classwork.html' : '';
    var homeworkUrl  = (type === 'full') ? base + tSlug + '/' + sSlug + '/' + uSlug + '/homework.html'  : '';
    return [id, order, topicNum, topicName, secNum, secName, unitNum, unitName, type,
            lessonUrl, classworkUrl, homeworkUrl, tSlug, sSlug, uSlug, '', prevId || ''];
  }

  var rows = [];
  var order = 1;

  // ── TOPIC 0 — APPENDIX ──────────────────────────────────────────────────────

  // 0.1 Background Math (27 units)
  var bgUnits = [
    [1,'Significant Figures'],
    [2,'Calculating Significant Figures'],
    [3,'Variables, Units & Prefixes'],
    [4,'Derived Units'],
    [5,'Unit Conversion'],
    [6,'Proportional Relationships'],
    [7,'Uncertainty Notation'],
    [8,'Absolute, Fractional & Percentage Uncertainty'],
    [9,'Propagation: Add & Subtract'],
    [10,'Propagation: Multiply & Divide'],
    [11,'Propagation: Powers'],
    [12,'Propagation in Physics'],
    [13,'Measurement Uncertainty'],
    [14,'Data Tables'],
    [15,'Logger Pro'],
    [16,'Line of Best Fit'],
    [17,'Vectors & Scalars'],
    [18,'Labelling & Adding Vectors'],
    [19,'Recording Angles'],
    [20,'Finding Angles'],
    [21,'X & Y Components'],
    [22,'Finding X & Y with Trig'],
    [23,'Complex Vectors'],
    [24,'Review: Trig Sides'],
    [25,'Review: Trig'],
    [26,'Inverse Trig'],
    [27,'3D Vectors'],
  ];
  bgUnits.forEach(function(b, i) {
    var n = b[0]; var name = b[1];
    var uSlug = 'u' + String(n).padStart(2,'0');
    var prev = (i === 0) ? '' : '0.1.' + String(bgUnits[i-1][0]).padStart(2,'0');
    rows.push(u('0.1.'+String(n).padStart(2,'0'), order++, 0, 'Appendix',
      '0.1','Background Math', n, name, 'full',
      't0-appendix','s0.1-background-math', uSlug, prev));
  });

  // 0.2 Stories (11 units, read-only)
  var stories = [
    [0,'Introduction to Physics Stories'],
    [1,'Galileo & the Pendulum'],
    [2,'Newton & the Apple'],
    [3,'Faraday & the Field'],
    [4,'Light: Wave or Particle?'],
    [5,'Marie & Pierre Curie'],
    [6,'Einstein & Relativity'],
    [7,'Einstein\'s Chauffeur'],
    [8,'Schrödinger\'s Cat'],
    [9,'Lise Meitner'],
    [10,'Satyendra Bose'],
  ];
  stories.forEach(function(s, i) {
    var n = s[0]; var name = s[1];
    var uSlug = 'u' + String(n).padStart(2,'0');
    var prev = (i === 0) ? '' : '0.2.' + String(stories[i-1][0]).padStart(2,'0');
    rows.push(u('0.2.'+String(n).padStart(2,'0'), order++, 0, 'Appendix',
      '0.2','Stories of Science', n, name, 'story',
      't0-appendix','s0.2-stories', uSlug, prev));
  });

  // ── TOPIC 1 — SPACE, TIME AND MOTION ────────────────────────────────────────

  // 1.1 Kinematics (16 units)
  var kinUnits = [
    [1,'Distance & Displacement'],
    [2,'Speed & Velocity'],
    [3,'Acceleration'],
    [4,'Average vs Instantaneous Velocity'],
    [5,'Position-Time Graphs'],
    [6,'Velocity-Time Graphs I'],
    [7,'Velocity-Time Graphs II'],
    [8,'PT to VT Graph Conversion'],
    [9,'Acceleration-Time Graphs'],
    [10,'Kinematics Transition'],
    [11,'Kinematic Equations'],
    [12,'Kinematics & Geometry'],
    [13,'Free Fall'],
    [14,'Projectile Motion'],
    [15,'Air Resistance'],
    [16,'Motion Maps'],
  ];
  kinUnits.forEach(function(k, i) {
    var n = k[0]; var name = k[1];
    var uSlug = 'u' + String(n).padStart(2,'0');
    var prev = (i === 0) ? '' : '1.1.' + String(kinUnits[i-1][0]).padStart(2,'0');
    rows.push(u('1.1.'+String(n).padStart(2,'0'), order++, 1, 'Space, Time and Motion',
      '1.1','Kinematics', n, name, 'full',
      't1-space-time-motion','s1.1-kinematics', uSlug, prev));
  });

  // ── TOPICS 1.2–5.4  (stub rows — no URLs yet, add when content is ready) ───
  var stubs = [
    [1,'1.2','Forces & Momentum',17,'t1-space-time-motion','s1.2-forces-momentum'],
    [1,'1.3','Work, Energy & Power',12,'t1-space-time-motion','s1.3-work-energy-power'],
    [2,'2.1','Thermal Energy Transfers',7,'t2-particulate-matter','s2.1-thermal-energy'],
    [2,'2.2','Greenhouse Effect',1,'t2-particulate-matter','s2.2-greenhouse-effect'],
    [2,'2.3','Gas Laws',4,'t2-particulate-matter','s2.3-gas-laws'],
    [2,'2.4','Current & Circuits',10,'t2-particulate-matter','s2.4-current-circuits'],
    [3,'3.1','Simple Harmonic Motion',2,'t3-wave-behavior','s3.1-simple-harmonic'],
    [3,'3.2','Wave Model',4,'t3-wave-behavior','s3.2-wave-model'],
    [3,'3.3','Wave Phenomena',11,'t3-wave-behavior','s3.3-wave-phenomena'],
    [3,'3.4','Standing Waves & Resonance',3,'t3-wave-behavior','s3.4-standing-waves'],
    [4,'4.1','Gravitational Fields',1,'t4-fields','s4.1-gravitational'],
    [4,'4.2','Electric & Magnetic Fields',8,'t4-fields','s4.2-electric-magnetic'],
    [5,'5.1','Structure of the Atom',6,'t5-nuclear-quantum','s5.1-structure-atom'],
    [5,'5.2','Radioactive Decay',6,'t5-nuclear-quantum','s5.2-radioactive-decay'],
    [5,'5.3','Fission',1,'t5-nuclear-quantum','s5.3-fission'],
    [5,'5.4','Fusion & Stars',4,'t5-nuclear-quantum','s5.4-fusion-stars'],
  ];
  var topicNames = {1:'Space, Time and Motion',2:'The Particulate Nature of Matter',
                    3:'Wave Behavior',4:'Fields',5:'Nuclear and Quantum Physics'};
  stubs.forEach(function(st) {
    var tNum=st[0], secNum=st[1], secName=st[2], count=st[3], tSlug=st[4], sSlug=st[5];
    for (var n = 1; n <= count; n++) {
      var uSlug = 'u' + String(n).padStart(2,'0');
      var id = secNum + '.' + String(n).padStart(2,'0');
      var prev = (n === 1) ? '' : secNum + '.' + String(n-1).padStart(2,'0');
      rows.push([id, order++, tNum, topicNames[tNum], secNum, secName,
        n, secName + ' Unit ' + n, 'full', '', '', '', tSlug, sSlug, uSlug, '', prev]);
    }
  });

  return rows;
}

// ── Progress ──────────────────────────────────────────────────────────────────
function _setupProgress(ss) {
  var sh = ss.getSheetByName(SHEETS.PROGRESS) || ss.insertSheet(SHEETS.PROGRESS);
  sh.clearContents();
  var headers = [
    'ProgressID','StudentID','UnitID','Status',
    'LessonOpened','HomeworkSubmittedAt','HomeworkDriveURL',
    'SubmissionToken','ParentReviewedAt','ParentDecision','ParentComments','UnlockedAt'
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

// ── EmailLog ──────────────────────────────────────────────────────────────────
function _setupEmailLog(ss) {
  var sh = ss.getSheetByName(SHEETS.EMAIL_LOG) || ss.insertSheet(SHEETS.EMAIL_LOG);
  sh.clearContents();
  var headers = ['Timestamp','Type','StudentID','UnitID','Recipient','Subject','Status'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

// ── Seed initial Progress rows ─────────────────────────────────────────────────
// Run this AFTER setupPortal() to create one Progress row per student per unit.
// First unit of Topic 0.1 is set to 'available'; everything else is 'locked'.
function seedProgress() {
  var ss       = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var roster   = _getAllStudents(ss);
  var units    = _getAllUnits(ss);
  var progSh   = ss.getSheetByName(SHEETS.PROGRESS);

  // Clear existing data rows (keep header)
  if (progSh.getLastRow() > 1) {
    progSh.deleteRows(2, progSh.getLastRow() - 1);
  }

  var rows = [];
  roster.forEach(function(student) {
    units.forEach(function(unit, idx) {
      var status = (idx === 0) ? 'available' : 'locked';
      rows.push([
        student.StudentID + '_' + unit.UnitID,
        student.StudentID,
        unit.UnitID,
        status,
        '', '', '', '', '', '', '', ''
      ]);
    });
  });

  if (rows.length > 0) {
    progSh.getRange(2, 1, rows.length, 12).setValues(rows);
  }
  Logger.log('Seeded ' + rows.length + ' progress rows for ' + roster.length + ' students.');
}
