import { useState, useEffect, useRef } from "react";

const QUOTES = [
  { text: "The pain you feel today will be the strength you feel tomorrow.", context: "Every heavy set counts." },
  { text: "Medical physics doesn't build itself. Neither does your squat.", context: "You're playing a long game." },
  { text: "Discipline is doing it when you don't feel like it.", context: "Especially on leg day." },
  { text: "Small plates add up. So do small habits.", context: "5 lbs a week is 260 lbs a year." },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", context: "Log every session." },
  { text: "Sleep is the most anabolic thing you can do tonight.", context: "More than any supplement." },
  { text: "Every rep you do at 17 compounds for decades.", context: "You're investing, not spending." },
  { text: "Your XC friends run miles. You move iron. Different paths, same discipline.", context: "Respect the process." },
  { text: "A 33 math ACT walks into the gym and actually understands progressive overload.", context: "Use the brain, build the body." },
  { text: "The belt supports good bracing. It doesn't replace it.", context: "Technique first, always." },
];

const PROTEIN_GOAL = 155;

function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DOTS_COEFFS = [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093];
function dotsScore(bodyweightLb, totalLb) {
  const bw = bodyweightLb * 0.453592;
  const total = totalLb * 0.453592;
  const denom = DOTS_COEFFS[0] + DOTS_COEFFS[1]*bw + DOTS_COEFFS[2]*bw**2 + DOTS_COEFFS[3]*bw**3 + DOTS_COEFFS[4]*bw**4;
  if (denom <= 0) return 0;
  return Math.round((500 / denom) * total * 10) / 10;
}
function estimate1RM(weight, reps) {
  if (!weight || !reps) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + Math.min(reps, 5) / 30));
}
function dotsRating(score) {
  if (score >= 500) return { label: "Elite", color: "#4ade80" };
  if (score >= 400) return { label: "Advanced", color: "#47c8ff" };
  if (score >= 300) return { label: "Intermediate", color: "#e8ff47" };
  if (score >= 200) return { label: "Novice", color: "#ff9f47" };
  return { label: "Beginner", color: "#ff6b35" };
}

