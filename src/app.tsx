import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { Check, X, ChevronRight, Trophy, Users, Home, BookOpen, Dumbbell, RotateCcw, Heart, MessageCircle, Send, Crown, ArrowLeft } from "lucide-react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  // Dark neon palette
  bg:       "#0A0A0F",
  surface:  "#111118",
  card:     "#16161E",
  cardHov:  "#1E1E28",
  border:   "#2A2A3A",
  borderHi: "#3A3A50",

  // Neon greens (logo-matched)
  neon:     "#39FF14",
  neonD:    "#22CC00",
  neonL:    "#39FF1420",
  neonM:    "#39FF1440",

  // Accent
  indigo:   "#6366F1",
  indigoL:  "#6366F120",
  indigoM:  "#6366F140",
  teal:     "#10B981",
  tealL:    "#10B98115",
  yellow:   "#E8FF47",
  yellowD:  "#C8DF00",
  red:      "#FF3B3B",
  orange:   "#FF6B00",
  purple:   "#A855F7",
  pink:     "#EC4899",
  sky:      "#38BDF8",

  // Text
  textPrimary:   "#F0F0F8",
  textSecondary: "#8888AA",
  textMuted:     "#55556A",
  textDim:       "#33334A",

  // Special
  dark: "#0F172A",
};

const shadow = {
  neon:   `0 0 20px #39FF1430, 0 0 40px #39FF1415`,
  indigo: `0 0 20px #6366F130`,
  card:   `0 4px 24px rgba(0,0,0,0.4)`,
  sm:     `0 2px 8px rgba(0,0,0,0.3)`,
};


// ── STORAGE ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "comeback_v3";

interface Avatar {
  gender: "male"|"female"|"nonbinary";
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  bodyType: string;
}

interface BodyProfile {
  height: string;
  weight: string;
  gender: string;
  goal: string;
}

interface SavedState {
  sportId: string;
  injuryId: string;
  severityId: string;
  goalId: string;
  startDate: string;
  lastActiveDate: string;
  streak: number;
  streakAlive: boolean;
  completedTasks: Record<string, boolean[]>;
  suppChecked: Record<string, boolean[]>;
  unlockedMilestones: number[];
  plan: "free"|"pro"|"elite";
  trialStartDate: string;
  avatar: Avatar|null;
  bodyProfile: BodyProfile|null;
  posts: Record<string, Post[]>;
}

