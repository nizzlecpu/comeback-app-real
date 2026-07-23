import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { Check, ChevronRight, Trophy, Users, Home, BookOpen, Dumbbell, RotateCcw, Heart, MessageCircle, Send } from "lucide-react";

// ============================================================================
// COMEBACK — FREE (Ad-Supported Edition)
// Single-tier free app. No paywalls, no plan picker. Ad-supported via banner
// + interstitial placements. Full protocol, supplements, diet guide, streaks,
// squad, and milestone badges — everything except personalised macros and the
// premium Badge Companion (those live in the Pro app).
// ============================================================================

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  bg:       "#0A0A0F",
  surface:  "#111118",
  card:     "#16161E",
  border:   "#2A2A3A",
  neon:     "#39FF14",
  neonL:    "#39FF1420",
  indigo:   "#6366F1",
  indigoL:  "#6366F120",
  teal:     "#10B981",
  tealL:    "#10B98115",
  red:      "#FF3B3B",
  orange:   "#FF6B00",
  textPrimary:   "#F0F0F8",
  textSecondary: "#8888AA",
  textMuted:     "#55556A",
  textDim:       "#33334A",
};
const shadow = {
  neon:   `0 0 20px #39FF1430, 0 0 40px #39FF1415`,
  card:   `0 4px 24px rgba(0,0,0,0.4)`,
  sm:     `0 2px 8px rgba(0,0,0,0.3)`,
};

// ── STORAGE ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "comeback_free_v1";

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
  posts: Record<string, Post[]>;
  lastInterstitialDate: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function loadState(): SavedState | null {
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

// ── FAKE AD INVENTORY ─────────────────────────────────────────────────────────
const AD_INVENTORY = [
  {emoji:"🧊",brand:"CryoFlex",headline:"Ice therapy that actually stays cold for 6 hours.",cta:"Shop Now",color:"#38BDF8"},
  {emoji:"💊",brand:"RecoverPro Omega-3",headline:"The supplement athletes stock up on before every season.",cta:"Learn More",color:"#22CC00"},
  {emoji:"🏋️",brand:"BandUp Resistance Kit",headline:"Rehab-grade resistance bands, 5 resistance levels.",cta:"Get 20% Off",color:"#F59E0B"},
  {emoji:"⌚",brand:"SleepTrack Ring",headline:"Track your recovery sleep down to the minute.",cta:"Try Free",color:"#A855F7"},
  {emoji:"🥤",brand:"HydrateIQ Electrolytes",headline:"Zero sugar. Built for daily rehab sessions.",cta:"Shop Now",color:"#EC4899"},
  {emoji:"🩹",brand:"FlexTape Kinesiology",headline:"The tape pros wear on the sideline.",cta:"Shop Now",color:"#FF6B00"},
];

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
      ]},
      {id:"b2",author:"DeShawn W.",msg:"134 days out. Dropped 40pts in first game back. Read this app every day. Your comeback is coming. Trust the science and trust God.",likes:201,likedByMe:false,timestamp:ago(6),replies:[
        {author:"Marcus T.",msg:"This just made my whole week. Thank you for this.",timestamp:ago(5)},
      ]},
    ],
    football:[
      {id:"f1",author:"Jake M.",msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol. Every task in this app matters — I did all of them.",likes:67,likedByMe:false,timestamp:ago(3),replies:[
        {author:"Kyle R.",msg:"How was your mental during recovery?",timestamp:ago(2)},
      ]},
    ],
    soccer:[
      {id:"s1",author:"Priya R.",msg:"Week 3 hamstring. Pool running is saving my cardio base. If you are injured and not pool running you are missing out.",likes:18,likedByMe:false,timestamp:ago(4),replies:[
        {author:"Ana S.",msg:"Pool running changed my whole recovery. 3 weeks of it. Worth every boring lap.",timestamp:ago(3)},
      ]},
    ],
  };
  return all[sportId] || [
    {id:"g1",author:"Recovery Community",msg:`Welcome to the ${sportId} recovery squad! Drop your injury and how many days in you are. Let us support each other.`,likes:0,likedByMe:false,timestamp:new Date().toISOString(),replies:[]},
  ];
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
function NavBtn({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", background: "none", border: "none", cursor: "pointer" }}>
      <div style={{ color: active ? T.neon : T.textMuted, filter: active ? `drop-shadow(0 0 6px ${T.neon})` : "none" }}>{icon}</div>
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? T.neon : T.textMuted, textShadow: active ? shadow.neon : "none" }}>{label}</span>
    </button>
  );
}

