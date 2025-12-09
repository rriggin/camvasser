# Landing Page Flows

## Flow Types

1. **Qualify** - Lead qualification flows
2. **Emergency** - Urgent scheduling flows
3. **Educate** - Problem awareness flows
4. **Address Search** - Existing CompanyCam photo lookup (current tenant index)

## Flow Status

| Audience / Situation                                   | Number | Category       | URL Slug                       | CTA / Message                                                               | Status  |
|--------------------------------------------------------|:------:|----------------|--------------------------------|-----------------------------------------------------------------------------|---------|
| Homeowner with roof claim denial                       |   1    | qualify        | /roof-claim-denial             | > see if you qualify                                                        | ✅ LIVE |
| Homeowner with roof spray interest (other brand aware) |   1    | qualify        | /roof-spray-vs-sealant-options | > see if it's a fit                                                         | ✅ LIVE |
| Homeowner with roof leak                               |   2    | emergency      | /roof-leak-emergency           | > schedule an emergency appointment                                         | TODO    |
| Homeowner with roof insurance cancellation             |   1    | qualify        | /roof-insurance-cancellation   | > find out what your options are                                            | TODO    |
| Homeowner with dirty roof (not problem aware)          |   3    | educate        | /dirty-roof-costs              | > learn how a dirty roof is costing you money                               | ✅ LIVE |
| Homeowner with clogged gutters                         |   3    | educate        | /clogged-gutters-damage        | > learn how clogged gutters are damaging your roof                          | TODO    |
| Homeowner with ventilation issues (not problem aware)  |   3    | educate        | /roof-ventilation-issues       | > find out how ventilation is the key to restoring and prolonging your roof | TODO    |
| Homeowner with energy questions                        |   3    | educate        | /attic-energy-loss             | > find out how your attic is leaking energy and costing you thousands       | TODO    |
| Homeowner looking for roof quote                       |   4    | address search | /instant-roof-quote            | > get an instant estimate in seconds, no appointment required               | TODO    |
| View project photos (CompanyCam)                       |   4    | address search | /photos                        | > enter your address to view photos from your roofing project               | ✅ LIVE |