function calcProteinStreak(entries) {
  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 60; i++) {
    const key = getLocalDateKey(check);
    const total = (entries[key] || []).reduce((s, e) => s + e.protein, 0);
    if (total >= PROTEIN_GOAL) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (i === 0) {
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const WARMUPS = {
  A: {
    label: "UPPER A WARM-UP", note: "Shoulder prep + blood flow - 8 min", color: "#e8ff47",
    exercises: [
      { name: "Band Pull-Apart", sets: "3 x 15", note: "Rear delt activation. Pull at chest height." },
      { name: "Arm Circle (forward + back)", sets: "2 x 15 each direction", note: "Full ROM. Big and controlled." },
      { name: "Wall Shoulder Slide", sets: "2 x 10", note: "Back flat, slide arms overhead. Opens thoracic." },
      { name: "Passive Bar Hang", sets: "30 sec", note: "Decompress the shoulder joint." },
      { name: "Empty Bar Bench Press", sets: "2 x 10", note: "Grooves the pattern before loading." },
    ]
  },
  B: {
    label: "LOWER A WARM-UP", note: "Hip + ankle mobility - 8 min", color: "#ff6b35",
    exercises: [
      { name: "Hip Circle (standing)", sets: "2 x 10 each direction", note: "Big slow circles. Wakes up the hip joint." },
      { name: "Leg Swing (front/back)", sets: "2 x 12 each leg", note: "Hold wall. Forward and back." },
      { name: "Ankle Circle + Calf Raise", sets: "2 x 10 each", note: "Mobile ankle = better squat depth." },
      { name: "Goblet Squat Hold (deep)", sets: "3 x 30 sec", note: "Drop deep. Elbows push knees out." },
      { name: "Bodyweight Box Squat", sets: "2 x 8", note: "Slow descent to bench. Teaches depth before bar." },
    ]
  },
  C: {
    label: "UPPER B WARM-UP", note: "Push + pull activation - 8 min", color: "#47c8ff",
    exercises: [
      { name: "Band Pull-Apart", sets: "3 x 15", note: "Non-negotiable rear delt primer." },
      { name: "Face Pull with Band", sets: "3 x 15", note: "Rotator cuff prep. Light resistance only." },
      { name: "Scapular Push-Up", sets: "2 x 10", note: "Plank position, protract and retract blades only." },
      { name: "Dead Hang", sets: "2 x 20-30 sec", note: "Grip and lat primer before rows." },
      { name: "Empty Bar Bench Press", sets: "2 x 10", note: "Groove the bench pattern before loading." },
    ]
  },
  D: {
    label: "LOWER B WARM-UP", note: "Posterior chain + hip hinge - 8 min", color: "#c47bff",
    exercises: [
      { name: "Cat-Cow", sets: "2 x 10 slow", note: "Full spinal flexion and extension each rep." },
      { name: "Glute Bridge (bodyweight)", sets: "3 x 15", note: "Wake up glutes before deadlifting." },
      { name: "Hip Hinge with Dowel / PVC", sets: "3 x 8", note: "Stick along spine. Teaches neutral back hinge." },
      { name: "Leg Swing (side to side)", sets: "2 x 12 each leg", note: "Adductor and hip flexor mobility." },
      { name: "Empty Bar RDL", sets: "2 x 8", note: "Slow eccentric, feel the hamstring stretch." },
    ]
  },
  E: {
    label: "ARMS + NECK WARM-UP", note: "Elbow + wrist prep - 5 min", color: "#ff9f47",
    exercises: [
      { name: "Wrist Circle", sets: "2 x 10 each direction", note: "Slow full circles. Prevents elbow pain on curls and dips." },
      { name: "Band Pull-Apart", sets: "2 x 15", note: "Rear delt primer. Keeps shoulder healthy for dips." },
      { name: "Tricep Stretch (overhead)", sets: "2 x 20 sec each arm", note: "Reach arm behind head, push elbow back. Full stretch." },
      { name: "Bodyweight Dip (slow)", sets: "2 x 5", note: "Zero load warm-up. Feel the shoulder position before adding weight." },
    ]
  },
  F: {
    label: "ZONE 2 WARM-UP", note: "Get moving - 3 min", color: "#4ade80",
    exercises: [
      { name: "Brisk Walk", sets: "2 min", note: "Transition from rest to movement. Let heart rate climb naturally." },
      { name: "Leg Swing (front/back)", sets: "1 x 10 each leg", note: "Open up the hip flexors before running." },
      { name: "Ankle Circle", sets: "1 x 10 each", note: "Quick mobility before hitting the pavement." },
    ]
  },
  G: {
    label: "RECOVERY DAY PREP", note: "Parasympathetic activation - 3 min", color: "#06d6a0",
    exercises: [
      { name: "Slow Diaphragmatic Breathing", sets: "2 min", note: "4-count in, 4-count hold, 6-count out. Shift nervous system to recovery mode." },
      { name: "Gentle Neck Rolls", sets: "1 x 5 each direction", note: "Slow and easy. No cracking. Release tension from yesterday." },
      { name: "Child's Pose Hold", sets: "60 sec", note: "No effort. Pure release. Let gravity do everything." },
    ]
  }
};

const EX_MUSCLE_MAP = {
  "Barbell Bench Press": ["Chest","Triceps","Front Delt"],
  "Barbell Row (Pendlay or Bent Over)": ["Back","Biceps","Rear Delt"],
  "Overhead Press": ["Front Delt","Triceps"],
  "Weighted Pull-Ups or Lat Pulldown": ["Back","Biceps"],
  "Barbell Shrug": ["Traps"],
  "EZ Bar Curl": ["Biceps"],
  "Incline Dumbbell Curl": ["Biceps"],
  "Ab Wheel Rollout": ["Core"],
  "Goblet Squat (Depth Work)": ["Quads","Glutes"],
  "Barbell Back Squat": ["Quads","Glutes","Core"],
  "Romanian Deadlift (RDL)": ["Hamstrings","Glutes"],
  "Leg Press": ["Quads","Glutes"],
  "Leg Curl (Machine)": ["Hamstrings"],
  "Cable Crunch": ["Core"],
  "Dead Bug": ["Core"],
  "Incline Barbell Press": ["Chest","Triceps","Front Delt"],
  "Cable Row (Seated)": ["Back","Biceps","Rear Delt"],
  "Dumbbell Lateral Raise": ["Side Delt"],
  "Face Pull": ["Rear Delt"],
  "Hammer Curl": ["Biceps"],
  "Spider Curl or Preacher Curl": ["Biceps"],
  "Hanging Leg Raise": ["Core"],
  "Conventional Deadlift": ["Back","Hamstrings","Glutes","Traps"],
  "Front Squat or Paused Back Squat": ["Quads","Core"],
  "Bulgarian Split Squat": ["Quads","Glutes"],
  "Glute Bridge or Hip Thrust": ["Glutes","Hamstrings"],
  "Hip Thrust": ["Glutes","Hamstrings"],
  "Barbell or Dumbbell Shrug": ["Traps"],
  "Calf Raise": ["Calves"],
  "Weighted Decline Crunch": ["Core"],
  "Plank (Controlled)": ["Core"],
  "Weighted Dips": ["Triceps","Chest","Front Delt"],
  "Skull Crusher": ["Triceps"],
  "Overhead Tricep Extension": ["Triceps"],
  "Seated Dumbbell Press": ["Front Delt","Triceps","Side Delt"],
  "Tricep Pushdowns": ["Triceps"],
  "Preacher Curl": ["Biceps"],
  "Barbell Row": ["Back","Biceps","Rear Delt"],
  "Weighted Pull-Ups / Lat Pulldown": ["Back","Biceps"],
  "Lateral Raise": ["Side Delt"],
  "Tricep Pushdown": ["Triceps"],
  "EZ Bar Curl (Arms)": ["Biceps"],
};
const MUSCLE_COLORS = {
  Chest:"#e8ff47", Triceps:"#e8ff4799", "Front Delt":"#ffdd00",
  Back:"#47c8ff", Biceps:"#47c8ff99", "Rear Delt":"#47c8ffaa",
  Quads:"#ff6b35", Glutes:"#ff6b3599", Hamstrings:"#ff9f47",
  Traps:"#c47bff", "Side Delt":"#ff6b9d", Core:"#4ade80", Calves:"#4ade8099",
};
const RECOMMENDED_SETS = {
  Chest:12, Back:14, Quads:12, Hamstrings:10, Glutes:10,
  Biceps:10, Triceps:10, "Front Delt":6, "Side Delt":10, "Rear Delt":10,
  Traps:8, Core:12, Calves:8,
};

// ── NEW SPLIT ──
const DEFAULT_DAYS = [
  {
    id:"A", label:"MON", name:"UPPER A - Heavy Bench", tag:"Heavy Push + Pull | ~60 min", color:"#e8ff47",
    timing:{ total:"55-65 min", compound_rest:180, accessory_rest:90 },
    warmupKey:"A",
    exercises:[
      { name:"Barbell Bench Press", sets:"4 x 4-6", weight:"Start at 185 lb, add 5 lb/week", note:"Main strength driver. Full ROM, touch chest. Film from side.", category:"main", trackPR:true },
      { name:"Barbell Row", sets:"4 x 5", weight:"Match bench weight roughly", note:"Back needs to keep up with push strength. Chest to bar.", category:"main", trackPR:true },
      { name:"Seated Dumbbell Press", sets:"3 x 8-10", weight:"Start at 2x25-30 lb. Natural wrist path.", note:"Real shoulder strength and stabilizers. Slow eccentric.", category:"secondary", trackPR:true },
      { name:"Weighted Pull-Ups / Lat Pulldown", sets:"3 x 6-8", weight:"Add weight when you can do 3x8 clean", note:"Width and upper back thickness.", category:"secondary" },
      { name:"Barbell Shrug", sets:"3 x 10-12", weight:"Start at 135-185 lb, add 10 lb/week", note:"Trap thickness. Hold peak contraction 1 sec.", category:"accessory" },
      { name:"Ab Wheel Rollout", sets:"3 x 8-10", weight:"Bodyweight", note:"Upper ab focus. Go to parallel, not floor at first.", category:"ab" },
    ]
  },
  {
    id:"B", label:"TUE", name:"LOWER A - Squat Focus", tag:"Depth + Strength | ~60 min", color:"#ff6b35",
    timing:{ total:"55-65 min", compound_rest:210, accessory_rest:90 },
    warmupKey:"B",
    exercises:[
      { name:"Barbell Back Squat", sets:"4 x 4-5", weight:"Start at 225 lb - earn depth before adding weight", note:"Film yourself from the side. Hit parallel every rep.", category:"main", trackPR:true },
      { name:"Romanian Deadlift (RDL)", sets:"3 x 8-10", weight:"Start at 135 lb", note:"Hamstring and glute builder. Fixes anterior pelvic tilt.", category:"main", trackPR:true },
      { name:"Leg Press", sets:"3 x 10-12", weight:"Moderate - feet high and wide", note:"Extra quad/glute volume without spinal load.", category:"secondary" },
      { name:"Leg Curl (Machine)", sets:"3 x 12", weight:"Moderate", note:"Hamstring balance. Prevents knee issues.", category:"secondary" },
      { name:"Cable Crunch", sets:"3 x 15", weight:"Moderate", note:"Upper ab focus. Round your spine at the top.", category:"ab" },
      { name:"Dead Bug", sets:"3 x 8 each side", weight:"Bodyweight", note:"Reinforce bracing. Protects your lower back.", category:"ab" },
    ]
  },
  {
    id:"C", label:"WED", name:"ZONE 2 + RECOVERY", tag:"Aerobic + Mobility | 45-60 min", color:"#06d6a0",
    timing:{ total:"45-60 min", compound_rest:0, accessory_rest:0 },
    warmupKey:"G",
    isRecovery:true,
    exercises:[
      { name:"Zone 2 Cardio (Weeks 1-3)", sets:"20 min", weight:"Easy pace — nasal breathing only", note:"If you can't hold a conversation, slow down. Walk if needed. This is NOT a workout — it's recovery.", category:"main" },
      { name:"Zone 2 Cardio (Weeks 4-6)", sets:"25-30 min", weight:"Steady pace", note:"Continuous jog. Same easy effort, just longer. Heart rate 130-150 bpm max.", category:"secondary" },
      { name:"Zone 2 Cardio (Weeks 7-9)", sets:"30-35 min", weight:"Steady pace", note:"One session per week can go slightly longer. Still conversational pace.", category:"secondary" },
      { name:"Zone 2 Cardio (Weeks 10-12)", sets:"35-40 min", weight:"Steady pace", note:"Ready to keep up with XC friends. You've built the aerobic base.", category:"accessory" },
    ]
  },
  {
    id:"D", label:"THU", name:"LOWER B - Deadlift Focus", tag:"Posterior Chain | ~60 min", color:"#c47bff",
    timing:{ total:"55-65 min", compound_rest:210, accessory_rest:90 },
    warmupKey:"D",
    exercises:[
      { name:"Conventional Deadlift", sets:"4 x 3-5", weight:"Start at 225 lb - technique first", note:"Add 10 lb/week early on. Film your setup every session.", category:"main", trackPR:true },
      { name:"Front Squat or Paused Back Squat", sets:"3 x 5", weight:"Light - technique focus", note:"Front squat forces upright torso = teaches depth. Pause 2 sec at bottom.", category:"main" },
      { name:"Bulgarian Split Squat", sets:"3 x 8 each leg", weight:"Dumbbells - start light", note:"Single leg work fixes imbalances. Rear foot elevated on bench.", category:"secondary" },
      { name:"Hip Thrust", sets:"3 x 10-12", weight:"Barbell when ready", note:"Direct glute work. Fixes anterior pelvic tilt. Full hip extension at top.", category:"secondary" },
      { name:"Barbell or Dumbbell Shrug", sets:"3 x 12-15", weight:"Heavy - load these seriously", note:"Trap builder after deadlifts. Traps already fired up.", category:"accessory" },
      { name:"Calf Raise", sets:"3 x 15-20", weight:"Moderate", note:"Calves respond to high rep. Full ROM — all the way up, all the way down.", category:"accessory" },
    ]
  },
  {
    id:"E", label:"FRI", name:"UPPER B - Volume Day", tag:"Hypertrophy + Ump Day | ~60 min", color:"#47c8ff",
    timing:{ total:"55-65 min", compound_rest:120, accessory_rest:75 },
    warmupKey:"C",
    exercises:[
      { name:"Barbell Bench Press", sets:"4 x 6-8", weight:"~80-85% of Monday weight", note:"Volume bench. Same movement, lighter load, more reps. Focus on feel.", category:"main", trackPR:true },
      { name:"Incline Barbell Press", sets:"3 x 8-10", weight:"~60-65% of flat bench weight", note:"Upper chest development. Controlled descent, slight flare on the way up.", category:"main" },
      { name:"Cable Row (Seated)", sets:"4 x 10-12", weight:"Moderate — pull elbows back hard", note:"Mid back thickness. Pause at the top of each rep. No swinging.", category:"main" },
      { name:"Face Pull", sets:"3 x 15-20", weight:"Light", note:"Rear delt and rotator cuff health. Non-negotiable — protect your umpiring shoulder.", category:"secondary" },
      { name:"Lateral Raise", sets:"3 x 12-15", weight:"Light - perfect form only", note:"Shoulder width. Makes your waist look smaller. Pinky up, lead with elbow.", category:"secondary" },
      { name:"Hanging Leg Raise", sets:"3 x 12-15", weight:"Bodyweight", note:"Lower ab tie-in + hip flexor strength. Control the descent.", category:"ab" },
    ]
  },
  {
    id:"F", label:"SAT", name:"ARMS + NECK - Isolation Day", tag:"Triceps, Biceps, Neck | ~50 min", color:"#ff9f47",
    timing:{ total:"45-55 min", compound_rest:90, accessory_rest:60 },
    warmupKey:"E",
    exercises:[
      { name:"Weighted Dips", sets:"3 x 6-8", weight:"Bodyweight to start, add weight when 3x8 is clean", note:"Best compound tricep movement. Lean slightly forward for chest tie-in.", category:"main", trackPR:true },
      { name:"EZ Bar Curl", sets:"3 x 10-12", weight:"Focus on full stretch at bottom", note:"Bicep peak builder. Slow eccentric (3 sec down). Elbows pinned.", category:"accessory", altGroup:"bicep" },
      { name:"Hammer Curl", sets:"3 x 10-12", weight:"Moderate", note:"Brachialis builder — pushes bicep up from underneath.", category:"accessory", altGroup:"bicep" },
      { name:"Tricep Pushdown", sets:"3 x 12-15", weight:"Moderate", note:"Full lockout every rep. Elbows stay pinned to sides.", category:"secondary", altGroup:"tricep" },
      { name:"Overhead Tricep Extension", sets:"3 x 12", weight:"Light-moderate dumbbell", note:"Hits the long head. The part that makes arms look big from behind.", category:"accessory", altGroup:"tricep" },
      { name:"Neck Flexion / Extension / Lateral (3 rounds)", sets:"3 x 15-20 each", weight:"5-10 lb plate or hand resistance", note:"All three movements every session. Never go heavy. Full ROM. This is what builds neck thickness.", category:"neck" },
    ]
  }
];

// ── RECOVERY DAY PROTOCOL ──
const RECOVERY_PROTOCOL = {
  zone2: {
    title: "ZONE 2 CARDIO",
    color: "#06d6a0",
    icon: "🏃",
    phases: [
      { phase:"Weeks 1-3", duration:"20 min", note:"Easy jog or bike. If you can't hold a conversation, you're going too hard." },
      { phase:"Weeks 4-6", duration:"25-30 min", note:"Continuous zone 2. Same effort, longer duration." },
      { phase:"Weeks 7-9", duration:"30-35 min", note:"Steady base. Heart rate 130-150 bpm max." },
      { phase:"Weeks 10-12", duration:"35-40 min", note:"Full aerobic base built. XC pace is achievable now." },
    ]
  },
  mobility: {
    title: "MOBILITY CIRCUIT",
    color: "#ffd166",
    icon: "🧘",
    note: "Do this AFTER zone 2. Body is warm — best time to stretch.",
    exercises: [
      { name:"Hip Flexor Lunge Stretch", dur:"45 sec each side", cue:"Step forward into a deep lunge, back knee on floor. Sink hips straight down. Hold and breathe — don't bounce.", benefit:"Directly fixes anterior pelvic tilt. Huge for deadlift and umpiring back pain." },
      { name:"Seated Hamstring Stretch", dur:"60 sec each leg", cue:"Sit on floor, one leg straight. Hinge from hips (not your back) toward foot. Hold wherever you land. Exhale into it.", benefit:"Main driver of touching your toes. Pure hamstring length." },
      { name:"Pigeon Pose", dur:"90 sec each side", cue:"From downdog, bring knee forward behind wrist. Back leg extended. Walk hands forward, rest forearms down. Breathe.", benefit:"Deep hip opener. #1 fix for squat depth." },
      { name:"Thoracic Rotation (seated)", dur:"45 sec each side", cue:"Sit cross-legged. Place hand behind head. Rotate upper back only — hips stay forward. Slow and deliberate.", benefit:"Thoracic mobility for bench lockout and overhead position." },
      { name:"Child's Pose with Lat Reach", dur:"60 sec", cue:"Kneel, reach arms forward, sit back toward heels. Walk both hands to one side, hold, then the other. Breathe into lower back.", benefit:"Lat and lower back decompression after squats and deadlifts." },
      { name:"90/90 Hip Switch", dur:"5 slow reps each side", cue:"Sit in 90/90 position. Slowly rotate hips and switch to the other side. Feel internal and external hip rotation.", benefit:"Hip mobility that directly improves squat depth and single-leg stability." },
    ]
  },
  softTissue: {
    title: "SOFT TISSUE WORK",
    color: "#ff9f47",
    icon: "🔵",
    note: "Foam roll or lacrosse ball. 60-90 sec per spot. Slow, deliberate pressure.",
    targets: [
      { area:"Quads / IT Band", cue:"Roll outer quad and IT band from hip to knee. Pause on tender spots for 20-30 sec.", priority:"HIGH — after squat day" },
      { area:"Hamstrings", cue:"Sit on roller under thighs. Slowly roll hip to knee. Internal and external rotation while rolling.", priority:"HIGH — after deadlift day" },
      { area:"Upper Back / Thoracic", cue:"Roller horizontal across upper back. Arms crossed on chest. Roll T4-T8. Avoid lower back.", priority:"MEDIUM" },
      { area:"Glutes / Piriformis", cue:"Sit on lacrosse ball, one ankle on opposite knee (figure-4). Slowly move to find tight spots.", priority:"HIGH — helps with squat depth" },
      { area:"Calves", cue:"Roller under calf, opposite leg on top for pressure. Slow roll ankle to knee.", priority:"MEDIUM" },
      { area:"Lats", cue:"Foam roller under armpit, arm overhead. Roll along outer back from armpit to mid-back.", priority:"MEDIUM — after row/pull days" },
    ]
  },
  contrast: {
    title: "CONTRAST THERAPY",
    color: "#47c8ff",
    icon: "🧊",
    note: "Optional but very effective for recovery. Do after soft tissue work.",
    steps: [
      { label:"Cold Shower", duration:"2-3 min", note:"End your shower cold. Starts at 60-80°F. Not ice bath — just cold tap." },
      { label:"Warm Again", duration:"1-2 min", note:"Return to warm water." },
      { label:"Cold Finish", duration:"60-90 sec", note:"End cold. Forces vasoconstriction and subsequent vasodilation — flushes lactic acid." },
    ]
  },
  nutrition: {
    title: "RECOVERY NUTRITION",
    color: "#c47bff",
    icon: "🥩",
    note: "Recovery days are NOT low-calorie days. Muscle is built on rest days.",
    items: [
      { label:"Protein", target:"Still hit 155g", note:"Don't drop protein on off days. Muscle synthesis peaks 24-48 hrs post-lift." },
      { label:"Carbs", target:"Moderate — 150-250g", note:"You don't need to carb up, but don't restrict. Replenishes glycogen for Friday." },
      { label:"Hydration", target:"3+ liters", note:"Connective tissue repairs on rest days. Water is the medium." },
      { label:"Creatine", target:"5g as always", note:"Take daily regardless of training. Consistency is what loads muscle creatine." },
      { label:"Magnesium Glycinate", target:"300-400mg before bed", note:"Recovery day is when this matters most. Better sleep = better adaptation." },
    ]
  },
  sleep: {
    title: "SLEEP PRIORITY",
    color: "#4ade80",
    icon: "😴",
    note: "Wednesday is your biggest recovery window. Protect it.",
    tips: [
      "Aim for 8-9 hours tonight specifically — this is peak adaptation window",
      "Dim lights by 9:30 PM — melatonin delay with ADD means you need a head start",
      "Magnesium glycinate 60 min before bed — glycinate form only",
      "No screens 30 min before sleep — Kindle or audiobook only",
      "Room temp 65-68°F — core temp drop triggers sleep onset",
      "Tomorrow (Thursday) is your hardest lower day — sleep tonight is literally training",
    ]
  }
};

const nutrition = [
  { time:"Morning", meal:"Protein shake or chocolate milk", note:"30-40g protein. Liquid beats nausea on Azstarys." },
  { time:"Lunch", meal:"Rice + meat + calorie dense sides", note:"2nd biggest meal. Don't skip." },
  { time:"Pre-gym", meal:"Banana + peanut butter or granola bar", note:"30-45 min before. Fast carbs = energy." },
  { time:"Post-gym dinner", meal:"Big protein + carb meal", note:"Main event. 50g+ protein. Rice, pasta, potatoes." },
];
const supplements = [
  { name:"Creatine Monohydrate", dose:"5g daily", note:"Take it anytime. Consistency matters." },
  { name:"Magnesium Glycinate", dose:"300-400mg before bed", note:"Helps ADD brain wind down. Better sleep = better gains." },
  { name:"Protein Powder", dose:"1-2 scoops as needed", note:"Only if struggling to hit 155g from food." },
];
const gymBag = {
  essential:[
    { item:"Lifting belt", note:"Heavy compounds only." },
    { item:"Chalk or liquid chalk", note:"Game changer for deadlifts and rows." },
    { item:"Wrist wraps", note:"Bench and OHP. Keeps wrists neutral." },
    { item:"Water bottle (large)", note:"At least 32 oz." },
    { item:"Creatine (pre-portioned)", note:"Take daily, gym or not." },
    { item:"Earbuds / headphones", note:"Non-negotiable." },
    { item:"Nike Waffles", note:"Lift in these, run in Brooks Ghost." },
  ],
  useful:[
    { item:"Resistance bands", note:"Warm-up, mobility, face pulls." },
    { item:"Intra-workout carbs", note:"Gatorade or banana. Clutch on leg day." },
    { item:"Knee sleeves", note:"Great on heavy squat days." },
    { item:"Extra shirt", note:"You will sweat." },
    { item:"Protein bar", note:"Emergency calories if you trained fasted." },
  ],
  skip:[
    { item:"Lifting straps (for now)", note:"Build grip strength first." },
    { item:"Pre-workout every session", note:"Max 3x/week or you lose sensitivity." },
    { item:"Elbow sleeves", note:"Not needed unless you have joint pain." },
  ]
};

const progressionRules = [
  "Add weight ONLY when you hit the top of the rep range for ALL sets",
  "Upper body: add 5 lb when ready",
  "Lower body: add 10 lb when ready",
  "Squat: earn depth before adding weight",
  "Log every session - sets, reps, weight, how it felt",
  "If you miss reps two sessions in a row, drop 10% and rebuild",
  "Neck training: never go heavy, progress slowly",
  "Body scan monthly - first Monday of each month",
  "Deload every 4 weeks - reduce weight 40%, keep form perfect",
];

const WEEK_SCHEDULE = [
  { day:"Mon", type:"lift", dayIdx:0, label:"Upper A", color:"#e8ff47", work:"7:30-4:00", bodyScan:true },
  { day:"Tue", type:"lift", dayIdx:1, label:"Lower A", color:"#ff6b35", work:"7:30-4:00" },
  { day:"Wed", type:"recovery", dayIdx:2, label:"Zone 2 + Recovery", color:"#06d6a0", work:"7:30-4:00" },
  { day:"Thu", type:"lift", dayIdx:3, label:"Lower B", color:"#c47bff", work:"7:30-4:00" },
  { day:"Fri", type:"lift", dayIdx:4, label:"Upper B", color:"#47c8ff", work:"Off" },
  { day:"Sat", type:"lift", dayIdx:5, label:"Arms + Neck", color:"#ff9f47", work:"Off" },
  { day:"Sun", type:"rest", label:"Rest", color:"#444", work:"Off" },
];

const PR_LIFTS = [
  { key:"bench", label:"Bench Press", color:"#e8ff47" },
  { key:"squat", label:"Back Squat", color:"#ff6b35" },
  { key:"deadlift", label:"Deadlift", color:"#47c8ff" },
  { key:"ohp", label:"Overhead Press", color:"#c47bff" },
  { key:"row", label:"Barbell Row", color:"#ff9f47" },
];
const categoryColors = {
  main:{ bg:"bg-white/10", badge:"bg-white text-black", label:"MAIN" },
  secondary:{ bg:"bg-white/5", badge:"bg-white/20 text-white", label:"SECONDARY" },
  accessory:{ bg:"bg-white/5", badge:"bg-white/10 text-white/60", label:"ACCESSORY" },
  mobility:{ bg:"bg-yellow-400/10", badge:"bg-yellow-400 text-black", label:"MOBILITY FIRST" },
  neck:{ bg:"bg-purple-500/10", badge:"bg-purple-500 text-white", label:"NECK" },
  ab:{ bg:"bg-green-400/10", badge:"bg-green-400 text-black", label:"ABS" },
};
const COMPOUND_CATS = ["main","mobility"];

function ls(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }

// ── INLINE TIMER ──
function InlineTimer({ duration, color, label, onDismiss }) {
  const [remaining, setRemaining] = useState(duration);
  useEffect(() => {
    setRemaining(duration);
    const iv = setInterval(() => setRemaining(r => r <= 1 ? (clearInterval(iv), 0) : r - 1), 1000);
    return () => clearInterval(iv);
  }, [duration]);
  const pct = remaining / duration, R = 18, C = 2 * Math.PI * R;
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  const col = remaining === 0 ? "#4ade80" : color;
  return (
    <div style={{ position:"fixed",bottom:88,right:16,zIndex:9999,background:"#111",border:`1px solid ${col}`,borderRadius:16,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 4px 24px ${col}50`,minWidth:160 }}>
      <svg width="44" height="44" style={{ transform:"rotate(-90deg)",flexShrink:0 }}>
        <circle cx="22" cy="22" r={R} fill="none" stroke="#222" strokeWidth="3"/>
        <circle cx="22" cy="22" r={R} fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct*C} ${C}`} style={{ transition:"stroke-dasharray 0.9s linear" }}/>
      </svg>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:1 }}>{label} REST</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:remaining===0?16:22,color:remaining===0?"#4ade80":"white",lineHeight:1.1 }}>
          {remaining===0?"GO!":`${mins}:${secs.toString().padStart(2,"0")}`}
        </div>
      </div>
      <button onClick={onDismiss} style={{ background:"transparent",border:"none",color:"rgba(255,255,255,0.3)",fontSize:16,cursor:"pointer",padding:"2px 4px" }}>x</button>
    </div>
  );
}

