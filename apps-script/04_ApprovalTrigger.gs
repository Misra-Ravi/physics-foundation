// ─── TRIGGER B: PARENT APPROVAL ───────────────────────────────────────────────
// Bound to Form B (Parent Approval) as an installable onFormSubmit trigger.
// Install via: Triggers → Add Trigger → onParentApproval → Form submit

function onParentApproval(e) {
  var ss  = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var row = e.namedValues;

  var studentId   = _firstVal(row['studentId']);
  var unitId      = _firstVal(row['unitId']);
  var token       = _firstVal(row['token']);
  var decisionRaw = _firstVal(row['Your decision']);
  var comments    = _firstVal(row['Comments for your child']) || '';
  var parentName  = _firstVal(row['Your name']) || 'Parent';

  var approved = decisionRaw.toLowerCase().indexOf('approve') >= 0;

  var student = _lookupStudentById(ss, studentId);
  var unit    = _lookupUnit(ss, unitId);

  if (!student || !unit) {
    _alertAdmin('onParentApproval: unknown student "' + studentId + '" or unit "' + unitId + '"');
    return;
  }

  // Validate token
  var prog = _getProgress(ss, studentId, unitId);
  if (!prog || prog.SubmissionToken !== token) {
    _alertAdmin('onParentApproval: invalid token for ' + studentId + ' / ' + unitId);
    return;
  }

  // Guard against double-approval
  if (prog.Status === 'complete') {
    Logger.log('Already approved: ' + studentId + ' / ' + unitId);
    return;
  }

  _updateProgress(ss, studentId, unitId, {
    Status:           approved ? 'complete' : 'corrections',
    ParentReviewedAt: new Date(),
    ParentDecision:   approved ? 'approved' : 'corrections',
    ParentComments:   comments,
  });

  if (approved) {
    // Unlock next unit
    var nextUnit = _getNextUnit(ss, unitId);
    if (nextUnit) {
      _updateProgress(ss, studentId, nextUnit.UnitID, {
        Status:     'available',
        UnlockedAt: new Date(),
      });
    }

    // Email student (cc parent)
    var subject = '✅ Approved! Your next chapter is ready — ' + (nextUnit ? nextUnit.UnitName : 'All done!');
    var body    = _buildApprovalEmail(student, unit, nextUnit);
    try {
      GmailApp.sendEmail(student.StudentEmail, subject, _stripHtml(body), {
        htmlBody: body,
        cc:       student.ParentEmail,
        name:     CONFIG.PORTAL_NAME,
        replyTo:  CONFIG.ADMIN_EMAIL,
      });
      _logEmail(ss, 'approval', studentId, unitId, student.StudentEmail, subject, 'sent');
    } catch(err) {
      _logEmail(ss, 'approval', studentId, unitId, student.StudentEmail, subject, 'error: ' + err);
    }

  } else {
    // Build resubmit URL (pre-filled form with student name and unit)
    var resubmitUrl = _buildPrefilledFormUrl(CONFIG.HOMEWORK_FORM_ID, {
      'Your name':      student.StudentName,
      'Unit completed': unitId + ' — ' + unit.UnitName,
    });

    var subject = '📝 Corrections needed — ' + unit.UnitName;
    var body    = _buildCorrectionsEmail(student, unit, comments, parentName, resubmitUrl);
    try {
      GmailApp.sendEmail(student.StudentEmail, subject, _stripHtml(body), {
        htmlBody: body,
        cc:       student.ParentEmail,
        name:     CONFIG.PORTAL_NAME,
        replyTo:  CONFIG.ADMIN_EMAIL,
      });
      _logEmail(ss, 'corrections', studentId, unitId, student.StudentEmail, subject, 'sent');
    } catch(err) {
      _logEmail(ss, 'corrections', studentId, unitId, student.StudentEmail, subject, 'error: ' + err);
    }
  }
}
