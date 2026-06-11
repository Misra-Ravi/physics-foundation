# IB Physics Portal — Manual Test Plan

**Purpose:** Step-by-step tests to run before going live with real students.
No coding knowledge required. Everything is verified through a browser, email inbox, and the Portal Tracker Google Sheet.

**Before you start:** Have these five things open in separate browser tabs:

| Tab | What to open |
|-----|-------------|
| A | Portal Tracker Google Sheet (the one created by BOOTSTRAP.gs) |
| B | The Web App URL (your student dashboard) |
| C | Gmail (your admin email: misra.ravikant@gmail.com) |
| D | A test student inbox (e.g. alice.chen.student@gmail.com) |
| E | A test parent inbox (e.g. parent.chen@gmail.com) |

**Sample data used throughout these tests:**
- Student: **Alice Chen** / `alice.chen.student@gmail.com`
- Parent: `parent.chen@gmail.com`
- First unit: **0.1.01 — Significant Figures**

---

## TEST 1 — STUDENT LOGIN

### 1.1 Portal loads and prompts for Google login

| Field | Detail |
|-------|--------|
| **What** | Unauthenticated visit redirects to Google sign-in |
| **How** | Open the Web App URL in a private/incognito window (no Google account signed in) |
| **Expected result** | Google's "Sign in with Google" page appears before any portal content is shown |
| **How to verify** | The URL in the address bar should be `accounts.google.com` before you see portal content |
| **Common failure** | If the dashboard appears without login: the Web App was deployed with "Anyone" access instead of "Anyone with a Google Account" — re-deploy and set access correctly |

---

### 1.2 Enrolled student sees their dashboard

| Field | Detail |
|-------|--------|
| **What** | Alice signs in and sees her personalised dashboard |
| **How** | In the same private window, sign in with `alice.chen.student@gmail.com` |
| **Expected result** | Page title reads "IB Physics Portal — Alice Chen"; the header shows "Alice Chen" |
| **How to verify** | Check the browser tab title and the `<h1>` heading in the page |
| **Common failure** | Name not shown, or "Not Enrolled" appears — check the Roster sheet: confirm row 2 has `alice.chen.student@gmail.com` in column C (StudentEmail) and `TRUE` in column G (Active). Capitalisation and spaces must match exactly. |

---

### 1.3 First unit is Ready; all others are Locked

| Field | Detail |
|-------|--------|
| **What** | Dashboard shows unit 0.1.01 as Ready (📖) and every other unit as Locked (🔒) |
| **How** | Scroll through Alice's dashboard after login |
| **Expected result** | The very first card (0.1 Background Math — Significant Figures) shows the 📖 icon and the label "Ready". Every other card shows the 🔒 icon and is visually faded |
| **How to verify** | Count: only one unit should have active links (Lesson / Classwork / Homework / Submit buttons). All others should show no links |
| **Common failure** | All units show Locked including the first — open the Progress sheet in Tab A, find Alice's row for unit `0.1.01`, check that column D (Status) reads `available`. If it reads `locked`, run `_seedProgress()` manually from Apps Script |

---

## TEST 2 — STUDENT NAVIGATION

### 2.1 Lesson, Classwork, and Homework links open correct GitHub Pages URLs

| Field | Detail |
|-------|--------|
| **What** | Each link on the dashboard card opens the right page on GitHub Pages |
| **How** | On Alice's dashboard, click each button for unit 0.1.01 in turn: 📖 Lesson, ✏️ Classwork, 📝 Homework |
| **Expected result** | Each opens a new tab at a URL beginning with `https://misra-ravi.github.io/physics-foundation/t0-appendix/s0.1-background-math/u01/` followed by `lesson.html`, `classwork.html`, or `homework.html` respectively |
| **How to verify** | Check the URL in the new tab against the Units sheet (columns J, K, L for that unit row) |
| **Common failure** | 404 error on GitHub Pages — the file may not be published yet. Verify the file exists at that path in the GitHub repository. This is a content issue, not a portal issue. |

---

### 2.2 Homework page hides the answer key for students

