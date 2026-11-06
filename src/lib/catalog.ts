export type PackagePlan = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  period: string; // e.g. "Per Month", "6 Month Package", "Yearly Package (12 Months)"
  durationLabel: string; // e.g. "30-Day Guided Reset", "6 Months Habit Mastery", "365-Day VIP Partnership"
  durationDays: number; // e.g. 30, 180, 365
  price: number; // e.g. 3000, 12000, 20000
  effectiveMonthly: number; // e.g. 3000, 2000, 1667
  badge?: string; // e.g. "FLEXIBLE ENTRY", "MOST POPULAR CHOICE ★", "BEST VALUE · VIP PARTNERSHIP"
  popular?: boolean;
  featured?: boolean;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  features: string[];
  status?: "active" | "draft";
};

export const defaultPackages: PackagePlan[] = [
  {
    id: "monthly",
    slug: "monthly-care",
    title: "Per Month Care",
    eyebrow: "FLEXIBLE STARTER",
    period: "Per Month",
    durationLabel: "30-Day Guided Reset",
    durationDays: 30,
    price: 3000,
    effectiveMonthly: 3000,
    badge: "FLEXIBLE ENTRY",
    popular: false,
    featured: false,
    tagline: "A gentle 30-day guided reset with clinical dietitian mentorship.",
    description:
      "Ideal for establishing dietary awareness, calibrating daily macros, and experiencing high-touch nutrition coaching with zero long-term commitment.",
    image: "/images/breakfast.jpg",
    accent: "sand",
    features: [
      "1-on-1 Intake Consultation with Dietitian Sujitha",
      "Custom Daily Calorie & Macro Framework",
      "Daily Food Diary Reviews & Weekly Calibrations",
      "WhatsApp Coach Support (Mon–Fri)",
      "Full ChatHeal Portal & 100+ Whole-Food Recipes",
    ],
    status: "active",
  },
  {
    id: "six-month",
    slug: "six-month-transformation",
    title: "6-Month Transformation",
    eyebrow: "SUSTAINABLE TRANSFORMATION",
    period: "6 Month Package",
    durationLabel: "6 Months Habit Mastery",
    durationDays: 180,
    price: 12000,
    effectiveMonthly: 2000,
    badge: "MOST POPULAR CHOICE ★",
    popular: true,
    featured: true,
    tagline: "Deep metabolic habit mastery & long-term physiological transformation.",
    description:
      "The gold-standard timeframe for hormonal balancing, visceral fat reduction, gut health repair, and building unconscious healthy habits that last.",
    image: "/images/greens.jpg",
    accent: "sage",
    features: [
      "Everything in Monthly Care, plus:",
      "12 Scheduled 1-on-1 Video Consultations",
      "Blood Pathology & Metabolic Biomarker Review",
      "Personalized Gut Health & Hormone Protocol",
      "Priority WhatsApp Coach Access + 14-Day Pause",
    ],
    status: "active",
  },
  {
    id: "yearly",
    slug: "yearly-vip",
    title: "Yearly Package",
    eyebrow: "COMPLETE HEALTH MASTERY",
    period: "Yearly Package (12 Months)",
    durationLabel: "365-Day VIP Partnership",
    durationDays: 365,
    price: 20000,
    effectiveMonthly: 1667,
    badge: "BEST VALUE · VIP PARTNERSHIP",
    popular: false,
    featured: true,
    tagline: "The ultimate 365-day partnership for sustainable, lifelong health.",
    description:
      "Our most comprehensive, high-touch partnership. Continuous habit evolution across all seasons, holidays, and life events with direct dietitian guidance.",
    image: "/images/calm.jpg",
    accent: "gold",
    features: [
      "Complete 365-Day High-Touch Mentorship with Dietitian Sujitha",
      "Unlimited Priority Video Check-ins & Consultations",
      "Quarterly Comprehensive Blood & Metabolic Pathology Audits",
      "Full Family Meal Blueprints & Dining-Out Guidance",
      "Unlimited Pause Time & 24/7 Priority Emergency Channel",
    ],
    status: "active",
  },
];