// ── SET LOG MODAL ──
function SetLogModal({ exName, color, onSave, onSkip }) {
  const [w,setW]=useState(""), [r,setR]=useState("");
  const est = w && r ? estimate1RM(parseFloat(w), parseInt(r)) : null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:24 }}>
      <div style={{ background:"#111",border:`1px solid ${color}40`,borderRadius:20,padding:24,width:"100%",maxWidth:340 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color,marginBottom:4 }}>SET COMPLETE</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:20 }}>{exName}</div>
        <div style={{ display:"flex",gap:12,marginBottom:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1 }}>Weight (lb)</div>
            <input type="number" placeholder="185" value={w} onChange={e=>setW(e.target.value)} style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:16,width:"100%",boxSizing:"border-box" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:6,textTransform:"uppercase",letterSpacing:1 }}>Reps</div>
            <input type="number" placeholder="5" value={r} onChange={e=>setR(e.target.value)} style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:16,width:"100%",boxSizing:"border-box" }}/>
          </div>
        </div>
        {est && <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color,marginBottom:12,textAlign:"center" }}>Est. 1RM: <strong>{est} lb</strong>{parseInt(r)>5?" (capped at 5r for accuracy)":""}</div>}
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onSkip} style={{ flex:1,padding:"11px 0",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer" }}>Skip</button>
          <button onClick={()=>onSave(parseFloat(w)||null,parseInt(r)||null)} style={{ flex:2,padding:"11px 0",borderRadius:12,border:"none",background:color,color:"#000",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>Log Set</button>
        </div>
      </div>
    </div>
  );
}

// ── RENAME MODAL ──
function RenameModal({ days, onSave, onClose }) {
  const liftDays = days.filter(d => !d.isRecovery);
  const [selDay,setSelDay]=useState(0),[selEx,setSelEx]=useState(0),[nameVal,setNameVal]=useState(liftDays[0].exercises[0].name);
  useEffect(()=>{ setSelEx(0); setNameVal(liftDays[selDay].exercises[0].name); },[selDay]);
  useEffect(()=>{ setNameVal(liftDays[selDay].exercises[selEx].name); },[selEx]);
  const originalDayIdx = days.findIndex(d => d.id === liftDays[selDay].id);
  return (
    <div style={{ position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:24 }}>
      <div style={{ background:"#111",border:"1px solid #333",borderRadius:20,padding:24,width:"100%",maxWidth:360 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"white",marginBottom:4 }}>RENAME EXERCISE</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:20 }}>Pick a day, pick an exercise, type new name</div>
        <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
          {liftDays.map((d,i)=>(
            <button key={i} onClick={()=>setSelDay(i)} style={{ padding:"8px 12px",borderRadius:10,border:`1px solid ${selDay===i?d.color:"#333"}`,background:selDay===i?d.color+"20":"transparent",color:selDay===i?d.color:"#555",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,cursor:"pointer" }}>{d.id}</button>
          ))}
        </div>
        <div style={{ maxHeight:160,overflowY:"auto",marginBottom:16,borderRadius:10,border:"1px solid #222" }}>
          {liftDays[selDay].exercises.map((ex,i)=>(
            <button key={i} onClick={()=>setSelEx(i)} style={{ display:"block",width:"100%",textAlign:"left",padding:"10px 14px",background:selEx===i?"#222":"transparent",border:"none",borderBottom:i<liftDays[selDay].exercises.length-1?"1px solid #1a1a1a":"none",color:selEx===i?"white":"rgba(255,255,255,0.45)",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer" }}>{ex.name}</button>
          ))}
        </div>
        <input type="text" value={nameVal} onChange={e=>setNameVal(e.target.value)} style={{ background:"#1a1a1a",border:`1px solid ${liftDays[selDay].color}`,color:"white",borderRadius:10,padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box",marginBottom:16 }}/>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px 0",borderRadius:12,border:"1px solid #333",background:"transparent",color:"rgba(255,255,255,0.4)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>onSave(originalDayIdx,selEx,nameVal)} style={{ flex:2,padding:"11px 0",borderRadius:12,border:"none",background:liftDays[selDay].color,color:"#000",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer" }}>Save Name</button>
        </div>
      </div>
    </div>
  );
}

// ── PR TOAST ──
function PRToast({ message, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:20000,background:"#111",border:`2px solid ${color}`,borderRadius:16,padding:"12px 20px",boxShadow:`0 4px 32px ${color}60`,maxWidth:320,width:"90%" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color,textAlign:"center" }}>NEW PR</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"white",textAlign:"center",marginTop:2 }}>{message}</div>
    </div>
  );
}