| Field | Detail |
|-------|--------|
| **What** | Opening `homework.html` without a query parameter shows NO answer key |
| **How** | Click the 📝 Homework link for unit 0.1.01. Inspect the page. Then also try View Source (Ctrl+U / Cmd+U) |
| **Expected result** | The answer key section is not visible on screen. The HTML source may contain the answer key inside a CSS-hidden element, but it must not be readable without inspecting the source |
| **How to verify** | The word "answer" or "key" should not appear as visible text on the page. In View Source the section should have a CSS class that hides it (e.g. `display:none`) |
| **Common failure** | Answer key is visible — the homework.html template is not checking for the `?key=show` parameter. Check the JavaScript at the top of `homework.html` |

---

### 2.3 Back to Site link returns to stories.html

| Field | Detail |
|-------|--------|
| **What** | The "← Back to Site" link in the dashboard header goes to the right page |
| **How** | Click the "← Back to Site" link in the top-left of the dashboard |
| **Expected result** | Browser navigates to `https://misra-ravi.github.io/physics-foundation/stories.html` or `index.html` |
| **How to verify** | Check the URL after clicking. Should not give a 404 |
| **Common failure** | Link goes to `index.html` of the Apps Script web app instead of the GitHub Pages site — check the `<a href="">` in the `doGet()` function: it should point to `https://misra-ravi.github.io/physics-foundation/` |

---

### 2.4 Story navigation works across all 11 stories

| Field | Detail |
|-------|--------|
| **What** | Prev/Next buttons on story pages cycle through all 11 stories; "All Stories" returns to stories.html |
| **How** | Open `https://misra-ravi.github.io/physics-foundation/stories.html` directly. Click each story, then use the Prev/Next arrows to step through all 11. Click "All Stories" from any story page. |
| **Expected result** | 11 story pages are accessible (00-introduction through 10-satyendra-bose). Prev on the first story is disabled or absent. Next on the last story is disabled or absent. "All Stories" returns to `stories.html`. |
| **How to verify** | The story filenames are: `00-introduction.html`, `01-galileo.html`, `02-newton.html`, `03-faraday.html`, `04-light-wave-particle.html`, `05-marie-pierre-curie.html`, `06-einstein-relativity.html`, `07-einstein-chauffeur.html`, `08-schrodinger.html`, `09-lise-meitner.html`, `10-satyendra-bose.html`. Confirm each loads without error. |
| **Common failure** | Prev/Next links point to wrong filenames — check the `href` values in each story file's navigation buttons. They must match the actual filenames exactly (including hyphens). |

---

## TEST 3 — HOMEWORK SUBMISSION FLOW

### 3.1 Student submits homework via the form

| Field | Detail |
|-------|--------|
| **What** | Alice uses the Submit button to open and complete the Homework Submission form |
| **How** | On Alice's dashboard, click 📤 Submit for unit 0.1.01. The form opens in a new tab. Fill in: **Your name** = Alice Chen, **Unit completed** = 0.1.01 — Significant Figures, **Paste a link** = any Google Drive URL (use a test document), tick the confirmation checkbox. Click Submit. |
| **Expected result** | Form submits with a "Your response has been recorded" confirmation message |
| **How to verify** | Open the Progress sheet (Tab A). Find Alice's row for unit `0.1.01`. Column D (Status) should now read `awaiting_review`. Column G (HomeworkDriveURL) should contain the link you pasted. Column H (SubmissionToken) should contain a UUID (looks like `a3f2...`). |
| **Common failure** | Form does not submit or shows an error — check that Form A (Homework Submission) is still published and linked to the sheet. Go to Apps Script → Triggers and confirm `onHomeworkSubmit` is active. |

---

### 3.2 Dashboard updates to "Awaiting Parent Review"

| Field | Detail |
|-------|--------|
| **What** | Alice's dashboard reflects the new status without needing to re-log-in |
| **How** | After form submission, reload Alice's dashboard (refresh the page in Tab B) |
| **Expected result** | Unit 0.1.01 now shows the 🟡 icon and the label "Awaiting Review". The Lesson / Classwork / Homework / Submit buttons disappear (status is no longer available/corrections) |
| **How to verify** | Progress sheet: column D for `s001_0.1.01` = `awaiting_review` |
| **Common failure** | Dashboard still shows "Ready" after refresh — the trigger `onHomeworkSubmit` may not have fired. Go to Apps Script → Executions log to see if it ran. Check for errors. |