function todayStr(): string {
  return new Date().toISOString().slice(0,10);
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function loadState(): SavedState|null {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

function saveState(s: SavedState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function clearState(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}


// ── DATA ──────────────────────────────────────────────────────────────────────
const PLAN_PRO_URL   = "https://buy.stripe.com/5kQ3cu5P36NtcWh1ZC67S00";
const PLAN_ELITE_URL = "https://buy.stripe.com/dRm9AS91ffjZbSd1ZC67S01";

const SPORTS = [
  {id:"basketball",label:"Basketball",icon:"🏀",color:"#FF6B00",athlete:"LeBron James",liveUsers:142,
   img:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
   quotes:['"Ice 20 min, elevate, compress. Don\'t rush the timeline."','"Sleep is my best recovery tool. 12 hours a night."','"The hardest day is day 3. Push through it."','"30g protein within 20 min of stopping."','"Mind over matter is real but so is the protocol."']},
  {id:"football",label:"Football",icon:"🏈",color:"#22CC00",athlete:"Patrick Mahomes",liveUsers:198,
   img:"https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&q=80",
   quotes:['"Work range of motion before resistance."','"Visualization during recovery is underrated."','"Cold tub is non-negotiable. 8 minutes every session."','"Your PT is your co-coach."','"Fear of re-injury is the real enemy."']},
  {id:"soccer",label:"Soccer",icon:"⚽",color:"#38BDF8",athlete:"Cristiano Ronaldo",liveUsers:247,
   img:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
   quotes:['"Cold water immersion after every session."','"Sleep 8 hours minimum."','"Nutrition is 50% of recovery."','"Flexibility saved my knees."','"Coming back at 95% beats returning at 75%."']},
  {id:"baseball",label:"Baseball",icon:"⚾",color:"#FF3B3B",athlete:"Shohei Ohtani",liveUsers:87,
   img:"https://images.unsplash.com/photo-1508344928928-7165b67de128?w=400&q=80",
   quotes:['"Rotator cuff work is never optional."','"Arm care starts before you feel pain."','"I track HRV every morning."','"Recovery is just another form of training."','"Cross-training in the pool saved my shoulder."']},
  {id:"tennis",label:"Tennis",icon:"🎾",color:"#84CC16",athlete:"Serena Williams",liveUsers:63,
   img:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80",
   quotes:['"Listen to inflammation signals."','"Mental game breaks down first in long recoveries."','"Eccentric strengthening for tendons."','"Cry and then do the work."','"Work with a sports dietitian."']},
  {id:"track",label:"Track & Field",icon:"🏃",color:"#A855F7",athlete:"Usain Bolt",liveUsers:45,
   img:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
   quotes:['"Hip flexor mobility is the unlock."','"The body remembers what you build."','"Speed is neurological as much as muscular."','"Water running kept my fitness alive."','"God didn\'t give you these legs to sit."']},
  {id:"swimming",label:"Swimming",icon:"🏊",color:"#38BDF8",athlete:"Michael Phelps",liveUsers:38,
   img:"https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",
   quotes:['"Shoulder recovery is 60% sleep."','"Get a therapist, not just a PT."','"Recovery is a race too."','"Show up daily, even at 20%."','"Gratitude practice kept me from spiraling."']},
  {id:"volleyball",label:"Volleyball",icon:"🏐",color:"#F59E0B",athlete:"Misty May-Treanor",liveUsers:29,
   img:"https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80",
   quotes:['"Single-leg balance from day 3."','"Smart is smarter than tough."','"Core stability is the foundation."','"Protocol and prayer."','"Track your swelling daily."']},
  {id:"golf",label:"Golf",icon:"⛳",color:"#22CC00",athlete:"Tiger Woods",liveUsers:54,
   img:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80",
   quotes:['"Core is everything."','"Never skip the small work."','"Patience is a skill."','"What you rebuild is more valuable."','"Ego in the weight room will re-injure you."']},
  {id:"mma",label:"MMA / Combat",icon:"🥊",color:"#FF3B3B",athlete:"Conor McGregor",liveUsers:176,
   img:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80",
   quotes:['"Fascia work daily separates 6-month from 4."','"I used doubt as fuel every day."','"Ice, elevation, time. The shortcut IS the protocol."','"Isolation kills motivation."','"Every champion has a comeback story."']},
  {id:"gymnastics",label:"Gymnastics",icon:"🤸",color:"#EC4899",athlete:"Simone Biles",liveUsers:41,
   img:"https://images.unsplash.com/photo-1577474994498-5d7693a5c9d9?w=400&q=80",
   quotes:['"Mental recovery is as real as physical."','"Taking time off was the bravest decision."','"Trust your body\'s timeline."','"Fear is just another skill to master."','"The body will catch up to the mind."']},
  {id:"cycling",label:"Cycling",icon:"🚴",color:"#6366F1",athlete:"Chris Froome",liveUsers:33,
   img:"https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&q=80",
   quotes:['"Rebuild cadence before power."','"Doctors said never race again. I won Vuelta."','"Small wins compound."','"My physio was more important than my coach."','"Let yourself feel it."']},
  {id:"hockey",label:"Hockey",icon:"🏒",color:"#38BDF8",athlete:"Sidney Crosby",liveUsers:89,
   img:"https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=400&q=80",
   quotes:['"Concussion protocol is sacred."','"Cognitive rest is a skill."','"Sleep became medicine."','"A good team respects your recovery."','"Fear of another hit is real by phase 3."']},
  {id:"rugby",label:"Rugby",icon:"🏉",color:"#F59E0B",athlete:"Richie McCaw",liveUsers:47,
   img:"https://images.unsplash.com/photo-1603575448360-153f093fd0b2?w=400&q=80",
   quotes:['"Proprioception drills — religiously."','"Sometimes playing through it is wrong."','"Week 3 is the mental valley."','"Listen to your doctor."','"Cold water changed my recovery rate."']},
  {id:"lacrosse",label:"Lacrosse",icon:"🥍",color:"#F97316",athlete:"Paul Rabil",liveUsers:25,
   img:"https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=400&q=80",
   quotes:['"Eccentric loading is the cheat code."','"Second ACL — came back 3 weeks early."','"Fix the root cause."','"Faith over fear."','"Every drill served my return."']},
];

const INJURIES = [
  {id:"acl",label:"ACL Tear",icon:"🦵",weeks:36,phase1:"Weeks 1–6: Swelling control, quad activation, ROM 0–90°. Ice 20 min/hr.",phase2:"Weeks 7–16: Strength rebuild, single-leg press, bike, Nordic curls wk 10.",phase3:"Weeks 17–36: Sport-specific drills, hop test >85% symmetry."},
  {id:"meniscus",label:"Meniscus Tear",icon:"🦵",weeks:24,phase1:"Weeks 1–4: Crutches, ice, pain management. Straight-leg raises only. No flexion past 90°.",phase2:"Weeks 5–12: Quad/hamstring balance, bike week 6. No twisting.",phase3:"Weeks 13–24: Lateral movement, cutting drills, physician clearance."},
  {id:"ankle",label:"Ankle Sprain",icon:"🦶",weeks:8,phase1:"Days 1–7: POLICE protocol. No weight-bearing Grade 2+.",phase2:"Weeks 2–4: Proprioception, resistance bands, calf raises.",phase3:"Weeks 5–8: Plyometrics, single-leg balance over 30 seconds."},
  {id:"hamstring",label:"Hamstring Strain",icon:"🦵",weeks:12,phase1:"Weeks 1–2: Active rest, ice. NO passive static stretching — increases re-tear risk.",phase2:"Weeks 3–6: Nordic eccentric program (Askling protocol), bike week 3.",phase3:"Weeks 7–12: Graduated sprint 60 to 100% with weekly H-test."},
  {id:"rotator",label:"Rotator Cuff",icon:"💪",weeks:20,phase1:"Weeks 1–6: Sling, pendulums, zero active elevation. Cryotherapy 20 min 5x/day.",phase2:"Weeks 7–14: Bands, scapular stability. External/internal rotation at 0 degrees.",phase3:"Weeks 15–20: Progressive overhead, throwing program. ASES score 85+."},
  {id:"achilles",label:"Achilles Tendon",icon:"🦶",weeks:26,phase1:"Weeks 1–8: Boot immobilization. Upper body only.",phase2:"Weeks 9–18: Alfredson eccentric heel drops 3x15 twice daily (Grade A evidence).",phase3:"Weeks 19–26: Walk to jog to run to sprint. VISA-A score 90+ before clearance."},
  {id:"concussion",label:"Concussion",icon:"🧠",weeks:6,phase1:"Days 1–5: Full cognitive and physical rest. No screens. Symptom check every 2hrs.",phase2:"Weeks 2–4: Sub-symptom aerobic only. Buffalo Treadmill Test protocol.",phase3:"Weeks 5–6: Non-contact sport drills. SCAT5 plus physician sign-off required."},
  {id:"back",label:"Lower Back Strain",icon:"🔙",weeks:8,phase1:"Weeks 1–2: McKenzie extension protocol. Cat-cow, bird-dog, decompression walks.",phase2:"Weeks 3–5: McGill Big 3, dead bug progression, hip hinge patterning.",phase3:"Weeks 6–8: Deadlift at bodyweight, RDL, core loading progression."},
  {id:"shin",label:"Shin Splints",icon:"🦵",weeks:6,phase1:"Days 1–10: Rest, ice massage 3x/day, calf stretching.",phase2:"Weeks 2–4: Swim, bike, calf strengthening. Arch support check.",phase3:"Weeks 5–6: Walk-run intervals, gait analysis, 10% volume rule."},
  {id:"shoulder",label:"Shoulder Dislocation",icon:"💪",weeks:12,phase1:"Weeks 1–4: Sling. No elevation above 90 degrees. Cryotherapy plus NSAIDs.",phase2:"Weeks 5–8: Band ER/IR, scapular stabilization, isometric strengthening.",phase3:"Weeks 9–12: Overhead cleared. Apprehension test negative before contact."},
  {id:"knee",label:"Knee Pain",icon:"🦵",weeks:10,phase1:"Weeks 1–2: RICE, quad sets, avoid stairs. Inflammation control priority.",phase2:"Weeks 3–6: Bike, step-ups, mini-squats 0 to 45 degrees.",phase3:"Weeks 7–10: Progressive load, sport-specific movement reintroduction."},
  {id:"wrist",label:"Wrist Fracture",icon:"🖐",weeks:16,phase1:"Weeks 1–6: Cast immobilization. Bone nutrition: calcium, D3, K2.",phase2:"Weeks 7–12: ROM restoration, grip putty, low-resistance wrist curls.",phase3:"Weeks 13–16: Progressive load tolerance, sport grip patterns."},
];

const SEVERITIES = [
  {id:"mild",label:"Mild",icon:"🟡",desc:"Minor discomfort, partial activity possible",color:"#F59E0B",bg:"#F59E0B20"},
  {id:"moderate",label:"Moderate",icon:"🟠",desc:"Significant pain, limited activity",color:"#F97316",bg:"#F9731620"},
  {id:"severe",label:"Severe",icon:"🔴",desc:"Major injury, minimal activity",color:"#FF3B3B",bg:"#FF3B3B20"},
  {id:"post_surgery",label:"Post-Surgery",icon:"🏥",desc:"Surgical recovery, strict protocol required",color:"#6366F1",bg:"#6366F120"},
];

const GOALS_LIST = [
  {id:"return",label:"Return to Sport",icon:"🏆",desc:"Full competitive return"},
  {id:"pain",label:"Pain-Free Living",icon:"💆",desc:"Manage pain, improve daily function"},
  {id:"fitness",label:"Maintain Fitness",icon:"💪",desc:"Stay strong while healing"},
  {id:"fast",label:"Fastest Recovery",icon:"⚡",desc:"Optimise every variable"},
];

const SUPPLEMENTS = [
  {id:"d3",label:"Vitamin D3",dose:"2,000 IU",time:"7:00 AM",with:"breakfast",note:"Bone and immune support. Take with a fatty meal for best absorption.",color:"#F59E0B",bg:"#F59E0B20"},
  {id:"omega3",label:"Omega-3",dose:"1g EPA+DHA",time:"8:00 AM",with:"breakfast",note:"Reduces inflammation 25–40%. Take with food to avoid aftertaste.",color:"#38BDF8",bg:"#38BDF820"},
  {id:"vitc",label:"Vitamin C",dose:"500mg",time:"10:00 AM",with:"snack",note:"Collagen synthesis for tendons. Pairs best with collagen peptides.",color:"#F97316",bg:"#F9731620"},
  {id:"collagen",label:"Collagen Peptides",dose:"10g",time:"10:00 AM",with:"pre-rehab",note:"Take 30 min before rehab + Vitamin C for maximum tendon synthesis.",color:"#EC4899",bg:"#EC489920"},
  {id:"zinc",label:"Zinc",dose:"15mg",time:"1:00 PM",with:"lunch",note:"Tissue repair and immune. Take with food — causes nausea on empty stomach.",color:"#22CC00",bg:"#22CC0020"},
  {id:"mag",label:"Magnesium",dose:"400mg",time:"9:00 PM",with:"dinner",note:"Take at night — aids sleep quality and muscle relaxation.",color:"#A855F7",bg:"#A855F720"},
];

const DIET_GUIDE = [
  {category:"🐟 Protein (Every Meal)",foods:"Salmon, sardines, eggs, chicken, Greek yogurt, lentils",avoid:"Processed deli meats, fried proteins"},
  {category:"🥦 Anti-Inflammatory",foods:"Turmeric, ginger, leafy greens, berries, tart cherry, olive oil",avoid:"Refined sugar, white bread, vegetable oils"},
  {category:"🦴 Bone and Tendon",foods:"Dairy or fortified alternatives, bone broth, leafy greens, fatty fish",avoid:"Excess alcohol, high-sodium foods"},
  {category:"⚡ Energy Pre-Workout",foods:"Sweet potato, oats, banana, dates",avoid:"Simple sugars, alcohol — delays recovery 48hrs+"},
  {category:"💧 Hydration",foods:"3–4L water daily, electrolytes if sweating, coconut water",avoid:"Sports drinks with HFCS, energy drinks"},
];

type Task = {time:string; task:string; icon:string; iconColor:string; iconBg:string};

const DAY_PROTOCOLS: Task[][] = [
  [
    {time:"6:30 AM",task:"Hydrate 500ml water with a pinch of sea salt for electrolytes before anything else",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"5-min deep breathing (4-7-8 method) plus gentle mobility to loosen the injured area",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"Breakfast plus morning supplements: D3 2,000 IU and Omega-3 1g with food",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Rehab session A: injury-specific exercises 3 sets. Focus on controlled movement, zero pain",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Vitamin C 500mg plus Collagen 10g immediately after rehab — collagen synthesis window",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"Lunch: 40g protein (salmon or chicken) plus complex carbs plus leafy greens. Zinc 15mg with meal",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:00 PM",task:"Ice and compression 20 min on injury site plus elevation above heart to reduce inflammation",icon:"🧊",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:00 PM",task:"Low-impact cardio: 20 min stationary bike or pool walk to maintain base fitness",icon:"🚴",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: 40g protein plus anti-inflammatory fats (olive oil, avocado). Magnesium 400mg",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"10-min foam roll avoiding injured area, light stretching, sleep target 9 hours",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"Morning hydration 500ml. Rate injury pain 1 to 10 before getting out of bed",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"10-min dynamic warm-up: leg swings, arm circles, hip circles — activate without loading",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"Breakfast plus D3 2,000 IU and Omega-3 1g. Take with fat-containing meal for absorption",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Rehab session B: add one rep or 5% more resistance than last session. Progressive overload",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen 10g plus Vitamin C 500mg post-session. 30-min window for tendon synthesis",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"Lunch: 40g protein plus sweet potato plus spinach salad. Zinc 15mg with meal",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:30 PM",task:"Ice massage using frozen cup on injury 10 min. Reduces localized inflammation better than ice pack",icon:"🧊",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:00 PM",task:"Upper body strength non-injured muscles: 3x15 rows, press, curls to maintain muscle mass",icon:"💪",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: salmon or sardines plus quinoa plus broccoli. Magnesium 400mg before bed",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:30 PM",task:"Visualization: 5 min eyes closed, picture yourself fully recovered competing. Then sleep",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"Hydrate 500ml plus tart cherry juice 8oz — natural anti-inflammatory reducing DOMS by 22%",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"Contrast shower: 2 min warm then 30 sec cold, repeat 4 cycles. Boosts circulation and recovery",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"High-protein breakfast: 3 eggs plus Greek yogurt. D3 plus Omega-3 with meal",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Active recovery day: 50% intensity rehab. Focus on range of motion not load today",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen 10g plus Vitamin C 500mg post-session",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"Lunch: 40g protein. Anti-inflammatory focus: turmeric in meal, olive oil dressing",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:00 PM",task:"Pool session 20 min OR ice bath 10 min at 55F if available — elite recovery method",icon:"🏊",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:30 PM",task:"Core stability: dead bug 3x10, pallof press 3x12, bird-dog 3x10 each side",icon:"💪",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: chicken or tofu plus lentils plus vegetables. Magnesium 400mg",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"Gratitude journal: write 3 things you CAN do today. Sleep 9 hours",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"500ml water. Photograph the injury weekly to track swelling reduction over time",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"10-min yoga flow for recovery: hip flexors, hamstrings, shoulders, spine",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"Breakfast: oatmeal plus protein powder plus berries. D3 plus Omega-3 with meal",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Rehab session C: neuromuscular focus. Balance drills and proprioception training today",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen plus Vitamin C immediately post-session",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"Lunch: 35–40g protein. Zinc 15mg. Add ginger to meal for gingerol anti-inflammatory compound",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"3:00 PM",task:"Compression sleeve 30 min OR legs-up-wall 20 min to reduce edema",icon:"🧊",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:30 PM",task:"Mental skills: sport psychology content OR journaling recovery goals and progress",icon:"🧠",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: fatty fish or lean beef plus sweet potato plus greens. Magnesium 400mg",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"No screens 1hr before sleep. Read or meditate. 9-hr sleep target",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"Hydrate 500ml. Even 5-min gentle walking or crutch-assisted movement boosts morning circulation",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"Body check: rate pain, stiffness, energy 1 to 10. Adjust today intensity if pain above 5",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"Breakfast plus D3 plus Omega-3. High-calorie day if energy is low — do not under-eat during recovery",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Rehab session D: eccentric focus. Slow 3-second lowering phase. Eccentric loading heals tendons",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen 10g plus Vitamin C 500mg. Protein shake within 20 min post-session",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:30 PM",task:"Lunch: eggs plus whole grains plus leafy greens. Zinc 15mg with meal",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:30 PM",task:"20-min stationary bike easy pace. Pedaling lubricates joints without impact stress",icon:"🚴",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:00 PM",task:"Stretch and foam roll 10 min full body avoiding injured site: quads, glutes, calves",icon:"💪",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: Greek yogurt plus nuts plus fruit OR full protein meal. Magnesium 400mg",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"Sleep hygiene: cool room 65 to 68F, dark, no phone. 9-hr recovery window",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"500ml water plus electrolyte tablet if yesterday was a heavy sweat session",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"10-min mindfulness meditation. Reduces cortisol which is proven to slow tissue healing",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"High-protein start: protein shake plus eggs. D3 plus Omega-3 with meal",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Heavy rehab day: push to 80% effort if pain allows. Log reps and resistance used",icon:"🏋️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen plus Vitamin C immediately. Protein shake within 20 min post-session",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"High-protein lunch: 50g protein today. Salmon plus rice plus avocado. Zinc 15mg",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:00 PM",task:"Ice bath or contrast therapy post heavy session. 10 min at 55F",icon:"🧊",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"5:00 PM",task:"Review progress: compare this week exercises to last week. Are you stronger?",icon:"📊",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: lean protein plus complex carbs plus vegetables. Magnesium 400mg",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"Call or text someone on your support team. Recovery is social. Then sleep",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
  [
    {time:"6:30 AM",task:"Active recovery day: 500ml water plus light 10-min walk outside if possible",icon:"💧",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"7:00 AM",task:"Gentle stretch 20 min full body. Hold each stretch 30 to 45 seconds. Breathe deeply",icon:"🌅",iconColor:"#F59E0B",iconBg:"#F59E0B20"},
    {time:"8:00 AM",task:"Breakfast plus D3 plus Omega-3. Rest day: still hit protein target with slight calorie reduction",icon:"💊",iconColor:"#6366F1",iconBg:"#6366F120"},
    {time:"10:00 AM",task:"Weekly check-in: measure range of motion, note pain levels, log everything in journal",icon:"📋",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"10:30 AM",task:"Collagen plus Vitamin C even on rest days as tendon building is a continuous process",icon:"💊",iconColor:"#EC4899",iconBg:"#EC489920"},
    {time:"12:00 PM",task:"Balanced lunch: protein plus fat plus fiber. Zinc 15mg",icon:"🥗",iconColor:"#22CC00",iconBg:"#22CC0020"},
    {time:"2:00 PM",task:"Mental recovery: watch film of your sport, stay connected to the game mentally",icon:"🎬",iconColor:"#38BDF8",iconBg:"#38BDF820"},
    {time:"4:00 PM",task:"Light pool session 15 min OR gentle yoga. Active recovery not passive rest",icon:"🏊",iconColor:"#A855F7",iconBg:"#A855F720"},
    {time:"7:00 PM",task:"Dinner: meal prep for the week ahead. Magnesium 400mg. Prioritize sleep tonight",icon:"🍽️",iconColor:"#39FF14",iconBg:"#39FF1420"},
    {time:"9:00 PM",task:"Plan next week rehab goals. Write them down. Sleep 9 plus hours — biggest recovery day",icon:"😴",iconColor:"#6366F1",iconBg:"#6366F120"},
  ],
];

const DAILY_CONTENT = [
  {type:"verse",quote:"I can do all things through Christ who strengthens me.",text:"Philippians 4:13"},
  {type:"verse",quote:"Be strong and courageous. Do not be afraid.",text:"Joshua 1:9"},
  {type:"motivation",quote:"Champions are made in the moments they want to quit.",text:"Recovery Wisdom"},
  {type:"verse",quote:"Those who hope in the Lord will renew their strength.",text:"Isaiah 40:31"},
  {type:"motivation",quote:"Every day you show up is a day closer to comeback.",text:"Recovery Wisdom"},
  {type:"verse",quote:"For I know the plans I have for you — plans to prosper you.",text:"Jeremiah 29:11"},
  {type:"motivation",quote:"The comeback is always stronger than the setback.",text:"Recovery Wisdom"},
  {type:"verse",quote:"He gives strength to the weary, power to the faint.",text:"Isaiah 40:29"},
  {type:"motivation",quote:"Discipline is doing it when you do not feel like it.",text:"Recovery Wisdom"},
  {type:"verse",quote:"Do not grow weary in doing good — at the proper time you will reap.",text:"Galatians 6:9"},
  {type:"motivation",quote:"Your only competition is who you were yesterday.",text:"Recovery Wisdom"},
  {type:"verse",quote:"Consider it joy when you face trials — testing produces perseverance.",text:"James 1:2-3"},
  {type:"motivation",quote:"Small progress is still progress. Keep going.",text:"Recovery Wisdom"},
  {type:"verse",quote:"Well done, good and faithful servant.",text:"Matthew 25:23"},
];

const MILESTONES = [
  {day:1,badge:"🌱",title:"Day One",reward:"You started. That is the hardest step.",verse:"Be strong and courageous — Joshua 1:9"},
  {day:3,badge:"🔥",title:"3 Days",reward:"Resilience Badge unlocked.",verse:"I can do all things through Christ — Phil 4:13"},
  {day:7,badge:"⚡",title:"One Week",reward:"Streak Shield earned.",verse:"Endurance produces character — Romans 5:4"},
  {day:14,badge:"💪",title:"Two Weeks",reward:"Warrior Badge plus nutrition guide unlocked.",verse:"Press on toward the goal — Philippians 3:14"},
  {day:21,badge:"🏅",title:"21 Days",reward:"Habit formed. Custom protocol unlocked.",verse:"Do not grow weary — Galatians 6:9"},
  {day:30,badge:"🏆",title:"30 Days",reward:"Champion Badge earned.",verse:"They will soar on wings like eagles — Isaiah 40:31"},
  {day:60,badge:"🦅",title:"60 Days",reward:"Eagle Badge plus full supplement guide.",verse:"He gives strength to the weary — Isaiah 40:29"},
  {day:90,badge:"👑",title:"90 Days",reward:"Legend Trophy plus return-to-sport checklist.",verse:"Well done good and faithful servant — Matthew 25:23"},
];

const SKIN_TONES = ["#FDDBB4","#F5C89A","#D4956A","#A0614A","#6B3A2A","#3B1F1A"];
const HAIR_COLORS = ["#1a1a1a","#4a2c0a","#8B4513","#D2691E","#FFD700","#E6B0AA","#AED6F1","#A9A9A9","#FFFFFF","#39FF14","#FF3B3B","#A855F7"];
const HAIR_STYLES = ["Short","Curly","Long","Braids","Bun","Fade","Natural","Ponytail","Mohawk","Locs"];
const BODY_TYPES  = ["Slim","Athletic","Average","Muscular","Curvy","Stocky"];
const GENDERS     = ["Male","Female","Non-binary"];

const AVATAR_QUOTES: Record<string,string[]> = {
  streak:[
    "You showed up again. Your tissue is literally rebuilding right now because of YOUR consistency.",
    "Day after day. That consistency is exactly what separates good recoveries from great ones.",
    "Your streak tells me everything — you are a competitor even in rehab.",
    "Keep this streak alive. The athletes who make it back? They show up daily.",
    "I have trained champions. The ones who show up every day always come back stronger.",
  ],
  goal:[
    "PERFECT DAY. Recovery science shows consistent task completion accelerates healing by 30%.",
    "All tasks done today. As your trainer I am proud — this is elite-level discipline.",
    "Full completion! Protein timing, ice protocol, everything dialed in. You are doing this RIGHT.",
    "That is how champions train. Every. Single. Task. Well done athlete.",
    "Goal complete! Your body felt that. Keep stacking these days.",
  ],
  miss:[
    "Hey, missed tasks today. That is okay — but let us talk about what got in the way so we fix it tomorrow.",
    "Recovery is not linear. But missing tasks slows the timeline. Back at it tomorrow.",
    "I need you to show up tomorrow. Your injury is counting on your consistency.",
    "One miss does not define your recovery. But patterns do. See you tomorrow.",
  ],
  morning:[
    "Good morning athlete. Today is another rep toward your comeback. Let us go.",
    "Rise up. Your comeback starts with today's protocol. No excuses.",
    "New day. New chance to heal. What we do today matters for who you are in 6 weeks.",
    "Morning! Remember why you started. That reason is bigger than today's discomfort.",
  ],
};

interface Post {
  id: string;
  author: string;
  msg: string;
  likes: number;
  likedByMe: boolean;
  timestamp: string;
  replies: {author:string; msg:string; timestamp:string}[];
}

function seedPosts(sportId: string): Post[] {
  const now = new Date();
  const ago = (h:number) => new Date(now.getTime() - h*3600000).toISOString();

  const seeds: Record<string,Post[]> = {
    basketball:[
      {id:"b1",author:"Marcus T.",msg:"Day 47 post-ACL. Hit 90 degrees ROM today. Nordic curls protocol in this app is absolutely legit. Don't sleep on the eccentric loading.",likes:24,likedByMe:false,timestamp:ago(2),replies:[
        {author:"Darius K.",msg:"Keep pushing bro! Day 82 here — you will be jumping again soon. Week 6 was my turning point.",timestamp:ago(1)},
        {author:"Tina M.",msg:"How long until you could walk without a limp? I'm on day 30 and still struggling.",timestamp:ago(0.5)},
        {author:"Marcus T.",msg:"@Tina I walked normally around day 35. Just trust the process and do the quad sets every single day.",timestamp:ago(0.3)},
      ]},
      {id:"b2",author:"DeShawn W.",msg:"134 days out. Just dropped 40pts in first game back. I was sitting here reading this app every single day. Your comeback is coming. Trust the science and trust God.",likes:201,likedByMe:false,timestamp:ago(6),replies:[
        {author:"Marcus T.",msg:"This just made my whole week. Thank you for posting this.",timestamp:ago(5)},
        {author:"Coach Rivera",msg:"This is EXACTLY why we do the work. Screenshot this everyone.",timestamp:ago(4)},
        {author:"JayBall23",msg:"Crying reading this. I'm day 12 and feeling hopeless. This helped.",timestamp:ago(3)},
        {author:"DeShawn W.",msg:"@JayBall day 12 is the hardest. It gets better at week 4. I promise you.",timestamp:ago(2)},
      ]},
      {id:"b3",author:"Coach Rivera",msg:"Reminder for everyone: recovery pace is not weakness. It IS the strategy. The athletes who rush back are the ones who re-tear. Be patient. Be disciplined. Be back STRONGER.",likes:89,likedByMe:false,timestamp:ago(12),replies:[
        {author:"KD_Recover",msg:"Needed to hear this today. Was about to push too hard.",timestamp:ago(11)},
        {author:"Tina M.",msg:"Saving this post forever.",timestamp:ago(10)},
      ]},
      {id:"b4",author:"KD_Recover",msg:"Week 8 post meniscus repair. Hopped on the bike today for the first time. Literally cried. Small wins matter so much on this journey.",likes:67,likedByMe:false,timestamp:ago(18),replies:[
        {author:"Marcus T.",msg:"The bike tears hit different. You are doing amazing.",timestamp:ago(17)},
        {author:"DeShawn W.",msg:"First bike session is a milestone. Mark it down.",timestamp:ago(16)},
      ]},
      {id:"b5",author:"Aaliyah R.",msg:"Anyone dealing with mental blocks after ACL? My knee is healed but my brain won't let me go full speed. PT says I'm physically cleared but I freeze up on cuts.",likes:45,likedByMe:false,timestamp:ago(24),replies:[
        {author:"DeShawn W.",msg:"This is the MOST common thing nobody talks about. It took me 3 extra weeks to trust my knee mentally. Sports psych helped me more than anything.",timestamp:ago(23)},
        {author:"Marcus T.",msg:"Graduated return is the answer. Go 50%, then 60%, then 70%. Let your brain catch up to your body.",timestamp:ago(22)},
        {author:"Coach Rivera",msg:"Fear of re-injury is a documented phenomenon. Visualize successful cuts. Program the new pattern.",timestamp:ago(21)},
        {author:"Aaliyah R.",msg:"Thank you all so much. I feel less alone knowing this is normal.",timestamp:ago(20)},
      ]},
    ],
    football:[
      {id:"f1",author:"Jake M.",msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol. Every single task in this app matters — I did all of them.",likes:67,likedByMe:false,timestamp:ago(3),replies:[
        {author:"Kyle R.",msg:"How was your mental game during the recovery?",timestamp:ago(2)},
        {author:"Jake M.",msg:"Honestly the mental was harder than physical. Week 3 was brutal. Just keep showing up.",timestamp:ago(1.5)},
        {author:"BigLineman55",msg:"This gives me so much hope. Day 20 here on hamstring.",timestamp:ago(1)},
      ]},
      {id:"f2",author:"Tyler B.",msg:"Post-surgery day 14. The daily schedule in this app is keeping me sane. Having something structured to follow every day is everything when you feel helpless.",likes:31,likedByMe:false,timestamp:ago(8),replies:[
        {author:"Jake M.",msg:"That structure saved me too. Stick with it every single day.",timestamp:ago(7)},
        {author:"Lamar_DL",msg:"What surgery did you have?",timestamp:ago(6)},
        {author:"Tyler B.",msg:"ACL reconstruction. Patellar tendon graft.",timestamp:ago(5)},
      ]},
      {id:"f3",author:"BigLineman55",msg:"Hamstring strain grade 2. Anyone have experience with the Nordic curl protocol? It looks intense.",likes:18,likedByMe:false,timestamp:ago(15),replies:[
        {author:"Jake M.",msg:"Start with just the eccentric lowering phase. No full Nordic yet until week 4. The research on this is solid.",timestamp:ago(14)},
        {author:"Coach Rivera",msg:"Askling protocol is gold standard for hamstrings. Follow it exactly. Do NOT skip the eccentric work.",timestamp:ago(13)},
        {author:"BigLineman55",msg:"Appreciate the guidance. Starting tomorrow.",timestamp:ago(12)},
      ]},
    ],
    soccer:[
      {id:"s1",author:"Priya R.",msg:"Week 3 hamstring strain. Pool running is literally saving my cardio base. If you are injured and not pool running you are missing out.",likes:18,likedByMe:false,timestamp:ago(4),replies:[
        {author:"Ana S.",msg:"Pool running changed everything for me. 3 weeks of it during my hamstring. Worth every boring lap.",timestamp:ago(3)},
        {author:"Mia L.",msg:"How long did you pool run each session?",timestamp:ago(2)},
        {author:"Priya R.",msg:"20–25 min. Heart rate monitor helps. Try to stay at 70% max HR.",timestamp:ago(1)},
      ]},
      {id:"s2",author:"Jordan K.",msg:"First training session back today. 10 months from ACL reconstruction. Cried on the pitch. Couldn't help it. If you are early in your recovery just know it is possible. This community and this app got me through.",likes:145,likedByMe:false,timestamp:ago(10),replies:[
        {author:"Priya R.",msg:"Tears of joy. Absolutely deserved. Congratulations.",timestamp:ago(9)},
        {author:"Mia L.",msg:"This gives me so much hope. I am only on week 2 and struggling.",timestamp:ago(8)},
        {author:"Ana S.",msg:"Saving this post. 10 months feels forever but you prove it is worth it.",timestamp:ago(7)},
        {author:"Jordan K.",msg:"@Mia week 2 is the hardest. The protocol works. Just do the tasks every day.",timestamp:ago(6)},
      ]},
      {id:"s3",author:"Mia L.",msg:"Day 45. Can finally do a full squat without pain. Feels like a miracle after thinking this would never happen.",likes:52,likedByMe:false,timestamp:ago(20),replies:[
        {author:"Jordan K.",msg:"This is exactly the trajectory. Day 45 full squat means day 90 you are running.",timestamp:ago(19)},
        {author:"Priya R.",msg:"Screenshot this progress. You will want to look back at it.",timestamp:ago(18)},
      ]},
    ],
  };

  return seeds[sportId] || [
    {id:"g1",author:"Recovery Community",msg:`Welcome to the ${sportId} recovery squad! Drop your injury and how many days in you are below. Let us support each other.`,likes:0,likedByMe:false,timestamp:new Date().toISOString(),replies:[]},
  ];
}

function calcMacros(height:string,weight:string,gender:string,goal:string){
  const h=parseFloat(height); const w=parseFloat(weight);
  if(!h||!w) return null;
  const bmr=gender==="female"?(10*w)+(6.25*h)-(5*25)-161:(10*w)+(6.25*h)-(5*25)+5;
  const tdee=bmr*1.375;
  let calories=tdee; let proteinG=w*2.0;
  let fatG=(calories*0.25)/9;
  let carbG=(calories-(proteinG*4)-(fatG*9))/4;
  if(goal==="fast"){calories=tdee+100;proteinG=w*2.2;}
  if(goal==="fitness"){proteinG=w*1.8;}
  if(goal==="pain"){calories=tdee-100;proteinG=w*1.6;fatG=(calories*0.30)/9;carbG=(calories-(proteinG*4)-(fatG*9))/4;}
  return {calories:Math.round(calories),protein:Math.round(proteinG),carbs:Math.round(Math.max(carbG,50)),fat:Math.round(fatG)};
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}



// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.card, borderRadius: 18, padding: "14px 16px",
      border: `1px solid ${T.border}`, boxShadow: shadow.card, ...style,
    }}>{children}</div>
  );
}