// ── RECOVERY DAY TAB ──
function RecoveryDayView({ day }) {
  const [openSection, setOpenSection] = useState("zone2");
  const [checkedItems, setCheckedItems] = useState({});
  const [mobilityTimers, setMobilityTimers] = useState({});
  const toggle = (key) => setOpenSection(o => o === key ? null : key);
  const checkItem = (key) => setCheckedItems(p => ({ ...p, [key]: !p[key] }));
  const startMobilityTimer = (idx, secs) => {
    setMobilityTimers(p => ({ ...p, [idx]: secs }));
    const iv = setInterval(() => {
      setMobilityTimers(p => {
        const next = (p[idx] || 0) - 1;
        if (next <= 0) { clearInterval(iv); return { ...p, [idx]: 0 }; }
        return { ...p, [idx]: next };
      });
    }, 1000);
  };
  const p = RECOVERY_PROTOCOL;
  const sections = [
    { key:"zone2", title:p.zone2.title, color:p.zone2.color, icon:p.zone2.icon },
    { key:"mobility", title:p.mobility.title, color:p.mobility.color, icon:p.mobility.icon },
    { key:"softTissue", title:p.softTissue.title, color:p.softTissue.color, icon:p.softTissue.icon },
    { key:"contrast", title:p.contrast.title, color:p.contrast.color, icon:p.contrast.icon },
    { key:"nutrition", title:p.nutrition.title, color:p.nutrition.color, icon:p.nutrition.icon },
    { key:"sleep", title:p.sleep.title, color:p.sleep.color, icon:p.sleep.icon },
  ];
  return (
    <div className="px-4 pt-4 pb-24">
      <div className="text-3xl tracking-wide mb-1" style={{ color:"#06d6a0" }}>ZONE 2 + RECOVERY</div>
      <div className="body-text text-white/40 text-sm mb-4">Wednesday - Your body rebuilds today. Earn Thursday's deadlifts.</div>
      <div className="p-4 rounded-2xl mb-4" style={{ background:"linear-gradient(135deg,#06d6a015,#06d6a005)",border:"1px solid #06d6a030" }}>
        <div className="text-xl tracking-wide mb-2" style={{ color:"#06d6a0" }}>THE BIG PICTURE</div>
        <div className="body-text text-white/60 text-sm leading-relaxed">Wednesday is not a rest day — it's an <span style={{ color:"#06d6a0" }}>active recovery day</span>. Zone 2 cardio + mobility + soft tissue work compounds over weeks. This is how you stay injury-free and hit PRs on Thursday.</div>
      </div>
      {sections.map(sec => {
        const isOpen = openSection === sec.key;
        return (
          <div key={sec.key} className="mb-3 rounded-2xl overflow-hidden" style={{ border:`1px solid ${sec.color}30` }}>
            <button onClick={() => toggle(sec.key)} className="w-full p-4 flex items-center justify-between set-btn" style={{ background:"#111" }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:20 }}>{sec.icon}</span>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:sec.color }}>{sec.title}</div>
              </div>
              <span className="body-text text-white/30 text-sm">{isOpen?"▲":"▼"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-2" style={{ background:"#0a0a0a",borderTop:`1px solid ${sec.color}15` }}>
                {sec.key === "zone2" && (
                  <>
                    <div className="body-text text-white/40 text-xs leading-relaxed mb-4">Run, bike, row, or elliptical. <span style={{ color:"#06d6a0" }}>Nasal breathing test:</span> if you can't breathe only through your nose, slow down. That's the zone.</div>
                    <div className="space-y-3">
                      {p.zone2.phases.map((ph, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
                          <div className="px-2 py-1 rounded-full text-xs body-text shrink-0" style={{ background:"#06d6a020",color:"#06d6a0" }}>{ph.phase}</div>
                          <div>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"white" }}>{ph.duration}</div>
                            <div className="body-text text-white/40 text-xs">{ph.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {sec.key === "mobility" && (
                  <>
                    <div className="body-text text-white/40 text-xs mb-4">{p.mobility.note}</div>
                    <div className="space-y-3">
                      {p.mobility.exercises.map((ex, i) => {
                        const timerVal = mobilityTimers[i];
                        const isRunning = timerVal > 0;
                        const isDone = timerVal === 0 && timerVal !== undefined;
                        return (
                          <div key={i} className="p-3 rounded-xl" style={{ background:"#111",border:`1px solid ${isDone?"#ffd16640":"#1e1e1e"}` }}>
                            <div className="flex justify-between items-start mb-1">
                              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:isDone?"#ffd166":"white" }}>{ex.name}</div>
                              <span className="body-text text-xs shrink-0 ml-2" style={{ color:"#ffd166" }}>{ex.dur}</span>
                            </div>
                            <div className="body-text text-white/50 text-xs mb-1">{ex.cue}</div>
                            <div className="body-text text-white/25 text-xs mb-2">Benefit: {ex.benefit}</div>
                            {isRunning ? (
                              <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#ffd166" }}>
                                {Math.floor(timerVal/60)}:{String(timerVal%60).padStart(2,"0")}
                              </span>
                            ) : (
                              <button onClick={() => startMobilityTimer(i, 60)} className="set-btn body-text text-xs px-3 py-1.5 rounded-lg" style={{ background:isDone?"#ffd16620":"rgba(255,255,255,0.05)",color:isDone?"#ffd166":"rgba(255,255,255,0.3)",border:`1px solid ${isDone?"#ffd16640":"rgba(255,255,255,0.1)"}` }}>
                                {isDone ? "✓ Done" : "▶ Timer"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {sec.key === "softTissue" && (
                  <>
                    <div className="body-text text-white/40 text-xs mb-4">{p.softTissue.note}</div>
                    <div className="space-y-2">
                      {p.softTissue.targets.map((t, i) => (
                        <div key={i} className="p-3 rounded-xl flex items-start gap-3" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
                          <button onClick={() => checkItem(`soft-${i}`)} className="set-btn shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background:checkedItems[`soft-${i}`]?"#ff9f47":"#222",border:`1px solid ${checkedItems[`soft-${i}`]?"#ff9f47":"#444"}`,color:"#000" }}>
                            {checkedItems[`soft-${i}`]?"✓":""}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:checkedItems[`soft-${i}`]?"#ff9f47":"white" }}>{t.area}</div>
                              <span className="body-text text-xs px-1.5 py-0.5 rounded-full" style={{ background:t.priority.startsWith("HIGH")?"#ff4444":"#ff9f47",color:"#000",fontSize:9 }}>{t.priority}</span>
                            </div>
                            <div className="body-text text-white/40 text-xs">{t.cue}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {sec.key === "contrast" && (
                  <>
                    <div className="body-text text-white/40 text-xs mb-4">{p.contrast.note}</div>
                    <div className="space-y-3">
                      {p.contrast.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold body-text" style={{ background:"#47c8ff20",color:"#47c8ff",border:"1px solid #47c8ff40" }}>{i+1}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#47c8ff" }}>{s.label}</div>
                              <span className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{s.duration}</span>
                            </div>
                            <div className="body-text text-white/40 text-xs">{s.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {sec.key === "nutrition" && (
                  <>
                    <div className="body-text text-white/40 text-xs mb-4">{p.nutrition.note}</div>
                    <div className="space-y-2">
                      {p.nutrition.items.map((item, i) => (
                        <div key={i} className="p-3 rounded-xl" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
                          <div className="flex justify-between items-center mb-0.5">
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#c47bff" }}>{item.label}</div>
                            <span className="body-text text-xs px-2 py-0.5 rounded-full" style={{ background:"#c47bff20",color:"#c47bff" }}>{item.target}</span>
                          </div>
                          <div className="body-text text-white/40 text-xs">{item.note}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {sec.key === "sleep" && (
                  <>
                    <div className="body-text text-white/40 text-xs mb-4">{p.sleep.note}</div>
                    <div className="space-y-2">
                      {p.sleep.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background:"#4ade80" }}/>
                          <div className="body-text text-white/60 text-sm">{tip}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PROTEIN TAB ──
function ProteinTab() {
  const [entries,setEntries]=useState(()=>ls("protein_entries",{}));
  const [manualG,setManualG]=useState(""),[manualName,setManualName]=useState(""),[view,setView]=useState("today");
  const [editingId,setEditingId]=useState(null);
  const [editG,setEditG]=useState(""),[editName,setEditName]=useState("");
  const [expandedHistoryDay,setExpandedHistoryDay]=useState(null);
  const todayKey=getLocalDateKey();
  const todayEntries=entries[todayKey]||[];
  const todayTotal=todayEntries.reduce((s,e)=>s+e.protein,0);
  const pct=Math.min(100,(todayTotal/PROTEIN_GOAL)*100);
  const saveEntries=u=>{ setEntries(u); lsSet("protein_entries",u); };
  const addEntry=(name,protein)=>{
    const entry={ id:Date.now(),name,protein,time:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) };
    saveEntries({ ...entries,[todayKey]:[...(entries[todayKey]||[]),entry] });
  };
  const addManual=()=>{ const g=parseInt(manualG); if(!g||g<=0)return; addEntry(manualName.trim()||"Custom food",g); setManualG("");setManualName(""); };
  const deleteEntry=(dateKey,id)=>saveEntries({ ...entries,[dateKey]:(entries[dateKey]||[]).filter(e=>e.id!==id) });
  const startEdit=(entry)=>{ setEditingId(entry.id); setEditG(String(entry.protein)); setEditName(entry.name); };
  const saveEdit=(dateKey)=>{
    const g=parseInt(editG);
    if(!g||g<=0){ setEditingId(null); return; }
    const updated=(entries[dateKey]||[]).map(e=>e.id===editingId?{...e,protein:g,name:editName.trim()||e.name}:e);
    saveEntries({...entries,[dateKey]:updated});
    setEditingId(null);
  };
  const cancelEdit=()=>setEditingId(null);
  const streak=calcProteinStreak(entries);
  const barColor=pct>=100?"#4ade80":pct>=70?"#e8ff47":"#47c8ff";
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=getLocalDateKey(d);
    const label=i===0?"Today":i===1?"Yesterday":d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
    const dayEntries=entries[key]||[];
    const total=dayEntries.reduce((s,e)=>s+e.protein,0);
    return {key,label,total,dayEntries};
  });
  const EntryRow = ({ entry, dateKey, color }) => {
    const isEditing = editingId === entry.id;
    if (isEditing) {
      return (
        <div className="p-3 rounded-xl mb-1" style={{ background:"#1a1a1a",border:`1px solid ${color}60` }}>
          <div className="flex gap-2 mb-2">
            <div style={{ flex:2 }}>
              <div className="body-text text-white/30 text-xs mb-1">Food name</div>
              <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} style={{ background:"#111",border:"1px solid #444",color:"white",borderRadius:8,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:"100%",boxSizing:"border-box" }}/>
            </div>
            <div style={{ width:72 }}>
              <div className="body-text text-white/30 text-xs mb-1">Grams</div>
              <input type="number" value={editG} onChange={e=>setEditG(e.target.value)} style={{ background:"#111",border:"1px solid #444",color:"white",borderRadius:8,padding:"8px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:"100%",boxSizing:"border-box" }}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="set-btn body-text text-xs flex-1 py-1.5 rounded-lg" style={{ background:"transparent",border:"1px solid #444",color:"#888" }}>Cancel</button>
            <button onClick={()=>saveEdit(dateKey)} className="set-btn body-text text-xs font-semibold flex-1 py-1.5 rounded-lg" style={{ background:color,color:"#000" }}>Save</button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between p-3 rounded-xl mb-1" style={{ background:"#111",border:"1px solid #1e1e1e" }}>
        <div style={{ flex:1 }}>
          <div className="body-text text-white text-sm font-medium">{entry.name}</div>
          <div className="body-text text-white/30 text-xs">{entry.time}</div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color }}>{entry.protein}g</div>
          <button onClick={()=>startEdit(entry)} className="set-btn body-text text-xs px-2 py-1 rounded-lg" style={{ color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.1)" }}>edit</button>
          <button onClick={()=>deleteEntry(dateKey,entry.id)} className="set-btn body-text text-xs px-2 py-1 rounded-lg" style={{ color:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.08)" }}>x</button>
        </div>
      </div>
    );
  };
  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-3xl tracking-wide">PROTEIN</div>
          {streak>0&&<div className="body-text text-xs mt-0.5" style={{ color:"#4ade80" }}>🔥 {streak} day streak</div>}
        </div>
        <div className="flex gap-1">
          {["today","history"].map(v=>(
            <button key={v} onClick={()=>setView(v)} className="body-text text-xs px-3 py-1.5 rounded-full font-medium uppercase"
              style={{ background:view===v?"#47c8ff":"#111",color:view===v?"#000":"#555",border:`1px solid ${view===v?"#47c8ff":"#333"}` }}>{v}</button>
          ))}
        </div>
      </div>
      {view==="today"&&<>
        <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:`1px solid ${barColor}30` }}>
          <div className="flex items-center gap-4 mb-3">
            <div style={{ position:"relative",width:72,height:72,flexShrink:0 }}>
              <svg width="72" height="72" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#222" strokeWidth="6"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke={barColor} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(pct/100)*(2*Math.PI*30)} ${2*Math.PI*30}`} style={{ transition:"stroke-dasharray 0.5s ease" }}/>
              </svg>
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:barColor,lineHeight:1 }}>{Math.round(pct)}%</span>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:42,color:barColor,lineHeight:1 }}>{todayTotal}g</div>
              <div className="body-text text-white/40 text-sm">of {PROTEIN_GOAL}g goal</div>
            </div>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ background:"#222",height:6,marginBottom:8 }}>
            <div style={{ width:`${pct}%`,height:"100%",background:barColor,borderRadius:9999,transition:"width 0.4s ease" }}/>
          </div>
          <div className="body-text text-xs" style={{ color:todayTotal>PROTEIN_GOAL?"#4ade80":"rgba(255,255,255,0.3)" }}>
            {todayTotal>PROTEIN_GOAL?`Goal crushed! +${todayTotal-PROTEIN_GOAL}g over`:`${Math.max(0,PROTEIN_GOAL-todayTotal)}g remaining`}
          </div>
        </div>
        <div className="text-xl tracking-wide mb-2">ADD FOOD</div>
        <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:"1px solid #222" }}>
          <div className="flex gap-2 mb-3">
            <div style={{ flex:2 }}>
              <div className="body-text text-white/30 text-xs mb-1">Food name (optional)</div>
              <input type="text" placeholder="e.g. Chicken breast" value={manualName} onChange={e=>setManualName(e.target.value)} style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box" }}/>
            </div>
            <div style={{ width:80 }}>
              <div className="body-text text-white/30 text-xs mb-1">Protein (g)</div>
              <input type="number" placeholder="40" value={manualG} onChange={e=>setManualG(e.target.value)} style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box" }}/>
            </div>
          </div>
          <button onClick={addManual} className="set-btn body-text text-sm font-semibold w-full py-2.5 rounded-xl" style={{ background:"#47c8ff",color:"#000" }}>+ Add to Today</button>
        </div>
        {todayEntries.length>0&&<>
          <div className="text-xl tracking-wide mb-2">TODAY'S LOG <span className="body-text text-xs text-white/30 normal-case font-normal">tap edit to fix entries</span></div>
          {[...todayEntries].reverse().map(entry=>(<EntryRow key={entry.id} entry={entry} dateKey={todayKey} color="#47c8ff"/>))}
        </>}
        {todayEntries.length===0&&<div className="body-text text-white/20 text-sm text-center py-8">Nothing logged yet today.</div>}
      </>}
      {view==="history"&&<>
        <div className="text-xl tracking-wide mb-3">LAST 7 DAYS</div>
        <div className="space-y-2">
          {last7.map(({key,label,total,dayEntries})=>{
            const p=Math.min(100,(total/PROTEIN_GOAL)*100);
            const c=p>=100?"#4ade80":p>=70?"#e8ff47":p>0?"#47c8ff":"#333";
            const isExpanded=expandedHistoryDay===key;
            return (
              <div key={key} className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${c}20` }}>
                <div className="p-4" style={{ background:"#111",cursor:"pointer" }} onClick={()=>setExpandedHistoryDay(isExpanded?null:key)}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="body-text text-white text-sm font-medium">{label}</div>
                      <div className="body-text text-xs text-white/30">{isExpanded?"hide":"edit"}</div>
                    </div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:c }}>{total}g</div>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ background:"#222",height:4 }}>
                    <div style={{ width:`${p}%`,height:"100%",background:c,borderRadius:9999 }}/>
                  </div>
                  <div className="body-text text-xs mt-1" style={{ color:"rgba(255,255,255,0.2)" }}>
                    {total===0?"Not logged":p>=100?"Goal hit":total>0?`${PROTEIN_GOAL-total}g short`:""}
                  </div>
                </div>
                {isExpanded&&(
                  <div className="px-3 pb-3" style={{ background:"#0d0d0d" }}>
                    {dayEntries.length===0?(
                      <div className="body-text text-white/20 text-xs text-center py-3">No entries for this day.</div>
                    ):(
                      <div className="pt-2">{[...dayEntries].reverse().map(entry=>(<EntryRow key={entry.id} entry={entry} dateKey={key} color={c==="#333"?"#47c8ff":c}/>))}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-4 rounded-2xl" style={{ background:"#111",border:"1px solid #e8ff4725" }}>
          <div className="text-xl tracking-wide mb-1" style={{ color:"#e8ff47" }}>YOUR GOAL</div>
          <div className="body-text text-white/60 text-sm"><span style={{ color:"#47c8ff",fontFamily:"'Bebas Neue',sans-serif",fontSize:20 }}>155g/day</span> — InBody: 140 lb lean mass x 1.1g/lb.</div>
        </div>
      </>}
    </div>
  );
}

// ── BODY SCAN TAB ──
function BodyScanTab({ onBwChange }) {
  const [scans,setScans]=useState(()=>ls("body_scans",[]));
  const [form,setForm]=useState({date:"",weight:"",muscle:"",fat:"",bodyfat:"",age:""});
  const [adding,setAdding]=useState(false);
  const saveScans=s=>{ setScans(s); lsSet("body_scans",s); };
  const addScan=()=>{
    if(!form.weight) return;
    const entry={ id:Date.now(),date:form.date||new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),weight:parseFloat(form.weight)||null,muscle:parseFloat(form.muscle)||null,fat:parseFloat(form.fat)||null,bodyfat:parseFloat(form.bodyfat)||null,age:parseInt(form.age)||null };
    const updated=[entry,...scans]; saveScans(updated);
    if(form.weight) onBwChange(form.weight);
    setForm({date:"",weight:"",muscle:"",fat:"",bodyfat:"",age:""}); setAdding(false);
  };
  const deleteScan=id=>saveScans(scans.filter(s=>s.id!==id));
  const bwTrend=scans.filter(s=>s.weight).slice(0,8).reverse();
  const muscleTrend=scans.filter(s=>s.muscle).slice(0,8).reverse();
  const fields=[
    {key:"weight",label:"Weight (lb)",placeholder:"154.8",color:"#e8ff47"},
    {key:"muscle",label:"Skeletal Muscle (lb)",placeholder:"80.2",color:"#47c8ff"},
    {key:"fat",label:"Body Fat (lb)",placeholder:"14.1",color:"#ff6b35"},
    {key:"bodyfat",label:"Body Fat %",placeholder:"9.2",color:"#c47bff"},
    {key:"age",label:"Age",placeholder:"17",color:"#4ade80"},
  ];
  const MiniBar = ({ data, color, label }) => {
    if (data.length < 2) return null;
    const vals = data.map(s => s[label === "WEIGHT" ? "weight" : "muscle"]);
    const minV = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
    return (
      <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:`1px solid ${color}25` }}>
        <div className="text-lg tracking-wide mb-3" style={{ color }}>{label} TREND</div>
        <div className="flex items-end gap-1.5" style={{ height:60 }}>
          {data.map((s,i)=>{
            const val = label === "WEIGHT" ? s.weight : s.muscle;
            const h = Math.max(8,((val-minV)/range)*50+10);
            return (
              <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
                <div style={{ width:"100%",height:h,background:color,borderRadius:3,opacity:0.6+i*0.06 }}/>
                <div className="body-text" style={{ fontSize:8,color:"rgba(255,255,255,0.3)",textAlign:"center" }}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex justify-between items-center mb-1">
        <div className="text-3xl tracking-wide">BODY SCAN</div>
        <button onClick={()=>setAdding(!adding)} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{ background:adding?"#333":"#e8ff4720",color:adding?"white":"#e8ff47",border:`1px solid ${adding?"#555":"#e8ff4740"}` }}>
          {adding?"Cancel":"+ Log Scan"}
        </button>
      </div>
      <div className="body-text text-white/30 text-xs mb-4">Log monthly - first Monday of each month</div>
      {adding&&(
        <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:"1px solid #e8ff4730" }}>
          <div className="text-xl tracking-wide mb-3" style={{ color:"#e8ff47" }}>NEW SCAN</div>
          <div className="body-text text-white/30 text-xs mb-1">Date (optional)</div>
          <input type="text" placeholder="Jun 2, 2025" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
            style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box",marginBottom:12 }}/>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {fields.map(f=>(
              <div key={f.key}>
                <div className="body-text text-xs mb-1" style={{ color:"rgba(255,255,255,0.3)" }}>{f.label}</div>
                <input type="number" placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  style={{ background:"#1a1a1a",border:`1px solid ${f.color}40`,color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
          <button onClick={addScan} className="set-btn body-text text-sm font-semibold w-full py-2.5 rounded-xl" style={{ background:"#e8ff47",color:"#000" }}>Save Scan</button>
        </div>
      )}
      <MiniBar data={bwTrend} color="#e8ff47" label="WEIGHT"/>
      <MiniBar data={muscleTrend} color="#47c8ff" label="MUSCLE"/>
      {scans.length===0?(
        <div className="body-text text-white/20 text-sm text-center py-12">No scans yet. Log your first Monday InBody scan.</div>
      ):(
        <div className="space-y-3">
          {scans.map((scan,idx)=>{
            const prev=scans[idx+1];
            const diff=field=>prev&&scan[field]&&prev[field]?(scan[field]-prev[field]).toFixed(1):null;
            return (
              <div key={scan.id} className="p-4 rounded-2xl" style={{ background:"#111",border:"1px solid #222" }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xl tracking-wide" style={{ color:"#e8ff47" }}>{scan.date||"No date"}</div>
                  <div className="flex items-center gap-2">
                    {scan.age&&<div className="body-text text-xs px-2 py-0.5 rounded-full" style={{ background:"#4ade8020",color:"#4ade80" }}>Age {scan.age}</div>}
                    <button onClick={()=>deleteScan(scan.id)} className="set-btn body-text text-xs px-2 py-1 rounded-lg" style={{ color:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.08)" }}>x</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {label:"Weight",val:scan.weight,unit:"lb",d:diff("weight"),color:"#e8ff47",goodUp:true},
                    {label:"Muscle Mass",val:scan.muscle,unit:"lb",d:diff("muscle"),color:"#47c8ff",goodUp:true},
                    {label:"Body Fat",val:scan.fat,unit:"lb",d:diff("fat"),color:"#ff6b35",goodUp:false},
                    {label:"Body Fat %",val:scan.bodyfat,unit:"%",d:null,color:"#c47bff"},
                  ].map(f=>(
                    <div key={f.label} className="p-2 rounded-xl" style={{ background:"#1a1a1a" }}>
                      <div className="body-text text-xs mb-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>{f.label}</div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:f.val?f.color:"#333" }}>{f.val?`${f.val}${f.unit}`:"--"}</div>
                      {f.d&&<div className="body-text text-xs" style={{ color:parseFloat(f.d)===0?"#555":(f.goodUp?parseFloat(f.d)>0:parseFloat(f.d)<0)?"#4ade80":"#ff4444" }}>
                        {parseFloat(f.d)>0?"+":""}{f.d}{f.unit}
                      </div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── VOLUME TAB ──
function VolumeTab({ setLog }) {
  const getWeekStart=()=>{
    const now=new Date(), day=now.getDay();
    const d=new Date(now); d.setDate(d.getDate()-day+(day===0?-6:1)); d.setHours(0,0,0,0);
    return d;
  };
  const weekStart=getWeekStart();
  const weekLogs=setLog.filter(e=>e.timestamp&&new Date(e.timestamp)>=weekStart);
  const muscleSets={};
  weekLogs.forEach(entry=>{
    (EX_MUSCLE_MAP[entry.exName]||[]).forEach(m=>{ muscleSets[m]=(muscleSets[m]||0)+1; });
  });
  const sorted=Object.entries(muscleSets).sort((a,b)=>b[1]-a[1]);
  const notHit=Object.keys(RECOMMENDED_SETS).filter(m=>!muscleSets[m]);
  return (
    <div className="px-4 pt-4 pb-24">
      <div className="text-3xl tracking-wide mb-1">VOLUME</div>
      <div className="body-text text-white/30 text-xs mb-4">Sets per muscle group - this week only (resets Monday)</div>
      {weekLogs.length===0?(
        <div className="body-text text-white/20 text-sm text-center py-12">No sets logged this week yet.</div>
      ):(
        <>
          <div className="space-y-2 mb-4">
            {sorted.map(([muscle,sets])=>{
              const color=MUSCLE_COLORS[muscle]||"#888";
              const rec=RECOMMENDED_SETS[muscle]||10;
              const pct=Math.min(100,(sets/rec)*100);
              const status=sets>=rec?"✓":sets>=(rec*0.7)?"~":"↑";
              const statusColor=sets>=rec?"#4ade80":sets>=(rec*0.7)?"#e8ff47":"#ff6b35";
              return (
                <div key={muscle} className="p-3 rounded-xl" style={{ background:"#111",border:`1px solid ${color}20` }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="body-text text-sm font-medium text-white">{muscle}</div>
                    <div className="flex items-center gap-2">
                      <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{sets}/{rec} sets</div>
                      <div className="body-text text-xs font-bold" style={{ color:statusColor }}>{status}</div>
                    </div>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ background:"#222",height:4 }}>
                    <div style={{ width:`${pct}%`,height:"100%",background:color,borderRadius:9999 }}/>
                  </div>
                </div>
              );
            })}
          </div>
          {notHit.length>0&&(
            <div className="p-3 rounded-xl mb-4" style={{ background:"#111",border:"1px solid #ff6b3520" }}>
              <div className="body-text text-xs text-white/40 mb-1">NOT HIT YET THIS WEEK</div>
              <div className="body-text text-xs" style={{ color:"#ff6b35" }}>{notHit.join(" · ")}</div>
            </div>
          )}
        </>
      )}
      <div className="p-4 rounded-2xl" style={{ background:"#111",border:"1px solid #ffffff10" }}>
        <div className="body-text text-white/30 text-xs leading-relaxed">✓ = at/above recommended · ~ = 70%+ · ↑ = needs more volume. Weekly targets for natural lifters.</div>
      </div>
    </div>
  );
}

// ── NOTES TAB ──
function NotesTab({ days }) {
  const liftDays = days.filter(d => !d.isRecovery);
  const [notes,setNotes]=useState(()=>ls("session_notes",[]));
  const [selDay,setSelDay]=useState(0),[noteText,setNoteText]=useState(""),[rating,setRating]=useState(3);
  const saveNotes=n=>{ setNotes(n); lsSet("session_notes",n); };
  const addNote=()=>{
    if(!noteText.trim()) return;
    const entry={ id:Date.now(),dayId:liftDays[selDay].id,dayName:liftDays[selDay].name.split("-")[0].trim(),dayColor:liftDays[selDay].color,note:noteText.trim(),rating,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),time:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) };
    saveNotes([entry,...notes]); setNoteText(""); setRating(3);
  };
  const deleteNote=id=>saveNotes(notes.filter(n=>n.id!==id));
  const ratingLabel={1:"Rough",2:"Okay",3:"Solid",4:"Great",5:"PB Day"};
  const ratingDisplay={1:"💀",2:"😤",3:"💪",4:"🔥",5:"⚡"};
  return (
    <div className="px-4 pt-4 pb-24">
      <div className="text-3xl tracking-wide mb-4">SESSION NOTES</div>
      <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:"1px solid #222" }}>
        <div className="text-xl tracking-wide mb-3">LOG TODAY</div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
          {liftDays.map((d,i)=>(
            <button key={i} onClick={()=>setSelDay(i)} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
              style={{ background:selDay===i?d.color+"20":"transparent",color:selDay===i?d.color:"#555",border:`1px solid ${selDay===i?d.color:"#333"}` }}>
              {d.id} - {d.label}
            </button>
          ))}
        </div>
        <div className="body-text text-white/30 text-xs mb-2">Session rating</div>
        <div className="flex gap-2 mb-3">
          {[1,2,3,4,5].map(r=>(
            <button key={r} onClick={()=>setRating(r)} className="set-btn flex-1 py-2 rounded-xl text-center"
              style={{ background:rating===r?liftDays[selDay].color+"30":"#1a1a1a",border:`1px solid ${rating===r?liftDays[selDay].color:"#333"}` }}>
              <div style={{ fontSize:16 }}>{ratingDisplay[r]}</div>
              <div className="body-text text-xs mt-0.5" style={{ color:rating===r?liftDays[selDay].color:"#555" }}>{ratingLabel[r]}</div>
            </button>
          ))}
        </div>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="How did it feel? PR attempts? Anything to remember next time..." rows={3}
          style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box",resize:"none",marginBottom:12 }}/>
        <button onClick={addNote} className="set-btn body-text text-sm font-semibold w-full py-2.5 rounded-xl" style={{ background:liftDays[selDay].color,color:"#000" }}>Save Note</button>
      </div>
      {notes.length===0?(
        <div className="body-text text-white/20 text-sm text-center py-8">No notes yet. Log after each session.</div>
      ):(
        <div className="space-y-3">
          {notes.map(entry=>(
            <div key={entry.id} className="p-4 rounded-2xl" style={{ background:"#111",border:`1px solid ${entry.dayColor}25` }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:entry.dayColor }}>{entry.dayName}</span>
                    <span style={{ fontSize:16 }}>{ratingDisplay[entry.rating]}</span>
                    <span className="body-text text-xs" style={{ color:entry.dayColor }}>{ratingLabel[entry.rating]}</span>
                  </div>
                  <div className="body-text text-white/30 text-xs">{entry.date} - {entry.time}</div>
                </div>
                <button onClick={()=>deleteNote(entry.id)} className="set-btn body-text text-xs px-2 py-1 rounded-lg" style={{ color:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.08)" }}>x</button>
              </div>
              <div className="body-text text-white/70 text-sm leading-relaxed">{entry.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── YOGA DATA ──
const YOGA_MORNING = {
  title:"MORNING WAKE-UP", duration:"5 min", color:"#ffd166",
  subtitle:"Before your phone. Every single day.",
  note:"You will feel stiff — that's normal. Don't force anything. Breathe slowly and let gravity do the work.",
  poses:[
    { name:"Child's Pose", dur:"45 sec", hold:45, cue:"Kneel, sit back on heels, reach arms forward. Forehead down. Breathe into your lower back.", benefit:"Decompresses spine. Counteracts sleep stiffness.", prog:"Walk hands further forward each week." },
    { name:"Cat-Cow Flow", dur:"45 sec slow", hold:45, cue:"Hands and knees. Inhale — drop belly, lift head. Exhale — round spine to ceiling, tuck chin. Slow and deliberate.", benefit:"Mobilizes every vertebra. Wakes up spine without loading it.", prog:"Add a side bend at each end over time." },
    { name:"Low Lunge (each side)", dur:"30 sec each", hold:30, cue:"Step one foot forward, back knee on floor. Sink hips straight down. Front shin vertical. Don't arch lower back.", benefit:"Hip flexor opener — #1 fix for your umpiring back pain.", prog:"Raise arms overhead once comfortable." },
    { name:"Seated Forward Fold", dur:"60 sec", hold:60, cue:"Legs straight. Hinge from hips NOT your back. Reach toward feet. Hold wherever you land. Release on every exhale. No bouncing.", benefit:"Main driver of touching your toes. Pure hamstring length.", prog:"Track weekly — you should reach slightly further each time." },
    { name:"Supine Spinal Twist (each side)", dur:"30 sec each", hold:30, cue:"Lie on back. Pull one knee to chest, let it fall across body. Opposite arm out flat. Look away from the knee.", benefit:"Releases lower back rotation tightness from umpiring.", prog:"Stack both knees for deeper version." },
  ]
};
const YOGA_EVENING = {
  title:"EVENING WIND-DOWN", duration:"12 min", color:"#c47bff",
  subtitle:"30 min before bed. Replaces scrolling.",
  note:"This is your nervous system OFF switch. Every pose should feel like a release not a fight. Combine with your magnesium glycinate.",
  poses:[
    { name:"Jefferson Curl", dur:"60 sec slow", hold:60, important:true, cue:"Stand holding 10-15 lb plate. Slowly curl spine DOWN starting from head — chin to chest, upper back, then lower back. Reach toward floor. Hold 3 sec. Slowly reverse vertebra by vertebra.", benefit:"THE most powerful lower back mobility exercise. Decompresses every disc. Will change your back in 4 weeks.", prog:"Add 2.5 lb over weeks. Look it up on YouTube first — form matters." },
    { name:"Pigeon Pose (each side)", dur:"90 sec each", hold:90, cue:"From downdog, bring one knee forward behind wrist. Extend back leg. Lower hips toward floor. Walk hands forward, rest forearms down. Breathe.", benefit:"Deep hip opener. Most effective for squat depth and umpiring hip tightness.", prog:"Work toward full hip contact with floor." },
    { name:"Standing Hamstring Stretch (each leg)", dur:"60 sec each", hold:60, cue:"Heel on a surface (chair, bench). Leg straight. Hinge forward from hips with flat back. Hold. Breathe out into the stretch. No bouncing.", benefit:"Specific hamstring length — directly builds toward touching toes.", prog:"Raise surface height as flexibility improves." },
    { name:"Lizard Pose (each side)", dur:"60 sec each", hold:60, cue:"Step foot outside same-side hand in a lunge. Both hands inside front foot. Back knee down. Sink hips. Lower forearms for deeper version.", benefit:"Opens hip flexors AND inner groin. Huge for squat depth.", prog:"Forearms to floor when ready, then foot further forward." },
    { name:"Wide-Leg Forward Fold", dur:"90 sec", hold:90, cue:"Sit with legs in a wide V. Walk hands forward between legs. Hinge from hips. Let gravity pull you. Breathe and sink — don't force.", benefit:"Inner thigh + hamstring. Foundation for front splits.", prog:"Track how close your chest gets to floor each week." },
    { name:"Legs Up The Wall", dur:"2 min", hold:120, cue:"Lie on back, scoot close to wall, legs straight up. Arms relaxed. Breathe. Close your eyes.", benefit:"Passive hamstring stretch. Drains lactic acid. Calms nervous system for sleep.", prog:"Build toward 3-5 min over weeks." },
    { name:"Supine Spinal Twist (each side)", dur:"45 sec each", hold:45, cue:"Lie on back. Hug both knees to chest, let them fall to one side. Arms out. Look opposite direction. Breathe into lower back.", benefit:"Final lower back release. Sets spine neutral for sleep.", prog:"Add neck rotation in same direction as knees." },
  ]
};
const YOGA_MILESTONES = [
  { goal:"Touch toes", timeline:"6-8 weeks", note:"Daily forward fold + Jefferson curl." },
  { goal:"Back pain reduces", timeline:"3-4 weeks", note:"Jefferson curl + low lunge targeting hip flexors." },
  { goal:"Squat depth improves noticeably", timeline:"4-6 weeks", note:"Pigeon + lizard pose are the key drivers." },
  { goal:"Front splits prep", timeline:"4-6 months", note:"Lizard + pigeon + wide fold consistently." },
  { goal:"Full front splits", timeline:"8-12 months", note:"Achievable with daily evening routine." },
];

function YogaSession({ session }) {
  const [open, setOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [done, setDone] = useState({});
  useEffect(() => {
    if (activeTimer === null || timeLeft <= 0) { if (timeLeft <= 0 && activeTimer !== null) setActiveTimer(null); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [activeTimer, timeLeft]);
  const startTimer = (idx, secs) => { setActiveTimer(idx); setTimeLeft(secs); };
  const toggleDone = (idx) => { setDone(d => ({ ...d, [idx]: !d[idx] })); setActiveTimer(null); };
  const allDone = session.poses.every((_, i) => done[i]);
  return (
    <div className="mb-4 rounded-2xl overflow-hidden" style={{ border:`1px solid ${session.color}35` }}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 flex justify-between items-center set-btn" style={{ background:"#111" }}>
        <div className="text-left">
          <div className="text-2xl tracking-wide" style={{ color:session.color }}>{session.title}</div>
          <div className="body-text text-white/40 text-xs">{session.duration} · {session.subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          {allDone && <span className="body-text text-xs px-2 py-1 rounded-full" style={{ background:"#4ade8020",color:"#4ade80" }}>Done ✓</span>}
          <span className="body-text text-white/30">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3" style={{ background:"#0a0a0a",borderTop:`1px solid ${session.color}15` }}>
          <p className="body-text text-white/40 text-xs leading-relaxed mb-4">{session.note}</p>
          <div className="space-y-4">
            {session.poses.map((pose, idx) => {
              const isDone = done[idx];
              const timing = activeTimer === idx;
              return (
                <div key={idx} className="p-4 rounded-xl" style={{ background:isDone?`${session.color}0d`:"#111",border:`1px solid ${isDone?session.color+"40":"#222"}` }}>
                  {pose.important && <span className="body-text text-xs px-2 py-0.5 rounded-full inline-block mb-2" style={{ background:"#ff6b3520",color:"#ff6b35" }}>⚡ KEY FOR BACK PAIN</span>}
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-lg tracking-wide" style={{ color:isDone?session.color:"white" }}>{pose.name}</div>
                    <span className="body-text text-xs shrink-0 ml-2" style={{ color:session.color }}>{pose.dur}</span>
                  </div>
                  <p className="body-text text-white/60 text-xs leading-relaxed mb-1">{pose.cue}</p>
                  <p className="body-text text-white/30 text-xs mb-1">Benefit: {pose.benefit}</p>
                  <p className="body-text text-white/20 text-xs mb-3">Progress: {pose.prog}</p>
                  {timing ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl tracking-wide" style={{ color:session.color,fontFamily:"'Bebas Neue',sans-serif" }}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}</span>
                      <button onClick={() => toggleDone(idx)} className="set-btn body-text text-xs px-3 py-1.5 rounded-lg" style={{ background:"#4ade8020",color:"#4ade80",border:"1px solid #4ade8040" }}>Done ✓</button>
                      <button onClick={() => setActiveTimer(null)} className="set-btn body-text text-xs px-3 py-1.5 rounded-lg text-white/20 border border-white/10">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startTimer(idx, pose.hold)} className="set-btn body-text text-xs px-3 py-1.5 rounded-lg" style={{ background:`${session.color}20`,color:session.color,border:`1px solid ${session.color}40` }}>▶ Start Timer</button>
                      <button onClick={() => toggleDone(idx)} className="set-btn body-text text-xs px-3 py-1.5 rounded-lg" style={{ background:isDone?"#4ade8020":"rgba(255,255,255,0.05)",color:isDone?"#4ade80":"rgba(255,255,255,0.3)",border:`1px solid ${isDone?"#4ade8040":"rgba(255,255,255,0.1)"}` }}>
                        {isDone ? "✓ Done" : "Skip"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [activeTab,setActiveTab]=useState(()=>sessionStorage.getItem("tab")||"home");
  const [activeDay,setActiveDay]=useState(()=>parseInt(sessionStorage.getItem("day")||"0"));
  const [completedSets,setCompletedSets]=useState(()=>{ try{return JSON.parse(sessionStorage.getItem("completedSets")||"{}");}catch{return {};} });
  const [days,setDays]=useState(DEFAULT_DAYS);
  const [bagFilter,setBagFilter]=useState("essential");
  const [gymBagData,setGymBagData]=useState(()=>ls("gym_bag_custom",gymBag));
  const [bagAddItem,setBagAddItem]=useState("");
  const [bagAddNote,setBagAddNote]=useState("");
  const [showBagAdd,setShowBagAdd]=useState(false);
  const saveGymBag=b=>{ setGymBagData(b); lsSet("gym_bag_custom",b); };
  const addBagItem=()=>{
    if(!bagAddItem.trim()) return;
    const updated={...gymBagData,[bagFilter]:[...gymBagData[bagFilter],{item:bagAddItem.trim(),note:bagAddNote.trim()}]};
    saveGymBag(updated); setBagAddItem(""); setBagAddNote(""); setShowBagAdd(false);
  };
  const removeBagItem=(cat,idx)=>{ const updated={...gymBagData,[cat]:gymBagData[cat].filter((_,i)=>i!==idx)}; saveGymBag(updated); };
  const [prData,setPrData]=useState(()=>ls("pr_data",{}));
  const [prInput,setPrInput]=useState({});
  const [repInput,setRepInput]=useState({});
  const [activePrLift,setActivePrLift]=useState("bench");
  const [setLog,setSetLog]=useState(()=>ls("set_log",[]));
  const [timer,setTimer]=useState(null);
  const [logModal,setLogModal]=useState(null);
  const [showRename,setShowRename]=useState(false);
  const [logFilter,setLogFilter]=useState("all");
  const [bodyweight,setBodyweight]=useState(()=>localStorage.getItem("bodyweight")||"154.8");
  const [proteinEntries,setProteinEntries]=useState(()=>ls("protein_entries",{}));
  const [prToast,setPrToast]=useState(null);
  const [deloadDismissed,setDeloadDismissed]=useState(()=>localStorage.getItem("deload_dismissed")||"");
  const quoteIdx=useRef(Math.floor(Math.random()*QUOTES.length)).current;

  useEffect(()=>{ sessionStorage.setItem("tab",activeTab); },[activeTab]);
  useEffect(()=>{ sessionStorage.setItem("day",String(activeDay)); },[activeDay]);
  useEffect(()=>{ sessionStorage.setItem("completedSets",JSON.stringify(completedSets)); },[completedSets]);
  useEffect(()=>{
    const iv=setInterval(()=>{ const pe=ls("protein_entries",null); if(pe) setProteinEntries(pe); },3000);
    return ()=>clearInterval(iv);
  },[]);

  const saveLog=u=>{ setSetLog(u); lsSet("set_log",u); };
  const savePrStore=u=>{ setPrData(u); lsSet("pr_data",u); };
  const savePR=liftKey=>{
    const w=parseFloat(prInput[liftKey]),r=parseInt(repInput[liftKey])||1;
    if(!w||w<=0) return;
    savePrStore({ ...prData,[liftKey]:[...(prData[liftKey]||[]),{weight:w,reps:r,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}] });
    setPrInput(p=>({...p,[liftKey]:""})); setRepInput(p=>({...p,[liftKey]:""}));
  };
  const deletePR=(liftKey,idx)=>{ const e=prData[liftKey]||[]; savePrStore({...prData,[liftKey]:e.filter((_,i)=>i!==idx)}); };
  const getMax=k=>{ const e=prData[k]||[]; return e.length?e.reduce((b,x)=>x.weight>b.weight?x:b,e[0]):null; };

  const startTimer=category=>{
    const d=days[activeDay], isC=COMPOUND_CATS.includes(category);
    if(d.isRecovery) return;
    setTimer({duration:isC?d.timing.compound_rest:d.timing.accessory_rest,label:isC?"COMPOUND":"ACCESSORY",color:d.color,key:Date.now()});
  };

  const handleSetPress=(exIdx,setIdx,exName,category)=>{
    const key=`${activeDay}-${exIdx}-${setIdx}`;
    if(completedSets[key]){ setCompletedSets(prev=>{ const n={...prev}; delete n[key]; return n; }); return; }
    setLogModal({exIdx,setIdx,exName,category,key});
  };

  const handleLogSave=(weight,reps)=>{
    if(!logModal) return;
    const {key,exName,category}=logModal;
    if(weight||reps){
      const est1rm=estimate1RM(weight,reps);
      const entry={id:Date.now(),timestamp:Date.now(),weight,reps,exName,dayName:days[activeDay].name.split("-")[0].trim(),dayColor:days[activeDay].color,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),time:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}),est1rm};
      const updated=[entry,...setLog];
      const prevBest=setLog.filter(e=>e.exName===exName).reduce((b,e)=>(e.est1rm||0)>(b.est1rm||0)?e:b,{est1rm:0});
      if(est1rm&&est1rm>(prevBest.est1rm||0)&&prevBest.est1rm>0){
        setPrToast({message:`${exName}: est. 1RM ${est1rm} lb`,color:days[activeDay].color});
      }
      saveLog(updated);
    }
    setCompletedSets(prev=>({...prev,[key]:true}));
    setLogModal(null);
    startTimer(category);
  };

  const handleLogSkip=()=>{
    if(!logModal) return;
    setCompletedSets(prev=>({...prev,[logModal.key]:true}));
    setLogModal(null);
    startTimer(logModal.category);
  };

  const handleRename=(dayIdx,exIdx,newName)=>{
    setDays(days.map((d,di)=>di!==dayIdx?d:{...d,exercises:d.exercises.map((ex,ei)=>ei!==exIdx?ex:{...ex,name:newName})}));
    setShowRename(false);
  };

  const handleBwChange=val=>{ setBodyweight(val); try{localStorage.setItem("bodyweight",val);}catch(e){} };
  const latestScanAge = (() => { try { const s = ls("body_scans",[]); return s.length && s[0].age ? s[0].age : null; } catch { return null; } })();
  const resetSets=()=>{ setCompletedSets({}); sessionStorage.removeItem("completedSets"); };
  const deleteLogEntry=id=>saveLog(setLog.filter(e=>e.id!==id));
  const parseSetCount=s=>{ const m=s.match(/^(\d+)/); return m?parseInt(m[1]):3; };
  const fmtSecs=s=>s===0?"—":`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  const bench=getMax("bench"),squat=getMax("squat"),deadlift=getMax("deadlift");
  const total=(bench?.weight||0)+(squat?.weight||0)+(deadlift?.weight||0);
  const bw=parseFloat(bodyweight)||154.8;
  const dots=total>0?dotsScore(bw,total):0;
  const dotsRat=dotsRating(dots);
  const proteinStreak=calcProteinStreak(proteinEntries);

  const sessionDays=new Set(setLog.filter(e=>e.timestamp&&Date.now()-e.timestamp<28*24*3600*1000).map(e=>new Date(e.timestamp).toISOString().split("T")[0]));
  const thisMonth=new Date().toISOString().slice(0,7);
  const showDeload=sessionDays.size>=16&&deloadDismissed!==thisMonth;

  const day=days[activeDay];
  const warmup=WARMUPS[day.warmupKey || day.id] || WARMUPS.A;

  const tabs=["home","program","protein","volume","notes","scan","logs","prs","nutrition","bag","yoga"];
  const tabLabels={home:"Home",program:"Program",protein:"Protein",volume:"Volume",notes:"Notes",scan:"Body Scan",logs:"Logs",prs:"PRs",nutrition:"Food",bag:"Bag",yoga:"Yoga"};

  return (
    <div style={{ fontFamily:"'Bebas Neue','Arial Narrow',sans-serif" }} className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        body{margin:0;background:black}
        .body-text{font-family:'DM Sans',sans-serif}
        .set-btn{transition:all 0.15s ease}
        .set-btn:active{transform:scale(0.92)}
        .tab-pill{transition:all 0.2s ease}
        input[type=number],input[type=text],textarea{background:#1a1a1a;border:1px solid #333;color:white;border-radius:8px;padding:8px 12px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;box-sizing:border-box}
        input:focus,textarea:focus{outline:none;border-color:#555}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
      `}</style>

      {timer&&<InlineTimer key={timer.key} duration={timer.duration} color={timer.color} label={timer.label} onDismiss={()=>setTimer(null)}/>}
      {logModal&&<SetLogModal exName={logModal.exName} color={day.color} onSave={handleLogSave} onSkip={handleLogSkip}/>}
      {showRename&&<RenameModal days={days} onSave={handleRename} onClose={()=>setShowRename(false)}/>}
      {prToast&&<PRToast message={prToast.message} color={prToast.color} onDone={()=>setPrToast(null)}/>}

      {/* Header */}
      <div className="px-4 pt-5 pb-3" style={{ background:"linear-gradient(180deg,#111 0%,#000 100%)" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-4xl leading-none tracking-wide" style={{ color:"#e8ff47" }}>1000LB CLUB</h1>
            <div className="body-text text-white/40 text-xs mt-1">{latestScanAge?`Age ${latestScanAge}`:"17yo"} — {bw}lb — Summer 2026</div>
          </div>
          <div className="text-right">
            <div className="body-text text-white/30 text-xs">Club total</div>
            <div className="text-2xl tracking-wide" style={{ color:total>=1000?"#4ade80":"#e8ff47" }}>{total>0?`${total} lb`:"--"}</div>
            <div className="body-text text-white/30 text-xs">{total>=1000?"MEMBER 🏆":total>0?`${1000-total} to go`:"Log PRs to track"}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[{key:"bench",label:"BENCH",color:"#e8ff47"},{key:"squat",label:"SQUAT",color:"#ff6b35"},{key:"deadlift",label:"DEAD",color:"#47c8ff"}].map(lift=>{
            const best=getMax(lift.key);
            return (
              <div key={lift.key} className="p-2 rounded-xl text-center" style={{ background:"#111",border:`1px solid ${lift.color}25` }}>
                <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>{lift.label}</div>
                <div className="text-xl tracking-wide" style={{ color:best?lift.color:"rgba(255,255,255,0.15)" }}>{best?`${best.weight}`:"--"}</div>
                <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.2)" }}>{best?"lb":"not logged"}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl" style={{ background:"#111",border:`1px solid ${dotsRat.color}25` }}>
            <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>DOTS SCORE</div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl tracking-wide" style={{ color:dots>0?dotsRat.color:"rgba(255,255,255,0.15)" }}>{dots>0?dots:"--"}</div>
              {dots>0&&<div className="body-text text-xs" style={{ color:dotsRat.color }}>{dotsRat.label}</div>}
            </div>
          </div>
          <div className="p-2 rounded-xl" style={{ background:"#111",border:"1px solid #47c8ff25" }}>
            <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.35)" }}>PROTEIN STREAK</div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl tracking-wide" style={{ color:proteinStreak>0?"#47c8ff":"rgba(255,255,255,0.15)" }}>{proteinStreak>0?proteinStreak:"--"}</div>
              {proteinStreak>0&&<div className="body-text text-xs text-white/40">days</div>}
            </div>
          </div>
        </div>
      </div>

      {showDeload&&(
        <div className="mx-4 mt-3 p-3 rounded-xl flex items-center justify-between" style={{ background:"#c47bff15",border:"1px solid #c47bff40" }}>
          <div>
            <div className="body-text text-sm font-semibold" style={{ color:"#c47bff" }}>Deload Week Suggested</div>
            <div className="body-text text-xs text-white/40">{sessionDays.size}+ days this month. Reduce weight 40%, keep form perfect.</div>
          </div>
          <button onClick={()=>{ setDeloadDismissed(thisMonth); try{localStorage.setItem("deload_dismissed",thisMonth);}catch(e){} }}
            className="set-btn body-text text-xs px-2 py-1 rounded-lg ml-2 flex-shrink-0" style={{ color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.1)" }}>Got it</button>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
        {tabs.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`tab-pill body-text text-xs px-3 py-1.5 rounded-full font-medium uppercase tracking-wider whitespace-nowrap ${activeTab===tab?"bg-white text-black":"text-white/40 border border-white/10"}`}
            style={activeTab===tab&&tab==="protein"?{background:"#47c8ff",color:"#000"}:{}}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* HOME TAB */}
      {activeTab==="home"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:"1px solid #e8ff4730" }}>
            <div className="body-text text-white text-sm leading-relaxed italic mb-1">"{QUOTES[quoteIdx].text}"</div>
            <div className="body-text text-white/30 text-xs">{QUOTES[quoteIdx].context}</div>
          </div>
          {(()=>{ const notes=ls("session_notes",[]); const latest=notes[0]; if(!latest) return null;
            const ratingDisplay={1:"💀",2:"😤",3:"💪",4:"🔥",5:"⚡"};
            const ratingLabel={1:"Rough",2:"Okay",3:"Solid",4:"Great",5:"PB Day"};
            return (
              <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:`1px solid ${latest.dayColor}30` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize:20 }}>{ratingDisplay[latest.rating]}</span>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:latest.dayColor }}>{latest.dayName}</span>
                    <span className="body-text text-xs" style={{ color:latest.dayColor }}>{ratingLabel[latest.rating]}</span>
                  </div>
                  <div className="body-text text-xs text-white/30">{latest.date}</div>
                </div>
                <div className="body-text text-white/60 text-xs leading-relaxed" style={{ display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{latest.note}</div>
              </div>
            );
          })()}
          <div className="text-xl tracking-wide mb-3">THIS WEEK</div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {WEEK_SCHEDULE.filter(s=>s.type!=="rest").map((s,i)=>(
              <div key={i} className="p-3 rounded-xl" style={{ background:"#111",border:`1px solid ${s.color}30` }}>
                <div className="body-text text-white/40 text-xs">{s.day} — {s.work}</div>
                <div className="text-lg tracking-wide mt-1" style={{ color:s.color }}>{s.label}</div>
                {s.type!=="rest"&&s.dayIdx!==undefined&&(
                  <button onClick={()=>{ setActiveDay(s.dayIdx); setActiveTab("program"); }} className="set-btn body-text text-xs mt-2 px-3 py-1 rounded-full" style={{ background:s.color+"20",color:s.color,border:`1px solid ${s.color}40` }}>Open</button>
                )}
              </div>
            ))}
          </div>
          <div className="text-xl tracking-wide mb-3">RECENT SETS</div>
          {setLog.length===0?<div className="body-text text-white/20 text-sm text-center py-6">No sets logged yet. Hit the gym!</div>:(
            <div className="space-y-2">
              {setLog.slice(0,5).map((e,i)=>(
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background:"#111",border:"1px solid #222" }}>
                  <div>
                    <div className="body-text text-white text-sm font-medium">{e.exName}</div>
                    <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{e.date} — {e.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg tracking-wide" style={{ color:e.dayColor }}>{e.weight?`${e.weight} lb`:"--"}</div>
                    {e.est1rm&&<div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>~{e.est1rm} 1RM</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROGRAM TAB */}
      {activeTab==="program"&&(
        <div>
          {/* Day selector */}
          <div className="px-4 mt-4">
            <div className="grid grid-cols-6 gap-1.5 mb-4">
              {days.map((d,i)=>(
                <button key={i} onClick={()=>setActiveDay(i)} className="set-btn py-2 rounded-xl text-center"
                  style={{ background:activeDay===i?d.color:"#111",border:`1px solid ${activeDay===i?d.color:"#222"}`,color:activeDay===i?"#000":"#555" }}>
                  <div className="text-lg" style={{ fontFamily:"'Bebas Neue',sans-serif",lineHeight:1 }}>{d.id}</div>
                  <div className="body-text" style={{ fontSize:9,fontWeight:500,lineHeight:1.2 }}>{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recovery day gets its own view */}
          {day.isRecovery ? (
            <RecoveryDayView day={day} />
          ) : (
            <>
              {/* Warmup */}
              <div className="mx-4 p-3 rounded-xl mb-4" style={{ background:`linear-gradient(135deg,${warmup.color}20,${warmup.color}08)`,border:`1px solid ${warmup.color}40` }}>
                <div className="text-sm tracking-widest mb-0.5" style={{ color:warmup.color }}>WARMUP — {warmup.label}</div>
                <div className="body-text text-white/30 text-xs mb-2">{warmup.note}</div>
                <div className="space-y-2">
                  {warmup.exercises.map((ex,i)=>(
                    <div key={i}>
                      <div className="flex justify-between">
                        <div className="body-text text-white text-xs font-medium">{ex.name}</div>
                        <div className="body-text text-white/40 text-xs">{ex.sets}</div>
                      </div>
                      <div className="body-text text-white/30 text-xs">{ex.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4">
                <div className="text-3xl tracking-wide" style={{ color:day.color }}>{day.name.split("-")[0].trim()}</div>
                <div className="body-text text-white/40 text-sm mb-3">{day.tag}</div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="body-text text-xs px-3 py-1.5 rounded-full" style={{ background:day.color+"20",color:day.color,border:`1px solid ${day.color}40` }}>{fmtSecs(day.timing.compound_rest)} compound</div>
                    <div className="body-text text-xs px-3 py-1.5 rounded-full" style={{ background:"#ffffff10",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.1)" }}>{fmtSecs(day.timing.accessory_rest)} acc</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowRename(true)} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background:"#ffffff10",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.15)" }}>Rename</button>
                    <button onClick={resetSets} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background:"#ff444420",color:"#ff4444",border:"1px solid #ff444440" }}>Reset</button>
                  </div>
                </div>
                <div className="body-text text-white/25 text-xs mb-4">Tap set → log weight and reps → rest timer starts</div>
                <div className="space-y-3 pb-24">
                  {day.exercises.map((ex,exIdx)=>{
                    const cat=categoryColors[ex.category];
                    const setCount=parseSetCount(ex.sets);
                    const isCompound=COMPOUND_CATS.includes(ex.category);
                    const exLogs=setLog.filter(e=>e.exName===ex.name);
                    const bestLog=exLogs.length?exLogs.reduce((b,x)=>(x.est1rm||0)>(b.est1rm||0)?x:b,exLogs[0]):null;
                    return (
                      <div key={exIdx} className={`rounded-2xl p-4 ${cat.bg}`} style={{ border:`1px solid ${ex.category==="ab"?"#4ade8030":ex.category==="neck"?"#a855f730":"rgba(255,255,255,0.07)"}` }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`body-text text-xs px-2 py-0.5 rounded-full font-semibold ${cat.badge}`}>{cat.label}</span>
                              {ex.altGroup&&<span className="body-text text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:ex.altGroup==="bicep"?"#47c8ff20":"#e8ff4720",color:ex.altGroup==="bicep"?"#47c8ff":"#e8ff47" }}>{ex.altGroup==="bicep"?"BICEP":"TRICEP"}</span>}
                              {ex.trackPR&&<span className="body-text text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:"#e8ff4720",color:"#e8ff47" }}>PR</span>}
                            </div>
                            <div className="text-xl tracking-wide" style={{ fontFamily:"'Bebas Neue',sans-serif" }}>{ex.name}</div>
                            {bestLog?.est1rm&&<div className="body-text text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.3)" }}>Best est. 1RM: <span style={{ color:day.color }}>{bestLog.est1rm} lb</span></div>}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg" style={{ color:day.color,fontFamily:"'Bebas Neue',sans-serif" }}>{ex.sets}</div>
                            <div className="body-text text-xs" style={{ color:isCompound?day.color+"99":"rgba(255,255,255,0.2)" }}>{fmtSecs(isCompound?day.timing.compound_rest:day.timing.accessory_rest)} rest</div>
                          </div>
                        </div>
                        <div className="body-text text-white/40 text-xs mb-1">{ex.weight}</div>
                        <div className="body-text text-white/55 text-xs leading-relaxed mb-3">{ex.note}</div>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from({length:setCount}).map((_,si)=>{
                            const k=`${activeDay}-${exIdx}-${si}`;
                            const done=completedSets[k];
                            return (
                              <button key={si} onClick={()=>handleSetPress(exIdx,si,ex.name,ex.category)}
                                className="set-btn body-text text-xs font-semibold px-3 py-1.5 rounded-lg"
                                style={{ background:done?day.color:"rgba(255,255,255,0.05)",color:done?"#000":"rgba(255,255,255,0.3)",border:`1px solid ${done?day.color:"rgba(255,255,255,0.1)"}` }}>
                                SET {si+1}{done?" ✓":""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab==="protein"&&<ProteinTab/>}
      {activeTab==="volume"&&<VolumeTab setLog={setLog}/>}
      {activeTab==="notes"&&<NotesTab days={days}/>}
      {activeTab==="scan"&&<BodyScanTab onBwChange={handleBwChange}/>}

      {/* LOGS TAB */}
      {activeTab==="logs"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="flex justify-between items-center mb-1">
            <div className="text-3xl tracking-wide">SET LOGS</div>
            {setLog.length>0&&<button onClick={()=>{ if(window.confirm("Clear all logs?")) saveLog([]); }} className="set-btn body-text text-xs px-3 py-1.5 rounded-full" style={{ background:"#ff444415",color:"#ff4444",border:"1px solid #ff444430" }}>Clear All</button>}
          </div>
          <div className="body-text text-white/40 text-sm mb-4">{setLog.length} sets logged total</div>
          {setLog.length===0?<div className="body-text text-white/20 text-sm text-center py-12">No sets logged yet.</div>:(()=>{
            const groups = {};
            setLog.forEach(entry=>{
              if(!groups[entry.exName]) groups[entry.exName]={ exName:entry.exName, dayColor:entry.dayColor, dayName:entry.dayName, entries:[] };
              groups[entry.exName].entries.push(entry);
            });
            const [expandedGroup, setExpandedGroup] = [logFilter, setLogFilter];
            return (
              <div className="space-y-2">
                {Object.values(groups).map(group=>{
                  const isOpen = expandedGroup === group.exName;
                  const best = group.entries.reduce((b,e)=>(e.est1rm||0)>(b.est1rm||0)?e:b, group.entries[0]);
                  return (
                    <div key={group.exName} className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${group.dayColor}25` }}>
                      <div className="p-3 flex items-center justify-between cursor-pointer" style={{ background:"#111" }}
                        onClick={()=>setLogFilter(isOpen?"all":group.exName)}>
                        <div style={{ flex:1 }}>
                          <div className="body-text text-white text-sm font-medium leading-tight">{group.exName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="body-text text-xs" style={{ color:group.dayColor+"cc" }}>{group.dayName}</div>
                            <div className="body-text text-xs text-white/30">{group.entries.length} set{group.entries.length!==1?"s":""}</div>
                            {best?.est1rm&&<div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>best ~{best.est1rm} 1RM</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:group.dayColor }}>{best?.weight?`${best.weight}`:"--"}</div>
                          <div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>{isOpen?"▲":"▼"}</div>
                        </div>
                      </div>
                      {isOpen&&(
                        <div className="px-3 pb-3" style={{ background:"#0d0d0d" }}>
                          {group.entries.map(entry=>(
                            <div key={entry.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                              <div>
                                <div className="body-text text-white/70 text-xs">{entry.date} — {entry.time}</div>
                                {entry.est1rm&&<div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.3)" }}>~{entry.est1rm} est 1RM</div>}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-lg tracking-wide" style={{ color:entry.dayColor }}>{entry.weight?`${entry.weight} lb`:"--"}</div>
                                  {entry.reps&&<div className="body-text text-xs text-white/30">x {entry.reps}</div>}
                                </div>
                                <button onClick={()=>deleteLogEntry(entry.id)} className="set-btn body-text text-xs px-2 py-1 rounded-lg" style={{ color:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.08)" }}>x</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* PRs TAB */}
      {activeTab==="prs"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-4">PR TRACKER</div>
          <div className="p-4 rounded-2xl mb-3" style={{ background:"#111",border:"1px solid #e8ff4730" }}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xl tracking-wide" style={{ color:"#e8ff47" }}>1000 LB CLUB</div>
              <div className="text-2xl tracking-wide" style={{ color:total>=1000?"#4ade80":"white" }}>{total} / 1000</div>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ background:"#222",height:6 }}>
              <div style={{ width:`${Math.min(100,(total/1000)*100)}%`,height:"100%",background:total>=1000?"#4ade80":"#e8ff47",borderRadius:9999,transition:"width 0.5s ease" }}/>
            </div>
            <div className="body-text text-white/30 text-xs mt-2">Bench + Squat + Deadlift combined</div>
          </div>
          {dots>0&&(
            <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:`1px solid ${dotsRat.color}30` }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="body-text text-white/40 text-xs mb-0.5">DOTS SCORE — {bw} lb bodyweight</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:dotsRat.color,lineHeight:1 }}>{dots}</div>
                </div>
                <div className="text-right">
                  <div className="body-text text-xs px-3 py-1 rounded-full" style={{ background:dotsRat.color+"20",color:dotsRat.color }}>{dotsRat.label}</div>
                  <div className="body-text text-white/30 text-xs mt-1">Total: {total} lb</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
            {PR_LIFTS.map(lift=>(
              <button key={lift.key} onClick={()=>setActivePrLift(lift.key)} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                style={{ background:activePrLift===lift.key?lift.color:"#111",color:activePrLift===lift.key?"#000":"#666",border:`1px solid ${activePrLift===lift.key?lift.color:"#333"}` }}>
                {lift.label}
              </button>
            ))}
          </div>
          {PR_LIFTS.filter(l=>l.key===activePrLift).map(lift=>{
            const entries=prData[lift.key]||[];
            const best=getMax(lift.key);
            const est=best?estimate1RM(best.weight,best.reps):null;
            return (
              <div key={lift.key}>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-2xl tracking-wide" style={{ color:lift.color }}>{lift.label.toUpperCase()}</div>
                  {best&&<div className="body-text text-sm text-white/50">Best: <span style={{ color:lift.color }}>{best.weight} lb x {best.reps}</span></div>}
                </div>
                {est&&best?.reps>1&&<div className="body-text text-xs text-white/40 mb-3">Est. 1RM: <span style={{ color:lift.color,fontFamily:"'Bebas Neue',sans-serif",fontSize:16 }}>{est} lb</span>{best.reps>5?" (capped at 5r)":""}</div>}
                <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:`1px solid ${lift.color}30` }}>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <div className="body-text text-white/30 text-xs mb-1">Weight (lb)</div>
                      <input type="number" placeholder="225" value={prInput[lift.key]||""} onChange={e=>setPrInput(p=>({...p,[lift.key]:e.target.value}))}/>
                    </div>
                    <div style={{ width:80 }}>
                      <div className="body-text text-white/30 text-xs mb-1">Reps</div>
                      <input type="number" placeholder="5" value={repInput[lift.key]||""} onChange={e=>setRepInput(p=>({...p,[lift.key]:e.target.value}))}/>
                    </div>
                  </div>
                  {prInput[lift.key]&&repInput[lift.key]&&(
                    <div className="body-text text-xs mb-2" style={{ color:lift.color }}>Est. 1RM: {estimate1RM(parseFloat(prInput[lift.key]),parseInt(repInput[lift.key]))} lb</div>
                  )}
                  <button onClick={()=>savePR(lift.key)} className="set-btn body-text text-sm font-semibold w-full py-2 rounded-xl" style={{ background:lift.color,color:"#000" }}>Save Entry</button>
                </div>
                {entries.length>0?(
                  <div className="space-y-2">
                    {[...entries].reverse().map((e,i)=>(
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background:"#111",border:"1px solid #222" }}>
                        <div>
                          <div className="text-xl tracking-wide" style={{ color:lift.color }}>{e.weight} lb</div>
                          <div className="body-text text-white/30 text-xs">{e.reps} rep{e.reps!==1?"s":""} — {e.date}</div>
                          {e.reps>1&&<div className="body-text text-xs" style={{ color:"rgba(255,255,255,0.2)" }}>~{estimate1RM(e.weight,e.reps)} est 1RM</div>}
                        </div>
                        <button onClick={()=>deletePR(lift.key,entries.length-1-i)} className="set-btn body-text text-xs px-2 py-1 rounded-lg text-white/20 border border-white/10">x</button>
                      </div>
                    ))}
                  </div>
                ):<div className="body-text text-white/20 text-sm text-center py-8">No entries yet.</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* NUTRITION TAB */}
      {activeTab==="nutrition"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-5">NUTRITION</div>
          <div className="space-y-3 mb-6">
            {nutrition.map((meal,i)=>(
              <div key={i} className="p-4 rounded-2xl" style={{ background:"#111",border:"1px solid #222" }}>
                <div className="text-xl tracking-wide" style={{ color:"#e8ff47" }}>{meal.time.toUpperCase()}</div>
                <div className="body-text text-white font-medium mt-1">{meal.meal}</div>
                <div className="body-text text-white/40 text-xs mt-1">{meal.note}</div>
              </div>
            ))}
          </div>
          <div className="text-2xl tracking-wide mb-3">SUPPLEMENTS</div>
          <div className="space-y-3">
            {supplements.map((s,i)=>(
              <div key={i} className="p-4 rounded-2xl" style={{ background:"#111",border:"1px solid #222" }}>
                <div className="flex justify-between">
                  <div className="text-lg tracking-wide">{s.name.toUpperCase()}</div>
                  <div className="body-text text-xs px-2 py-1 rounded-full" style={{ background:"#e8ff4720",color:"#e8ff47" }}>{s.dose}</div>
                </div>
                <div className="body-text text-white/40 text-xs mt-1">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BAG TAB */}
      {activeTab==="bag"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl tracking-wide">GYM BAG</div>
            <button onClick={()=>setShowBagAdd(!showBagAdd)} className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background:showBagAdd?"#333":"#e8ff4720",color:showBagAdd?"white":"#e8ff47",border:`1px solid ${showBagAdd?"#555":"#e8ff4740"}` }}>
              {showBagAdd?"Cancel":"+ Add Item"}
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            {["essential","useful","skip"].map(f=>(
              <button key={f} onClick={()=>setBagFilter(f)} className="set-btn body-text text-xs px-4 py-2 rounded-full font-medium uppercase"
                style={{ background:bagFilter===f?(f==="essential"?"#e8ff47":f==="useful"?"#47c8ff":"#ff6b35"):"#111",color:bagFilter===f?"#000":"#666",border:`1px solid ${bagFilter===f?"transparent":"#222"}` }}>{f}</button>
            ))}
          </div>
          {showBagAdd&&(
            <div className="p-4 rounded-2xl mb-4" style={{ background:"#111",border:"1px solid #e8ff4730" }}>
              <div className="text-lg tracking-wide mb-3" style={{ color:"#e8ff47" }}>ADD TO {bagFilter.toUpperCase()}</div>
              <div className="body-text text-white/30 text-xs mb-1">Item name</div>
              <input type="text" placeholder="e.g. Lifting shoes" value={bagAddItem} onChange={e=>setBagAddItem(e.target.value)}
                style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box",marginBottom:8 }}/>
              <div className="body-text text-white/30 text-xs mb-1">Note (optional)</div>
              <input type="text" placeholder="e.g. For heavy squat days" value={bagAddNote} onChange={e=>setBagAddNote(e.target.value)}
                style={{ background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:10,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:14,width:"100%",boxSizing:"border-box",marginBottom:12 }}/>
              <button onClick={addBagItem} className="set-btn body-text text-sm font-semibold w-full py-2.5 rounded-xl" style={{ background:"#e8ff47",color:"#000" }}>Add Item</button>
            </div>
          )}
          <div className="space-y-3">
            {gymBagData[bagFilter].map((item,i)=>(
              <div key={i} className="p-4 rounded-2xl flex items-start justify-between gap-2" style={{ background:"#111",border:`1px solid ${bagFilter==="essential"?"#e8ff4720":bagFilter==="useful"?"#47c8ff20":"#ff6b3520"}` }}>
                <div style={{ flex:1 }}>
                  <div className="text-lg tracking-wide" style={{ color:bagFilter==="essential"?"#e8ff47":bagFilter==="useful"?"#47c8ff":"#ff6b35" }}>{item.item.toUpperCase()}</div>
                  <div className="body-text text-white/50 text-xs mt-1">{item.note}</div>
                </div>
                <button onClick={()=>removeBagItem(bagFilter,i)} className="set-btn body-text text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ color:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.08)" }}>x</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YOGA TAB */}
      {activeTab==="yoga"&&(
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">YOGA</div>
          <div className="body-text text-white/40 text-sm mb-4">Daily flexibility. Back pain, toe touch, splits.</div>
          <div className="p-4 rounded-2xl mb-5" style={{ background:"#111",border:"1px solid #ffd16630" }}>
            <div className="text-lg tracking-wide mb-3" style={{ color:"#ffd166" }}>YOUR MILESTONES</div>
            <div className="space-y-3">
              {YOGA_MILESTONES.map((m,i)=>(
                <div key={i} className="flex justify-between items-start gap-3">
                  <div>
                    <div className="body-text text-white text-sm font-medium">{m.goal}</div>
                    <div className="body-text text-white/30 text-xs">{m.note}</div>
                  </div>
                  <div className="body-text text-xs px-2 py-1 rounded-full shrink-0 whitespace-nowrap" style={{ background:"#ffd16615",color:"#ffd166" }}>{m.timeline}</div>
                </div>
              ))}
            </div>
          </div>
          <YogaSession session={YOGA_MORNING}/>
          <YogaSession session={YOGA_EVENING}/>
        </div>
      )}
    </div>
  );
}
