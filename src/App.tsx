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

// Avatar interface defined near ANIMALS data below

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
  avatarName: string;
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

  const all: Record<string,Post[]> = {

    basketball:[
      {id:"b1",author:"Marcus T.",msg:"Day 47 post-ACL. Hit 90 degrees ROM today. Nordic curls protocol is absolutely legit — don't sleep on eccentric loading.",likes:24,likedByMe:false,timestamp:ago(2),replies:[
        {author:"Darius K.",msg:"Keep pushing! Day 82 here, jumping again soon. Week 6 was my turning point.",timestamp:ago(1)},
        {author:"Tina M.",msg:"How long until you walked without a limp? Day 30 and still struggling.",timestamp:ago(0.5)},
        {author:"Marcus T.",msg:"@Tina around day 35. Trust the process, do quad sets every single day.",timestamp:ago(0.3)},
        {author:"JayBall23",msg:"What weight were you using for the nordic curls at week 6?",timestamp:ago(0.1)},
      ]},
      {id:"b2",author:"DeShawn W.",msg:"134 days out. Dropped 40pts in first game back. Read this app every day. Your comeback is coming. Trust the science and trust God.",likes:201,likedByMe:false,timestamp:ago(6),replies:[
        {author:"Marcus T.",msg:"This just made my whole week. Thank you for this.",timestamp:ago(5)},
        {author:"Coach Rivera",msg:"This is EXACTLY why we do the work. Screenshot this.",timestamp:ago(4)},
        {author:"JayBall23",msg:"Crying reading this. Day 12 feeling hopeless. This helped so much.",timestamp:ago(3)},
        {author:"DeShawn W.",msg:"@JayBall day 12 is the hardest. Gets better at week 4. I promise.",timestamp:ago(2)},
        {author:"Aaliyah R.",msg:"Screenshotted and set as my wallpaper. Thank you DeShawn.",timestamp:ago(1)},
      ]},
      {id:"b3",author:"Coach Rivera",msg:"Recovery pace is not weakness. It IS the strategy. Athletes who rush back re-tear. Be patient. Be disciplined. Come back STRONGER.",likes:89,likedByMe:false,timestamp:ago(12),replies:[
        {author:"KD_Recover",msg:"Needed this today. Was about to push too hard.",timestamp:ago(11)},
        {author:"Tina M.",msg:"Saving this post forever.",timestamp:ago(10)},
        {author:"Marcus T.",msg:"My PT says the same thing every session. Now I believe it.",timestamp:ago(9)},
      ]},
      {id:"b4",author:"KD_Recover",msg:"Week 8 post meniscus repair. Hopped on the bike today for the first time. Literally cried. Small wins matter so much.",likes:67,likedByMe:false,timestamp:ago(18),replies:[
        {author:"Marcus T.",msg:"The bike tears hit different. You are doing amazing.",timestamp:ago(17)},
        {author:"DeShawn W.",msg:"First bike session is a milestone. Mark it down.",timestamp:ago(16)},
        {author:"Aaliyah R.",msg:"I cannot wait for my bike moment. Day 18 here.",timestamp:ago(15)},
      ]},
      {id:"b5",author:"Aaliyah R.",msg:"Anyone dealing with mental blocks after ACL? Knee is healed but brain won't let me go full speed. PT cleared me but I freeze on cuts.",likes:45,likedByMe:false,timestamp:ago(24),replies:[
        {author:"DeShawn W.",msg:"Most common thing nobody talks about. Took me 3 extra weeks mentally. Sports psych helped more than anything.",timestamp:ago(23)},
        {author:"Marcus T.",msg:"Graduated return. Go 50% then 60% then 70%. Let your brain catch up.",timestamp:ago(22)},
        {author:"Coach Rivera",msg:"Fear of re-injury is documented. Visualize successful cuts. Program the new pattern.",timestamp:ago(21)},
        {author:"Aaliyah R.",msg:"Thank you all. I feel less alone knowing this is normal.",timestamp:ago(20)},
        {author:"KD_Recover",msg:"Worked with a sports psych for 3 sessions and it was a game changer.",timestamp:ago(19)},
      ]},
    ],

    football:[
      {id:"f1",author:"Jake M.",msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol. Every task in this app matters — I did all of them.",likes:67,likedByMe:false,timestamp:ago(3),replies:[
        {author:"Kyle R.",msg:"How was your mental during recovery?",timestamp:ago(2)},
        {author:"Jake M.",msg:"Mental was harder than physical. Week 3 was brutal. Just keep showing up.",timestamp:ago(1.5)},
        {author:"BigLineman55",msg:"This gives me hope. Day 20 on hamstring here.",timestamp:ago(1)},
        {author:"QB_Comeback",msg:"82 days!! My doc said 90 minimum. You give me hope.",timestamp:ago(0.5)},
      ]},
      {id:"f2",author:"Tyler B.",msg:"Post-surgery day 14. The daily schedule is keeping me sane. Structure when you feel helpless is everything.",likes:31,likedByMe:false,timestamp:ago(8),replies:[
        {author:"Jake M.",msg:"That structure saved me too. Stick with it every day.",timestamp:ago(7)},
        {author:"Lamar_DL",msg:"What surgery did you have?",timestamp:ago(6)},
        {author:"Tyler B.",msg:"ACL reconstruction. Patellar tendon graft.",timestamp:ago(5)},
        {author:"BigLineman55",msg:"How are you handling the swelling at day 14?",timestamp:ago(4)},
        {author:"Tyler B.",msg:"Ice protocol from this app 3x daily. Swelling down 60% vs week 1.",timestamp:ago(3)},
      ]},
      {id:"f3",author:"BigLineman55",msg:"Hamstring grade 2. Anyone done the Nordic curl protocol? Looks intense but I want to try it.",likes:18,likedByMe:false,timestamp:ago(15),replies:[
        {author:"Jake M.",msg:"Eccentric lowering only until week 4. Research is solid on this.",timestamp:ago(14)},
        {author:"Coach Rivera",msg:"Askling protocol is gold standard. Do NOT skip eccentric work.",timestamp:ago(13)},
        {author:"BigLineman55",msg:"Appreciate the guidance. Starting tomorrow.",timestamp:ago(12)},
        {author:"QB_Comeback",msg:"Nordic curls changed my hamstring recovery. Do them slow — 3 second lowering.",timestamp:ago(11)},
      ]},
      {id:"f4",author:"QB_Comeback",msg:"Rotator cuff question — when did you all start throwing again post-repair? Week 12 here and arm feels strong but nervous.",likes:22,likedByMe:false,timestamp:ago(30),replies:[
        {author:"Jake M.",msg:"My QB friend started at week 14. Light toss only, then build up.",timestamp:ago(29)},
        {author:"Coach Rivera",msg:"ASES score needs to be 85+ before throwing. Get your PT to test you.",timestamp:ago(28)},
        {author:"QB_Comeback",msg:"Never heard of ASES score. Going to ask my PT today.",timestamp:ago(27)},
      ]},
    ],

    soccer:[
      {id:"s1",author:"Priya R.",msg:"Week 3 hamstring. Pool running is saving my cardio base. If you are injured and not pool running you are missing out.",likes:18,likedByMe:false,timestamp:ago(4),replies:[
        {author:"Ana S.",msg:"Pool running changed my whole recovery. 3 weeks of it. Worth every boring lap.",timestamp:ago(3)},
        {author:"Mia L.",msg:"How long per session? I have access to a pool.",timestamp:ago(2)},
        {author:"Priya R.",msg:"20-25 min with a heart rate monitor. Stay at 70% max HR.",timestamp:ago(1)},
        {author:"Carlos M.",msg:"Deep water running or shallow? I've been doing shallow but maybe that's wrong.",timestamp:ago(0.5)},
        {author:"Priya R.",msg:"@Carlos deep water with an aqua belt. Zero impact on the hamstring.",timestamp:ago(0.2)},
      ]},
      {id:"s2",author:"Jordan K.",msg:"First training session back. 10 months from ACL. Cried on the pitch. If you are early in your recovery — it is possible. This app got me through.",likes:145,likedByMe:false,timestamp:ago(10),replies:[
        {author:"Priya R.",msg:"Tears of joy deserved. Congratulations.",timestamp:ago(9)},
        {author:"Mia L.",msg:"This gives me hope. Week 2 and struggling.",timestamp:ago(8)},
        {author:"Ana S.",msg:"10 months proves it is worth it.",timestamp:ago(7)},
        {author:"Jordan K.",msg:"@Mia week 2 is the hardest. The protocol works.",timestamp:ago(6)},
        {author:"Carlos M.",msg:"Printing this and putting it on my wall.",timestamp:ago(5)},
      ]},
      {id:"s3",author:"Mia L.",msg:"Day 45. Full squat without pain. Feels like a miracle.",likes:52,likedByMe:false,timestamp:ago(20),replies:[
        {author:"Jordan K.",msg:"Day 45 full squat means day 90 you are running. Trajectory is perfect.",timestamp:ago(19)},
        {author:"Priya R.",msg:"Screenshot this progress.",timestamp:ago(18)},
        {author:"Ana S.",msg:"What was your pain level at day 30? Asking for myself.",timestamp:ago(17)},
        {author:"Mia L.",msg:"@Ana 4/10 at day 30. It dropped fast around day 38.",timestamp:ago(16)},
      ]},
      {id:"s4",author:"Carlos M.",msg:"Anyone dealt with re-injury fear? First sprint session today and I froze. Knee feels fine but mind said no.",likes:38,likedByMe:false,timestamp:ago(35),replies:[
        {author:"Jordan K.",msg:"This is the most real thing. Took me 6 extra weeks mentally. Sports psych is underrated.",timestamp:ago(34)},
        {author:"Priya R.",msg:"Start at 50% speed. Let your body prove it to your brain slowly.",timestamp:ago(33)},
        {author:"Carlos M.",msg:"Tried 60% today and landed it. Baby steps.",timestamp:ago(32)},
      ]},
    ],

    baseball:[
      {id:"bb1",author:"PitcherDave",msg:"Tommy John surgery day 1. 12-month road ahead. Starting the daily protocol from day one. Documenting everything here.",likes:15,likedByMe:false,timestamp:ago(2),replies:[
        {author:"ArmCare_Coach",msg:"Document everything. Day 1 mindset sets the tone for the whole recovery.",timestamp:ago(1.5)},
        {author:"OutfieldRob",msg:"Went through it 2 years ago. Here if you need anything.",timestamp:ago(1)},
        {author:"PitcherDave",msg:"@OutfieldRob thank you. What was month 3 like?",timestamp:ago(0.5)},
        {author:"OutfieldRob",msg:"Month 3 was actually the hardest mentally. But also when you start seeing real progress.",timestamp:ago(0.2)},
      ]},
      {id:"bb2",author:"ArmCare_Coach",msg:"Band work before every session is non-negotiable. 5 minutes of rotator cuff bands prevented my second surgery. Do the unsexy work.",likes:44,likedByMe:false,timestamp:ago(10),replies:[
        {author:"PitcherDave",msg:"Which bands specifically? I have a set but not sure on the right ones.",timestamp:ago(9)},
        {author:"ArmCare_Coach",msg:"Theraband CLX or Jaeger bands. Yellow and red resistance to start.",timestamp:ago(8)},
        {author:"OutfieldRob",msg:"Jaeger bands changed my arm health. Used them every single day for 2 years.",timestamp:ago(7)},
      ]},
      {id:"bb3",author:"OutfieldRob",msg:"Month 9 post Tommy John. First time on the mound since surgery. Threw 45 mph and cried. You will get there.",likes:89,likedByMe:false,timestamp:ago(20),replies:[
        {author:"PitcherDave",msg:"This is the post I needed today. Saving this.",timestamp:ago(19)},
        {author:"ArmCare_Coach",msg:"45 mph at month 9 is right on protocol. Well done.",timestamp:ago(18)},
        {author:"CatcherKev",msg:"Watched my teammate go through this. The mound moment always gets me.",timestamp:ago(17)},
        {author:"OutfieldRob",msg:"@PitcherDave you will be right here in 8 months. Stay with it.",timestamp:ago(16)},
      ]},
    ],

    tennis:[
      {id:"t1",author:"ServeQueen",msg:"Tennis elbow week 4. Tyler Twist eccentric curls are already making a difference. The science in this app is real.",likes:22,likedByMe:false,timestamp:ago(3),replies:[
        {author:"NetNinja",msg:"Week 4 is when it clicks. Keep going — week 6 you will be shocked.",timestamp:ago(2)},
        {author:"BaselineBob",msg:"How many sets per day? I've been doing 3x15 twice daily.",timestamp:ago(1)},
        {author:"ServeQueen",msg:"3x15 once daily. PT said not to overdo it on tendons.",timestamp:ago(0.5)},
      ]},
      {id:"t2",author:"NetNinja",msg:"ACL at 38 years old. Everyone said my playing days were over. Day 180 — back on court today. Age is just a number.",likes:112,likedByMe:false,timestamp:ago(8),replies:[
        {author:"ServeQueen",msg:"This is everything. How was your rehab at an older age vs younger players?",timestamp:ago(7)},
        {author:"NetNinja",msg:"Slower. Maybe 20% slower. But my discipline was higher. Older athletes follow the protocol better.",timestamp:ago(6)},
        {author:"BaselineBob",msg:"Needed this. I'm 41 with a hamstring strain feeling sorry for myself.",timestamp:ago(5)},
        {author:"NetNinja",msg:"@BaselineBob 41 is nothing. Your experience is an asset in rehab.",timestamp:ago(4)},
        {author:"CoachT_Tennis",msg:"Older athletes actually have better recovery outcomes when they follow the protocol. The data supports this.",timestamp:ago(3)},
      ]},
      {id:"t3",author:"BaselineBob",msg:"Shoulder dislocation. Week 6 just started external rotation band work. It is painful but the progress week over week is real.",likes:18,likedByMe:false,timestamp:ago(15),replies:[
        {author:"CoachT_Tennis",msg:"ER work is the most important part of shoulder rehab. It will feel weird but stay with it.",timestamp:ago(14)},
        {author:"ServeQueen",msg:"I did 8 weeks of that. So boring but so necessary.",timestamp:ago(13)},
      ]},
    ],

    track:[
      {id:"tr1",author:"SprintKing",msg:"Hamstring grade 2. Following the Askling protocol exactly. Week 2 no passive stretching — counterintuitive but trusting the science.",likes:19,likedByMe:false,timestamp:ago(2),replies:[
        {author:"HurdleQueen",msg:"The no-passive-stretch rule is hard to follow but so important. Saved my season.",timestamp:ago(1.5)},
        {author:"LongJumpLee",msg:"Day 22 post hamstring here. Nordic curls starting this week. Nervous.",timestamp:ago(1)},
        {author:"SprintKing",msg:"@LongJumpLee start with just the eccentric lowering. Slow and controlled.",timestamp:ago(0.5)},
      ]},
      {id:"tr2",author:"HurdleQueen",msg:"Stress fracture recovery week 10. Started jogging on the track today for the first time. 25% pace only. I almost forgot what it felt like.",likes:67,likedByMe:false,timestamp:ago(6),replies:[
        {author:"SprintKing",msg:"Week 10 jogging is right on schedule. You are doing this right.",timestamp:ago(5)},
        {author:"LongJumpLee",msg:"How did the bone feel? Any pain on impact?",timestamp:ago(4)},
        {author:"HurdleQueen",msg:"Zero pain. PT said that means the bone density nutrition worked.",timestamp:ago(3)},
        {author:"MarathonMike",msg:"The calcium and D3 protocol in this app is the real deal. My scan showed complete healing at week 12.",timestamp:ago(2)},
      ]},
      {id:"tr3",author:"LongJumpLee",msg:"Anyone else dealing with the mental side of sprinting after a hamstring tear? Every time I get near top speed I brace for the pop.",likes:41,likedByMe:false,timestamp:ago(12),replies:[
        {author:"HurdleQueen",msg:"This is so real. You have to reprogram. I did 2 weeks of visualization before I trusted my full speed.",timestamp:ago(11)},
        {author:"SprintKing",msg:"Graduated speed work is the answer. 60%, 70%, 80%, 90%. Your brain needs the proof.",timestamp:ago(10)},
        {author:"LongJumpLee",msg:"Starting graduated sprints tomorrow. Going to use a GPS watch to make sure I stay at 60%.",timestamp:ago(9)},
      ]},
    ],

    swimming:[
      {id:"sw1",author:"FreeStyleFinn",msg:"Rotator cuff repair week 3. Upper body is out but I am pool walking and kicking only. Maintaining cardio base while the shoulder heals.",likes:14,likedByMe:false,timestamp:ago(3),replies:[
        {author:"BackstrokeB",msg:"Kick sets kept me sane. Also kept my VO2 max from dropping too much.",timestamp:ago(2)},
        {author:"ButterflySue",msg:"What do you do for upper body strength while the shoulder is out?",timestamp:ago(1)},
        {author:"FreeStyleFinn",msg:"Band work for the non-injured muscles and a lot of core.",timestamp:ago(0.5)},
      ]},
      {id:"sw2",author:"BackstrokeB",msg:"Shoulder surgery day 180. Got back in the pool today. Full practice. Fastest I have ever felt. Months of patience paid off.",likes:88,likedByMe:false,timestamp:ago(9),replies:[
        {author:"FreeStyleFinn",msg:"Day 180 gives me life. Exactly where I am going.",timestamp:ago(8)},
        {author:"ButterflySue",msg:"When did you start actual swim strokes again?",timestamp:ago(7)},
        {author:"BackstrokeB",msg:"Week 16 with light freestyle. Week 20 backstroke. Full butterfly week 24.",timestamp:ago(6)},
        {author:"CoachAquatic",msg:"Perfect timeline. This is the protocol followed correctly.",timestamp:ago(5)},
      ]},
      {id:"sw3",author:"ButterflySue",msg:"The depression during recovery is real. Phelps talked about it and now I get it. I scheduled a therapist alongside my PT. Recommend this to everyone.",likes:72,likedByMe:false,timestamp:ago(18),replies:[
        {author:"BackstrokeB",msg:"This is so important. The mental side is not talked about enough in swimming circles.",timestamp:ago(17)},
        {author:"FreeStyleFinn",msg:"Same. My therapist helped me reframe the recovery as training not waiting.",timestamp:ago(16)},
        {author:"CoachAquatic",msg:"Mental skills training during injury is documented to improve return-to-sport outcomes.",timestamp:ago(15)},
      ]},
    ],

    volleyball:[
      {id:"v1",author:"BlockQueen",msg:"ACL while landing a block. Week 1. The shock is real. Just found this app and starting the daily protocol today.",likes:11,likedByMe:false,timestamp:ago(4),replies:[
        {author:"SetterSam",msg:"Week 1 is survival mode. Just do the ankle pumps and ice. You will be okay.",timestamp:ago(3)},
        {author:"LiberoLia",msg:"Been there. One day at a time. This app really does help structure the chaos.",timestamp:ago(2)},
        {author:"BlockQueen",msg:"Thank you both. First time I have felt less alone since it happened.",timestamp:ago(1)},
        {author:"SetterSam",msg:"Tag me with your weekly updates. We are cheering for you.",timestamp:ago(0.5)},
      ]},
      {id:"v2",author:"SetterSam",msg:"Single leg balance day 3 post ankle sprain. Feels impossible but the proprioception work is real. Falls every 10 seconds but improving each day.",likes:27,likedByMe:false,timestamp:ago(7),replies:[
        {author:"LiberoLia",msg:"The BOSU ball was a game changer for my ankle. Do you have access to one?",timestamp:ago(6)},
        {author:"SetterSam",msg:"No BOSU but I am using a folded yoga mat. Works surprisingly well.",timestamp:ago(5)},
        {author:"BlockQueen",msg:"I will remember this for when I get to that phase.",timestamp:ago(4)},
      ]},
      {id:"v3",author:"LiberoLia",msg:"9 months post ACL. Back on the court for first practice. Coach let me serve only. I cried. Small moments mean everything after this journey.",likes:94,likedByMe:false,timestamp:ago(16),replies:[
        {author:"SetterSam",msg:"Serving only is a WIN. You earned that serve.",timestamp:ago(15)},
        {author:"BlockQueen",msg:"Saving this for the hard days.",timestamp:ago(14)},
        {author:"LiberoLia",msg:"@BlockQueen you will be here too. Keep going.",timestamp:ago(13)},
        {author:"DiggerD",msg:"9 months. Worth every painful step.",timestamp:ago(12)},
      ]},
    ],

    golf:[
      {id:"g1",author:"EagleMike",msg:"Lower back strain week 2. McGill Big 3 starting today. The bird-dog is harder than I expected. Humbling exercise.",likes:16,likedByMe:false,timestamp:ago(5),replies:[
        {author:"ProShopPete",msg:"McGill Big 3 saved my career. Do it slow and controlled. The activation is everything.",timestamp:ago(4)},
        {author:"FairwayFrank",msg:"How are you handling not swinging? That was the hardest part for me.",timestamp:ago(3)},
        {author:"EagleMike",msg:"Brutal. I am watching swing videos and visualizing. Coach Tiger's mental approach is keeping me going.",timestamp:ago(2)},
      ]},
      {id:"g2",author:"ProShopPete",msg:"4 weeks post back surgery. Putting today for the first time. Only putting. But the feel of a club in my hand again was emotional.",likes:52,likedByMe:false,timestamp:ago(11),replies:[
        {author:"EagleMike",msg:"Putting first is the right call. How long until chipping?",timestamp:ago(10)},
        {author:"ProShopPete",msg:"PT said week 8 for short chips. Full swing not until week 14.",timestamp:ago(9)},
        {author:"FairwayFrank",msg:"I was back to 75% full swing by week 12. The core work makes the difference.",timestamp:ago(8)},
        {author:"DriveQueen",msg:"Core stability is the unlock for golfers. I spent 3 months just on that.",timestamp:ago(7)},
      ]},
      {id:"g3",author:"FairwayFrank",msg:"Knee surgery at 52. Everyone said give up the game. Shot a 79 in my first round back. Never let age or injury write the end of your story.",likes:134,likedByMe:false,timestamp:ago(22),replies:[
        {author:"EagleMike",msg:"79 is incredible. What was your timeline?",timestamp:ago(21)},
        {author:"FairwayFrank",msg:"8 months total. Slower than younger players but my protocol adherence was 100%.",timestamp:ago(20)},
        {author:"DriveQueen",msg:"This is the post I send to every golfer who says they are done.",timestamp:ago(19)},
        {author:"ProShopPete",msg:"Printing this and putting it in my shop.",timestamp:ago(18)},
      ]},
    ],

    mma:[
      {id:"m1",author:"GrappleGod",msg:"Broken leg recovery week 6. Everyone said career over. Using that doubt as fuel every single session. See you in the cage.",likes:89,likedByMe:false,timestamp:ago(2),replies:[
        {author:"CageKing",msg:"Broken leg to comeback is the ultimate story. What does your PT say about timeline?",timestamp:ago(1.5)},
        {author:"StrikerX",msg:"McGregor did it. You will do it. Keep the fuel burning.",timestamp:ago(1)},
        {author:"GrappleGod",msg:"PT says 4 more months minimum. I am treating every session like a training camp.",timestamp:ago(0.5)},
        {author:"CoachCombat",msg:"The mindset you bring to rehab directly affects outcomes. Keep this energy.",timestamp:ago(0.2)},
      ]},
      {id:"m2",author:"StrikerX",msg:"ACL in sparring. Week 3. The fascial rolling daily is already helping. 20 min every morning before anything else.",likes:34,likedByMe:false,timestamp:ago(8),replies:[
        {author:"GrappleGod",msg:"Foam rolling is the foundation. Keep it up especially on the IT band.",timestamp:ago(7)},
        {author:"CageKing",msg:"How are you maintaining cardio with no leg work?",timestamp:ago(6)},
        {author:"StrikerX",msg:"Upper body circuits and seated shadowboxing. Keeping the mind sharp.",timestamp:ago(5)},
        {author:"CoachCombat",msg:"Seated shadowboxing is underrated. Mental pattern rehearsal during injury is proven to maintain skill.",timestamp:ago(4)},
      ]},
      {id:"m3",author:"CageKing",msg:"Post concussion protocol complete. Doc cleared me today after 6 weeks. SCAT5 passed. Back to light pad work tomorrow.",likes:61,likedByMe:false,timestamp:ago(14),replies:[
        {author:"StrikerX",msg:"Concussion clearance is the one you never rush. You handled this right.",timestamp:ago(13)},
        {author:"GrappleGod",msg:"6 weeks is nothing compared to fighting with a bad brain. Smart call.",timestamp:ago(12)},
        {author:"CoachCombat",msg:"SCAT5 clearance plus 24 hour symptom free before full contact. You followed the protocol perfectly.",timestamp:ago(11)},
        {author:"CageKing",msg:"This community kept me accountable when I wanted to rush back. Thank you all.",timestamp:ago(10)},
      ]},
      {id:"m4",author:"CoachCombat",msg:"For everyone in combat sports — isolation kills recovery. Stay connected to your team even when you can't train. Your mental is 30% of your comeback.",likes:77,likedByMe:false,timestamp:ago(24),replies:[
        {author:"GrappleGod",msg:"Watching training while recovering is painful but it keeps you connected.",timestamp:ago(23)},
        {author:"StrikerX",msg:"My coach makes me come to every practice just to observe. Didn't love it at first but now I get it.",timestamp:ago(22)},
      ]},
    ],

    gymnastics:[
      {id:"gy1",author:"FlipQueen",msg:"Ankle fracture week 2. The mental recovery is already as hard as the physical. Sports psych appointment booked alongside PT.",likes:21,likedByMe:false,timestamp:ago(3),replies:[
        {author:"VaultVee",msg:"Sports psych was more important for me than PT honestly. Do both.",timestamp:ago(2)},
        {author:"BeamBella",msg:"The mental piece in gymnastics is completely unique. Every skill has a fear component.",timestamp:ago(1)},
        {author:"FlipQueen",msg:"@BeamBella exactly. I am afraid I will lose the connection to the skills.",timestamp:ago(0.5)},
        {author:"VaultVee",msg:"You do not lose them. Your body remembers. Thousands of hours do not disappear.",timestamp:ago(0.2)},
      ]},
      {id:"gy2",author:"VaultVee",msg:"ACL at nationals. 8 months out. Just did my first vault approach today. Stopped before the board. But I got there. Progress.",likes:78,likedByMe:false,timestamp:ago(9),replies:[
        {author:"FlipQueen",msg:"Getting to the board IS the vault right now. That is progress.",timestamp:ago(8)},
        {author:"BeamBella",msg:"The approach is 80% of the vault mentally. You are closer than you think.",timestamp:ago(7)},
        {author:"VaultVee",msg:"My psych coach said to celebrate every meter. So I am.",timestamp:ago(6)},
        {author:"CoachGym",msg:"Graduated skill return is exactly right for gymnastics. Approach, then hurdle, then board, then vault.",timestamp:ago(5)},
      ]},
      {id:"gy3",author:"BeamBella",msg:"The twisties are real and so is recovering from them. 4 months of mental skills work alongside physical. Back on beam today without them.",likes:103,likedByMe:false,timestamp:ago(18),replies:[
        {author:"VaultVee",msg:"The twisties recovery is its own science. You handled this with so much courage.",timestamp:ago(17)},
        {author:"FlipQueen",msg:"How did the mental skills work actually help?",timestamp:ago(16)},
        {author:"BeamBella",msg:"Visualization, breathing patterns, and breaking each skill into tiny steps. Rebuilt my trust piece by piece.",timestamp:ago(15)},
        {author:"CoachGym",msg:"This is textbook psychological skill return. Beautiful work.",timestamp:ago(14)},
      ]},
    ],

    cycling:[
      {id:"cy1",author:"TourFred",msg:"Crash recovery week 4. Collarbone and ribs. Getting back on a stationary bike today. First time on a saddle since the crash.",likes:18,likedByMe:false,timestamp:ago(3),replies:[
        {author:"GravelGrace",msg:"Stationary bike first is the right call. The balance demand of a real bike comes later.",timestamp:ago(2)},
        {author:"HillClimber",msg:"Collarbone is brutal. How is the range of motion?",timestamp:ago(1)},
        {author:"TourFred",msg:"About 70% overhead right now. PT says 90% by week 8.",timestamp:ago(0.5)},
      ]},
      {id:"cy2",author:"GravelGrace",msg:"Knee surgery week 14. First outdoor ride today. 20 minutes easy on flat ground. I cried at the top of a tiny hill.",likes:67,likedByMe:false,timestamp:ago(7),replies:[
        {author:"TourFred",msg:"The first outdoor ride hits different. That hill was a mountain.",timestamp:ago(6)},
        {author:"HillClimber",msg:"This is the trajectory. Week 14 outdoor ride means week 20 you are back in the hills.",timestamp:ago(5)},
        {author:"GravelGrace",msg:"I rode past the spot where I crashed. That was the real milestone.",timestamp:ago(4)},
        {author:"Froome_Fan",msg:"Froome got back on the exact stage where he crashed. It is a tradition.",timestamp:ago(3)},
      ]},
      {id:"cy3",author:"HillClimber",msg:"Stress fracture in tibia. Weight-bearing walking starts today. The bone density nutrition protocol in this app is something I wish I had found sooner.",likes:29,likedByMe:false,timestamp:ago(15),replies:[
        {author:"GravelGrace",msg:"The calcium D3 K2 protocol is real. My bone scan at week 12 was ahead of schedule.",timestamp:ago(14)},
        {author:"TourFred",msg:"Weight-bearing walking is such a milestone. Mark it down.",timestamp:ago(13)},
        {author:"HillClimber",msg:"Cried putting my full weight through it for the first time.",timestamp:ago(12)},
      ]},
    ],

    hockey:[
      {id:"h1",author:"CapSkater",msg:"Post concussion day 5. Cognitive rest is harder than it sounds. No phone, no TV, dark room. Driving me crazy but following protocol exactly.",likes:22,likedByMe:false,timestamp:ago(4),replies:[
        {author:"GoalieMac",msg:"Day 5 is the hardest. It gets better at day 8 when you can start light aerobic.",timestamp:ago(3)},
        {author:"DefenseD",msg:"Crosby sat out 10 months. Your 5 days is the right move.",timestamp:ago(2)},
        {author:"CapSkater",msg:"Crosby quote is what I am holding onto right now.",timestamp:ago(1)},
        {author:"GoalieMac",msg:"The protocol works if you follow it. No shortcuts with concussions.",timestamp:ago(0.5)},
      ]},
      {id:"h2",author:"GoalieMac",msg:"Knee surgery week 10. First time on the ice today. Just skating easy laps. No stops, no turns. Never appreciated laps so much in my life.",likes:54,likedByMe:false,timestamp:ago(8),replies:[
        {author:"CapSkater",msg:"Easy laps today means full practice in 6 weeks. You are right on schedule.",timestamp:ago(7)},
        {author:"DefenseD",msg:"The feeling of your edges on fresh ice after surgery is incomparable.",timestamp:ago(6)},
        {author:"GoalieMac",msg:"I literally stopped in the corner and just stood there on the ice. Took it all in.",timestamp:ago(5)},
        {author:"WingerWes",msg:"These are the moments that make every painful day worth it.",timestamp:ago(4)},
      ]},
      {id:"h3",author:"DefenseD",msg:"Shoulder dislocation. The sleep issue nobody talks about — I cannot sleep on either side. Any tips from people who have been through it?",likes:31,likedByMe:false,timestamp:ago(14),replies:[
        {author:"GoalieMac",msg:"Sleeping on your back only with a pillow under the arm. Game changer.",timestamp:ago(13)},
        {author:"WingerWes",msg:"Pregnancy pillow sounds ridiculous but it worked for me.",timestamp:ago(12)},
        {author:"DefenseD",msg:"Ordering a pregnancy pillow tonight. Will report back.",timestamp:ago(11)},
        {author:"CapSkater",msg:"The sleep position matters more than people realize for shoulder recovery.",timestamp:ago(10)},
      ]},
    ],

    rugby:[
      {id:"r1",author:"ScotsProp",msg:"Knee ligament surgery week 2. BOSU board single-leg work starting today. Falls every 30 seconds but the nervous system needs the challenge.",likes:17,likedByMe:false,timestamp:ago(3),replies:[
        {author:"LooseHead",msg:"Proprioception is the unsexy work nobody talks about but it is everything for rugby return.",timestamp:ago(2)},
        {author:"OpenSide",msg:"Falls are good. That is your nervous system learning. Keep falling and getting up.",timestamp:ago(1)},
        {author:"ScotsProp",msg:"Coach McCaw quote: do them religiously. That is what I am doing.",timestamp:ago(0.5)},
      ]},
      {id:"r2",author:"LooseHead",msg:"ACL reconstruction week 18. First contact training today. Light tackle bags only. Never thought I would be this grateful for tackling a bag.",likes:72,likedByMe:false,timestamp:ago(7),replies:[
        {author:"ScotsProp",msg:"Tackle bag is the first step back to real rugby. Huge milestone.",timestamp:ago(6)},
        {author:"OpenSide",msg:"How did the knee feel under contact load?",timestamp:ago(5)},
        {author:"LooseHead",msg:"Solid. PT had me do the hop test last week — 89% symmetry. Almost there.",timestamp:ago(4)},
        {author:"FlankerFitz",msg:"I need 90% symmetry on hop test before return. What protocol got you to 89% at week 18?",timestamp:ago(3)},
        {author:"LooseHead",msg:"@FlankerFitz Nordic curls and single leg press 4x per week from week 8. And the protocol tasks in this app every day.",timestamp:ago(2)},
      ]},
      {id:"r3",author:"OpenSide",msg:"Week 3 is the mental valley. Your injury doesn't hurt as much but you're not close enough to return. Push hardest during this phase.",likes:56,likedByMe:false,timestamp:ago(12),replies:[
        {author:"ScotsProp",msg:"In week 3 right now. This is exactly how it feels.",timestamp:ago(11)},
        {author:"LooseHead",msg:"Week 3 is where I almost quit. The dip is real but so is the other side.",timestamp:ago(10)},
        {author:"FlankerFitz",msg:"My captain told me the same thing. You have to push through the valley.",timestamp:ago(9)},
        {author:"OpenSide",msg:"Every rugby player hits the valley. The ones who push through it make it back. The ones who give in don't.",timestamp:ago(8)},
      ]},
    ],

    lacrosse:[
      {id:"l1",author:"AttackAlex",msg:"Second ACL in 3 years. I know the protocol better than my PT at this point. Starting from day 1 again with zero self-pity.",likes:38,likedByMe:false,timestamp:ago(2),replies:[
        {author:"MidfieldMoe",msg:"Second ACL is a different beast mentally. The fact you are zero self-pity on day 1 is everything.",timestamp:ago(1.5)},
        {author:"GoalieGus",msg:"What do you think caused the second one? Different surgery this time?",timestamp:ago(1)},
        {author:"AttackAlex",msg:"Biomechanical analysis showed hip weakness causing valgus collapse. Fixing the root cause this time.",timestamp:ago(0.5)},
        {author:"MidfieldMoe",msg:"Root cause is the key phrase. Most people just fix the symptom.",timestamp:ago(0.2)},
      ]},
      {id:"l2",author:"MidfieldMoe",msg:"Shoulder dislocation from a check. Week 6 rotator cuff band work. The external rotation progress is measurable week over week.",likes:19,likedByMe:false,timestamp:ago(8),replies:[
        {author:"AttackAlex",msg:"ER work is the least glamorous and most important thing in shoulder rehab.",timestamp:ago(7)},
        {author:"GoalieGus",msg:"What resistance are you using? I am on yellow band week 4.",timestamp:ago(6)},
        {author:"MidfieldMoe",msg:"Yellow week 4 to 6, red week 7 to 9. Slow progression protects the repair.",timestamp:ago(5)},
        {author:"CoachLax",msg:"This timeline is exactly right. Do not rush to the heavier bands.",timestamp:ago(4)},
      ]},
      {id:"l3",author:"GoalieGus",msg:"Faith over fear is my recovery mantra. Wrote it on my wrist brace. Sounds corny but it works when you are struggling at 5am doing ice protocol.",likes:61,likedByMe:false,timestamp:ago(14),replies:[
        {author:"AttackAlex",msg:"Not corny at all. The mental anchor is real. Mine says one more day.",timestamp:ago(13)},
        {author:"MidfieldMoe",msg:"Paul Rabil quote. He wrote it on his brace too. You are in good company.",timestamp:ago(12)},
        {author:"GoalieGus",msg:"@MidfieldMoe did not know that. Makes it hit even harder.",timestamp:ago(11)},
        {author:"CoachLax",msg:"The brotherhood of sport during injury is one of the most powerful recovery tools. This thread is proof.",timestamp:ago(10)},
        {author:"AttackAlex",msg:"This community is genuinely helping my mental recovery as much as the physical protocol.",timestamp:ago(9)},
      ]},
    ],

  };

  return all[sportId] || [
    {id:"g1",author:"Recovery Community",msg:`Welcome to the ${sportId} recovery squad! Drop your injury and how many days in you are. Let us support each other.`,likes:0,likedByMe:false,timestamp:new Date().toISOString(),replies:[]},
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

// ── ANIMAL AVATAR DATA ───────────────────────────────────────────────────────
// Age stages: baby(day 1-6) → toddler(7-20) → teen(21-59) → adult(60+)
// Each stage the animal gets slightly bigger, more detailed, gains accessories

const ANIMALS = [
  { id:"lion",    name:"Lion",    emoji:"🦁", primary:"#F59E0B", secondary:"#FDE68A", accent:"#92400E" },
  { id:"tiger",   name:"Tiger",   emoji:"🐯", primary:"#F97316", secondary:"#FED7AA", accent:"#7C2D12" },
  { id:"bear",    name:"Bear",    emoji:"🐻", primary:"#92400E", secondary:"#D97706", accent:"#451A03" },
  { id:"panda",   name:"Panda",   emoji:"🐼", primary:"#1F2937", secondary:"#F9FAFB", accent:"#374151" },
  { id:"fox",     name:"Fox",     emoji:"🦊", primary:"#DC2626", secondary:"#FCA5A5", accent:"#7F1D1D" },
  { id:"wolf",    name:"Wolf",    emoji:"🐺", primary:"#6B7280", secondary:"#D1D5DB", accent:"#374151" },
  { id:"cat",     name:"Cat",     emoji:"🐱", primary:"#F59E0B", secondary:"#FEF3C7", accent:"#78350F" },
  { id:"dog",     name:"Dog",     emoji:"🐶", primary:"#B45309", secondary:"#FDE68A", accent:"#78350F" },
  { id:"rabbit",  name:"Rabbit",  emoji:"🐰", primary:"#EC4899", secondary:"#FBCFE8", accent:"#9D174D" },
  { id:"frog",    name:"Frog",    emoji:"🐸", primary:"#22C55E", secondary:"#86EFAC", accent:"#14532D" },
  { id:"penguin", name:"Penguin", emoji:"🐧", primary:"#1E3A5F", secondary:"#E0F2FE", accent:"#0C1A2E" },
  { id:"owl",     name:"Owl",     emoji:"🦉", primary:"#7C3AED", secondary:"#DDD6FE", accent:"#4C1D95" },
];

// Age stage helper
function getAgeStage(dayNum: number): "baby"|"toddler"|"teen"|"adult" {
  if (dayNum < 7)  return "baby";
  if (dayNum < 21) return "toddler";
  if (dayNum < 60) return "teen";
  return "adult";
}

function getAgeLabel(dayNum: number): string {
  const stage = getAgeStage(dayNum);
  if (stage === "baby")    return "Baby 🍼";
  if (stage === "toddler") return "Toddler 🌱";
  if (stage === "teen")    return "Teen ⚡";
  return "Adult 🏆";
}

const AVATAR_COLORS: Record<string, string[]> = {
  aura: ["#39FF14","#FF3B3B","#6366F1","#F59E0B","#EC4899","#38BDF8","#A855F7","#10B981"],
};

interface Avatar {
  animalId: string;
  auraColor: string;
}

// ── KAHOOT-STYLE GROWING ANIMAL AVATAR ────────────────────────────────────────
function AvatarDisplay({ avatar, size = 80, mood = "happy", dayNum = 1, name = "" }: {
  avatar: Avatar; size?: number; mood?: "happy"|"sad"|"neutral"|"excited"; dayNum?: number; name?: string;
}) {
  const animal = ANIMALS.find(a => a.id === avatar.animalId) || ANIMALS[0];
  const stage  = getAgeStage(dayNum);
  const s = size;
  const cx = s * 0.5;
  const cy = s * 0.5;

  // Scale: baby is small/round, grows each stage
  const headScale  = stage === "baby" ? 0.88 : stage === "toddler" ? 0.82 : stage === "teen" ? 0.76 : 0.72;
  const headRadius = s * headScale * 0.45;
  const roundness  = stage === "baby" ? 1.15 : stage === "toddler" ? 1.05 : stage === "teen" ? 1.0 : 0.95;

  // Eye size — babies have huge eyes (Kahoot style)
  const eyeSize   = stage === "baby" ? s * 0.13 : stage === "toddler" ? s * 0.11 : s * 0.09;
  const eyeSpread = stage === "baby" ? s * 0.13 : stage === "toddler" ? s * 0.14 : s * 0.15;
  const eyeY      = mood === "sad" ? cy - s*0.06 : cy - s*0.07;

  // Mood expressions
  const eyeScaleY = mood === "excited" ? 1.25 : mood === "sad" ? 0.55 : 1;
  const pupilSize = eyeSize * 0.52;

  const mouthEl = mood === "happy"
    ? <path d={`M${cx-s*0.13} ${cy+s*0.11} Q${cx} ${cy+s*0.21} ${cx+s*0.13} ${cy+s*0.11}`} stroke={animal.accent} strokeWidth={s*0.03} fill="none" strokeLinecap="round"/>
    : mood === "excited"
    ? <>
        <path d={`M${cx-s*0.16} ${cy+s*0.09} Q${cx} ${cy+s*0.25} ${cx+s*0.16} ${cy+s*0.09}`} stroke={animal.accent} strokeWidth={s*0.03} fill="#FF6B8A" strokeLinecap="round"/>
        <ellipse cx={cx} cy={cy+s*0.18} rx={s*0.09} ry={s*0.06} fill="#FF6B8A" opacity="0.45"/>
      </>
    : mood === "sad"
    ? <path d={`M${cx-s*0.13} ${cy+s*0.17} Q${cx} ${cy+s*0.08} ${cx+s*0.13} ${cy+s*0.17}`} stroke={animal.accent} strokeWidth={s*0.028} fill="none" strokeLinecap="round"/>
    : <path d={`M${cx-s*0.09} ${cy+s*0.13} L${cx+s*0.09} ${cy+s*0.13}`} stroke={animal.accent} strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>;

  const cheeksEl = (mood === "happy" || mood === "excited") && <>
    <ellipse cx={cx-s*0.24} cy={cy+s*0.04} rx={s*0.08} ry={s*0.05} fill="#FF9BAA" opacity="0.5"/>
    <ellipse cx={cx+s*0.24} cy={cy+s*0.04} rx={s*0.08} ry={s*0.05} fill="#FF9BAA" opacity="0.5"/>
  </>;

  // Eyes (shared)
  const eyesEl = (<>
    <ellipse cx={cx-eyeSpread} cy={eyeY} rx={eyeSize} ry={eyeSize*eyeScaleY} fill="white"/>
    <ellipse cx={cx+eyeSpread} cy={eyeY} rx={eyeSize} ry={eyeSize*eyeScaleY} fill="white"/>
    <circle cx={cx-eyeSpread+s*0.01} cy={eyeY+s*0.01} r={pupilSize} fill="#111"/>
    <circle cx={cx+eyeSpread+s*0.01} cy={eyeY+s*0.01} r={pupilSize} fill="#111"/>
    <circle cx={cx-eyeSpread-s*0.02} cy={eyeY-s*0.03} r={eyeSize*0.26} fill="white" opacity="0.9"/>
    <circle cx={cx+eyeSpread-s*0.02} cy={eyeY-s*0.03} r={eyeSize*0.26} fill="white" opacity="0.9"/>
    {mood==="sad" && <ellipse cx={cx-eyeSpread} cy={eyeY+eyeSize*0.8} rx={s*0.02} ry={s*0.028} fill="#60A5FA" opacity="0.8"/>}
  </>);

  // Eyebrows tilt per mood
  const browEl = (<>
    <path d={mood==="sad"
      ? `M${cx-eyeSpread-s*0.08} ${eyeY-eyeSize-s*0.04} Q${cx-eyeSpread} ${eyeY-eyeSize-s*0.08} ${cx-eyeSpread+s*0.08} ${eyeY-eyeSize-s*0.02}`
      : `M${cx-eyeSpread-s*0.08} ${eyeY-eyeSize-s*0.02} Q${cx-eyeSpread} ${eyeY-eyeSize-s*0.08} ${cx-eyeSpread+s*0.08} ${eyeY-eyeSize-s*0.04}`}
      stroke={animal.accent} strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>
    <path d={mood==="sad"
      ? `M${cx+eyeSpread-s*0.08} ${eyeY-eyeSize-s*0.02} Q${cx+eyeSpread} ${eyeY-eyeSize-s*0.08} ${cx+eyeSpread+s*0.08} ${eyeY-eyeSize-s*0.04}`
      : `M${cx+eyeSpread-s*0.08} ${eyeY-eyeSize-s*0.04} Q${cx+eyeSpread} ${eyeY-eyeSize-s*0.08} ${cx+eyeSpread+s*0.08} ${eyeY-eyeSize-s*0.02}`}
      stroke={animal.accent} strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>
  </>);

  // Animal-specific face parts
  const renderFace = () => {
    const p = animal.primary; const sec = animal.secondary; const acc = animal.accent;
    const hr = headRadius;

    // Shared nose helper
    const noseTriangle = (nx:number, ny:number, nw:number) =>
      <path d={`M${nx} ${ny} L${nx-nw} ${ny+nw*0.7} L${nx+nw} ${ny+nw*0.7}Z`} fill={acc}/>;

    switch(animal.id) {
      case "lion": return <>
        {/* Mane — more layers as they age */}
        {["baby","toddler","teen","adult"].slice(0,["baby","toddler","teen","adult"].indexOf(stage)+1).map((_, si) => {
          const r = hr + s*(0.06 + si*0.04);
          return [0,45,90,135,180,225,270,315].map((deg,i) => (
            <ellipse key={`${si}-${i}`}
              cx={cx+Math.cos(deg*Math.PI/180)*r} cy={cy+Math.sin(deg*Math.PI/180)*r}
              rx={s*(0.07+si*0.01)} ry={s*(0.1+si*0.015)}
              fill={i%2===0?"#F59E0B":"#D97706"} opacity={0.8-si*0.1}
              transform={`rotate(${deg},${cx+Math.cos(deg*Math.PI/180)*r},${cy+Math.sin(deg*Math.PI/180)*r})`}/>
          ));
        })}
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.2} rx={hr*0.55} ry={hr*0.45} fill={sec} opacity="0.55"/>
        <ellipse cx={cx-hr*0.72} cy={cy-hr*0.72} rx={hr*0.22} ry={hr*0.22} fill={p}/>
        <ellipse cx={cx+hr*0.72} cy={cy-hr*0.72} rx={hr*0.22} ry={hr*0.22} fill={p}/>
        {noseTriangle(cx, cy+hr*0.08, s*0.06)}
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "tiger": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        {/* Stripes — more as they age */}
        {stage !== "baby" && <>
          <path d={`M${cx-hr*0.5} ${cy-hr*0.8} Q${cx-hr*0.4} ${cy-hr*0.3} ${cx-hr*0.6} ${cy}`} stroke={acc} strokeWidth={s*0.04} fill="none" strokeLinecap="round"/>
          <path d={`M${cx+hr*0.5} ${cy-hr*0.8} Q${cx+hr*0.4} ${cy-hr*0.3} ${cx+hr*0.6} ${cy}`} stroke={acc} strokeWidth={s*0.04} fill="none" strokeLinecap="round"/>
        </>}
        {(stage==="teen"||stage==="adult") && <path d={`M${cx-hr*0.15} ${cy-hr*0.95} L${cx-hr*0.12} ${cy-hr*0.55}`} stroke={acc} strokeWidth={s*0.03} fill="none" strokeLinecap="round"/>}
        <ellipse cx={cx} cy={cy+hr*0.15} rx={hr*0.48} ry={hr*0.38} fill={sec}/>
        <path d={`M${cx-hr*0.7} ${cy-hr*0.68} L${cx-hr*0.92} ${cy-hr*1.05} L${cx-hr*0.45} ${cy-hr*0.75}Z`} fill={p}/>
        <path d={`M${cx+hr*0.7} ${cy-hr*0.68} L${cx+hr*0.92} ${cy-hr*1.05} L${cx+hr*0.45} ${cy-hr*0.75}Z`} fill={p}/>
        <path d={`M${cx-hr*0.68} ${cy-hr*0.7} L${cx-hr*0.87} ${cy-hr*1.0} L${cx-hr*0.47} ${cy-hr*0.76}Z`} fill="#EC4899" opacity="0.7"/>
        <path d={`M${cx+hr*0.68} ${cy-hr*0.7} L${cx+hr*0.87} ${cy-hr*1.0} L${cx+hr*0.47} ${cy-hr*0.76}Z`} fill="#EC4899" opacity="0.7"/>
        {noseTriangle(cx, cy+hr*0.05, s*0.055)}
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "panda": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill="#F9FAFB"/>
        <ellipse cx={cx-hr*0.35} cy={cy-hr*0.1} rx={hr*0.38} ry={hr*0.35} fill="#1F2937"/>
        <ellipse cx={cx+hr*0.35} cy={cy-hr*0.1} rx={hr*0.38} ry={hr*0.35} fill="#1F2937"/>
        <ellipse cx={cx-hr*0.35} cy={cy-hr*0.1} rx={hr*0.26} ry={hr*0.25} fill="white"/>
        <ellipse cx={cx+hr*0.35} cy={cy-hr*0.1} rx={hr*0.26} ry={hr*0.25} fill="white"/>
        <ellipse cx={cx} cy={cy+hr*0.28} rx={hr*0.36} ry={hr*0.26} fill="#F3F4F6"/>
        <ellipse cx={cx} cy={cy+hr*0.12} rx={hr*0.14} ry={hr*0.12} fill="#111827"/>
        <circle cx={cx-hr*0.75} cy={cy-hr*0.75} r={hr*0.28} fill="#1F2937"/>
        <circle cx={cx+hr*0.75} cy={cy-hr*0.75} r={hr*0.28} fill="#1F2937"/>
        <circle cx={cx-hr*0.33} cy={cy-hr*0.1} r={eyeSize*0.85} fill="#111"/>
        <circle cx={cx+hr*0.37} cy={cy-hr*0.1} r={eyeSize*0.85} fill="#111"/>
        <circle cx={cx-hr*0.26} cy={cy-hr*0.16} r={eyeSize*0.3} fill="white" opacity="0.9"/>
        <circle cx={cx+hr*0.44} cy={cy-hr*0.16} r={eyeSize*0.3} fill="white" opacity="0.9"/>
        {cheeksEl}{mouthEl}
      </>;

      case "fox": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <path d={`M${cx} ${cy-hr*0.25} Q${cx-hr*0.45} ${cy+hr*0.1} ${cx-hr*0.28} ${cy+hr*0.65} Q${cx} ${cy+hr*0.75} ${cx+hr*0.28} ${cy+hr*0.65} Q${cx+hr*0.45} ${cy+hr*0.1} ${cx} ${cy-hr*0.25}Z`} fill="white"/>
        <path d={`M${cx-hr*0.55} ${cy-hr*0.65} L${cx-hr*0.85} ${cy-hr*1.1} L${cx-hr*0.22} ${cy-hr*0.72}Z`} fill={p}/>
        <path d={`M${cx+hr*0.55} ${cy-hr*0.65} L${cx+hr*0.85} ${cy-hr*1.1} L${cx+hr*0.22} ${cy-hr*0.72}Z`} fill={p}/>
        <path d={`M${cx-hr*0.52} ${cy-hr*0.67} L${cx-hr*0.78} ${cy-hr*1.02} L${cx-hr*0.25} ${cy-hr*0.73}Z`} fill="#EC4899" opacity="0.7"/>
        <path d={`M${cx+hr*0.52} ${cy-hr*0.67} L${cx+hr*0.78} ${cy-hr*1.02} L${cx+hr*0.25} ${cy-hr*0.73}Z`} fill="#EC4899" opacity="0.7"/>
        <ellipse cx={cx} cy={cy+hr*0.1} rx={hr*0.14} ry={hr*0.12} fill="#111"/>
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "rabbit": return <>
        <ellipse cx={cx-hr*0.35} cy={cy-hr*1.1} rx={hr*0.22} ry={hr*0.55} fill={p}/>
        <ellipse cx={cx+hr*0.35} cy={cy-hr*1.1} rx={hr*0.22} ry={hr*0.55} fill={p}/>
        <ellipse cx={cx-hr*0.35} cy={cy-hr*1.1} rx={hr*0.13} ry={hr*0.42} fill="#EC4899" opacity="0.7"/>
        <ellipse cx={cx+hr*0.35} cy={cy-hr*1.1} rx={hr*0.13} ry={hr*0.42} fill="#EC4899" opacity="0.7"/>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.28} rx={hr*0.36} ry={hr*0.26} fill={sec}/>
        <ellipse cx={cx} cy={cy+hr*0.16} rx={hr*0.1} ry={hr*0.08} fill="#EC4899"/>
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "frog": return <>
        <ellipse cx={cx-hr*0.45} cy={cy-hr*0.82} rx={hr*0.34} ry={hr*0.32} fill={sec}/>
        <ellipse cx={cx+hr*0.45} cy={cy-hr*0.82} rx={hr*0.34} ry={hr*0.32} fill={sec}/>
        <circle cx={cx-hr*0.45} cy={cy-hr*0.82} r={hr*0.22} fill="#111"/>
        <circle cx={cx+hr*0.45} cy={cy-hr*0.82} r={hr*0.22} fill="#111"/>
        <circle cx={cx-hr*0.38} cy={cy-hr*0.88} r={hr*0.09} fill="white" opacity="0.9"/>
        <circle cx={cx+hr*0.52} cy={cy-hr*0.88} r={hr*0.09} fill="white" opacity="0.9"/>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.3} rx={hr*0.6} ry={hr*0.48} fill={sec} opacity="0.65"/>
        {mood !== "sad"
          ? <path d={`M${cx-hr*0.5} ${cy+hr*0.24} Q${cx} ${cy+hr*0.68} ${cx+hr*0.5} ${cy+hr*0.24}`} stroke="#14532D" strokeWidth={s*0.03} fill="none" strokeLinecap="round"/>
          : <path d={`M${cx-hr*0.5} ${cy+hr*0.55} Q${cx} ${cy+hr*0.25} ${cx+hr*0.5} ${cy+hr*0.55}`} stroke="#14532D" strokeWidth={s*0.03} fill="none" strokeLinecap="round"/>
        }
        {cheeksEl}
      </>;

      case "cat": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.1} rx={hr*0.5} ry={hr*0.42} fill={sec} opacity="0.45"/>
        <path d={`M${cx-hr*0.5} ${cy-hr*0.72} L${cx-hr*0.78} ${cy-hr*1.15} L${cx-hr*0.2} ${cy-hr*0.78}Z`} fill={p}/>
        <path d={`M${cx+hr*0.5} ${cy-hr*0.72} L${cx+hr*0.78} ${cy-hr*1.15} L${cx+hr*0.2} ${cy-hr*0.78}Z`} fill={p}/>
        <path d={`M${cx-hr*0.48} ${cy-hr*0.73} L${cx-hr*0.72} ${cy-hr*1.07} L${cx-hr*0.22} ${cy-hr*0.79}Z`} fill="#EC4899" opacity="0.65"/>
        <path d={`M${cx+hr*0.48} ${cy-hr*0.73} L${cx+hr*0.72} ${cy-hr*1.07} L${cx+hr*0.22} ${cy-hr*0.79}Z`} fill="#EC4899" opacity="0.65"/>
        {(stage==="teen"||stage==="adult") && <>
          <line x1={cx-hr*0.9} y1={cy+hr*0.1} x2={cx-hr*0.45} y2={cy+hr*0.09} stroke={acc} strokeWidth={s*0.015} opacity="0.6"/>
          <line x1={cx-hr*0.9} y1={cy+hr*0.24} x2={cx-hr*0.45} y2={cy+hr*0.21} stroke={acc} strokeWidth={s*0.015} opacity="0.6"/>
          <line x1={cx+hr*0.9} y1={cy+hr*0.1} x2={cx+hr*0.45} y2={cy+hr*0.09} stroke={acc} strokeWidth={s*0.015} opacity="0.6"/>
          <line x1={cx+hr*0.9} y1={cy+hr*0.24} x2={cx+hr*0.45} y2={cy+hr*0.21} stroke={acc} strokeWidth={s*0.015} opacity="0.6"/>
        </>}
        <path d={`M${cx} ${cy+hr*0.04} L${cx-hr*0.1} ${cy+hr*0.17} L${cx+hr*0.1} ${cy+hr*0.17}Z`} fill={acc}/>
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "dog": return <>
        <ellipse cx={cx-hr*0.8} cy={cy} rx={hr*0.28} ry={hr*0.55} fill={p} transform={`rotate(-18,${cx-hr*0.8},${cy})`}/>
        <ellipse cx={cx+hr*0.8} cy={cy} rx={hr*0.28} ry={hr*0.55} fill={p} transform={`rotate(18,${cx+hr*0.8},${cy})`}/>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.28} rx={hr*0.5} ry={hr*0.38} fill={sec}/>
        <ellipse cx={cx} cy={cy+hr*0.08} rx={hr*0.18} ry={hr*0.15} fill="#111"/>
        <ellipse cx={cx-hr*0.06} cy={cy+hr*0.12} rx={hr*0.06} ry={hr*0.04} fill="#000" opacity="0.45"/>
        <ellipse cx={cx+hr*0.06} cy={cy+hr*0.12} rx={hr*0.06} ry={hr*0.04} fill="#000" opacity="0.45"/>
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "wolf": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.25} rx={hr*0.5} ry={hr*0.38} fill={sec} opacity="0.55"/>
        <path d={`M${cx-hr*0.55} ${cy-hr*0.7} L${cx-hr*0.9} ${cy-hr*1.15} L${cx-hr*0.25} ${cy-hr*0.75}Z`} fill={p}/>
        <path d={`M${cx+hr*0.55} ${cy-hr*0.7} L${cx+hr*0.9} ${cy-hr*1.15} L${cx+hr*0.25} ${cy-hr*0.75}Z`} fill={p}/>
        <path d={`M${cx-hr*0.52} ${cy-hr*0.72} L${cx-hr*0.84} ${cy-hr*1.08} L${cx-hr*0.27} ${cy-hr*0.76}Z`} fill="#9CA3AF" opacity="0.5"/>
        <path d={`M${cx+hr*0.52} ${cy-hr*0.72} L${cx+hr*0.84} ${cy-hr*1.08} L${cx+hr*0.27} ${cy-hr*0.76}Z`} fill="#9CA3AF" opacity="0.5"/>
        {noseTriangle(cx, cy+hr*0.04, s*0.06)}
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "bear": return <>
        <circle cx={cx-hr*0.72} cy={cy-hr*0.72} r={hr*0.28} fill={p}/>
        <circle cx={cx+hr*0.72} cy={cy-hr*0.72} r={hr*0.28} fill={p}/>
        <circle cx={cx-hr*0.72} cy={cy-hr*0.72} r={hr*0.16} fill={sec} opacity="0.6"/>
        <circle cx={cx+hr*0.72} cy={cy-hr*0.72} r={hr*0.16} fill={sec} opacity="0.6"/>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx} cy={cy+hr*0.26} rx={hr*0.45} ry={hr*0.34} fill={sec} opacity="0.65"/>
        <ellipse cx={cx} cy={cy+hr*0.1} rx={hr*0.15} ry={hr*0.13} fill={acc}/>
        {eyesEl}{browEl}{cheeksEl}{mouthEl}
      </>;

      case "penguin": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill="#1F2937"/>
        <ellipse cx={cx} cy={cy+hr*0.15} rx={hr*0.58} ry={hr*0.68} fill="white"/>
        <path d={`M${cx-hr*0.1} ${cy+hr*0.08} L${cx} ${cy+hr*0.22} L${cx+hr*0.1} ${cy+hr*0.08}Z`} fill="#F59E0B"/>
        <ellipse cx={cx-hr*0.95} cy={cy+hr*0.12} rx={hr*0.18} ry={hr*0.5} fill="#1F2937" transform={`rotate(-20,${cx-hr*0.95},${cy+hr*0.12})`}/>
        <ellipse cx={cx+hr*0.95} cy={cy+hr*0.12} rx={hr*0.18} ry={hr*0.5} fill="#1F2937" transform={`rotate(20,${cx+hr*0.95},${cy+hr*0.12})`}/>
        {eyesEl}{browEl}{cheeksEl}
        {mood==="happy"||mood==="excited"
          ? <path d={`M${cx-hr*0.2} ${cy+hr*0.38} Q${cx} ${cy+hr*0.55} ${cx+hr*0.2} ${cy+hr*0.38}`} stroke="#1E3A5F" strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>
          : mood==="sad"
          ? <path d={`M${cx-hr*0.2} ${cy+hr*0.52} Q${cx} ${cy+hr*0.38} ${cx+hr*0.2} ${cy+hr*0.52}`} stroke="#1E3A5F" strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>
          : <line x1={cx-hr*0.15} y1={cy+hr*0.44} x2={cx+hr*0.15} y2={cy+hr*0.44} stroke="#1E3A5F" strokeWidth={s*0.022}/>
        }
      </>;

      case "owl": return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        <ellipse cx={cx-hr*0.26} cy={cy-hr*0.08} rx={hr*0.38} ry={hr*0.44} fill={sec} opacity="0.55"/>
        <ellipse cx={cx+hr*0.26} cy={cy-hr*0.08} rx={hr*0.38} ry={hr*0.44} fill={sec} opacity="0.55"/>
        <circle cx={cx-hr*0.32} cy={cy-hr*0.12} r={hr*0.31} fill="white" stroke={acc} strokeWidth={s*0.02}/>
        <circle cx={cx+hr*0.32} cy={cy-hr*0.12} r={hr*0.31} fill="white" stroke={acc} strokeWidth={s*0.02}/>
        <circle cx={cx-hr*0.3} cy={cy-hr*0.1} r={hr*0.19} fill="#111"/>
        <circle cx={cx+hr*0.34} cy={cy-hr*0.1} r={hr*0.19} fill="#111"/>
        <circle cx={cx-hr*0.24} cy={cy-hr*0.18} r={hr*0.08} fill="white" opacity="0.9"/>
        <circle cx={cx+hr*0.4}  cy={cy-hr*0.18} r={hr*0.08} fill="white" opacity="0.9"/>
        <path d={`M${cx-hr*0.1} ${cy+hr*0.14} L${cx} ${cy+hr*0.3} L${cx+hr*0.1} ${cy+hr*0.14}Z`} fill="#F59E0B"/>
        <path d={`M${cx-hr*0.5} ${cy-hr*0.72} L${cx-hr*0.38} ${cy-hr*1.0} L${cx-hr*0.22} ${cy-hr*0.72}`} fill={p}/>
        <path d={`M${cx+hr*0.22} ${cy-hr*0.72} L${cx+hr*0.38} ${cy-hr*1.0} L${cx+hr*0.5} ${cy-hr*0.72}`} fill={p}/>
        {cheeksEl}
        {mood==="happy"||mood==="excited"
          ? <path d={`M${cx-hr*0.2} ${cy+hr*0.42} Q${cx} ${cy+hr*0.58} ${cx+hr*0.2} ${cy+hr*0.42}`} stroke={acc} strokeWidth={s*0.026} fill="none" strokeLinecap="round"/>
          : mood==="sad"
          ? <path d={`M${cx-hr*0.2} ${cy+hr*0.56} Q${cx} ${cy+hr*0.42} ${cx+hr*0.2} ${cy+hr*0.56}`} stroke={acc} strokeWidth={s*0.024} fill="none" strokeLinecap="round"/>
          : <line x1={cx-hr*0.16} y1={cy+hr*0.48} x2={cx+hr*0.16} y2={cy+hr*0.48} stroke={acc} strokeWidth={s*0.022}/>
        }
      </>;

      default: return <>
        <ellipse cx={cx} cy={cy} rx={hr} ry={hr*roundness} fill={p}/>
        {eyesEl}{cheeksEl}{mouthEl}
      </>;
    }
  };

  // Stage accessories overlay
  const accessoriesEl = () => {
    if (stage === "baby") return (
      <text x={s*0.82} y={s*0.2} fontSize={s*0.18} textAnchor="middle" dominantBaseline="middle">🍼</text>
    );
    if (stage === "toddler") return (
      <text x={s*0.85} y={s*0.2} fontSize={s*0.18} textAnchor="middle" dominantBaseline="middle">🌱</text>
    );
    if (stage === "teen") return (
      <text x={s*0.85} y={s*0.18} fontSize={s*0.18} textAnchor="middle" dominantBaseline="middle">⚡</text>
    );
    // Adult gets crown
    return (
      <text x={s*0.85} y={s*0.16} fontSize={s*0.2} textAnchor="middle" dominantBaseline="middle">👑</text>
    );
  };

  // Excited sparkles
  const sparklesEl = mood === "excited" && <>
    <path d={`M${s*0.14} ${s*0.12} L${s*0.17} ${s*0.06} L${s*0.2} ${s*0.12} L${s*0.17} ${s*0.18}Z`} fill="#39FF14" opacity="0.85"/>
    <circle cx={s*0.09} cy={s*0.25} r={s*0.022} fill="#E8FF47" opacity="0.7"/>
  </>;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}
      style={{ filter: mood==="excited" ? `drop-shadow(0 0 ${s*0.07}px ${animal.primary}90)` : "none" }}>
      {/* Aura glow ring */}
      <circle cx={cx} cy={cy} r={s*0.47} fill={avatar.auraColor} opacity="0.12"/>
      <circle cx={cx} cy={cy} r={s*0.45} fill="none" stroke={avatar.auraColor} strokeWidth={s*0.025} opacity="0.35"/>
      {renderFace()}
      {accessoriesEl()}
      {sparklesEl}
      {/* Name tag for larger sizes */}
      {name && size >= 90 && (
        <>
          <rect x={s*0.1} y={s*0.88} width={s*0.8} height={s*0.14} rx={s*0.07} fill="rgba(0,0,0,0.55)"/>
          <text x={cx} y={s*0.957} fontSize={s*0.1} textAnchor="middle" dominantBaseline="middle" fill="white" fontWeight="bold" fontFamily="Inter,sans-serif">
            {name}
          </text>
        </>
      )}
    </svg>
  );
}

