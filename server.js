const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// POST endpoint for submissions
app.post('/submit-audit', (req, res) => {
  const submissions = req.body; // array of {auditType, questionNumber, questionText, response}

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const auditType = submissions[0].auditType;
  if (!auditType) return res.status(400).json({ error: 'Missing audit type' });

  // Sanitize audit type for filename
  const sanitizedType = auditType.replace(/\s+/g, '_');
  const csvFilePath = path.join(__dirname, `${sanitizedType}_responses.csv`);

  // Build horizontal row
  const row = { AuditType: auditType, Timestamp: new Date().toISOString() };
  submissions.forEach((q, i) => {
    row[`Q${i + 1}`] = q.response;
  });

  // Dynamic headers
  const headers = [
    { id: 'AuditType', title: 'AuditType' },
    { id: 'Timestamp', title: 'Timestamp' },
  ];
  submissions.forEach((q, i) => headers.push({ id: `Q${i + 1}`, title: `Q${i + 1}` }));

  const fileExists = fs.existsSync(csvFilePath);

  // Write CSV
  const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: headers,
    append: fileExists
  });

  csvWriter.writeRecords([row])
    .then(() => res.json({ success: true, file: `${sanitizedType}_responses.csv` }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to save submission' });
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
