import { z } from 'zod';

export const BUSINESS_TYPES = [
  'retail_shop',
  'farm',
  'service',
  'manufacturer',
  'cooperative',
  'other',
] as const;

export const step1Schema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(BUSINESS_TYPES),
  industry: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
});

export const step2Schema = z.object({
  yearsOperating: z.coerce.number().int().min(0).max(100),
  numEmployees: z.coerce.number().int().min(1).max(10000),
});

export const step3Schema = z.object({
  goals: z.string().min(10).max(1000),
});

export const onboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type Step1Form = z.infer<typeof step1Schema>;
export type Step2Form = z.infer<typeof step2Schema>;
export type Step3Form = z.infer<typeof step3Schema>;
export type OnboardingForm = z.infer<typeof onboardingSchema>;

export const ONBOARDING_DRAFT_KEY = 'smartledger-onboarding-draft';

export interface OnboardingDraft extends Partial<OnboardingForm> {
  step?: number;
}