function NeonCard({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.card, borderRadius: 18, padding: "14px 16px",
      border: `1px solid ${T.neon}40`, boxShadow: shadow.neon, ...style,
    }}>{children}</div>
  );
}

function TagPill({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, color, background: bg,
      borderRadius: 20, padding: "3px 10px", letterSpacing: "0.2px",
    }}>{children}</span>
  );
}

function PrimaryBtn({ children, onClick, style = {} }: { children: ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "15px", borderRadius: 14,
      background: T.neon, color: T.bg, fontWeight: 900, fontSize: 16,
      border: "none", cursor: "pointer", boxShadow: shadow.neon,
      letterSpacing: "0.3px", ...style,
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px", borderRadius: 14,
      background: "transparent", color: T.textSecondary, fontWeight: 700, fontSize: 14,
      border: `1.5px solid ${T.border}`, cursor: "pointer",
    }}>{children}</button>
  );
}

function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size + 10, height: size + 10, borderRadius: (size + 10) / 2,
        background: T.bg, border: `2px solid ${T.neon}`, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
        boxShadow: shadow.neon,
      }}>
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="9" width="4" height="6" rx="1.5" fill={T.neon} />
          <rect x="18" y="9" width="4" height="6" rx="1.5" fill={T.neon} />
          <rect x="5" y="11" width="14" height="2" rx="1" fill="white" />
          <rect x="8" y="7" width="3" height="10" rx="1.5" fill="white" />
          <rect x="13" y="7" width="3" height="10" rx="1.5" fill="white" />
        </svg>
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: size * 0.75, color: T.textPrimary, lineHeight: 1, letterSpacing: "-0.5px" }}>
          Comeback
        </div>
        <div style={{ fontWeight: 600, fontSize: size * 0.38, color: T.neon, lineHeight: 1, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 1 }}>
          Sports Recovery
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color = T.neon }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${Math.min(pct, 100)}%`, background: color,
        borderRadius: 3, transition: "width 0.4s", boxShadow: `0 0 8px ${color}80`,
      }} />
    </div>
  );
}

function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < current ? T.neon : T.border,
          boxShadow: i < current ? `0 0 6px ${T.neon}60` : "none",
        }} />
      ))}
    </div>
  );
}

// ── STREAK FIRE ───────────────────────────────────────────────────────────────
function StreakFire({ streak, alive }: { streak: number; alive: boolean }) {
  const sz = alive ? Math.min(20 + streak * 0.5, 40) : 18;
  const colors = alive
    ? streak >= 30 ? ["#FF0000", "#FF4400", "#FFD700"]
    : streak >= 14 ? ["#FF2200", "#FF7700", "#FFD700"]
    : streak >= 7  ? ["#FF4400", "#FF9900", "#FFDD00"]
    : ["#FF6600", "#FFAA00", "#FFE000"]
    : [T.border, T.border, T.textDim];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 7 8 7 13C7 15.8 9.2 18 12 18C14.8 18 17 15.8 17 13C17 8 12 2 12 2Z" fill={`url(#fg${streak})`} />
        <path d="M12 10C12 10 9 13 9 15C9 16.7 10.3 18 12 18C13.7 18 15 16.7 15 15C15 13 12 10 12 10Z" fill={colors[2]} opacity="0.9" />
        {alive && streak >= 7 && (
          <>
            <circle cx="8" cy="12" r="1.5" fill={colors[2]} opacity="0.6" />
            <circle cx="16" cy="11" r="1" fill={colors[2]} opacity="0.4" />
          </>
        )}
        <defs>
          <linearGradient id={`fg${streak}`} x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
      </svg>
      <span style={{
        fontWeight: 900, fontSize: Math.max(sz * 0.65, 14),
        color: alive ? colors[1] : T.textMuted,
        textShadow: alive ? `0 0 10px ${colors[1]}80` : "none",
      }}>{streak}</span>
    </div>
  );
}