---

### 3.3 Parent receives notification email within 2 minutes

| Field | Detail |
|-------|--------|
| **What** | An email arrives in the parent inbox after homework is submitted |
| **How** | After Alice submits, wait up to 2 minutes, then check `parent.chen@gmail.com` inbox |
| **Expected result** | Email arrives with subject: `[IB Physics] Alice Chen submitted homework — Significant Figures`. Body contains: (a) "Alice Chen" in the subject line, (b) a blue "View Alice Chen's Homework →" button linking to the Drive file, (c) a "🔑 View Answer Key →" button linking to `homework.html?key=show`, (d) a green "✅ Approve & Unlock Next Chapter" button, (e) a red "❌ Request Corrections" button |
| **How to verify** | Open each button link in the email to confirm the URLs are correct. Check EmailLog sheet — a new row should show Type=`homework_notification`, Recipient=`parent.chen@gmail.com`, Status=`sent` |
| **Common failure** | Email does not arrive — check EmailLog for a row with Status starting `error:`. Common causes: GmailApp quota exceeded (100 emails/day on free accounts), or the ParentEmail cell in the Roster sheet is blank. |

---

## TEST 4 — ANSWER KEY VISIBILITY

### 4.1 Student URL shows no answer key

| Field | Detail |
|-------|--------|
| **What** | `homework.html` without `?key=show` hides the answer key section |
| **How** | Open `[BASE_URL]/t0-appendix/s0.1-background-math/u01/homework.html` directly in a browser |
| **Expected result** | Page loads, homework questions are visible, but the answer key section is completely hidden — not just invisible, but not rendered as readable text on screen |
| **How to verify** | Use browser Find (Ctrl+F / Cmd+F) to search for "answer key". It should not appear as visible text. Right-click → View Page Source to confirm the section exists in the HTML but is hidden via CSS |
| **Common failure** | Answer key is visible — the JavaScript in `homework.html` that reads `window.location.search` is not running. Check the browser console for JavaScript errors. |

---

### 4.2 Parent URL shows answer key

| Field | Detail |
|-------|--------|
| **What** | Adding `?key=show` reveals the answer key |
| **How** | Open the same URL but with `?key=show` appended: `.../u01/homework.html?key=show` |
| **Expected result** | The answer key section is now clearly visible on the page, showing the expected answers |
| **How to verify** | The answer key heading and content are readable without inspecting source code |
| **Common failure** | Answer key still hidden even with `?key=show` — the JavaScript parameter check may be looking for a different query string format. Inspect `homework.html` source and check the exact parameter name being tested. |

---

## TEST 5 — PARENT APPROVAL FLOW

### 5.1 Approve button opens pre-filled form

| Field | Detail |
|-------|--------|
| **What** | The Approve button in the parent email opens Form B with all fields pre-filled |
| **How** | In the parent email (Tab E), click "✅ Approve & Unlock Next Chapter" |
| **Expected result** | Form B (Parent Homework Review) opens in a new tab. The following hidden fields are already filled: `studentId` = `s001`, `unitId` = `0.1.01`, `token` = (UUID from the Progress sheet), `studentName` = `Alice Chen`, `unitName` = `Significant Figures` |
| **How to verify** | Scroll through the form and check these text fields are pre-populated. Compare the token value to what is in the Progress sheet column H. |
| **Common failure** | Form opens but fields are blank — the pre-filled URL was not constructed correctly. Check that Form B's question titles match exactly: `studentId`, `unitId`, `token`, `studentName`, `unitName` (case-sensitive). |

---

### 5.2 Parent approves and next unit unlocks

| Field | Detail |
|-------|--------|
| **What** | Submitting the approval form triggers the unlock sequence |
| **How** | On Form B: select "Homework is complete — approve and unlock next chapter", enter a parent name (e.g. "Mr & Mrs Chen"), and click Submit |
| **Expected result** | Form submits successfully. Within 2 minutes: (1) Progress sheet row for `s001_0.1.01` has Status=`complete`, ParentDecision=`approved`. (2) Progress sheet row for `s001_0.1.02` has Status=`available`. (3) Alice receives an email with subject "✅ Approved! Your next chapter is ready — Calculating Significant Figures". (4) Parent is CC'd on that email. |
| **How to verify** | Progress sheet: check both unit rows. Student inbox (Tab D): approval email received. Parent inbox (Tab E): same email in CC. |
| **Common failure** | Status stays `awaiting_review` — the trigger `onParentApproval` may not have fired. Check Apps Script → Executions. Also check that the token in the submitted form matches the token in the Progress sheet — a mismatch causes silent rejection. |