// ── ANIMAL AVATAR BUILDER (pick + name) ──────────────────────────────────────
function AvatarBuilder({ onSave, onBack, dayNum = 1 }: { onSave: (a: Avatar, name: string) => void; onBack: () => void; dayNum?: number }) {
  const [av, setAv]     = useState<Avatar>({ animalId: "lion", auraColor: AVATAR_COLORS.aura[0] });
  const [petName, setPetName] = useState("");
  const [animMood, setAnimMood] = useState<"happy"|"excited"|"neutral"|"sad">("happy");

  useEffect(() => {
    const moods: ("happy"|"excited"|"neutral")[] = ["happy","excited","neutral"];
    let i = 0;
    const t = setInterval(() => { i=(i+1)%moods.length; setAnimMood(moods[i]); }, 1800);
    return () => clearInterval(t);
  }, [av.animalId]);

  const stage = getAgeStage(dayNum);

  return (
    <div style={{ minHeight:"100%", background:T.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 20px 0", position:"sticky", top:0, background:T.bg, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:T.textSecondary, padding:4 }}>
            <ArrowLeft size={20}/>
          </button>
          <Logo size={22}/>
        </div>
        <h2 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:4 }}>Choose Your Animal</h2>
        <p style={{ fontSize:13, color:T.textSecondary, marginBottom:12 }}>
          Starts as a <strong style={{color:T.neon}}>baby</strong> on day 1. Grows to toddler, teen, then adult as your streak builds. 🐣→🐾
        </p>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 32px" }}>
        {/* Live preview */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ background:T.surface, borderRadius:24, padding:"20px 24px", border:`2px solid ${T.neon}50`, boxShadow:shadow.neon, display:"inline-flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <AvatarDisplay avatar={av} size={140} mood={animMood} dayNum={dayNum} name={petName||"?"}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:15, color:T.neon, textShadow:shadow.neon }}>
                {petName || "Name your pet"} · {getAgeLabel(dayNum)}
              </div>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>Grows with your streak every day</div>
            </div>
          </div>
        </div>

        {/* Name input */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Name Your Animal</div>
          <input
            value={petName}
            onChange={e => setPetName(e.target.value.slice(0,12))}
            placeholder="e.g. Blaze, Luna, Koda..."
            maxLength={12}
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${petName?T.neon:T.border}`, background:T.card, color:T.textPrimary, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", boxShadow:petName?shadow.neon:"none" }}
          />
          <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{petName.length}/12 characters</div>
        </div>

        {/* Animal grid */}
        <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Choose Animal</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
          {ANIMALS.map(animal => (
            <button key={animal.id} onClick={() => setAv(a => ({ ...a, animalId: animal.id }))}
              style={{ background:av.animalId===animal.id?T.neonL:T.surface, border:`2px solid ${av.animalId===animal.id?T.neon:T.border}`, borderRadius:14, padding:"10px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, boxShadow:av.animalId===animal.id?shadow.neon:"none" }}>
              <span style={{ fontSize:28 }}>{animal.emoji}</span>
              <span style={{ fontSize:11, fontWeight:700, color:av.animalId===animal.id?T.neon:T.textSecondary }}>{animal.name}</span>
            </button>
          ))}
        </div>

        {/* Aura color */}
        <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Aura Color</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
          {AVATAR_COLORS.aura.map(c => (
            <button key={c} onClick={() => setAv(a => ({ ...a, auraColor: c }))}
              style={{ width:42, height:42, borderRadius:21, background:c, cursor:"pointer", border:`3px solid ${av.auraColor===c?"white":"transparent"}`, boxShadow:av.auraColor===c?`0 0 14px ${c}`:undefined }}/>
          ))}
        </div>

        {/* Growth stages preview */}
        <div style={{ background:T.surface, borderRadius:16, padding:16, border:`1px solid ${T.border}`, marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:12, letterSpacing:"0.5px" }}>GROWTH STAGES</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            {([["baby",1,"🍼 Day 1"],["toddler",7,"🌱 Day 7"],["teen",21,"⚡ Day 21"],["adult",60,"👑 Day 60"]] as [string,number,string][]).map(([st,d,label]) => (
              <div key={st} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <AvatarDisplay avatar={av} size={46} mood="happy" dayNum={d}/>
                <div style={{ fontSize:9, color:stage===st?T.neon:T.textMuted, fontWeight:700, textAlign:"center" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => onSave(av, petName||"Buddy")}
          style={{ width:"100%", padding:"15px", borderRadius:14, background:T.neon, color:T.bg, fontWeight:900, fontSize:16, border:"none", cursor:"pointer", boxShadow:shadow.neon }}>
          {petName ? `Save ${petName} ✨` : "Save My Animal ✨"}
        </button>
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
              value={(form as unknown as Record<string, string>)[key]}
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
                <div style={{ fontSize: 9, color: T.neon, fontWeight: 700, marginTop: 2 }}>● {(() => { const d=parseInt(todayStr().replace(/-/g,""))%100; const v=Math.floor(((d+s.id.length*7)%40)-20); return Math.max(12,s.liveUsers+v); })()} active</div>
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
  const [awaitingPayment, setAwaitingPayment] = useState<"pro" | "elite" | null>(null);
  const [verifyCode, setVerifyCode]           = useState("");
  const [codeError, setCodeError]             = useState("");
  const [secondsLeft, setSecondsLeft]         = useState(45);
  const [canVerify, setCanVerify]             = useState(false);

  useEffect(() => {
    if (!awaitingPayment) { setSecondsLeft(45); setCanVerify(false); setVerifyCode(""); setCodeError(""); return; }
    const t = setInterval(() => {
      setSecondsLeft(s => { if (s <= 1) { clearInterval(t); setCanVerify(true); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [awaitingPayment]);

  const handleVerify = () => {
    const trimmed = verifyCode.trim();
    if (trimmed.length < 6) { setCodeError("Enter the Order ID from your Stripe receipt email."); return; }
    if (!/^[a-zA-Z0-9_\-]{6,32}$/.test(trimmed)) { setCodeError("Invalid format. Copy it exactly from your Stripe receipt."); return; }
    setCodeError("");
    onSelectPlan(awaitingPayment!);
  };

  const freeHave    = ["Daily recovery protocol","10-task daily checklist","Streak tracking","Basic squad access"];
  const freeMiss    = ["Personalised nutrition + macros","Supplement schedule","AI Animal coach","Video library","Advanced analytics","1-on-1 PT consults"];
  const proHave     = ["Everything in Free","Personalised macros + nutrition","Supplement timing schedule","Video exercise library","Progress analytics","Priority email support"];
  const proMiss     = ["AI Animal coach that grows with you","1-on-1 PT video consults","Custom meal plans","Custom supplement stack"];
  const eliteHave   = ["Everything in Pro","🐣 Baby animal coach on day 1","Animal grows baby→toddler→teen→adult","Name your animal companion","Animated reactions to your progress","Daily pep talks + streak celebrations","1-on-1 PT video consults","Custom meal + supplement plans","24/7 priority support"];

  if (awaitingPayment) {
    return (
      <div style={{ minHeight:"100%", background:T.bg, display:"flex", flexDirection:"column", padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <button onClick={() => setAwaitingPayment(null)} style={{ background:"none", border:"none", cursor:"pointer", color:T.textSecondary, padding:4 }}>
            <ArrowLeft size={20}/>
          </button>
          <Logo size={22}/>
        </div>

        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:52, marginBottom:10 }}>🔐</div>
          <h2 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:8 }}>Verify Your Payment</h2>
          <p style={{ fontSize:14, color:T.textSecondary, lineHeight:1.6 }}>
            Complete payment on Stripe then enter your <strong style={{color:T.neon}}>Order ID</strong> from the receipt email to activate your {awaitingPayment === "pro" ? "Pro ⚡" : "Elite 👑"} plan.
          </p>
        </div>

        <div style={{ background:T.surface, borderRadius:16, padding:16, marginBottom:12, border:`1px solid ${T.border}` }}>
          <div style={{ fontWeight:800, fontSize:11, color:T.neon, marginBottom:8, letterSpacing:"0.8px" }}>STEP 1 — COMPLETE PAYMENT</div>
          <p style={{ fontSize:13, color:T.textSecondary, marginBottom:12, lineHeight:1.5 }}>Tap below to open Stripe checkout in a new tab and complete your payment.</p>
          <button onClick={() => window.open(awaitingPayment === "pro" ? PLAN_PRO_URL : PLAN_ELITE_URL, "_blank")}
            style={{ width:"100%", padding:"12px", borderRadius:12, background: awaitingPayment==="pro"?T.teal:T.neon, color: awaitingPayment==="pro"?"white":T.bg, fontWeight:800, fontSize:14, border:"none", cursor:"pointer", boxShadow: awaitingPayment==="pro"?`0 0 16px ${T.teal}40`:shadow.neon }}>
            Open Stripe Checkout →
          </button>
        </div>

        <div style={{ background:T.surface, borderRadius:16, padding:16, marginBottom:20, border:`1px solid ${T.border}` }}>
          <div style={{ fontWeight:800, fontSize:11, color:T.neon, marginBottom:8, letterSpacing:"0.8px" }}>STEP 2 — ENTER RECEIPT CODE</div>
          <p style={{ fontSize:12, color:T.textSecondary, marginBottom:10, lineHeight:1.5 }}>
            After paying, Stripe emails you a receipt. Find the <strong style={{color:T.textPrimary}}>Order or Charge ID</strong> — it starts with <span style={{fontFamily:"monospace",color:T.neon,fontSize:11}}>ch_</span> or <span style={{fontFamily:"monospace",color:T.neon,fontSize:11}}>pi_</span> — and paste it below.
          </p>
          <input value={verifyCode} onChange={e => { setVerifyCode(e.target.value); setCodeError(""); }}
            placeholder="e.g. ch_3AbcDef12345..."
            style={{ width:"100%", padding:"12px", borderRadius:10, border:`1.5px solid ${codeError?T.red:verifyCode.length>5?T.neon:T.border}`, background:T.card, color:T.textPrimary, fontSize:13, fontFamily:"monospace", outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
          {codeError && <div style={{ fontSize:11, color:T.red, marginBottom:10 }}>{codeError}</div>}

          {!canVerify ? (
            <div style={{ background:T.card, borderRadius:12, padding:"14px", textAlign:"center", border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:4 }}>Activate button unlocks in</div>
              <div style={{ fontWeight:900, fontSize:32, color:T.neon, textShadow:shadow.neon, lineHeight:1 }}>{secondsLeft}s</div>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>Complete your payment in the Stripe tab while you wait</div>
            </div>
          ) : (
            <button onClick={handleVerify}
              style={{ width:"100%", padding:"14px", borderRadius:12, background:verifyCode.length>=6?T.neon:T.border, color:verifyCode.length>=6?T.bg:T.textMuted, fontWeight:900, fontSize:14, border:"none", cursor:verifyCode.length>=6?"pointer":"not-allowed", boxShadow:verifyCode.length>=6?shadow.neon:"none" }}>
              Verify & Activate {awaitingPayment==="pro"?"Pro ⚡":"Elite 👑"}
            </button>
          )}
        </div>

        <p style={{ fontSize:11, color:T.textMuted, textAlign:"center" }}>
          Can't find the code? Check your spam folder or email{" "}
          <span style={{color:T.neon}}>support@comebacktrainer.com</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100%", display:"flex", flexDirection:"column", background:T.bg }}>
      <div style={{ padding:"20px 20px 0", position:"sticky", top:0, background:T.bg, zIndex:10 }}>
        <Logo size={22}/><StepBar total={5} current={5}/>
        <h2 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:4 }}>Choose your plan</h2>
        <p style={{ fontSize:13, color:T.textSecondary, marginBottom:16 }}>Select a plan to start your recovery journey.</p>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 32px" }}>

        {/* FREE */}
        <div style={{ background:T.card, borderRadius:18, padding:"18px 16px", border:`1px solid ${T.border}`, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{fontSize:22}}>🌱</span><span style={{fontWeight:800,fontSize:16,color:T.textPrimary}}>Free</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:T.textPrimary}}>$0</span><div style={{fontSize:9,color:T.textMuted}}>24hr trial</div></div>
          </div>
          {freeHave.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={T.neon} strokeWidth={3}/><span style={{fontSize:12,color:T.textSecondary}}>{f}</span></div>)}
          {freeMiss.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><X size={13} color={T.red} strokeWidth={3}/><span style={{fontSize:12,color:T.textMuted,textDecoration:"line-through"}}>{f}</span></div>)}
          <button onClick={()=>onSelectPlan("free")} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,background:"transparent",color:T.textSecondary,fontWeight:700,fontSize:13,border:`1.5px solid ${T.border}`,cursor:"pointer"}}>
            Start Free Trial (24hrs only)
          </button>
          <p style={{fontSize:10,color:T.textMuted,textAlign:"center",marginTop:6}}>After 24hrs you need a paid plan to continue</p>
        </div>

        {/* PRO */}
        <div style={{ background:T.card, borderRadius:18, padding:"18px 16px", border:`1.5px solid ${T.teal}`, marginBottom:12, boxShadow:`0 0 20px ${T.teal}20`, position:"relative" }}>
          <div style={{position:"absolute",top:-10,right:16,background:T.teal,color:"white",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:10}}>BEST VALUE</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>⚡</span><span style={{fontWeight:800,fontSize:16,color:T.textPrimary}}>Pro</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:T.teal}}>$9.99/mo</span><div style={{fontSize:9,color:T.textMuted}}>billed monthly</div></div>
          </div>
          {proHave.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={T.teal} strokeWidth={3}/><span style={{fontSize:12,color:T.textSecondary}}>{f}</span></div>)}
          {proMiss.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><X size={13} color={T.red} strokeWidth={3}/><span style={{fontSize:12,color:T.textMuted,textDecoration:"line-through"}}>{f}</span></div>)}
          <button onClick={()=>{window.open(PLAN_PRO_URL,"_blank");setAwaitingPayment("pro");}}
            style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,background:T.teal,color:"white",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}}>
            Get Pro — $9.99/mo →
          </button>
          <p style={{fontSize:10,color:T.textMuted,textAlign:"center",marginTop:6}}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        {/* ELITE */}
        <div style={{ background:"linear-gradient(135deg,#0D0D1A,#12121E)", borderRadius:18, padding:"18px 16px", border:`2px solid ${T.neon}60`, marginBottom:16, boxShadow:shadow.neon, position:"relative" }}>
          <div style={{position:"absolute",top:-10,right:16,background:T.neon,color:T.bg,fontSize:10,fontWeight:900,padding:"3px 10px",borderRadius:10,boxShadow:shadow.neon}}>👑 MOST POPULAR</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>🏆</span><span style={{fontWeight:800,fontSize:16,color:T.textPrimary}}>Elite</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:T.neon,textShadow:shadow.neon}}>$28.99/mo</span><div style={{fontSize:9,color:T.textMuted}}>billed monthly</div></div>
          </div>
          {eliteHave.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={T.neon} strokeWidth={3}/><span style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>{f}</span></div>)}
          <button onClick={()=>{window.open(PLAN_ELITE_URL,"_blank");setAwaitingPayment("elite");}}
            style={{width:"100%",marginTop:14,padding:"13px",borderRadius:12,background:T.neon,color:T.bg,fontWeight:900,fontSize:13,border:"none",cursor:"pointer",boxShadow:shadow.neon}}>
            Get Elite + Animal Coach 🐣 — $28.99/mo →
          </button>
          <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:6}}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        <button onClick={()=>onSelectPlan("free")} style={{width:"100%",padding:"13px",borderRadius:14,background:"transparent",color:T.textSecondary,fontWeight:700,fontSize:14,border:`1.5px solid ${T.border}`,cursor:"pointer"}}>
          Start free 24hr trial instead
        </button>
      </div>
    </div>
  );
}

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
  // Fluctuating live users — changes daily per sport using date seed
  const getLiveCount = (base: number) => {
    const daySeed = parseInt(todayStr().replace(/-/g,"")) % 100;
    const sportSeed = saved.sportId.length * 7;
    const variance = Math.floor(((daySeed + sportSeed) % 40) - 20); // -20 to +20
    return Math.max(12, base + variance);
  };
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
  const [avatarName, setAvatarName]   = useState<string>(saved.avatarName || "");

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

  const handleSaveAvatar = (av: Avatar, name: string) => {
    setAvatarState(av);
    setAvatarName(name);
    const s = loadState();
    if (s) { s.avatar = av; s.avatarName = name; saveState(s); }
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
          <AvatarBuilder onSave={handleSaveAvatar} onBack={() => setShowAvatarBuilder(false)} dayNum={dayNum} />
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
                <AvatarDisplay avatar={avatarState} size={72} mood={avatarMood} dayNum={dayNum} name={avatarName}/>
                <div style={{ flex: 1 }}>
                  <div style={{fontWeight:800,fontSize:10,color:T.neon,marginBottom:4,letterSpacing:"1px"}}>{avatarName?`${avatarName.toUpperCase()} SAYS`:"YOUR TRAINER SAYS"}</div>
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
                  <div style={{fontWeight:800,fontSize:12,color:T.neon,marginBottom:4}}>🐣 PICK YOUR ANIMAL COACH</div>
                  <p style={{fontSize:12,color:T.textSecondary,margin:0,marginBottom:8}}>Choose an animal, name it, and watch it grow with your streak!</p>
                  <button onClick={()=>setShowAvatarBuilder(true)} style={{padding:"8px 16px",borderRadius:10,background:T.neon,color:T.bg,fontWeight:800,fontSize:12,border:"none",cursor:"pointer",boxShadow:shadow.neon}}>Pick Animal 🐾</button>
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
{saved.plan === "elite" && avatarState && <div style={{ marginTop:12,display:"flex",justifyContent:"center" }}><AvatarDisplay avatar={avatarState} size={80} mood="excited" dayNum={dayNum} name={avatarName}/></div>}
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
            <span style={{ fontSize: 13, fontWeight: 700, color: T.neon }}>{sport ? getLiveCount(sport.liveUsers) : 0} athletes active right now</span>
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
              <div style={{fontSize:64,marginBottom:12}}>🐣</div>
              <h2 style={{fontWeight:900,fontSize:22,color:T.textPrimary,marginBottom:8}}>Choose Your Animal Coach</h2>
              <p style={{fontSize:14,color:T.textSecondary,marginBottom:16,lineHeight:1.6}}>
                Pick an animal and name it. It starts as a <strong style={{color:T.neon}}>baby</strong> and grows older with your streak every day. 🐣 → 🐾 → 👑
              </p>
              <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:24}}>
                {["🐣","🌱","⚡","👑"].map((e,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:28}}>{e}</div>
                    <div style={{fontSize:9,color:T.textMuted,marginTop:2}}>{["Day 1","Day 7","Day 21","Day 60"][i]}</div>
                  </div>
                ))}
              </div>
              <PrimaryBtn onClick={() => setShowAvatarBuilder(true)}>Pick My Animal 🐾</PrimaryBtn>
            </div>
          ) : (
            <>
              <h1 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:4 }}>
                {avatarName ? `${avatarName} 🐾` : "Your Animal Coach"}
              </h1>
              <p style={{ fontSize:13, color:T.textSecondary, marginBottom:20 }}>
                Your animal grows every day you stay consistent. Currently a <strong style={{color:T.neon}}>{getAgeLabel(dayNum)}</strong>.
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `2px solid ${T.neon}50`, boxShadow: shadow.neon, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <AvatarDisplay avatar={avatarState} size={150} mood={avatarMood} dayNum={dayNum} name={avatarName}/>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: T.neon, textShadow: shadow.neon }}>Your Coach</div>
                    <div style={{ fontWeight:800, fontSize:14, color:T.neon, textShadow:shadow.neon }}>{avatarName}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{getAgeLabel(dayNum)} · {ANIMALS.find(a=>a.id===avatarState.animalId)?.name}</div>
                  </div>
                </div>
              </div>
              <NeonCard style={{ marginBottom: 16 }}>
                <div style={{fontWeight:800,fontSize:10,color:T.neon,marginBottom:8,letterSpacing:"1px"}}>{avatarName ? `${avatarName.toUpperCase()} SAYS` : "TODAY'S COACHING"}</div>
                <p style={{ fontSize: 14, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, fontFamily: "Georgia,serif", margin: 0 }}>{avatarQuote}</p>
              </NeonCard>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: T.textPrimary, marginBottom: 10 }}>Your trainer reacts to your progress</div>
                {(["excited", "happy", "neutral", "sad"] as const).map((mood, i) => {
                  const labels = [`All tasks done → ${avatarName||"Buddy"} is ecstatic! 🎉`, `>60% done → ${avatarName||"Buddy"} is proud of you`, `Making progress → ${avatarName||"Buddy"} believes in you`, `Streak lost → ${avatarName||"Buddy"} misses you 😢`];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <AvatarDisplay avatar={avatarState} size={48} mood={mood} dayNum={dayNum}/>
                      <div style={{ fontSize: 12, color: T.textSecondary }}>{labels[i]}</div>
                    </div>
                  );
                })}
              </Card>
              <button onClick={() => setShowAvatarBuilder(true)} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", color: T.neon, fontWeight: 700, fontSize: 13, border: `1.5px solid ${T.neon}60`, cursor: "pointer", boxShadow: shadow.neon }}>
                Rename or Change Animal
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
      plan, trialStartDate: today, avatar: null, avatarName: '', bodyProfile: null, posts: {},
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