// ── DISNEY-STYLE AVATAR ───────────────────────────────────────────────────────
function AvatarDisplay({ avatar, size = 80, mood = "happy" }: {
  avatar: Avatar; size?: number; mood?: "happy" | "sad" | "neutral" | "excited";
}) {
  const s = size;
  const cx = s * 0.5;

  // Big expressive eyes
  const eyeLY = mood === "sad" ? s * 0.38 : s * 0.36;
  const eyeRY = mood === "sad" ? s * 0.38 : s * 0.36;
  const eyeSize = s * 0.072;
  const pupilSize = eyeSize * 0.55;
  const eyeBrowAngle = mood === "sad" ? "rotate(15)" : mood === "excited" ? "rotate(-10)" : "rotate(0)";
  const eyeBrowAngleR = mood === "sad" ? "rotate(-15)" : mood === "excited" ? "rotate(10)" : "rotate(0)";

  // Mouth shapes
  const mouth = mood === "happy"
    ? <path d={`M${s*0.36} ${s*0.57} Q${cx} ${s*0.67} ${s*0.64} ${s*0.57}`} stroke="#1a0a0a" strokeWidth={s * 0.03} fill="none" strokeLinecap="round" />
    : mood === "sad"
    ? <path d={`M${s*0.36} ${s*0.63} Q${cx} ${s*0.54} ${s*0.64} ${s*0.63}`} stroke="#1a0a0a" strokeWidth={s * 0.025} fill="none" strokeLinecap="round" />
    : mood === "excited"
    ? <>
        <path d={`M${s*0.32} ${s*0.54} Q${cx} ${s*0.72} ${s*0.68} ${s*0.54}`} stroke="#1a0a0a" strokeWidth={s * 0.03} fill="#FF6B8A" strokeLinecap="round" />
        <ellipse cx={cx} cy={s * 0.63} rx={s * 0.12} ry={s * 0.07} fill="#FF6B8A" opacity="0.4" />
      </>
    : <path d={`M${s*0.4} ${s*0.595} L${s*0.6} ${s*0.595}`} stroke="#1a0a0a" strokeWidth={s * 0.025} fill="none" strokeLinecap="round" />;

  // Cheeks
  const cheeks = (mood === "happy" || mood === "excited") && (
    <>
      <ellipse cx={s * 0.3} cy={s * 0.525} rx={s * 0.07} ry={s * 0.04} fill="#FF9BAA" opacity="0.45" />
      <ellipse cx={s * 0.7} cy={s * 0.525} rx={s * 0.07} ry={s * 0.04} fill="#FF9BAA" opacity="0.45" />
    </>
  );

  // Hair paths
  const hairPaths: Record<string, React.ReactElement> = {
    "Short": <path d={`M${s*.26} ${s*.3} Q${s*.5} ${s*.08} ${s*.74} ${s*.3} L${s*.7} ${s*.26} Q${s*.5} ${s*.1} ${s*.3} ${s*.26}Z`} fill={avatar.hairColor} />,
    "Curly": <>
      <path d={`M${s*.2} ${s*.32} Q${s*.28} ${s*.04} ${s*.5} ${s*.07} Q${s*.72} ${s*.04} ${s*.8} ${s*.32} Q${s*.72} ${s*.08} ${s*.5} ${s*.1} Q${s*.28} ${s*.08} ${s*.2} ${s*.32}Z`} fill={avatar.hairColor} />
      {[s*.22,s*.35,s*.5,s*.65,s*.78].map((x,i)=><circle key={i} cx={x} cy={s*.15} r={s*.035} fill={avatar.hairColor} />)}
    </>,
    "Long": <path d={`M${s*.24} ${s*.28} Q${s*.5} ${s*.07} ${s*.76} ${s*.28} L${s*.8} ${s*.75} Q${s*.74} ${s*.7} ${s*.72} ${s*.3} Q${s*.5} ${s*.1} ${s*.28} ${s*.3} L${s*.2} ${s*.75}Z`} fill={avatar.hairColor} />,
    "Braids": <>
      <path d={`M${s*.26} ${s*.26} Q${s*.5} ${s*.06} ${s*.74} ${s*.26}`} stroke={avatar.hairColor} strokeWidth={s*.06} fill="none" strokeLinecap="round" />
      <path d={`M${s*.3} ${s*.32} Q${s*.28} ${s*.55} ${s*.26} ${s*.78}`} stroke={avatar.hairColor} strokeWidth={s*.04} fill="none" strokeLinecap="round" />
      <path d={`M${s*.7} ${s*.32} Q${s*.72} ${s*.55} ${s*.74} ${s*.78}`} stroke={avatar.hairColor} strokeWidth={s*.04} fill="none" strokeLinecap="round" />
    </>,
    "Bun": <>
      <path d={`M${s*.28} ${s*.3} Q${s*.5} ${s*.1} ${s*.72} ${s*.3}`} stroke={avatar.hairColor} strokeWidth={s*.05} fill="none" strokeLinecap="round" />
      <circle cx={cx} cy={s*.12} r={s*.1} fill={avatar.hairColor} />
      <circle cx={cx} cy={s*.12} r={s*.06} fill={avatar.hairColor} opacity="0.6" />
    </>,
    "Fade": <>
      <path d={`M${s*.26} ${s*.28} Q${s*.5} ${s*.09} ${s*.74} ${s*.28} L${s*.72} ${s*.32} Q${s*.5} ${s*.12} ${s*.28} ${s*.32}Z`} fill={avatar.hairColor} />
      <rect x={s*.26} y={s*.28} width={s*.48} height={s*.08} rx={s*.02} fill={avatar.hairColor} opacity="0.4" />
    </>,
    "Natural": <path d={`M${s*.16} ${s*.34} Q${s*.18} ${s*.03} ${s*.5} ${s*.06} Q${s*.82} ${s*.03} ${s*.84} ${s*.34} Q${s*.76} ${s*.08} ${s*.5} ${s*.09} Q${s*.24} ${s*.08} ${s*.16} ${s*.34}Z`} fill={avatar.hairColor} />,
    "Ponytail": <>
      <path d={`M${s*.26} ${s*.26} Q${s*.5} ${s*.07} ${s*.74} ${s*.26}`} stroke={avatar.hairColor} strokeWidth={s*.055} fill="none" strokeLinecap="round" />
      <path d={`M${s*.5} ${s*.1} L${s*.52} ${s*.28} Q${s*.54} ${s*.4} ${s*.5} ${s*.5}`} stroke={avatar.hairColor} strokeWidth={s*.04} fill="none" strokeLinecap="round" />
      <ellipse cx={s*.5} cy={s*.28} rx={s*.04} ry={s*.04} fill={avatar.skinTone} stroke={avatar.hairColor} strokeWidth={2} />
    </>,
    "Mohawk": <>
      <rect x={s*.44} y={s*.06} width={s*.12} height={s*.26} rx={s*.06} fill={avatar.hairColor} />
      <path d={`M${s*.28} ${s*.28} Q${s*.3} ${s*.22} ${s*.38} ${s*.2}`} stroke={avatar.hairColor} strokeWidth={s*.03} fill="none" />
      <path d={`M${s*.72} ${s*.28} Q${s*.7} ${s*.22} ${s*.62} ${s*.2}`} stroke={avatar.hairColor} strokeWidth={s*.03} fill="none" />
    </>,
    "Locs": <>
      <path d={`M${s*.26} ${s*.26} Q${s*.5} ${s*.06} ${s*.74} ${s*.26}`} stroke={avatar.hairColor} strokeWidth={s*.055} fill="none" strokeLinecap="round" />
      {[s*.3,s*.38,s*.46,s*.54,s*.62,s*.7].map((x,i)=>(
        <path key={i} d={`M${x} ${s*.28} Q${x+s*.02} ${s*.55} ${x} ${s*.75}`} stroke={avatar.hairColor} strokeWidth={s*.032} fill="none" strokeLinecap="round" />
      ))}
    </>,
  };

  const hairEl = hairPaths[avatar.hairStyle] || hairPaths["Short"];

  // Body / outfit
  const shirtColor = mood === "excited" ? T.neon : mood === "sad" ? T.border : T.indigo;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ filter: mood === "excited" ? `drop-shadow(0 0 8px ${T.neon}60)` : "none" }}>
      {/* Shadow */}
      <ellipse cx={cx} cy={s * 0.95} rx={s * 0.22} ry={s * 0.04} fill="black" opacity="0.2" />
      {/* Body */}
      <ellipse cx={cx} cy={s * 0.84} rx={s * 0.25} ry={s * 0.18} fill={avatar.skinTone} />
      {/* Shirt */}
      <path d={`M${s*.28} ${s*.82} Q${s*.3} ${s*.72} ${cx} ${s*.7} Q${s*.7} ${s*.72} ${s*.72} ${s*.82} Q${cx} ${s*.98} ${s*.28} ${s*.82}Z`} fill={shirtColor} opacity="0.9" />
      {/* Shirt details */}
      <path d={`M${cx} ${s*.7} L${cx} ${s*.9}`} stroke="white" strokeWidth={s*.015} opacity="0.3" />
      {/* Neck */}
      <rect x={cx - s * 0.06} y={s * 0.64} width={s * 0.12} height={s * 0.1} rx={s * 0.04} fill={avatar.skinTone} />
      {/* Head */}
      <ellipse cx={cx} cy={s * 0.41} rx={s * 0.22} ry={s * 0.25} fill={avatar.skinTone} />
      {/* Ear left */}
      <ellipse cx={s * 0.28} cy={s * 0.43} rx={s * 0.035} ry={s * 0.05} fill={avatar.skinTone} stroke={avatar.skinTone} strokeWidth={1} />
      {/* Ear right */}
      <ellipse cx={s * 0.72} cy={s * 0.43} rx={s * 0.035} ry={s * 0.05} fill={avatar.skinTone} stroke={avatar.skinTone} strokeWidth={1} />
      {/* Hair */}
      {hairEl}
      {/* Eyebrows */}
      <path d={`M${s*.37} ${s*.295} Q${s*.42} ${s*.275} ${s*.47} ${s*.29}`} stroke={avatar.hairColor} strokeWidth={s*.022} fill="none" strokeLinecap="round"
        transform={`rotate(${mood==="sad"?8:mood==="excited"?-8:0},${s*.42},${s*.285})`} />
      <path d={`M${s*.53} ${s*.29} Q${s*.58} ${s*.275} ${s*.63} ${s*.295}`} stroke={avatar.hairColor} strokeWidth={s*.022} fill="none" strokeLinecap="round"
        transform={`rotate(${mood==="sad"?-8:mood==="excited"?8:0},${s*.58},${s*.285})`} />
      {/* Eyes — whites */}
      <ellipse cx={s * 0.41} cy={eyeLY} rx={eyeSize * 1.1} ry={eyeSize * (mood==="excited"?1.4:1.1)} fill="white" />
      <ellipse cx={s * 0.59} cy={eyeRY} rx={eyeSize * 1.1} ry={eyeSize * (mood==="excited"?1.4:1.1)} fill="white" />
      {/* Pupils */}
      <circle cx={s * 0.41 + (mood==="excited"?s*.008:0)} cy={eyeLY + s * 0.01} r={pupilSize} fill="#1a0a1a" />
      <circle cx={s * 0.59 + (mood==="excited"?s*.008:0)} cy={eyeRY + s * 0.01} r={pupilSize} fill="#1a0a1a" />
      {/* Eye shine */}
      <circle cx={s * 0.415} cy={eyeLY - s * 0.015} r={s * 0.018} fill="white" opacity="0.9" />
      <circle cx={s * 0.595} cy={eyeRY - s * 0.015} r={s * 0.018} fill="white" opacity="0.9" />
      {/* Nose */}
      <path d={`M${cx - s*.02} ${s*.5} Q${cx} ${s*.535} ${cx + s*.02} ${s*.5}`} stroke={avatar.skinTone} strokeWidth={s*.018} fill="none" strokeLinecap="round"
        filter="url(#darken)" />
      <ellipse cx={cx - s*.025} cy={s*.525} rx={s*.018} ry={s*.012} fill="black" opacity="0.12" />
      <ellipse cx={cx + s*.025} cy={s*.525} rx={s*.018} ry={s*.012} fill="black" opacity="0.12" />
      {/* Cheeks */}
      {cheeks}
      {/* Mouth */}
      {mouth}
      {/* Excited sparkles */}
      {mood === "excited" && <>
        <path d={`M${s*.8} ${s*.18} L${s*.82} ${s*.14} L${s*.84} ${s*.18} L${s*.82} ${s*.22}Z`} fill={T.yellow} />
        <path d={`M${s*.2} ${s*.15} L${s*.22} ${s*.11} L${s*.24} ${s*.15} L${s*.22} ${s*.19}Z`} fill={T.neon} opacity="0.8" />
        <circle cx={s*.87} cy={s*.28} r={s*.02} fill={T.yellow} opacity="0.7" />
      </>}
      {/* Sad tear */}
      {mood === "sad" && (
        <path d={`M${s*.41} ${s*.42} Q${s*.4} ${s*.47} ${s*.42} ${s*.5}`} stroke={T.sky} strokeWidth={s*.018} fill="none" strokeLinecap="round" opacity="0.8" />
      )}
    </svg>
  );
}