---

### 5.3 Dashboard shows complete and next unit ready

| Field | Detail |
|-------|--------|
| **What** | Alice's dashboard reflects the approval result |
| **How** | Reload Alice's dashboard (Tab B) |
| **Expected result** | Unit 0.1.01 shows ✅ "Complete". Unit 0.1.02 (Calculating Significant Figures) shows 📖 "Ready" with Lesson / Classwork / Homework / Submit buttons. All other units remain 🔒 Locked. |
| **How to verify** | Count the number of active (non-faded) cards — there should now be exactly 2: one Complete and one Ready. |
| **Common failure** | Both units show as Locked — the `_nextUnit()` function may have returned null (e.g. if unit ordering in the Units sheet is incorrect). Check that `UnitOrder` column B in the Units sheet is a sequential integer for each row. |

---

### 5.4 Student unlock email contains the lesson link

| Field | Detail |
|-------|--------|
| **What** | The approval email gives Alice a direct link to start the next lesson |
| **How** | Open the approval email in Alice's inbox |
| **Expected result** | Email contains a blue "Start Calculating Significant Figures →" button. The link behind the button matches the `LessonURL` for unit 0.1.02 in the Units sheet. |
| **How to verify** | Hover over (or copy) the button link and compare to the Units sheet column J for row `0.1.02`. |
| **Common failure** | Link goes to a 404 — the LessonURL for unit 0.1.02 may be blank in the Units sheet (it was seeded as a full unit, so it should have a URL). Check column J of the Units sheet. |

---

## TEST 6 — PARENT CORRECTIONS FLOW

**Setup:** To test corrections, you need Alice's unit 0.1.02 to be in `awaiting_review` state. Repeat Test 3.1 for unit 0.1.02 before running these tests.

### 6.1 Request Corrections button opens pre-filled form

| Field | Detail |
|-------|--------|
| **What** | The red Corrections button in the parent email opens Form B pre-filled |
| **How** | In the new parent notification email for unit 0.1.02, click "❌ Request Corrections" |
| **Expected result** | Form B opens with the same pre-filled fields as in Test 5.1 (studentId, unitId, token, studentName, unitName all populated) |
| **How to verify** | Same as Test 5.1 — confirm the form fields match the Progress sheet values |
| **Common failure** | Both the Approve and Corrections buttons in the email currently link to the same `approvalUrl`. The parent's actual decision (approve vs. corrections) is set by which radio button they select on the form. If only one URL appears in the email, this is by design — the decision is made on the form, not the link. |

---

### 6.2 Parent submits corrections with feedback

| Field | Detail |
|-------|--------|
| **What** | Parent selects corrections and adds a comment |
| **How** | On Form B: select "Needs corrections — send back to student", type a comment such as "Question 3 answer is wrong — recheck your rounding", enter parent name, submit |
| **Expected result** | Within 2 minutes: (1) Progress sheet for `s001_0.1.02` shows Status=`corrections`, ParentDecision=`corrections`, ParentComments=`Question 3 answer is wrong — recheck your rounding`. (2) Unit 0.1.03 still shows Status=`locked`. |
| **How to verify** | Progress sheet: check columns D, J, K for the unit 0.1.02 row. |
| **Common failure** | Status became `complete` instead of `corrections` — the decision text matching uses `.indexOf('approve')`. If the corrections choice label contains the word "approve", it will match incorrectly. Check that the radio button label for the corrections option does NOT contain the word "approve". |

---

### 6.3 Student receives corrections email with comment and resubmit link

