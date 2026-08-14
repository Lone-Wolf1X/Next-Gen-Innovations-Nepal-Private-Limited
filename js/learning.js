document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Exam Simulator Logic
  let timerInterval;
  let timeLeft = 45 * 60; // 45 minutes in seconds for Paper 1 (as per syllabus 45 min)
  const timerDisplay = document.getElementById('examTimer');
  const startExamBtn = document.getElementById('startExamBtn');
  const submitExamBtn = document.getElementById('submitExamBtn');
  const examContent = document.getElementById('examContent');
  const examIntro = document.getElementById('examIntro');
  const resultsDiv = document.getElementById('examResults');
  const scoreDisplay = document.getElementById('scoreDisplay');

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        submitExam();
        alert('Time is up! Exam submitted automatically.');
      }
    }, 1000);
  }

  if (startExamBtn) {
    startExamBtn.addEventListener('click', () => {
      examIntro.style.display = 'none';
      examContent.style.display = 'block';
      startTimer();
    });
  }

  if (submitExamBtn) {
    submitExamBtn.addEventListener('click', () => {
      if(confirm('Are you sure you want to submit your exam?')) {
          clearInterval(timerInterval);
          submitExam();
      }
    });
  }

  function submitExam() {
    submitExamBtn.style.display = 'none';
    let score = 0;
    const questions = document.querySelectorAll('.mcq-question');
    
    questions.forEach(q => {
      const selectedOption = q.querySelector('input[type="radio"]:checked');
      const correctValue = q.getAttribute('data-answer');
      
      // Highlight correct/incorrect answers visually
      const allOptions = q.querySelectorAll('.mcq-option');
      allOptions.forEach(opt => {
         const input = opt.querySelector('input');
         input.disabled = true; // disable further changes
         
         if (input.value === correctValue) {
             opt.classList.add('correct');
         } else if (input.checked && input.value !== correctValue) {
             opt.classList.add('wrong');
         }
      });

      if (selectedOption) {
        if (selectedOption.value === correctValue) {
          score += 1;
        } else {
            // Negative marking as per syllabus: 20% deducted for wrong answer
            score -= 0.2; 
        }
      }
    });

    resultsDiv.style.display = 'block';
    scoreDisplay.textContent = `${Math.max(0, score).toFixed(2)} / ${questions.length}`;
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }
});
