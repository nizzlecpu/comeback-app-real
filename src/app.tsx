import { useState, ReactNode } from "react";
import { Check, ChevronRight, Trophy, Users, Lock, Gift, Home, BookOpen, Star, Dumbbell, Flame } from "lucide-react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const I = {
  indigo:  "#6366F1", indigoL: "#EDE9FE", indigoT: "#6D28D9",
  teal:    "#10B981", tealL:   "#D1FAE5",
  yellow:  "#E8FF47",
  red:     "#EF4444", orange:  "#F97316",
  sky:     "#0EA5E9", purple:  "#A855F7",
  amber:   "#F59E0B", pink:    "#EC4899",
  dark:    "#0F172A", mid:     "#334155", muted:   "#64748B", subtle:  "#94A3B8",
  bg:      "#EBF5FD", card:    "#FFFFFF", border:  "#E2E8F0",
};

// ── ATHLETES + SPORTS ─────────────────────────────────────────────────────────
const SPORTS = [
  {id:"basketball",label:"Basketball",icon:"🏀",color:I.orange,athlete:"LeBron James",
   quotes:['"Ice 20 min, elevate above your heart, then compress. Don\'t rush the timeline – careers end from coming back too soon."','"Sleep is my best recovery tool. I sleep 12 hours a night during heavy training. You can\'t out-train bad sleep."','"Ice baths changed my career longevity. 10 minutes at 55°F post-game. Your body adapts faster than you think."','"Nutrition timing is everything. 30g protein within 20 min of stopping. That window is real."','"Mind over matter is real but so is the protocol. I trust the science AND the faith. Both."','"Two-a-days in rehab are a myth. One focused session is worth three lazy ones."','"The hardest day is day 3. Push through it. That\'s where most people quit."']},
  {id:"football",label:"Football",icon:"🏈",color:"#16A34A",athlete:"Patrick Mahomes",
   quotes:['"Work the range of motion before you add resistance. I tore my ankle – patience in week 1–2 saved my season."','"Visualization during recovery is underrated. I watched film and mentally rehearsed plays every day I couldn\'t practice."','"The weight room isn\'t for week 1 of rehab. Inflammation first, then strength. Honor the order."','"Cold tub is non-negotiable. 8 minutes. Every single session. No exceptions in season."','"Your PT is your co-coach. Listen to them like you\'d listen to Andy Reid. They know what they\'re looking at."','"Fear of re-injury is the real enemy. Address it mentally as much as physically."','"When I came back from the ankle, I was 80% physically but 60% mentally. The mental work took longer."']},
  {id:"soccer",label:"Soccer",icon:"⚽",color:I.sky,athlete:"Cristiano Ronaldo",
   quotes:['"Cold water immersion after every session. Consistency beats intensity in recovery – every single time."','"I spend more on recovery than most players earn. Cryotherapy, NormaTec, Theragun – it\'s not vanity. It\'s my career."','"Sleep 8 hours minimum. I actually nap twice during heavy training periods. Recovery happens when you\'re unconscious."','"Nutrition is 50% of recovery. I eliminated alcohol completely at 25. That decision extended my career by a decade."','"The mind is the first muscle that breaks. Train it. I visualize every recovery milestone like I visualize goals."','"Flexibility saved my knees. 30 minutes of mobility work before every session, no matter what. Non-negotiable."','"Pressure to return early is real. I learned to ignore it. Coming back at 95% is worth more than returning at 75%."']},
  {id:"baseball",label:"Baseball",icon:"⚾",color:I.red,athlete:"Shohei Ohtani",
   quotes:['"Rotator cuff work is never optional. Five minutes of band work daily prevented my second surgery."','"Pitching and hitting both demand different recovery protocols. I had to learn two separate systems. Double the discipline."','"Arm care starts before you feel pain. By the time it hurts, you\'re already behind the curve."','"Sleep quality over quantity sometimes. I track HRV. If it\'s low, I adjust the day\'s load. Data doesn\'t lie."','"Mental recovery from Tommy John takes longer than physical. You need to trust the arm again. Build that trust slowly."','"My interpreter once asked me what recovery meant to me. I said: it\'s just another form of training. Same mindset."','"Cross-training in the pool saved my shoulder. Zero impact, full range of motion, cardiovascular maintained."']},
  {id:"tennis",label:"Tennis",icon:"🎾",color:"#65A30D",athlete:"Serena Williams",
   quotes:['"Listen to inflammation signals. I pushed through pain twice and paid for it. Let the body lead."','"Coming back after having my daughter was the hardest recovery of my life. Postpartum + athlete recovery is its own science."','"Your team matters as much as your protocol. Bad PT advice early in my career cost me 6 extra weeks."','"Mental game breaks down first in long recoveries. Journaling every day kept me sane and focused."','"Eccentric strengthening for tendons – that\'s the real work. Slow, controlled, painful in the right way."','"I cried on the way to every early PT session. That\'s okay. Cry and then do the work."','"Protein and collagen supplementation at the right times accelerated my tissue repair. Work with a sports dietitian."']},
  {id:"track",label:"Track & Field",icon:"🏃",color:I.purple,athlete:"Usain Bolt",
   quotes:['"Hip flexor mobility is the unlock. Twenty minutes of floor work changed my return timeline completely."','"I almost quit after my first hamstring tear. My coach told me: the body remembers what you build. Start building again."','"Speed is neurological as much as muscular. Your nervous system needs retraining. Gradual intensity is not weakness."','"The mental side of hamstring recovery is unique. Every sprint attempt carries fear. You have to reprogram that."','"My father told me: God didn\'t give you these legs to sit. That got me off the couch on day 5."','"Recovery diet should be treated like race prep diet. I never let it slip. Same discipline, different goal."','"Water running kept my fitness while my leg healed. Ugly, boring, and worth every minute."']},
  {id:"swimming",label:"Swimming",icon:"🏊",color:I.sky,athlete:"Michael Phelps",
   quotes:['"Shoulder recovery is 60% sleep. I did 9 hours minimum after surgery and my timeline beat every projection."','"Depression during recovery is real and common. I wasn\'t prepared for that. Get a therapist, not just a PT."','"Bob Bowman told me recovery is a race too. I started treating rehab sessions with the same intensity as training."','"The pool is both the place I got hurt and the place I healed. Learning to love it again took mental work."','"Consistency over intensity in rehab. Show up every day, even if you can only do 20%. The 20% compounds."','"Anti-inflammatory nutrition changed my recovery speed after 2008. Less inflammation = more adaptation."','"Gratitude practice during recovery kept me from spiraling. What CAN you do today? Do that with everything."']},
  {id:"volleyball",label:"Volleyball",icon:"🏐",color:I.amber,athlete:"Misty May-Treanor",
   quotes:['"Single-leg balance work from day 3. Your nervous system needs retraining as much as your tissue does."','"I played injured for a season before snapping. That taught me: smart is smarter than tough."','"The beach training after knee surgery gave me patience. You can\'t fake sand training. Your body tells the truth."','"Compression therapy post-training became my ritual. Legs up the wall, 30 minutes. Sacred time."','"My comeback was powered by two things: protocol and prayer. Don\'t underestimate either."','"Core stability is the foundation of everything in volleyball. I rebuilt mine before I touched the ball again."','"Track your swelling daily. Photos, measurements. Data removes emotion from decision-making."']},
  {id:"golf",label:"Golf",icon:"⛳",color:"#16A34A",athlete:"Tiger Woods",
   quotes:['"Core is everything. I rebuilt my back recovery around deep stabilizers – not surface muscles."','"I\'ve had five knee surgeries and four back surgeries. Each one taught me to never skip the small work."','"The mental component of coming back from physical injury in golf is enormous. You have to rebuild your swing identity."','"Pain management without masking is an art. I had to learn what pain meant vs. what was just sensation."','"My mother told me to be patient. I ignored her. She was right. Patience is a skill, not a personality trait."','"My last comeback was the most meaningful win of my career. What you rebuild is more valuable than what you started with."','"Strength training saved my back, but only when it was programmed correctly. Ego in the weight room will re-injure you."']},
  {id:"mma",label:"MMA / Combat",icon:"🥊",color:I.red,athlete:"Conor McGregor",
   quotes:['"Fascia work – daily rolling for 20 min. It\'s unglamorous but it\'s what separates a 6-month timeline from 4."','"I came back from a broken leg and won. They said my career was over. I used that as fuel every single day."','"Combat sports recovery is unique because you\'re rehabbing from trauma, not just overuse. Mental toughness is mandatory."','"Ice, elevation, and time. People want shortcuts. The shortcut IS the protocol. Do it correctly, do it fast."','"My team kept me sane during recovery. Isolation kills motivation. Surround yourself with people who believe in the comeback."','"Every champion has a comeback story. Mine just had more surgeries than most."','"The leg snapped. I watched it happen. Getting past that visual memory was 30% of my recovery."']},
  {id:"gymnastics",label:"Gymnastics",icon:"🤸",color:I.pink,athlete:"Simone Biles",
   quotes:['"Mental recovery is as real as physical. I work with a sports psych weekly – don\'t skip the mind."','"Taking time off to heal was not weakness. It was the bravest athletic decision I\'ve ever made."','"The twisties are real and so is coming back from them. Trust your body\'s timeline, not anyone else\'s pressure."','"I told myself: you\'ve trained for thousands of hours. That doesn\'t disappear during injury. It waits for you."','"Every gymnast is afraid of heights at some point. Fear during recovery is just another skill to master."','"My coaches always said: the body will catch up to where the mind already went. Believe that."','"Strength training off the mat kept my competitive edge alive while my ankle healed. Never stop training completely."']},
  {id:"cycling",label:"Cycling",icon:"🚴",color:I.indigo,athlete:"Chris Froome",
   quotes:['"Rebuild pedal cadence before power. I was at 90 RPM before I touched resistance after my crash."','"I was in a coma for a week. The doctors said I\'d never race again. I won Stage 8 at Vuelta the following year."','"Recovery from catastrophic injury requires rebuilding your identity as an athlete, not just your body."','"The first time back on the bike after my crash, I cried at the top of the first climb. Let yourself feel it."','"Bone density nutrition: calcium, vitamin D3. Don\'t neglect this for fractures. Your skeleton needs feeding."','"My physiotherapist was more important than my coach during my comeback year. Invest in the right team."','"Small wins compound. First rotation, first kilometer, first climb. Celebrate each one. It\'s not weakness."']},
  {id:"hockey",label:"Hockey",icon:"🏒",color:I.mid,athlete:"Sidney Crosby",
   quotes:['"Concussion protocol is sacred. I sat out when I felt fine – it protected me for another decade."','"I missed 10 months with post-concussion syndrome. That patience was the hardest thing I\'ve ever done in sports."','"Light sensitivity, headaches, nausea – they told me it would pass. It did. The protocol works if you follow it."','"Cognitive rest is a skill. Your brain needs quiet to heal. Social media, bright screens, loud environments – cut them."','"Coming back from a concussion is 100% a mental game by phase 3. The fear of another one is real."','"My teammates supported my protocol even when they needed me on the ice. A good team respects your recovery."','"Sleep became medicine for me during concussion recovery. 10 hours, dark room, no devices. Life-changing."']},
  {id:"rugby",label:"Rugby",icon:"🏉",color:I.amber,athlete:"Richie McCaw",
   quotes:['"Proprioception drills – ankle boards, BOSU, single leg. Do them religiously before every session."','"Rugby teaches you to play through pain. Injury rehab taught me that sometimes playing through it is wrong."','"I\'ve broken ribs, torn ligaments, broken my hand. Recovery mindset: methodical, patient, professional."','"The hardest thing is maintaining team connection while injured. Invest in that relationship – it fuels the comeback."','"My captain instinct said get back fast. My doctor said get back right. Listen to your doctor."','"Cold water tubs in New Zealand changed my recovery rate. Especially shoulder and knee inflammation."','"Week 3 is the mental valley. Your injury doesn\'t hurt as much but you\'re not close enough to return. Push hardest then."']},
  {id:"lacrosse",label:"Lacrosse",icon:"🥍",color:"#92400E",athlete:"Paul Rabil",
   quotes:['"Eccentric loading is the cheat code for tendon recovery. Slow negatives rewire the tissue faster."','"I tore my ACL twice. The second time, I knew exactly what to do and came back 3 weeks ahead of schedule."','"The brotherhood of sport is most powerful when you\'re injured. Let your teammates lift you."','"Biomechanical analysis after my second ACL was the best money I spent. Fix the root cause, not just the symptom."','"Lacrosse is 80% lower body explosiveness. Every drill I chose served my sport-specific return. Purposeful rehab."','"Your diet during surgery recovery matters 3x more than normal training. You\'re building tissue from scratch."','"Faith over fear. I wrote that on my wrist brace every session. It became a mantra that outlasted the injury."']},
];

