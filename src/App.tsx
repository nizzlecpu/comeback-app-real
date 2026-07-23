import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { Check, ChevronRight, Trophy, Users, Home, BookOpen, Dumbbell, RotateCcw, Heart, MessageCircle, Send, ArrowLeft, Lock, Crown } from "lucide-react";

// ============================================================================
// COMEBACK — PRO/ELITE (Paid Edition)
// Single standalone paid app, gated by a real Stripe checkout + cryptographic
// license-key verification (see license-tools/ for the issuing CLI). Two
// tiers: Pro ($9.99/mo) unlocks the full protocol, macros, supplements and
// squad with zero ads. Elite ($28.99/mo) adds the Nike/Swoosh-style animated
// Trading Card — an athlete-silhouette stats card that levels up Rookie →
// Silver → Gold → Platinum → Legend as the user's streak builds. The license
// signature is re-verified on every load, so flipping a `plan` flag in
// localStorage or devtools cannot unlock anything it wasn't legitimately
// issued for.
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
const STORAGE_KEY = "comeback_pro_v1";

interface BodyProfile {
  height: string;
  weight: string;
  gender: string;
  goal: string;
}
interface CardProfile {
  accentColor: string;
  nickname: string;
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
  bodyProfile: BodyProfile | null;
  card: CardProfile | null;
  posts: Record<string, Post[]>;
  plan: "pro" | "elite";
  licenseCode: string;
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

// ── LICENSING (Stripe checkout + ECDSA license-key verification) ──────────────
// See license-tools/README.md for the full write-up. Short version: Stripe
// Payment Links collect the money but never talk to this app directly (no
// backend). After a sale, the seller runs license-tools/issue-license.mjs,
// which signs {plan, iat, id} with a private key only the seller holds. This
// app can only VERIFY that signature with the public half embedded below —
// it has no way to forge a code. Every load re-verifies the stored code, so
// editing localStorage or flipping `plan` in devtools cannot unlock a tier
// the user was never issued a valid signature for.
const PLAN_PRO_URL = "https://buy.stripe.com/5kQ3cu5P36NtcWh1ZC67S00";
const PLAN_ELITE_URL = "https://buy.stripe.com/dRm9AS91ffjZbSd1ZC67S01";
const PUBLIC_KEY_JWK: JsonWebKey = {
  key_ops: ["verify"], ext: true, kty: "EC",
  x: "rxweEwBKStDtmPACeGZTeem3DosMdCrPzxvEBP-W3yQ",
  y: "NqzZGAzX23lYoIijwn3xzMqOYfruDy_wTveb-3eF8u8",
  crv: "P-256",
} as JsonWebKey;
const PRO_FEATURES = [
  "Full personalised recovery protocol — every phase, every sport",
  "Daily task tracking with streaks and milestones",
  "Personalised nutrition macros and supplement schedule",
  "Sport squad community — post, reply, connect",
  "Zero ads, ever",
];
const ELITE_FEATURES = [
  "Everything in Pro, plus:",
  "Nike/Swoosh-style animated Trading Card — your athlete silhouette, sport icon and streak number on a premium holographic card",
  "5 collectible card tiers: Rookie → Silver → Gold → Platinum → Legend",
  "Priority support",
];
function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
type LicenseResult =
  | { valid: true; plan: "pro" | "elite"; issuedAt: number; id: string }
  | { valid: false; reason: string };
async function verifyLicenseCode(code: string): Promise<LicenseResult> {
  if (typeof code !== "string" || !code.startsWith("CBK1.")) return { valid: false, reason: "bad-format" };
  const parts = code.trim().split(".");
  if (parts.length !== 3) return { valid: false, reason: "bad-format" };
  const [, payloadPart, sigPart] = parts;
  let payload: any;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadPart)));
  } catch {
    return { valid: false, reason: "bad-payload" };
  }
  if (payload.plan !== "pro" && payload.plan !== "elite") return { valid: false, reason: "bad-plan" };
  try {
    const subtle: SubtleCrypto = (globalThis as any).crypto.subtle;
    const publicKey = await subtle.importKey("jwk", PUBLIC_KEY_JWK, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const ok = await subtle.verify(
      { name: "ECDSA", hash: "SHA-256" } as EcdsaParams,
      publicKey,
      base64urlToBytes(sigPart),
      base64urlToBytes(payloadPart)
    );
    if (!ok) return { valid: false, reason: "bad-signature" };
    return { valid: true, plan: payload.plan, issuedAt: payload.iat, id: payload.id };
  } catch {
    return { valid: false, reason: "verify-error" };
  }
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
function calcMacros(height:string, weight:string, gender:string, goal:string) {
  const h = parseFloat(height); const w = parseFloat(weight);
  if (!h || !w) return null;
  const bmr = gender === "female" ? (10*w)+(6.25*h)-(5*25)-161 : (10*w)+(6.25*h)-(5*25)+5;
  const tdee = bmr * 1.375;
  let calories = tdee; let proteinG = w*2.0;
  let fatG = (calories*0.25)/9;
  let carbG = (calories-(proteinG*4)-(fatG*9))/4;
  if (goal === "fast") { calories = tdee+100; proteinG = w*2.2; }
  if (goal === "fitness") { proteinG = w*1.8; }
  if (goal === "pain") { calories = tdee-100; proteinG = w*1.6; fatG = (calories*0.30)/9; carbG = (calories-(proteinG*4)-(fatG*9))/4; }
  return { calories: Math.round(calories), protein: Math.round(proteinG), carbs: Math.round(Math.max(carbG,50)), fat: Math.round(fatG) };
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
          Sports Recovery Pro
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
function GlobalCardStyles() {
  return (
    <style>{`
      @keyframes cardGlowPulse { 0%,100% { opacity:0.16; transform:scale(1); } 50% { opacity:0.32; transform:scale(1.08); } }
      @keyframes holoSweep { 0% { transform:translateX(-130%) rotate(18deg); } 100% { transform:translateX(130%) rotate(18deg); } }
      @keyframes cardSparkle { 0% { opacity:0; transform:translateY(0) scale(0.5); } 40% { opacity:1; transform:translateY(-8px) scale(1); } 100% { opacity:0; transform:translateY(-16px) scale(0.5); } }
    `}</style>
  );
}

// ── TRADING CARD DATA (Elite-exclusive) ────────────────────────────────────────
// Tiers: rookie(day1-6) -> silver(7-20) -> gold(21-59) -> platinum(60-89) -> legend(90+)
const CARD_TIERS = [
  { id:"rookie",   label:"Rookie",   min:1,  primary:"#D5D8E3", secondary:"#8E93A6", glow:"#AEB3C4" },
  { id:"silver",   label:"Silver",   min:7,  primary:"#EDEFF5", secondary:"#9AA0B4", glow:"#D6DAE6" },
  { id:"gold",     label:"Gold",     min:21, primary:"#FFDE7A", secondary:"#B8860B", glow:"#FFD700" },
  { id:"platinum", label:"Platinum", min:60, primary:"#EAF6FF", secondary:"#38BDF8", glow:"#9FE6FF" },
  { id:"legend",   label:"Legend",   min:90, primary:"#1A1A22", secondary:"#FFD700", glow:"#39FF14" },
];
function getCardTier(dayNum: number) {
  let t = CARD_TIERS[0];
  for (const c of CARD_TIERS) { if (dayNum >= c.min) t = c; }
  return t;
}
function getNextCardTier(dayNum: number) {
  const cur = getCardTier(dayNum);
  const idx = CARD_TIERS.indexOf(cur);
  return idx < CARD_TIERS.length - 1 ? CARD_TIERS[idx + 1] : null;
}
const CARD_ACCENT_COLORS = ["#39FF14","#FF3B3B","#6366F1","#F59E0B","#EC4899","#38BDF8","#A855F7","#10B981"];
const CARD_QUOTES: Record<string,string[]> = {
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

// ── STATS CARD — Nike/Swoosh Trading Card (SVG + CSS, Elite-exclusive) ────────
function StatsCard({ dayNum, streak, mood = "happy", size = 150, accentColor = T.neon, sportIcon = "🏆" }: {
  dayNum: number; streak: number; mood?: "happy"|"excited"|"neutral"|"sad"; size?: number; accentColor?: string; sportIcon?: string;
}) {
  const tier = getCardTier(dayNum);
  const w = size;
  const h = Math.round(size * 1.42);
  const isSad = mood === "sad";
  const isExcited = mood === "excited";
  const dark = tier.id === "legend";
  const silhouette = dark ? "#000000" : "#171722";
  return (
    <div style={{
      width: w, height: h, borderRadius: w * 0.09, position: "relative", overflow: "hidden",
      background: `linear-gradient(155deg, ${tier.primary} 0%, ${tier.secondary} 55%, ${tier.primary} 100%)`,
      border: `${Math.max(2, w * 0.016)}px solid ${tier.secondary}`,
      boxShadow: `0 0 ${w*0.18}px ${tier.glow}55, 0 8px 20px rgba(0,0,0,0.5)`,
      filter: isSad ? "grayscale(0.6) brightness(0.78)" : "none",
    }}>
      {/* diagonal swoosh accent band */}
      <div style={{
        position: "absolute", left: "-20%", top: "38%", width: "140%", height: w * 0.22,
        background: accentColor, opacity: 0.9, transform: "rotate(-10deg)",
        boxShadow: `0 0 ${w*0.1}px ${accentColor}90`,
      }} />
      <div style={{
        position: "absolute", left: "-20%", top: "38%", width: "140%", height: w * 0.22,
        transform: "rotate(-10deg)", overflow: "hidden",
      }}>
        {/* holographic sweep */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
          background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)",
          animation: `holoSweep ${isExcited ? "1.6s" : "3.2s"} linear infinite`,
        }} />
      </div>
      {/* rank pill */}
      <div style={{
        position: "absolute", top: w * 0.06, right: w * 0.06, fontSize: Math.max(8, w * 0.07),
        fontWeight: 900, letterSpacing: "1px", color: dark ? tier.secondary : "#1A1A22",
        background: "rgba(255,255,255,0.35)", borderRadius: 20, padding: "3px 8px", textTransform: "uppercase",
      }}>{tier.label}</div>
      {/* sport icon badge */}
      <div style={{
        position: "absolute", top: w * 0.06, left: w * 0.06, width: w * 0.16, height: w * 0.16,
        borderRadius: "50%", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: w * 0.09,
      }}>{sportIcon}</div>
      {isExcited && (
        <div style={{
          position: "absolute", top: w * 0.02, left: -w * 0.32, width: w * 0.85, textAlign: "center",
          transform: "rotate(-45deg)", background: T.neon, color: T.bg, fontWeight: 900,
          fontSize: Math.max(7, w * 0.055), letterSpacing: "0.5px", padding: "3px 0", boxShadow: shadow.neon,
        }}>PERFECT DAY</div>
      )}
      {/* athlete silhouette (geometric primitives) */}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${w*0.5},${h*0.28})`} fill={silhouette} opacity={0.92}>
          <circle cx={0} cy={0} r={w*0.09} />
          <path d={`M ${-w*0.16},${h*0.08} Q 0,${-h*0.02} ${w*0.16},${h*0.08} L ${w*0.13},${h*0.30} Q 0,${h*0.34} ${-w*0.13},${h*0.30} Z`} />
          <rect x={-w*0.30} y={h*0.06} width={w*0.10} height={h*0.20} rx={w*0.04} transform={`rotate(18 ${-w*0.25} ${h*0.10})`} />
          <rect x={w*0.20} y={h*0.06} width={w*0.10} height={h*0.20} rx={w*0.04} transform={`rotate(-18 ${w*0.25} ${h*0.10})`} />
          <rect x={-w*0.13} y={h*0.32} width={w*0.11} height={h*0.24} rx={w*0.045} />
          <rect x={w*0.02} y={h*0.32} width={w*0.11} height={h*0.24} rx={w*0.045} />
        </g>
      </svg>
      {/* hero streak stat */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: h * 0.56, textAlign: "center",
      }}>
        <div style={{
          fontWeight: 900, fontSize: w * 0.42, lineHeight: 1, color: accentColor,
          textShadow: `0 0 ${w*0.08}px ${accentColor}90, 0 2px 4px rgba(0,0,0,0.5)`,
        }}>{streak}</div>
        <div style={{ fontSize: Math.max(8, w*0.06), fontWeight: 800, letterSpacing: "2px", color: dark ? "#EDEDF5" : "#2A2A38", textTransform: "uppercase", marginTop: 2 }}>Day Streak</div>
      </div>
      {/* bottom nameplate bar */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)",
        padding: `${h*0.02}px ${w*0.08}px`, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: Math.max(8, w*0.062), fontWeight: 800, color: "#F0F0F8", letterSpacing: "0.5px" }}>DAY {dayNum}</span>
        <span style={{ fontSize: Math.max(8, w*0.062), fontWeight: 800, color: accentColor, letterSpacing: "0.5px" }}>COMEBACK</span>
      </div>
    </div>
  );
}

// ── BODY PROFILE (MACROS) ─────────────────────────────────────────────────────
function BodyProfileForm({ onSave }: { onSave: (p: BodyProfile) => void }) {
  const [form, setForm] = useState<BodyProfile>({ height: "", weight: "", gender: "male", goal: "return" });
  const canSave = form.height && form.weight;
  return (
    <div style={{ padding: "20px", background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, marginBottom: 16 }}>
      <h3 style={{ fontWeight: 900, fontSize: 16, color: T.textPrimary, marginBottom: 4 }}>Your Body Profile</h3>
      <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 16 }}>We calculate exact daily macro targets for your recovery.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {([["HEIGHT (cm)", "height", "175"], ["WEIGHT (kg)", "weight", "75"]] as [string,string,string][]).map(([label, key, ph]) => (
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
            Science-backed recovery. Personalised nutrition. Choose Pro or go Elite for your own animated Trading Card.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {["🏆 Pro protocols", "📿 Daily faith", "🧪 Personalised macros", "💳 Elite Trading Card", "📅 Real tracking"].map((f, i) => (
            <div key={i} style={{
              fontSize: 11, fontWeight: 700, color: T.neon, background: T.neonL,
              borderRadius: 12, padding: "6px 12px", border: `1px solid ${T.neon}30`,
            }}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 12 }}>Pro $9.99/mo · Elite $28.99/mo · No ads either way</p>
    </div>
  );
}
function SportSelect({ onNext }: { onNext: (s: typeof SPORTS[0]) => void }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <Logo size={22} /><StepBar total={6} current={1} />
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
        <Logo size={22} /><StepBar total={6} current={2} />
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
        <Logo size={22} /><StepBar total={6} current={3} />
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
        <Logo size={22} /><StepBar total={6} current={4} />
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

// ── PAYWALL (Stripe checkout + license redemption) ────────────────────────────
function Paywall({ onUnlock, onBack }: { onUnlock: (plan: "pro" | "elite", code: string) => void; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setChecking(true); setError(null);
    const result = await verifyLicenseCode(code.trim());
    setChecking(false);
    if (!result.valid) {
      setError(
        result.reason === "bad-format" ? "That doesn't look like a Comeback license code."
        : result.reason === "bad-signature" ? "That code isn't valid — double-check for typos."
        : "That code isn't valid."
      );
      return;
    }
    onUnlock(result.plan, code.trim());
  };

  return (
    <div style={{ minHeight: "100%", background: T.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSecondary, padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
          <Logo size={22} />
        </div>
        <StepBar total={6} current={5} />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: T.textPrimary, marginBottom: 4 }}>Choose your plan</h2>
        <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 12 }}>Secure checkout via Stripe. Cancel anytime.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        <div style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 18, padding: "18px 16px", marginBottom: 14, boxShadow: shadow.sm }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary }}>Pro</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: T.neon }}>$9.99<span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>/mo</span></span>
          </div>
          <ul style={{ margin: "10px 0 14px", padding: 0, listStyle: "none" }}>
            {PRO_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: T.textSecondary, marginBottom: 6, lineHeight: 1.4 }}>
                <Check size={13} color={T.neon} style={{ flexShrink: 0, marginTop: 2 }} /> <span>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => window.open(PLAN_PRO_URL, "_blank")}
            style={{ width: "100%", padding: "13px", borderRadius: 12, background: T.textPrimary, color: T.bg, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>
            Get Pro →
          </button>
        </div>
        <div style={{ background: "linear-gradient(160deg,#16161E,#1B1420)", border: `1.5px solid ${T.neon}60`, borderRadius: 18, padding: "18px 16px", marginBottom: 20, boxShadow: shadow.neon }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: 17, color: T.textPrimary }}>
              <Crown size={16} color="#FFD700" /> Elite
            </span>
            <span style={{ fontWeight: 900, fontSize: 20, color: T.neon }}>$28.99<span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>/mo</span></span>
          </div>
          <ul style={{ margin: "10px 0 14px", padding: 0, listStyle: "none" }}>
            {ELITE_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: i === 0 ? T.textMuted : T.textSecondary, fontWeight: i === 0 ? 700 : 400, marginBottom: 6, lineHeight: 1.4 }}>
                {i !== 0 && <Check size={13} color={T.neon} style={{ flexShrink: 0, marginTop: 2 }} />} <span>{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => window.open(PLAN_ELITE_URL, "_blank")}
            style={{ width: "100%", padding: "13px", borderRadius: 12, background: T.neon, color: T.bg, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>
            Get Elite →
          </button>
        </div>
        <div style={{ background: T.surface, borderRadius: 16, padding: 16, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Lock size={13} color={T.textMuted} />
            <span style={{ fontWeight: 800, fontSize: 12, color: T.textPrimary }}>Already purchased?</span>
          </div>
          <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, lineHeight: 1.5 }}>Enter the license key you received after checkout to unlock the app on this device.</p>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="CBK1.xxxxx.yyyyy"
            style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${error ? T.red : T.border}`, background: T.card, color: T.textPrimary, fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          {error && <div style={{ fontSize: 11, color: T.red, marginBottom: 8 }}>{error}</div>}
          <button onClick={handleRedeem} disabled={checking || !code.trim()}
            style={{ width: "100%", padding: "11px", borderRadius: 10, background: code.trim() ? T.indigo : T.border, color: code.trim() ? "white" : T.textMuted, fontWeight: 700, fontSize: 12, border: "none", cursor: code.trim() ? "pointer" : "not-allowed" }}>
            {checking ? "Verifying…" : "Unlock with license key"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD SETUP (Elite-only: pick accent color + nickname for the Trading Card) ─
function CardSetup({ onSave, onBack }: { onSave: (c: CardProfile) => void; onBack: () => void }) {
  const [accentColor, setAccentColor] = useState(CARD_ACCENT_COLORS[0]);
  const [nickname, setNickname] = useState("");
  const [previewMood, setPreviewMood] = useState<"happy"|"excited"|"neutral">("happy");
  useEffect(() => {
    const moods: ("happy"|"excited"|"neutral")[] = ["happy","excited","neutral"];
    let i = 0;
    const t = setInterval(() => { i=(i+1)%moods.length; setPreviewMood(moods[i]); }, 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight:"100%", background:T.bg, display:"flex", flexDirection:"column" }}>
      <GlobalCardStyles />
      <div style={{ padding:"20px 20px 0", position:"sticky", top:0, background:T.bg, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:T.textSecondary, padding:4 }}>
            <ArrowLeft size={20}/>
          </button>
          <Logo size={22}/>
        </div>
        <StepBar total={6} current={6} />
        <h2 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:4 }}>Set Up Your Trading Card</h2>
        <p style={{ fontSize:13, color:T.textSecondary, marginBottom:12 }}>
          Starts as a <strong style={{color:T.neon}}>Rookie</strong> card on day 1 and levels up to Silver, Gold, Platinum, then Legend as your streak builds. 💳
        </p>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 32px" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ background:T.surface, borderRadius:24, padding:"20px 24px", border:`2px solid ${T.neon}50`, boxShadow:shadow.neon, display:"inline-flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <StatsCard dayNum={1} streak={1} mood={previewMood} size={140} accentColor={accentColor} />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:15, color:T.neon, textShadow:shadow.neon }}>
                {nickname || "Name your card"} · Rookie
              </div>
              <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>Grows with your streak every day</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Name Your Card</div>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value.slice(0,16))}
            placeholder="e.g. The Comeback, Ironheart..."
            maxLength={16}
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${nickname?T.neon:T.border}`, background:T.card, color:T.textPrimary, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", boxShadow:nickname?shadow.neon:"none" }}
          />
          <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{nickname.length}/16 characters</div>
        </div>
        <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:8, letterSpacing:"1px", textTransform:"uppercase" }}>Accent Color</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
          {CARD_ACCENT_COLORS.map(c => (
            <button key={c} onClick={() => setAccentColor(c)}
              style={{ width:42, height:42, borderRadius:21, background:c, cursor:"pointer", border:`3px solid ${accentColor===c?"white":"transparent"}`, boxShadow:accentColor===c?`0 0 14px ${c}`:undefined }}/>
          ))}
        </div>
        <div style={{ background:T.surface, borderRadius:16, padding:16, border:`1px solid ${T.border}`, marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:12, color:T.neon, marginBottom:12, letterSpacing:"0.5px" }}>GROWTH TIERS</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            {CARD_TIERS.map(tier => (
              <div key={tier.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <StatsCard dayNum={tier.min} streak={tier.min} mood="happy" size={46} accentColor={accentColor} />
                <div style={{ fontSize:9, color:T.textMuted, fontWeight:700, textAlign:"center" }}>Day {tier.min}<br/>{tier.label}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => onSave({ accentColor, nickname: nickname || "Comeback Card" })}
          style={{ width:"100%", padding:"15px", borderRadius:14, background:T.neon, color:T.bg, fontWeight:900, fontSize:16, border:"none", cursor:"pointer", boxShadow:shadow.neon }}>
          {nickname ? `Save ${nickname} ✨` : "Save My Card ✨"}
        </button>
      </div>
    </div>
  );
}

// ── ELITE UPGRADE (inline, in-dashboard path for Pro users) ───────────────────
function EliteUpgradeInline({ onUpgrade }: { onUpgrade: (code: string, card: CardProfile) => void }) {
  const [step, setStep] = useState<"pitch" | "setup">("pitch");
  const [code, setCode] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState(CARD_ACCENT_COLORS[0]);
  const [nickname, setNickname] = useState("");

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setChecking(true); setError(null);
    const result = await verifyLicenseCode(code.trim());
    setChecking(false);
    if (!result.valid) {
      setError(result.reason === "bad-format" ? "That doesn't look like a Comeback license code." : "That code isn't valid.");
      return;
    }
    if (result.plan !== "elite") {
      setError("That's a Pro code — you already have Pro. You need an Elite code to unlock the Trading Card.");
      return;
    }
    setVerifiedCode(code.trim());
    setStep("setup");
  };

  if (step === "setup") {
    return (
      <div style={{ padding: "8px 0" }}>
        <GlobalCardStyles />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <StatsCard dayNum={1} streak={1} mood="excited" size={130} accentColor={accentColor} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Name Your Card</div>
        <input value={nickname} onChange={e => setNickname(e.target.value.slice(0, 16))} placeholder="e.g. The Comeback"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${nickname ? T.neon : T.border}`, background: T.card, color: T.textPrimary, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <div style={{ fontWeight: 800, fontSize: 12, color: T.neon, marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Accent Color</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {CARD_ACCENT_COLORS.map(c => (
            <button key={c} onClick={() => setAccentColor(c)}
              style={{ width: 38, height: 38, borderRadius: 19, background: c, cursor: "pointer", border: `3px solid ${accentColor === c ? "white" : "transparent"}`, boxShadow: accentColor === c ? `0 0 14px ${c}` : undefined }} />
          ))}
        </div>
        <button onClick={() => onUpgrade(verifiedCode, { accentColor, nickname: nickname || "Comeback Card" })}
          style={{ width: "100%", padding: "15px", borderRadius: 14, background: T.neon, color: T.bg, fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", boxShadow: shadow.neon }}>
          Activate My Trading Card ✨
        </button>
      </div>
    );
  }
  return (
    <div style={{ textAlign: "center", padding: "24px 4px" }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>💳</div>
      <h2 style={{ fontWeight: 900, fontSize: 20, color: T.textPrimary, marginBottom: 8 }}>Go Elite to unlock the Trading Card</h2>
      <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16, lineHeight: 1.6 }}>
        A Nike/Swoosh-style animated stats card — your athlete silhouette, sport icon, and big bold streak number, with 5 collectible tiers.
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, opacity: 0.55, filter: "grayscale(0.3)" }}>
        <StatsCard dayNum={21} streak={21} mood="happy" size={110} />
      </div>
      <button onClick={() => window.open(PLAN_ELITE_URL, "_blank")}
        style={{ width: "100%", padding: "14px", borderRadius: 12, background: T.neon, color: T.bg, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: shadow.neon, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Crown size={16} /> Upgrade to Elite — $28.99/mo
      </button>
      <div style={{ background: T.surface, borderRadius: 14, padding: 14, border: `1px solid ${T.border}`, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Already upgraded? Enter your Elite license key</div>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="CBK1.xxxxx.yyyyy"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${error ? T.red : T.border}`, background: T.card, color: T.textPrimary, fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
        {error && <div style={{ fontSize: 11, color: T.red, marginBottom: 8 }}>{error}</div>}
        <button onClick={handleRedeem} disabled={checking || !code.trim()}
          style={{ width: "100%", padding: "10px", borderRadius: 10, background: code.trim() ? T.indigo : T.border, color: code.trim() ? "white" : T.textMuted, fontWeight: 700, fontSize: 12, border: "none", cursor: code.trim() ? "pointer" : "not-allowed" }}>
          {checking ? "Verifying…" : "Redeem code"}
        </button>
      </div>
    </div>
  );
}

// ── APP DASHBOARD ─────────────────────────────────────────────────────────────
function AppDashboard({ saved, onReset, onUpgrade }: { saved: SavedState; onReset: () => void; onUpgrade: (code: string, card: CardProfile) => void }) {
  const [tab, setTab] = useState<"home" | "today" | "protocol" | "squad" | "card">("home");
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
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(saved.bodyProfile);
  const [suppChecked, setSuppChecked] = useState<boolean[]>(() => {
    const s = loadState(); return s?.suppChecked?.[todayStr()] ?? Array(SUPPLEMENTS.length).fill(false);
  });
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
  const cardMood: "happy" | "sad" | "excited" | "neutral" =
    allDone ? "excited" : doneCount >= tasks.length * 0.6 ? "happy" : !saved.streakAlive ? "sad" : "neutral";
  const cardQuote = allDone
    ? CARD_QUOTES.goal[dayNum % CARD_QUOTES.goal.length]
    : !saved.streakAlive
    ? CARD_QUOTES.miss[dayNum % CARD_QUOTES.miss.length]
    : doneCount === 0
    ? CARD_QUOTES.morning[dayNum % CARD_QUOTES.morning.length]
    : CARD_QUOTES.streak[dayNum % CARD_QUOTES.streak.length];
  const macros = bodyProfile ? calcMacros(bodyProfile.height, bodyProfile.weight, bodyProfile.gender, saved.goalId) : null;
  const tier = getCardTier(dayNum);
  const nextTier = getNextCardTier(dayNum);
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
          {saved.plan === "elite" && saved.card && (
            <NeonCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <StatsCard dayNum={dayNum} streak={saved.streak} mood={cardMood} size={72} accentColor={saved.card.accentColor} sportIcon={sport?.icon || "🏆"} />
                <div style={{ flex: 1 }}>
                  <div style={{fontWeight:800,fontSize:10,color:T.neon,marginBottom:4,letterSpacing:"1px"}}>{saved.card.nickname.toUpperCase()} SAYS</div>
                  <p style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>{cardQuote}</p>
                </div>
              </div>
            </NeonCard>
          )}
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
            {allDone && (
              <Card style={{ background: T.neonL, border: `1.5px solid ${T.neon}`, marginTop: 10, textAlign: "center", padding: "20px 16px", boxShadow: shadow.neon }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: T.neon, marginBottom: 4, textShadow: shadow.neon }}>Day Complete!</div>
                <div style={{ fontSize: 13, color: T.textSecondary }}>Every task done. Your body is healing. See you tomorrow.</div>
                {saved.plan === "elite" && saved.card && <div style={{ marginTop:12,display:"flex",justifyContent:"center" }}><StatsCard dayNum={dayNum} streak={saved.streak} mood="excited" size={80} accentColor={saved.card.accentColor} sportIcon={sport?.icon || "🏆"} /></div>}
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
          {!bodyProfile ? (
            <BodyProfileForm onSave={p => { setBodyProfile(p); const s = loadState(); if (s) { s.bodyProfile = p; saveState(s); } }} />
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
              <button onClick={() => setBodyProfile(null)} style={{ marginTop: 8, fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Update my measurements</button>
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
      case "card": return (
        <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: "20px 18px 100px" }}>
          {saved.plan !== "elite" ? (
            <EliteUpgradeInline onUpgrade={onUpgrade} />
          ) : !saved.card ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{fontSize:64,marginBottom:12}}>💳</div>
              <h2 style={{fontWeight:900,fontSize:22,color:T.textPrimary,marginBottom:8}}>Your Trading Card</h2>
              <p style={{fontSize:14,color:T.textSecondary,marginBottom:16,lineHeight:1.6}}>Finish setup from onboarding to unlock your Trading Card.</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontWeight:900, fontSize:22, color:T.textPrimary, marginBottom:4 }}>{saved.card.nickname} 💳</h1>
              <p style={{ fontSize:13, color:T.textSecondary, marginBottom:20 }}>
                Your card levels up every day you stay consistent. Currently <strong style={{color:T.neon}}>{tier.label}</strong>{nextTier ? ` · ${nextTier.min - dayNum > 0 ? nextTier.min - dayNum : 0} days to ${nextTier.label}` : " · Max tier reached"}.
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ background: T.surface, borderRadius: 24, padding: 24, border: `2px solid ${T.neon}50`, boxShadow: shadow.neon, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <StatsCard dayNum={dayNum} streak={saved.streak} mood={cardMood} size={170} accentColor={saved.card.accentColor} sportIcon={sport?.icon || "🏆"} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight:800, fontSize:14, color:T.neon, textShadow:shadow.neon }}>{saved.card.nickname}</div>
                    <div style={{ fontSize:11, color:T.textMuted }}>{tier.label} Card · Day {dayNum}</div>
                  </div>
                </div>
              </div>
              <NeonCard style={{ marginBottom: 16 }}>
                <div style={{fontWeight:800,fontSize:10,color:T.neon,marginBottom:8,letterSpacing:"1px"}}>{saved.card.nickname.toUpperCase()} SAYS</div>
                <p style={{ fontSize: 14, fontStyle: "italic", color: T.textPrimary, lineHeight: 1.65, fontFamily: "Georgia,serif", margin: 0 }}>{cardQuote}</p>
              </NeonCard>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: T.textPrimary, marginBottom: 10 }}>Growth tiers</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {CARD_TIERS.map(t => (
                    <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: dayNum >= t.min ? 1 : 0.4 }}>
                      <StatsCard dayNum={t.min} streak={t.min} mood="happy" size={44} accentColor={saved.card!.accentColor} sportIcon={sport?.icon || "🏆"} />
                      <div style={{ fontSize: 9, color: dayNum >= t.min ? T.neon : T.textMuted, fontWeight: 700 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <div style={{ fontWeight: 900, fontSize: 17, color: T.textPrimary, marginBottom: 4, marginTop: 8 }}>Milestones</div>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>Stay consistent. Unlock badges as you progress.</p>
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
            </>
          )}
        </div>
      );
      default: return null;
    }
  };
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <GlobalCardStyles />
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>{renderTab()}</div>
      <div style={{ flexShrink: 0, background: T.surface, borderTop: `1px solid ${T.border}`, paddingBottom: "env(safe-area-inset-bottom,12px)", paddingTop: 10, paddingLeft: 4, paddingRight: 4, display: "flex", justifyContent: "space-around", alignItems: "flex-end", zIndex: 50 }}>
        <NavBtn icon={<Home size={20} />}     label="Home"     active={tab === "home"}     onClick={() => setTab("home")} />
        <NavBtn icon={<BookOpen size={20} />} label="Protocol" active={tab === "protocol"} onClick={() => setTab("protocol")} />
        <button onClick={() => setTab("today")} style={{ width: 56, height: 56, borderRadius: 28, background: tab === "today" ? T.neon : T.card, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${tab === "today" ? T.neon : T.border}`, boxShadow: tab === "today" ? shadow.neon : shadow.sm, cursor: "pointer", marginBottom: 4, flexShrink: 0 }}>
          <Dumbbell size={22} color={tab === "today" ? T.bg : T.textSecondary} />
        </button>
        <NavBtn icon={<Users size={20} />}   label="Squad"   active={tab === "squad"}   onClick={() => setTab("squad")} />
        <NavBtn icon={<Trophy size={20} />}  label="Card"    active={tab === "card"}    onClick={() => setTab("card")} />
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  type Screen = "welcome" | "sport" | "injury" | "severity" | "goal" | "paywall" | "card" | "dashboard" | "verifying";
  const [saved, setSaved] = useState<SavedState | null>(null);
  const [screen, setScreen] = useState<Screen>("verifying");
  const [sport,    setSport]    = useState<typeof SPORTS[0] | undefined>();
  const [injury,   setInjury]   = useState<typeof INJURIES[0] | undefined>();
  const [severity, setSeverity] = useState<typeof SEVERITIES[0] | undefined>();
  const [goal,     setGoal]     = useState<typeof GOALS_LIST[0] | undefined>();
  const [pendingPlan,    setPendingPlan]    = useState<"pro" | "elite" | undefined>();
  const [pendingLicense, setPendingLicense] = useState<string | undefined>();

  // Re-verify the stored license signature on every load. This is the crux of
  // the anti-scam protection: a user can freely edit localStorage to set
  // plan:"elite", but without a genuine signature from the private key
  // (which never ships with the app) verifyLicenseCode() will reject it and
  // we drop them back to the paywall instead of trusting the stored flag.
  useEffect(() => {
    (async () => {
      const s = loadState();
      if (!s) { setScreen("welcome"); return; }
      const result = await verifyLicenseCode(s.licenseCode);
      if (!result.valid || result.plan !== s.plan) {
        clearState(); setSaved(null); setScreen("welcome");
        return;
      }
      const today = todayStr();
      let updated = s;
      if (s.lastActiveDate !== today) {
        const diff = daysBetween(s.lastActiveDate, today);
        let streak = s.streak; let alive = s.streakAlive;
        if (diff === 1) { streak = s.streak + 1; alive = true; }
        else if (diff > 1) { streak = 0; alive = false; }
        updated = { ...s, lastActiveDate: today, streak, streakAlive: alive };
        saveState(updated);
      }
      setSaved(updated); setScreen("dashboard");
    })();
  }, []);

  const finalizeSetup = (plan: "pro" | "elite", code: string, card: CardProfile | null) => {
    if (!sport || !injury || !severity || !goal) return;
    const today = todayStr();
    const ns: SavedState = {
      sportId: sport.id, injuryId: injury.id, severityId: severity.id, goalId: goal.id,
      startDate: today, lastActiveDate: today, streak: 1, streakAlive: true,
      completedTasks: {}, suppChecked: {}, bodyProfile: null, card, posts: {},
      plan, licenseCode: code,
    };
    saveState(ns); setSaved(ns); setScreen("dashboard");
  };
  const handlePlanUnlock = (plan: "pro" | "elite", code: string) => {
    setPendingPlan(plan); setPendingLicense(code);
    if (plan === "elite") setScreen("card");
    else finalizeSetup(plan, code, null);
  };
  const handleCardSave = (card: CardProfile) => {
    if (!pendingPlan || !pendingLicense) return;
    finalizeSetup(pendingPlan, pendingLicense, card);
  };
  const handleUpgradeToElite = (code: string, card: CardProfile) => {
    const s = loadState();
    if (!s) return;
    const updated: SavedState = { ...s, plan: "elite", licenseCode: code, card };
    saveState(updated); setSaved(updated);
  };
  const handleReset = () => {
    clearState(); setSaved(null); setSport(undefined); setInjury(undefined); setSeverity(undefined); setGoal(undefined);
    setPendingPlan(undefined); setPendingLicense(undefined); setScreen("welcome");
  };

  return (
    <div style={{ width: "100%", height: "100dvh", maxWidth: 430, margin: "0 auto", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Inter',sans-serif", background: T.bg }}>
      {screen === "verifying" && <div style={{ flex: 1 }} />}
      {screen === "welcome"  && <div style={{ flex: 1, overflowY: "auto" }}><Welcome onNext={() => setScreen("sport")} /></div>}
      {screen === "sport"    && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SportSelect    onNext={s  => { setSport(s);    setScreen("injury");   }} /></div>}
      {screen === "injury"   && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><InjurySelect   onNext={i  => { setInjury(i);   setScreen("severity"); }} /></div>}
      {screen === "severity" && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><SeveritySelect onNext={sv => { setSeverity(sv); setScreen("goal");     }} /></div>}
      {screen === "goal"     && <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}><GoalSelect     onNext={g  => { setGoal(g);     setScreen("paywall");  }} /></div>}
      {screen === "paywall"  && <Paywall onUnlock={handlePlanUnlock} onBack={() => setScreen("goal")} />}
      {screen === "card"     && <CardSetup onSave={handleCardSave} onBack={() => setScreen("paywall")} />}
      {screen === "dashboard" && saved && <AppDashboard saved={saved} onReset={handleReset} onUpgrade={handleUpgradeToElite} />}
    </div>
  );
}
