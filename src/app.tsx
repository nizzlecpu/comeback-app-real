import { useState, useEffect, useCallback, ReactNode } from "react";
import { Check, ChevronRight, Trophy, Users, Home, BookOpen, Dumbbell, Flame, RotateCcw } from "lucide-react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const I = {
  indigo:"#6366F1", indigoL:"#EDE9FE", indigoT:"#6D28D9",
  teal:"#10B981",   tealL:"#D1FAE5",
  yellow:"#E8FF47",
  red:"#EF4444",    orange:"#F97316",
  sky:"#0EA5E9",    purple:"#A855F7",
  amber:"#F59E0B",  pink:"#EC4899",
  dark:"#0F172A",   mid:"#334155",   muted:"#64748B", subtle:"#94A3B8",
  bg:"#EBF5FD",     card:"#FFFFFF",  border:"#E2E8F0",
};

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEY = "comeback_v1";

interface SavedState {
  sportId: string;
  injuryId: string;
  severityId: string;
  goalId: string;
  startDate: string;       // ISO date string of day 1
  lastActiveDate: string;  // ISO date string of last open
  streak: number;
  completedTasks: Record<string, boolean[]>; // key = "YYYY-MM-DD", value = array of bools
  unlockedMilestones: number[];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const msA = new Date(a).getTime();
  const msB = new Date(b).getTime();
  return Math.floor((msB - msA) / 86400000);
}

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(s: SavedState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const SPORTS = [
  {id:"basketball",label:"Basketball",icon:"🏀",color:I.orange,athlete:"LeBron James",
   quotes:['"Ice 20 min, elevate above your heart, then compress. Don\'t rush the timeline."','"Sleep is my best recovery tool. I sleep 12 hours a night. You can\'t out-train bad sleep."','"Ice baths changed my career longevity. 10 minutes at 55°F post-game."','"Nutrition timing is everything. 30g protein within 20 min of stopping. That window is real."','"Mind over matter is real but so is the protocol. I trust the science AND the faith."','"Two-a-days in rehab are a myth. One focused session is worth three lazy ones."','"The hardest day is day 3. Push through it. That\'s where most people quit."']},
  {id:"football",label:"Football",icon:"🏈",color:"#16A34A",athlete:"Patrick Mahomes",
   quotes:['"Work the range of motion before you add resistance. Patience in week 1–2 saved my season."','"Visualization during recovery is underrated. I mentally rehearsed plays every day I couldn\'t practice."','"The weight room isn\'t for week 1 of rehab. Inflammation first, then strength."','"Cold tub is non-negotiable. 8 minutes. Every single session. No exceptions."','"Your PT is your co-coach. Listen to them like you\'d listen to Andy Reid."','"Fear of re-injury is the real enemy. Address it mentally as much as physically."','"When I came back, I was 80% physically but 60% mentally. The mental work took longer."']},
  {id:"soccer",label:"Soccer",icon:"⚽",color:I.sky,athlete:"Cristiano Ronaldo",
   quotes:['"Cold water immersion after every session. Consistency beats intensity in recovery."','"I spend more on recovery than most players earn. It\'s not vanity. It\'s my career."','"Sleep 8 hours minimum. Recovery happens when you\'re unconscious."','"Nutrition is 50% of recovery. I eliminated alcohol at 25. That extended my career by a decade."','"The mind is the first muscle that breaks. Train it."','"Flexibility saved my knees. 30 minutes of mobility work before every session. Non-negotiable."','"Pressure to return early is real. Coming back at 95% is worth more than 75%."']},
  {id:"baseball",label:"Baseball",icon:"⚾",color:I.red,athlete:"Shohei Ohtani",
   quotes:['"Rotator cuff work is never optional. Five minutes of band work daily prevented my second surgery."','"Arm care starts before you feel pain. By the time it hurts, you\'re already behind."','"Sleep quality over quantity. I track HRV. If it\'s low, I adjust the day\'s load."','"Mental recovery from Tommy John takes longer than physical. Build that trust slowly."','"Cross-training in the pool saved my shoulder. Zero impact, full range of motion."','"Recovery is just another form of training. Same mindset."','"Data doesn\'t lie. Let the numbers guide your return."']},
  {id:"tennis",label:"Tennis",icon:"🎾",color:"#65A30D",athlete:"Serena Williams",
   quotes:['"Listen to inflammation signals. I pushed through pain twice and paid for it."','"Your team matters as much as your protocol. Bad PT advice cost me 6 extra weeks."','"Mental game breaks down first in long recoveries. Journaling kept me sane."','"Eccentric strengthening for tendons — slow, controlled, painful in the right way."','"I cried on the way to every early PT session. That\'s okay. Cry and then do the work."','"Work with a sports dietitian. Protein and collagen at the right times accelerated my repair."','"Coming back postpartum as an athlete is its own science. Be patient with yourself."']},
  {id:"track",label:"Track & Field",icon:"🏃",color:I.purple,athlete:"Usain Bolt",
   quotes:['"Hip flexor mobility is the unlock. Twenty minutes of floor work changed my return timeline."','"The body remembers what you build. Start building again."','"Speed is neurological as much as muscular. Your nervous system needs retraining."','"Every sprint attempt carries fear after hamstring injury. You have to reprogram that."','"God didn\'t give you these legs to sit. That got me off the couch on day 5."','"Recovery diet should be treated like race prep diet. Same discipline, different goal."','"Water running kept my fitness while my leg healed. Ugly, boring, and worth it."']},
  {id:"swimming",label:"Swimming",icon:"🏊",color:I.sky,athlete:"Michael Phelps",
   quotes:['"Shoulder recovery is 60% sleep. 9 hours minimum after surgery."','"Depression during recovery is real and common. Get a therapist, not just a PT."','"Recovery is a race too. I treated rehab sessions with the same intensity as training."','"Consistency over intensity in rehab. Show up every day, even if you can only do 20%."','"Anti-inflammatory nutrition changed my recovery speed. Less inflammation = more adaptation."','"Gratitude practice kept me from spiraling. What CAN you do today? Do that."','"The pool hurt me and healed me. Learning to love it again took mental work."']},
  {id:"volleyball",label:"Volleyball",icon:"🏐",color:I.amber,athlete:"Misty May-Treanor",
   quotes:['"Single-leg balance work from day 3. Your nervous system needs retraining."','"Smart is smarter than tough. I played injured for a season and paid for it."','"Compression therapy became my ritual. Legs up the wall, 30 minutes. Sacred time."','"Core stability is the foundation. I rebuilt mine before I touched the ball again."','"Track your swelling daily. Data removes emotion from decision-making."','"My comeback was powered by protocol and prayer. Don\'t underestimate either."','"You can\'t fake sand training. Your body tells the truth."']},
  {id:"golf",label:"Golf",icon:"⛳",color:"#16A34A",athlete:"Tiger Woods",
   quotes:['"Core is everything. I rebuilt my back recovery around deep stabilizers."','"Five knee surgeries, four back surgeries. Each one taught me to never skip the small work."','"Coming back from physical injury in golf means rebuilding your swing identity."','"Patience is a skill, not a personality trait. My mother was right."','"What you rebuild is more valuable than what you started with."','"Ego in the weight room will re-injure you. Program correctly."','"Pain management without masking is an art. Learn what pain means vs. sensation."']},
  {id:"mma",label:"MMA / Combat",icon:"🥊",color:I.red,athlete:"Conor McGregor",
   quotes:['"Fascia work — daily rolling 20 min. It separates a 6-month timeline from 4."','"They said my career was over. I used that as fuel every single day."','"Combat sports recovery is unique — you\'re rehabbing from trauma, not just overuse."','"Ice, elevation, and time. The shortcut IS the protocol. Do it correctly."','"Isolation kills motivation. Surround yourself with people who believe in the comeback."','"The leg snapped. I watched it happen. Getting past that visual was 30% of my recovery."','"Every champion has a comeback story. Mine just had more surgeries than most."']},
  {id:"gymnastics",label:"Gymnastics",icon:"🤸",color:I.pink,athlete:"Simone Biles",
   quotes:['"Mental recovery is as real as physical. I work with a sports psych weekly."','"Taking time off to heal was the bravest athletic decision I\'ve ever made."','"Trust your body\'s timeline, not anyone else\'s pressure."','"You\'ve trained for thousands of hours. That doesn\'t disappear during injury. It waits."','"Fear during recovery is just another skill to master."','"The body will catch up to where the mind already went. Believe that."','"Strength training off the mat kept my edge alive while my ankle healed."']},
  {id:"cycling",label:"Cycling",icon:"🚴",color:I.indigo,athlete:"Chris Froome",
   quotes:['"Rebuild pedal cadence before power. I was at 90 RPM before I touched resistance."','"Doctors said I\'d never race again. I won Stage 8 at Vuelta the following year."','"Catastrophic injury requires rebuilding your identity as an athlete, not just your body."','"Bone density nutrition: calcium, vitamin D3. Your skeleton needs feeding."','"My physiotherapist was more important than my coach during my comeback year."','"Small wins compound. First rotation, first kilometer, first climb. Celebrate each one."','"I cried at the top of the first climb back. Let yourself feel it."']},
  {id:"hockey",label:"Hockey",icon:"🏒",color:I.mid,athlete:"Sidney Crosby",
   quotes:['"Concussion protocol is sacred. I sat out when I felt fine — it protected me for a decade."','"10 months with post-concussion syndrome. That patience was the hardest thing I\'ve done."','"The protocol works if you follow it. Cognitive rest is a skill."','"Social media, bright screens, loud environments — cut them. Your brain needs quiet."','"Coming back from a concussion is 100% mental by phase 3. Fear of another one is real."','"Sleep became medicine. 10 hours, dark room, no devices. Life-changing."','"A good team respects your recovery even when they need you on the ice."']},
  {id:"rugby",label:"Rugby",icon:"🏉",color:I.amber,athlete:"Richie McCaw",
   quotes:['"Proprioception drills — ankle boards, BOSU, single leg. Do them religiously."','"Sometimes playing through it is wrong. Injury rehab taught me that."','"Recovery mindset: methodical, patient, professional."','"Maintain team connection while injured. That relationship fuels the comeback."','"My captain instinct said get back fast. My doctor said get back right. Listen to your doctor."','"Week 3 is the mental valley. Push hardest then."','"Cold water tubs changed my recovery rate. Especially shoulder and knee inflammation."']},
  {id:"lacrosse",label:"Lacrosse",icon:"🥍",color:"#92400E",athlete:"Paul Rabil",
   quotes:['"Eccentric loading is the cheat code for tendon recovery. Slow negatives rewire tissue."','"I tore my ACL twice. The second time I came back 3 weeks ahead of schedule."','"Fix the root cause, not just the symptom. Biomechanical analysis was the best money I spent."','"Your diet during surgery recovery matters 3x more than normal training."','"Faith over fear. I wrote that on my wrist brace every session."','"The brotherhood of sport is most powerful when you\'re injured. Let your teammates lift you."','"Every drill I chose served my sport-specific return. Purposeful rehab."']},
];

const INJURIES = [
  {id:"acl",label:"ACL Tear",icon:"🦵",weeks:36,severity:"Major",
   phase1:"Weeks 1–6: Swelling control, quad activation, ROM 0–90°. Ice 20 min/hr, NSAIDs as directed. Goal: full extension, reduce effusion.",
   phase2:"Weeks 7–16: Strength rebuild, single-leg press, stationary bike, swimming. Nordic curls begin week 10. Neuromuscular retraining.",
   phase3:"Weeks 17–36: Sport-specific drills, return-to-play testing (single-leg hop >85% symmetry). Plyometrics wk 20. Running wk 22."},
  {id:"meniscus",label:"Meniscus Tear",icon:"🦵",weeks:24,severity:"Major",
   phase1:"Weeks 1–4: Crutches, ice protocol, pain management. Straight-leg raises only. Avoid deep flexion past 90°.",
   phase2:"Weeks 5–12: Quad/hamstring balance, stationary bike week 6, swimming week 6. No twisting or pivoting.",
   phase3:"Weeks 13–24: Lateral movement, cutting drills, physician clearance. ACL-symmetry testing before return."},
  {id:"ankle",label:"Ankle Sprain",icon:"🦶",weeks:8,severity:"Moderate",
   phase1:"Days 1–7: POLICE protocol (Protection, Optimal Loading, Ice, Compression, Elevation). No weight-bearing Grade 2+.",
   phase2:"Weeks 2–4: Proprioception training, resistance bands, alphabet ankle exercises, calf raises.",
   phase3:"Weeks 5–8: Plyometrics, sport-return tests, single-leg balance >30s, dynamic stability confirmed."},
  {id:"hamstring",label:"Hamstring Strain",icon:"🦵",weeks:12,severity:"Moderate",
   phase1:"Weeks 1–2: Active rest, ice massage, gentle stretching. NO passive static stretching in acute phase (increases re-tear risk).",
   phase2:"Weeks 3–6: Nordic curl eccentric program (Askling protocol), stationary bike week 3, progressive loading.",
   phase3:"Weeks 7–12: Timed sprint at 60→75→90→100% max with weekly testing (H-test clearance before return)."},
  {id:"rotator",label:"Rotator Cuff Tear",icon:"💪",weeks:20,severity:"Major",
   phase1:"Weeks 1–6: Sling, pendulum exercises, pain control. Zero active elevation. Cryotherapy 20 min 5×/day.",
   phase2:"Weeks 7–14: Resistance bands, scapular stability. External rotation emphasis. Theraband ER/IR at 0°.",
   phase3:"Weeks 15–20: Progressive overhead loading, throwing program. ASES score ≥85 before full return."},
  {id:"stress",label:"Stress Fracture",icon:"🦴",weeks:14,severity:"Major",
   phase1:"Weeks 1–6: Non-weight-bearing. Bone density nutrition: calcium 1200mg, D3 2000IU, K2 100mcg.",
   phase2:"Weeks 7–10: Pool running, stationary bike only. Absolutely no impact loading.",
   phase3:"Weeks 11–14: Impact reintroduction 25% increments weekly. Bone scan clearance required."},
  {id:"shin",label:"Shin Splints",icon:"🦵",weeks:6,severity:"Mild",
   phase1:"Days 1–10: Rest from running, ice massage shin 10 min 3×/day, calf stretching. Identify training error.",
   phase2:"Weeks 2–4: Swimming, stationary bike, calf strengthening. Arch support check.",
   phase3:"Weeks 5–6: Walk-run intervals (Galloway method), gait analysis, 10% rule for volume increases."},
  {id:"tennis_elbow",label:"Tennis Elbow",icon:"💪",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–3: Rest, ice, topical anti-inflammatories. Counterforce brace during any gripping activity.",
   phase2:"Weeks 4–7: Tyler Twist eccentric wrist curls 3×15 (gold standard), deep tissue massage.",
   phase3:"Weeks 8–10: Sport-grip reintroduction at 50→75→100% load. Drop arm technique coaching."},
  {id:"concussion",label:"Concussion",icon:"🧠",weeks:6,severity:"Major",
   phase1:"Days 1–5: Full cognitive and physical rest. Dark room, no screens, no reading. Symptom monitoring every 2 hours.",
   phase2:"Weeks 2–4: Sub-symptom aerobic exercise only. Buffalo Concussion Treadmill Test protocol.",
   phase3:"Weeks 5–6: Sport-specific non-contact drills. SCAT5 clearance + physician sign-off required."},
  {id:"plantar",label:"Plantar Fasciitis",icon:"🦶",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–2: Night splint every night, frozen water bottle rolling 3×/day, first-step stretch protocol.",
   phase2:"Weeks 3–6: Alfredson eccentric heel drops 3×15 straight + bent knee daily. Strassburg sock overnight.",
   phase3:"Weeks 7–10: Running reintroduction, footwear review, taping (low-Dye technique), 10% load rule."},
  {id:"back",label:"Lower Back Strain",icon:"🔙",weeks:8,severity:"Moderate",
   phase1:"Weeks 1–2: McKenzie extension protocol, avoid spinal flexion. Cat-cow, bird-dog, decompression walks.",
   phase2:"Weeks 3–5: McGill Big 3 (curl-up, side plank, bird-dog), dead bug progression, hip hinge patterning.",
   phase3:"Weeks 6–8: Deadlift at bodyweight, RDL, core loading. Return when pain-free through full ROM."},
  {id:"wrist",label:"Wrist Fracture",icon:"🖐",weeks:16,severity:"Major",
   phase1:"Weeks 1–6: Cast immobilization. No hand use. Bone nutrition: calcium, D3, K2, protein ≥1.6g/kg/day.",
   phase2:"Weeks 7–12: ROM restoration, grip strength with putty, pronation/supination, wrist curls low resistance.",
   phase3:"Weeks 13–16: Progressive load tolerance, sport-specific grip patterns, return-to-play functional test."},
  {id:"shoulder",label:"Shoulder Dislocation",icon:"💪",weeks:12,severity:"Major",
   phase1:"Weeks 1–4: Sling immobilization. No elevation >90° or external rotation. Cryotherapy + NSAIDs.",
   phase2:"Weeks 5–8: Rotator cuff band work (ER/IR), scapular stabilization, isometric strengthening.",
   phase3:"Weeks 9–12: Overhead cleared, sport-specific loading. Apprehension test negative before contact clearance."},
  {id:"groin",label:"Groin Strain",icon:"🦵",weeks:8,severity:"Moderate",
   phase1:"Weeks 1–2: Adductor rest, pool walking only. No hip extension work. Ice 20 min 3×/day.",
   phase2:"Weeks 3–5: Copenhagen adductor program (evidence: Harøy et al. 2019), side-lying hip work, stationary bike.",
   phase3:"Weeks 6–8: Change-of-direction drills (T-test), squeeze test pain-free + 80% strength before return."},
  {id:"quad",label:"Quad Strain",icon:"🦵",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–2: Ice, compression, static quad sets. No knee flexion past 90°. Crutches if Grade 2+.",
   phase2:"Weeks 3–6: Leg press 30-70° range, stationary bike, eccentric loading begins week 4.",
   phase3:"Weeks 7–10: Sprint reintroduction at graduated % of max, RTP test: 80%+ isokinetic strength symmetry."},
  {id:"achilles",label:"Achilles Tendon",icon:"🦶",weeks:26,severity:"Major",
   phase1:"Weeks 1–8: Boot immobilization, no plantarflexion. Upper body only. Bone/tendon nutrition.",
   phase2:"Weeks 9–18: Alfredson protocol eccentric heel drops 3×15 twice daily (evidence-grade A), pool walking.",
   phase3:"Weeks 19–26: Running protocol (walk→jog→run→sprint), jumping drills, VISA-A score ≥90 before clearance."},
];

const SEVERITIES = [
  {id:"mild",        label:"Mild",         icon:"🟡", desc:"Minor discomfort, partial activity possible",  color:"#854D0E", bg:"#FEF9C3"},
  {id:"moderate",    label:"Moderate",     icon:"🟠", desc:"Significant pain, limited activity",           color:"#9A3412", bg:"#FFEDD5"},
  {id:"severe",      label:"Severe",       icon:"🔴", desc:"Major injury, minimal activity",               color:"#991B1B", bg:"#FEE2E2"},
  {id:"post_surgery",label:"Post-Surgery", icon:"🏥", desc:"Surgical recovery, strict protocol required",  color:"#1E3A5F", bg:"#DBEAFE"},
];

const GOALS = [
  {id:"return",  label:"Return to Sport",  icon:"🏆", desc:"Full competitive return"},
  {id:"pain",    label:"Pain-Free Living", icon:"💆", desc:"Manage pain, improve daily function"},
  {id:"fitness", label:"Maintain Fitness", icon:"💪", desc:"Stay strong while healing"},
  {id:"fast",    label:"Fastest Recovery", icon:"⚡", desc:"Optimise every variable"},
];

const PLANS = [
  {id:"free",  label:"Free",  price:"$0",    icon:"🌱", features:["Daily protocol","Basic exercises","Community access"]},
  {id:"pro",   label:"Pro",   price:"$9/mo", icon:"⚡", features:["Everything in Free","AI coaching","Video library","Progress analytics"]},
  {id:"elite", label:"Elite", price:"$29/mo",icon:"🏆", features:["Everything in Pro","1-on-1 PT consults","Custom meal plans","Priority support"]},
];

// ── DAILY TASKS PER PHASE ─────────────────────────────────────────────────────
type Task = {time:string; task:string; icon:string; iconColor:string; iconBg:string};

function getTasksForDay(injuryId:string, severityId:string, dayNum:number): Task[] {
  const phase = dayNum <= 42 ? 1 : dayNum <= 112 ? 2 : 3;

  const baseTasks: Record<number, Task[]> = {
    1: [
      {time:"7:00 AM", task:"Morning mobility warm-up — 10 min gentle movement to activate circulation",               icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Magnesium 400 mg + Vitamin C 500 mg",        icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Phase 1 rehab — quad sets / ankle pumps / gentle ROM exercises as prescribed (3 sets)",   icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"Anti-inflammatory meal: 40g protein (chicken/fish/eggs) + leafy greens + berries",        icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Ice/compression 20 min on injury site + elevation above heart level",                      icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Upper body or non-injured muscle workout — maintain strength 3×15 each exercise",         icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"7:00 PM", task:"Evening stretch + foam roll (avoid injured area) + deep breathing 5 min",                 icon:"🧘", iconColor:I.teal,   iconBg:I.tealL},
      {time:"9:00 PM", task:"9-hour sleep target — growth hormone peaks during deep sleep, accelerating tissue repair", icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    2: [
      {time:"7:00 AM", task:"Active warm-up: leg swings 3×10 + walking lunge bodyweight 2×10 + hip circles",          icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Zinc 15 mg + Collagen 10g + Vitamin C",      icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Phase 2 strength — leg press / stationary bike / resistance bands 3×15 progressive load",  icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"High-protein meal: 45–50g protein + complex carbs (sweet potato/oats) + anti-inflam fats", icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Pool walking or stationary bike 25 min moderate intensity — cardio base maintenance",       icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Ice 15 min post-session + compression + elevation — reduces effusion and speeds recovery",  icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"6:00 PM", task:"Neuromuscular training: single-leg balance 3×45s + proprioception drills",                icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"9:00 PM", task:"Progressive muscle relaxation 10 min + 8–9hr sleep — cortisol reduction boosts healing",  icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    3: [
      {time:"7:00 AM", task:"Full dynamic warm-up: jogging, high knees, butt kicks, lateral shuffles — 10 min",        icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Zinc 15 mg + Collagen 10g",                  icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Sport-specific drills at 60–80% intensity + plyometrics — controlled return to movement",  icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"Performance nutrition: 50g protein + carb reload post-session + electrolytes",              icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Active recovery: 20 min easy swim or bike + contrast bath (3 min warm / 1 min cold ×4)",  icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Strength maintenance: full compound movements — squat, hinge, push, pull 3×8–12",         icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"6:00 PM", task:"Mental skills: visualization of return-to-sport scenarios + journal entry",                icon:"🧘", iconColor:I.teal,   iconBg:I.tealL},
      {time:"9:00 PM", task:"9hr sleep target — recovery and adaptation happen overnight. Protect this time.",          icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
  };

  // Injury-specific overrides for phase 1
  const injuryOverrides: Record<string, Task> = {
    acl:      {time:"10:00 AM",task:"ACL Phase "+phase+": Quad sets 3×20, terminal knee extensions 3×15, heel slides 3×10 — no pivoting",icon:"🦵",iconColor:I.indigo,iconBg:I.indigoL},
    ankle:    {time:"10:00 AM",task:"Ankle Phase "+phase+": Alphabet ankle circles, calf raises 3×20, resistance band eversion 3×20",      icon:"🦶",iconColor:I.teal,  iconBg:I.tealL},
    hamstring:{time:"10:00 AM",task:"Hamstring Phase "+phase+": Nordic curl eccentric 3×8, RDL bodyweight 3×12, glute bridge 3×20",        icon:"🦵",iconColor:I.orange,iconBg:"#FFF0E6"},
    achilles: {time:"10:00 AM",task:"Achilles Phase "+phase+": Alfredson eccentric heel drops 3×15 (straight + bent knee), pool walking",   icon:"🦶",iconColor:I.red,  iconBg:"#FEE2E2"},
    rotator:  {time:"10:00 AM",task:"Rotator Cuff Phase "+phase+": Theraband ER/IR 3×20, scapular retractions 3×15, pendulums 3×10",       icon:"💪",iconColor:I.purple,iconBg:"#F5F3FF"},
    concussion:{time:"10:00 AM",task:"Concussion Phase "+phase+": Sub-symptom aerobic only — Buffalo Treadmill protocol, no contact",       icon:"🧠",iconColor:I.mid,  iconBg:"#F1F5F9"},
    back:     {time:"10:00 AM",task:"Back Phase "+phase+": McGill Big 3 — curl-up 3×10, side plank 3×30s, bird-dog 3×10 each side",        icon:"🔙",iconColor:I.amber,iconBg:"#FFF7ED"},
  };

  const tasks = [...baseTasks[phase]];
  if (injuryOverrides[injuryId]) {
    tasks[2] = injuryOverrides[injuryId];
  }

  // Post-surgery severity override
  if (severityId === "post_surgery" && phase === 1) {
    tasks[2] = {time:"10:00 AM",task:"Post-op Phase 1: Ankle pumps 3×25 (DVT prevention), passive ROM with support only, no active contraction",icon:"🏥",iconColor:"#1E3A5F",iconBg:"#DBEAFE"};
    tasks[6] = {time:"7:00 PM", task:"Wound care check: monitor surgical site for redness, warmth, or discharge. Log observations.",          icon:"🔍",iconColor:I.teal,   iconBg:I.tealL};
  }

  return tasks;
}

const DAILY_CONTENT = [
  {type:"verse",   quote:"I can do all things through Christ who strengthens me.",                                    text:"Philippians 4:13"},
  {type:"verse",   quote:"Be strong and courageous. Do not be afraid; do not be discouraged.",                       text:"Joshua 1:9"},
  {type:"athlete", quote:"The hardest day is day 3. Push through it. That's where most people quit.",                text:"LeBron James"},
  {type:"verse",   quote:"Those who hope in the Lord will renew their strength. They will soar on wings like eagles.",text:"Isaiah 40:31"},
  {type:"athlete", quote:"Consistency beats intensity in recovery — every single time.",                              text:"Cristiano Ronaldo"},
  {type:"verse",   quote:"For I know the plans I have for you, plans to prosper you and not to harm you.",           text:"Jeremiah 29:11"},
  {type:"motivation",quote:"Champions are made in the moments they want to quit.",                                   text:"Recovery Wisdom"},
  {type:"athlete", quote:"Recovery is a race too. Treat rehab with the same intensity as training.",                  text:"Michael Phelps"},
  {type:"verse",   quote:"Consider it pure joy when you face trials of many kinds, for the testing produces perseverance.",text:"James 1:2-3"},
  {type:"athlete", quote:"The body remembers what you build. Start building again.",                                  text:"Usain Bolt"},
  {type:"verse",   quote:"He gives strength to the weary and increases the power of the weak.",                      text:"Isaiah 40:29"},
  {type:"athlete", quote:"What you rebuild is more valuable than what you started with.",                             text:"Tiger Woods"},
  {type:"verse",   quote:"Do not grow weary in doing good, for at the proper time you will reap a harvest.",         text:"Galatians 6:9"},
  {type:"athlete", quote:"Show up every day, even if you can only do 20%. The 20% compounds.",                       text:"Michael Phelps"},
];

const SUPPLEMENTS = [
  {label:"Vitamin D3",      dose:"2,000–4,000 IU/day", note:"Supports bone health, immune function, and muscle recovery. Most athletes are deficient.", cost:"~$0.05/day", color:I.amber,  bg:"#FFF7ED"},
  {label:"Omega-3",         dose:"1–3g EPA+DHA/day",   note:"Reduces exercise-induced inflammation by 25–40%. Fish oil or algae-based.", cost:"~$0.15/day", color:I.sky,    bg:"#E0F2FE"},
  {label:"Magnesium",       dose:"300–400mg/day",       note:"Critical for muscle relaxation, sleep quality, and protein synthesis.", cost:"~$0.08/day", color:I.purple, bg:"#F5F3FF"},
  {label:"Vitamin C",       dose:"500–1,000mg/day",     note:"Collagen synthesis for tendons/ligaments. Best taken with protein meals.", cost:"~$0.03/day", color:I.orange, bg:"#FFF0E6"},
  {label:"Zinc",            dose:"15–25mg/day",         note:"Tissue repair, immune support, anti-inflammatory. Take with food.", cost:"~$0.04/day", color:I.teal,   bg:I.tealL},
  {label:"Collagen Peptides",dose:"10–15g/day",         note:"Take 30–60 min before rehab with Vitamin C for maximum tendon benefit.", cost:"~$0.50/day", color:I.pink,   bg:"#FDF2F8"},
];

const DIET_GUIDE = [
  {category:"🐟 Protein Sources",    foods:"Salmon, sardines, eggs, chicken breast, Greek yogurt, lentils, tofu",           avoid:"Processed deli meats, fried proteins, protein bars with >10g sugar"},
  {category:"🥦 Anti-Inflammatory",  foods:"Turmeric, ginger, leafy greens, berries, tart cherry, green tea, olive oil",    avoid:"Refined sugar, white bread, vegetable oils (canola, corn, soy)"},
  {category:"🦴 Bone & Tendon",      foods:"Dairy/fortified alternatives, bone broth, leafy greens, fatty fish",            avoid:"Excess alcohol, high-sodium processed foods, excessive caffeine"},
  {category:"⚡ Energy & Recovery",  foods:"Sweet potato, oats, quinoa, banana, dates (pre-workout), complex carbs",         avoid:"Simple sugars pre-workout, alcohol (delays recovery by 48hrs+)"},
  {category:"💧 Hydration",          foods:"Water 3–4L/day, electrolytes if sweating, coconut water, herbal teas",           avoid:"Sports drinks with high HFCS, energy drinks, excessive caffeine"},
];

const MILESTONES = [
  {day:1,   badge:"🌱", title:"Day One",         reward:"You started. That's the hardest step.",                           verse:"\"Be strong and courageous.\" — Joshua 1:9"},
  {day:3,   badge:"🔥", title:"First 3 Days",    reward:"Resilience Badge unlocked",                                       verse:"\"I can do all things through Christ.\" — Phil 4:13"},
  {day:7,   badge:"⚡", title:"One Week Strong",  reward:"Streak Shield + weekly progress report",                          verse:"\"Endurance produces character.\" — Romans 5:4"},
  {day:14,  badge:"💪", title:"Two Weeks In",     reward:"Warrior Badge + nutrition guide",                                 verse:"\"Press on toward the goal.\" — Philippians 3:14"},
  {day:21,  badge:"🏅", title:"21-Day Habit",     reward:"Habit is forming. Custom protocol unlocked.",                    verse:"\"Do not grow weary in doing good.\" — Galatians 6:9"},
  {day:30,  badge:"🏆", title:"30-Day Champion",  reward:"Champion Badge + 1 free PT consultation tip",                    verse:"\"They will soar on wings like eagles.\" — Isaiah 40:31"},
  {day:60,  badge:"🦅", title:"60-Day Eagle",     reward:"Eagle Badge + full supplement guide",                             verse:"\"He gives strength to the weary.\" — Isaiah 40:29"},
  {day:90,  badge:"👑", title:"90-Day Legend",    reward:"Legend Trophy + return-to-sport clearance checklist",             verse:"\"Well done, good and faithful servant.\" — Matthew 25:23"},
];

const COMMUNITY_MESSAGES = [
  {name:"Marcus T.",    sport:"🏀", day:47,  msg:"Day 47 post-ACL. Hit 90° ROM today. The Nordic curls protocol is legit.", likes:24},
  {name:"Priya R.",     sport:"⚽", day:23,  msg:"Week 3 of hamstring recovery. Pool running is saving my cardio base.",     likes:18},
  {name:"Jake M.",      sport:"🏈", day:82,  msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol.",likes:67},
  {name:"Sofia L.",     sport:"🎾", day:15,  msg:"Tennis elbow Tyler Twist eccentric curls — week 2. Already feeling a difference.", likes:12},
  {name:"DeShawn W.",   sport:"🏀", day:134, msg:"134 days out. Dropped 40pts in first game back. Your comeback is coming. 🙏", likes:201},
  {name:"Coach Rivera", sport:"🏋️",day:0,   msg:"Reminder: recovery pace is not weakness. It is the strategy.",            likes:89},
];

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Card({children,style={}}:{children:ReactNode,style?:React.CSSProperties}){
  return <div style={{background:"white",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 8px rgba(15,23,42,0.06)",border:`1px solid ${I.border}`,...style}}>{children}</div>;
}
function TagPill({children,color,bg}:{children:ReactNode,color:string,bg:string}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color,background:bg,borderRadius:20,padding:"3px 10px",letterSpacing:"0.3px"}}>{children}</span>;
}
function PrimaryBtn({children,onClick,style={}}:{children:ReactNode,onClick?:()=>void,style?:React.CSSProperties}){
  return <button onClick={onClick} style={{width:"100%",padding:"15px",borderRadius:14,background:I.indigo,color:"white",fontWeight:800,fontSize:16,border:"none",cursor:"pointer",boxShadow:`0 4px 14px ${I.indigo}40`,...style}}>{children}</button>;
}
function GhostBtn({children,onClick}:{children:ReactNode,onClick?:()=>void}){
  return <button onClick={onClick} style={{width:"100%",padding:"13px",borderRadius:14,background:"transparent",color:I.mid,fontWeight:700,fontSize:14,border:`1.5px solid ${I.border}`,cursor:"pointer"}}>{children}</button>;
}
function Logo({size=28}:{size?:number}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:size+8,height:size+8,borderRadius:(size+8)/2,background:I.dark,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width={size*0.65} height={size*0.65} viewBox="0 0 24 24" fill="none">
          <rect x="2"  y="9"  width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="18" y="9"  width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="5"  y="11" width="14" height="2" rx="1"  fill="white"/>
          <rect x="8"  y="7"  width="3"  height="10" rx="1.5" fill="white"/>
          <rect x="13" y="7"  width="3"  height="10" rx="1.5" fill="white"/>
        </svg>
      </div>
      <div>
        <div style={{fontWeight:900,fontSize:size*0.75,color:I.dark,lineHeight:1,letterSpacing:"-0.5px"}}>Comeback</div>
        <div style={{fontWeight:600,fontSize:size*0.38,color:I.muted,lineHeight:1,letterSpacing:"1px",textTransform:"uppercase",marginTop:1}}>Sports Recovery</div>
      </div>
    </div>
  );
}
function ProgressBar({pct,color=I.indigo}:{pct:number,color?:string}){
  return <div style={{height:6,background:I.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:color,borderRadius:3,transition:"width 0.4s"}}/></div>;
}
function StepBar({total,current}:{total:number,current:number}){
  return <div style={{display:"flex",gap:4,marginBottom:20}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<current?I.indigo:I.border,transition:"background 0.3s"}}/>)}</div>;
}

// ── TASK CARD with persistence ─────────────────────────────────────────────────
function TaskCard({task,checked,onToggle}:{task:Task,checked:boolean,onToggle:()=>void}){
  return (
    <div onClick={onToggle} style={{display:"flex",gap:12,alignItems:"flex-start",background:"white",borderRadius:14,padding:"12px 14px",border:`1px solid ${checked?I.teal:I.border}`,boxShadow:"0 1px 4px rgba(15,23,42,0.05)",cursor:"pointer",opacity:checked?0.7:1,transition:"all 0.2s"}}>
      <div style={{width:36,height:36,borderRadius:18,background:task.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{task.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,fontWeight:700,color:I.muted,marginBottom:2}}>{task.time}</div>
        <div style={{fontSize:12,color:checked?I.muted:I.mid,lineHeight:1.45,textDecoration:checked?"line-through":"none",fontWeight:500}}>{task.task}</div>
      </div>
      <div style={{width:22,height:22,borderRadius:11,background:checked?I.teal:I.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,transition:"background 0.2s"}}>
        {checked&&<Check size={13} color="white" strokeWidth={3}/>}
      </div>
    </div>
  );
}

// ── QUIZ SCREENS ──────────────────────────────────────────────────────────────
function Welcome({onNext}:{onNext:()=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",padding:"48px 24px 32px",background:`linear-gradient(160deg,${I.indigoL} 0%,${I.bg} 60%)`}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
        <Logo size={36}/>
        <div style={{marginTop:32,marginBottom:20}}>
          <h1 style={{fontWeight:900,fontSize:34,color:I.dark,lineHeight:1.1,letterSpacing:"-1px",marginBottom:12}}>Your comeback<br/>starts <span style={{color:I.indigo}}>today.</span></h1>
          <p style={{fontSize:15,color:I.muted,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Science-backed recovery protocols built around your sport, injury, and goals.</p>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:28}}>
          {["🏆 Pro athlete protocols","📿 Daily motivation","🧪 Evidence-based science","📅 Real day tracking"].map((f,i)=>(
            <div key={i} style={{fontSize:11,fontWeight:700,color:I.indigoT,background:"white",borderRadius:12,padding:"6px 12px",boxShadow:"0 2px 6px rgba(15,23,42,0.08)"}}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{textAlign:"center",fontSize:11,color:I.muted,marginTop:12}}>Free to start · Progress saved automatically</p>
    </div>
  );
}

function SportSelect({onNext}:{onNext:(s:typeof SPORTS[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={1}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your sport?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>We'll tailor your protocol with elite athlete advice from your sport.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {SPORTS.map(s=>(
            <button key={s.id} onClick={()=>onNext(s)} style={{background:"white",border:`1.5px solid ${I.border}`,borderRadius:16,padding:"16px 12px",cursor:"pointer",textAlign:"center",boxShadow:"0 2px 6px rgba(15,23,42,0.05)"}}>
              <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
              <div style={{fontWeight:700,fontSize:13,color:I.dark}}>{s.label}</div>
              <div style={{fontSize:10,color:I.muted,marginTop:2}}>{s.athlete}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InjurySelect({onNext}:{onNext:(inj:typeof INJURIES[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={2}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your injury?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Select the closest match — we'll fine-tune based on severity next.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {INJURIES.map(inj=>(
            <button key={inj.id} onClick={()=>onNext(inj)} style={{background:"white",border:`1.5px solid ${I.border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 6px rgba(15,23,42,0.05)"}}>
              <span style={{fontSize:26}}>{inj.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:I.dark}}>{inj.label}</div>
                <div style={{fontSize:11,color:I.muted,marginTop:2}}>{inj.weeks}-week recovery · {inj.severity}</div>
              </div>
              <ChevronRight size={16} color={I.muted}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeveritySelect({onNext}:{onNext:(sv:typeof SEVERITIES[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={3}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>How severe is it?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Your protocol intensity depends on this.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {SEVERITIES.map(sv=>(
            <button key={sv.id} onClick={()=>onNext(sv)} style={{background:"white",border:`2px solid ${I.border}`,borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(15,23,42,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                <span style={{fontSize:24}}>{sv.icon}</span>
                <span style={{fontWeight:800,fontSize:16,color:I.dark}}>{sv.label}</span>
                <TagPill color={sv.color} bg={sv.bg}>{sv.label}</TagPill>
              </div>
              <p style={{fontSize:13,color:I.muted,margin:0,paddingLeft:36}}>{sv.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalSelect({onNext}:{onNext:(g:typeof GOALS[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={4}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your #1 goal?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>This shapes your daily task emphasis and milestones.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {GOALS.map(g=>(
            <button key={g.id} onClick={()=>onNext(g)} style={{background:"white",border:`1.5px solid ${I.border}`,borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(15,23,42,0.06)"}}>
              <span style={{fontSize:28}}>{g.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:I.dark}}>{g.label}</div>
                <div style={{fontSize:12,color:I.muted,marginTop:2}}>{g.desc}</div>
              </div>
              <ChevronRight size={16} color={I.muted}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanSelect({onNext}:{onNext:()=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={5}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Choose your plan</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Start free. Upgrade anytime as you progress.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {PLANS.map((plan,i)=>(
            <div key={plan.id} style={{background:"white",borderRadius:18,padding:"18px 16px",border:`2px solid ${i===1?I.indigo:I.border}`,boxShadow:i===1?`0 4px 16px ${I.indigo}20`:"0 2px 8px rgba(15,23,42,0.06)",position:"relative"}}>
              {i===1&&<div style={{position:"absolute",top:-10,right:16,background:I.indigo,color:"white",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:10}}>MOST POPULAR</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>{plan.icon}</span><span style={{fontWeight:800,fontSize:16,color:I.dark}}>{plan.label}</span></div>
                <span style={{fontWeight:900,fontSize:18,color:i===1?I.indigo:I.dark}}>{plan.price}</span>
              </div>
              {plan.features.map((f,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Check size={13} color={I.teal} strokeWidth={3}/><span style={{fontSize:12,color:I.mid}}>{f}</span></div>
              ))}
              <button onClick={onNext} style={{width:"100%",marginTop:12,padding:"11px",borderRadius:12,background:i===1?I.indigo:"transparent",color:i===1?"white":I.mid,fontWeight:700,fontSize:13,border:`1.5px solid ${i===1?I.indigo:I.border}`,cursor:"pointer"}}>
                {i===0?"Start Free":"Get Started"}
              </button>
            </div>
          ))}
        </div>
        <GhostBtn onClick={onNext}>Skip for now</GhostBtn>
      </div>
    </div>
  );
}

// ── NAV BUTTON ────────────────────────────────────────────────────────────────
function NavBtn({icon,label,active,onClick}:{icon:ReactNode,label:string,active:boolean,onClick:()=>void}){
  return (
    <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 14px",background:"none",border:"none",cursor:"pointer"}}>
      <div style={{color:active?I.indigo:I.subtle}}>{icon}</div>
      <span style={{fontSize:10,fontWeight:700,color:active?I.indigo:I.subtle,letterSpacing:"0.3px"}}>{label}</span>
    </button>
  );
}

// ── APP DASHBOARD ─────────────────────────────────────────────────────────────
function AppDashboard({saved,onReset}:{saved:SavedState,onReset:()=>void}){
  const [tab, setTab] = useState<"home"|"today"|"protocol"|"squad"|"rewards">("home");

  const sport    = SPORTS.find(s=>s.id===saved.sportId);
  const injury   = INJURIES.find(i=>i.id===saved.injuryId);
  const severity = SEVERITIES.find(s=>s.id===saved.severityId);

  // Real day number based on start date
  const dayNum = Math.max(1, daysBetween(saved.startDate, todayStr()) + 1);
  const phase  = dayNum <= 42 ? 1 : dayNum <= 112 ? 2 : 3;
  const pct    = Math.min(100, Math.round((dayNum / (injury?.weeks||36*7)) * 100));

  // Daily tasks — phase-aware, injury-specific
  const tasks  = getTasksForDay(saved.injuryId, saved.severityId, dayNum);
  const todayKey = todayStr();

  // Completed tasks for today (persisted)
  const [checked, setChecked] = useState<boolean[]>(() => {
    const saved2 = loadState();
    return saved2?.completedTasks?.[todayKey] ?? Array(tasks.length).fill(false);
  });

  const doneCount = checked.filter(Boolean).length;

  const toggleTask = useCallback((idx:number) => {
    setChecked(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      // Persist
      const s = loadState();
      if (s) {
        s.completedTasks = s.completedTasks || {};
        s.completedTasks[todayKey] = next;
        saveState(s);
      }
      return next;
    });
  }, [todayKey]);

  // Daily content rotates by day number
  const dailyContent = DAILY_CONTENT[dayNum % DAILY_CONTENT.length];

  const morningTasks   = tasks.slice(0, 3);
  const afternoonTasks = tasks.slice(3, 6);
  const eveningTasks   = tasks.slice(6);

  const phaseLabel = phase===1?"Phase 1 — Protection & Healing":phase===2?"Phase 2 — Strength & Mobility":"Phase 3 — Return to Sport";
  const weekNum = Math.ceil(dayNum / 7);

  const renderTab = ()=>{
    switch(tab){

      case "home": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <Logo size={26}/>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"6px 12px",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 6px rgba(15,23,42,0.06)"}}>
                <Flame size={14} color={I.orange} fill={I.orange}/>
                <span style={{fontWeight:800,fontSize:14,color:I.dark}}>{saved.streak}</span>
              </div>
              <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{sport?.icon||"🏆"}</div>
            </div>
          </div>

          {/* Progress card */}
          <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:16,padding:"18px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6,letterSpacing:"1px"}}>WEEK {weekNum} · {phaseLabel.split("—")[0].trim().toUpperCase()}</div>
            <h2 style={{fontWeight:900,fontSize:22,color:"white",lineHeight:1.1,marginBottom:6}}>Day {dayNum} of {(injury?.weeks||36)*7}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:12}}>{injury?.label||"Recovery"} · {severity?.label||""} severity</p>
            <ProgressBar pct={pct} color={I.yellow}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day 1</span>
              <span style={{fontSize:10,color:I.yellow,fontWeight:700}}>{pct}% complete</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day {(injury?.weeks||36)*7}</span>
            </div>
          </Card>

          {/* Quick stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {icon:"🔥",val:`${saved.streak}`,label:"Day Streak"},
              {icon:"✅",val:`${doneCount}/${tasks.length}`,label:"Today"},
              {icon:"📈",val:`Phase ${phase}`,label:"Stage"},
            ].map((stat,i)=>(
              <Card key={i} style={{textAlign:"center",padding:"12px 8px"}}>
                <div style={{fontSize:20,marginBottom:4}}>{stat.icon}</div>
                <div style={{fontWeight:900,fontSize:16,color:I.dark}}>{stat.val}</div>
                <div style={{fontSize:10,color:I.muted,fontWeight:600}}>{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Daily quote */}
          <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:16}}>
            <TagPill color={I.indigoT} bg={I.indigo+"22"}>{dailyContent.type==="verse"?"📿 Bible Verse":dailyContent.type==="athlete"?"🏆 Athlete":"💡 Motivation"}</TagPill>
            <p style={{fontSize:13,fontStyle:"italic",color:I.dark,lineHeight:1.65,marginTop:8,fontFamily:"Georgia,serif"}}>{dailyContent.quote}</p>
            <p style={{fontSize:10,fontWeight:700,color:I.indigoT,marginTop:6}}>— {dailyContent.text}</p>
          </Card>

          {/* Today's top tasks preview */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontWeight:900,fontSize:17,color:I.dark}}>Today's Focus</h2>
            <button onClick={()=>setTab("today")} style={{fontSize:12,fontWeight:700,color:I.indigo,background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {tasks.slice(0,3).map((t,i)=><TaskCard key={i} task={t} checked={checked[i]} onToggle={()=>toggleTask(i)}/>)}
          </div>

          {/* Sport athlete tip */}
          {sport&&(
            <Card style={{background:`linear-gradient(135deg,${sport.color}15,${sport.color}05)`,border:`1px solid ${sport.color}30`,marginBottom:16}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:28}}>{sport.icon}</span>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:sport.color,marginBottom:4}}>{sport.athlete} SAYS</div>
                  <p style={{fontSize:12,fontStyle:"italic",color:I.mid,lineHeight:1.5,margin:0}}>{sport.quotes[dayNum%sport.quotes.length]}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Reset button */}
          <button onClick={()=>{if(confirm("Reset your recovery plan? This will clear all progress."))onReset();}} style={{width:"100%",padding:"10px",borderRadius:12,background:"transparent",color:I.muted,fontSize:12,fontWeight:600,border:`1px solid ${I.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <RotateCcw size={13}/> Start a new recovery plan
          </button>
        </div>
      );

      case "today": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 0 100px"}}>
          <div style={{padding:"0 18px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <h1 style={{fontWeight:900,fontSize:24,color:I.dark,lineHeight:1}}>Day {dayNum}</h1>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
                  <TagPill color={I.indigoT} bg={I.indigoL}>Phase {phase}</TagPill>
                  <span style={{fontSize:12,color:I.muted,fontWeight:600}}>{injury?.label||"Recovery"}</span>
                </div>
              </div>
              <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"7px 13px",boxShadow:"0 2px 6px rgba(15,23,42,0.06)",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:16}}>🔥</span>
                <span style={{fontWeight:800,fontSize:16,color:I.dark}}>{saved.streak}</span>
              </div>
            </div>

            <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:14}}>
              <TagPill color={I.indigoT} bg={I.indigo+"22"}>{dailyContent.type==="verse"?"📿 Bible Verse":dailyContent.type==="athlete"?"🏆 Athlete":"💡 Motivation"}</TagPill>
              <p style={{fontSize:14,fontStyle:"italic",color:I.dark,lineHeight:1.65,marginTop:8,fontFamily:"Georgia,serif"}}>{dailyContent.quote}</p>
              <p style={{fontSize:10,fontWeight:700,color:I.indigoT,marginTop:6}}>— {dailyContent.text}</p>
            </Card>

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <h2 style={{fontWeight:900,fontSize:18,color:I.dark}}>Today's Protocol</h2>
              <span style={{fontSize:10,fontWeight:700,color:doneCount===tasks.length?I.teal:I.muted,background:"white",border:`1px solid ${doneCount===tasks.length?I.teal:I.border}`,borderRadius:8,padding:"4px 8px",transition:"all 0.3s"}}>{doneCount} / {tasks.length} done</span>
            </div>
          </div>

          <div style={{padding:"0 18px"}}>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌅 Morning</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {morningTasks.map((t,i)=><TaskCard key={i} task={t} checked={checked[i]} onToggle={()=>toggleTask(i)}/>)}
            </div>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>☀️ Afternoon</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {afternoonTasks.map((t,i)=><TaskCard key={i+3} task={t} checked={checked[i+3]} onToggle={()=>toggleTask(i+3)}/>)}
            </div>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌙 Evening</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {eveningTasks.map((t,i)=><TaskCard key={i+6} task={t} checked={checked[i+6]} onToggle={()=>toggleTask(i+6)}/>)}
            </div>

            {doneCount===tasks.length&&(
              <Card style={{background:`linear-gradient(135deg,${I.tealL},#F0FDF4)`,border:`1.5px solid ${I.teal}`,marginTop:20,textAlign:"center",padding:"20px 16px"}}>
                <div style={{fontSize:36,marginBottom:8}}>🎉</div>
                <div style={{fontWeight:900,fontSize:18,color:I.teal,marginBottom:4}}>Day Complete!</div>
                <div style={{fontSize:13,color:I.mid}}>Every task done. Your body is healing. See you tomorrow.</div>
              </Card>
            )}
          </div>
        </div>
      );

      case "protocol": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>{injury?.label||"Recovery Protocol"}</h1>
          <p style={{fontSize:13,color:I.muted,marginBottom:20}}>{injury?.weeks||12}-week science-backed recovery timeline · Currently Week {weekNum}</p>

          {[
            {phase:"Phase 1",title:"Protection & Healing",   desc:injury?.phase1, color:I.indigo, bg:I.indigoL, active:phase===1},
            {phase:"Phase 2",title:"Strength & Mobility",    desc:injury?.phase2, color:I.teal,   bg:I.tealL,   active:phase===2},
            {phase:"Phase 3",title:"Return to Sport",        desc:injury?.phase3, color:I.orange, bg:"#FFF0E6",  active:phase===3},
          ].map((p,i)=>(
            <div key={i} style={{display:"flex",gap:14,marginBottom:20,opacity:p.active?1:0.55}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:36,height:36,borderRadius:18,background:p.active?p.color:I.border,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
                {i<2&&<div style={{width:2,flex:1,background:I.border,marginTop:4}}/>}
              </div>
              <div style={{flex:1,paddingBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <TagPill color={p.color} bg={p.bg}>{p.phase}</TagPill>
                  {p.active&&<TagPill color={I.teal} bg={I.tealL}>← You are here</TagPill>}
                </div>
                <h3 style={{fontWeight:800,fontSize:15,color:I.dark,margin:"0 0 8px"}}>{p.title}</h3>
                <Card style={{fontSize:13,color:I.mid,lineHeight:1.6,fontWeight:500}}>{p.desc||"Protocol details loading..."}</Card>
              </div>
            </div>
          ))}

          <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:4,marginTop:8}}>Supplement Stack</h2>
          <p style={{fontSize:12,color:I.muted,marginBottom:12}}>Affordable, evidence-backed options.</p>
          {SUPPLEMENTS.map((s,i)=>(
            <Card key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{width:40,height:40,borderRadius:20,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💊</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:13,color:I.dark}}>{s.label} <span style={{color:s.color}}>— {s.dose}</span></div>
                  <div style={{fontSize:11,color:I.mid,marginTop:2,lineHeight:1.4}}>{s.note}</div>
                  <div style={{fontSize:10,fontWeight:700,color:I.teal,marginTop:4}}>{s.cost}</div>
                </div>
              </div>
            </Card>
          ))}

          <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:4,marginTop:20}}>Anti-Inflammatory Diet</h2>
          <p style={{fontSize:12,color:I.muted,marginBottom:12}}>What you eat is the other half of your recovery protocol.</p>
          {DIET_GUIDE.map((d,i)=>(
            <Card key={i} style={{marginBottom:10}}>
              <div style={{fontWeight:800,fontSize:12,color:I.indigo,marginBottom:6}}>{d.category}</div>
              <div style={{fontSize:12,color:I.dark,lineHeight:1.5,marginBottom:4}}><span style={{fontWeight:700}}>✓ Eat: </span>{d.foods}</div>
              <div style={{fontSize:11,color:I.red,lineHeight:1.4}}><span style={{fontWeight:700}}>✗ Avoid: </span>{d.avoid}</div>
            </Card>
          ))}
        </div>
      );

      case "squad": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Recovery Squad</h1>
          <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Athletes recovering alongside you. You're not alone in this.</p>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
            {COMMUNITY_MESSAGES.slice(0,4).map((m,i)=>(
              <div key={i} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:48,height:48,borderRadius:24,background:i%2===0?I.indigoL:I.tealL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`2px solid ${i===0?I.teal:I.border}`}}>{m.sport}</div>
                <div style={{fontSize:10,fontWeight:600,color:I.muted,maxWidth:48,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {COMMUNITY_MESSAGES.map((m,i)=>(
              <Card key={i}>
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{m.sport}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:I.dark}}>{m.name}</div>
                    <div style={{fontSize:10,color:I.muted}}>{m.day>0?`Day ${m.day}`:"Coach"}</div>
                  </div>
                </div>
                <p style={{fontSize:13,color:I.mid,lineHeight:1.5,margin:0,marginBottom:8}}>{m.msg}</p>
                <button style={{fontSize:11,fontWeight:700,color:I.muted,background:"none",border:"none",cursor:"pointer"}}>❤️ {m.likes}</button>
              </Card>
            ))}
          </div>
        </div>
      );

      case "rewards": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Milestones</h1>
          <p style={{fontSize:13,color:I.muted,marginBottom:6}}>Stay consistent. Unlock rewards as you progress.</p>
          <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:16,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6}}>YOUR CURRENT STREAK</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:36}}>🔥</span>
              <div><div style={{fontWeight:900,fontSize:30,color:I.yellow,lineHeight:1}}>{saved.streak}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>days strong</div></div>
            </div>
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Day {dayNum} of {(injury?.weeks||36)*7}</div>
              <ProgressBar pct={pct} color={I.yellow}/>
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {MILESTONES.map((m,i)=>{
              const unlocked = dayNum >= m.day;
              const isNext   = !unlocked && (i===0||dayNum>=MILESTONES[i-1].day);
              const daysLeft = m.day - dayNum;
              return (
                <Card key={i} style={{opacity:(!unlocked&&!isNext)?0.4:1,border:unlocked?`1.5px solid ${I.teal}`:isNext?`1.5px solid ${I.indigo}40`:`1.5px solid ${I.border}`}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:46,height:46,borderRadius:23,background:unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.badge}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <span style={{fontWeight:800,fontSize:14,color:unlocked?I.teal:I.dark}}>{m.title}</span>
                        <TagPill color={unlocked?I.teal:isNext?I.indigo:I.muted} bg={unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9"}>Day {m.day}</TagPill>
                      </div>
                      {unlocked&&<div style={{fontSize:10,fontWeight:800,color:I.teal,marginBottom:4}}>✓ UNLOCKED</div>}
                      {isNext&&<div style={{fontSize:10,fontWeight:800,color:I.indigo,marginBottom:4}}>{daysLeft} day{daysLeft!==1?"s":""} away</div>}
                      <div style={{fontSize:12,color:I.mid,marginBottom:6,lineHeight:1.4}}>{m.reward}</div>
                      <div style={{fontSize:11,fontStyle:"italic",color:I.muted,lineHeight:1.4,borderLeft:`2px solid ${unlocked?I.teal:I.border}`,paddingLeft:8}}>{m.verse}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>{renderTab()}</div>
      <div style={{flexShrink:0,background:"white",boxShadow:"0 -1px 0 rgba(15,23,42,0.08), 0 -4px 12px rgba(15,23,42,0.06)",paddingBottom:"env(safe-area-inset-bottom, 12px)",paddingTop:10,paddingLeft:8,paddingRight:8,display:"flex",justifyContent:"space-around",alignItems:"flex-end",zIndex:50}}>
        <NavBtn icon={<Home size={22}/>}     label="Home"     active={tab==="home"}     onClick={()=>setTab("home")}/>
        <NavBtn icon={<BookOpen size={22}/>} label="Protocol" active={tab==="protocol"} onClick={()=>setTab("protocol")}/>
        <button onClick={()=>setTab("today")} style={{width:58,height:58,borderRadius:29,background:tab==="today"?I.yellow:"#1C1C2E",display:"flex",alignItems:"center",justifyContent:"center",border:"4px solid white",boxShadow:"0 4px 14px rgba(15,23,42,0.25)",cursor:"pointer",marginBottom:6,flexShrink:0}}>
          <Dumbbell size={24} color={tab==="today"?I.dark:"white"}/>
        </button>
        <NavBtn icon={<Users size={22}/>}   label="Squad"   active={tab==="squad"}   onClick={()=>setTab("squad")}/>
        <NavBtn icon={<Trophy size={22}/>}  label="Rewards" active={tab==="rewards"} onClick={()=>setTab("rewards")}/>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App(){
  type Screen = "welcome"|"sport"|"injury"|"severity"|"goal"|"plan"|"dashboard";

  const [saved,    setSaved]    = useState<SavedState|null>(()=>loadState());
  const [screen,   setScreen]   = useState<Screen>(()=>loadState()?"dashboard":"welcome");
  const [sport,    setSport]    = useState<typeof SPORTS[0]|undefined>();
  const [injury,   setInjury]   = useState<typeof INJURIES[0]|undefined>();
  const [severity, setSeverity] = useState<typeof SEVERITIES[0]|undefined>();
  const [goal,     setGoal]     = useState<typeof GOALS[0]|undefined>();

  // Streak logic: runs once on load
  useEffect(()=>{
    const s = loadState();
    if(!s) return;
    const today = todayStr();
    const last  = s.lastActiveDate;
    if(last===today) return; // already opened today

    const diff = daysBetween(last, today);
    let newStreak = s.streak;
    if(diff===1){
      newStreak = s.streak + 1; // consecutive day
    } else if(diff>1){
      newStreak = 1; // streak broken
    }
    const updated = {...s, lastActiveDate:today, streak:newStreak};
    saveState(updated);
    setSaved(updated);
  }, []);

  const handlePlanDone = ()=>{
    if(!sport||!injury||!severity||!goal) return;
    const today = todayStr();
    const newState: SavedState = {
      sportId:    sport.id,
      injuryId:   injury.id,
      severityId: severity.id,
      goalId:     goal.id,
      startDate:  today,
      lastActiveDate: today,
      streak:     1,
      completedTasks: {},
      unlockedMilestones: [],
    };
    saveState(newState);
    setSaved(newState);
    setScreen("dashboard");
  };

  const handleReset = ()=>{
    clearState();
    setSaved(null);
    setSport(undefined);
    setInjury(undefined);
    setSeverity(undefined);
    setGoal(undefined);
    setScreen("welcome");
  };

  return (
    <div style={{width:"100%",height:"100dvh",maxWidth:430,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",boxShadow:"0 0 40px rgba(15,23,42,0.15)"}}>
      {screen==="welcome"   && <div style={{flex:1,overflowY:"auto"}}><Welcome onNext={()=>setScreen("sport")}/></div>}
      {screen==="sport"     && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SportSelect    onNext={s=>{setSport(s);    setScreen("injury");}}/></div>}
      {screen==="injury"    && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><InjurySelect   onNext={i=>{setInjury(i);   setScreen("severity");}}/></div>}
      {screen==="severity"  && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SeveritySelect onNext={sv=>{setSeverity(sv);setScreen("goal");}}/></div>}
      {screen==="goal"      && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><GoalSelect     onNext={g=>{setGoal(g);     setScreen("plan");}}/></div>}
      {screen==="plan"      && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><PlanSelect     onNext={handlePlanDone}/></div>}
      {screen==="dashboard" && saved && <AppDashboard saved={saved} onReset={handleReset}/>}
    </div>
  );
}
import { useState, useEffect, useCallback, ReactNode } from "react";
import { Check, X, ChevronRight, Trophy, Users, Home, BookOpen, Dumbbell, Flame, RotateCcw, Heart, MessageCircle, Send, Crown } from "lucide-react";

const I = {
  indigo:"#6366F1", indigoL:"#EDE9FE", indigoT:"#6D28D9",
  teal:"#10B981",   tealL:"#D1FAE5",
  yellow:"#E8FF47", yellowD:"#EAB308",
  red:"#EF4444",    orange:"#F97316",
  sky:"#0EA5E9",    purple:"#A855F7",
  amber:"#F59E0B",  pink:"#EC4899",
  dark:"#0F172A",   mid:"#334155",   muted:"#64748B", subtle:"#94A3B8",
  bg:"#EBF5FD",     card:"#FFFFFF",  border:"#E2E8F0",
  green:"#16A34A",
};

// ── STORAGE ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "comeback_v2";
interface Avatar { gender:"male"|"female"|"nonbinary"; skinTone:string; hairColor:string; hairStyle:string; bodyType:string; }
interface BodyProfile { height:string; weight:string; gender:string; goal:string; }
interface Post { id:string; author:string; msg:string; likes:number; likedByMe:boolean; replies:{author:string;msg:string}[]; }
interface SavedState {
  sportId:string; injuryId:string; severityId:string; goalId:string;
  startDate:string; lastActiveDate:string; streak:number; streakAlive:boolean;
  completedTasks:Record<string,boolean[]>;
  suppChecked:Record<string,boolean[]>;
  unlockedMilestones:number[];
  plan:"free"|"pro"|"elite";
  trialStartDate:string;
  avatar:Avatar|null;
  bodyProfile:BodyProfile|null;
  posts:Record<string,Post[]>;
}
function todayStr(){ return new Date().toISOString().slice(0,10); }
function daysBetween(a:string,b:string){ return Math.floor((new Date(b).getTime()-new Date(a).getTime())/86400000); }
function loadState():SavedState|null{ try{ const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):null; }catch{return null;} }
function saveState(s:SavedState){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(s)); }catch{} }
function clearState(){ try{ localStorage.removeItem(STORAGE_KEY); }catch{} }

// ── SPORTS ────────────────────────────────────────────────────────────────────
const SPORTS = [
  {id:"basketball",label:"Basketball",icon:"🏀",color:I.orange,athlete:"LeBron James",liveUsers:2847,
   img:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
   quotes:['"Ice 20 min, elevate, then compress. Don\'t rush the timeline."','"Sleep is my best recovery tool. 12 hours a night during heavy training."','"Ice baths changed my career longevity. 10 min at 55°F post-game."','"30g protein within 20 min of stopping. That window is real."','"The hardest day is day 3. Push through it. That\'s where most people quit."']},
  {id:"football",label:"Football",icon:"🏈",color:I.green,athlete:"Patrick Mahomes",liveUsers:3124,
   img:"https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&q=80",
   quotes:['"Work range of motion before you add resistance."','"Visualization during recovery is underrated. I mentally rehearsed plays every day."','"Cold tub is non-negotiable. 8 minutes. Every single session."','"Your PT is your co-coach. Listen to them like you\'d listen to Andy Reid."','"Fear of re-injury is the real enemy."']},
  {id:"soccer",label:"Soccer",icon:"⚽",color:I.sky,athlete:"Cristiano Ronaldo",liveUsers:4521,
   img:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80",
   quotes:['"Cold water immersion after every session. Consistency beats intensity."','"I spend more on recovery than most players earn. It\'s my career."','"Sleep 8 hours minimum. Recovery happens when you\'re unconscious."','"Nutrition is 50% of recovery. I eliminated alcohol at 25."','"Flexibility saved my knees. 30 min mobility before every session."']},
  {id:"baseball",label:"Baseball",icon:"⚾",color:I.red,athlete:"Shohei Ohtani",liveUsers:1893,
   img:"https://images.unsplash.com/photo-1508344928928-7165b67de128?w=400&q=80",
   quotes:['"Rotator cuff work is never optional."','"Arm care starts before you feel pain."','"I track HRV. If it\'s low, I adjust the day\'s load."','"Cross-training in the pool saved my shoulder."','"Recovery is just another form of training."']},
  {id:"tennis",label:"Tennis",icon:"🎾",color:"#65A30D",athlete:"Serena Williams",liveUsers:1456,
   img:"https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80",
   quotes:['"Listen to inflammation signals. I pushed through pain twice and paid."','"Mental game breaks down first in long recoveries."','"Eccentric strengthening for tendons — slow, controlled, painful in the right way."','"I cried every early PT session. That\'s okay. Cry then do the work."','"Work with a sports dietitian."']},
  {id:"track",label:"Track & Field",icon:"🏃",color:I.purple,athlete:"Usain Bolt",liveUsers:987,
   img:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80",
   quotes:['"Hip flexor mobility is the unlock."','"The body remembers what you build. Start building again."','"Speed is neurological as much as muscular."','"God didn\'t give you these legs to sit."','"Water running kept my fitness while my leg healed."']},
  {id:"swimming",label:"Swimming",icon:"🏊",color:I.sky,athlete:"Michael Phelps",liveUsers:743,
   img:"https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80",
   quotes:['"Shoulder recovery is 60% sleep."','"Depression during recovery is real. Get a therapist, not just a PT."','"Recovery is a race too. I treated rehab with training intensity."','"Show up every day, even if you can only do 20%."','"Gratitude practice kept me from spiraling."']},
  {id:"volleyball",label:"Volleyball",icon:"🏐",color:I.amber,athlete:"Misty May-Treanor",liveUsers:621,
   img:"https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80",
   quotes:['"Single-leg balance work from day 3."','"Smart is smarter than tough."','"Core stability is the foundation. Rebuild it before touching the ball."','"My comeback was powered by protocol and prayer."','"Track your swelling daily."']},
  {id:"golf",label:"Golf",icon:"⛳",color:I.green,athlete:"Tiger Woods",liveUsers:1102,
   img:"https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80",
   quotes:['"Core is everything. Deep stabilizers, not surface muscles."','"Never skip the small work."','"Patience is a skill, not a personality trait."','"What you rebuild is more valuable than what you started with."','"Ego in the weight room will re-injure you."']},
  {id:"mma",label:"MMA / Combat",icon:"🥊",color:I.red,athlete:"Conor McGregor",liveUsers:2341,
   img:"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80",
   quotes:['"Fascia work daily. It separates a 6-month timeline from 4."','"They said my career was over. I used that as fuel every day."','"Ice, elevation, and time. The shortcut IS the protocol."','"Isolation kills motivation."','"Every champion has a comeback story."']},
  {id:"gymnastics",label:"Gymnastics",icon:"🤸",color:I.pink,athlete:"Simone Biles",liveUsers:834,
   img:"https://images.unsplash.com/photo-1577474994498-5d7693a5c9d9?w=400&q=80",
   quotes:['"Mental recovery is as real as physical."','"Taking time off to heal was the bravest decision I\'ve made."','"Trust your body\'s timeline, not anyone else\'s pressure."','"Fear during recovery is just another skill to master."','"The body will catch up to where the mind went."']},
  {id:"cycling",label:"Cycling",icon:"🚴",color:I.indigo,athlete:"Chris Froome",liveUsers:567,
   img:"https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&q=80",
   quotes:['"Rebuild cadence before power."','"Doctors said I\'d never race again. I won Stage 8 at Vuelta."','"Small wins compound. Celebrate each one."','"My physio was more important than my coach."','"I cried at the top of the first climb back. Let yourself feel it."']},
  {id:"hockey",label:"Hockey",icon:"🏒",color:I.mid,athlete:"Sidney Crosby",liveUsers:1678,
   img:"https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=400&q=80",
   quotes:['"Concussion protocol is sacred."','"Cognitive rest is a skill. Your brain needs quiet."','"Sleep became medicine. 10 hours, dark room, no devices."','"A good team respects your recovery."','"Fear of another concussion is real by phase 3."']},
  {id:"rugby",label:"Rugby",icon:"🏉",color:I.amber,athlete:"Richie McCaw",liveUsers:892,
   img:"https://images.unsplash.com/photo-1603575448360-153f093fd0b2?w=400&q=80",
   quotes:['"Proprioception drills — do them religiously."','"Sometimes playing through it is wrong."','"Week 3 is the mental valley. Push hardest then."','"Listen to your doctor, not your captain instinct."','"Cold water tubs changed my recovery rate."']},
  {id:"lacrosse",label:"Lacrosse",icon:"🥍",color:"#92400E",athlete:"Paul Rabil",liveUsers:423,
   img:"https://images.unsplash.com/photo-1626248801379-51a0748a5f96?w=400&q=80",
   quotes:['"Eccentric loading is the cheat code for tendon recovery."','"I tore my ACL twice. Second time came back 3 weeks early."','"Fix the root cause, not the symptom."','"Faith over fear."','"Every drill served my sport-specific return."']},
];

const INJURIES = [
  {id:"acl",label:"ACL Tear",icon:"🦵",weeks:36,phase1:"Weeks 1–6: Swelling control, quad activation, ROM 0–90°. Ice 20 min/hr. Goal: full extension.",phase2:"Weeks 7–16: Strength rebuild, single-leg press, bike, Nordic curls wk 10.",phase3:"Weeks 17–36: Sport-specific drills, return-to-play testing (hop test >85%)."},
  {id:"meniscus",label:"Meniscus Tear",icon:"🦵",weeks:24,phase1:"Weeks 1–4: Crutches, ice, pain mgmt. Straight-leg raises. No flexion past 90°.",phase2:"Weeks 5–12: Quad/hamstring balance, bike wk 6, swimming wk 6. No twisting.",phase3:"Weeks 13–24: Lateral movement, cutting drills, physician clearance."},
  {id:"ankle",label:"Ankle Sprain",icon:"🦶",weeks:8,phase1:"Days 1–7: POLICE protocol. No weight-bearing Grade 2+.",phase2:"Weeks 2–4: Proprioception, resistance bands, calf raises.",phase3:"Weeks 5–8: Plyometrics, single-leg balance >30s."},
  {id:"hamstring",label:"Hamstring Strain",icon:"🦵",weeks:12,phase1:"Weeks 1–2: Active rest, ice. NO passive static stretching (re-tear risk).",phase2:"Weeks 3–6: Nordic eccentric program (Askling protocol), bike wk 3.",phase3:"Weeks 7–12: Graduated sprint 60→100% with weekly H-test."},
  {id:"rotator",label:"Rotator Cuff",icon:"💪",weeks:20,phase1:"Weeks 1–6: Sling, pendulums, zero active elevation. Cryo 20 min 5×/day.",phase2:"Weeks 7–14: Bands, scapular stability. ER/IR at 0°.",phase3:"Weeks 15–20: Progressive overhead, throwing program. ASES ≥85."},
  {id:"achilles",label:"Achilles Tendon",icon:"🦶",weeks:26,phase1:"Weeks 1–8: Boot immobilization. Upper body only.",phase2:"Weeks 9–18: Alfredson eccentric heel drops 3×15 twice daily (Grade A).",phase3:"Weeks 19–26: Walk→jog→run→sprint. VISA-A ≥90."},
  {id:"concussion",label:"Concussion",icon:"🧠",weeks:6,phase1:"Days 1–5: Full cognitive + physical rest. No screens. Symptom check q2h.",phase2:"Weeks 2–4: Sub-symptom aerobic only. Buffalo Treadmill Test.",phase3:"Weeks 5–6: Non-contact sport drills. SCAT5 + physician sign-off."},
  {id:"back",label:"Lower Back Strain",icon:"🔙",weeks:8,phase1:"Weeks 1–2: McKenzie extension. Cat-cow, bird-dog, decompression walks.",phase2:"Weeks 3–5: McGill Big 3, dead bug, hip hinge patterning.",phase3:"Weeks 6–8: Deadlift BW, RDL, core loading."},
  {id:"shin",label:"Shin Splints",icon:"🦵",weeks:6,phase1:"Days 1–10: Rest, ice massage 3×/day, calf stretching.",phase2:"Weeks 2–4: Swim, bike, calf strengthening. Arch check.",phase3:"Weeks 5–6: Walk-run intervals, gait analysis, 10% rule."},
  {id:"shoulder",label:"Shoulder Dislocation",icon:"💪",weeks:12,phase1:"Weeks 1–4: Sling. No elevation >90°. Cryo + NSAIDs.",phase2:"Weeks 5–8: Band ER/IR, scapular stabilization, isometrics.",phase3:"Weeks 9–12: Overhead cleared. Apprehension test negative."},
  {id:"knee",label:"Knee Pain (General)",icon:"🦵",weeks:10,phase1:"Weeks 1–2: RICE, quad sets, avoid stairs. Inflammation control.",phase2:"Weeks 3–6: Bike, step-ups, mini-squats 0–45°.",phase3:"Weeks 7–10: Progressive load, sport-specific movement."},
  {id:"wrist",label:"Wrist Fracture",icon:"🖐",weeks:16,phase1:"Weeks 1–6: Cast. Bone nutrition: Ca, D3, K2.",phase2:"Weeks 7–12: ROM, grip putty, low-resistance curls.",phase3:"Weeks 13–16: Progressive load, sport grip patterns."},
];

const SEVERITIES = [
  {id:"mild",label:"Mild",icon:"🟡",desc:"Minor discomfort, partial activity possible",color:"#854D0E",bg:"#FEF9C3"},
  {id:"moderate",label:"Moderate",icon:"🟠",desc:"Significant pain, limited activity",color:"#9A3412",bg:"#FFEDD5"},
  {id:"severe",label:"Severe",icon:"🔴",desc:"Major injury, minimal activity",color:"#991B1B",bg:"#FEE2E2"},
  {id:"post_surgery",label:"Post-Surgery",icon:"🏥",desc:"Surgical recovery, strict protocol",color:"#1E3A5F",bg:"#DBEAFE"},
];

const GOALS_LIST = [
  {id:"return",label:"Return to Sport",icon:"🏆",desc:"Full competitive return"},
  {id:"pain",label:"Pain-Free Living",icon:"💆",desc:"Manage pain, improve daily function"},
  {id:"fitness",label:"Maintain Fitness",icon:"💪",desc:"Stay strong while healing"},
  {id:"fast",label:"Fastest Recovery",icon:"⚡",desc:"Optimise every variable"},
];

// ── PLANS ─────────────────────────────────────────────────────────────────────
const PLAN_PRO_URL  = "https://buy.stripe.com/5kQ3cu5P36NtcWh1ZC67S00";
const PLAN_ELITE_URL= "https://buy.stripe.com/dRm9AS91ffjZbSd1ZC67S01";

// ── SUPPLEMENTS (spread through day) ─────────────────────────────────────────
const SUPPLEMENTS = [
  {id:"d3",   label:"Vitamin D3",    dose:"2,000 IU",  time:"7:00 AM",  with:"breakfast",  note:"Bone & immune support. Take with a fatty meal for best absorption.", color:I.amber,  bg:"#FFF7ED"},
  {id:"omega3",label:"Omega-3",      dose:"1g EPA+DHA", time:"8:00 AM",  with:"breakfast",  note:"Reduces inflammation 25–40%. Take with food to avoid fish burps.",   color:I.sky,    bg:"#E0F2FE"},
  {id:"vitc",  label:"Vitamin C",    dose:"500mg",      time:"10:00 AM", with:"snack",      note:"Collagen synthesis for tendons. Pairs with collagen peptides.",       color:I.orange, bg:"#FFF0E6"},
  {id:"collagen",label:"Collagen",   dose:"10g",        time:"10:00 AM", with:"pre-rehab",  note:"Take 30 min before rehab session + Vitamin C for max tendon benefit.",color:I.pink,   bg:"#FDF2F8"},
  {id:"zinc",  label:"Zinc",         dose:"15mg",       time:"1:00 PM",  with:"lunch",      note:"Tissue repair & immune. Take with food — causes nausea on empty stomach.",color:I.teal, bg:I.tealL},
  {id:"mag",   label:"Magnesium",    dose:"400mg",      time:"9:00 PM",  with:"dinner",     note:"Take at night — aids sleep quality and muscle relaxation.",           color:I.purple, bg:"#F5F3FF"},
];

// ── DIET GUIDE ────────────────────────────────────────────────────────────────
const DIET_GUIDE = [
  {category:"🐟 Protein (Every Meal)",    foods:"Salmon, sardines, eggs, chicken, Greek yogurt, lentils",         avoid:"Processed deli meats, fried proteins"},
  {category:"🥦 Anti-Inflammatory",       foods:"Turmeric, ginger, leafy greens, berries, tart cherry, olive oil", avoid:"Refined sugar, white bread, vegetable oils"},
  {category:"🦴 Bone & Tendon",           foods:"Dairy or fortified alt, bone broth, leafy greens, fatty fish",    avoid:"Excess alcohol, high-sodium foods"},
  {category:"⚡ Energy (Pre-Workout)",    foods:"Sweet potato, oats, banana, dates",                               avoid:"Simple sugars, alcohol (delays recovery 48hrs+)"},
  {category:"💧 Hydration",               foods:"3–4L water/day, electrolytes if sweating, coconut water",         avoid:"Sports drinks with HFCS, energy drinks"},
];

// ── MACROS CALCULATOR ─────────────────────────────────────────────────────────
function calcMacros(height:string, weight:string, gender:string, goal:string){
  const h = parseFloat(height); // cm
  const w = parseFloat(weight); // kg
  if(!h||!w) return null;
  // Mifflin-St Jeor BMR
  const bmr = gender==="female" ? (10*w)+(6.25*h)-(5*25)-161 : (10*w)+(6.25*h)-(5*25)+5;
  const tdee = bmr * 1.375; // light activity during recovery
  let calories = tdee;
  let proteinG = w * 2.0; // 2g/kg for injury recovery (elevated)
  let fatG = (calories*0.25)/9;
  let carbG = (calories - (proteinG*4) - (fatG*9))/4;

  if(goal==="fast"){ calories=tdee+100; proteinG=w*2.2; }
  if(goal==="fitness"){ proteinG=w*1.8; }
  if(goal==="pain"){ calories=tdee-100; proteinG=w*1.6; fatG=(calories*0.30)/9; carbG=(calories-(proteinG*4)-(fatG*9))/4; }

  return {
    calories: Math.round(calories),
    protein:  Math.round(proteinG),
    carbs:    Math.round(Math.max(carbG,50)),
    fat:      Math.round(fatG),
  };
}

// ── DAILY TASKS ───────────────────────────────────────────────────────────────
type Task={time:string;task:string;icon:string;iconColor:string;iconBg:string};

// 7 rotating day protocols so each day feels different
const DAY_PROTOCOLS: Task[][] = [
  // Day variant 0
  [
    {time:"6:30 AM",task:"Wake & hydrate — 500ml water with a pinch of sea salt (electrolytes) before anything else",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"5-min deep breathing (4-7-8 method) + gentle mobility — loosen up the injured area slowly",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + morning supplements: D3 2,000 IU + Omega-3 1g with food",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Rehab session A — injury-specific exercises (3 sets). Focus on controlled movement, no pain.",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Vitamin C 500mg + Collagen 10g immediately after rehab — collagen synthesis window",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: 40g+ protein (salmon/chicken) + complex carbs + leafy greens. Zinc 15mg with meal.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:00 PM",task:"Ice/compression 20 min on injury site + elevation above heart — reduces inflammation",icon:"🧊",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:00 PM",task:"Low-impact cardio: 20 min stationary bike or pool walk — maintain base fitness",icon:"🚴",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: 40g protein + anti-inflammatory fats (olive oil, avocado). Magnesium 400mg.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"10-min foam roll (avoid injured area) + stretching + sleep target 9 hours",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 1
  [
    {time:"6:30 AM",task:"Morning hydration — 500ml water. Check in with how the injury feels on a 1–10 pain scale.",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"10-min dynamic warm-up: leg swings, arm circles, hip circles — activate without loading",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + D3 2,000 IU + Omega-3 1g — take with fat-containing meal for absorption",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Rehab session B — add one more rep or 5% more resistance than last session. Progressive.",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen 10g + Vitamin C 500mg post-session — 30 min window for tendon synthesis",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: 40g protein + sweet potato + spinach salad. Zinc 15mg with meal.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:30 PM",task:"Ice massage (frozen cup) on injury 10 min — reduces localized inflammation better than ice pack",icon:"🧊",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:00 PM",task:"Upper body strength (non-injured): 3×15 rows, press, curls — maintain muscle mass",icon:"💪",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: salmon or sardines + quinoa + broccoli. Magnesium 400mg before bed.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:30 PM",task:"Visualization: 5 min eyes closed, picture yourself fully recovered competing. Then sleep.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 2
  [
    {time:"6:30 AM",task:"Hydrate 500ml + tart cherry juice 8oz (natural anti-inflammatory, reduces DOMS 22%)",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"Contrast shower: 2 min warm → 30 sec cold × 4 cycles — boosts circulation and recovery",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + D3 + Omega-3. High-protein breakfast today: 3 eggs + Greek yogurt.",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Active recovery day — gentler rehab: 50% intensity, focus on range of motion not load",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen 10g + Vitamin C 500mg post-session",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: 40g protein. Anti-inflammatory focus: turmeric in meal, olive oil dressing.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:00 PM",task:"Pool session 20 min OR ice bath 10 min at 55°F if available — elite recovery method",icon:"🏊",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:30 PM",task:"Core stability work: dead bug 3×10, pallof press 3×12, bird-dog 3×10 each side",icon:"💪",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: chicken/tofu + lentils + vegetables. Magnesium 400mg.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"Gratitude journal: write 3 things you CAN do today. Sleep 9 hours.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 3
  [
    {time:"6:30 AM",task:"500ml water + check injury swelling vs yesterday (photograph weekly for tracking)",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"10-min yoga flow for recovery — hip flexors, hamstrings, shoulders, spine",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast: oatmeal + protein powder + berries. D3 + Omega-3 with meal.",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Rehab session C — neuromuscular focus: balance drills, proprioception training",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen + Vitamin C immediately post-session",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: 35–40g protein. Zinc 15mg. Add ginger to meal (anti-inflammatory compound gingerol).",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"3:00 PM",task:"NormaTec or compression sleeve 30 min (or legs-up-the-wall 20 min) — reduce edema",icon:"🧊",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:30 PM",task:"Mental skills session: sport psychology video OR journaling recovery goals and progress",icon:"🧠",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: fatty fish or lean beef + sweet potato + greens. Magnesium 400mg.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"No screens 1 hr before sleep. Read or meditate. 9-hr sleep target.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 4
  [
    {time:"6:30 AM",task:"Hydrate 500ml + 5-min walking (even crutch-assisted) — gentle circulation boost",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"Morning body check: rate pain (1–10), stiffness, energy. Adjust today's intensity if >5.",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + D3 + Omega-3. High-calorie day if energy is low — don't under-eat during recovery.",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Rehab session D — eccentric focus: slow lowering phase, 3-second count down",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen 10g + Vitamin C 500mg — tendon synthesis window",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:30 PM",task:"Lunch: eggs + whole grains + leafy greens. Zinc 15mg with meal.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:30 PM",task:"20-min stationary bike at easy pace. Pedaling helps lubricate joints without impact.",icon:"🚴",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:00 PM",task:"Stretch + foam roll: 10 min full body avoiding injured site. Quads, glutes, calves.",icon:"💪",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: Greek yogurt + nuts + fruit parfait OR full protein meal. Magnesium 400mg.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"Sleep hygiene: cool room (65–68°F), dark, no phone. 9-hr recovery window.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 5
  [
    {time:"6:30 AM",task:"500ml water + electrolyte tablet if yesterday was a heavy sweat day",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"10 min mindfulness meditation — reduces cortisol which slows tissue healing",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + supplements: D3 + Omega-3. High-protein start: protein shake + eggs.",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Heavy rehab day — push to 80% effort if pain allows. Log reps and resistance used.",icon:"🏋️",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen + Vitamin C immediately. Protein shake within 20 min post-session.",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: 50g+ protein day. Salmon + rice + avocado. Zinc 15mg.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:00 PM",task:"Ice bath or contrast therapy post heavy session. 10 min at 55°F.",icon:"🧊",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"5:00 PM",task:"Review progress: compare this week's exercises to last week. Are you stronger?",icon:"📊",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: lean protein + complex carbs + vegetables. Magnesium 400mg.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"Call or text someone on your support team. Recovery is social. Then sleep.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
  // Day variant 6
  [
    {time:"6:30 AM",task:"Active recovery Sunday: 500ml water + light 10-min walk outside if possible",icon:"💧",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"7:00 AM",task:"Gentle stretch: 20-min full body. Hold each stretch 30–45 seconds. Breathe deeply.",icon:"🌅",iconColor:I.amber,iconBg:"#FFF7ED"},
    {time:"8:00 AM",task:"Breakfast + D3 + Omega-3. Rest day nutrition: still hit protein target, slight calorie reduce.",icon:"💊",iconColor:I.indigo,iconBg:I.indigoL},
    {time:"10:00 AM",task:"Weekly check-in: measure range of motion, note pain levels, log in journal",icon:"📋",iconColor:I.orange,iconBg:"#FFF0E6"},
    {time:"10:30 AM",task:"Collagen + Vitamin C — even on rest days, tendon building continues",icon:"💊",iconColor:I.pink,iconBg:"#FDF2F8"},
    {time:"12:00 PM",task:"Lunch: balanced plate — protein + fat + fiber. Zinc 15mg.",icon:"🥗",iconColor:I.green,iconBg:"#F0FDF4"},
    {time:"2:00 PM",task:"Rest and mental recovery — watch film of your sport, stay connected to the game",icon:"🎬",iconColor:I.sky,iconBg:"#E0F2FE"},
    {time:"4:00 PM",task:"Light pool session 15 min OR gentle yoga — active recovery, not passive rest",icon:"🏊",iconColor:I.purple,iconBg:"#F5F3FF"},
    {time:"7:00 PM",task:"Dinner: meal prep for the week ahead. Magnesium 400mg. Prioritize sleep.",icon:"🍽️",iconColor:I.teal,iconBg:I.tealL},
    {time:"9:00 PM",task:"Plan next week's rehab goals. Write them down. Sleep 9+ hours — biggest recovery day.",icon:"😴",iconColor:I.mid,iconBg:"#F1F5F9"},
  ],
];

// ── DAILY CONTENT ─────────────────────────────────────────────────────────────
const DAILY_CONTENT = [
  {type:"verse",   quote:"I can do all things through Christ who strengthens me.",text:"Philippians 4:13"},
  {type:"verse",   quote:"Be strong and courageous. Do not be afraid.",text:"Joshua 1:9"},
  {type:"motivation",quote:"Champions are made in the moments they want to quit.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"Those who hope in the Lord will renew their strength.",text:"Isaiah 40:31"},
  {type:"motivation",quote:"Every day you show up is a day closer to comeback.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"For I know the plans I have for you — plans to prosper you.",text:"Jeremiah 29:11"},
  {type:"motivation",quote:"The comeback is always stronger than the setback.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"He gives strength to the weary, power to the faint.",text:"Isaiah 40:29"},
  {type:"motivation",quote:"Discipline is doing it when you don't feel like it.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"Do not grow weary in doing good — at the proper time you will reap.",text:"Galatians 6:9"},
  {type:"motivation",quote:"Your only competition is who you were yesterday.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"Consider it joy when you face trials — testing produces perseverance.",text:"James 1:2-3"},
  {type:"motivation",quote:"Small progress is still progress. Keep going.",text:"Recovery Wisdom"},
  {type:"verse",   quote:"Well done, good and faithful servant.",text:"Matthew 25:23"},
];

const MILESTONES = [
  {day:1,  badge:"🌱",title:"Day One",    reward:"You started. That's the hardest step.",verse:"\"Be strong and courageous.\" — Joshua 1:9"},
  {day:3,  badge:"🔥",title:"3 Days",     reward:"Resilience Badge unlocked.",verse:"\"I can do all things through Christ.\" — Phil 4:13"},
  {day:7,  badge:"⚡",title:"One Week",   reward:"Streak Shield + weekly report.",verse:"\"Endurance produces character.\" — Romans 5:4"},
  {day:14, badge:"💪",title:"Two Weeks",  reward:"Warrior Badge + nutrition guide.",verse:"\"Press on toward the goal.\" — Philippians 3:14"},
  {day:21, badge:"🏅",title:"21 Days",    reward:"Habit formed. Custom protocol unlocked.",verse:"\"Do not grow weary.\" — Galatians 6:9"},
  {day:30, badge:"🏆",title:"30 Days",    reward:"Champion Badge.",verse:"\"They will soar on wings like eagles.\" — Isaiah 40:31"},
  {day:60, badge:"🦅",title:"60 Days",    reward:"Eagle Badge + supplement guide.",verse:"\"He gives strength to the weary.\" — Isaiah 40:29"},
  {day:90, badge:"👑",title:"90 Days",    reward:"Legend Trophy + return-to-sport checklist.",verse:"\"Well done, good and faithful servant.\" — Matthew 25:23"},
];

// ── AVATAR DATA ───────────────────────────────────────────────────────────────
const SKIN_TONES = ["#FDDBB4","#F5C89A","#D4956A","#A0614A","#6B3A2A","#3B1F1A"];
const HAIR_COLORS = ["#1a1a1a","#4a2c0a","#8B4513","#D2691E","#FFD700","#E6B0AA","#AED6F1","#A9A9A9","#FFFFFF"];
const HAIR_STYLES = ["Short","Curly","Long","Braids","Bun","Fade","Natural","Ponytail"];
const BODY_TYPES  = ["Slim","Athletic","Average","Muscular","Curvy"];
const GENDERS     = ["Male","Female","Non-binary"];

const AVATAR_QUOTES: Record<string,string[]> = {
  streak: [
    "You showed up again. That's 🔥 — your body is healing faster than you think.",
    "Day after day. That consistency is exactly what separates good recoveries from great ones.",
    "Your streak tells me everything I need to know — you're a competitor, even in rehab.",
    "I've trained champions. The ones who show up daily? They always come back stronger.",
    "Keep this streak going. Your tissue is literally rebuilding right now because of YOUR consistency.",
  ],
  goal: [
    "Goal complete! Your body felt that. Recovery science says consistent completion = faster healing.",
    "All tasks done today. As your trainer I'm proud — this is elite-level discipline.",
    "Perfect day. Protein timing, ice protocol, everything. You're doing this right.",
    "Full completion! Studies show patients who hit daily protocols recover 30% faster. You're that patient.",
    "That's how champions train. Every. Single. Task. Well done.",
  ],
  miss: [
    "Hey, missed tasks today. That's okay — but let's talk about what got in the way so we fix it tomorrow.",
    "Recovery isn't linear. But missing tasks slows the timeline. Let's get back on track tomorrow.",
    "I need you to show up tomorrow. Your injury is counting on your consistency.",
    "One miss doesn't define your recovery. But patterns do. Back at it tomorrow — I'll be here.",
  ],
  morning: [
    "Good morning, athlete. Today is another rep toward your comeback. Let's go.",
    "Rise up. Your competition is training right now. Your comeback starts with today's protocol.",
    "New day. New chance to heal. What we do today matters for who you are in 6 weeks.",
    "Morning! Remember why you started. That reason is bigger than today's discomfort.",
  ],
};

// ── COMMUNITY SEED POSTS ──────────────────────────────────────────────────────
function seedPosts(sportId:string): Post[] {
  const seeds: Record<string,Post[]> = {
    basketball: [
      {id:"b1",author:"Marcus T.",msg:"Day 47 post-ACL. Hit 90° ROM today. Nordic curls protocol is legit.",likes:24,likedByMe:false,replies:[{author:"Darius K.",msg:"Keep pushing! Day 82 here — you'll be jumping again soon."},{author:"Tina M.",msg:"How long until you could walk without a limp?"}]},
      {id:"b2",author:"DeShawn W.",msg:"134 days out. Just dropped 40pts in first game back. Your comeback is coming 🙏",likes:201,likedByMe:false,replies:[{author:"Marcus T.",msg:"This just made my week. Thank you."},{author:"Coach Rivera",msg:"This is why we do the work."}]},
      {id:"b3",author:"Coach Rivera",msg:"Reminder: recovery pace is not weakness. It IS the strategy.",likes:89,likedByMe:false,replies:[]},
    ],
    football: [
      {id:"f1",author:"Jake M.",msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol.",likes:67,likedByMe:false,replies:[{author:"Kyle R.",msg:"Bro this is everything. How was your mental?"},{author:"Jake M.",msg:"Honestly the mental was harder than physical. Week 3 was rough."}]},
      {id:"f2",author:"Tyler B.",msg:"Post-surgery day 14. The daily schedule is keeping me sane.",likes:31,likedByMe:false,replies:[]},
    ],
    soccer: [
      {id:"s1",author:"Priya R.",msg:"Week 3 hamstring. Pool running is saving my cardio base.",likes:18,likedByMe:false,replies:[{author:"Ana S.",msg:"Same! I did pool running for 3 weeks. Worth every boring lap."}]},
      {id:"s2",author:"Jordan K.",msg:"First training session back today. 10 months from ACL. Cried on the pitch. 💚",likes:145,likedByMe:false,replies:[{author:"Priya R.",msg:"Tears of joy deserved."},{author:"Mia L.",msg:"This gives me so much hope."}]},
    ],
  };
  return seeds[sportId] || [
    {id:"g1",author:"Recovery Community",msg:`Welcome to the ${sportId} recovery squad! Introduce yourself below 👋`,likes:0,likedByMe:false,replies:[]},
  ];
}

// ── UI COMPONENTS ─────────────────────────────────────────────────────────────
function Card({children,style={}}:{children:ReactNode,style?:React.CSSProperties}){
  return <div style={{background:"white",borderRadius:16,padding:"14px 16px",boxShadow:"0 2px 8px rgba(15,23,42,0.06)",border:`1px solid ${I.border}`,...style}}>{children}</div>;
}
function TagPill({children,color,bg}:{children:ReactNode,color:string,bg:string}){
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,color,background:bg,borderRadius:20,padding:"3px 10px"}}>{children}</span>;
}
function PrimaryBtn({children,onClick,style={}}:{children:ReactNode,onClick?:()=>void,style?:React.CSSProperties}){
  return <button onClick={onClick} style={{width:"100%",padding:"15px",borderRadius:14,background:I.indigo,color:"white",fontWeight:800,fontSize:16,border:"none",cursor:"pointer",boxShadow:`0 4px 14px ${I.indigo}40`,...style}}>{children}</button>;
}
function GhostBtn({children,onClick}:{children:ReactNode,onClick?:()=>void}){
  return <button onClick={onClick} style={{width:"100%",padding:"13px",borderRadius:14,background:"transparent",color:I.mid,fontWeight:700,fontSize:14,border:`1.5px solid ${I.border}`,cursor:"pointer"}}>{children}</button>;
}
function Logo({size=28}:{size?:number}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:size+8,height:size+8,borderRadius:(size+8)/2,background:I.dark,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width={size*0.65} height={size*0.65} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="9" width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="18" y="9" width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="5" y="11" width="14" height="2" rx="1" fill="white"/>
          <rect x="8" y="7" width="3" height="10" rx="1.5" fill="white"/>
          <rect x="13" y="7" width="3" height="10" rx="1.5" fill="white"/>
        </svg>
      </div>
      <div>
        <div style={{fontWeight:900,fontSize:size*0.75,color:I.dark,lineHeight:1,letterSpacing:"-0.5px"}}>Comeback</div>
        <div style={{fontWeight:600,fontSize:size*0.38,color:I.muted,lineHeight:1,letterSpacing:"1px",textTransform:"uppercase",marginTop:1}}>Sports Recovery</div>
      </div>
    </div>
  );
}
function ProgressBar({pct,color=I.indigo}:{pct:number,color?:string}){
  return <div style={{height:6,background:I.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:color,borderRadius:3,transition:"width 0.4s"}}/></div>;
}
function StepBar({total,current}:{total:number,current:number}){
  return <div style={{display:"flex",gap:4,marginBottom:20}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<current?I.indigo:I.border}}/>)}</div>;
}

// ── STREAK FIRE ───────────────────────────────────────────────────────────────
function StreakFire({streak,alive}:{streak:number,alive:boolean}){
  const size = alive ? Math.min(20 + streak*0.5, 36) : 18;
  const colors = alive
    ? streak>=30?["#FF0000","#FF6600","#FFD700"]:streak>=14?["#FF4500","#FF8C00","#FFD700"]:streak>=7?["#FF6600","#FFA500","#FFD700"]:["#F97316","#FCD34D","#FEF08A"]
    : ["#94A3B8","#CBD5E1","#E2E8F0"];
  return (
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={`M12 2C12 2 7 8 7 13C7 15.8 9.2 18 12 18C14.8 18 17 15.8 17 13C17 8 12 2 12 2Z`} fill={`url(#fg${streak})`}/>
        <path d={`M12 10C12 10 9 13 9 15C9 16.7 10.3 18 12 18C13.7 18 15 16.7 15 15C15 13 12 10 12 10Z`} fill={colors[2]} opacity="0.8"/>
        <defs>
          <linearGradient id={`fg${streak}`} x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colors[0]}/>
            <stop offset="50%" stopColor={colors[1]}/>
            <stop offset="100%" stopColor={colors[2]}/>
          </linearGradient>
        </defs>
      </svg>
      <span style={{fontWeight:900,fontSize:size*0.7,color:alive?colors[1]:I.muted}}>{streak}</span>
    </div>
  );
}

// ── SVG AVATAR ────────────────────────────────────────────────────────────────
function AvatarDisplay({avatar,size=80,mood="happy"}:{avatar:Avatar,size?:number,mood?:"happy"|"sad"|"neutral"|"excited"}){
  const s = size;
  const eyeY = mood==="sad"?38:36;
  const mouthPath = mood==="happy"?`M${s*0.38} ${s*0.56} Q${s*0.5} ${s*0.64} ${s*0.62} ${s*0.56}`:
                    mood==="sad"?`M${s*0.38} ${s*0.62} Q${s*0.5} ${s*0.54} ${s*0.62} ${s*0.62}`:
                    mood==="excited"?`M${s*0.35} ${s*0.54} Q${s*0.5} ${s*0.68} ${s*0.65} ${s*0.54}`:
                    `M${s*0.4} ${s*0.58} L${s*0.6} ${s*0.58}`;
  const hairPaths: Record<string,string> = {
    "Short":   `M${s*.28} ${s*.3} Q${s*.5} ${s*.1} ${s*.72} ${s*.3} L${s*.68} ${s*.28} Q${s*.5} ${s*.12} ${s*.32} ${s*.28}Z`,
    "Curly":   `M${s*.22} ${s*.32} Q${s*.3} ${s*.05} ${s*.5} ${s*.08} Q${s*.7} ${s*.05} ${s*.78} ${s*.32} Q${s*.7} ${s*.1} ${s*.5} ${s*.12} Q${s*.3} ${s*.1} ${s*.22} ${s*.32}Z`,
    "Long":    `M${s*.25} ${s*.3} Q${s*.5} ${s*.08} ${s*.75} ${s*.3} L${s*.78} ${s*.7} L${s*.72} ${s*.68} L${s*.7} ${s*.32} Q${s*.5} ${s*.12} ${s*.3} ${s*.32} L${s*.28} ${s*.68} L${s*.22} ${s*.7}Z`,
    "Braids":  `M${s*.28} ${s*.28} Q${s*.5} ${s*.08} ${s*.72} ${s*.28} M${s*.3} ${s*.35} L${s*.26} ${s*.75} M${s*.7} ${s*.35} L${s*.74} ${s*.75}`,
    "Bun":     `M${s*.3} ${s*.28} Q${s*.5} ${s*.1} ${s*.7} ${s*.28} M${s*.42} ${s*.14} A${s*.1} ${s*.1} 0 1 1 ${s*.58} ${s*.14}`,
    "Fade":    `M${s*.28} ${s*.32} Q${s*.5} ${s*.12} ${s*.72} ${s*.32} L${s*.7} ${s*.3} Q${s*.5} ${s*.14} ${s*.3} ${s*.3}Z`,
    "Natural": `M${s*.18} ${s*.35} Q${s*.2} ${s*.05} ${s*.5} ${s*.07} Q${s*.8} ${s*.05} ${s*.82} ${s*.35} Q${s*.75} ${s*.1} ${s*.5} ${s*.1} Q${s*.25} ${s*.1} ${s*.18} ${s*.35}Z`,
    "Ponytail":`M${s*.28} ${s*.28} Q${s*.5} ${s*.08} ${s*.72} ${s*.28} L${s*.5} ${s*.15} L${s*.5} ${s*.08} M${s*.5} ${s*.08} L${s*.52} ${s*.22}`,
  };
  const hairPath = hairPaths[avatar.hairStyle]||hairPaths["Short"];

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Body */}
      <ellipse cx={s*0.5} cy={s*0.82} rx={s*0.28} ry={s*0.2} fill={avatar.skinTone} opacity="0.9"/>
      {/* Shirt */}
      <ellipse cx={s*0.5} cy={s*0.88} rx={s*0.26} ry={s*0.15} fill={I.indigo} opacity="0.85"/>
      {/* Head */}
      <ellipse cx={s*0.5} cy={s*0.42} rx={s*0.22} ry={s*0.24} fill={avatar.skinTone}/>
      {/* Hair */}
      {avatar.hairStyle==="Braids"||avatar.hairStyle==="Ponytail"
        ? <path d={hairPath} stroke={avatar.hairColor} strokeWidth={s*0.04} fill="none" strokeLinecap="round"/>
        : <path d={hairPath} fill={avatar.hairColor} opacity="0.95"/>
      }
      {/* Eyes */}
      <ellipse cx={s*0.42} cy={s*(eyeY/100)} rx={s*0.035} ry={s*(mood==="excited"?0.045:0.035)} fill="#1a1a1a"/>
      <ellipse cx={s*0.58} cy={s*(eyeY/100)} rx={s*0.035} ry={s*(mood==="excited"?0.045:0.035)} fill="#1a1a1a"/>
      {/* Sparkle on excited */}
      {mood==="excited"&&<>
        <circle cx={s*0.75} cy={s*0.2} r={s*0.025} fill={I.yellow}/>
        <circle cx={s*0.8}  cy={s*0.28} r={s*0.015} fill={I.yellow}/>
      </>}
      {/* Tear on sad */}
      {mood==="sad"&&<ellipse cx={s*0.42} cy={s*0.44} rx={s*0.018} ry={s*0.03} fill={I.sky} opacity="0.7"/>}
      {/* Mouth */}
      <path d={mouthPath} stroke="#333" strokeWidth={s*0.025} fill="none" strokeLinecap="round"/>
      {/* Nose */}
      <ellipse cx={s*0.5} cy={s*0.5} rx={s*0.02} ry={s*0.015} fill={avatar.skinTone} stroke="#00000022" strokeWidth="1"/>
    </svg>
  );
}

// ── AVATAR BUILDER ────────────────────────────────────────────────────────────
function AvatarBuilder({onSave}:{onSave:(a:Avatar)=>void}){
  const [av,setAv]=useState<Avatar>({gender:"male",skinTone:SKIN_TONES[0],hairColor:HAIR_COLORS[0],hairStyle:"Short",bodyType:"Athletic"});
  return (
    <div style={{minHeight:"100%",background:I.bg,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginTop:12,marginBottom:4}}>Build Your Avatar</h2>
        <p style={{fontSize:13,color:I.muted}}>Your personal AI trainer coach. Elite plan exclusive. 👑</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        {/* Preview */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <div style={{background:"white",borderRadius:24,padding:20,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",border:`2px solid ${I.indigo}30`,display:"inline-flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <AvatarDisplay avatar={av} size={120} mood="happy"/>
            <span style={{fontSize:12,fontWeight:700,color:I.indigo}}>Your Trainer</span>
          </div>
        </div>

        {/* Gender */}
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:8}}>Gender</div>
          <div style={{display:"flex",gap:8}}>
            {GENDERS.map(g=>(
              <button key={g} onClick={()=>setAv(a=>({...a,gender:g.toLowerCase() as Avatar["gender"]}))}
                style={{flex:1,padding:"10px",borderRadius:12,border:`2px solid ${av.gender===g.toLowerCase()?I.indigo:I.border}`,background:av.gender===g.toLowerCase()?I.indigoL:"white",fontWeight:700,fontSize:12,color:av.gender===g.toLowerCase()?I.indigo:I.mid,cursor:"pointer"}}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Skin tone */}
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:8}}>Skin Tone</div>
          <div style={{display:"flex",gap:8}}>
            {SKIN_TONES.map(s=>(
              <button key={s} onClick={()=>setAv(a=>({...a,skinTone:s}))}
                style={{width:40,height:40,borderRadius:20,background:s,border:`3px solid ${av.skinTone===s?I.indigo:"transparent"}`,cursor:"pointer"}}/>
            ))}
          </div>
        </div>

        {/* Hair color */}
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:8}}>Hair Color</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {HAIR_COLORS.map(c=>(
              <button key={c} onClick={()=>setAv(a=>({...a,hairColor:c}))}
                style={{width:34,height:34,borderRadius:17,background:c,border:`3px solid ${av.hairColor===c?I.indigo:"transparent"}`,cursor:"pointer",boxShadow:c==="#FFFFFF"?"inset 0 0 0 1px #ccc":"none"}}/>
            ))}
          </div>
        </div>

        {/* Hair style */}
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:8}}>Hair Style</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {HAIR_STYLES.map(s=>(
              <button key={s} onClick={()=>setAv(a=>({...a,hairStyle:s}))}
                style={{padding:"10px",borderRadius:12,border:`2px solid ${av.hairStyle===s?I.indigo:I.border}`,background:av.hairStyle===s?I.indigoL:"white",fontWeight:700,fontSize:12,color:av.hairStyle===s?I.indigo:I.mid,cursor:"pointer"}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Body type */}
        <div style={{marginBottom:24}}>
          <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:8}}>Body Type</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {BODY_TYPES.map(b=>(
              <button key={b} onClick={()=>setAv(a=>({...a,bodyType:b}))}
                style={{padding:"8px 14px",borderRadius:20,border:`2px solid ${av.bodyType===b?I.indigo:I.border}`,background:av.bodyType===b?I.indigoL:"white",fontWeight:700,fontSize:12,color:av.bodyType===b?I.indigo:I.mid,cursor:"pointer"}}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <PrimaryBtn onClick={()=>onSave(av)}>Save My Avatar 🎉</PrimaryBtn>
      </div>
    </div>
  );
}

// ── BODY PROFILE FORM ─────────────────────────────────────────────────────────
function BodyProfileForm({onSave}:{onSave:(p:BodyProfile)=>void}){
  const [form,setForm]=useState<BodyProfile>({height:"",weight:"",gender:"male",goal:"return"});
  return (
    <div style={{padding:"24px",background:"white",borderRadius:20,border:`1px solid ${I.border}`}}>
      <h3 style={{fontWeight:900,fontSize:16,color:I.dark,marginBottom:4}}>📏 Your Body Profile</h3>
      <p style={{fontSize:12,color:I.muted,marginBottom:16}}>We'll calculate your exact daily macro targets for recovery.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:I.muted,display:"block",marginBottom:4}}>HEIGHT (cm)</label>
          <input type="number" placeholder="175" value={form.height} onChange={e=>setForm(f=>({...f,height:e.target.value}))}
            style={{width:"100%",padding:"10px",borderRadius:10,border:`1.5px solid ${I.border}`,fontSize:14,fontFamily:"inherit"}}/>
        </div>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:I.muted,display:"block",marginBottom:4}}>WEIGHT (kg)</label>
          <input type="number" placeholder="75" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))}
            style={{width:"100%",padding:"10px",borderRadius:10,border:`1.5px solid ${I.border}`,fontSize:14,fontFamily:"inherit"}}/>
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <label style={{fontSize:11,fontWeight:700,color:I.muted,display:"block",marginBottom:4}}>BIOLOGICAL SEX (for BMR calculation)</label>
        <div style={{display:"flex",gap:8}}>
          {["male","female"].map(g=>(
            <button key={g} onClick={()=>setForm(f=>({...f,gender:g}))}
              style={{flex:1,padding:"8px",borderRadius:10,border:`2px solid ${form.gender===g?I.indigo:I.border}`,background:form.gender===g?I.indigoL:"white",fontWeight:700,fontSize:12,color:form.gender===g?I.indigo:I.mid,cursor:"pointer",textTransform:"capitalize"}}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <button onClick={()=>form.height&&form.weight?onSave(form):null}
        style={{width:"100%",padding:"12px",borderRadius:12,background:form.height&&form.weight?I.teal:"#E2E8F0",color:form.height&&form.weight?"white":I.muted,fontWeight:700,fontSize:13,border:"none",cursor:form.height&&form.weight?"pointer":"not-allowed",marginTop:8}}>
        Calculate My Macros →
      </button>
    </div>
  );
}

// ── QUIZ SCREENS ──────────────────────────────────────────────────────────────
function Welcome({onNext}:{onNext:()=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",padding:"48px 24px 32px",background:`linear-gradient(160deg,${I.indigoL} 0%,${I.bg} 60%)`}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
        <Logo size={36}/>
        <div style={{marginTop:32,marginBottom:20}}>
          <h1 style={{fontWeight:900,fontSize:34,color:I.dark,lineHeight:1.1,letterSpacing:"-1px",marginBottom:12}}>Your comeback<br/>starts <span style={{color:I.indigo}}>today.</span></h1>
          <p style={{fontSize:15,color:I.muted,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Science-backed recovery protocols. Personalised nutrition. Real day tracking.</p>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:28}}>
          {["🏆 Pro protocols","📿 Daily faith","🧪 Evidence-based","📅 Real tracking","🤖 AI Avatar coach"].map((f,i)=>(
            <div key={i} style={{fontSize:11,fontWeight:700,color:I.indigoT,background:"white",borderRadius:12,padding:"6px 12px",boxShadow:"0 2px 6px rgba(15,23,42,0.08)"}}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{textAlign:"center",fontSize:11,color:I.muted,marginTop:12}}>Free to start · Progress saved automatically</p>
    </div>
  );
}

function SportSelect({onNext}:{onNext:(s:typeof SPORTS[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={1}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your sport?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>You'll join a squad of athletes from your sport.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {SPORTS.map(s=>(
            <button key={s.id} onClick={()=>onNext(s)} style={{background:"white",border:`1.5px solid ${I.border}`,borderRadius:16,padding:0,cursor:"pointer",textAlign:"left",overflow:"hidden",boxShadow:"0 2px 6px rgba(15,23,42,0.06)"}}>
              <div style={{height:80,background:`url(${s.img}) center/cover`,position:"relative"}}>
                <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,transparent,rgba(0,0,0,0.5))`}}/>
                <span style={{position:"absolute",bottom:6,left:8,fontSize:22}}>{s.icon}</span>
              </div>
              <div style={{padding:"8px 10px 10px"}}>
                <div style={{fontWeight:700,fontSize:13,color:I.dark}}>{s.label}</div>
                <div style={{fontSize:10,color:I.muted,marginTop:1}}>{s.athlete}</div>
                <div style={{fontSize:9,color:I.teal,fontWeight:700,marginTop:2}}>🟢 {s.liveUsers.toLocaleString()} active</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InjurySelect({onNext}:{onNext:(inj:typeof INJURIES[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={2}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your injury?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Select closest match — we fine-tune by severity next.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        {INJURIES.map(inj=>(
          <button key={inj.id} onClick={()=>onNext(inj)} style={{width:"100%",background:"white",border:`1.5px solid ${I.border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,marginBottom:10,boxShadow:"0 2px 6px rgba(15,23,42,0.05)"}}>
            <span style={{fontSize:26}}>{inj.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:I.dark}}>{inj.label}</div>
              <div style={{fontSize:11,color:I.muted,marginTop:2}}>{inj.weeks}-week protocol</div>
            </div>
            <ChevronRight size={16} color={I.muted}/>
          </button>
        ))}
      </div>
    </div>
  );
}

function SeveritySelect({onNext}:{onNext:(sv:typeof SEVERITIES[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={3}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>How severe is it?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>This determines your protocol intensity.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        {SEVERITIES.map(sv=>(
          <button key={sv.id} onClick={()=>onNext(sv)} style={{width:"100%",background:"white",border:`2px solid ${I.border}`,borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",marginBottom:12,boxShadow:"0 2px 8px rgba(15,23,42,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <span style={{fontSize:24}}>{sv.icon}</span>
              <span style={{fontWeight:800,fontSize:16,color:I.dark}}>{sv.label}</span>
              <TagPill color={sv.color} bg={sv.bg}>{sv.label}</TagPill>
            </div>
            <p style={{fontSize:13,color:I.muted,margin:0,paddingLeft:36}}>{sv.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function GoalSelect({onNext}:{onNext:(g:typeof GOALS_LIST[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={4}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your #1 goal?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Shapes your daily task emphasis and macros.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        {GOALS_LIST.map(g=>(
          <button key={g.id} onClick={()=>onNext(g)} style={{width:"100%",background:"white",border:`1.5px solid ${I.border}`,borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,marginBottom:12,boxShadow:"0 2px 8px rgba(15,23,42,0.06)"}}>
            <span style={{fontSize:28}}>{g.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:I.dark}}>{g.label}</div>
              <div style={{fontSize:12,color:I.muted,marginTop:2}}>{g.desc}</div>
            </div>
            <ChevronRight size={16} color={I.muted}/>
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanSelect({onNext}:{onNext:(plan:"free"|"pro"|"elite")=>void}){
  const features = {
    free:  {have:["Daily recovery protocol","10-task daily checklist","Streak tracking","Basic squad access"],miss:["Personalised nutrition & macros","Supplement schedule","AI Avatar trainer","Video library","Advanced analytics","1-on-1 PT consults"]},
    pro:   {have:["Everything in Free","Personalised macros & nutrition","Supplement timing schedule","Video exercise library","Progress analytics","Priority email support"],miss:["AI Avatar personal trainer","1-on-1 PT video consults","Custom meal plans","Custom supplement stack"]},
    elite: {have:["Everything in Pro","👑 Your own AI Avatar trainer","Animated trainer reacts to your progress","Daily coach pep talks & compliments","1-on-1 PT video consults","Custom meal & supplement plans","24/7 priority support"],miss:[]},
  };
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/><StepBar total={5} current={5}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Choose your plan</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Start free for 24 hours. Upgrade anytime.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>

        {/* FREE */}
        <div style={{background:"white",borderRadius:18,padding:"18px 16px",border:`2px solid ${I.border}`,marginBottom:12,boxShadow:"0 2px 8px rgba(15,23,42,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>🌱</span><span style={{fontWeight:800,fontSize:16,color:I.dark}}>Free</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:I.dark}}>$0</span><div style={{fontSize:9,color:I.muted}}>24hr trial</div></div>
          </div>
          {features.free.have.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={I.teal} strokeWidth={3}/><span style={{fontSize:12,color:I.mid}}>{f}</span></div>)}
          {features.free.miss.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><X size={13} color={I.red} strokeWidth={3}/><span style={{fontSize:12,color:I.subtle,textDecoration:"line-through"}}>{f}</span></div>)}
          <button onClick={()=>onNext("free")} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,background:"transparent",color:I.mid,fontWeight:700,fontSize:13,border:`1.5px solid ${I.border}`,cursor:"pointer"}}>Start Free Trial →</button>
        </div>

        {/* PRO */}
        <div style={{background:"white",borderRadius:18,padding:"18px 16px",border:`2px solid ${I.teal}`,marginBottom:12,boxShadow:`0 4px 16px ${I.teal}20`,position:"relative"}}>
          <div style={{position:"absolute",top:-10,right:16,background:I.teal,color:"white",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:10}}>BEST VALUE</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>⚡</span><span style={{fontWeight:800,fontSize:16,color:I.dark}}>Pro</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:I.teal}}>$9.99/mo</span><div style={{fontSize:9,color:I.muted}}>billed monthly</div></div>
          </div>
          {features.pro.have.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={I.teal} strokeWidth={3}/><span style={{fontSize:12,color:I.mid}}>{f}</span></div>)}
          {features.pro.miss.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><X size={13} color={I.red} strokeWidth={3}/><span style={{fontSize:12,color:I.subtle,textDecoration:"line-through"}}>{f}</span></div>)}
          <button onClick={()=>{window.open(PLAN_PRO_URL,"_blank");onNext("pro");}} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,background:I.teal,color:"white",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}}>Get Pro →</button>
          <p style={{fontSize:10,color:I.muted,textAlign:"center",marginTop:6}}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        {/* ELITE */}
        <div style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",borderRadius:18,padding:"18px 16px",border:`2px solid ${I.indigo}`,marginBottom:16,boxShadow:`0 8px 24px ${I.indigo}30`,position:"relative"}}>
          <div style={{position:"absolute",top:-10,right:16,background:I.indigo,color:"white",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:10}}>👑 MOST POPULAR</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>🏆</span><span style={{fontWeight:800,fontSize:16,color:"white"}}>Elite</span></div>
            <div style={{textAlign:"right"}}><span style={{fontWeight:900,fontSize:18,color:I.yellow}}>$28.99/mo</span><div style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>billed monthly</div></div>
          </div>
          {features.elite.have.map((f,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:5,alignItems:"center"}}><Check size={13} color={I.yellow} strokeWidth={3}/><span style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>{f}</span></div>)}
          <button onClick={()=>{window.open(PLAN_ELITE_URL,"_blank");onNext("elite");}} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:12,background:I.yellow,color:I.dark,fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>Get Elite + Avatar 👑</button>
          <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:6}}>🔒 Secure checkout via Stripe · Cancel anytime</p>
        </div>

        <GhostBtn onClick={()=>onNext("free")}>Skip for now — start free</GhostBtn>
      </div>
    </div>
  );
}

// ── NAV BUTTON ────────────────────────────────────────────────────────────────
function NavBtn({icon,label,active,onClick}:{icon:ReactNode,label:string,active:boolean,onClick:()=>void}){
  return (
    <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 12px",background:"none",border:"none",cursor:"pointer"}}>
      <div style={{color:active?I.indigo:I.subtle}}>{icon}</div>
      <span style={{fontSize:10,fontWeight:700,color:active?I.indigo:I.subtle}}>{label}</span>
    </button>
  );
}

// ── TASK CARD ─────────────────────────────────────────────────────────────────
function TaskCard({task,checked,onToggle}:{task:Task,checked:boolean,onToggle:()=>void}){
  return (
    <div onClick={onToggle} style={{display:"flex",gap:12,alignItems:"flex-start",background:"white",borderRadius:14,padding:"12px 14px",border:`1px solid ${checked?I.teal:I.border}`,boxShadow:"0 1px 4px rgba(15,23,42,0.05)",cursor:"pointer",opacity:checked?0.7:1,transition:"all 0.2s"}}>
      <div style={{width:36,height:36,borderRadius:18,background:task.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{task.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,fontWeight:700,color:I.muted,marginBottom:2}}>{task.time}</div>
        <div style={{fontSize:12,color:checked?I.muted:I.mid,lineHeight:1.45,textDecoration:checked?"line-through":"none",fontWeight:500}}>{task.task}</div>
      </div>
      <div style={{width:22,height:22,borderRadius:11,background:checked?I.teal:I.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,transition:"background 0.2s"}}>
        {checked&&<Check size={13} color="white" strokeWidth={3}/>}
      </div>
    </div>
  );
}

// ── APP DASHBOARD ─────────────────────────────────────────────────────────────
function AppDashboard({saved,onReset,onUpgrade}:{saved:SavedState,onReset:()=>void,onUpgrade:(p:"pro"|"elite")=>void}){
  const [tab,setTab]=useState<"home"|"today"|"protocol"|"squad"|"rewards"|"avatar">("home");
  const [posts,setPosts]=useState<Post[]>(()=>saved.posts?.[saved.sportId]||seedPosts(saved.sportId));
  const [replyingTo,setReplyingTo]=useState<string|null>(null);
  const [replyText,setReplyText]=useState("");
  const [newPost,setNewPost]=useState("");
  const [showBodyForm,setShowBodyForm]=useState(!saved.bodyProfile);
  const [bodyProfile,setBodyProfile]=useState<BodyProfile|null>(saved.bodyProfile);
  const [suppChecked,setSuppChecked]=useState<boolean[]>(()=>{
    const s=loadState(); return s?.suppChecked?.[todayStr()]??Array(SUPPLEMENTS.length).fill(false);
  });
  const [showAvatarBuilder,setShowAvatarBuilder]=useState(false);

  const sport    = SPORTS.find(s=>s.id===saved.sportId);
  const injury   = INJURIES.find(i=>i.id===saved.injuryId);
  const severity = SEVERITIES.find(s=>s.id===saved.severityId);

  const dayNum  = Math.max(1,daysBetween(saved.startDate,todayStr())+1);
  const phase   = dayNum<=42?1:dayNum<=112?2:3;
  const pct     = Math.min(100,Math.round((dayNum/((injury?.weeks||36)*7))*100));
  const weekNum = Math.ceil(dayNum/7);
  const todayKey= todayStr();

  // Rotating daily protocol
  const tasks = DAY_PROTOCOLS[dayNum % DAY_PROTOCOLS.length];
  const [checked,setChecked]=useState<boolean[]>(()=>{
    const s=loadState(); return s?.completedTasks?.[todayKey]??Array(tasks.length).fill(false);
  });
  const doneCount=checked.filter(Boolean).length;
  const allDone=doneCount===tasks.length;

  const toggleTask=useCallback((idx:number)=>{
    setChecked(prev=>{
      const next=[...prev]; next[idx]=!next[idx];
      const s=loadState();
      if(s){s.completedTasks=s.completedTasks||{};s.completedTasks[todayKey]=next;saveState(s);}
      return next;
    });
  },[todayKey]);

  const toggleSupp=useCallback((idx:number)=>{
    setSuppChecked(prev=>{
      const next=[...prev]; next[idx]=!next[idx];
      const s=loadState();
      if(s){s.suppChecked=s.suppChecked||{};s.suppChecked[todayKey]=next;saveState(s);}
      return next;
    });
  },[todayKey]);

  const dailyContent=DAILY_CONTENT[dayNum%DAILY_CONTENT.length];
  const morningTasks=tasks.slice(0,3);
  const afternoonTasks=tasks.slice(3,7);
  const eveningTasks=tasks.slice(7);

  // Avatar mood
  const avatarMood: "happy"|"sad"|"excited"|"neutral" =
    allDone?"excited":doneCount>=tasks.length*0.6?"happy":!saved.streakAlive?"sad":"neutral";

  // Avatar quote
  const avatarQuote=allDone
    ? AVATAR_QUOTES.goal[dayNum%AVATAR_QUOTES.goal.length]
    : !saved.streakAlive
    ? AVATAR_QUOTES.miss[dayNum%AVATAR_QUOTES.miss.length]
    : saved.streak>0&&doneCount===0
    ? AVATAR_QUOTES.morning[dayNum%AVATAR_QUOTES.morning.length]
    : AVATAR_QUOTES.streak[dayNum%AVATAR_QUOTES.streak.length];

  // Macros
  const macros = bodyProfile ? calcMacros(bodyProfile.height,bodyProfile.weight,bodyProfile.gender,saved.goalId) : null;

  // Squad like
  const handleLike=(postId:string)=>{
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,likes:p.likedByMe?p.likes-1:p.likes+1,likedByMe:!p.likedByMe}:p));
  };
  const handleReply=(postId:string)=>{
    if(!replyText.trim())return;
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,replies:[...p.replies,{author:"You",msg:replyText.trim()}]}:p));
    setReplyText(""); setReplyingTo(null);
  };
  const handleNewPost=()=>{
    if(!newPost.trim())return;
    const p:Post={id:Date.now().toString(),author:"You",msg:newPost.trim(),likes:0,likedByMe:false,replies:[]};
    setPosts(prev=>[p,...prev]);
    setNewPost("");
    const s=loadState();
    if(s){s.posts=s.posts||{};s.posts[saved.sportId]=[p,...(s.posts[saved.sportId]||[])];saveState(s);}
  };

  // Trial expired?
  const trialDays = daysBetween(saved.trialStartDate||saved.startDate,todayStr());
  const trialExpired = saved.plan==="free" && trialDays>=1;

  if(trialExpired){
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:I.bg,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>⏰</div>
        <h2 style={{fontWeight:900,fontSize:24,color:I.dark,marginBottom:8}}>Free Trial Ended</h2>
        <p style={{fontSize:14,color:I.muted,marginBottom:24,lineHeight:1.6}}>Your 24-hour trial is up! Upgrade to keep your streak alive and continue your recovery journey.</p>
        <button onClick={()=>{window.open(PLAN_ELITE_URL,"_blank");onUpgrade("elite");}} style={{width:"100%",padding:"16px",borderRadius:14,background:I.yellow,color:I.dark,fontWeight:900,fontSize:16,border:"none",cursor:"pointer",marginBottom:12}}>
          👑 Get Elite — $28.99/mo<div style={{fontSize:11,fontWeight:600,marginTop:2}}>Includes AI Avatar personal trainer</div>
        </button>
        <button onClick={()=>{window.open(PLAN_PRO_URL,"_blank");onUpgrade("pro");}} style={{width:"100%",padding:"14px",borderRadius:14,background:I.teal,color:"white",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",marginBottom:12}}>
          ⚡ Get Pro — $9.99/mo
        </button>
        <p style={{fontSize:11,color:I.muted}}>🔒 Secure checkout via Stripe · Cancel anytime</p>
      </div>
    );
  }

  if(showAvatarBuilder && saved.plan==="elite"){
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
          <AvatarBuilder onSave={av=>{
            const s=loadState();
            if(s){s.avatar=av;saveState(s);}
            setShowAvatarBuilder(false);
            setTab("avatar");
          }}/>
        </div>
      </div>
    );
  }

  const renderTab=()=>{
    switch(tab){

      case "home": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <Logo size={26}/>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"6px 12px",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 6px rgba(15,23,42,0.06)"}}>
                <StreakFire streak={saved.streak} alive={saved.streakAlive}/>
              </div>
              <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{sport?.icon||"🏆"}</div>
            </div>
          </div>

          {/* Avatar greeting (elite only) */}
          {saved.plan==="elite"&&saved.avatar&&(
            <Card style={{marginBottom:16,background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <AvatarDisplay avatar={saved.avatar} size={70} mood={avatarMood}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:11,color:I.indigo,marginBottom:4}}>YOUR TRAINER SAYS</div>
                  <p style={{fontSize:13,color:I.dark,lineHeight:1.5,fontStyle:"italic",margin:0}}>{avatarQuote}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Elite upgrade prompt if no avatar */}
          {saved.plan==="elite"&&!saved.avatar&&(
            <Card style={{marginBottom:16,background:`linear-gradient(135deg,#1C1C2E,#2D2B5E)`,border:"none"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <span style={{fontSize:40}}>🤖</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:12,color:I.yellow,marginBottom:4}}>BUILD YOUR AVATAR TRAINER</div>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.7)",margin:0,marginBottom:8}}>You're on Elite. Create your personal AI coach!</p>
                  <button onClick={()=>setShowAvatarBuilder(true)} style={{padding:"8px 16px",borderRadius:10,background:I.yellow,color:I.dark,fontWeight:800,fontSize:12,border:"none",cursor:"pointer"}}>Build Now 👑</button>
                </div>
              </div>
            </Card>
          )}

          {/* Progress */}
          <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:16,padding:"18px 16px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6,letterSpacing:"1px"}}>WEEK {weekNum} · PHASE {phase}</div>
            <h2 style={{fontWeight:900,fontSize:22,color:"white",lineHeight:1.1,marginBottom:6}}>Day {dayNum} of {(injury?.weeks||36)*7}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:12}}>{injury?.label||"Recovery"} · {severity?.label||""}</p>
            <ProgressBar pct={pct} color={I.yellow}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day 1</span>
              <span style={{fontSize:10,color:I.yellow,fontWeight:700}}>{pct}% complete</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day {(injury?.weeks||36)*7}</span>
            </div>
          </Card>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {icon:<StreakFire streak={saved.streak} alive={saved.streakAlive}/>,val:"",label:"Streak"},
              {icon:null,val:`${doneCount}/${tasks.length}`,label:"Today"},
              {icon:null,val:`Phase ${phase}`,label:"Stage"},
            ].map((stat,i)=>(
              <Card key={i} style={{textAlign:"center",padding:"12px 8px"}}>
                {stat.icon?<div style={{display:"flex",justifyContent:"center",marginBottom:4}}>{stat.icon}</div>:<div style={{fontWeight:900,fontSize:16,color:I.dark,marginBottom:4}}>{stat.val}</div>}
                {!stat.icon&&<div style={{fontWeight:900,fontSize:16,color:I.dark}}>{stat.val}</div>}
                <div style={{fontSize:10,color:I.muted,fontWeight:600}}>{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Streak lost warning */}
          {!saved.streakAlive&&saved.streak===0&&(
            <Card style={{background:"#FEF2F2",border:`1.5px solid ${I.red}30`,marginBottom:16}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:28}}>💧</span>
                <div>
                  <div style={{fontWeight:800,fontSize:13,color:I.red}}>Streak Reset</div>
                  <div style={{fontSize:12,color:I.mid}}>Complete today's tasks to relight your fire 🔥</div>
                </div>
              </div>
            </Card>
          )}

          {/* Daily quote */}
          <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:16}}>
            <TagPill color={I.indigoT} bg={I.indigo+"22"}>{dailyContent.type==="verse"?"📿 Bible Verse":dailyContent.type==="athlete"?"🏆 Athlete":"💡 Motivation"}</TagPill>
            <p style={{fontSize:13,fontStyle:"italic",color:I.dark,lineHeight:1.65,marginTop:8,fontFamily:"Georgia,serif"}}>{dailyContent.quote}</p>
            <p style={{fontSize:10,fontWeight:700,color:I.indigoT,marginTop:6}}>— {dailyContent.text}</p>
          </Card>

          {/* Today's focus */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontWeight:900,fontSize:17,color:I.dark}}>Today's Focus</h2>
            <button onClick={()=>setTab("today")} style={{fontSize:12,fontWeight:700,color:I.indigo,background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {tasks.slice(0,3).map((t,i)=><TaskCard key={i} task={t} checked={checked[i]} onToggle={()=>toggleTask(i)}/>)}
          </div>

          {/* Sport quote */}
          {sport&&(
            <Card style={{background:`linear-gradient(135deg,${sport.color}15,${sport.color}05)`,border:`1px solid ${sport.color}30`,marginBottom:16}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:28}}>{sport.icon}</span>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:sport.color,marginBottom:4}}>{sport.athlete} SAYS</div>
                  <p style={{fontSize:12,fontStyle:"italic",color:I.mid,lineHeight:1.5,margin:0}}>{sport.quotes[dayNum%sport.quotes.length]}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Upgrade card */}
          {saved.plan!=="elite"&&(
            <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:12,padding:"16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6}}>UPGRADE YOUR PLAN</div>
              <div style={{display:"flex",gap:8}}>
                {saved.plan==="free"&&<button onClick={()=>{window.open(PLAN_PRO_URL,"_blank");onUpgrade("pro");}} style={{flex:1,padding:"10px",borderRadius:10,background:I.teal,color:"white",fontWeight:700,fontSize:11,border:"none",cursor:"pointer"}}>⚡ Pro $9.99/mo</button>}
                <button onClick={()=>{window.open(PLAN_ELITE_URL,"_blank");onUpgrade("elite");}} style={{flex:1,padding:"10px",borderRadius:10,background:I.yellow,color:I.dark,fontWeight:800,fontSize:11,border:"none",cursor:"pointer"}}>👑 Elite $28.99/mo</button>
              </div>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:8}}>🔒 Stripe · Cancel anytime</p>
            </Card>
          )}

          <button onClick={()=>{if(confirm("Reset recovery plan? All progress cleared."))onReset();}} style={{width:"100%",padding:"10px",borderRadius:12,background:"transparent",color:I.muted,fontSize:12,fontWeight:600,border:`1px solid ${I.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <RotateCcw size={13}/> Start a new recovery plan
          </button>
        </div>
      );

      case "today": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 0 100px"}}>
          <div style={{padding:"0 18px",marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <h1 style={{fontWeight:900,fontSize:24,color:I.dark,lineHeight:1}}>Day {dayNum}</h1>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
                  <TagPill color={I.indigoT} bg={I.indigoL}>Phase {phase}</TagPill>
                  <span style={{fontSize:12,color:I.muted,fontWeight:600}}>{injury?.label}</span>
                </div>
              </div>
              <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"7px 13px",boxShadow:"0 2px 6px rgba(15,23,42,0.06)"}}>
                <StreakFire streak={saved.streak} alive={saved.streakAlive}/>
              </div>
            </div>
            <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:14}}>
              <TagPill color={I.indigoT} bg={I.indigo+"22"}>{dailyContent.type==="verse"?"📿":"🏆"} Daily {dailyContent.type==="verse"?"Verse":"Motivation"}</TagPill>
              <p style={{fontSize:13,fontStyle:"italic",color:I.dark,lineHeight:1.65,marginTop:8,fontFamily:"Georgia,serif"}}>{dailyContent.quote}</p>
              <p style={{fontSize:10,fontWeight:700,color:I.indigoT,marginTop:6}}>— {dailyContent.text}</p>
            </Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <h2 style={{fontWeight:900,fontSize:18,color:I.dark}}>Today's Protocol</h2>
              <span style={{fontSize:10,fontWeight:700,color:allDone?I.teal:I.muted,background:"white",border:`1px solid ${allDone?I.teal:I.border}`,borderRadius:8,padding:"4px 8px"}}>{doneCount}/{tasks.length} done</span>
            </div>
          </div>
          <div style={{padding:"0 18px"}}>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌅 Morning</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>{morningTasks.map((t,i)=><TaskCard key={i} task={t} checked={checked[i]} onToggle={()=>toggleTask(i)}/>)}</div>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>☀️ Afternoon</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>{afternoonTasks.map((t,i)=><TaskCard key={i+3} task={t} checked={checked[i+3]} onToggle={()=>toggleTask(i+3)}/>)}</div>
            <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌙 Evening</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{eveningTasks.map((t,i)=><TaskCard key={i+7} task={t} checked={checked[i+7]} onToggle={()=>toggleTask(i+7)}/>)}</div>
            {allDone&&(
              <Card style={{background:`linear-gradient(135deg,${I.tealL},#F0FDF4)`,border:`1.5px solid ${I.teal}`,marginTop:20,textAlign:"center",padding:"20px 16px"}}>
                <div style={{fontSize:40,marginBottom:8}}>🎉</div>
                <div style={{fontWeight:900,fontSize:18,color:I.teal,marginBottom:4}}>Day Complete!</div>
                <div style={{fontSize:13,color:I.mid}}>Every task done. Your body is healing. See you tomorrow.</div>
                {saved.plan==="elite"&&saved.avatar&&<div style={{marginTop:12,display:"flex",justifyContent:"center"}}><AvatarDisplay avatar={saved.avatar} size={70} mood="excited"/></div>}
              </Card>
            )}
          </div>
        </div>
      );

      case "protocol": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>{injury?.label||"Recovery Protocol"}</h1>
          <p style={{fontSize:13,color:I.muted,marginBottom:20}}>{injury?.weeks||12}-week protocol · Week {weekNum} · Phase {phase}</p>

          {/* Phases */}
          {[
            {phase:"Phase 1",title:"Protection & Healing",desc:injury?.phase1,color:I.indigo,bg:I.indigoL,active:phase===1,weeks:"Wks 1–6"},
            {phase:"Phase 2",title:"Strength & Mobility",desc:injury?.phase2,color:I.teal,bg:I.tealL,active:phase===2,weeks:"Wks 7–16"},
            {phase:"Phase 3",title:"Return to Sport",desc:injury?.phase3,color:I.orange,bg:"#FFF0E6",active:phase===3,weeks:"Wks 17+"},
          ].map((p,i)=>(
            <div key={i} style={{display:"flex",gap:14,marginBottom:20,opacity:p.active?1:0.55}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:36,height:36,borderRadius:18,background:p.active?p.color:I.border,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
                {i<2&&<div style={{width:2,flex:1,background:I.border,marginTop:4}}/>}
              </div>
              <div style={{flex:1,paddingBottom:8}}>
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <TagPill color={p.color} bg={p.bg}>{p.phase}</TagPill>
                  <TagPill color={I.muted} bg="#F1F5F9">{p.weeks}</TagPill>
                  {p.active&&<TagPill color={I.teal} bg={I.tealL}>← You are here</TagPill>}
                </div>
                <h3 style={{fontWeight:800,fontSize:15,color:I.dark,margin:"0 0 8px"}}>{p.title}</h3>
                <Card style={{fontSize:13,color:I.mid,lineHeight:1.6}}>{p.desc}</Card>
              </div>
            </div>
          ))}

          {/* Supplement checklist */}
          <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:4,marginTop:8}}>💊 Supplement Schedule</h2>
          <p style={{fontSize:12,color:I.muted,marginBottom:12}}>Tap each to mark as taken. Timed throughout the day for max absorption.</p>
          {SUPPLEMENTS.map((s,i)=>(
            <div key={i} onClick={()=>toggleSupp(i)} style={{display:"flex",gap:12,alignItems:"flex-start",background:"white",borderRadius:14,padding:"12px 14px",border:`1.5px solid ${suppChecked[i]?I.teal:I.border}`,marginBottom:10,cursor:"pointer",opacity:suppChecked[i]?0.7:1,transition:"all 0.2s"}}>
              <div style={{width:40,height:40,borderRadius:20,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💊</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{fontWeight:800,fontSize:13,color:I.dark}}>{s.label} — <span style={{color:s.color}}>{s.dose}</span></div>
                  <TagPill color={I.muted} bg="#F1F5F9">{s.time}</TagPill>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:I.teal,marginTop:2}}>Take with {s.with}</div>
                <div style={{fontSize:11,color:I.mid,marginTop:4,lineHeight:1.4}}>{s.note}</div>
              </div>
              <div style={{width:22,height:22,borderRadius:11,background:suppChecked[i]?I.teal:I.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                {suppChecked[i]&&<Check size={13} color="white" strokeWidth={3}/>}
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:I.muted,textAlign:"center",marginBottom:20}}>
            {suppChecked.filter(Boolean).length}/{SUPPLEMENTS.length} supplements taken today
          </div>

          {/* Diet + macros */}
          <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:4}}>🥗 Nutrition & Macros</h2>
          <p style={{fontSize:12,color:I.muted,marginBottom:12}}>Science-backed anti-inflammatory eating for faster recovery.</p>

          {/* Body profile / macros */}
          {saved.plan==="free"?(
            <Card style={{marginBottom:16,border:`1.5px solid ${I.indigo}40`,background:I.indigoL}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:28}}>📊</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:13,color:I.indigo}}>Personalised Macros — Pro Feature</div>
                  <div style={{fontSize:12,color:I.mid,marginTop:2}}>Upgrade to Pro to get your exact daily protein, carbs, and fat targets based on your height, weight, and goal.</div>
                </div>
              </div>
              <button onClick={()=>{window.open(PLAN_PRO_URL,"_blank");onUpgrade("pro");}} style={{width:"100%",marginTop:10,padding:"10px",borderRadius:10,background:I.indigo,color:"white",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>Upgrade to Pro →</button>
            </Card>
          ) : showBodyForm&&!bodyProfile ? (
            <BodyProfileForm onSave={p=>{
              setBodyProfile(p); setShowBodyForm(false);
              const s=loadState(); if(s){s.bodyProfile=p;saveState(s);}
            }}/>
          ) : macros ? (
            <Card style={{marginBottom:16,background:`linear-gradient(135deg,${I.tealL},#F0FDF4)`,border:`1.5px solid ${I.teal}40`}}>
              <div style={{fontWeight:800,fontSize:13,color:I.teal,marginBottom:12}}>📊 Your Daily Targets</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {[
                  {label:"Calories",val:`${macros.calories}`,unit:"kcal",color:I.orange},
                  {label:"Protein",val:`${macros.protein}g`,unit:"recovery priority",color:I.indigo},
                  {label:"Carbs",val:`${macros.carbs}g`,unit:"energy + repair",color:I.amber},
                  {label:"Fat",val:`${macros.fat}g`,unit:"hormone + joint",color:I.teal},
                ].map((m,i)=>(
                  <div key={i} style={{background:"white",borderRadius:12,padding:"10px",textAlign:"center",border:`1px solid ${I.border}`}}>
                    <div style={{fontWeight:900,fontSize:18,color:m.color}}>{m.val}</div>
                    <div style={{fontWeight:700,fontSize:11,color:I.dark}}>{m.label}</div>
                    <div style={{fontSize:9,color:I.muted}}>{m.unit}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:I.mid,lineHeight:1.5}}>Based on Mifflin-St Jeor formula. Protein set at 2g/kg — elevated for injury recovery (source: Tipton & Wolfe, J Am Coll Nutr).</div>
              <button onClick={()=>setShowBodyForm(true)} style={{marginTop:8,fontSize:11,color:I.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Update my measurements</button>
            </Card>
          ):null}

          {/* Diet guide */}
          {DIET_GUIDE.map((d,i)=>(
            <Card key={i} style={{marginBottom:10}}>
              <div style={{fontWeight:800,fontSize:12,color:I.indigo,marginBottom:6}}>{d.category}</div>
              <div style={{fontSize:12,color:I.dark,lineHeight:1.5,marginBottom:4}}><span style={{fontWeight:700}}>✓ Eat: </span>{d.foods}</div>
              <div style={{fontSize:11,color:I.red,lineHeight:1.4}}><span style={{fontWeight:700}}>✗ Avoid: </span>{d.avoid}</div>
            </Card>
          ))}
        </div>
      );

      case "squad": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>{sport?.icon} {sport?.label} Squad</h1>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:8,height:8,borderRadius:4,background:I.teal,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:13,fontWeight:700,color:I.teal}}>{sport?.liveUsers.toLocaleString()} athletes active right now</span>
          </div>

          {/* New post */}
          <Card style={{marginBottom:16}}>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`Share your recovery update with the ${sport?.label} squad...`}
              style={{width:"100%",minHeight:70,border:"none",outline:"none",fontSize:13,color:I.dark,resize:"none",fontFamily:"inherit",background:"transparent"}}/>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button onClick={handleNewPost} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:I.indigo,color:"white",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>
                <Send size={13}/> Post
              </button>
            </div>
          </Card>

          {/* Posts */}
          {posts.map(p=>(
            <Card key={p.id} style={{marginBottom:12}}>
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{sport?.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:I.dark}}>{p.author}</div>
                  <div style={{fontSize:10,color:I.muted}}>{sport?.label} Recovery</div>
                </div>
              </div>
              <p style={{fontSize:13,color:I.mid,lineHeight:1.5,margin:"0 0 10px"}}>{p.msg}</p>

              {/* Replies */}
              {p.replies.length>0&&(
                <div style={{borderLeft:`2px solid ${I.border}`,paddingLeft:12,marginBottom:10}}>
                  {p.replies.map((r,ri)=>(
                    <div key={ri} style={{marginBottom:6}}>
                      <span style={{fontWeight:700,fontSize:11,color:I.dark}}>{r.author}: </span>
                      <span style={{fontSize:11,color:I.mid}}>{r.msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo===p.id&&(
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write a reply..."
                    style={{flex:1,padding:"8px 12px",borderRadius:10,border:`1.5px solid ${I.indigo}`,fontSize:12,fontFamily:"inherit",outline:"none"}}
                    onKeyDown={e=>e.key==="Enter"&&handleReply(p.id)}/>
                  <button onClick={()=>handleReply(p.id)} style={{padding:"8px 12px",borderRadius:10,background:I.indigo,color:"white",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>
                    <Send size={13}/>
                  </button>
                </div>
              )}

              <div style={{display:"flex",gap:12}}>
                <button onClick={()=>handleLike(p.id)} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,color:p.likedByMe?I.red:I.muted,background:"none",border:"none",cursor:"pointer"}}>
                  <Heart size={14} fill={p.likedByMe?I.red:"none"} color={p.likedByMe?I.red:I.muted}/> {p.likes}
                </button>
                <button onClick={()=>setReplyingTo(replyingTo===p.id?null:p.id)} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,color:I.muted,background:"none",border:"none",cursor:"pointer"}}>
                  <MessageCircle size={14}/> Reply
                </button>
              </div>
            </Card>
          ))}
        </div>
      );

      case "rewards": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Milestones</h1>
          <p style={{fontSize:13,color:I.muted,marginBottom:6}}>Stay consistent. Unlock badges as you progress.</p>
          <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:16,padding:"14px 16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6}}>YOUR STREAK</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <StreakFire streak={saved.streak} alive={saved.streakAlive}/>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>days {saved.streakAlive?"strong":"— relight it today!"}</div>
            </div>
            <ProgressBar pct={pct} color={I.yellow}/>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4}}>Day {dayNum} of {(injury?.weeks||36)*7} · {pct}% complete</div>
          </Card>
          {MILESTONES.map((m,i)=>{
            const unlocked=dayNum>=m.day;
            const isNext=!unlocked&&(i===0||dayNum>=MILESTONES[i-1].day);
            return (
              <Card key={i} style={{marginBottom:12,opacity:(!unlocked&&!isNext)?0.4:1,border:unlocked?`1.5px solid ${I.teal}`:isNext?`1.5px solid ${I.indigo}40`:`1.5px solid ${I.border}`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:46,height:46,borderRadius:23,background:unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.badge}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontWeight:800,fontSize:14,color:unlocked?I.teal:I.dark}}>{m.title}</span>
                      <TagPill color={unlocked?I.teal:isNext?I.indigo:I.muted} bg={unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9"}>Day {m.day}</TagPill>
                    </div>
                    {unlocked&&<div style={{fontSize:10,fontWeight:800,color:I.teal,marginBottom:4}}>✓ UNLOCKED</div>}
                    {isNext&&<div style={{fontSize:10,fontWeight:800,color:I.indigo,marginBottom:4}}>{m.day-dayNum} days away</div>}
                    <div style={{fontSize:12,color:I.mid,marginBottom:6}}>{m.reward}</div>
                    <div style={{fontSize:11,fontStyle:"italic",color:I.muted,borderLeft:`2px solid ${unlocked?I.teal:I.border}`,paddingLeft:8}}>{m.verse}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      );

      case "avatar": return (
        <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
          {saved.plan!=="elite"?(
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <Crown size={48} color={I.yellow} style={{marginBottom:16}}/>
              <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:8}}>Elite Feature</h2>
              <p style={{fontSize:14,color:I.muted,marginBottom:24,lineHeight:1.6}}>Your personal AI avatar trainer is exclusive to the Elite plan. It reacts to your progress, gives daily coaching, and celebrates your wins.</p>
              <button onClick={()=>{window.open(PLAN_ELITE_URL,"_blank");onUpgrade("elite");}} style={{width:"100%",padding:"16px",borderRadius:14,background:I.yellow,color:I.dark,fontWeight:900,fontSize:16,border:"none",cursor:"pointer"}}>
                👑 Unlock Elite — $28.99/mo
              </button>
            </div>
          ) : !saved.avatar ? (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:48,marginBottom:16}}>🤖</div>
              <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:8}}>Build Your Trainer</h2>
              <p style={{fontSize:14,color:I.muted,marginBottom:24}}>Create your personalised AI coach who will guide you daily.</p>
              <PrimaryBtn onClick={()=>setShowAvatarBuilder(true)}>Build My Avatar →</PrimaryBtn>
            </div>
          ) : (
            <>
              <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Your Trainer</h1>
              <p style={{fontSize:13,color:I.muted,marginBottom:20}}>Your personalised AI recovery coach.</p>
              <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
                <div style={{background:"white",borderRadius:24,padding:24,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",border:`2px solid ${I.indigo}30`,display:"inline-flex",flexDirection:"column",alignItems:"center",gap:12}}>
                  <AvatarDisplay avatar={saved.avatar} size={140} mood={avatarMood}/>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontWeight:900,fontSize:16,color:I.dark}}>Your Coach</div>
                    <div style={{fontSize:11,color:I.muted}}>{saved.avatar.bodyType} · {saved.avatar.hairStyle} hair</div>
                  </div>
                </div>
              </div>
              <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:11,color:I.indigo,marginBottom:8}}>TODAY'S COACHING</div>
                <p style={{fontSize:14,fontStyle:"italic",color:I.dark,lineHeight:1.65,fontFamily:"Georgia,serif",margin:0}}>{avatarQuote}</p>
              </Card>
              {/* Mood legend */}
              <Card style={{marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:13,color:I.dark,marginBottom:10}}>Your trainer reacts to your progress</div>
                {[
                  {mood:"excited" as const,label:"All tasks done",desc:"Maximum celebration mode"},
                  {mood:"happy" as const,label:">60% tasks done",desc:"Proud and encouraging"},
                  {mood:"neutral" as const,label:"Making progress",desc:"Steady, focused coaching"},
                  {mood:"sad" as const,label:"Streak lost",desc:"Concerned but supportive"},
                ].map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <AvatarDisplay avatar={saved.avatar!} size={40} mood={m.mood}/>
                    <div>
                      <div style={{fontWeight:700,fontSize:12,color:I.dark}}>{m.label}</div>
                      <div style={{fontSize:11,color:I.muted}}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <button onClick={()=>setShowAvatarBuilder(true)} style={{width:"100%",padding:"12px",borderRadius:12,background:"transparent",color:I.indigo,fontWeight:700,fontSize:13,border:`1.5px solid ${I.indigo}`,cursor:"pointer"}}>
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
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>{renderTab()}</div>
      <div style={{flexShrink:0,background:"white",boxShadow:"0 -1px 0 rgba(15,23,42,0.08),0 -4px 12px rgba(15,23,42,0.06)",paddingBottom:"env(safe-area-inset-bottom,12px)",paddingTop:10,paddingLeft:4,paddingRight:4,display:"flex",justifyContent:"space-around",alignItems:"flex-end",zIndex:50}}>
        <NavBtn icon={<Home size={20}/>}     label="Home"    active={tab==="home"}     onClick={()=>setTab("home")}/>
        <NavBtn icon={<BookOpen size={20}/>} label="Protocol"active={tab==="protocol"} onClick={()=>setTab("protocol")}/>
        <button onClick={()=>setTab("today")} style={{width:56,height:56,borderRadius:28,background:tab==="today"?I.yellow:"#1C1C2E",display:"flex",alignItems:"center",justifyContent:"center",border:"4px solid white",boxShadow:"0 4px 14px rgba(15,23,42,0.25)",cursor:"pointer",marginBottom:4,flexShrink:0}}>
          <Dumbbell size={22} color={tab==="today"?I.dark:"white"}/>
        </button>
        <NavBtn icon={<Users size={20}/>}   label="Squad"   active={tab==="squad"}    onClick={()=>setTab("squad")}/>
        <NavBtn icon={saved.plan==="elite"?<Crown size={20}/>:<Trophy size={20}/>} label={saved.plan==="elite"?"Avatar":"Rewards"} active={tab==="avatar"||tab==="rewards"} onClick={()=>setTab(saved.plan==="elite"?"avatar":"rewards")}/>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App(){
  type Screen="welcome"|"sport"|"injury"|"severity"|"goal"|"plan"|"dashboard";
  const [saved,setSaved]=useState<SavedState|null>(()=>loadState());
  const [screen,setScreen]=useState<Screen>(()=>loadState()?"dashboard":"welcome");
  const [sport,setSport]=useState<typeof SPORTS[0]|undefined>();
  const [injury,setInjury]=useState<typeof INJURIES[0]|undefined>();
  const [severity,setSeverity]=useState<typeof SEVERITIES[0]|undefined>();
  const [goal,setGoal]=useState<typeof GOALS_LIST[0]|undefined>();

  // Streak logic on load
  useEffect(()=>{
    const s=loadState();
    if(!s)return;
    const today=todayStr();
    if(s.lastActiveDate===today)return;
    const diff=daysBetween(s.lastActiveDate,today);
    let newStreak=s.streak;
    let alive=s.streakAlive;
    if(diff===1){ newStreak=s.streak+1; alive=true; }
    else if(diff>1){ newStreak=0; alive=false; }
    const updated={...s,lastActiveDate:today,streak:newStreak,streakAlive:alive};
    saveState(updated);
    setSaved(updated);
  },[]);

  const handlePlanDone=(plan:"free"|"pro"|"elite")=>{
    if(!sport||!injury||!severity||!goal)return;
    const today=todayStr();
    const newState:SavedState={
      sportId:sport.id, injuryId:injury.id, severityId:severity.id, goalId:goal.id,
      startDate:today, lastActiveDate:today, streak:1, streakAlive:true,
      completedTasks:{}, suppChecked:{}, unlockedMilestones:[],
      plan, trialStartDate:today, avatar:null, bodyProfile:null, posts:{},
    };
    saveState(newState);
    setSaved(newState);
    setScreen("dashboard");
  };

  const handleUpgrade=(plan:"pro"|"elite")=>{
    const s=loadState();
    if(s){const updated={...s,plan};saveState(updated);setSaved(updated);}
  };

  const handleReset=()=>{ clearState();setSaved(null);setSport(undefined);setInjury(undefined);setSeverity(undefined);setGoal(undefined);setScreen("welcome"); };

  return (
    <div style={{width:"100%",height:"100dvh",maxWidth:430,margin:"0 auto",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",boxShadow:"0 0 40px rgba(15,23,42,0.15)"}}>
      {screen==="welcome"  && <div style={{flex:1,overflowY:"auto"}}><Welcome onNext={()=>setScreen("sport")}/></div>}
      {screen==="sport"    && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SportSelect    onNext={s=>{setSport(s);    setScreen("injury");}}/></div>}
      {screen==="injury"   && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><InjurySelect   onNext={i=>{setInjury(i);   setScreen("severity");}}/></div>}
      {screen==="severity" && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SeveritySelect onNext={sv=>{setSeverity(sv);setScreen("goal");}}/></div>}
      {screen==="goal"     && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><GoalSelect     onNext={g=>{setGoal(g);     setScreen("plan");}}/></div>}
      {screen==="plan"     && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><PlanSelect     onNext={handlePlanDone}/></div>}
      {screen==="dashboard"&& saved&&<AppDashboard saved={saved} onReset={handleReset} onUpgrade={handleUpgrade}/>}
    </div>
  );
}
