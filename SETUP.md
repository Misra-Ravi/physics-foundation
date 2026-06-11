# IB Physics Portal — Setup Guide

Complete these steps once, in order. Total time: ~45 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Name it **IB Physics — Portal Tracker**
3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

---

## Step 2 — Create Google Form A: Homework Submission

1. Go to [forms.google.com](https://forms.google.com) → Blank form
2. Title: **IB Physics — Homework Submission**
3. Add these questions **exactly** (the Apps Script matches on question title):

| Question title | Type | Required |
|---|---|---|
| Your name | Dropdown (list all student names) | Yes |
| Unit completed | Dropdown (e.g. "1.1.01 — Distance & Displacement") | Yes |
| Homework photo or PDF | File upload | Yes |
| Confirmation | Checkbox — "I completed the lesson and classwork" | Yes |
| Anything difficult? | Paragraph | No |

4. Settings → Responses → check **Collect email addresses**
5. Copy the Form ID from the URL:
   `https://docs.google.com/forms/d/**FORM_ID**/edit`

---

## Step 3 — Create Google Form B: Parent Approval

1. New blank form
2. Title: **IB Physics — Parent Homework Review**
3. Add these questions **exactly**:

| Question title | Type | Notes |
|---|---|---|
| studentId | Short answer | Hidden — pre-filled by script |
| unitId | Short answer | Hidden — pre-filled by script |
| token | Short answer | Hidden — pre-filled by script |
| studentName | Short answer | Hidden — pre-filled by script |
| unitName | Short answer | Hidden — pre-filled by script |
| Your decision | Multiple choice | Option 1: `Homework is complete — approve and unlock next chapter`  Option 2: `Needs corrections — send back to student` |
| Comments for your child | Paragraph | Required if corrections |
| Your name | Short answer | Yes |

4. Copy the Form ID from the URL

---

## Step 4 — Create Drive Folders

1. In Google Drive, create:
   - 📁 **IB Physics Portal** (root)
     - 📁 **Student Submissions** (Apps Script saves uploads here)
     - 📁 **Answer Keys** (you upload PDF answer keys here — do NOT share with students)

2. Copy the folder IDs from each folder's URL:
   `https://drive.google.com/drive/folders/**FOLDER_ID**`

---

## Step 5 — Set up Apps Script

1. In your Portal Tracker sheet → **Extensions → Apps Script**
2. Delete the default `Code.gs` file
3. Create 7 new script files and paste the contents of each `.gs` file from the `apps-script/` folder in this repo:

| File | Apps Script filename |
|---|---|
| `00_Config.gs` | `00_Config` |
| `01_Setup.gs` | `01_Setup` |
| `02_DataHelpers.gs` | `02_DataHelpers` |
| `03_HomeworkTrigger.gs` | `03_HomeworkTrigger` |
| `04_ApprovalTrigger.gs` | `04_ApprovalTrigger` |
| `05_EmailTemplates.gs` | `05_EmailTemplates` |
| `06_Dashboard.gs` | `06_Dashboard` |

4. Open `00_Config` and fill in all the IDs you collected in Steps 1–4:

```javascript
SHEET_ID:               'paste Sheet ID here',
HOMEWORK_FORM_ID:       'paste Form A ID here',
APPROVAL_FORM_ID:       'paste Form B ID here',
SUBMISSIONS_FOLDER_ID:  'paste Submissions folder ID here',
ANSWER_KEYS_FOLDER_ID:  'paste Answer Keys folder ID here',
```

5. **Run setup functions** (run each once, in order):
   - Select function `setupPortal` → Run → Grant permissions
   - Select function `seedProgress` → Run

   This creates all sheet tabs, headers, unit rows, and initial progress rows.

6. **Install form triggers**:
   - Click the clock icon (Triggers) → Add Trigger
   - Function: `onHomeworkSubmit` | Event source: From spreadsheet | Event type: **On form submit** → select Form A
   - Add another trigger: `onParentApproval` | On form submit → select Form B

7. **Deploy the dashboard**:
   - Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **User accessing the web app**
   - Who has access: **Anyone with a Google Account**
   - Click Deploy → copy the Web App URL

   This URL is what students bookmark. Share it with students and parents.

---

## Step 6 — Add Answer Keys to Drive

For each unit you want to test end-to-end:

1. Upload the answer key PDF to the **Answer Keys** folder
2. Copy the file's Drive ID from its URL
3. In the Portal Tracker sheet → **Units** tab → find the unit row → paste the ID in the `AnswerKeyDriveID` column

---

## Step 7 — Replace Sample Students

1. In the Portal Tracker sheet → **Roster** tab
2. Replace the two sample rows with your real students
3. Re-run `seedProgress()` from Apps Script to regenerate progress rows

---

## Step 8 — Test End-to-End

1. Log in as one of the sample students (use their Google account)
2. Open the Web App URL — you should see the dashboard with Unit 0.1.01 available
3. Click Lesson → Classwork links to verify they open
4. Submit the Homework form
5. Check that the parent email arrives (with answer key attached)
6. Click the approval link → approve
7. Verify the next unit unlocks in the dashboard

---

## Ongoing Maintenance

| Task | How |
|---|---|
| Add a new student | Add row to Roster sheet, run `seedProgress()` |
| Add units for a new topic | Push HTML files to GitHub, add rows to Units sheet |
| Add an answer key | Upload PDF to Drive, paste file ID in Units sheet |
| Check email logs | EmailLog tab in Portal Tracker sheet |
| Student portal URL | The Web App URL from Step 5 |
