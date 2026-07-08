import { z } from 'zod';

export const DanceOpportunitySchema = z.object({
  title: z.string(),
  organization: z.string().nullable(),

  opportunityType: z.enum([
    'dance_instructor',
    'dance_teacher',
    'audition',
    'casting',
    'performance',
    'workshop',
    'agency_signup',
    'choreographer',
    'other',
  ]),

  description: z.string(),

  danceStyles: z.array(z.string()),

  locationText: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),

  requirements: z
    .object({
      experienceLevel: z.string().nullable(),
      ageRange: z.string().nullable(),
      genderPresentation: z.string().nullable(),
      languages: z.array(z.string()),
      certifications: z.array(z.string()),
      other: z.array(z.string()),
    })
    .nullable(),

  compensation: z
    .object({
      isPaid: z.boolean().nullable(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string().nullable(),
      raw: z.string().nullable(),
    })
    .nullable(),

  applicationUrl: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),

  deadline: z.string().nullable(),
  eventStartDate: z.string().nullable(),
  eventEndDate: z.string().nullable(),

  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
});

export const DanceOpportunityExtractionResultSchema = z.object({
  isOpportunityPage: z.boolean(),
  opportunities: z.array(DanceOpportunitySchema),
});