| Field | Detail |
|-------|--------|
| **What** | Alice receives an email with the parent's feedback and a pre-filled resubmit link |
| **How** | Check Alice's inbox (Tab D) |
| **Expected result** | Email subject: "📝 Corrections needed — Calculating Significant Figures". Body contains: the parent's exact comment ("Question 3 answer is wrong — recheck your rounding"), a blue "📤 Resubmit Homework →" button. Parent is CC'd on this email. |
| **How to verify** | Open the Resubmit link — it should open Form A (Homework Submission) with "Your name" already set to "Alice Chen" and "Unit completed" already set to "0.1.02 — Calculating Significant Figures". |
| **Common failure** | Parent comment does not appear in the email — check that the `Comments for your child` question in Form B was filled in before submitting. An empty comment field will result in a generic fallback message in the email. |

---

### 6.4 Dashboard shows Corrections Required with parent comment

| Field | Detail |
|-------|--------|
| **What** | Alice's dashboard shows the unit in the corrections state with the comment visible |
| **How** | Reload Alice's dashboard |
| **Expected result** | Unit 0.1.02 shows ❌ "Corrections Required". Below the unit name, a yellow/orange feedback box shows the parent's comment: "Question 3 answer is wrong — recheck your rounding". Unit 0.1.03 remains 🔒 Locked. |
| **How to verify** | The feedback box (class `fb` in the HTML) should be visible directly on the card — no click needed to reveal it. |
| **Common failure** | Comment box does not appear — check the Progress sheet column K (ParentComments) for that row. If it is empty, the HTML template correctly omits the feedback box. Confirm the parent actually typed a comment before submitting Form B. |

---

## TEST 7 — RESUBMISSION FLOW

### 7.1 Student resubmits using the link from the corrections email

| Field | Detail |
|-------|--------|
| **What** | Resubmission is accepted when unit status is "corrections" |
| **How** | Click the "📤 Resubmit Homework →" button in the corrections email. The form opens pre-filled. Paste a new (or the same) Drive link. Submit. |
| **Expected result** | Form submits successfully. Progress sheet: Status for `s001_0.1.02` changes back to `awaiting_review`. A new token is generated (column H value changes). A new parent notification email is sent. |
| **How to verify** | Compare the SubmissionToken in column H before and after resubmission — it must be different (a new UUID). Parent inbox should receive a new email. |
| **Common failure** | Form submits but status does not change — check `onHomeworkSubmit`. The guard condition blocks resubmission if status is `awaiting_review` or `complete`. The `corrections` status is intentionally allowed. If it does not update, check Apps Script → Executions for errors. |

---

### 7.2 New parent notification email sent after resubmission

| Field | Detail |
|-------|--------|
| **What** | Parent gets a fresh notification with new Approve/Corrections links tied to the new token |
| **How** | Check parent inbox after Alice resubmits |
| **Expected result** | A new email arrives for unit 0.1.02. The Approve/Corrections links contain the new token. The old email's links are now invalid (will be rejected silently due to token mismatch). |
| **How to verify** | Click the Approve link from the OLD email — it should silently do nothing (admin error email may arrive). Click the Approve link from the NEW email — it should work as in Test 5.2. |
| **Common failure** | Both old and new tokens work — the token check in `onParentApproval` requires an exact match between the submitted token and the SubmissionToken in the Progress sheet. If both work, the token in the sheet was not updated on resubmission. |

---

## TEST 8 — SECURITY CHECKS

### 8.1 Unenrolled email sees "Not Enrolled" page

| Field | Detail |
|-------|--------|
| **What** | A Google account not in the Roster cannot access the dashboard |
| **How** | Open the Web App URL in a private window and sign in with a Google account that is NOT in the Roster sheet (e.g. your personal admin email or a throwaway account) |
| **Expected result** | A white card appears with heading "Not Enrolled", showing the email address and a contact link |
| **How to verify** | The page must not show any unit cards or student data |
| **Common failure** | Unenrolled user sees another student's dashboard — the `_studentByEmail()` function is matching on partial email. Check that the comparison uses `===` (exact match), not `indexOf()`. |

---

### 8.2 Approval form with wrong token is rejected silently

| Field | Detail |
|-------|--------|
| **What** | Submitting Form B with a tampered or outdated token does nothing |
| **How** | Manually open Form B and fill it in with a made-up token value (e.g. change one character of a real token). Select "Approve" and submit. |
| **Expected result** | The form appears to submit normally (no visible error), but: the Progress sheet is NOT updated, and the admin email (`misra.ravikant@gmail.com`) receives an alert about the invalid token. |
| **How to verify** | Check Progress sheet — status should be unchanged. Check admin inbox for a "[IB Physics Portal] Error" email about the invalid token. |
| **Common failure** | The status changes anyway — the token check `prog.SubmissionToken !== token` is not running. Check `onParentApproval` in Apps Script for the token comparison line. |

