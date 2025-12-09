You are building a short, high-converting **Dirty Roof Cost Impact Quiz** for a roofing company.

This quiz is for homeowners who may NOT realize that a dirty roof (streaks, algae, moss, etc.) is **costing them money** in energy, lifespan, and curb appeal.

The primary CTA theme is:
> “Learn how a dirty roof is costing you money.”

You must:
- Start with **address input**
- Use the address to compute **location metadata** and **attempt to fetch a Street View image of the roof**
- Diagnose visible symptoms and roof age/maintenance
- Compute a **Cost Impact Level**
- Offer a **Roof Condition Savings Report**
- Collect lead info
- Route them into an **educate** funnel with a no-pressure inspection option.

---

# 🎯 OVERALL GOAL

Create a 5–6 step quiz that:

- Starts with **address capture** (including Street View fetch if available)
- Asks about **visible roof symptoms**
- Asks about **roof age and maintenance history**
- Asks about **homeowner’s goals**
- Optionally collects **photos**
- Computes a **cost_impact_level**
- Collects **name/email/phone**
- Outputs a **personalized “Savings Impact” result**
- Routes users into the **Category: educate** funnel

Tone: educational, helpful, non-alarmist, not pushy.

---

# ROUTES

Use these exact slugs:

- Start route: `/dirty-roof-costs/quiz`
- Results route: `/dirty-roof-costs/results`
- Meta slug for results: `/dirty-roof-costs/results`

---

# 🧭 QUIZ STRUCTURE

## STEP 1 — Property Address (with Street View attempt)

**Question:**
“Where is the home with the roof you’re curious about?”

Behavior:

- Use address autocomplete.
- After address selection, show:
  > “Checking sun exposure, climate, and roof visibility for your area…”

Backend actions:

- Compute **location metadata**:
  - lat/lng
  - region/zip
  - basic climate classification (humid / dry / mixed)
- Attempt to fetch a **Street View roof/house image**:
  - If successful: store `roof_streetview_url` and set `streetview_available = true`
  - If not: `streetview_available = false`

Then → Step 2

---

## STEP 2 — What Do You See on Your Roof? (Symptoms)

**Question:**
“What do you see when you look at your roof?”

Multi-select options (required):

- Dark streaks or stains
- Black algae spots
- Greenish film or growth
- Moss or lichen patches
- Lots of granules in gutters or at downspouts
- Roof looks dull or faded compared to neighbors
- Not sure — I haven’t really looked

These will feed into the **Cost Impact Score**.

Then → Step 3

---

## STEP 3 — Roof Age & Maintenance History

Two required fields:

**Roof Age (single select)**

- Under 10 years
- 10–15 years
- 16–20 years
- 21–25 years
- 26+ years / not sure

**Last Cleaned or Treated (single select)**

- Within the last year
- 1–3 years ago
- 3–5 years ago
- 5+ years ago
- Never / not sure

These will amplify or reduce the cost impact.

Then → Step 4

---

## STEP 4 — Homeowner Goals

**Question:**
“What matters most to you when it comes to your roof?”

Multi-select (required):

- Lowering energy/cooling costs
- Extending the life of my roof
- Improving curb appeal / how it looks
- Protecting home value
- Preventing future leaks or issues
- Avoiding an early roof replacement
- Just learning more right now

This mainly shapes the messaging on the results page.

Then → Step 5

---

## STEP 5 — Optional Photos (plus Street View mention)

**Question:**
“Do you want to share photos so we can give more specific feedback?”

Behavior:

- If `streetview_available = true`, show helper text like:
  > “We’ve already pulled a street-level view of your roof (when available). Photos from you help us see closer details.”

- Options:
  - Yes → show upload field
  - Not right now

File upload (images only), mark `photos_provided = true/false`.

Then → Step 6

---

## STEP 6 — Contact Info (Lead Capture)

**Message:**
“We’ve analyzed your roof symptoms and can estimate how much a dirty roof may be costing you over time. Where should we send your personalized Roof Condition Savings Report?”

Fields:

- Full name (required)
- Email (required)
- Phone (required)

On submit:

- Compute **cost_impact_level**
- Compute optional **estimated_extra_cooling_cost_per_year** (simple ranges)
- Go to results page.

---

# 🟦 RESULTS PAGE — “Savings Impact” Output

**Headline:**
“Your roof’s condition may be costing you more than you think.”