// ── INJURIES ──────────────────────────────────────────────────────────────────
const INJURIES = [
  {id:"acl",label:"ACL Tear",icon:"🦵",weeks:36,severity:"Major",
   phase1:"Weeks 1–6: Swelling control, quad activation, ROM 0–90°. Ice protocol 20 min/hr, NSAIDs as directed. Goal: full extension, reduce effusion.",
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
   phase1:"Weeks 1–6: Non-weight-bearing. Bone density nutrition critical: calcium 1200mg, D3 2000IU, K2 100mcg.",
   phase2:"Weeks 7–10: Pool running, stationary bike only. Absolutely no impact loading.",
   phase3:"Weeks 11–14: Impact reintroduction 25% increments weekly. Bone scan clearance required before return."},
  {id:"shin",label:"Shin Splints",icon:"🦵",weeks:6,severity:"Mild",
   phase1:"Days 1–10: Rest from running, ice massage shin 10 min 3×/day, calf stretching. Identify training error.",
   phase2:"Weeks 2–4: Swimming, stationary bike, calf strengthening. Arch support check. Orthotics if overpronation.",
   phase3:"Weeks 5–6: Walk-run intervals (Galloway method), gait analysis, 10% rule for volume increases."},
  {id:"tennis_elbow",label:"Tennis Elbow",icon:"💪",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–3: Rest, ice, topical anti-inflammatories. Counterforce brace during any gripping activity.",
   phase2:"Weeks 4–7: Tyler Twist eccentric wrist curls 3×15 (gold standard per Stasinopoulos 2013), deep tissue massage.",
   phase3:"Weeks 8–10: Sport-grip reintroduction at 50→75→100% load. Drop arm technique coaching."},
  {id:"concussion",label:"Concussion",icon:"🧠",weeks:6,severity:"Major",
   phase1:"Days 1–5: Full cognitive and physical rest. Dark room, no screens, no reading. Symptom monitoring every 2 hours.",
   phase2:"Weeks 2–4: Sub-symptom aerobic exercise only. Buffalo Concussion Treadmill Test protocol. Light aerobic only.",
   phase3:"Weeks 5–6: Sport-specific non-contact drills. SCAT5 clearance + physician sign-off required."},
  {id:"plantar",label:"Plantar Fasciitis",icon:"🦶",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–2: Night splint every night, frozen water bottle rolling 3×/day, first-step stretch protocol.",
   phase2:"Weeks 3–6: Alfredson eccentric heel drops (3×15 straight + bent knee daily), Strassburg sock overnight.",
   phase3:"Weeks 7–10: Running reintroduction, footwear review, taping (low-Dye technique), 10% load rule."},
  {id:"back",label:"Lower Back Strain",icon:"🔙",weeks:8,severity:"Moderate",
   phase1:"Weeks 1–2: McKenzie extension protocol, avoid spinal flexion. Cat-cow, bird-dog, decompression walks.",
   phase2:"Weeks 3–5: McGill Big 3 (curl-up, side plank, bird-dog), dead bug progression, hip hinge patterning.",
   phase3:"Weeks 6–8: Deadlift at bodyweight, RDL, core loading. Return to sport when pain-free through full ROM."},
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
   phase3:"Weeks 6–8: Change-of-direction drills (T-test), return-to-sport criteria: squeeze test pain-free + 80% strength."},
  {id:"quad",label:"Quad Strain",icon:"🦵",weeks:10,severity:"Moderate",
   phase1:"Weeks 1–2: Ice, compression, static quad sets. No knee flexion past 90°. Crutches if Grade 2+.",
   phase2:"Weeks 3–6: Leg press 30-70° range, stationary bike, eccentric loading begins week 4.",
   phase3:"Weeks 7–10: Sprint reintroduction at graduated % of max, RTP test: 80%+ isokinetic strength symmetry."},
  {id:"achilles",label:"Achilles Tendon",icon:"🦶",weeks:26,severity:"Major",
   phase1:"Weeks 1–8: Boot immobilization, no plantarflexion. Upper body only. Bone/tendon nutrition.",
   phase2:"Weeks 9–18: Alfredson protocol eccentric heel drops 3×15 twice daily (evidence-grade A), pool walking.",
   phase3:"Weeks 19–26: Running protocol (walk→jog→run→sprint), jumping drills, VISA-A score ≥90 before clearance."},
];

