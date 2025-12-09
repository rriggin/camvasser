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
  <title>Roof Spray vs Sealant Options - ${tenant.name}</title>
  <meta name="description" content="Find out if roof spray or sealant treatment is right for your roof. Take our quick quiz.">
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

    .input-group input,
    .input-group select {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .input-group select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 20px;
      padding-right: 44px;
    }

    .input-group select option {
      background: ${tenant.colors.background};
      color: #fff;
    }

    .input-group input::placeholder {
      color: rgba(255,255,255,0.4);
    }

    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: ${tenant.colors.primary};
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section-title {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .conditional-field {
      display: none;
      margin-top: 12px;
    }

    .conditional-field.visible {
      display: block;
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
      <h1 class="step-title">Where is the roof you're considering spray or sealant treatment for?</h1>
      <p class="step-subtitle">We'll use this to check roof age averages and weather patterns for your area.</p>

      <div class="input-group">
        <label for="address">Property Address</label>
        <input type="text" id="address" placeholder="Enter your address" autocomplete="street-address">
      </div>

      <button class="btn" onclick="nextStep(1)" id="btn1">Continue</button>
    </div>

    <!-- Step 2: Roof Type & Age -->
    <div class="step" id="step2">
      <h1 class="step-title">Tell us about your roof.</h1>
      <p class="step-subtitle">This helps us determine which treatment options might work best.</p>

      <div class="input-group">
        <label for="roofMaterial">What type of roof do you have?</label>
        <select id="roofMaterial">
          <option value="">Select roof type...</option>
          <option value="asphalt_shingles">Asphalt shingles</option>
          <option value="architectural_shingles">Architectural / laminate shingles</option>
          <option value="metal">Metal</option>
          <option value="tile">Tile</option>
          <option value="flat_low_slope">Flat / low-slope (TPO, EPDM, etc.)</option>
          <option value="not_sure">Not sure</option>
        </select>
      </div>

      <div class="input-group">
        <label for="roofAge">About how old is your roof?</label>
        <select id="roofAge">
          <option value="">Select age...</option>
          <option value="under_5">Less than 5 years</option>
          <option value="5_10">5-10 years</option>
          <option value="11_15">11-15 years</option>
          <option value="16_20">16-20 years</option>
          <option value="21_25">21-25 years</option>
          <option value="26_plus_or_unknown">26+ years / not sure</option>
        </select>
      </div>

      <button class="btn" onclick="nextStep(2)" id="btn2" disabled>Continue</button>
    </div>

    <!-- Step 3: Condition & Goals -->
    <div class="step" id="step3">
      <h1 class="step-title">How is your roof doing, and what are your goals?</h1>
      <p class="step-subtitle">Select all that apply in each section.</p>

      <div class="form-section">
        <div class="form-section-title">Current Condition</div>
        <div class="options" id="conditionOptions">
          <div class="option multi" data-value="worn_faded">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Some shingles look worn or faded</span>
          </div>
          <div class="option multi" data-value="curling_brittle">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Curling or brittle shingles</span>
          </div>
          <div class="option multi" data-value="granules_in_gutters">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Granules in gutters or at downspouts</span>
          </div>
          <div class="option multi" data-value="active_leaks">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Active leaks or water stains inside</span>
          </div>
          <div class="option multi" data-value="just_older">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>No obvious issues, just getting older</span>
          </div>
          <div class="option multi" data-value="not_sure_condition">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Not sure / I haven't looked closely</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">Your Goals</div>
        <div class="options" id="goalsOptions">
          <div class="option multi" data-value="avoid_replacement">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Avoid or delay a full roof replacement</span>
          </div>
          <div class="option multi" data-value="extend_life">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Extend the life of my roof a few more years</span>
          </div>
          <div class="option multi" data-value="fix_small_issues">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Help with small issues before they become big problems</span>
          </div>
          <div class="option multi" data-value="improve_curb_appeal">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Improve curb appeal / refresh the look</span>
          </div>
          <div class="option multi" data-value="greener_option">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Explore a greener / less wasteful option</span>
          </div>
          <div class="option multi" data-value="compare_sprays_sealants">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Compare spray rejuvenation vs sealant options</span>
          </div>
          <div class="option multi" data-value="just_researching">
            <div class="checkbox"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <span>Just researching options right now</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">Competitor Research</div>
        <div class="options" id="otherBrandOptions">
          <div class="option" data-value="yes">Yes, I've looked into another spray or sealant product</div>
          <div class="option" data-value="no">No, I haven't</div>
        </div>

        <div class="conditional-field" id="otherBrandField">
          <div class="input-group">
            <label for="otherBrandName">Which brand or product? (Optional)</label>
            <input type="text" id="otherBrandName" placeholder="e.g., Roof Maxx, SealantX">
          </div>
        </div>
      </div>

      <button class="btn" onclick="nextStep(3)" id="btn3" disabled>Continue</button>
    </div>

    <!-- Step 4: Lead Capture -->
    <div class="step" id="step4">
      <h1 class="step-title">Where should we send your results?</h1>
      <p class="step-subtitle">We can now give you a quick comparison of whether spray or sealant treatment is the best fit for your roof.</p>

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
      <p>Analyzing your roof treatment options...</p>
    </div>

    <!-- Results -->
    <div class="results" id="results">
      <h1 class="step-title">Your Roof Treatment Fit Check</h1>

      <div class="results-card">
        <div class="results-headline" id="resultsHeadline">Here's how roof spray vs sealant options fit your roof.</div>

        <div class="results-item">
          <span class="results-label">Address</span>
          <span class="results-value" id="resultAddress">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Roof Type</span>
          <span class="results-value" id="resultMaterial">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Approximate Age</span>
          <span class="results-value" id="resultAge">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Condition</span>
          <span class="results-value" id="resultCondition">-</span>
        </div>
        <div class="results-item">
          <span class="results-label">Your Goals</span>
          <span class="results-value" id="resultGoals">-</span>
        </div>

        <div class="assessment">
          <div class="assessment-title">Our Assessment</div>
          <div class="assessment-text" id="assessmentText">-</div>
        </div>
      </div>

      <div class="next-steps">
        <p style="text-align: center; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.9); margin-bottom: 20px;">
          One of our roof treatment specialists will reach out to discuss your options and schedule a free assessment.
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
      roofMaterial: '',
      roofAge: '',
      roofCondition: [],
      roofGoals: [],
      otherBrandContact: '',
      otherBrandName: '',
      name: '',
      email: '',
      phone: ''
    };

    // Labels for display
    const materialLabels = {
      'asphalt_shingles': 'Asphalt shingles',
      'architectural_shingles': 'Architectural / laminate shingles',
      'metal': 'Metal',
      'tile': 'Tile',
      'flat_low_slope': 'Flat / low-slope',
      'not_sure': 'Not sure'
    };

    const ageLabels = {
      'under_5': 'Less than 5 years',
      '5_10': '5-10 years',
      '11_15': '11-15 years',
      '16_20': '16-20 years',
      '21_25': '21-25 years',
      '26_plus_or_unknown': '26+ years / not sure'
    };

    const conditionLabels = {
      'worn_faded': 'Worn or faded shingles',
      'curling_brittle': 'Curling or brittle shingles',
      'granules_in_gutters': 'Granules in gutters',
      'active_leaks': 'Active leaks',
      'just_older': 'Just getting older',
      'not_sure_condition': 'Not sure'
    };

    const goalsLabels = {
      'avoid_replacement': 'Avoid replacement',
      'extend_life': 'Extend roof life',
      'fix_small_issues': 'Fix small issues',
      'improve_curb_appeal': 'Improve curb appeal',
      'greener_option': 'Greener option',
      'compare_sprays_sealants': 'Compare options',
      'just_researching': 'Researching'
    };

    // Single select for other brand
    document.querySelectorAll('#otherBrandOptions .option').forEach(opt => {
      opt.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        formData.otherBrandContact = this.dataset.value;

        // Show/hide conditional field
        const conditionalField = document.getElementById('otherBrandField');
        if (this.dataset.value === 'yes') {
          conditionalField.classList.add('visible');
        } else {
          conditionalField.classList.remove('visible');
        }

        validateStep3();
      });
    });

    // Multi select for condition
    document.querySelectorAll('#conditionOptions .option').forEach(opt => {
      opt.addEventListener('click', function() {
        this.classList.toggle('selected');

        const selected = [];
        document.querySelectorAll('#conditionOptions .option.selected').forEach(o => {
          selected.push(o.dataset.value);
        });
        formData.roofCondition = selected;
        validateStep3();
      });
    });

    // Multi select for goals
    document.querySelectorAll('#goalsOptions .option').forEach(opt => {
      opt.addEventListener('click', function() {
        this.classList.toggle('selected');

        const selected = [];
        document.querySelectorAll('#goalsOptions .option.selected').forEach(o => {
          selected.push(o.dataset.value);
        });
        formData.roofGoals = selected;
        validateStep3();
      });
    });

    // Validate step 2 (roof type and age)
    function validateStep2() {
      const material = document.getElementById('roofMaterial').value;
      const age = document.getElementById('roofAge').value;
      document.getElementById('btn2').disabled = !material || !age;
    }

    document.getElementById('roofMaterial').addEventListener('change', function() {
      formData.roofMaterial = this.value;
      validateStep2();
    });

    document.getElementById('roofAge').addEventListener('change', function() {
      formData.roofAge = this.value;
      validateStep2();
    });

    // Validate step 3 (condition, goals, other brand)
    function validateStep3() {
      const hasCondition = formData.roofCondition.length > 0;
      const hasGoals = formData.roofGoals.length > 0;
      const hasBrandAnswer = formData.otherBrandContact !== '';
      document.getElementById('btn3').disabled = !(hasCondition && hasGoals && hasBrandAnswer);
    }

    // Progress percentages (4 steps now, no photos)
    const progressSteps = [25, 50, 75, 90, 100];

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

      if (current === 3) {
        formData.otherBrandName = document.getElementById('otherBrandName').value.trim();
      }

      // Hide current, show next
      document.getElementById('step' + current).classList.remove('active');
      document.getElementById('step' + (current + 1)).classList.add('active');
      document.getElementById('progressFill').style.width = progressSteps[current] + '%';
    }

    function computeUrgency() {
      const condition = formData.roofCondition;
      if (condition.includes('active_leaks')) {
        return 'high';
      }
      if (condition.includes('curling_brittle') || condition.includes('granules_in_gutters') || condition.includes('worn_faded')) {
        return 'medium';
      }
      if (condition.includes('just_older') || condition.includes('not_sure_condition')) {
        return 'low';
      }
      return 'medium';
    }

    function computeFitLikelihood() {
      const material = formData.roofMaterial;
      const age = formData.roofAge;
      const condition = formData.roofCondition;

      // Strong fit: shingle roof, 5-20 years old, no active leaks
      if (['asphalt_shingles', 'architectural_shingles'].includes(material) &&
          ['5_10', '11_15', '16_20'].includes(age) &&
          !condition.includes('active_leaks')) {
        return 'strong_fit';
      }

      // Possible fit: shingle roof, 21-25 years
      if (['asphalt_shingles', 'architectural_shingles'].includes(material) &&
          age === '21_25') {
        return 'possible_fit';
      }

      // Needs inspection: very old or has leaks
      if (age === '26_plus_or_unknown' || condition.includes('active_leaks')) {
        return 'needs_inspection';
      }

      // Unknown: non-shingle materials
      if (['metal', 'tile', 'flat_low_slope', 'not_sure'].includes(material)) {
        return 'unknown';
      }

      return 'possible_fit';
    }

    function getFitLikelihoodText(fit) {
      const texts = {
        'strong_fit': 'Your roof type and age fall into the range where spray rejuvenation usually performs the best, often improving flexibility and lifespan.',
        'possible_fit': 'Your roof may still be a candidate for spray or sealant treatment, but we\\'d need a closer look to compare the benefits of each option.',
        'needs_inspection': 'Because of the age or current signs of leaks, we\\'d want to inspect the roof before recommending spray vs sealant. Repairs or replacement may be more appropriate.',
        'unknown': 'Your roof could still be a candidate, but we\\'ll need a few more details or photos to determine whether spray or sealant is the better option.'
      };
      return texts[fit] || texts['possible_fit'];
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
      document.getElementById('step4').classList.remove('active');
      document.getElementById('loading').classList.add('active');
      document.getElementById('progressFill').style.width = '95%';

      // Compute scores
      const urgency = computeUrgency();
      const fitLikelihood = computeFitLikelihood();

      // Get UTM params
      const urlParams = new URLSearchParams(window.location.search);

      try {
        const response = await fetch('/.netlify/functions/save-flow-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: TENANT,
            flowType: 'qualify',
            flowSlug: 'roof-spray-vs-sealant-options',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            urgencyLevel: urgency,
            qualifyScore: fitLikelihood,
            flowData: {
              roofMaterial: formData.roofMaterial,
              roofAge: formData.roofAge,
              roofCondition: formData.roofCondition,
              roofGoals: formData.roofGoals,
              otherBrandContact: formData.otherBrandContact,
              otherBrandName: formData.otherBrandName
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
          document.getElementById('resultMaterial').textContent = materialLabels[formData.roofMaterial] || formData.roofMaterial;
          document.getElementById('resultAge').textContent = ageLabels[formData.roofAge] || formData.roofAge;
          document.getElementById('resultCondition').textContent = formData.roofCondition.map(c => conditionLabels[c] || c).join(', ');
          document.getElementById('resultGoals').textContent = formData.roofGoals.map(g => goalsLabels[g] || g).join(', ');
          document.getElementById('assessmentText').textContent = getFitLikelihoodText(fitLikelihood);
        }, 1500);

      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
        document.getElementById('loading').classList.remove('active');
        document.getElementById('step4').classList.add('active');
      }
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