// ── AD COMPONENTS ─────────────────────────────────────────────────────────────
function AdBanner({ slot }: { slot: string }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * AD_INVENTORY.length));
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % AD_INVENTORY.length), 7000);
    return () => clearInterval(t);
  }, []);
  const ad = AD_INVENTORY[idx];
  return (
    <div style={{
      position: "relative", background: "#0D0D14", border: `1px dashed ${T.border}`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 16, display: "flex",
      alignItems: "center", gap: 12,
    }}>
      <span style={{
        position: "absolute", top: 6, right: 10, fontSize: 9, fontWeight: 700,
        color: T.textDim, letterSpacing: "0.5px", textTransform: "uppercase",
      }}>Advertisement · {slot}</span>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${ad.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ad.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: ad.color, marginBottom: 2 }}>{ad.brand}</div>
        <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.35 }}>{ad.headline}</div>
      </div>
      <button style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 9, background: ad.color, color: "#0A0A0F", fontWeight: 800, fontSize: 11, border: "none", cursor: "pointer" }}>{ad.cta}</button>
    </div>
  );
}
function InterstitialAd({ onClose }: { onClose: () => void }) {
  const [ad] = useState(() => AD_INVENTORY[Math.floor(Math.random() * AD_INVENTORY.length)]);
  const [secondsLeft, setSecondsLeft] = useState(5);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);
  const canClose = secondsLeft <= 0;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, background: T.surface, borderRadius: 20,
        border: `1px solid ${T.border}`, padding: 24, textAlign: "center", position: "relative",
      }}>
        <span style={{ position: "absolute", top: 14, left: 18, fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: "0.5px", textTransform: "uppercase" }}>Advertisement</span>
        <div style={{ fontSize: 64, marginTop: 20, marginBottom: 14 }}>{ad.emoji}</div>
        <div style={{ fontWeight: 900, fontSize: 18, color: ad.color, marginBottom: 8 }}>{ad.brand}</div>
        <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5, marginBottom: 20 }}>{ad.headline}</p>
        <button style={{ width: "100%", padding: "13px", borderRadius: 12, background: ad.color, color: "#0A0A0F", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 12 }}>{ad.cta}</button>
        <button
          onClick={() => canClose && onClose()}
          disabled={!canClose}
          style={{
            width: "100%", padding: "11px", borderRadius: 12, background: "transparent",
            color: canClose ? T.textSecondary : T.textDim, fontWeight: 700, fontSize: 12,
            border: `1.5px solid ${canClose ? T.border : T.textDim}`, cursor: canClose ? "pointer" : "not-allowed",
          }}>
          {canClose ? "Continue ✕" : `Skip in ${secondsLeft}s`}
        </button>
      </div>
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
            Science-backed recovery. Free forever, supported by ads.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {["🏆 Pro protocols", "📿 Daily faith", "🧪 Evidence-based", "📅 Real tracking"].map((f, i) => (
            <div key={i} style={{
              fontSize: 11, fontWeight: 700, color: T.neon, background: T.neonL,
              borderRadius: 12, padding: "6px 12px", border: `1px solid ${T.neon}30`,
            }}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 12 }}>100% free · Ad-supported · Progress saved automatically</p>
    </div>
  );
}
function SportSelect({ onNext }: { onNext: (s: typeof SPORTS[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={4} current={1} />
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
        <Logo size={22} /><StepBar total={4} current={2} />
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
        <Logo size={22} /><StepBar total={4} current={3} />
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
        <Logo size={22} /><StepBar total={4} current={4} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>What is your goal?</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Shapes your daily task emphasis.</p>
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

// ── APP DASHBOARD ─────────────────────────────────────────────────────────────
function AppDashboard({ saved, onReset }: { saved: SavedState; onReset: () => void }) {
  const [tab, setTab] = useState<"home" | "today" | "protocol" | "squad" | "rewards">("home");
  const getLiveCount = (base: number) => {
    const daySeed = parseInt(todayStr().replace(/-/g,"")) % 100;
    const sportSeed = saved.sportId.length * 7;
    const variance = Math.floor(((daySeed + sportSeed) % 40) - 20);
    return Math.max(12, base + variance);
  };
  const [posts, setPosts] = useState<Post[]>(() => saved.posts?.[saved.sportId] || seedPosts(saved.sportId));
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newPost, setNewPost] = useState("");
  const [suppChecked, setSuppChecked] = useState<boolean[]>(() => {
    const s = loadState(); return s?.suppChecked?.[todayStr()] ?? Array(SUPPLEMENTS.length).fill(false);
  });
  const [showInterstitial, setShowInterstitial] = useState(false);
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
      const justFinished = next.every(Boolean) && next.length > 0;
      if (justFinished) {
        const s2 = loadState();
        if (s2 && s2.lastInterstitialDate !== todayKey) {
          s2.lastInterstitialDate = todayKey; saveState(s2);
          setShowInterstitial(true);
        }
      }
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
  const renderTab = () => {
    switch (tab) {
      case "home": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Logo size={24} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <StreakFire streak={saved.streak} alive={saved.streakAlive} />
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{sport?.icon || "🏆"}</div>
            </div>
          </div>
          <AdBanner slot="home-top" />
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
          <Card style={{ background: "linear-gradient(135deg,#0D0D1A,#0A0A14)", border: `1px solid ${T.neon}30`, marginBottom: 16 }}>
            <TagPill color={T.neon} bg={T.neonL}>{dailyContent.type === "verse" ? "📿 Bible Verse" : "💡 Motivation"}</TagPill>
            <p style={{ fontSize: 13, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, marginTop: 8, fontFamily: "Georgia,serif" }}>{dailyContent.quote}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.neon, marginTop: 6 }}>— {dailyContent.text}</p>
          </Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary }}>Today's Focus</h2>
            <button onClick={() => setTab("today")} style={{ fontSize: 12, fontWeight: 700, color: T.neon, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {tasks.slice(0, 3).map((t, i) => <TaskCard key={i} task={t} checked={checked[i]} onToggle={() => toggleTask(i)} />)}
          </div>
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
            {([["🌅 Morning", morningTasks, 0], ["☀️ Afternoon", afternoonTasks, 3], ["🌙 Evening", eveningTasks, 7]] as [string, Task[], number][]).map(([label, list, offset]) => (
              <div key={label}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.textSecondary, marginBottom: 8, marginTop: 4 }}>{label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {list.map((t, i) => <TaskCard key={i} task={t} checked={checked[offset + i]} onToggle={() => toggleTask(offset + i)} />)}
                </div>
              </div>
            ))}
            <AdBanner slot="today-mid" />
            {allDone && (
              <Card style={{ background: T.neonL, border: `1.5px solid ${T.neon}`, marginTop: 10, textAlign: "center", padding: "20px 16px", boxShadow: shadow.neon }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: T.neon, marginBottom: 4, textShadow: shadow.neon }}>Day Complete!</div>
                <div style={{ fontSize: 13, color: T.textSecondary }}>Every task done. Your body is healing. See you tomorrow.</div>
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
          <AdBanner slot="protocol-mid" />
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
          <h2 style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary, marginBottom: 4 }}>🥗 Nutrition Guide</h2>
          <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>Science-backed anti-inflammatory eating for faster recovery.</p>
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
          <AdBanner slot="squad-top" />
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
          <AdBanner slot="rewards-mid" />
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
        <NavBtn icon={<Trophy size={20} />}  label="Rewards" active={tab === "rewards"} onClick={() => setTab("rewards")} />
      </div>
      {showInterstitial && <InterstitialAd onClose={() => setShowInterstitial(false)} />}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  type Screen = "welcome" | "sport" | "injury" | "severity" | "goal" | "dashboard";
  const [saved, setSaved] = useState<SavedState | null>(() => loadState());
  const [screen, setScreen] = useState<Screen>(() => loadState() ? "dashboard" : "welcome");
  const [sport,    setSport]    = useState<typeof SPORTS[0] | undefined>();
  const [injury,   setInjury]   = useState<typeof INJURIES[0] | undefined>();
  const [severity, setSeverity] = useState<typeof SEVERITIES[0] | undefined>();

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

  const finishOnboarding = (g: typeof GOALS_LIST[0]) => {
    if (!sport || !injury || !severity) return;
    const today = todayStr();
    const ns: SavedState = {
      sportId: sport.id, injuryId: injury.id, severityId: severity.id, goalId: g.id,
      startDate: today, lastActiveDate: today, streak: 1, streakAlive: true,
      completedTasks: {}, suppChecked: {}, posts: {}, lastInterstitialDate: "",
    };
    saveState(ns); setSaved(ns); setScreen("dashboard");
  };
  const handleReset = () => {
    clearState(); setSaved(null); setSport(undefined); setInjury(undefined); setSeverity(undefined); setScreen("welcome");
  };

  return (
    <div style={{ width: "100%", height: "100dvh", maxWidth: 430, margin: "0 auto", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Inter',sans-serif", background: T.bg }}>
      {screen === "welcome"  && <div style={{ flex: 1, overflowY: "auto" }}><Welcome onNext={() => setScreen("sport")} /></div>}
      {screen === "sport"    && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SportSelect    onNext={s  => { setSport(s);    setScreen("injury");   }} /></div>}
      {screen === "injury"   && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><InjurySelect   onNext={i  => { setInjury(i);   setScreen("severity"); }} /></div>}
      {screen === "severity" && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SeveritySelect onNext={sv => { setSeverity(sv); setScreen("goal");     }} /></div>}
      {screen === "goal"     && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><GoalSelect     onNext={g  => finishOnboarding(g)} /></div>}
      {screen === "dashboard" && saved && <AppDashboard saved={saved} onReset={handleReset} />}
    </div>
  );
}