export type Programme = {
  slug: string;
  title: string;
  eyebrow: string;
  category: string;
  description: string;
  image: string;
  weeks: number;
  price: number;
  features: string[];
  accent: string;
};
// Presentation-only catalogue. Prices, durations and inclusions require client approval.
export const programmes: Programme[] = [
  {
    slug: "everyday-nourish",
    title: "Everyday Nourish",
    eyebrow: "A GENTLER START",
    category: "Everyday wellness",
    description:
      "Make everyday meals work for your everyday life. Build a foundation of whole foods, mindful eating and sustainable routines.",
    image: "/images/greens.jpg",
    weeks: 4,
    price: 1499,
    features: [
      "Personal nutrition assessment",
      "Coach-reviewed food routine",
      "Daily calorie & macro diary",
      "Recipe and wellness library",
    ],
    accent: "sage",
  },
  {
    slug: "balanced-living",
    title: "Balanced Living",
    eyebrow: "MORE PERSONAL SUPPORT",
    category: "Weight & habits",
    description:
      "A more considered approach to weight and wellbeing. Understand your habits, enjoy familiar foods and find a routine you can return to.",
    image: "/images/hero.jpg",
    weeks: 8,
    price: 3499,
    features: [
      "Everything in Everyday Nourish",
      "Personalised nutrition guidance",
      "Scheduled one-to-one check-ins",
      "Weekly progress conversations",
    ],
    accent: "sand",
  },
  {
    slug: "whole-you",
    title: "The Whole You",
    eyebrow: "FOOD. MOVEMENT. REST.",
    category: "Holistic wellbeing",
    description:
      "Bring nourishment, gentle movement and restorative routines together, with personal support that sees the bigger picture.",
    image: "/images/yoga.jpg",
    weeks: 12,
    price: 5999,
    features: [
      "Personalised wellness roadmap",
      "Nutrition and lifestyle review",
      "Movement & mindfulness resources",
      "Ongoing coach check-ins",
    ],
    accent: "blue",
  },
];
export const topics = [
  {
    title: "Weight & everyday habits",
    text: "Practical nutrition support built around your routine.",
    icon: "leaf",
  },
  {
    title: "Metabolic wellbeing",
    text: "Food and lifestyle conversations alongside your existing care.",
    icon: "activity",
  },
  {
    title: "Thyroid & nutrition",
    text: "Individual food habits discussed with your coach.",
    icon: "heart",
  },
  {
    title: "Whole-body wellbeing",
    text: "Connect movement, sleep, hydration and mindful eating.",
    icon: "sun",
  },
];
export const recipes = [
  {
    slug: "everyday-nourish-bowl",
    title: "The everyday nourish bowl",
    image: "/images/greens.jpg",
    tag: "Lunch",
    time: 15,
    calories: 380,
    description:
      "A colourful bowl with chickpeas, crunchy vegetables and a lemon dressing.",
    ingredients: [
      "100 g cooked chickpeas",
      "½ cucumber",
      "1 tomato",
      "½ avocado",
      "Lemon juice and olive oil",
    ],
    steps: [
      "Rinse and drain the chickpeas.",
      "Chop your vegetables into bite-sized pieces.",
      "Whisk lemon juice with a little olive oil.",
      "Toss everything together and enjoy.",
    ],
  },
  {
    slug: "slow-morning-oats",
    title: "Slow-morning berry oats",
    image: "/images/breakfast.jpg",
    tag: "Breakfast",
    time: 10,
    calories: 290,
    description: "Warm, creamy oats, fresh berries and a scattering of seeds.",
    ingredients: [
      "40 g rolled oats",
      "150 ml milk of your choice",
      "75 g fresh berries",
      "1 tsp pumpkin seeds",
    ],
    steps: [
      "Simmer the oats and milk gently for five minutes.",
      "Spoon into your favourite bowl.",
      "Add the berries and seeds just before serving.",
    ],
  },
  {
    slug: "colourful-weekday-bowl",
    title: "A colourful weekday bowl",
    image: "/images/hero.jpg",
    tag: "Lunch",
    time: 20,
    calories: 420,
    description:
      "A satisfying mix of seasonal vegetables, cooked grains and your favourite protein.",
    ingredients: [
      "100 g cooked rice",
      "100 g cooked chickpeas",
      "Mixed seasonal vegetables",
      "Fresh herbs",
      "Lemon dressing",
    ],
    steps: [
      "Cook your grains and allow to cool slightly.",
      "Prepare the vegetables and protein.",
      "Arrange in a bowl, add herbs and finish with dressing.",
    ],
  },
];
export const articles = [
  {
    slug: "whole-foods",
    category: "NUTRITION",
    title: "Good food. Fewer complications.",
    image: "/images/greens.jpg",
    intro:
      "Whole-food nutrition starts with ingredients you recognise and meals you enjoy.",
    paragraphs: [
      "Build a routine around familiar vegetables, fruits, grains, pulses and other foods that fit your preferences. A sustainable eating pattern should feel possible on your busiest days.",
      "Your coach can help you review portions and combinations. The goal is a flexible routine, with space for the foods and traditions that matter to you.",
    ],
  },
  {
    slug: "mindful-routines",
    category: "MINDFUL LIVING",
    title: "A little space for yourself.",
    image: "/images/calm.jpg",
    intro: "Eating, resting and moving all have a place in your day.",
    paragraphs: [
      "Start by noticing your routine. When do you make time for meals? What makes it easier to pause? Which small changes feel realistic?",
      "Use your journal to reflect on the habits you want to practise. Bring your questions to your next check-in and choose one manageable step together.",
    ],
  },
  {
    slug: "move-your-way",
    category: "MOVEMENT",
    title: "Movement that meets you where you are.",
    image: "/images/yoga.jpg",
    intro: "Create a little more room for movement in a way that suits you.",
    paragraphs: [
      "Your preferences and current ability matter. Discuss suitable yoga, strength or endurance activities with your coach and an appropriate professional where needed.",
      "Consistency can begin with a small, comfortable routine. Your programme should adapt to you, and leave room for rest.",
    ],
  },
];
export const money = (n: number) => "₹" + n.toLocaleString("en-IN");