---

### 8.3 Duplicate approval is ignored silently

| Field | Detail |
|-------|--------|
| **What** | Clicking the Approve button twice does not reset the Progress status |
| **How** | After approving a unit (Test 5.2), go back to the parent email and click Approve again. Submit the form again. |
| **Expected result** | Form appears to submit. No change to the Progress sheet. No new email sent to student. |
| **How to verify** | Check the Progress sheet — the Status column should still say `complete`. The UnlockedAt timestamp should not change. The EmailLog should not have a second `approval` row for the same unit. |
| **Common failure** | A second approval email is sent — the guard `if (prog.Status === 'complete') { return; }` is not being reached. Check that `_prog()` is correctly finding the row by ProgressID (`studentId_unitId` format). |

---

### 8.4 Student cannot access answer key without parameter

| Field | Detail |
|-------|--------|
| **What** | Browsing to `homework.html` directly never exposes the answer key |
| **How** | Sign in as Alice. Click the Homework link for a unit. Try adding random parameters: `?show=key`, `?answers=true`, `?key=yes`. Check each one. |
| **Expected result** | Only `?key=show` reveals the answer key. All other parameter combinations keep it hidden. |
| **How to verify** | Check the JavaScript in `homework.html` — the exact string `key=show` (or the condition `params.get('key') === 'show'`) should be the only accepted value. |
| **Common failure** | `?key=anything` works — the check may be testing only `params.has('key')` rather than checking the value equals `'show'`. |

---

## TEST 9 — AUTO-ENROL NEW STUDENT

### 9.1 Adding a student row auto-creates progress rows

| Field | Detail |
|-------|--------|
| **What** | A new student added to the Roster sheet gets Progress rows immediately without running any script |
| **How** | Open the Portal Tracker (Tab A). Go to the Roster sheet. In row 4 (first empty row after the two sample students), type: `s003` (A4), `Charlie Ng` (B4), `charlie.ng.student@gmail.com` (C4), `parent.ng@gmail.com` (D4), `Mrs Ng` (E4), today's date (F4), then in G4 type `TRUE`. Press Enter. |
| **Expected result** | Within 10–20 seconds, the Progress sheet gains approximately 130 new rows for student `s003`. The first row has Status=`available`; all others have Status=`locked`. |
| **How to verify** | Go to the Progress sheet and filter column B (StudentID) by `s003`. Count the rows — should equal the total number of rows in the Units sheet (row 2 onwards). Check that the very first row has `available` in column D. |
| **Common failure** | No rows appear after 30 seconds — the `onRosterEdit` trigger is not firing. Go to Apps Script → Triggers and confirm it exists. Note: the trigger fires on any spreadsheet edit, so it relies on the edit happening in the Roster sheet with Active=TRUE. If you typed `true` (lowercase), it may not match — Google Sheets checkbox cells return boolean `true`; text cells return the string `"TRUE"`. Use a checkbox (Insert → Checkbox) for column G, or type `TRUE` in all caps. |

---

### 9.2 New student can log in and see their dashboard

| Field | Detail |
|-------|--------|
| **What** | Charlie can access the portal after being auto-enrolled |
| **How** | Open the Web App URL in a private window. Sign in as `charlie.ng.student@gmail.com`. |
| **Expected result** | Dashboard loads with "Charlie Ng" in the header. First unit (0.1.01) shows 📖 Ready. All others show 🔒 Locked. |
| **How to verify** | Same checks as Tests 1.2 and 1.3 |
| **Common failure** | "Not Enrolled" page — confirm `charlie.ng.student@gmail.com` in the Roster sheet column C matches the Google account email exactly (no extra spaces, correct capitalisation). |

---

## TEST 10 — EMAIL LOG AUDIT

### 10.1 Every email appears in the EmailLog sheet

