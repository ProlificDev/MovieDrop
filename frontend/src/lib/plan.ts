export type Plan = 'free' | 'basic' | 'pro';

export interface PlanConfig {
  name: string;
  price: number;
  maxNotifications: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  customTiming: boolean;
  weeklyDigest: boolean;
  hiddenGems: boolean;
  earlyAccess: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    name: 'Free',
    price: 0,
    maxNotifications: 1,
    emailNotifications: true,
    pushNotifications: false,
    customTiming: false,
    weeklyDigest: false,
    hiddenGems: false,
    earlyAccess: false,
  },
  basic: {
    name: 'Basic',
    price: 1500,
    maxNotifications: 10,
    emailNotifications: true,
    pushNotifications: false,
    customTiming: true,
    weeklyDigest: false,
    hiddenGems: false,
    earlyAccess: true,
  },
  pro: {
    name: 'Pro',
    price: 4500,
    maxNotifications: 50,
    emailNotifications: true,
    pushNotifications: true,
    customTiming: true,
    weeklyDigest: true,
    hiddenGems: true,
    earlyAccess: true,
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
  return currentCount < getPlanConfig().maxNotifications;
}

export function canUsePush(): boolean {
  return getPlanConfig().pushNotifications;
}