// ── SEVERITY OPTIONS ──────────────────────────────────────────────────────────
const SEVERITIES = [
  {id:"mild",       label:"Mild",        icon:"🟡", desc:"Minor discomfort, partial activity possible",   color:"#854D0E", bg:"#FEF9C3"},
  {id:"moderate",   label:"Moderate",    icon:"🟠", desc:"Significant pain, limited activity",            color:"#9A3412", bg:"#FFEDD5"},
  {id:"severe",     label:"Severe",      icon:"🔴", desc:"Major injury, minimal activity",                color:"#991B1B", bg:"#FEE2E2"},
  {id:"post_surgery",label:"Post-Surgery",icon:"🏥",desc:"Surgical recovery, strict protocol required",  color:"#1E3A5F", bg:"#DBEAFE"},
];

// ── GOALS ─────────────────────────────────────────────────────────────────────
const GOALS = [
  {id:"return",  label:"Return to Sport",    icon:"🏆", desc:"Full competitive return"},
  {id:"pain",    label:"Pain-Free Living",   icon:"💆", desc:"Manage pain, improve daily function"},
  {id:"fitness", label:"Maintain Fitness",   icon:"💪", desc:"Stay strong while healing"},
  {id:"fast",    label:"Fastest Recovery",   icon:"⚡", desc:"Optimise every variable"},
];

// ── PLANS ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {id:"free",  label:"Free",    price:"$0",  icon:"🌱", features:["Daily protocol","Basic exercises","Community access"]},
  {id:"pro",   label:"Pro",     price:"$9/mo",icon:"⚡",features:["Everything in Free","AI coaching","Video library","Progress analytics"]},
  {id:"elite", label:"Elite",   price:"$29/mo",icon:"🏆",features:["Everything in Pro","1-on-1 PT consults","Custom meal plans","Priority support"]},
];

// ── EXERCISE PROTOCOLS (abbreviated — full data same as original) ─────────────
type Task = {time:string,task:string,icon:string,iconColor:string,iconBg:string};

