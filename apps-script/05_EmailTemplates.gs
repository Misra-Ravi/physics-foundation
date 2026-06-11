// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────

var EMAIL_STYLE = '<style>' +
  'body{font-family:Nunito,Arial,sans-serif;background:#f8faff;margin:0;padding:0;}' +
  '.wrap{max-width:560px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}' +
  '.hdr{background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:white;padding:32px 36px;}' +
  '.hdr .label{font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.8;margin-bottom:6px;}' +
  '.hdr h1{font-size:1.4rem;font-weight:800;margin:0;}' +
  '.body{padding:32px 36px;color:#1a1a2e;font-size:0.95rem;line-height:1.7;}' +
  '.unit-badge{background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin:20px 0;font-weight:700;color:#1d4ed8;}' +
  '.btn{display:inline-block;padding:14px 28px;border-radius:10px;font-weight:800;font-size:0.95rem;text-decoration:none;margin:8px 6px 8px 0;}' +
  '.btn-green{background:#22c55e;color:white;}' +
  '.btn-red{background:#ef4444;color:white;}' +
  '.btn-blue{background:#1d4ed8;color:white;}' +
  '.note{font-size:0.82rem;color:#64748b;margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;}' +
  '.feedback-box{background:#fff7ed;border:2px solid #fed7aa;border-radius:10px;padding:16px 18px;margin:20px 0;color:#92400e;}' +
  '</style>';

// ── Parent notification (homework submitted) ──────────────────────────────────
function _buildParentNotificationEmail(student, unit, fileUrl, approvalUrl, notes) {
  var approveUrl  = approvalUrl + '&entry_decision=approve';
  var correctUrl  = approvalUrl + '&entry_decision=correct';

  // Pre-fill the decision into the URL using a marker the form can read,
  // but we also just send two separate links for simplicity
  var html = '<!DOCTYPE html><html><head>' + EMAIL_STYLE + '</head><body><div class="wrap">' +
    '<div class="hdr"><div class="label">IB Physics Portal</div>' +
    '<h1>' + student.StudentName + ' submitted homework</h1></div>' +
    '<div class="body">' +
    '<p>Dear ' + student.ParentName + ',</p>' +
    '<p>' + student.StudentName + ' has completed and submitted homework for:</p>' +
    '<div class="unit-badge">📖 ' + unit.SectionNum + ' ' + unit.SectionName + ' — ' + unit.UnitName + '</div>' +
    (fileUrl ? '<p><a href="' + fileUrl + '" class="btn btn-blue">View ' + student.StudentName + '\'s Homework →</a></p>' : '') +
    '<p>The answer key is attached to this email as a PDF. Please review ' + student.StudentName + '\'s work against it, then click one of the buttons below.</p>' +
    (notes ? '<div class="feedback-box"><strong>Note from ' + student.StudentName + ':</strong><br>' + notes + '</div>' : '') +
    '<p>' +
    '<a href="' + approvalUrl + '&prefill_Your+decision=Homework+is+complete+%E2%80%94+approve+and+unlock+next+chapter" class="btn btn-green">✅ Approve &amp; Unlock Next Chapter</a>' +
    '<a href="' + approvalUrl + '&prefill_Your+decision=Needs+corrections+%E2%80%94+send+back+to+student" class="btn btn-red">❌ Request Corrections</a>' +
    '</p>' +
    '<p class="note">These links open a short Google Form to record your decision. The form is pre-filled — you only need to add comments if requesting corrections.</p>' +
    '</div></div></body></html>';
  return html;
}

// ── Student approval email (chapter unlocked) ─────────────────────────────────
function _buildApprovalEmail(student, unit, nextUnit) {
  var nextLink = nextUnit && nextUnit.LessonURL
    ? '<p><a href="' + nextUnit.LessonURL + '" class="btn btn-blue">Start ' + nextUnit.UnitName + ' →</a></p>'
    : '<p>You have completed all available units — well done! 🎉</p>';

  return '<!DOCTYPE html><html><head>' + EMAIL_STYLE + '</head><body><div class="wrap">' +
    '<div class="hdr"><div class="label">IB Physics Portal</div><h1>Chapter Approved! ✅</h1></div>' +
    '<div class="body">' +
    '<p>Hi ' + student.StudentName + ',</p>' +
    '<p>Great work! Your parent approved your homework for:</p>' +
    '<div class="unit-badge">✅ ' + unit.UnitName + '</div>' +
    (nextUnit ? '<p>Your next chapter is now unlocked:</p>' +
    '<div class="unit-badge">🔓 ' + nextUnit.SectionNum + ' ' + nextUnit.SectionName + ' — ' + nextUnit.UnitName + '</div>' : '') +
    nextLink +
    '<p class="note">Keep up the great work! Your progress is tracked in the portal.</p>' +
    '</div></div></body></html>';
}

// ── Student corrections email ─────────────────────────────────────────────────
function _buildCorrectionsEmail(student, unit, comments, parentName, resubmitUrl) {
  return '<!DOCTYPE html><html><head>' + EMAIL_STYLE + '</head><body><div class="wrap">' +
    '<div class="hdr"><div class="label">IB Physics Portal</div><h1>Corrections Needed 📝</h1></div>' +
    '<div class="body">' +
    '<p>Hi ' + student.StudentName + ',</p>' +
    '<p>Your parent reviewed your homework for:</p>' +
    '<div class="unit-badge">📖 ' + unit.UnitName + '</div>' +
    '<p>' + (parentName || 'Your parent') + ' has some feedback for you:</p>' +
    '<div class="feedback-box">' + (comments || 'Please review and redo your homework.') + '</div>' +
    '<p>Once you have made the corrections, resubmit using the button below:</p>' +
    '<p><a href="' + resubmitUrl + '" class="btn btn-blue">📤 Resubmit Homework →</a></p>' +
    '<p class="note">Your next chapter will unlock once your parent approves your corrected work.</p>' +
    '</div></div></body></html>';
}

// ── Plain-text fallback ───────────────────────────────────────────────────────
function _stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
