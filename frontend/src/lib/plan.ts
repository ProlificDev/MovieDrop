export type Plan = 'free' | 'basic' | 'pro';

export interface PlanConfig {
  name: string;
  price: number;
  maxNotifications: number | null; // null = unlimited
  emailNotifications: boolean;
  customTiming: boolean;
  weeklyDigest: boolean;
  hiddenGems: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    maxNotifications: 10,
    emailNotifications: true,
    customTiming: false,
    weeklyDigest: false,
    hiddenGems: false,
  },
  basic: {
    name: 'Basic',
    price: 1500,
    maxNotifications: null,
    emailNotifications: true,
    customTiming: true,
    weeklyDigest: false,
    hiddenGems: false,
  },
  pro: {
    name: 'Pro',
    price: 4500,
    maxNotifications: null,
    emailNotifications: true,
    customTiming: true,
    weeklyDigest: true,
    hiddenGems: true,
  },
};

const PLAN_KEY = 'moviepulse_plan';

export function getCurrentPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  return (localStorage.getItem(PLAN_KEY) as Plan) || 'free';
}

export function setCurrentPlan(plan: Plan): void {
  localStorage.setItem(PLAN_KEY, plan);
}

export function getPlanConfig(plan?: Plan): PlanConfig {
  return PLANS[plan ?? getCurrentPlan()];
}

export function canAddNotification(currentCount: number): boolean {
  const { maxNotifications } = getPlanConfig();
  if (maxNotifications === null) return true;
  return currentCount < maxNotifications;
}

export function canUseCustomTiming(): boolean {
  return getPlanConfig().customTiming;
}
