// ─── TRIGGER A: HOMEWORK SUBMISSION ───────────────────────────────────────────
// Bound to Form A (Homework Submission) as an installable onFormSubmit trigger.
// Install via: Triggers → Add Trigger → onHomeworkSubmit → Form submit

function onHomeworkSubmit(e) {
  var ss  = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  var row = e.namedValues;

  var studentName = _firstVal(row['Your name']);
  var unitLabel   = _firstVal(row['Unit completed']);          // e.g. "1.1.01 — Distance & Displacement"
  var fileUrls    = row['Homework photo or PDF'] || [];        // file upload returns array
  var notes       = _firstVal(row['Anything difficult?']) || '';

  // Parse UnitID from the dropdown label "1.1.01 — ..."
  var unitId = unitLabel ? unitLabel.split(' — ')[0].trim() : '';

  var student = _lookupStudentByName(ss, studentName);
  var unit    = _lookupUnit(ss, unitId);

  if (!student || !unit) {
    _alertAdmin('onHomeworkSubmit: unknown student "' + studentName + '" or unit "' + unitId + '"');
    return;
  }

  // Only accept if status is available/in_progress/corrections
  var prog = _getProgress(ss, student.StudentID, unitId);
  var allowedStatuses = ['available','in_progress','corrections'];
  if (prog && allowedStatuses.indexOf(prog.Status) === -1) {
    Logger.log('Duplicate submission ignored for ' + student.StudentID + ' / ' + unitId);
    return;
  }

  var fileUrl = fileUrls.length > 0 ? fileUrls[0] : '';
  var token   = Utilities.getUuid();

  // Update progress
  _updateProgress(ss, student.StudentID, unitId, {
    Status:              'awaiting_review',
    HomeworkSubmittedAt: new Date(),
    HomeworkDriveURL:    fileUrl,
    SubmissionToken:     token,
  });

  // Build pre-filled parent approval URL
  var approvalUrl = _buildPrefilledFormUrl(CONFIG.APPROVAL_FORM_ID, {
    'studentId':   student.StudentID,
    'unitId':      unitId,
    'token':       token,
    'studentName': student.StudentName,
    'unitName':    unit.UnitName,
  });

  // Fetch answer key from Drive if it exists
  var attachments = [];
  if (unit.AnswerKeyDriveID) {
    try {
      var keyBlob = DriveApp.getFileById(unit.AnswerKeyDriveID)
        .getBlob()
        .setName('AnswerKey_' + unit.UnitName.replace(/[^a-zA-Z0-9]/g,'_') + '.pdf');
      attachments.push(keyBlob);
    } catch(err) {
      Logger.log('Answer key not found for ' + unitId + ': ' + err);
    }
  }

  // Email parent
  var subject = '[IB Physics] ' + student.StudentName + ' submitted homework — ' + unit.UnitName;
  var body    = _buildParentNotificationEmail(student, unit, fileUrl, approvalUrl, notes);
  try {
    GmailApp.sendEmail(student.ParentEmail, subject, _stripHtml(body), {
      htmlBody:    body,
      attachments: attachments,
      name:        CONFIG.PORTAL_NAME,
      replyTo:     CONFIG.ADMIN_EMAIL,
    });
    _logEmail(ss, 'homework_notification', student.StudentID, unitId, student.ParentEmail, subject, 'sent');
  } catch(err) {
    _logEmail(ss, 'homework_notification', student.StudentID, unitId, student.ParentEmail, subject, 'error: ' + err);
    _alertAdmin('Failed to email parent for ' + student.StudentName + ' / ' + unitId + ': ' + err);
  }
}

function _firstVal(arr) {
  return (arr && arr.length > 0) ? arr[0] : '';
}

function _alertAdmin(msg) {
  Logger.log('ALERT: ' + msg);
  GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, '[IB Physics Portal] Error', msg, { name: CONFIG.PORTAL_NAME });
}