Body should include dynamic data:

- Address
- Whether Street View image was available
- Visible symptoms summary
- Roof age & maintenance summary
- Goals summary
- **Cost Impact Level explainer**
- (Optional) “Estimated extra cooling cost per year” range

**Cost Impact Levels:**

- `major_cost_impact` — heavy streaking/growth, older roof, never cleaned
- `moderate_cost_impact` — noticeable symptoms, mid-age roof, infrequent cleaning
- `minor_cost_impact` — mild symptoms, newer or recently cleaned roof
- `unknown` — not enough info / “not sure” answers

Each level has its own explainer paragraph.

**Primary CTA:**
🔵 “Get Your Roof Condition Savings Report”

**Secondary CTA:**
⚪ “Request a No-Pressure Roof Inspection”

Meta:
- category: `educate`
- slug: `/dirty-roof-costs/results`

---

# 📄 JSON CONVERSATION FLOW

Use the following JSON as the conversation schema:

```json
{
  "version": "1.0",
  "quiz_id": "dirty_roof_costs_quiz",
  "name": "Dirty Roof Cost Impact Quiz",
  "description": "Short multi-step flow to show homeowners how a dirty roof may be costing them money and to offer a personalized Roof Condition Savings Report.",
  "start_step_id": "step_address",
  "routes": {
    "start": "/dirty-roof-costs/quiz",
    "results": "/dirty-roof-costs/results"
  },
  "steps": {
    "step_address": {
      "id": "step_address",
      "type": "question",
      "title": "Property Address",
      "message": "Where is the home with the roof you're curious about?",
      "ui": {
        "input_type": "address",
        "helper_text": "We’ll use this to understand your climate, sun exposure, and see if we can pull a street-level view of your roof.",
        "show_progress": true,
        "progress": 0.16
      },
      "fields": [
        {
          "name": "address",
          "label": "Property address",
          "type": "address_autocomplete",
          "required": true
        }
      ],
      "on_submit": {
        "actions": [
          {
            "type": "compute_location_metadata",
            "params": {
              "from_field": "address",
              "store_lat_lng": true,
              "store_region": true,
              "store_climate_zone": true
            }
          },
          {
            "type": "fetch_streetview_image",
            "params": {
              "lat_field": "lat",
              "lng_field": "lng",
              "store_url_field": "roof_streetview_url",
              "store_flag_field": "streetview_available"
            }
          }
        ],
        "next_step_id": "step_symptoms"
      },
      "system_messages": [
        "After user selects an address, briefly show: 'Checking sun exposure, climate, and roof visibility for your area…'"
      ]
    },

    "step_symptoms": {
      "id": "step_symptoms",
      "type": "question",
      "title": "What do you see on your roof?",
      "message": "When you look up at your roof, what do you notice?",
      "ui": {
        "input_type": "multi_choice",
        "helper_text": "Choose all that apply.",
        "show_progress": true,
        "progress": 0.32
      },
      "fields": [
        {
          "name": "roof_symptoms",
          "label": "Visible symptoms",
          "type": "multi_select",
          "required": true,
          "options": [
            { "value": "dark_streaks", "label": "Dark streaks or stains" },
            { "value": "black_algae", "label": "Black algae spots" },
            { "value": "green_growth", "label": "Greenish film or growth" },
            { "value": "moss_lichen", "label": "Moss or lichen patches" },
            { "value": "granules_in_gutters", "label": "Lots of granules in gutters or at downspouts" },
            { "value": "dull_faded", "label": "Roof looks dull or faded compared to neighbors" },
            { "value": "not_sure", "label": "Not sure — I haven’t really looked" }
          ]
        }
      ],
      "on_submit": {
        "next_step_id": "step_age_maintenance"
      }
    },

    "step_age_maintenance": {
      "id": "step_age_maintenance",
      "type": "question",
      "title": "Roof Age & Maintenance",
      "message": "A little bit about your roof's age and history helps us estimate cost impact.",
      "ui": {
        "input_type": "form",
        "show_progress": true,
        "progress": 0.48
      },
      "fields": [
        {
          "name": "roof_age",
          "label": "About how old is your roof?",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "under_10", "label": "Under 10 years" },
            { "value": "10_15", "label": "10–15 years" },
            { "value": "16_20", "label": "16–20 years" },
            { "value": "21_25", "label": "21–25 years" },
            { "value": "26_plus_or_unknown", "label": "26+ years / not sure" }
          ]
        },
        {
          "name": "last_cleaned",
          "label": "When was your roof last cleaned or treated?",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "within_1_year", "label": "Within the last year" },
            { "value": "one_to_three_years", "label": "1–3 years ago" },
            { "value": "three_to_five_years", "label": "3–5 years ago" },
            { "value": "five_plus_years", "label": "5+ years ago" },
            { "value": "never_or_unknown", "label": "Never / not sure" }
          ]
        }
      ],
      "on_submit": {
        "next_step_id": "step_goals"
      }
    },

    "step_goals": {
      "id": "step_goals",
      "type": "question",
      "title": "What matters most to you?",
      "message": "What are you hoping to get out of taking care of your roof?",
      "ui": {
        "input_type": "multi_choice",
        "show_progress": true,
        "progress": 0.64
      },
      "fields": [
        {
          "name": "homeowner_goals",
          "label": "Your goals",
          "type": "multi_select",
          "required": true,
          "options": [
            { "value": "lower_energy_costs", "label": "Lowering energy/cooling costs" },
            { "value": "extend_lifespan", "label": "Extending the life of my roof" },
            { "value": "improve_curb_appeal", "label": "Improving curb appeal / how it looks" },
            { "value": "protect_home_value", "label": "Protecting home value" },
            { "value": "prevent_future_issues", "label": "Preventing future leaks or issues" },
            { "value": "avoid_early_replacement", "label": "Avoiding an early roof replacement" },
            { "value": "just_learning", "label": "Just learning more right now" }
          ]
        }
      ],
      "on_submit": {
        "next_step_id": "step_photos"
      }
    },

    "step_photos": {
      "id": "step_photos",
      "type": "question",
      "title": "Photos (Optional)",
      "message": "Do you want to share a few photos so we can give more specific feedback?",
      "ui": {
        "input_type": "single_choice_with_optional_upload",
        "show_progress": true,
        "progress": 0.8
      },
      "fields": [
        {
          "name": "photo_choice",
          "label": "Photo choice",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "yes_upload", "label": "Yes, I'll upload a few photos" },
            { "value": "no_upload", "label": "Not right now" }
          ]
        },
        {
          "name": "roof_photos",
          "label": "Roof photos",
          "type": "file_upload",
          "accept": ["image/*"],
          "required_if": {
            "field": "photo_choice",
            "equals": "yes_upload"
          }
        }
      ],
      "on_submit": {
        "actions": [
          {
            "type": "set_flag",
            "params": {
              "field": "photos_provided",
              "value_if_files_present": true,
              "value_if_no_files": false
            }
          }
        ],
        "next_step_id": "step_lead_capture"
      }
    },

    "step_lead_capture": {
      "id": "step_lead_capture",
      "type": "question",
      "title": "Where should we send your Roof Condition Savings Report?",
      "message": "We’ve analyzed your roof symptoms and can estimate how much a dirty roof may be costing you over time. Where should we send your personalized Roof Condition Savings Report?",
      "ui": {
        "input_type": "form",
        "show_progress": true,
        "progress": 0.96
      },
      "fields": [
        {
          "name": "lead_name",
          "label": "Full name",
          "type": "text",
          "required": true
        },
        {
          "name": "lead_email",
          "label": "Email",
          "type": "email",
          "required": true
        },
        {
          "name": "lead_phone",
          "label": "Phone",
          "type": "phone",
          "required": true
        }
      ],
      "on_submit": {
        "actions": [
          {
            "type": "bundle_lead_object",
            "params": {
              "target_field": "lead",
              "fields": ["lead_name", "lead_email", "lead_phone"]
            }
          },
          {
            "type": "compute_cost_impact_level",
            "params": {
              "symptoms_field": "roof_symptoms",
              "age_field": "roof_age",
              "maintenance_field": "last_cleaned",
              "climate_field": "climate_zone",
              "rules": [
                {
                  "name": "major_cost_impact_heavy_growth_old_roof",
                  "if_symptoms_contains_any": ["moss_lichen", "black_algae", "green_growth", "dark_streaks"],
                  "and_age_in": ["16_20", "21_25", "26_plus_or_unknown"],
                  "and_maintenance_in": ["five_plus_years", "never_or_unknown"],
                  "set_impact": "major_cost_impact"
                },
                {
                  "name": "moderate_cost_impact_mid_age_visible_symptoms",
                  "if_symptoms_contains_any": ["dark_streaks", "dull_faded", "granules_in_gutters"],
                  "and_age_in": ["10_15", "16_20"],
                  "set_impact": "moderate_cost_impact"
                },
                {
                  "name": "minor_cost_impact_mild_symptoms_newer_roof",
                  "if_symptoms_contains_any": ["dull_faded"],
                  "and_age_in": ["under_10", "10_15"],
                  "and_maintenance_not_in": ["five_plus_years", "never_or_unknown"],
                  "set_impact": "minor_cost_impact"
                },
                {
                  "name": "unknown_impact_not_sure",
                  "if_symptoms_contains_any": ["not_sure"],
                  "set_impact": "unknown"
                }
              ],
              "default_impact": "moderate_cost_impact"
            }
          },
          {
            "type": "estimate_extra_cooling_cost",
            "params": {
              "impact_field": "cost_impact_level",
              "store_field": "estimated_extra_cooling_cost_per_year",
              "ranges": {
                "major_cost_impact": "$150–$300+/year",
                "moderate_cost_impact": "$75–$150/year",
                "minor_cost_impact": "$25–$75/year",
                "unknown": "Varies — needs a closer look"
              }
            }
          }
        ],
        "next_step_id": "step_results"
      }
    },

    "step_results": {
      "id": "step_results",
      "type": "result",
      "title": "Your Roof Condition Savings Impact",
      "message_template": {
        "headline": "Your roof’s condition may be costing you more than you think.",
        "body_blocks": [
          "Address: {{address}}",
          "Street-level view available: {{streetview_available}}",
          "Visible symptoms: {{roof_symptoms_labels}}",
          "Roof age: {{roof_age_label}}",
          "Last cleaned/treated: {{last_cleaned_label}}",
          "Your goals: {{homeowner_goals_labels}}",
          "Estimated extra cooling cost per year: {{estimated_extra_cooling_cost_per_year}}",
          "Our assessment: {{cost_impact_explainer}}"
        ],
        "cost_impact_explainers": {
          "major_cost_impact": "Based on what you shared, your roof likely has significant organic growth and staining on an older surface that hasn’t been cleaned in a long time. This combination can shorten roof life and increase cooling costs, which is why a professional cleaning and treatment often pays for itself over time.",
          "moderate_cost_impact": "Your roof shows noticeable signs of wear and organic buildup. Taking care of it now with a cleaning and treatment can help slow down aging, protect shingles, and reduce energy waste before issues become more serious.",
          "minor_cost_impact": "Your roof appears to have mild symptoms. A preventative cleaning and treatment can still help with curb appeal and efficiency, and may extend the useful life of the shingles.",
          "unknown": "We weren’t able to pin down your roof’s cost impact with the information provided, but a quick look at your roof (or a few photos) can quickly clarify how much you could save by taking care of it."
        }
      },
      "primary_cta": {
        "label": "Get Your Roof Condition Savings Report",
        "action": "open_booking_modal",
        "action_params": {
          "type": "roof_savings_report",
          "source": "dirty_roof_costs_quiz"
        }
      },
      "secondary_cta": {
        "label": "Request a No-Pressure Roof Inspection",
        "action": "open_booking_modal",
        "action_params": {
          "type": "roof_inspection",
          "source": "dirty_roof_costs_quiz"
        }
      },
      "meta": {
        "category": "educate",
        "slug": "/dirty-roof-costs/results"
      }
    }
  },

  "final_payload_example": {
    "address": "123 Main St, Kansas City, MO 64111",
    "lat": 39.0923,
    "lng": -94.5777,
    "climate_zone": "humid",
    "roof_streetview_url": "https://example.com/streetview_roof.jpg",
    "streetview_available": true,
    "roof_symptoms": ["dark_streaks", "black_algae", "granules_in_gutters"],
    "roof_age": "16_20",
    "last_cleaned": "never_or_unknown",
    "homeowner_goals": ["lower_energy_costs", "extend_lifespan", "protect_home_value"],
    "photos_provided": false,
    "lead": {
      "name": "Jane Homeowner",
      "email": "jane@example.com",
      "phone": "+1-555-123-4567"
    },
    "cost_impact_level": "major_cost_impact",
    "estimated_extra_cooling_cost_per_year": "$150–$300+/year"
  }
}