// ── AVATAR BUILDER ────────────────────────────────────────────────────────────
function AvatarBuilder({ onSave, onBack }: { onSave: (a: Avatar) => void; onBack: () => void }) {
  const [av, setAv] = useState<Avatar>({ gender: "male", skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[0], hairStyle: "Short", bodyType: "Athletic" });
  const [animMood, setAnimMood] = useState<"happy"|"excited"|"neutral"|"sad">("happy");

  useEffect(() => {
    const moods: ("happy"|"excited"|"neutral")[] = ["happy", "excited", "neutral"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % moods.length; setAnimMood(moods[i]); }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100%", background: T.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSecondary, padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
          <Logo size={22} />
        </div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>Build Your Avatar</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Your personal AI trainer coach. Elite exclusive.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {/* Live preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{
            background: T.surface, borderRadius: 24, padding: 24,
            border: `2px solid ${T.neon}50`, boxShadow: shadow.neon,
            display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <AvatarDisplay avatar={av} size={140} mood={animMood} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: T.neon }}>Your Trainer</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Animates based on your progress</div>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Gender</div>
          <div style={{ display: "flex", gap: 8 }}>
            {GENDERS.map(g => (
              <button key={g} onClick={() => setAv(a => ({ ...a, gender: g.toLowerCase() as Avatar["gender"] }))}
                style={{
                  flex: 1, padding: "10px", borderRadius: 12,
                  border: `2px solid ${av.gender === g.toLowerCase() ? T.neon : T.border}`,
                  background: av.gender === g.toLowerCase() ? T.neonL : T.surface,
                  fontWeight: 700, fontSize: 12,
                  color: av.gender === g.toLowerCase() ? T.neon : T.textSecondary,
                  cursor: "pointer", boxShadow: av.gender === g.toLowerCase() ? shadow.neon : "none",
                }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Skin Tone</div>
          <div style={{ display: "flex", gap: 10 }}>
            {SKIN_TONES.map(s => (
              <button key={s} onClick={() => setAv(a => ({ ...a, skinTone: s }))}
                style={{
                  width: 42, height: 42, borderRadius: 21, background: s, cursor: "pointer",
                  border: `3px solid ${av.skinTone === s ? T.neon : "transparent"}`,
                  boxShadow: av.skinTone === s ? shadow.neon : "none",
                }} />
            ))}
          </div>
        </div>

        {/* Hair color */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Hair Color</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HAIR_COLORS.map(c => (
              <button key={c} onClick={() => setAv(a => ({ ...a, hairColor: c }))}
                style={{
                  width: 36, height: 36, borderRadius: 18, background: c, cursor: "pointer",
                  border: `3px solid ${av.hairColor === c ? T.neon : "transparent"}`,
                  boxShadow: av.hairColor === c ? shadow.neon : c === "#FFFFFF" ? "inset 0 0 0 1px #555" : "none",
                }} />
            ))}
          </div>
        </div>

        {/* Hair style */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Hair Style</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {HAIR_STYLES.map(s => (
              <button key={s} onClick={() => setAv(a => ({ ...a, hairStyle: s }))}
                style={{
                  padding: "10px", borderRadius: 12,
                  border: `2px solid ${av.hairStyle === s ? T.neon : T.border}`,
                  background: av.hairStyle === s ? T.neonL : T.surface,
                  fontWeight: 700, fontSize: 12,
                  color: av.hairStyle === s ? T.neon : T.textSecondary,
                  cursor: "pointer", boxShadow: av.hairStyle === s ? shadow.neon : "none",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Body type */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Body Type</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BODY_TYPES.map(b => (
              <button key={b} onClick={() => setAv(a => ({ ...a, bodyType: b }))}
                style={{
                  padding: "8px 14px", borderRadius: 20,
                  border: `2px solid ${av.bodyType === b ? T.neon : T.border}`,
                  background: av.bodyType === b ? T.neonL : T.surface,
                  fontWeight: 700, fontSize: 12,
                  color: av.bodyType === b ? T.neon : T.textSecondary,
                  cursor: "pointer", boxShadow: av.bodyType === b ? shadow.neon : "none",
                }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <PrimaryBtn onClick={() => onSave(av)}>Save My Avatar ✨</PrimaryBtn>
      </div>
    </div>
  );
}

// ── BODY PROFILE ──────────────────────────────────────────────────────────────
function BodyProfileForm({ onSave }: { onSave: (p: BodyProfile) => void }) {
  const [form, setForm] = useState<BodyProfile>({ height: "", weight: "", gender: "male", goal: "return" });
  const canSave = form.height && form.weight;
  return (
    <div style={{ padding: "20px", background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, marginBottom: 16 }}>
      <h3 style={{ fontWeight: 900, fontSize: 16, color: T.textPrimary, marginBottom: 4 }}>Your Body Profile</h3>
      <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 16 }}>We calculate exact daily macro targets for your recovery.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[["HEIGHT (cm)", "height", "175"], ["WEIGHT (kg)", "weight", "75"]].map(([label, key, ph]) => (
          <div key={key}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>{label}</label>
            <input type="number" placeholder={ph}
              value={form[key as keyof BodyProfile]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.card, color: T.textPrimary, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, display: "block", marginBottom: 4 }}>BIOLOGICAL SEX (for BMR calculation)</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["male", "female"].map(g => (
            <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
              style={{
                flex: 1, padding: "8px", borderRadius: 10,
                border: `2px solid ${form.gender === g ? T.neon : T.border}`,
                background: form.gender === g ? T.neonL : T.surface,
                fontWeight: 700, fontSize: 12, color: form.gender === g ? T.neon : T.textSecondary,
                cursor: "pointer", textTransform: "capitalize",
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => canSave ? onSave(form) : null}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: canSave ? T.neon : T.border,
          color: canSave ? T.bg : T.textMuted,
          fontWeight: 800, fontSize: 13, border: "none",
          cursor: canSave ? "pointer" : "not-allowed",
          boxShadow: canSave ? shadow.neon : "none",
        }}>
        Calculate My Macros →
      </button>
    </div>
  );
}

// ── QUIZ SCREENS ──────────────────────────────────────────────────────────────
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: "48px 24px 32px", background: `linear-gradient(160deg,${T.surface} 0%,${T.bg} 70%)` }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Logo size={36} />
        <div style={{ marginTop: 32, marginBottom: 20 }}>
          <h1 style={{ fontWeight: 900, fontSize: 32, color: T.textPrimary, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 12 }}>
            Your comeback<br />starts <span style={{ color: T.neon, textShadow: shadow.neon }}>today.</span>
          </h1>
          <p style={{ fontSize: 15, color: T.textSecondary, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
            Science-backed recovery. Personalised nutrition. Real day tracking.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {["🏆 Pro protocols", "📿 Daily faith", "🧪 Evidence-based", "📅 Real tracking", "🤖 AI Avatar coach"].map((f, i) => (
            <div key={i} style={{
              fontSize: 11, fontWeight: 700, color: T.neon, background: T.neonL,
              borderRadius: 12, padding: "6px 12px", border: `1px solid ${T.neon}30`,
            }}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 12 }}>Free to start · Progress saved automatically</p>
    </div>
  );
}

function SportSelect({ onNext }: { onNext: (s: typeof SPORTS[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={5} current={1} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>What is your sport?</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>You will join a squad of athletes from your sport.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SPORTS.map(s => (
            <button key={s.id} onClick={() => onNext(s)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 0, cursor: "pointer", textAlign: "left", overflow: "hidden", boxShadow: shadow.sm }}>
              <div style={{ height: 80, background: `url(${s.img}) center/cover`, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.7))" }} />
                <span style={{ position: "absolute", bottom: 6, left: 8, fontSize: 22 }}>{s.icon}</span>
              </div>
              <div style={{ padding: "8px 10px 10px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.textPrimary }}>{s.label}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{s.athlete}</div>
                <div style={{ fontSize: 9, color: T.neon, fontWeight: 700, marginTop: 2 }}>● {s.liveUsers} active</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InjurySelect({ onNext }: { onNext: (inj: typeof INJURIES[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={5} current={2} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>What is your injury?</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Select closest match — we fine-tune by severity next.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {INJURIES.map(inj => (
          <button key={inj.id} onClick={() => onNext(inj)} style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, boxShadow: shadow.sm }}>
            <span style={{ fontSize: 26 }}>{inj.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.textPrimary }}>{inj.label}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{inj.weeks}-week protocol</div>
            </div>
            <ChevronRight size={16} color={T.textMuted} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SeveritySelect({ onNext }: { onNext: (sv: typeof SEVERITIES[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={5} current={3} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>How severe is it?</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>This determines your protocol intensity.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {SEVERITIES.map(sv => (
          <button key={sv.id} onClick={() => onNext(sv)} style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", cursor: "pointer", textAlign: "left", marginBottom: 12, boxShadow: shadow.sm }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{sv.icon}</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>{sv.label}</span>
              <TagPill color={sv.color} bg={sv.bg}>{sv.label}</TagPill>
            </div>
            <p style={{ fontSize: 13, color: T.textSecondary, margin: 0, paddingLeft: 36 }}>{sv.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function GoalSelect({ onNext }: { onNext: (g: typeof GOALS_LIST[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={5} current={4} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>What is your goal?</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Shapes your daily task emphasis and macros.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        {GOALS_LIST.map(g => (
          <button key={g.id} onClick={() => onNext(g)} style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 12, boxShadow: shadow.sm }}>
            <span style={{ fontSize: 28 }}>{g.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.textPrimary }}>{g.label}</div>
              <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{g.desc}</div>
            </div>
            <ChevronRight size={16} color={T.textMuted} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PLAN SELECT — GATED (no bypass) ──────────────────────────────────────────
function PlanSelect({ onSelectPlan }: { onSelectPlan: (plan: "free" | "pro" | "elite") => void; onFreeConfirm: () => void }) {
  const [chosen, setChosen] = useState<"free" | "pro" | "elite" | null>(null);
  const [awaitingPayment, setAwaitingPayment] = useState<"pro" | "elite" | null>(null);

  const freeFeatures = ["Daily recovery protocol", "10-task daily checklist", "Streak tracking", "Basic squad access"];
  const freeMissing = ["Personalised nutrition + macros", "Supplement timing schedule", "AI Avatar trainer", "Video library", "Advanced analytics", "1-on-1 PT consults"];
  const proFeatures = ["Everything in Free", "Personalised macros + nutrition", "Supplement timing schedule", "Video exercise library", "Progress analytics", "Priority email support"];
  const proMissing = ["AI Avatar personal trainer", "1-on-1 PT video consults", "Custom meal plans", "Custom supplement stack"];
  const eliteFeatures = ["Everything in Pro", "👑 Your own AI Avatar trainer", "Animated trainer reacts to progress", "Daily coach pep talks + compliments", "1-on-1 PT video consults", "Custom meal + supplement plans", "24/7 priority support"];

  if (awaitingPayment) {
    return (
      <div style={{ minHeight: "100%", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 8 }}>Complete Your Payment</h2>
        <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
          Your Stripe checkout was opened. Once payment is complete, tap the button below to activate your {awaitingPayment === "pro" ? "Pro" : "Elite"} plan.
        </p>
        <button onClick={() => onSelectPlan(awaitingPayment)} style={{ width: "100%", padding: "16px", borderRadius: 14, background: T.neon, color: T.bg, fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 12, boxShadow: shadow.neon }}>
          I Paid — Activate {awaitingPayment === "pro" ? "Pro" : "Elite"} ✅
        </button>
        <button onClick={() => setAwaitingPayment(null)} style={{ width: "100%", padding: "13px", borderRadius: 14, background: "transparent", color: T.textSecondary, fontWeight: 700, fontSize: 14, border: `1.5px solid ${T.border}`, cursor: "pointer" }}>
          ← Go Back to Plans
        </button>
        <p style={{ fontSize: 11, color: T.textMuted, marginTop: 16 }}>🔒 Secure checkout via Stripe · Cancel anytime</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={5} current={5} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>Choose your plan</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Select a plan to start your recovery journey.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>

        {/* FREE */}
        <div style={{ background: T.card, borderRadius: 18, padding: "18px 16px", border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>🌱</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>Free</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: 900, fontSize: 18, color: T.textPrimary }}>$0</span>
              <div style={{ fontSize: 9, color: T.textMuted }}>24hr trial only</div>
            </div>
          </div>
          {freeFeatures.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
              <Check size={13} color={T.neon} strokeWidth={3} /><span style={{ fontSize: 12, color: T.textSecondary }}>{f}</span>
            </div>
          ))}
          {freeMissing.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
              <X size={13} color={T.red} strokeWidth={3} /><span style={{ fontSize: 12, color: T.textMuted, textDecoration: "line-through" }}>{f}</span>
            </div>
          ))}
          <button onClick={() => onSelectPlan("free")} style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 12, background: "transparent", color: T.textSecondary, fontWeight: 700, fontSize: 13, border: `1.5px solid ${T.border}`, cursor: "pointer" }}>
            Start Free Trial (24hrs only)
          </button>
          <p style={{ fontSize: 10, color: T.textMuted, textAlign: "center", marginTop: 6 }}>After 24hrs you will need a paid plan to continue</p>
        </div>

        {/* PRO */}
        <div style={{ background: T.card, borderRadius: 18, padding: "18px 16px", border: `1.5px solid ${T.teal}`, marginBottom: 12, boxShadow: `0 0 20px ${T.teal}20`, position: "relative" }}>
          <div style={{ position: "absolute", top: -10, right: 16, background: T.teal, color: "white", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 10 }}>BEST VALUE</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>Pro</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: 900, fontSize: 18, color: T.teal }}>$9.99/mo</span>
              <div style={{ fontSize: 9, color: T.textMuted }}>billed monthly</div>
            </div>
          </div>
          {proFeatures.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
              <Check size={13} color={T.teal} strokeWidth={3} /><span style={{ fontSize: 12, color: T.textSecondary }}>{f}</span>
            </div>
          ))}
          {proMissing.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
              <X size={13} color={T.red} strokeWidth={3} /><span style={{ fontSize: 12, color: T.textMuted, textDecoration: "line-through" }}>{f}</span>
            </div>
          ))}
          <button onClick={() => { window.open(PLAN_PRO_URL, "_blank"); setAwaitingPayment("pro"); }} style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 12, background: T.teal, color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            Get Pro — $9.99/mo →
          </button>
          <p style={{ fontSize: 10, color: T.textMuted, textAlign: "center", marginTop: 6 }}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        {/* ELITE */}
        <div style={{ background: `linear-gradient(135deg,#0D0D1A,#12121E)`, borderRadius: 18, padding: "18px 16px", border: `2px solid ${T.neon}60`, marginBottom: 16, boxShadow: shadow.neon, position: "relative" }}>
          <div style={{ position: "absolute", top: -10, right: 16, background: T.neon, color: T.bg, fontSize: 10, fontWeight: 900, padding: "3px 10px", borderRadius: 10, boxShadow: shadow.neon }}>👑 MOST POPULAR</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>🏆</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>Elite</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontWeight: 900, fontSize: 18, color: T.neon, textShadow: shadow.neon }}>$28.99/mo</span>
              <div style={{ fontSize: 9, color: T.textMuted }}>billed monthly</div>
            </div>
          </div>
          {eliteFeatures.map((f, j) => (
            <div key={j} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
              <Check size={13} color={T.neon} strokeWidth={3} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{f}</span>
            </div>
          ))}
          <button onClick={() => { window.open(PLAN_ELITE_URL, "_blank"); setAwaitingPayment("elite"); }} style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 12, background: T.neon, color: T.bg, fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>
            Get Elite + Avatar 👑 — $28.99/mo →
          </button>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 6 }}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        <GhostBtn onClick={() => onSelectPlan("free")}>Start with free 24hr trial instead</GhostBtn>
      </div>
    </div>
  );
}

// ── NAV BUTTON ────────────────────────────────────────────────────────────────
function NavBtn({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", background: "none", border: "none", cursor: "pointer" }}>
      <div style={{ color: active ? T.neon : T.textMuted, filter: active ? `drop-shadow(0 0 6px ${T.neon})` : "none" }}>{icon}</div>
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? T.neon : T.textMuted, textShadow: active ? shadow.neon : "none" }}>{label}</span>
    </button>
  );
}

// ── TASK CARD ─────────────────────────────────────────────────────────────────
function TaskCard({ task, checked, onToggle }: { task: Task; checked: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      background: checked ? T.neonL : T.card, borderRadius: 14, padding: "12px 14px",
      border: `1px solid ${checked ? T.neon + "60" : T.border}`,
      boxShadow: checked ? shadow.neon : shadow.sm,
      cursor: "pointer", opacity: checked ? 0.7 : 1, transition: "all 0.2s",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: task.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{task.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 2 }}>{task.time}</div>
        <div style={{ fontSize: 12, color: checked ? T.textMuted : T.textSecondary, lineHeight: 1.45, textDecoration: checked ? "line-through" : "none", fontWeight: 500 }}>{task.task}</div>
      </div>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: checked ? T.neon : T.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "all 0.2s", boxShadow: checked ? shadow.neon : "none" }}>
        {checked && <Check size={13} color={T.bg} strokeWidth={3} />}
      </div>
    </div>
  );
}

// ── APP DASHBOARD ─────────────────────────────────────────────────────────────
function AppDashboard({
  saved, onReset, onUpgrade, onGoToPlans,
}: {
  saved: SavedState;
  onReset: () => void;
  onUpgrade: (p: "pro" | "elite") => void;
  onGoToPlans: () => void;
}) {
  const [tab, setTab] = useState<"home" | "today" | "protocol" | "squad" | "rewards" | "avatar">("home");
  const [posts, setPosts] = useState<Post[]>(() => saved.posts?.[saved.sportId] || seedPosts(saved.sportId));
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newPost, setNewPost] = useState("");
  const [showBodyForm, setShowBodyForm] = useState(!saved.bodyProfile);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(saved.bodyProfile);
  const [suppChecked, setSuppChecked] = useState<boolean[]>(() => {
    const s = loadState(); return s?.suppChecked?.[todayStr()] ?? Array(SUPPLEMENTS.length).fill(false);
  });
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [avatarState, setAvatarState] = useState<Avatar | null>(saved.avatar);

  const sport    = SPORTS.find(s => s.id === saved.sportId);
  const injury   = INJURIES.find(i => i.id === saved.injuryId);
  const severity = SEVERITIES.find(s => s.id === saved.severityId);

  const dayNum  = Math.max(1, daysBetween(saved.startDate, todayStr()) + 1);
  const phase   = dayNum <= 42 ? 1 : dayNum <= 112 ? 2 : 3;
  const pct     = Math.min(100, Math.round((dayNum / ((injury?.weeks || 36) * 7)) * 100));
  const weekNum = Math.ceil(dayNum / 7);
  const todayKey = todayStr();

  const tasks = DAY_PROTOCOLS[dayNum % DAY_PROTOCOLS.length];
  const [checked, setChecked] = useState<boolean[]>(() => {
    const s = loadState(); return s?.completedTasks?.[todayKey] ?? Array(tasks.length).fill(false);
  });
  const doneCount = checked.filter(Boolean).length;
  const allDone   = doneCount === tasks.length;

  const toggleTask = useCallback((idx: number) => {
    setChecked(prev => {
      const next = [...prev]; next[idx] = !next[idx];
      const s = loadState();
      if (s) { s.completedTasks = s.completedTasks || {}; s.completedTasks[todayKey] = next; saveState(s); }
      return next;
    });
  }, [todayKey]);

  const toggleSupp = useCallback((idx: number) => {
    setSuppChecked(prev => {
      const next = [...prev]; next[idx] = !next[idx];
      const s = loadState();
      if (s) { s.suppChecked = s.suppChecked || {}; s.suppChecked[todayKey] = next; saveState(s); }
      return next;
    });
  }, [todayKey]);

  const dailyContent = DAILY_CONTENT[dayNum % DAILY_CONTENT.length];
  const morningTasks   = tasks.slice(0, 3);
  const afternoonTasks = tasks.slice(3, 7);
  const eveningTasks   = tasks.slice(7);

  const avatarMood: "happy" | "sad" | "excited" | "neutral" =
    allDone ? "excited" : doneCount >= tasks.length * 0.6 ? "happy" : !saved.streakAlive ? "sad" : "neutral";
  const avatarQuote = allDone
    ? AVATAR_QUOTES.goal[dayNum % AVATAR_QUOTES.goal.length]
    : !saved.streakAlive
    ? AVATAR_QUOTES.miss[dayNum % AVATAR_QUOTES.miss.length]
    : doneCount === 0
    ? AVATAR_QUOTES.morning[dayNum % AVATAR_QUOTES.morning.length]
    : AVATAR_QUOTES.streak[dayNum % AVATAR_QUOTES.streak.length];

  const macros = bodyProfile ? calcMacros(bodyProfile.height, bodyProfile.weight, bodyProfile.gender, saved.goalId) : null;

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));
  };
  const handleReply = (postId: string) => {
    if (!replyText.trim()) return;
    const now = new Date().toISOString();
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...p.replies, { author: "You", msg: replyText.trim(), timestamp: now }] } : p));
    setReplyText(""); setReplyingTo(null);
  };
  const handleNewPost = () => {
    if (!newPost.trim()) return;
    const post: Post = { id: Date.now().toString(), author: "You", msg: newPost.trim(), likes: 0, likedByMe: false, timestamp: new Date().toISOString(), replies: [] };
    setPosts(prev => [post, ...prev]);
    setNewPost("");
    const s = loadState();
    if (s) { s.posts = s.posts || {}; s.posts[saved.sportId] = [post, ...(s.posts[saved.sportId] || [])]; saveState(s); }
  };

  const trialDays = daysBetween(saved.trialStartDate || saved.startDate, todayStr());
  const trialExpired = saved.plan === "free" && trialDays >= 1;

  const handleSaveAvatar = (av: Avatar) => {
    setAvatarState(av);
    const s = loadState();
    if (s) { s.avatar = av; saveState(s); }
    setShowAvatarBuilder(false);
    setTab("avatar");
  };

  if (trialExpired) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: T.bg, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
        <h2 style={{ fontWeight: 900, fontSize: 24, color: T.textPrimary, marginBottom: 8 }}>Free Trial Ended</h2>
        <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>Your 24-hour trial is up. Upgrade to continue your recovery journey and keep your streak alive.</p>
        <button onClick={onGoToPlans} style={{ width: "100%", padding: "16px", borderRadius: 14, background: T.neon, color: T.bg, fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", marginBottom: 12, boxShadow: shadow.neon }}>
          View Plans & Upgrade →
        </button>
        <p style={{ fontSize: 11, color: T.textMuted }}>🔒 Secure checkout via Stripe · Cancel anytime</p>
      </div>
    );
  }

  if (showAvatarBuilder && saved.plan === "elite") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <AvatarBuilder onSave={handleSaveAvatar} onBack={() => setShowAvatarBuilder(false)} />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case "home": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Logo size={24} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <StreakFire streak={saved.streak} alive={saved.streakAlive} />
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{sport?.icon || "🏆"}</div>
            </div>
          </div>

          {/* Avatar greeting */}
          {saved.plan === "elite" && avatarState && (
            <NeonCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <AvatarDisplay avatar={avatarState} size={72} mood={avatarMood} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 10, color: T.neon, marginBottom: 4, letterSpacing: "1px" }}>YOUR TRAINER SAYS</div>
                  <p style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>{avatarQuote}</p>
                </div>
              </div>
            </NeonCard>
          )}

          {saved.plan === "elite" && !avatarState && (
            <Card style={{ marginBottom: 16, background: "linear-gradient(135deg,#0D0D1A,#12121E)", border: `1px solid ${T.neon}40` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 40 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 4 }}>BUILD YOUR AVATAR TRAINER</div>
                  <p style={{ fontSize: 12, color: T.textSecondary, margin: 0, marginBottom: 8 }}>You are on Elite. Create your personal AI coach!</p>
                  <button onClick={() => setShowAvatarBuilder(true)} style={{ padding: "8px 16px", borderRadius: 10, background: T.neon, color: T.bg, fontWeight: 800, fontSize: 12, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>Build Now 👑</button>
                </div>
              </div>
            </Card>
          )}

          {/* Progress card */}
          <Card style={{ background: "linear-gradient(135deg,#0D0D1A,#121220)", border: `1px solid ${T.neon}30`, marginBottom: 16, padding: "18px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 6, letterSpacing: "1px" }}>WEEK {weekNum} · PHASE {phase}</div>
            <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, lineHeight: 1.1, marginBottom: 6 }}>Day {dayNum} of {(injury?.weeks || 36) * 7}</h2>
            <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>{injury?.label || "Recovery"} · {severity?.label || ""}</p>
            <ProgressBar pct={pct} color={T.neon} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: T.textMuted }}>Day 1</span>
              <span style={{ fontSize: 10, color: T.neon, fontWeight: 700, textShadow: shadow.neon }}>{pct}% complete</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>Day {(injury?.weeks || 36) * 7}</span>
            </div>
          </Card>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <Card style={{ textAlign: "center", padding: "12px 8px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><StreakFire streak={saved.streak} alive={saved.streakAlive} /></div>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>Streak</div>
            </Card>
            <Card style={{ textAlign: "center", padding: "12px 8px" }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: allDone ? T.neon : T.textPrimary, marginBottom: 4, textShadow: allDone ? shadow.neon : "none" }}>{doneCount}/{tasks.length}</div>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>Today</div>
            </Card>
            <Card style={{ textAlign: "center", padding: "12px 8px" }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: T.textPrimary, marginBottom: 4 }}>Phase {phase}</div>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>Stage</div>
            </Card>
          </div>

          {/* Streak lost */}
          {!saved.streakAlive && (
            <Card style={{ background: "#1A0808", border: `1.5px solid ${T.red}40`, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.red }}>Streak Reset</div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>Complete today's tasks to relight your fire 🔥</div>
                </div>
              </div>
            </Card>
          )}

          {/* Daily quote */}
          <Card style={{ background: "linear-gradient(135deg,#0D0D1A,#0A0A14)", border: `1px solid ${T.neon}30`, marginBottom: 16 }}>
            <TagPill color={T.neon} bg={T.neonL}>{dailyContent.type === "verse" ? "📿 Bible Verse" : "💡 Motivation"}</TagPill>
            <p style={{ fontSize: 13, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, marginTop: 8, fontFamily: "Georgia,serif" }}>{dailyContent.quote}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.neon, marginTop: 6 }}>— {dailyContent.text}</p>
          </Card>

          {/* Today focus */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary }}>Today's Focus</h2>
            <button onClick={() => setTab("today")} style={{ fontSize: 12, fontWeight: 700, color: T.neon, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {tasks.slice(0, 3).map((t, i) => <TaskCard key={i} task={t} checked={checked[i]} onToggle={() => toggleTask(i)} />)}
          </div>

          {/* Sport quote */}
          {sport && (
            <Card style={{ background: T.surface, border: `1px solid ${sport.color}30`, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28 }}>{sport.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12, color: sport.color, marginBottom: 4 }}>{sport.athlete} SAYS</div>
                  <p style={{ fontSize: 12, fontStyle: "italic", color: T.textSecondary, lineHeight: 1.5, margin: 0 }}>{sport.quotes[dayNum % sport.quotes.length]}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Upgrade */}
          {saved.plan !== "elite" && (
            <Card style={{ background: "linear-gradient(135deg,#0A0A14,#0D0D1A)", border: `1px solid ${T.neon}40`, marginBottom: 12, padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.neon, marginBottom: 8, letterSpacing: "1px" }}>UPGRADE YOUR PLAN</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {saved.plan === "free" && (
                  <button onClick={onGoToPlans} style={{ flex: 1, padding: "10px", borderRadius: 10, background: T.teal, color: "white", fontWeight: 700, fontSize: 11, border: "none", cursor: "pointer" }}>⚡ Pro $9.99/mo</button>
                )}
                <button onClick={onGoToPlans} style={{ flex: 1, padding: "10px", borderRadius: 10, background: T.neon, color: T.bg, fontWeight: 800, fontSize: 11, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>👑 Elite $28.99/mo</button>
              </div>
              <p style={{ fontSize: 10, color: T.textMuted, textAlign: "center", margin: 0 }}>🔒 Secure checkout via Stripe · Cancel anytime</p>
            </Card>
          )}

          <button onClick={() => { if (window.confirm("Reset recovery plan? All progress cleared.")) onReset(); }}
            style={{ width: "100%", padding: "10px", borderRadius: 12, background: "transparent", color: T.textMuted, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <RotateCcw size={13} /> Start a new recovery plan
          </button>
        </div>
      );

      case "today": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 0 100px" }}>
          <div style={{ padding: "0 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h1 style={{ fontWeight: 900, fontSize: 24, color: T.textPrimary, lineHeight: 1 }}>Day {dayNum}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  <TagPill color={T.neon} bg={T.neonL}>Phase {phase}</TagPill>
                  <span style={{ fontSize: 12, color: T.textSecondary, fontWeight: 600 }}>{injury?.label}</span>
                </div>
              </div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "7px 13px" }}>
                <StreakFire streak={saved.streak} alive={saved.streakAlive} />
              </div>
            </div>
            <Card style={{ background: "linear-gradient(135deg,#0D0D1A,#0A0A14)", border: `1px solid ${T.neon}30`, marginBottom: 14 }}>
              <TagPill color={T.neon} bg={T.neonL}>{dailyContent.type === "verse" ? "📿 Bible Verse" : "💡 Motivation"}</TagPill>
              <p style={{ fontSize: 13, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, marginTop: 8, fontFamily: "Georgia,serif" }}>{dailyContent.quote}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.neon, marginTop: 6 }}>— {dailyContent.text}</p>
            </Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontWeight: 900, fontSize: 18, color: T.textPrimary }}>Today's Protocol</h2>
              <span style={{ fontSize: 10, fontWeight: 700, color: allDone ? T.neon : T.textMuted, background: T.surface, border: `1px solid ${allDone ? T.neon : T.border}`, borderRadius: 8, padding: "4px 8px", boxShadow: allDone ? shadow.neon : "none" }}>{doneCount}/{tasks.length} done</span>
            </div>
          </div>
          <div style={{ padding: "0 18px" }}>
            {[["🌅 Morning", morningTasks, 0], ["☀️ Afternoon", afternoonTasks, 3], ["🌙 Evening", eveningTasks, 7]].map(([label, list, offset]) => (
              <div key={label as string}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.textSecondary, marginBottom: 8, marginTop: 4 }}>{label as string}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {(list as Task[]).map((t, i) => <TaskCard key={i} task={t} checked={checked[(offset as number) + i]} onToggle={() => toggleTask((offset as number) + i)} />)}
                </div>
              </div>
            ))}
            {allDone && (
              <Card style={{ background: T.neonL, border: `1.5px solid ${T.neon}`, marginTop: 10, textAlign: "center", padding: "20px 16px", boxShadow: shadow.neon }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: T.neon, marginBottom: 4, textShadow: shadow.neon }}>Day Complete!</div>
                <div style={{ fontSize: 13, color: T.textSecondary }}>Every task done. Your body is healing. See you tomorrow.</div>
                {saved.plan === "elite" && avatarState && <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}><AvatarDisplay avatar={avatarState} size={80} mood="excited" /></div>}
              </Card>
            )}
          </div>
        </div>
      );

      case "protocol": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>{injury?.label || "Recovery Protocol"}</h1>
          <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 20 }}>{injury?.weeks || 12}-week protocol · Week {weekNum} · Phase {phase}</p>

          {[
            { phase: "Phase 1", title: "Protection & Healing", desc: injury?.phase1, color: T.neon, bg: T.neonL, active: phase === 1 },
            { phase: "Phase 2", title: "Strength & Mobility",  desc: injury?.phase2, color: T.teal,  bg: T.tealL, active: phase === 2 },
            { phase: "Phase 3", title: "Return to Sport",      desc: injury?.phase3, color: T.indigo, bg: T.indigoL, active: phase === 3 },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, opacity: p.active ? 1 : 0.45 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: p.active ? p.color : T.border, display: "flex", alignItems: "center", justifyContent: "center", color: p.active ? T.bg : T.textMuted, fontWeight: 800, fontSize: 13, flexShrink: 0, boxShadow: p.active ? `0 0 12px ${p.color}80` : "none" }}>{i + 1}</div>
                {i < 2 && <div style={{ width: 2, flex: 1, background: T.border, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <TagPill color={p.color} bg={p.bg}>{p.phase}</TagPill>
                  {p.active && <TagPill color={T.neon} bg={T.neonL}>← You are here</TagPill>}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 15, color: T.textPrimary, margin: "0 0 8px" }}>{p.title}</h3>
                <Card style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{p.desc}</Card>
              </div>
            </div>
          ))}

          <h2 style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary, marginBottom: 4, marginTop: 8 }}>💊 Supplement Schedule</h2>
          <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>Tap each to mark as taken. Timed for maximum absorption throughout the day.</p>
          {SUPPLEMENTS.map((s, i) => (
            <div key={i} onClick={() => toggleSupp(i)} style={{
              display: "flex", gap: 12, alignItems: "flex-start", background: suppChecked[i] ? T.neonL : T.card,
              borderRadius: 14, padding: "12px 14px", border: `1.5px solid ${suppChecked[i] ? T.neon + "60" : T.border}`,
              marginBottom: 10, cursor: "pointer", opacity: suppChecked[i] ? 0.7 : 1,
              transition: "all 0.2s", boxShadow: suppChecked[i] ? shadow.neon : shadow.sm,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.textPrimary }}>{s.label} — <span style={{ color: s.color }}>{s.dose}</span></div>
                  <TagPill color={T.textMuted} bg={T.surface}>{s.time}</TagPill>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.neon, marginTop: 2 }}>Take with {s.with}</div>
                <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 4, lineHeight: 1.4 }}>{s.note}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: suppChecked[i] ? T.neon : T.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, boxShadow: suppChecked[i] ? shadow.neon : "none" }}>
                {suppChecked[i] && <Check size={13} color={T.bg} strokeWidth={3} />}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", marginBottom: 20 }}>{suppChecked.filter(Boolean).length}/{SUPPLEMENTS.length} supplements taken today</div>

          <h2 style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary, marginBottom: 4 }}>🥗 Nutrition & Macros</h2>
          <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>Science-backed anti-inflammatory eating for faster recovery.</p>

          {saved.plan === "free" ? (
            <Card style={{ marginBottom: 16, border: `1.5px solid ${T.neon}40`, background: T.neonL }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>📊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.neon }}>Personalised Macros — Pro Feature</div>
                  <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>Upgrade to Pro to get exact daily protein, carbs, and fat targets based on your body and goal.</div>
                </div>
              </div>
              <button onClick={onGoToPlans} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: T.neon, color: T.bg, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>Upgrade to Pro →</button>
            </Card>
          ) : showBodyForm && !bodyProfile ? (
            <BodyProfileForm onSave={p => { setBodyProfile(p); setShowBodyForm(false); const s = loadState(); if (s) { s.bodyProfile = p; saveState(s); } }} />
          ) : macros ? (
            <Card style={{ marginBottom: 16, background: T.neonL, border: `1.5px solid ${T.neon}40` }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.neon, marginBottom: 12 }}>📊 Your Daily Targets</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[
                  { label: "Calories", val: `${macros.calories}`, unit: "kcal", color: T.orange },
                  { label: "Protein",  val: `${macros.protein}g`, unit: "priority", color: T.neon },
                  { label: "Carbs",    val: `${macros.carbs}g`,   unit: "energy",   color: "#F59E0B" },
                  { label: "Fat",      val: `${macros.fat}g`,     unit: "joints",   color: T.teal },
                ].map((m, i) => (
                  <div key={i} style={{ background: T.card, borderRadius: 12, padding: "10px", textAlign: "center", border: `1px solid ${T.border}` }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: m.color, textShadow: m.color === T.neon ? shadow.neon : "none" }}>{m.val}</div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: T.textPrimary }}>{m.label}</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>{m.unit}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>Based on Mifflin-St Jeor formula. Protein at 2g/kg bodyweight — elevated for injury recovery per sports nutrition research.</div>
              <button onClick={() => setShowBodyForm(true)} style={{ marginTop: 8, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Update my measurements</button>
            </Card>
          ) : null}

          {DIET_GUIDE.map((d, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 6 }}>{d.category}</div>
              <div style={{ fontSize: 12, color: T.textPrimary, lineHeight: 1.5, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>✓ Eat: </span>{d.foods}</div>
              <div style={{ fontSize: 11, color: T.red, lineHeight: 1.4 }}><span style={{ fontWeight: 700 }}>✗ Avoid: </span>{d.avoid}</div>
            </Card>
          ))}
        </div>
      );

      case "squad": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>{sport?.icon} {sport?.label} Squad</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.neon, boxShadow: shadow.neon }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.neon }}>{sport?.liveUsers} athletes active right now</span>
          </div>

          {/* New post */}
          <Card style={{ marginBottom: 16 }}>
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder={`Share your recovery update with the ${sport?.label} squad...`}
              style={{ width: "100%", minHeight: 70, border: "none", outline: "none", fontSize: 13, color: T.textPrimary, resize: "none", fontFamily: "inherit", background: "transparent", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleNewPost} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: T.neon, color: T.bg, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>
                <Send size={13} /> Post
              </button>
            </div>
          </Card>

          {/* Posts */}
          {posts.map(p => (
            <Card key={p.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: T.neonL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${T.neon}30` }}>{sport?.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: T.textPrimary }}>{p.author}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>{sport?.label} · {formatTime(p.timestamp)}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5, margin: "0 0 10px" }}>{p.msg}</p>

              {/* Replies */}
              {p.replies.length > 0 && (
                <div style={{ borderLeft: `2px solid ${T.neon}30`, paddingLeft: 12, marginBottom: 10 }}>
                  {p.replies.map((r, ri) => (
                    <div key={ri} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: T.neon }}>{r.author}</span>
                        <span style={{ fontSize: 9, color: T.textMuted }}>{formatTime(r.timestamp)}</span>
                      </div>
                      <span style={{ fontSize: 12, color: T.textSecondary }}>{r.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === p.id && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${T.neon}60`, background: T.surface, color: T.textPrimary, fontSize: 12, fontFamily: "inherit", outline: "none" }}
                    onKeyDown={e => e.key === "Enter" && handleReply(p.id)} />
                  <button onClick={() => handleReply(p.id)} style={{ padding: "8px 12px", borderRadius: 10, background: T.neon, color: T.bg, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>
                    <Send size={13} />
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => handleLike(p.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: p.likedByMe ? T.red : T.textMuted, background: "none", border: "none", cursor: "pointer" }}>
                  <Heart size={14} fill={p.likedByMe ? T.red : "none"} color={p.likedByMe ? T.red : T.textMuted} /> {p.likes}
                </button>
                <button onClick={() => setReplyingTo(replyingTo === p.id ? null : p.id)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: T.textMuted, background: "none", border: "none", cursor: "pointer" }}>
                  <MessageCircle size={14} /> {p.replies.length > 0 ? `${p.replies.length} replies` : "Reply"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      );

      case "rewards": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>Milestones</h1>
          <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 6 }}>Stay consistent. Unlock badges as you progress.</p>
          <Card style={{ background: "linear-gradient(135deg,#0A0A14,#0D0D1A)", border: `1px solid ${T.neon}40`, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 6 }}>YOUR STREAK</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <StreakFire streak={saved.streak} alive={saved.streakAlive} />
              <div style={{ fontSize: 11, color: T.textSecondary }}>{saved.streakAlive ? "days strong" : "relight it today"}</div>
            </div>
            <ProgressBar pct={pct} color={T.neon} />
            <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>Day {dayNum} of {(injury?.weeks || 36) * 7} · {pct}% complete</div>
          </Card>
          {MILESTONES.map((m, i) => {
            const unlocked = dayNum >= m.day;
            const isNext   = !unlocked && (i === 0 || dayNum >= MILESTONES[i - 1].day);
            return (
              <Card key={i} style={{ marginBottom: 12, opacity: !unlocked && !isNext ? 0.35 : 1, border: unlocked ? `1.5px solid ${T.neon}60` : isNext ? `1.5px solid ${T.indigo}60` : `1px solid ${T.border}`, boxShadow: unlocked ? shadow.neon : "none" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 23, background: unlocked ? T.neonL : isNext ? T.indigoL : T.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: unlocked ? shadow.neon : "none" }}>{m.badge}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: unlocked ? T.neon : T.textPrimary }}>{m.title}</span>
                      <TagPill color={unlocked ? T.neon : isNext ? T.indigo : T.textMuted} bg={unlocked ? T.neonL : isNext ? T.indigoL : T.surface}>Day {m.day}</TagPill>
                    </div>
                    {unlocked && <div style={{ fontSize: 10, fontWeight: 800, color: T.neon, marginBottom: 4, textShadow: shadow.neon }}>✓ UNLOCKED</div>}
                    {isNext && <div style={{ fontSize: 10, fontWeight: 800, color: T.indigo, marginBottom: 4 }}>{m.day - dayNum} days away</div>}
                    <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>{m.reward}</div>
                    <div style={{ fontSize: 11, fontStyle: "italic", color: T.textMuted, borderLeft: `2px solid ${unlocked ? T.neon : T.border}`, paddingLeft: 8 }}>{m.verse}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );

      case "avatar": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          {saved.plan !== "elite" ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Crown size={48} color={T.neon} style={{ marginBottom: 16, filter: `drop-shadow(0 0 12px ${T.neon})` }} />
              <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 8 }}>Elite Feature</h2>
              <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>Your personal AI avatar trainer reacts to your progress, gives daily coaching, and celebrates your wins. Exclusive to Elite plan.</p>
              <PrimaryBtn onClick={onGoToPlans}>Unlock Elite — $28.99/mo</PrimaryBtn>
            </div>
          ) : !avatarState ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 8 }}>Build Your Trainer</h2>
              <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24 }}>Create your personalised AI coach who guides you daily.</p>
              <PrimaryBtn onClick={() => setShowAvatarBuilder(true)}>Build My Avatar →</PrimaryBtn>
            </div>
          ) : (
            <>
              <h1 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>Your Trainer</h1>
              <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 20 }}>Your personalised AI recovery coach — reacts to your daily progress.</p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `2px solid ${T.neon}50`, boxShadow: shadow.neon, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <AvatarDisplay avatar={avatarState} size={150} mood={avatarMood} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: T.neon, textShadow: shadow.neon }}>Your Coach</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{avatarState.bodyType} build · {avatarState.hairStyle} hair</div>
                  </div>
                </div>
              </div>
              <NeonCard style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 10, color: T.neon, marginBottom: 8, letterSpacing: "1px" }}>TODAY'S COACHING</div>
                <p style={{ fontSize: 14, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, fontFamily: "Georgia,serif", margin: 0 }}>{avatarQuote}</p>
              </NeonCard>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: T.textPrimary, marginBottom: 10 }}>Your trainer reacts to your progress</div>
                {(["excited", "happy", "neutral", "sad"] as const).map((mood, i) => {
                  const labels = ["All tasks done → Maximum celebration", ">60% tasks done → Proud and encouraging", "Making progress → Steady coaching", "Streak lost → Concerned but supportive"];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <AvatarDisplay avatar={avatarState} size={48} mood={mood} />
                      <div style={{ fontSize: 12, color: T.textSecondary }}>{labels[i]}</div>
                    </div>
                  );
                })}
              </Card>
              <button onClick={() => setShowAvatarBuilder(true)} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", color: T.neon, fontWeight: 700, fontSize: 13, border: `1.5px solid ${T.neon}60`, cursor: "pointer", boxShadow: shadow.neon }}>
                Customise Avatar
              </button>
            </>
          )}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>{renderTab()}</div>
      <div style={{ flexShrink: 0, background: T.surface, borderTop: `1px solid ${T.border}`, paddingBottom: "env(safe-area-inset-bottom,12px)", paddingTop: 10, paddingLeft: 4, paddingRight: 4, display: "flex", justifyContent: "space-around", alignItems: "flex-end", zIndex: 50 }}>
        <NavBtn icon={<Home size={20} />}     label="Home"     active={tab === "home"}     onClick={() => setTab("home")} />
        <NavBtn icon={<BookOpen size={20} />} label="Protocol" active={tab === "protocol"} onClick={() => setTab("protocol")} />
        <button onClick={() => setTab("today")} style={{ width: 56, height: 56, borderRadius: 28, background: tab === "today" ? T.neon : T.card, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${tab === "today" ? T.neon : T.border}`, boxShadow: tab === "today" ? shadow.neon : shadow.sm, cursor: "pointer", marginBottom: 4, flexShrink: 0 }}>
          <Dumbbell size={22} color={tab === "today" ? T.bg : T.textSecondary} />
        </button>
        <NavBtn icon={<Users size={20} />}   label="Squad"   active={tab === "squad"}   onClick={() => setTab("squad")} />
        <NavBtn icon={saved.plan === "elite" ? <Crown size={20} /> : <Trophy size={20} />} label={saved.plan === "elite" ? "Avatar" : "Rewards"} active={tab === "avatar" || tab === "rewards"} onClick={() => setTab(saved.plan === "elite" ? "avatar" : "rewards")} />
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  type Screen = "welcome" | "sport" | "injury" | "severity" | "goal" | "plan" | "dashboard";
  const [saved, setSaved] = useState<SavedState | null>(() => loadState());
  const [screen, setScreen] = useState<Screen>(() => loadState() ? "dashboard" : "welcome");
  const [sport,    setSport]    = useState<typeof SPORTS[0] | undefined>();
  const [injury,   setInjury]   = useState<typeof INJURIES[0] | undefined>();
  const [severity, setSeverity] = useState<typeof SEVERITIES[0] | undefined>();
  const [goal,     setGoal]     = useState<typeof GOALS_LIST[0] | undefined>();

  // Streak logic on app open
  useEffect(() => {
    const s = loadState();
    if (!s) return;
    const today = todayStr();
    if (s.lastActiveDate === today) return;
    const diff = daysBetween(s.lastActiveDate, today);
    let streak = s.streak; let alive = s.streakAlive;
    if (diff === 1) { streak = s.streak + 1; alive = true; }
    else if (diff > 1) { streak = 0; alive = false; }
    const updated = { ...s, lastActiveDate: today, streak, streakAlive: alive };
    saveState(updated); setSaved(updated);
  }, []);

  const handlePlanDone = (plan: "free" | "pro" | "elite") => {
    if (!sport || !injury || !severity || !goal) return;
    const today = todayStr();
    const ns: SavedState = {
      sportId: sport.id, injuryId: injury.id, severityId: severity.id, goalId: goal.id,
      startDate: today, lastActiveDate: today, streak: 1, streakAlive: true,
      completedTasks: {}, suppChecked: {}, unlockedMilestones: [],
      plan, trialStartDate: today, avatar: null, bodyProfile: null, posts: {},
    };
    saveState(ns); setSaved(ns); setScreen("dashboard");
  };

  const handleUpgrade = (plan: "pro" | "elite") => {
    const s = loadState();
    if (s) { const u = { ...s, plan }; saveState(u); setSaved(u); }
  };

  const handleReset = () => {
    clearState(); setSaved(null); setSport(undefined); setInjury(undefined); setSeverity(undefined); setGoal(undefined); setScreen("welcome");
  };

  const goToPlans = () => setScreen("plan");

  return (
    <div style={{ width: "100%", height: "100dvh", maxWidth: 430, margin: "0 auto", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Inter',sans-serif", background: T.bg }}>
      {screen === "welcome"  && <div style={{ flex: 1, overflowY: "auto" }}><Welcome onNext={() => setScreen("sport")} /></div>}
      {screen === "sport"    && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SportSelect    onNext={s  => { setSport(s);    setScreen("injury");   }} /></div>}
      {screen === "injury"   && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><InjurySelect   onNext={i  => { setInjury(i);   setScreen("severity"); }} /></div>}
      {screen === "severity" && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SeveritySelect onNext={sv => { setSeverity(sv); setScreen("goal");     }} /></div>}
      {screen === "goal"     && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><GoalSelect     onNext={g  => { setGoal(g);     setScreen("plan");     }} /></div>}
      {screen === "plan"     && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><PlanSelect onSelectPlan={plan => { if (plan === "free") { handlePlanDone("free"); } else { handleUpgrade(plan as "pro"|"elite"); handlePlanDone(plan); } }} onFreeConfirm={() => handlePlanDone("free")} /></div>}
      {screen === "dashboard" && saved && <AppDashboard saved={saved} onReset={handleReset} onUpgrade={handleUpgrade} onGoToPlans={goToPlans} />}
    </div>
  );
}