const DEFAULT_PROTOCOL: Task[] = [
  {time:"7:00 AM",  task:"Morning mobility warm-up — 10 min gentle movement to activate circulation",        icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
  {time:"8:00 AM",  task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Magnesium 400 mg",                    icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
  {time:"10:00 AM", task:"Targeted rehab exercises — follow your PT's prescribed set (3 rounds)",            icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
  {time:"12:00 PM", task:"Anti-inflammatory meal: 40g protein + leafy greens + healthy fats",               icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
  {time:"2:00 PM",  task:"Ice/compression 20 min on injury site + elevation",                               icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
  {time:"4:00 PM",  task:"Low-impact cardio: stationary bike or pool walking 20 min",                       icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
  {time:"6:00 PM",  task:"Evening strengthening: upper body or non-injured muscle groups 3×15",             icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
  {time:"9:00 PM",  task:"9-hour sleep target — growth hormone peaks during deep sleep, accelerating repair",icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
];

const EXERCISE_PROTOCOLS: Record<string, Record<string, Task[]>> = {
  acl: {
    mild: [
      {time:"7:00 AM", task:"Quad sets (supine) — tighten quad, hold 10s, release. 3×20 reps | 🏠 Home",                               icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Magnesium 400 mg",                                             icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Mini-squat 0–45° (pain-free range only) 3×15 + calf raises 3×20 | 🏠 Home or 🏋️ Gym",                    icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"Anti-inflammatory meal — 40g protein (chicken/fish/eggs) + leafy greens + berries",                        icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Stationary bike 20 min @ >80 RPM low resistance — maintains cardio without impact | 🏋️ Gym",              icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Ice pack 15 min on knee + compression wrap + leg elevated above heart | 🏠 Home",                          icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"6:00 PM", task:"Hip abductor band walks 3×20 steps each direction + single-leg balance 3×30s | 🏠 Home",                   icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"9:00 PM", task:"9-hour sleep target — growth hormone peaks during deep sleep, accelerating tissue repair",                  icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    moderate: [
      {time:"7:00 AM", task:"Straight leg raise 3×15 + terminal knee extension (TKE) with band 3×20 | 🏠 Home",                        icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Zinc 15 mg + Vitamin C 1,000 mg",                             icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Leg press 30–70° (avoid full extension) 3×15 @ 40% 1RM + step-ups 4\" box 3×12 | 🏋️ Gym",               icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"High-protein meal: 45–50g protein + anti-inflammatory fats (salmon, avocado, olive oil)",                  icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Ice 20 min post-exercise + compression + elevation — reduces effusion and speeds recovery",                 icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Stationary bike 25 min moderate OR pool walking 20 min (offloads joint 60%) | 🏋️/🏊 Pool",               icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"6:00 PM", task:"Nordic curl eccentric phase only (controlled lowering, 3×8) — gold standard for hamstring | 🏋️ Gym",      icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"9:00 PM", task:"Progressive muscle relaxation (10 min) + 8–9hr sleep — cortisol reduction boosts healing",                 icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    severe: [
      {time:"7:00 AM", task:"Ankle pumps 3×25 (prevents DVT) + quad sets supine 3×10 — start day 1 post-op | 🏠 Bed",                 icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Zinc 15 mg + Vitamin C 1,000 mg",                             icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Assisted ROM — gentle heel slide (supine) 3×10, target 0→70° this week | 🏠 Home",                        icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"High-protein meal ≥50g protein — tissue synthesis requires amino acids, especially leucine",               icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"RICE protocol: ice 20 min every 2 hrs waking hours + compression wrap + elevation | 🏠 Home",             icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Upper body seated workout: band rows 3×15, shoulder press 3×15, curls 3×15 | 🏠 Home",                    icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"6:00 PM", task:"Crutch-assisted weight shift side-to-side 3×30s — begin neuromuscular re-patterning | 🏠 Home",           icon:"🦵", iconColor:I.teal,   iconBg:I.tealL},
      {time:"9:00 PM", task:"9–10hr sleep target. Position: pillow under knee at 20–30° flexion, no full extension lock",               icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    post_surgery: [
      {time:"7:00 AM", task:"Ankle pumps 3×25 + quad sets 3×10 + gluteal sets 3×10 — DVT prevention + activation | 🏠 Bed",           icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 2,000 IU + Omega-3 1,000 mg + Zinc 15 mg + Vitamin C 1,000 mg",                             icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Passive ROM with PT or assistant: 0→60° heel slide, no active quad contraction yet | 🏠 Home",            icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"High-protein meal: 50g+ protein every meal. Leucine-rich foods: eggs, chicken, Greek yogurt",              icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Icing 20 min + CPM machine if available (6–8 hrs/day reduces swelling 40%) | 🏠 Home",                    icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Seated upper body: resistance band chest press, rows, lateral raises 3×15 | 🏠 Home",                      icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"6:00 PM", task:"Standing with crutches, partial weight as tolerated. Practice proper gait mechanics | 🏠 Home",            icon:"🦵", iconColor:I.teal,   iconBg:I.tealL},
      {time:"9:00 PM", task:"Compression + elevation overnight. Take prescribed pain medication if needed before sleep",                 icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
  },
  ankle: {
    mild: [
      {time:"7:00 AM", task:"Ankle alphabet 2×: trace A–Z with big toe. Improves ROM and neuromuscular control | 🏠 Home",             icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 1,000 IU + Omega-3 1,000 mg + Magnesium 400 mg",                                            icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Single-leg balance 3×30s + calf raises standing 3×20 — BOSU ball if available | 🏠 Home",                 icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"Protein meal 35–40g + anti-inflammatory foods: turmeric in meal (curcumin reduces swelling)",              icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Stationary bike 20 min, light resistance — maintains fitness, near-zero ankle stress | 🏋️ Gym",           icon:"🚴", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Ice massage (frozen cup) 10 min direct on lateral ligament + compression | 🏠 Home",                      icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"6:00 PM", task:"Resistance band eversion 3×20 (peroneals — primary lateral ankle stabilizers) | 🏠 Home",                 icon:"💪", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"9:00 PM", task:"Ankle elevated above heart level for 60 min before sleep. Sleep 8–9 hours",                                icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    moderate: DEFAULT_PROTOCOL,
    severe:   DEFAULT_PROTOCOL,
    post_surgery: DEFAULT_PROTOCOL,
  },
  hamstring: {
    mild: [
      {time:"7:00 AM", task:"Hamstring flexibility — standing hip hinge (NOT static stretch; active only) 3×10 | 🏠 Home",             icon:"🌅", iconColor:I.amber,  iconBg:"#FFF7ED"},
      {time:"8:00 AM", task:"Vitamins: D3 1,000 IU + Omega-3 1,000 mg + Magnesium 400 mg",                                            icon:"💊", iconColor:I.indigo, iconBg:I.indigoL},
      {time:"10:00 AM",task:"Stationary bike 20 min easy + Romanian deadlift (RDL) bodyweight 3×12 | 🏋️ Gym or 🏠 Home",             icon:"🏋️", iconColor:I.orange, iconBg:"#FFF0E6"},
      {time:"12:00 PM",task:"Protein meal 40g + tart cherry juice 8oz (natural anti-inflammatory, reduces DOMS by 22%)",               icon:"🥗", iconColor:"#16A34A",iconBg:"#F0FDF4"},
      {time:"2:00 PM", task:"Ice massage 10 min on hamstring belly. Avoid heat first 72 hrs (increases bleeding)",                     icon:"🧊", iconColor:I.sky,    iconBg:"#E0F2FE"},
      {time:"4:00 PM", task:"Nordic curl eccentric — controlled lowering only, 3×8. Askling protocol evidence-grade A | 🏋️ Gym",      icon:"🏋️", iconColor:I.purple, iconBg:"#F5F3FF"},
      {time:"6:00 PM", task:"Glute bridge 3×20 + single-leg bridge 3×12 — proximal load protects the hamstring | 🏠 Home",             icon:"💪", iconColor:I.teal,   iconBg:I.tealL},
      {time:"9:00 PM", task:"Foam roll quads and glutes only (NOT hamstring belly this week). Sleep 8–9 hrs",                           icon:"😴", iconColor:I.mid,    iconBg:"#F1F5F9"},
    ],
    moderate: DEFAULT_PROTOCOL,
    severe:   DEFAULT_PROTOCOL,
    post_surgery: DEFAULT_PROTOCOL,
  },
};

// ── SUPPLEMENTS ───────────────────────────────────────────────────────────────
const SUPPLEMENTS = [
  {label:"Vitamin D3",   dose:"2,000–4,000 IU/day", note:"Supports bone health, immune function, and muscle recovery. Most athletes are deficient.", cost:"~$0.05/day (generic)", color:I.amber,  bg:"#FFF7ED"},
  {label:"Omega-3",      dose:"1–3g EPA+DHA/day",   note:"Reduces exercise-induced inflammation by 25-40%. Fish oil or algae-based.", cost:"~$0.15/day (generic)", color:I.sky,    bg:"#E0F2FE"},
  {label:"Magnesium",    dose:"300–400mg/day",       note:"Critical for muscle relaxation, sleep quality, and protein synthesis. Most people are deficient.", cost:"~$0.08/day", color:I.purple, bg:"#F5F3FF"},
  {label:"Vitamin C",    dose:"500–1,000mg/day",     note:"Collagen synthesis for tendons/ligaments. Antioxidant. Best taken with protein meals.", cost:"~$0.03/day", color:I.orange, bg:"#FFF0E6"},
  {label:"Zinc",         dose:"15–25mg/day",         note:"Tissue repair, immune support, anti-inflammatory. Take with food to avoid nausea.", cost:"~$0.04/day", color:I.teal,   bg:I.tealL},
  {label:"Collagen Peptides",dose:"10–15g/day",      note:"Take 30–60 min before rehab session with Vitamin C for maximum tendon/ligament benefit.", cost:"~$0.50/day", color:I.pink,   bg:"#FDF2F8"},
];

// ── DIET GUIDE ────────────────────────────────────────────────────────────────
const DIET_GUIDE = [
  {category:"🐟 Protein Sources",     foods:"Salmon, sardines, eggs, chicken breast, Greek yogurt, lentils, tofu",            avoid:"Processed deli meats, fried proteins, protein bars with >10g sugar"},
  {category:"🥦 Anti-Inflammatory",   foods:"Turmeric, ginger, leafy greens, berries, tart cherry, green tea, olive oil",     avoid:"Refined sugar, white bread, vegetable oils (canola, corn, soy)"},
  {category:"🦴 Bone & Tendon",       foods:"Dairy/fortified alternatives, bone broth, leafy greens (calcium), fatty fish (D3)",avoid:"Excess alcohol, high-sodium processed foods, excessive caffeine"},
  {category:"⚡ Energy & Recovery",   foods:"Sweet potato, oats, quinoa, banana, dates (pre-workout), complex carbs",          avoid:"Simple sugars pre-workout, alcohol (delays recovery by 48hrs+)"},
  {category:"💧 Hydration",           foods:"Water 3–4L/day, electrolytes if sweating, coconut water, herbal teas",            avoid:"Sports drinks with high HFCS, energy drinks, excessive caffeine"},
];

// ── MILESTONES ────────────────────────────────────────────────────────────────
const MILESTONES = [
  {day:3,   badge:"🌱", title:"First Steps",      reward:"Resilience Badge + Day 3 devotional unlock",                                         verse:"\"I can do all things through Christ who strengthens me.\" — Phil 4:13"},
  {day:7,   badge:"🔥", title:"One Week Strong",  reward:"Streak Shield NFT + weekly progress report",                                          verse:"\"Be strong and courageous.\" — Joshua 1:9"},
  {day:14,  badge:"💪", title:"Two Weeks In",     reward:"Warrior Badge + nutrition guide unlock",                                              verse:"\"Endurance produces character.\" — Romans 5:4"},
  {day:21,  badge:"⚡", title:"21-Day Habit",     reward:"Habit Forge Badge + custom protocol unlock",                                          verse:"\"Press on toward the goal.\" — Philippians 3:14"},
  {day:30,  badge:"🏅", title:"30-Day Champion",  reward:"Champion NFT + 1 free PT consultation",                                              verse:"\"Those who hope in the Lord will renew their strength.\" — Isaiah 40:31"},
  {day:60,  badge:"🦅", title:"60-Day Eagle",     reward:"Eagle Badge + full supplement guide",                                                 verse:"\"They will soar on wings like eagles.\" — Isaiah 40:31"},
  {day:90,  badge:"🏆", title:"90-Day Legend",    reward:"Legend Trophy NFT + return-to-sport clearance checklist",                             verse:"\"Well done, good and faithful servant.\" — Matthew 25:23"},
];

// ── COMMUNITY ─────────────────────────────────────────────────────────────────
const COMMUNITY_MESSAGES = [
  {name:"Marcus T.",    sport:"🏀",day:47, msg:"Day 47 post-ACL. Hit 90° ROM today. The Nordic curls protocol is legit.",          likes:24},
  {name:"Priya R.",     sport:"⚽",day:23, msg:"Week 3 of hamstring recovery. Pool running is saving my cardio base.",              likes:18},
  {name:"Jake M.",      sport:"🏈",day:82, msg:"Cleared for contact today. 82 days from torn Achilles. Trust the protocol.",        likes:67},
  {name:"Sofia L.",     sport:"🎾",day:15, msg:"Tennis elbow Tyler Twist eccentric curls — week 2. Already feeling difference.",    likes:12},
  {name:"DeShawn W.",   sport:"🏀",day:134,msg:"134 days out. Dropped 40pts in first game back. Your comeback is coming too. 🙏",   likes:201},
  {name:"Coach Rivera", sport:"🏋️",day:0,  msg:"Reminder: recovery pace is not weakness. It is the strategy.",                     likes:89},
];

const SUCCESS_STORIES = [
  {name:"Jordan K.",  sport:"🏀 Basketball", injury:"ACL",      weeks:34, quote:"I was told my college career was over. Comeback gave me the exact protocol and daily accountability. I started my senior season.",   rating:5},
  {name:"Ana S.",     sport:"⚽ Soccer",     injury:"Hamstring", weeks:10, quote:"The Nordic curl protocol and nutrition guide cut my recovery time by 3 weeks vs my first hamstring tear.",                          rating:5},
  {name:"Tyler B.",   sport:"🏈 Football",   injury:"Achilles",  weeks:28, quote:"Post-surgery, I didn't know where to start. The daily task schedule was exactly what I needed to stay focused.",                  rating:5},
];

// ── DAILY CONTENT ─────────────────────────────────────────────────────────────
const DAILY_CONTENT = [
  {type:"verse",   quote:"I can do all things through Christ who strengthens me.",                              text:"Philippians 4:13"},
  {type:"verse",   quote:"Be strong and courageous. Do not be afraid; do not be discouraged.",                 text:"Joshua 1:9"},
  {type:"athlete", quote:"The hardest day is day 3. Push through it. That's where most people quit.",          text:"LeBron James"},
  {type:"verse",   quote:"Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", text:"Isaiah 40:31"},
  {type:"athlete", quote:"Consistency beats intensity in recovery — every single time.",                        text:"Cristiano Ronaldo"},
  {type:"verse",   quote:"For I know the plans I have for you, plans to prosper you and not to harm you.",      text:"Jeremiah 29:11"},
  {type:"motivation",quote:"Champions are made in the moments they want to quit.",                              text:"Recovery Wisdom"},
];

// ── SHARED UI COMPONENTS ──────────────────────────────────────────────────────
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

// ── FIXED LOGO COMPONENT ──────────────────────────────────────────────────────
function Logo({size=28}:{size?:number}){
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {/* Dumbbell icon in a pill */}
      <div style={{
        width: size+8, height: size+8,
        borderRadius: (size+8)/2,
        background: I.dark,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0,
      }}>
        <svg width={size*0.65} height={size*0.65} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2"  y="9"  width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="18" y="9"  width="4" height="6" rx="1.5" fill={I.yellow}/>
          <rect x="5"  y="11" width="14" height="2" rx="1"   fill="white"/>
          <rect x="8"  y="7"  width="3"  height="10" rx="1.5" fill="white"/>
          <rect x="13" y="7"  width="3"  height="10" rx="1.5" fill="white"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div>
        <div style={{fontWeight:900,fontSize:size*0.75,color:I.dark,lineHeight:1,letterSpacing:"-0.5px"}}>Comeback</div>
        <div style={{fontWeight:600,fontSize:size*0.38,color:I.muted,lineHeight:1,letterSpacing:"1px",textTransform:"uppercase",marginTop:1}}>Sports Recovery</div>
      </div>
    </div>
  );
}

function ProgressBar({pct,color=I.indigo}:{pct:number,color?:string}){
  return <div style={{height:6,background:I.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.3s"}}/></div>;
}

function StepBar({total,current}:{total:number,current:number}){
  return <div style={{display:"flex",gap:4,marginBottom:20}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<current?I.indigo:I.border}}/>)}</div>;
}

function OutcomeSection({sport}:{sport:typeof SPORTS[0]|undefined}){
  if(!sport) return null;
  return (
    <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:700,color:I.indigoT,marginBottom:8}}>💬 {sport.athlete} on Recovery</div>
      <p style={{fontSize:13,fontStyle:"italic",color:I.dark,lineHeight:1.65,fontFamily:"Georgia,serif"}}>{sport.quotes[0]}</p>
    </Card>
  );
}

function TaskCard({task}:{task:Task}){
  const [done,setDone]=useState(false);
  return (
    <div onClick={()=>setDone(d=>!d)} style={{display:"flex",gap:12,alignItems:"flex-start",background:"white",borderRadius:14,padding:"12px 14px",border:`1px solid ${done?I.teal:I.border}`,boxShadow:"0 1px 4px rgba(15,23,42,0.05)",cursor:"pointer",opacity:done?0.7:1,transition:"all 0.2s"}}>
      <div style={{width:36,height:36,borderRadius:18,background:task.iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{task.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,fontWeight:700,color:I.muted,marginBottom:2}}>{task.time}</div>
        <div style={{fontSize:12,color:done?I.muted:I.mid,lineHeight:1.45,textDecoration:done?"line-through":"none",fontWeight:500}}>{task.task}</div>
      </div>
      <div style={{width:22,height:22,borderRadius:11,background:done?I.teal:I.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
        {done&&<Check size={13} color="white" strokeWidth={3}/>}
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
          <h1 style={{fontWeight:900,fontSize:34,color:I.dark,lineHeight:1.1,letterSpacing:"-1px",marginBottom:12}}>
            Your comeback<br/>starts <span style={{color:I.indigo}}>today.</span>
          </h1>
          <p style={{fontSize:15,color:I.muted,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Science-backed recovery protocols built around your sport, injury, and goals.</p>
        </div>
        <div style={{display:"flex",gap:16,justifyContent:"center",marginBottom:28}}>
          {["🏆 Pro athlete protocols","📿 Daily motivation","🧪 Evidence-based science"].map((f,i)=>(
            <div key={i} style={{fontSize:11,fontWeight:700,color:I.indigoT,background:"white",borderRadius:12,padding:"6px 12px",boxShadow:"0 2px 6px rgba(15,23,42,0.08)"}}>{f}</div>
          ))}
        </div>
      </div>
      <PrimaryBtn onClick={onNext}>Build My Recovery Plan →</PrimaryBtn>
      <p style={{textAlign:"center",fontSize:11,color:I.muted,marginTop:12}}>Free to start · No credit card required</p>
    </div>
  );
}

function SportSelect({onNext}:{onNext:(s:typeof SPORTS[0])=>void}){
  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      <div style={{padding:"20px 20px 0",position:"sticky",top:0,background:I.bg,zIndex:10}}>
        <Logo size={24}/>
        <StepBar total={5} current={1}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your sport?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>We'll tailor your protocol with advice from elite athletes in your sport.</p>
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
        <Logo size={24}/>
        <StepBar total={5} current={2}/>
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
                <div style={{fontSize:11,color:I.muted,marginTop:2}}>{inj.weeks}-week recovery · {inj.severity} severity</div>
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
        <Logo size={24}/>
        <StepBar total={5} current={3}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>How severe is it?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Your protocol intensity and exercise selection depends on this.</p>
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
        <Logo size={24}/>
        <StepBar total={5} current={4}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>What's your #1 goal?</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>This shapes the emphasis of your daily tasks and milestones.</p>
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
        <Logo size={24}/>
        <StepBar total={5} current={5}/>
        <h2 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Choose your plan</h2>
        <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Start free. Upgrade anytime as you progress.</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 20px 32px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {PLANS.map((plan,i)=>(
            <div key={plan.id} style={{background:"white",borderRadius:18,padding:"18px 16px",border:`2px solid ${i===1?I.indigo:I.border}`,boxShadow:i===1?`0 4px 16px ${I.indigo}20`:"0 2px 8px rgba(15,23,42,0.06)",position:"relative"}}>
              {i===1&&<div style={{position:"absolute",top:-10,right:16,background:I.indigo,color:"white",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:10,letterSpacing:"0.5px"}}>MOST POPULAR</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:22}}>{plan.icon}</span>
                  <span style={{fontWeight:800,fontSize:16,color:I.dark}}>{plan.label}</span>
                </div>
                <span style={{fontWeight:900,fontSize:18,color:i===1?I.indigo:I.dark}}>{plan.price}</span>
              </div>
              {plan.features.map((f,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <Check size={13} color={I.teal} strokeWidth={3}/>
                  <span style={{fontSize:12,color:I.mid}}>{f}</span>
                </div>
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

// ── SQUAD TAB ─────────────────────────────────────────────────────────────────
function SquadTab({sport,injury,dayOfYear}:{sport:typeof SPORTS[0]|undefined,injury:typeof INJURIES[0]|undefined,dayOfYear:number}){
  return (
    <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"54px 18px 100px"}}>
      <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Recovery Squad</h1>
      <p style={{fontSize:13,color:I.muted,marginBottom:16}}>Athletes recovering alongside you. You're not alone in this.</p>

      {/* Active now */}
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
        {COMMUNITY_MESSAGES.slice(0,4).map((m,i)=>(
          <div key={i} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:48,height:48,borderRadius:24,background:i%2===0?I.indigoL:I.tealL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`2px solid ${i===0?I.teal:I.border}`}}>{m.sport}</div>
            <div style={{fontSize:10,fontWeight:600,color:I.muted,maxWidth:48,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{m.name.split(" ")[0]}</div>
          </div>
        ))}
        <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:48,height:48,borderRadius:24,background:I.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:I.muted,fontWeight:700}}>+28</div>
          <div style={{fontSize:10,color:I.muted}}>more</div>
        </div>
      </div>

      {/* Feed */}
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
        {COMMUNITY_MESSAGES.map((m,i)=>(
          <Card key={i}>
            <div style={{display:"flex",gap:10,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{m.sport}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:I.dark}}>{m.name}</div>
                <div style={{fontSize:10,color:I.muted}}>Day {m.day} · {m.day>0?`${Math.floor(m.day/7)}wk ${m.day%7}d in`:"Coach"}</div>
              </div>
            </div>
            <p style={{fontSize:13,color:I.mid,lineHeight:1.5,margin:0,marginBottom:8}}>{m.msg}</p>
            <div style={{display:"flex",gap:12}}>
              <button style={{fontSize:11,fontWeight:700,color:I.muted,background:"none",border:"none",cursor:"pointer"}}>❤️ {m.likes}</button>
              <button style={{fontSize:11,fontWeight:700,color:I.muted,background:"none",border:"none",cursor:"pointer"}}>💬 Reply</button>
            </div>
          </Card>
        ))}
      </div>

      {/* Success stories */}
      <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:12}}>🏆 Comeback Stories</h2>
      {SUCCESS_STORIES.map((s,i)=>(
        <Card key={i} style={{marginBottom:10,background:`linear-gradient(135deg,white,${I.indigoL}50)`}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
            <div style={{width:40,height:40,borderRadius:20,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{s.sport.split(" ")[0]}</div>
            <div>
              <div style={{fontWeight:800,fontSize:13,color:I.dark}}>{s.name}</div>
              <div style={{fontSize:10,color:I.muted}}>{s.sport} · {s.injury} · {s.weeks}wk recovery</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:12}}>{"⭐".repeat(s.rating)}</div>
          </div>
          <p style={{fontSize:12,color:I.mid,lineHeight:1.5,fontStyle:"italic",margin:0}}>"{s.quote}"</p>
        </Card>
      ))}
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
function AppDashboard({
  sport,injury,severity,goal,
}:{
  sport:typeof SPORTS[0]|undefined,
  injury:typeof INJURIES[0]|undefined,
  severity:typeof SEVERITIES[0]|undefined,
  goal:typeof GOALS[0]|undefined,
}){
  const [tab,setTab]=useState<"home"|"today"|"protocol"|"squad"|"rewards">("home");
  const dayOfYear = 14; // demo
  const dailyContent = DAILY_CONTENT[dayOfYear % DAILY_CONTENT.length];

  // Get exercise protocol
  const injKey = injury?.id || "acl";
  const sevKey = severity?.id || "mild";
  const allTasks: Task[] = (EXERCISE_PROTOCOLS[injKey]?.[sevKey]) ?? DEFAULT_PROTOCOL;
  const morningTasks   = allTasks.slice(0,3);
  const afternoonTasks = allTasks.slice(3,6);
  const eveningTasks   = allTasks.slice(6);

  const renderTab = () => {
    switch(tab){
      case "home":
        return (
          <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <Logo size={26}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"6px 12px",display:"flex",alignItems:"center",gap:5,boxShadow:"0 2px 6px rgba(15,23,42,0.06)"}}>
                  <Flame size={14} color={I.orange} fill={I.orange}/>
                  <span style={{fontWeight:800,fontSize:14,color:I.dark}}>14</span>
                </div>
                <div style={{width:36,height:36,borderRadius:18,background:I.indigoL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{sport?.icon||"🏆"}</div>
              </div>
            </div>

            {/* Welcome card */}
            <Card style={{background:`linear-gradient(135deg,#1C1C2E,#2D2B5E)`,border:"none",marginBottom:16,padding:"18px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6,letterSpacing:"1px"}}>WEEK 2 · PHASE 1</div>
              <h2 style={{fontWeight:900,fontSize:22,color:"white",lineHeight:1.1,marginBottom:6}}>Day 14 of {injury?.weeks||36}</h2>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:12}}>{injury?.label||"Recovery"} · {severity?.label||""} severity</p>
              <ProgressBar pct={(14/(injury?.weeks||36))*100} color={I.yellow}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day 1</span>
                <span style={{fontSize:10,color:I.yellow,fontWeight:700}}>{Math.round((14/(injury?.weeks||36))*100)}% complete</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Day {injury?.weeks||36}</span>
              </div>
            </Card>

            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {icon:"🔥",val:"14",label:"Day Streak"},
                {icon:"✅",val:"6/8",label:"Today"},
                {icon:"📈",val:"Phase 1",label:"Stage"},
              ].map((stat,i)=>(
                <Card key={i} style={{textAlign:"center",padding:"12px 8px"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{stat.icon}</div>
                  <div style={{fontWeight:900,fontSize:16,color:I.dark}}>{stat.val}</div>
                  <div style={{fontSize:10,color:I.muted,fontWeight:600}}>{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Daily quote */}
            <OutcomeSection sport={sport}/>

            {/* Today's top tasks preview */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <h2 style={{fontWeight:900,fontSize:17,color:I.dark}}>Today's Focus</h2>
              <button onClick={()=>setTab("today")} style={{fontSize:12,fontWeight:700,color:I.indigo,background:"none",border:"none",cursor:"pointer"}}>View all →</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {allTasks.slice(0,3).map((t,i)=><TaskCard key={i} task={t}/>)}
            </div>

            {/* Sport tip */}
            {sport && (
              <Card style={{background:`linear-gradient(135deg,${sport.color}15,${sport.color}05)`,border:`1px solid ${sport.color}30`}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:28}}>{sport.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:12,color:sport.color,marginBottom:4}}>{sport.athlete} SAYS</div>
                    <p style={{fontSize:12,fontStyle:"italic",color:I.mid,lineHeight:1.5,margin:0}}>{sport.quotes[dayOfYear%sport.quotes.length]}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case "today":
        return (
          <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 0 100px"}}>
            <div style={{padding:"0 18px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <h1 style={{fontWeight:900,fontSize:24,color:I.dark,lineHeight:1}}>Day 14</h1>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
                    <TagPill color={I.indigoT} bg={I.indigoL}>Phase 1</TagPill>
                    <span style={{fontSize:12,color:I.muted,fontWeight:600}}>{injury?.label||"Recovery"}</span>
                  </div>
                </div>
                <div style={{background:"white",border:`1px solid ${I.border}`,borderRadius:20,padding:"7px 13px",boxShadow:"0 2px 6px rgba(15,23,42,0.06)",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:16}}>🔥</span>
                  <span style={{fontWeight:800,fontSize:16,color:I.dark}}>14</span>
                </div>
              </div>

              {severity && (
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <TagPill color={severity.id==="mild"?"#854D0E":severity.id==="moderate"?"#9A3412":"#991B1B"} bg={severity.id==="mild"?"#FEF9C3":severity.id==="moderate"?"#FFF0E6":"#FEE2E2"}>
                    {severity.icon} {severity.label} severity
                  </TagPill>
                  <span style={{fontSize:10,color:I.muted,fontWeight:600}}>Protocol adjusted for your level</span>
                </div>
              )}

              <Card style={{background:`linear-gradient(135deg,${I.indigoL},#F0FDF4)`,border:`1px solid ${I.indigo}20`,marginBottom:14}}>
                <TagPill color={I.indigoT} bg={I.indigo+"22"}>{dailyContent?.type==="verse"?"📿 Bible Verse":dailyContent?.type==="athlete"?"🏆 Athlete":"💡 Motivation"}</TagPill>
                <p style={{fontSize:14,fontStyle:"italic",color:I.dark,lineHeight:1.65,marginTop:8,fontFamily:"Georgia,serif"}}>{dailyContent?.quote}</p>
                <p style={{fontSize:10,fontWeight:700,color:I.indigoT,marginTop:6}}>— {dailyContent?.text}</p>
              </Card>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <h2 style={{fontWeight:900,fontSize:18,color:I.dark}}>Today's Protocol</h2>
                <span style={{fontSize:10,fontWeight:700,color:I.muted,background:"white",border:`1px solid ${I.border}`,borderRadius:8,padding:"4px 8px"}}>0 / 8 done</span>
              </div>
            </div>

            <div style={{padding:"0 18px"}}>
              <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌅 Morning</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>{morningTasks.map((t,i)=><TaskCard key={i} task={t}/>)}</div>
              <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>☀️ Afternoon</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>{afternoonTasks.map((t,i)=><TaskCard key={i+3} task={t}/>)}</div>
              <div style={{fontSize:13,fontWeight:800,color:I.mid,marginBottom:8}}>🌙 Evening</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>{eveningTasks.map((t,i)=><TaskCard key={i+6} task={t}/>)}</div>
            </div>
          </div>
        );

      case "protocol":
        return (
          <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
            <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>{injury?.label||"Recovery Protocol"}</h1>
            <p style={{fontSize:13,color:I.muted,marginBottom:20}}>{injury?.weeks||12}-week science-backed recovery timeline</p>
            {[
              {phase:"Phase 1",title:"Protection & Healing",  desc:injury?.phase1,color:I.indigo,bg:I.indigoL,active:true},
              {phase:"Phase 2",title:"Strength & Mobility",   desc:injury?.phase2,color:I.teal,  bg:I.tealL,  active:false},
              {phase:"Phase 3",title:"Return to Sport",       desc:injury?.phase3,color:I.orange,bg:"#FFF0E6",active:false},
            ].map((p,i)=>(
              <div key={i} style={{display:"flex",gap:14,marginBottom:20,opacity:p.active?1:0.55}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:36,height:36,borderRadius:18,background:p.active?p.color:I.border,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
                  {i<2&&<div style={{width:2,flex:1,background:I.border,marginTop:4}}/>}
                </div>
                <div style={{flex:1,paddingBottom:8}}>
                  <TagPill color={p.color} bg={p.bg}>{p.phase}</TagPill>
                  <h3 style={{fontWeight:800,fontSize:15,color:I.dark,margin:"6px 0 8px"}}>{p.title}</h3>
                  <Card style={{fontSize:13,color:I.mid,lineHeight:1.6,fontWeight:500}}>{p.desc||"Protocol details loading..."}</Card>
                </div>
              </div>
            ))}

            <h2 style={{fontWeight:900,fontSize:17,color:I.dark,marginBottom:4,marginTop:8}}>Supplement Stack</h2>
            <p style={{fontSize:12,color:I.muted,marginBottom:12}}>Affordable, evidence-backed options. No expensive peptides.</p>
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

      case "squad":
        return <SquadTab sport={sport} injury={injury} dayOfYear={dayOfYear}/>;

      case "rewards":
        return (
          <div style={{flex:1,overflowY:"auto",background:I.bg,padding:"20px 18px 100px"}}>
            <h1 style={{fontWeight:900,fontSize:22,color:I.dark,marginBottom:4}}>Milestones</h1>
            <p style={{fontSize:13,color:I.muted,marginBottom:6}}>Stay consistent. Unlock digital rewards and badges.</p>
            <Card style={{background:"linear-gradient(135deg,#1C1C2E,#2D2B5E)",border:"none",marginBottom:16,padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.5)",marginBottom:6}}>YOUR CURRENT STREAK</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:36}}>🔥</span>
                <div><div style={{fontWeight:900,fontSize:30,color:I.yellow,lineHeight:1}}>14</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>days strong</div></div>
              </div>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {MILESTONES.map((m,i)=>{
                const unlocked=m.day<=14;
                const isNext=!unlocked&&(i===0||MILESTONES[i-1].day<=14);
                return (
                  <Card key={i} style={{opacity:(!unlocked&&!isNext)?0.4:1,border:unlocked?`1.5px solid ${I.teal}`:isNext?`1.5px solid ${I.indigo}40`:`1.5px solid ${I.border}`}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:46,height:46,borderRadius:23,background:unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.badge}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                          <span style={{fontWeight:800,fontSize:14,color:unlocked?I.teal:I.dark}}>{m.title}</span>
                          <TagPill color={unlocked?I.teal:isNext?I.indigo:I.muted} bg={unlocked?I.tealL:isNext?I.indigoL:"#F1F5F9"}>Day {m.day}</TagPill>
                        </div>
                        {unlocked&&<div style={{fontSize:10,fontWeight:800,color:I.teal,marginBottom:4,letterSpacing:"0.5px"}}>✓ UNLOCKED</div>}
                        {isNext&&<div style={{fontSize:10,fontWeight:800,color:I.indigo,marginBottom:4}}>NEXT UP — {m.day-14} days away</div>}
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
    // FIX: use flexbox column with full height; tab content scrolls, nav stays at bottom
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:I.bg}}>
      {/* Tab content — flex:1 + overflow:hidden lets inner divs own their scroll */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
        {renderTab()}
      </div>

      {/* Bottom nav — normal flow (not absolute), always visible */}
      <div style={{flexShrink:0,background:"white",boxShadow:"0 -1px 0 rgba(15,23,42,0.08), 0 -4px 12px rgba(15,23,42,0.06)",paddingBottom:"env(safe-area-inset-bottom, 12px)",paddingTop:10,paddingLeft:8,paddingRight:8,display:"flex",justifyContent:"space-around",alignItems:"flex-end",zIndex:50}}>
        <NavBtn icon={<Home size={22}/>}     label="Home"     active={tab==="home"}     onClick={()=>setTab("home")}/>
        <NavBtn icon={<BookOpen size={22}/>} label="Protocol" active={tab==="protocol"} onClick={()=>setTab("protocol")}/>

        {/* Center FAB */}
        <button onClick={()=>setTab("today")} style={{width:58,height:58,borderRadius:29,background:tab==="today"?I.yellow:"#1C1C2E",display:"flex",alignItems:"center",justifyContent:"center",border:"4px solid white",boxShadow:"0 4px 14px rgba(15,23,42,0.25)",cursor:"pointer",marginBottom:6,flexShrink:0}}>
          <Dumbbell size={24} color={tab==="today"?I.dark:"white"}/>
        </button>

        <NavBtn icon={<Users size={22}/>}   label="Squad"    active={tab==="squad"}    onClick={()=>setTab("squad")}/>
        <NavBtn icon={<Trophy size={22}/>}  label="Rewards"  active={tab==="rewards"}  onClick={()=>setTab("rewards")}/>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App(){
  type Screen = "welcome"|"sport"|"injury"|"severity"|"goal"|"plan"|"dashboard";
  const [screen, setScreen] = useState<Screen>("welcome");
  const [sport,    setSport]    = useState<typeof SPORTS[0]|undefined>();
  const [injury,   setInjury]   = useState<typeof INJURIES[0]|undefined>();
  const [severity, setSeverity] = useState<typeof SEVERITIES[0]|undefined>();
  const [goal,     setGoal]     = useState<typeof GOALS[0]|undefined>();

  // FIX: root container fills viewport; quiz screens also get a scrollable container
  return (
    <div style={{
      width:"100%", height:"100dvh", maxWidth:430,
      margin:"0 auto", overflow:"hidden",
      display:"flex", flexDirection:"column",
      fontFamily:"'Inter',sans-serif",
      boxShadow:"0 0 40px rgba(15,23,42,0.15)",
    }}>
      {screen==="welcome"  && <div style={{flex:1,overflowY:"auto"}}><Welcome    onNext={()=>setScreen("sport")}/></div>}
      {screen==="sport"    && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SportSelect   onNext={s=>{setSport(s);   setScreen("injury");}}/></div>}
      {screen==="injury"   && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><InjurySelect  onNext={i=>{setInjury(i);  setScreen("severity");}}/></div>}
      {screen==="severity" && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><SeveritySelect onNext={sv=>{setSeverity(sv);setScreen("goal");}}/></div>}
      {screen==="goal"     && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><GoalSelect    onNext={g=>{setGoal(g);    setScreen("plan");}}/></div>}
      {screen==="plan"     && <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><PlanSelect    onNext={()=>setScreen("dashboard")}/></div>}
      {screen==="dashboard"&& <AppDashboard sport={sport} injury={injury} severity={severity} goal={goal}/>}
    </div>
  );
}
