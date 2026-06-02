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

//  Local date key (fixes UTC midnight bug) 
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

//  DOTS Score (male) 
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

//  Protein streak (uses local date, not UTC) 
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
      // today not yet hit - skip without breaking
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

//  Day-specific warm-ups 
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
      { name: "Empty Bar Incline Press", sets: "2 x 10", note: "Groove the incline angle before loading." },
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
    label: "CARDIO WARM-UP", note: "Get moving - 3 min", color: "#4ade80",
    exercises: [
      { name: "Brisk Walk", sets: "2 min", note: "Transition from rest to movement. Let heart rate climb naturally." },
      { name: "Leg Swing (front/back)", sets: "1 x 10 each leg", note: "Open up the hip flexors before running." },
      { name: "Ankle Circle", sets: "1 x 10 each", note: "Quick mobility before hitting the pavement." },
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
  "Barbell or Dumbbell Shrug": ["Traps"],
  "Calf Raise": ["Calves"],
  "Weighted Decline Crunch": ["Core"],
  "Plank (Controlled)": ["Core"],
  "Weighted Dips": ["Triceps","Chest","Front Delt"],
  "Skull Crusher": ["Triceps"],
  "Overhead Tricep Extension": ["Triceps"],
  "Seated Dumbbell Press": ["Front Delt","Triceps","Side Delt"],
  "Tricep Pushdown (Cable)": ["Triceps"],
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

const DEFAULT_DAYS = [
  {
    id:"A", label:"DAY 1", name:"UPPER A - Strength Focus", tag:"Heavy Push + Pull | ~60 min", color:"#e8ff47",
    timing:{ total:"55-65 min", compound_rest:180, accessory_rest:90 },
    exercises:[
      { name:"Barbell Bench Press", sets:"4 x 4-6", weight:"Start at 185 lb, add 5 lb/week", note:"Main strength driver. Full ROM, touch chest.", category:"main", trackPR:true },
      { name:"Barbell Row (Pendlay or Bent Over)", sets:"4 x 5", weight:"Match bench weight roughly", note:"Back needs to keep up with push strength.", category:"main", trackPR:true },
      { name:"Seated Dumbbell Press", sets:"3 x 8-10", weight:"Start at 2x25-30 lb. Natural wrist path.", note:"Replaces Smith machine OHP. Builds real shoulder strength and stabilizers.", category:"secondary", trackPR:true },
      { name:"Weighted Pull-Ups or Lat Pulldown", sets:"3 x 6-8", weight:"Add weight when you can do 3x8 clean", note:"Width and upper back thickness.", category:"secondary" },
      { name:"Barbell Shrug", sets:"3 x 10-12", weight:"Start at 135-185 lb, add 10 lb/week", note:"Trap thickness. Hold peak contraction 1 sec.", category:"accessory" },
      { name:"Ab Wheel Rollout", sets:"3 x 8-10", weight:"Bodyweight", note:"Upper ab focus. Go to parallel, not floor at first.", category:"accessory" },
    ]
  },
  {
    id:"B", label:"DAY 2", name:"LOWER A - Squat Focus", tag:"Depth + Strength | ~60 min", color:"#ff6b35",
    timing:{ total:"55-65 min", compound_rest:210, accessory_rest:90 },
    exercises:[
      { name:"Barbell Back Squat", sets:"4 x 4-5", weight:"Start at 225 lb - earn depth before adding weight", note:"Film yourself from the side. Hit parallel every rep.", category:"main", trackPR:true },
      { name:"Romanian Deadlift (RDL)", sets:"3 x 8-10", weight:"Start at 135 lb", note:"Hamstring and glute builder. Fixes anterior pelvic tilt.", category:"main", trackPR:true },
      { name:"Leg Press", sets:"3 x 10-12", weight:"Moderate - feet high and wide", note:"Extra quad/glute volume without spinal load.", category:"secondary" },
      { name:"Leg Curl (Machine)", sets:"3 x 12", weight:"Moderate", note:"Hamstring balance. Prevents knee issues.", category:"secondary" },
      { name:"Cable Crunch", sets:"3 x 15", weight:"Moderate", note:"Upper ab focus. Round your spine at the top.", category:"accessory" },
      { name:"Dead Bug", sets:"3 x 8 each side", weight:"Bodyweight", note:"Reinforce bracing. Protects your lower back.", category:"accessory" },
    ]
  },
  {
    id:"C", label:"DAY 3", name:"UPPER B - Volume Focus", tag:"Hypertrophy + Chest | ~60 min", color:"#47c8ff",
    timing:{ total:"55-65 min", compound_rest:120, accessory_rest:75 },
    exercises:[
      { name:"Incline Barbell Press", sets:"4 x 8-10", weight:"~60-65% of flat bench", note:"Upper chest development.", category:"main", trackPR:true },
      { name:"Cable Row (Seated)", sets:"4 x 10-12", weight:"Moderate", note:"Mid back thickness. Pull elbows back hard.", category:"main" },
      { name:"Dumbbell Lateral Raise", sets:"3 x 15", weight:"Light - perfect form", note:"Shoulder width. Makes your waist look smaller.", category:"secondary" },
      { name:"Face Pull", sets:"3 x 15", weight:"Light", note:"Rear delt and rotator cuff health. Non-negotiable.", category:"secondary" },
      { name:"Skull Crusher", sets:"3 x 10-12", weight:"Start at 60-75 lb EZ bar", note:"Best direct tricep mass builder. Slow eccentric, flare elbows slightly.", category:"accessory" },
      { name:"Hanging Leg Raise", sets:"3 x 12-15", weight:"Bodyweight", note:"Lower ab tie-in + hip flexor strength.", category:"accessory" },
    ]
  },
  {
    id:"D", label:"DAY 4", name:"LOWER B - Deadlift Focus", tag:"Posterior Chain | ~60 min", color:"#c47bff",
    timing:{ total:"55-65 min", compound_rest:210, accessory_rest:90 },
    exercises:[
      { name:"Conventional Deadlift", sets:"4 x 4-5", weight:"Start at 225 lb - technique first", note:"Add 10 lb/week early on. Film your setup.", category:"main", trackPR:true },
      { name:"Front Squat or Paused Back Squat", sets:"3 x 5", weight:"Light - technique focus", note:"Front squat forces upright torso = teaches depth.", category:"main" },
      { name:"Bulgarian Split Squat", sets:"3 x 8 each leg", weight:"Dumbbells - start light", note:"Single leg work fixes imbalances.", category:"secondary" },
      { name:"Glute Bridge or Hip Thrust", sets:"3 x 12", weight:"Barbell when ready", note:"Direct glute work. Fixes anterior pelvic tilt.", category:"secondary" },
      { name:"Barbell or Dumbbell Shrug", sets:"3 x 12-15", weight:"Heavy - load these seriously", note:"Trap builder after deadlifts. Traps already fired up.", category:"accessory" },
      { name:"Calf Raise", sets:"3 x 15-20", weight:"Moderate", note:"Calves respond to high rep. Full ROM.", category:"accessory" },
    ]
  },
  {
    id:"E", label:"DAY 5", name:"ARMS + NECK - Isolation Day", tag:"Triceps, Biceps, Neck | ~50 min", color:"#ff9f47",
    timing:{ total:"45-55 min", compound_rest:90, accessory_rest:60 },
    exercises:[
      { name:"Weighted Dips", sets:"3 x 6-8", weight:"Bodyweight to start, add weight when 3x8 is clean", note:"Best compound tricep movement. Lean slightly forward for chest tie-in.", category:"main", trackPR:true },
      { name:"Tricep Pushdown (Cable)", sets:"3 x 12-15", weight:"Moderate", note:"Full lockout every rep. Elbows stay pinned to sides.", category:"secondary" },
      { name:"Overhead Tricep Extension", sets:"3 x 12", weight:"Light-moderate dumbbell", note:"Hits the long head. The part that makes arms look big from behind.", category:"accessory" },
      { name:"EZ Bar Curl", sets:"3 x 10-12", weight:"Focus on full stretch at bottom", note:"Bicep peak builder. Slow eccentric (3 sec down).", category:"accessory" },
      { name:"Incline Dumbbell Curl", sets:"2 x 12", weight:"Light - this is a stretch curl", note:"Hits the long head. This is what makes biceps POP.", category:"accessory" },
      { name:"Hammer Curl", sets:"3 x 10-12", weight:"Moderate", note:"Brachialis builder - pushes bicep up.", category:"accessory" },
      { name:"Neck Flexion / Extension (Plate)", sets:"3 x 15-20", weight:"5-10 lb plate", note:"Full ROM. Never go heavy.", category:"neck" },
      { name:"Neck Lateral Flexion", sets:"3 x 15 each side", weight:"5 lb plate or hand resistance", note:"Do all three neck movements every session on this day.", category:"neck" },
      { name:"Wrestlers Bridge Hold", sets:"3 x 20-30 sec", weight:"Bodyweight only", note:"Most powerful neck thickness builder. End every arms day with this.", category:"neck" },
    ]
  }  ,{
    id:"F", label:"DAY 6", name:"ZONE 2 RUN - Cardio", tag:"Aerobic Base | 20-40 min", color:"#4ade80",
    timing:{ total:"20-40 min", compound_rest:0, accessory_rest:0 },
    exercises:[
      { name:"Zone 2 Jog (Weeks 1-3)", sets:"20 min", weight:"Easy pace - walk if needed", note:"Build the habit first. Conversational pace the whole time.", category:"main" },
      { name:"Zone 2 Jog (Weeks 4-6)", sets:"25-30 min", weight:"Steady pace", note:"Continuous jog, same pace - just longer.", category:"secondary" },
      { name:"Zone 2 Jog (Weeks 7-9)", sets:"30-35 min", weight:"Steady pace", note:"One run per week can go slightly longer.", category:"secondary" },
      { name:"Zone 2 Jog (Weeks 10-12)", sets:"35-40 min", weight:"Steady pace", note:"Ready to keep up with XC friends.", category:"accessory" },
    ]
  }
];

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
const cardioWeeks = [
  { phase:"Weeks 1-3", duration:"20 min", type:"Easy Zone 2 jog", note:"Walk if needed. Build the habit first." },
  { phase:"Weeks 4-6", duration:"25-30 min", type:"Steady Zone 2", note:"Continuous jog, same pace - just longer." },
  { phase:"Weeks 7-9", duration:"30-35 min", type:"Steady Zone 2", note:"One run per week can go slightly longer." },
  { phase:"Weeks 10-12", duration:"35-40 min", type:"Zone 2 + optional progression", note:"Ready to keep up with XC friends." },
];
const sleepProtocol = [
  { time:"Summer goal", action:"11:30 pm bedtime to start", note:"Move 15 min earlier every week." },
  { time:"2 hrs before bed", action:"Dim all lights", note:"Melatonin is delayed with ADD. Light is the enemy." },
  { time:"90 min before bed", action:"Stop eating", note:"Digestion raises core temp." },
  { time:"60 min before bed", action:"Take magnesium glycinate", note:"300-400mg. Glycinate form only." },
  { time:"30 min before bed", action:"Kindle only - no screens", note:"ADD wind-down cue." },
  { time:"Caffeine rule", action:"Nothing after 2-3 pm", note:"Pushes your already-late sleep later." },
  { time:"Weekends", action:"Stay within 1 hr of weekday time", note:"Social jetlag makes Monday brutal." },
  { time:"Room temp", action:"65-68 F", note:"Core temp drop triggers sleep onset." },
];
const progressionRules = [
  "Add weight ONLY when you hit the top of the rep range for ALL sets",
  "Upper body: add 5 lb when ready",
  "Lower body: add 10 lb when ready",
  "Squat: earn depth before adding weight",
  "Log every session - sets, reps, weight, how it felt",
  "If you miss reps two sessions in a row, drop 10% and rebuild",
  "Neck trai