// ✅ Questions and conditional logic
const auditQuestions = {
  "Canceled Label": [
    {
      id: "q1",
      text: "site?"
    },
    {
      id: "q2",
      text: "Pull Method?",
    },
    {
      id: "q3",
      text: "Label Type?"
    },
        {
      id: "q4",
      text: "Pallet ID?"
    },
        {
      id: "q5",
      text: "DPCI?  Format as 000-00-0000"
    },
        {
      id: "q6",
      text: "Location?"
    },
        {
      id: "q7",
      text: "How Many Labels?"
    },
        {
      id: "q8",
      text: "Problem Solver?"
    },
        {
      id: "q9",
      text: "if yes make another question tree?",
      condition: { questionId: "q8", value: "Yes" }
    },
        {
      id: "q10",
      text: "Point of Cause?"
    },
        {
      id: "q11",
      text: "PAR, PAD, or Other?",
      condition: { questionId: "q10", value: "Disassociation" }
    },
        {
      id: "q12",
      text: "Labeled in Location?",
      condition: { questionId: "q10", value: "VNP" }
    }
  ],
  "Dock": [
    {
      id: "q1",
      text: "Dock Area"
    },
    {
      id: "q2",
      text: "Receipt Method?",
      condition: { questionId: "q1", value: "Manual" }
    },
    {
      id: "q3",
      text: "Overage?",
    }
    ,
    {
      id: "q4",
      text: "Overage Message?",
      condition: { questionId: "q3", value: "No" }
    }
  ],
  "Bin Accuracy": [
    {
      id: "q1",
      text: "Label Type?"
    },
    {
      id: "q2",
      text: "Pull Method?",
      condition: { questionId: "q1", value: "No" }
    },
    {
      id: "q3",
      text: "Verification method?"
    }
  ],
  "Bin Cleansing": [
    {
      id: "q1",
      text: "Label Type?"
    },
    {
      id: "q2",
      text: "Pull Method?",
      condition: { questionId: "q1", value: "No" }
    },
    {
      id: "q3",
      text: "Verification method?"
    }
  ],
  "Consolidation": [
    {
      id: "q1",
      text: "Label Type?"
    },
    {
      id: "q2",
      text: "Pull Method?",
      condition: { questionId: "q1", value: "No" }
    },
    {
      id: "q3",
      text: "Verification method?"
    }
  ],
  "Overpack": [
    {
      id: "q1",
      text: "Label Type?"
    },
    {
      id: "q2",
      text: "Pull Method?",
      condition: { questionId: "q1", value: "No" }
    },
    {
      id: "q3",
      text: "Verification method?"
    }
  ]
};

const auditSelect = document.getElementById('auditType');
const formContainer = document.getElementById('formContainer');
const submitBtn = document.getElementById('submitBtn');

auditSelect.addEventListener('change', () => {
  formContainer.innerHTML = '';
  const type = auditSelect.value;
  if (!type) return;
  const questions = auditQuestions[type];
  if (!questions) return;

  questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.id = q.id;
    div.innerHTML = `
      <label class="form-label">${i + 1}. ${q.text}</label>
      <input type="text" class="form-control" id="${q.id}_input" placeholder="Enter your answer">
    `;
    if (q.condition) div.style.display = 'none';
    formContainer.appendChild(div);
  });

  // Conditional logic
  questions.forEach(q => {
    if (q.condition) {
      const triggerInput = document.getElementById(q.condition.questionId + "_input");
      triggerInput.addEventListener('input', () => {
        const targetDiv = document.getElementById(q.id);
        targetDiv.style.display = triggerInput.value.trim() === q.condition.value ? 'block' : 'none';
      });
    }
  });
});

// Submit button logic
submitBtn.addEventListener('click', () => {
  const auditType = auditSelect.value;
  if (!auditType) return alert('Please select an audit type.');

  const questions = auditQuestions[auditType];
  const responses = questions.map((q, i) => ({
    auditType,
    questionNumber: i + 1,
    questionText: q.text,
    response: document.getElementById(`${q.id}_input`)?.value || ''
  }));

  // Send to backend (example)
  fetch('/submit-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responses)
  })
  .then(res => res.json())
  .then(data => {
    alert('Submission saved!');
    questions.forEach(q => { document.getElementById(`${q.id}_input`).value = ''; });
  })
  .catch(err => {
    console.error(err);
    alert('Failed to save submission. Using localStorage as fallback.');
    // fallback to localStorage if no backend
    const allResponses = JSON.parse(localStorage.getItem('auditResponses') || '[]');
    allResponses.push(...responses);
    localStorage.setItem('auditResponses', JSON.stringify(allResponses));
  });
});
