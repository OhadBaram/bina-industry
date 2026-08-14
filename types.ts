export interface Prompt {
  id: string;
  title: string;
  explanation: string;
  text: string;
  subCategory: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: string[];
}

export interface PromptLibrary {
  [categoryId: string]: Prompt[];
}

export interface B2BService {
  id: string;
  num?: string;
  title: string;
  subtitle?: string;
  icon: string;
  shortDesc: string;
  features: string[];
  badge: string;
  techBadges?: string[];
  ctaText?: string;
  serviceKey?: string;
}

export interface PainPointItem {
  id: string;
  problem: string;
  solution: string;
}

export interface UseCaseStep {
  num: string;
  title: string;
  desc: string;
}

export interface UseCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  steps: UseCaseStep[];
  timeSaved: string;
}

export interface B2BPrompt {
  id: string;
  title: string;
  explanation: string;
  text: string;
  category: string;
  subCategory: string;
  isPremium: boolean;
  createdAt: number;
}

export interface BookingLead {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  preferredTime?: string;
}
