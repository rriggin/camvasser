You are building a short, high-converting **Roof Spray vs Sealant Options Quiz** for a roofing company.

This quiz is for homeowners researching rejuvenation sprays, sealants, or competing products — they want to know **“Which option is right for my roof?”** and **“Is my roof even a fit?”**

---

# ROUTES (IMPORTANT)

Use these exact slugs:

- Start route: `/roof-spray-vs-sealant-options/quiz`
- Results route: `/roof-spray-vs-sealant-options/results`
- Meta slug for results: `/roof-spray-vs-sealant-options/results`

---

# JSON CONVERSATION FLOW (UPDATED WITH NEW SLUG)

```json
{
  "version": "1.0",
  "quiz_id": "roof_spray_vs_sealant_options_quiz",
  "name": "Roof Spray vs Sealant Options Quiz",
  "description": "Short multi-step flow to help homeowners compare roof spray rejuvenation vs sealant options and determine if their roof is a good fit.",
  "start_step_id": "step_address",
  "routes": {
    "start": "/roof-spray-vs-sealant-options/quiz",
    "results": "/roof-spray-vs-sealant-options/results"
  },
  "steps": {
    "step_address": {
      "id": "step_address",
      "type": "question",
      "title": "Property Address",
      "message": "Where is the roof you're considering spray or sealant treatment for?",
      "ui": {
        "input_type": "address",
        "helper_text": "We'll use this to check roof age averages and weather patterns for your area.",
        "show_progress": true,
        "progress": 0.2
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
              "store_region": true
            }
          }
        ],
        "next_step_id": "step_roof_type_age"
      },
      "system_messages": [
        "After user selects an address, briefly show: 'Checking roof age averages and weather patterns for your area…'"
      ]
    },

    "step_roof_type_age": {
      "id": "step_roof_type_age",
      "type": "question",
      "title": "Roof Type & Age",
      "message": "Tell us about your roof.",
      "ui": {
        "input_type": "form",
        "show_progress": true,
        "progress": 0.4
      },
      "fields": [
        {
          "name": "roof_material",
          "label": "What type of roof do you have?",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "asphalt_shingles", "label": "Asphalt shingles" },
            { "value": "architectural_shingles", "label": "Architectural / laminate shingles" },
            { "value": "metal", "label": "Metal" },
            { "value": "tile", "label": "Tile" },
            { "value": "flat_low_slope", "label": "Flat / low-slope (TPO, EPDM, etc.)" },
            { "value": "not_sure", "label": "Not sure" }
          ]
        },
        {
          "name": "roof_age",
          "label": "About how old is your roof?",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "under_5", "label": "Less than 5 years" },
            { "value": "5_10", "label": "5–10 years" },
            { "value": "11_15", "label": "11–15 years" },
            { "value": "16_20", "label": "16–20 years" },
            { "value": "21_25", "label": "21–25 years" },
            { "value": "26_plus_or_unknown", "label": "26+ years / not sure" }
          ]
        }
      ],
      "on_submit": {
        "next_step_id": "step_condition_goals"
      }
    },

    "step_condition_goals": {
      "id": "step_condition_goals",
      "type": "question",
      "title": "Condition & Goals",
      "message": "How is your roof doing today, and what are you hoping treatment will help with?",
      "ui": {
        "input_type": "form",
        "show_progress": true,
        "progress": 0.6
      },
      "fields": [
        {
          "name": "roof_condition",
          "label": "Current condition",
          "type": "multi_select",
          "required": true,
          "options": [
            { "value": "worn_faded", "label": "Some shingles look worn or faded" },
            { "value": "curling_brittle", "label": "Curling or brittle shingles" },
            { "value": "granules_in_gutters", "label": "Granules in gutters or at downspouts" },
            { "value": "active_leaks", "label": "Active leaks or water stains inside" },
            { "value": "just_older", "label": "No obvious issues, just getting older" },
            { "value": "not_sure_condition", "label": "Not sure / I haven’t looked closely" }
          ]
        },
        {
          "name": "roof_goals",
          "label": "What are you hoping treatment will do for your roof?",
          "type": "multi_select",
          "required": true,
          "options": [
            { "value": "avoid_replacement", "label": "Avoid or delay a full roof replacement" },
            { "value": "extend_life", "label": "Extend the life of my roof a few more years" },
            { "value": "fix_small_issues", "label": "Help with small issues before they become big problems" },
            { "value": "improve_curb_appeal", "label": "Improve curb appeal / refresh the look" },
            { "value": "greener_option", "label": "Explore a greener / less wasteful option" },
            { "value": "compare_sprays_sealants", "label": "Compare spray rejuvenation vs sealant options" },
            { "value": "just_researching", "label": "Just researching options right now" }
          ]
        },
        {
          "name": "other_brand_contact",
          "label": "Have you already looked into another spray or sealant product?",
          "type": "single_select",
          "required": true,
          "options": [
            { "value": "yes", "label": "Yes" },
            { "value": "no", "label": "No" }
          ]
        },
        {
          "name": "other_brand_name",
          "label": "Optional: Which brand or product?",
          "type": "text",
          "required_if": {
            "field": "other_brand_contact",
            "equals": "yes"
          }
        }
      ],
      "on_submit": {
        "actions": [
          {
            "type": "compute_urgency_level",
            "params": {
              "source_field": "roof_condition",
              "rules": [
                { "if_contains_any": ["active_leaks"], "set_urgency": "high" },
                {
                  "if_contains_any": ["curling_brittle", "granules_in_gutters", "worn_faded"],
                  "set_urgency": "medium"
                },
                {
                  "if_contains_any": ["just_older", "not_sure_condition"],
                  "set_urgency": "low"
                }
              ],
              "default_urgency": "medium"
            }
          }
        ],
        "next_step_id": "step_photos"
      }
    },

    "step_photos": {
      "id": "step_photos",
      "type": "question",
      "title": "Roof Photos (Optional)",
      "message": "Do you want to share photos of your roof so we can give more specific feedback?",
      "ui": {
        "input_type": "single_choice_with_optional_upload",
        "show_progress": true,
        "progress": 0.75
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
      "title": "Where should we send your results?",
      "message": "We can now give you a quick comparison of whether spray or sealant treatment is the best fit for your roof. Where should we send your results?",
      "ui": {
        "input_type": "form",
        "show_progress": true,
        "progress": 0.9
      },
      "fields": [
        { "name": "lead_name", "label": "Full name", "type": "text", "required": true },
        { "name": "lead_email", "label": "Email", "type": "email", "required": true },
        { "name": "lead_phone", "label": "Phone", "type": "phone", "required": true }
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
            "type": "compute_fit_likelihood",
            "params": {
              "roof_material_field": "roof_material",
              "roof_age_field": "roof_age",
              "roof_condition_field": "roof_condition",
              "rules": [
                {
                  "name": "strong_fit_mid_age_shingle",
                  "if_material_in": ["asphalt_shingles", "architectural_shingles"],
                  "and_age_in": ["5_10", "11_15", "16_20"],
                  "and_condition_excludes": ["active_leaks"],
                  "set_fit": "strong_fit"
                },
                {
                  "name": "possible_fit_older_shingle",
                  "if_material_in": ["asphalt_shingles", "architectural_shingles"],
                  "and_age_in": ["21_25"],
                  "set_fit": "possible_fit"
                },
                {
                  "name": "needs_inspection_very_old_or_leaking",
                  "if_age_in": ["26_plus_or_unknown"],
                  "or_condition_contains_any": ["active_leaks"],
                  "set_fit": "needs_inspection"
                },
                {
                  "name": "unknown_non_shingle",
                  "if_material_in": ["metal", "tile", "flat_low_slope", "not_sure"],
                  "set_fit": "unknown"
                }
              ],
              "default_fit": "possible_fit"
            }
          }
        ],
        "next_step_id": "step_results"
      }
    },

    "step_results": {
      "id": "step_results",
      "type": "result",
      "title": "Your Roof Treatment Fit Check",
      "message_template": {
        "headline": "Here’s how roof spray vs sealant options fit your roof.",
        "body_blocks": [
          "Address: {{address}}",
          "Roof type: {{roof_material_label}}",
          "Approximate age: {{roof_age_label}}",
          "Condition: {{roof_condition_labels}}",
          "Your goals: {{roof_goals_labels}}",
          "Urgency level: {{urgency_level}}",
          "Our assessment: {{fit_likelihood_explainer}}"
        ],
        "fit_likelihood_explainers": {
          "strong_fit": "Your roof type and age fall into the range where spray rejuvenation usually performs the best, often improving flexibility and lifespan.",
          "possible_fit": "Your roof may still be a candidate for spray or sealant treatment, but we’d need a closer look to compare the benefits of each option.",
          "needs_inspection": "Because of the age or current signs of leaks, we’d want to inspect the roof before recommending spray vs sealant. Repairs or replacement may be more appropriate.",
          "unknown": "Your roof could still be a candidate, but we’ll need a few more details or photos to determine whether spray or sealant is the better option."
        }
      },
      "primary_cta": {
        "label": "Schedule a Roof Spray vs Sealant Fit Check",
        "action": "open_booking_modal",
        "action_params": {
          "type": "roof_spray_vs_sealant_fit_check",
          "source": "roof_spray_vs_sealant_options_quiz"
        }
      },
      "secondary_cta": {
        "label": "Request a No-Pressure Roof Assessment",
        "action": "open_booking_modal",
        "action_params": {
          "type": "roof_assessment",
          "source": "roof_spray_vs_sealant_options_quiz"
        }
      },
      "meta": {
        "category": "qualify",
        "slug": "/roof-spray-vs-sealant-options/results"
      }
    }
  },

  "final_payload_example": {
    "address": "123 Main St, Kansas City, MO 64111",
    "lat": 39.0923,
    "lng": -94.5777,
    "roof_material": "architectural_shingles",
    "roof_age": "11_15",
    "roof_condition": ["worn_faded", "granules_in_gutters"],
    "roof_goals": ["avoid_replacement", "extend_life", "compare_sprays_sealants"],
    "other_brand_contact": "yes",
    "other_brand_name": "SealantX",
    "photos_provided": true,
    "lead": {
      "name": "Jane Homeowner",
      "email": "jane@example.com",
      "phone": "+1-555-123-4567"
    },
    "urgency_level": "medium",
    "fit_likelihood": "strong_fit"
  }
}
