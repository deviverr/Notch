export class IntroCutscene {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.showingProfile = false;
    this.steps = [
      { text: 'Hi', delay: 2500 },
      { text: 'Im Companion', delay: 2500 },
      { text: 'to your notch. console', delay: 2500 },
      { text: 'Before we begin...', delay: 2000 },
      { text: 'Tell me about yourself', delay: 2000 }
    ];
  }

  render() {
    return `
      <div class="cutscene-container">
        <div class="cutscene-text" id="cutscene-text"></div>
        <button class="skip-button" id="skip-cutscene">Skip</button>
        <div class="profile-form hidden" id="profile-form">
          <h2>Setup Your Profile</h2>
          <div class="form-group">
            <label for="nickname">Nickname:</label>
            <input type="text" id="nickname" maxlength="15" placeholder="Enter your nickname" />
          </div>
          <div class="form-group">
            <label for="birthdate">Birthdate:</label>
            <input type="date" id="birthdate" />
          </div>
          <button class="btn-primary" id="save-profile">Save & Continue</button>
        </div>
      </div>
    `;
  }

  start() {
    // Setup skip button
    const skipBtn = document.getElementById('skip-cutscene');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.skip();
      });
    }
    
    this.showNextStep();
  }

  skip() {
    // Clear any pending timeouts
    this.currentStep = this.steps.length;
    
    // Go directly to profile form
    this.showProfileForm();
  }

  showNextStep() {
    if (this.currentStep >= this.steps.length) {
      // Show profile form after text sequence
      this.showProfileForm();
      return;
    }

    const step = this.steps[this.currentStep];
    const textEl = document.getElementById('cutscene-text');

    if (!textEl) return;

    // Fade in animation
    textEl.style.opacity = '0';
    textEl.textContent = step.text;

    setTimeout(() => {
      textEl.style.opacity = '1';
    }, 100);

    // Move to next step
    setTimeout(() => {
      this.currentStep++;
      this.showNextStep();
    }, step.delay);
  }

  showProfileForm() {
    const textEl = document.getElementById('cutscene-text');
    const formEl = document.getElementById('profile-form');

    if (!textEl || !formEl) return;

    // Hide text, show form
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.classList.add('hidden');
      formEl.classList.remove('hidden');

      // Setup form submission
      const saveBtn = document.getElementById('save-profile');
      const nicknameInput = document.getElementById('nickname');
      const birthdateInput = document.getElementById('birthdate');

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const nickname = nicknameInput.value.trim();
          const birthdate = birthdateInput.value;

          if (!nickname || nickname.length < 3) {
            alert('Please enter a nickname (at least 3 characters)');
            return;
          }

          if (!birthdate) {
            alert('Please select your birthdate');
            return;
          }

          // Save to localStorage
          localStorage.setItem('notch_nickname', nickname);
          localStorage.setItem('notch_birthdate', birthdate);

          // Complete cutscene
          this.onComplete();
        });
      }
    }, 500);
  }

  cleanup() {
    const container = document.querySelector('.cutscene-container');
    if (container) {
      container.remove();
    }
  }
}
