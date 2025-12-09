import { loadTenantConfig } from './lib/tenant-config.js';

export async function handler(event) {
  const { tenant } = event.queryStringParameters || {};

  if (!tenant) {
    return {
      statusCode: 400,
      body: 'Missing tenant parameter'
    };
  }

  const config = loadTenantConfig();
  const tenantConfig = config.tenants[tenant];

  if (!tenantConfig) {
    return {
      statusCode: 404,
      body: 'Tenant not found'
    };
  }

  const html = generateHTML(tenantConfig);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300'
    },
    body: html
  };
}

function generateHTML(tenant) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roof Claim Denied? See If You Qualify - ${tenant.name}</title>
  <meta name="description" content="Had your roof insurance claim denied? Find out if you qualify for a second opinion review.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${tenant.colors.background};
      min-height: 100vh;
      color: #fff;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      text-align: center;
      padding: 20px 0 30px;
    }

    .logo {
      height: 60px;
      margin-bottom: 10px;
    }

    .progress-bar {
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      height: 8px;
      margin-bottom: 30px;
      overflow: hidden;
    }

    .progress-fill {
      background: ${tenant.colors.primary};
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .step {
      display: none;
      flex: 1;
      animation: fadeIn 0.3s ease;
    }

    .step.active {
      display: flex;
      flex-direction: column;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .step-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .step-subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 25px;
      line-height: 1.5;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .option {
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px;
      text-align: left;
    }

    .option:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.3);
    }

    .option.selected {
      background: ${tenant.colors.primary}22;
      border-color: ${tenant.colors.primary};
    }

    .option.multi {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .checkbox {
      width: 22px;
      height: 22px;
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .option.selected .checkbox {
      background: ${tenant.colors.primary};
      border-color: ${tenant.colors.primary};
    }

    .checkbox svg {
      width: 14px;
      height: 14px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .option.selected .checkbox svg {
      opacity: 1;
    }

    .input-group {
      margin-bottom: 16px;
    }

    .input-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(255,255,255,0.9);
    }

    .input-group input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .input-group input::placeholder {
      color: rgba(255,255,255,0.4);
    }

    .input-group input:focus {
      outline: none;
      border-color: ${tenant.colors.primary};
    }

    .btn {
      background: ${tenant.colors.primary};
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      margin-top: auto;
    }

    .btn:hover {
      background: ${tenant.colors.primaryHover};
      transform: translateY(-1px);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: transparent;
      border: 2px solid rgba(255,255,255,0.3);
      color: #fff;
      margin-top: 12px;
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    .loading {
      display: none;
      text-align: center;
      padding: 40px 20px;
    }

    .loading.active {
      display: block;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: ${tenant.colors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .results.active {
      display: block;
    }

    .results-card {
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .results-headline {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${tenant.colors.primary};
    }

    .results-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 14px;
    }

    .results-item:last-child {
      border-bottom: none;
    }

    .results-label {
      color: rgba(255,255,255,0.6);
    }

    .results-value {
      font-weight: 500;
      text-align: right;
      max-width: 60%;
    }

    .assessment {
      background: ${tenant.colors.primary}22;
      border: 1px solid ${tenant.colors.primary}44;
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }

    .assessment-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: ${tenant.colors.primary};
    }

    .assessment-text {
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255,255,255,0.9);
    }

    .powered-by {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .powered-by img {
      height: 16px;
      opacity: 0.6;
    }

    @media (max-width: 480px) {
      .step-title {
        font-size: 20px;
      }
      .option {
        padding: 14px 16px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${tenant.logo}" alt="${tenant.name}" class="logo">
    </div>

    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width: 20%"></div>
    </div>

    <!-- Step 1: Address -->
    <div class="step active" id="step1">
      <h1 class="step-title">What's the address of the property with the denied claim?</h1>
      <p class="step-subtitle">We'll use this to check local storm history and coverage factors.</p>

      <div class="input-group">
        <label for="address">Property Address</label>
        <input type="text" id="address" placeholder="Enter your address" autocomplete="street-address">
      </div>

      <button class="btn" onclick="nextStep(1)" id="btn1">Continue</button>
    </div>

    <!-- Step 2: Denial Reason -->
    <div class="step" id="step2">
      <h1 class="step-title">What reason did the insurance company give for denying your claim?</h1>
      <p class="step-subtitle">Select the closest match.</p>

      <div class="options" id="denialOptions">
        <div class="option" data-value="wear_and_tear">Wear and tear</div>
        <div class="option" data-value="no_storm_event">No storm event / no covered peril</div>
        <div class="option" data-value="not_severe_enough">Damage not severe enough</div>
        <div class="option" data-value="improper_installation">Improper installation</div>
        <div class="option" data-value="cosmetic_only">Cosmetic damage only</div>
        <div class="option" data-value="not_covered">Not covered under policy</div>
        <div class="option" data-value="other_unsure">Other / Not sure</div>
      </div>

      <button class="btn" onclick="nextStep(2)" id="btn2" disabled>Continue</button>
    </div>

    <!-- Step 3: Visible Damage -->
    <div class="step" id="step3">
      <h1 class="step-title">What kind of visible damage is present?</h1>
      <p class="step-subtitle">Choose all that apply.</p>

      <div class="options" id="damageOptions">
        <div class="option multi" data-value="missing_shingles">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Missing shingles</span>
        </div>
        <div class="option multi" data-value="lifted_shingles">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Lifted shingles</span>
        </div>
        <div class="option multi" data-value="granule_loss">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Granule loss</span>
        </div>
        <div class="option multi" data-value="impact_marks">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Impact marks</span>
        </div>
        <div class="option multi" data-value="soft_spots">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Soft spots</span>
        </div>
        <div class="option multi" data-value="leaks">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Leaks or water stains</span>
        </div>
        <div class="option multi" data-value="not_sure">
          <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span>Not sure / haven't looked</span>
        </div>
      </div>

      <button class="btn" onclick="nextStep(3)" id="btn3" disabled>Continue</button>
    </div>

    <!-- Step 4: Has Denial Letter -->
    <div class="step" id="step4">
      <h1 class="step-title">Do you have your denial letter handy?</h1>
      <p class="step-subtitle">This helps us understand exactly why your claim was denied.</p>

      <div class="options" id="letterOptions">
        <div class="option" data-value="yes">Yes, I have it</div>
        <div class="option" data-value="no">No, I don't have it right now</div>
      </div>

      <button class="btn" onclick="nextStep(4)" id="btn4" disabled>Continue</button>
    </div>

    <!-- Step 5: Lead Capture -->
    <div class="step" id="step5">
      <h1 class="step-title">Where should we send your results?</h1>
      <p class="step-subtitle">We found indicators that your denial may qualify for a second review.</p>

      <div class="input-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" placeholder="John Smith">
      </div>

      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="john@example.com">
      </div>

      <div class="input-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" placeholder="(555) 123-4567">
      </div>

      <button class="btn" onclick="submitLead()" id="btnSubmit">See My Results</button>
    </div>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p>Analyzing your information...</p>
    </div>

    <!-- Results -->
    <div class="results" id="results">
      <h1 class="step-title">Your Roof Claim Review Results</h1>

      <div class="results-card">
        <div class="results-headline" id="resultsHeadline">Based on what you shared, you may qualify for a Second Opinion Roof Claim Review.</div>

        <div class="results-item">
          <span class="results-label">Address</span>
          <span class="results-value" id="resultAddress">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Denial Reason</span>
          <span class="results-value" id="resultDenial">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Visible Damage</span>
          <span class="results-value" id="resultDamage">-</span>
        </div>

        <div class="assessment">
          <div class="assessment-title">Our Assessment</div>
          <div class="assessment-text" id="assessmentText">-</div>
        </div>
      </div>

      <div class="next-steps">
        <p style="text-align: center; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.9); margin-bottom: 20px;">
          One of our roof claim denial experts will reach out to you shortly to discuss your options.
        </p>
        <button class="btn" onclick="callNow()">Call Us Now: ${tenant.phone}</button>
      </div>
    </div>

    <div class="powered-by">
      <img src="/favicon.png" alt="Camvasser">
      <span>Powered by Camvasser</span>
    </div>
  </div>

  <script>
    const TENANT = '${tenant.slug}';
    const PHONE = '${tenant.phone}';

    // Form state
    let formData = {
      address: '',
      denialReason: '',
      visibleDamage: [],
      hasLetter: '',
      name: '',
      email: '',
      phone: ''
    };

    // Labels for display
    const denialLabels = {
      'wear_and_tear': 'Wear and tear',
      'no_storm_event': 'No storm event',
      'not_severe_enough': 'Damage not severe enough',
      'improper_installation': 'Improper installation',
      'cosmetic_only': 'Cosmetic damage only',
      'not_covered': 'Not covered under policy',
      'other_unsure': 'Other / Not sure'
    };

    const damageLabels = {
      'missing_shingles': 'Missing shingles',
      'lifted_shingles': 'Lifted shingles',
      'granule_loss': 'Granule loss',
      'impact_marks': 'Impact marks',
      'soft_spots': 'Soft spots',
      'leaks': 'Leaks or water stains',
      'not_sure': 'Not sure'
    };

    // Single select options
    document.querySelectorAll('#denialOptions .option, #letterOptions .option').forEach(opt => {
      opt.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');

        if (parent.id === 'denialOptions') {
          formData.denialReason = this.dataset.value;
          document.getElementById('btn2').disabled = false;
        } else if (parent.id === 'letterOptions') {
          formData.hasLetter = this.dataset.value;
          document.getElementById('btn4').disabled = false;
        }
      });
    });

    // Multi select options
    document.querySelectorAll('#damageOptions .option').forEach(opt => {
      opt.addEventListener('click', function() {
        this.classList.toggle('selected');

        const selected = [];
        document.querySelectorAll('#damageOptions .option.selected').forEach(o => {
          selected.push(o.dataset.value);
        });
        formData.visibleDamage = selected;
        document.getElementById('btn3').disabled = selected.length === 0;
      });
    });

    // Progress percentages
    const progressSteps = [20, 40, 60, 75, 90, 100];

    function nextStep(current) {
      // Validate current step
      if (current === 1) {
        const address = document.getElementById('address').value.trim();
        if (!address) {
          alert('Please enter your address');
          return;
        }
        formData.address = address;
      }

      // Hide current, show next
      document.getElementById('step' + current).classList.remove('active');
      document.getElementById('step' + (current + 1)).classList.add('active');
      document.getElementById('progressFill').style.width = progressSteps[current] + '%';
    }

    function computeUrgency() {
      const damage = formData.visibleDamage;
      if (damage.includes('leaks') || damage.includes('soft_spots')) {
        return 'high';
      }
      if (damage.includes('missing_shingles') || damage.includes('lifted_shingles') ||
          damage.includes('impact_marks') || damage.includes('granule_loss')) {
        return 'medium';
      }
      if (damage.includes('not_sure')) {
        return 'unknown';
      }
      return 'medium';
    }

    function computeLikelihood() {
      const denial = formData.denialReason;
      const damage = formData.visibleDamage;

      // Strong likelihood
      if (['wear_and_tear', 'no_storm_event'].includes(denial) &&
          (damage.includes('missing_shingles') || damage.includes('lifted_shingles') ||
           damage.includes('impact_marks') || damage.includes('leaks'))) {
        return 'strong';
      }

      // Moderate likelihood
      if (['not_severe_enough', 'cosmetic_only', 'not_covered'].includes(denial) &&
          (damage.includes('granule_loss') || damage.includes('missing_shingles') ||
           damage.includes('lifted_shingles'))) {
        return 'moderate';
      }

      // Unknown
      if (denial === 'other_unsure') {
        return 'unknown';
      }

      return 'moderate';
    }

    function getLikelihoodText(likelihood) {
      const texts = {
        'strong': 'Your denial reason and the type of damage you reported are commonly overturned during a second inspection, especially when documented correctly.',
        'moderate': 'There are signs your claim may still have options, but we\\'ll need a closer look at your roof and paperwork.',
        'unknown': 'We need a bit more information, but a quick review of your denial letter and a roof inspection can clarify your options.'
      };
      return texts[likelihood] || texts['moderate'];
    }

    async function submitLead() {
      // Get form values
      formData.name = document.getElementById('name').value.trim();
      formData.email = document.getElementById('email').value.trim();
      formData.phone = document.getElementById('phone').value.trim();

      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all fields');
        return;
      }

      // Show loading
      document.getElementById('step5').classList.remove('active');
      document.getElementById('loading').classList.add('active');
      document.getElementById('progressFill').style.width = '95%';

      // Compute scores
      const urgency = computeUrgency();
      const likelihood = computeLikelihood();

      // Get UTM params
      const urlParams = new URLSearchParams(window.location.search);

      try {
        const response = await fetch('/.netlify/functions/save-flow-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: TENANT,
            flowType: 'qualify',
            flowSlug: 'roof-claim-denial',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            urgencyLevel: urgency,
            qualifyScore: likelihood,
            flowData: {
              denialReason: formData.denialReason,
              visibleDamage: formData.visibleDamage,
              hasLetter: formData.hasLetter
            },
            utmSource: urlParams.get('utm_source'),
            utmMedium: urlParams.get('utm_medium'),
            utmCampaign: urlParams.get('utm_campaign')
          })
        });

        const result = await response.json();

        // Show results
        setTimeout(() => {
          document.getElementById('loading').classList.remove('active');
          document.getElementById('results').classList.add('active');
          document.getElementById('progressFill').style.width = '100%';

          // Populate results
          document.getElementById('resultAddress').textContent = formData.address;
          document.getElementById('resultDenial').textContent = denialLabels[formData.denialReason] || formData.denialReason;
          document.getElementById('resultDamage').textContent = formData.visibleDamage.map(d => damageLabels[d] || d).join(', ');
          document.getElementById('assessmentText').textContent = getLikelihoodText(likelihood);
        }, 1500);

      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
        document.getElementById('loading').classList.remove('active');
        document.getElementById('step5').classList.add('active');
      }
    }

    function scheduleCall() {
      // For now, just show a message. Can integrate Calendly later.
      alert('Thanks! We\\'ll call you within 24 hours to schedule your claim review.');
    }

    function callNow() {
      window.location.href = 'tel:' + PHONE.replace(/[^0-9]/g, '');
    }

    // Enable first button when address has content
    document.getElementById('address').addEventListener('input', function() {
      document.getElementById('btn1').disabled = !this.value.trim();
    });
  </script>
</body>
</html>`;
}