| Field | Detail |
|-------|--------|
| **What** | The EmailLog sheet records every outbound email |
| **How** | After running Tests 3, 5, 6, and 7, open the EmailLog sheet in the Portal Tracker |
| **Expected result** | The sheet should contain at least these rows (one per email sent): `homework_notification` (parent notified of submission), `approval` (student notified of approval), `corrections` (student notified of corrections needed), and a second `homework_notification` (parent notified of resubmission) |
| **How to verify** | Each row must have all 7 columns filled: Timestamp, Type, StudentID, UnitID, Recipient, Subject, Status. Status should read `sent` for successful emails. |
| **Common failure** | Some emails were sent but no log row appeared — the `_logEmail()` call may have been skipped due to an exception before it was reached. Check Apps Script → Executions for that trigger run to see where it stopped. |

---

### 10.2 EmailLog columns are correct and complete

| Field | Detail |
|-------|--------|
| **What** | The EmailLog sheet has the correct column headers in the right order |
| **How** | Open the EmailLog sheet and look at row 1 |
| **Expected result** | Exactly 7 columns, in this order: `Timestamp`, `Type`, `StudentID`, `UnitID`, `Recipient`, `Subject`, `Status` |
| **How to verify** | Count the columns and compare to the header row. The Timestamp column (A) should contain Google Sheets date-time values, not plain text. |
| **Common failure** | Column headers are missing or in a different order — this would only happen if the `_setupEmailLog()` function was not run (or ran before `_setupRoster()`). Re-run `bootstrapPortal()` if the sheet was set up incorrectly. Note: re-running will delete and recreate the sheet tabs. |

---

### 10.3 Failed emails show error status

| Field | Detail |
|-------|--------|
| **What** | When an email fails to send, the EmailLog records the error reason |
| **How** | To simulate a failure: temporarily change a parent email address in the Roster sheet to an invalid value (e.g. `bad@@email`). Submit a homework form. Then restore the correct email. |
| **Expected result** | EmailLog gains a row where the Status column starts with `error:` followed by the error description (e.g. `error:Invalid email address`). The admin email also receives a "[IB Physics Portal] Error" alert. |
| **How to verify** | EmailLog: filter Status column for rows containing "error". Admin inbox: check for an error alert email. |
| **Common failure** | No error row appears at all — the `try/catch` block may not be logging before alerting. Check that `_logEmail(... 'error:'+err)` is called inside the catch block in `onHomeworkSubmit`. |

---

## Quick Reference — Sheet Tabs and What to Check

| Sheet Tab | What it stores | Key columns to check |
|-----------|---------------|---------------------|
| **Roster** | Enrolled students | C=StudentEmail, G=Active (must be TRUE) |
| **Units** | All 130 units | J=LessonURL, K=ClassworkURL, L=HomeworkURL, P=AnswerKeyDriveID |
| **Progress** | Per-student per-unit state | D=Status, G=HomeworkDriveURL, H=SubmissionToken, J=ParentDecision, K=ParentComments |
| **EmailLog** | Outbound email audit | G=Status (should be "sent" or "error:...") |

---

## Status Values Cheat Sheet

| Status value | What it means | Dashboard display |
|--------------|--------------|-------------------|
| `locked` | Not yet unlocked | 🔒 Locked (faded) |
| `available` | Ready to start | 📖 Ready (active links shown) |
| `in_progress` | Started, not submitted | ✏️ In Progress |
| `awaiting_review` | Submitted, waiting for parent | 🟡 Awaiting Review |
| `corrections` | Parent sent back for rework | ❌ Corrections Required (comment shown) |
| `complete` | Parent approved | ✅ Complete |

---

## Before Going Live — Final Checklist

- [ ] All 10 test sections above pass with sample students Alice Chen and Bob Patel
- [ ] A third student (e.g. Charlie Ng) auto-enrolled successfully via Roster edit
- [ ] Admin inbox received no unexpected error emails during testing
- [ ] EmailLog has no rows with Status starting `error:`
- [ ] Answer key is visible at `?key=show` and hidden without it
- [ ] All 11 story pages load without 404 errors
- [ ] Web App URL shared only with enrolled students (not posted publicly)
- [ ] Roster sheet has real student emails entered correctly before sharing the URL
- [ ] Parent emails in the Roster sheet are confirmed working (send a test email manually)
- [ ] Drive folders "Student Submissions" and "Answer Keys" are visible in your Google Drive
