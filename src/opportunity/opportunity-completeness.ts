import { ExtractedOpportunity } from '../extraction/extraction.service';

export function calculateOpportunityCompleteness(opp: ExtractedOpportunity) {
  const missing = new Set<string>(opp.missingFields || []);
  let score = 0;

  if (opp.title) score += 15;
  else missing.add('title');

  if (opp.organization) score += 10;
  else missing.add('organization');

  if (opp.description && opp.description.length >= 40) score += 15;
  else missing.add('description');

  if (opp.locationText || opp.city || opp.country) score += 15;
  else missing.add('location');

  if (opp.applicationUrl || opp.contactEmail || opp.contactPhone) score += 20;
  else missing.add('application_or_contact');

  if (opp.deadline || opp.eventStartDate || opp.eventEndDate) score += 10;
  else missing.add('date_or_deadline');

  if (opp.danceStyles?.length) score += 10;
  else missing.add('dance_styles');

  if (opp.compensation) score += 5;
  else missing.add('compensation');

  return {
    completenessScore: Math.min(score, 100),
    missingFields: Array.from(missing),
  };
}