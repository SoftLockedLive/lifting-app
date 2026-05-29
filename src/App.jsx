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

const program = {
  meta: {
    name: "1000LB CLUB PROGRAM",
    subtitle: "Built for: 17yo | 155lb | Bench 225 | Squat 315+",
    split: "4-Day Upper/Lower Split",
    duration: "12 weeks",
  },
  mobilityRoutine: {
    exercises: [
      { name: "90/90 Hip Stretch", sets: "2 min each side", note: "Fix hip flexors from umpiring" },
      { name: "Deep Goblet Squat Hold", sets: "3 x 30 sec", note: "Teach your body squat depth safely" },
      { name: "Cat-Cow", sets: "10 reps slow", note: "Mobilize the lower back" },
      { name: "Dead Bug", sets: "3 x 8 each side", note: "Teach proper core bracing — fixes plank back pain" },
      { name: "Thoracic Spine Rotations", sets: "10 each side", note: "Counter umpire rotation tightness" },
    ]
  },
  bracingNote: "Before every heavy set — big breath into your belly (not chest), brace like you're about to get punched, THEN lift. Belt goes on top of this, not instead of it.",
  days: [
    {
      id: "A", label: "DAY 1", name: "UPPER A — Strength Focus", tag: "Heavy Push + Pull", color: "#e8ff47",
      timing: { total: "55–65 min", compound_rest: 180, accessory_rest: 90, note: "Heaviest day. Don't rush compound rest." },
      exercises: [
        { name: "Barbell Bench Press", sets: "4 x 4–6", weight: "Start at 185 lb, add 5 lb/week", note: "Main strength driver. Full ROM, touch chest.", category: "main", trackPR: true },
        { name: "Barbell Row (Pendlay or Bent Over)", sets: "4 x 5", weight: "Match bench weight roughly", note: "Back needs to keep up with push strength.", category: "main", trackPR: true },
        { name: "Overhead Press", sets: "3 x 6–8", weight: "Start light — build the shoulder base", note: "Shoulder health and upper chest tie-in.", category: "secondary", trackPR: true },
        { name: "Weighted Pull-Ups or Lat Pulldown", sets: "3 x 6–8", weight: "Add weight when you can do 3x8 clean", note: "Width and upper back thickness.", category: "secondary" },
        { name: "EZ Bar Curl", sets: "3 x 10–12", weight: "Focus on full stretch at bottom", note: "Bicep peak builder. Slow eccentric (3 sec down).", category: "accessory" },
        { name: "Incline Dumbbell Curl", sets: "2 x 12", weight: "Light — this is a stretch curl", note: "Hits the long head. This is what makes biceps POP.", category: "accessory" },
        { name: "Ab Wheel Rollout", sets: "3 x 8–10", weight: "Bodyweight", note: "Upper ab focus. Go to parallel, not floor at first.", category: "accessory" },
        { name: "Neck Flexion / Extension (Plate)", sets: "3 x 15–20", weight: "5–10 lb plate — start embarrassingly light", note: "Lie on bench. Plate on forehead for flexion, back of head for extension. Full ROM. Neck injury is serious — never go heavy.", category: "neck" },
        { name: "Neck Lateral Flexion", sets: "2 x 15 each side", weight: "5 lb plate or hand resistance", note: "Ear to shoulder movement. Thick neck makes traps and shoulders look massive even in a t-shirt.", category: "neck" },
      ]
    },
    {
      id: "B", label: "DAY 2", name: "LOWER A — Squat Focus", tag: "Depth + Strength", color: "#ff6b35",
      timing: { total: "60–70 min", compound_rest: 210, accessory_rest: 90, note: "Longest day. Big compounds need full rest." },
      exercises: [
        { name: "Goblet Squat (Depth Work)", sets: "3 x 8", weight: "40–50 lb dumbbell", note: "FIRST — find your depth here before touching barbell. Go as low as you comfortably can.", category: "mobility" },
        { name: "Barbell Back Squat", sets: "4 x 4–5", weight: "Start at 225 lb — earn depth before adding weight", note: "Film yourself from the side. Hit parallel minimum every rep. Add weight only when depth is consistent.", category: "main", trackPR: true },
        { name: "Romanian Deadlift (RDL)", sets: "3 x 8–10", weight: "Start at 135 lb", note: "Hamstring and glute builder. Also fixes anterior pelvic tilt = fixes back pain.", category: "main", trackPR: true },
        { name: "Leg Press", sets: "3 x 10–12", weight: "Moderate — feet high and wide", note: "Extra quad/glute volume without spinal load.", category: "secondary" },
        { name: "Leg Curl (Machine)", sets: "3 x 12", weight: "Moderate", note: "Hamstring balance. Prevents knee issues.", category: "secondary" },
        { name: "Cable Crunch", sets: "3 x 15", weight: "Moderate", note: "Upper ab focus. Round your spine at the top — this is what gets those top abs visible.", category: "accessory" },
        { name: "Dead Bug", sets: "3 x 8 each side", weight: "Bodyweight", note: "Reinforce bracing. Protects your lower back.", category: "accessory" },
      ]
    },
    {
      id: "C", label: "DAY 3", name: "UPPER B — Volume Focus", tag: "Hypertrophy + Arms", color: "#47c8ff",
      timing: { total: "55–65 min", compound_rest: 120, accessory_rest: 75, note: "Higher volume day. Shorter rests keep intensity up." },
      exercises: [
        { name: "Incline Barbell Press", sets: "4 x 8–10", weight: "~60–65% of flat bench", note: "Upper chest development. Changes your physique significantly.", category: "main", trackPR: true },
        { name: "Cable Row (Seated)", sets: "4 x 10–12", weight: "Moderate", note: "Mid back thickness. Pull elbows back hard.", category: "main" },
        { name: "Dumbbell Lateral Raise", sets: "3 x 15", weight: "Light — perfect form", note: "Shoulder width. Makes your waist look smaller.", category: "secondary" },
        { name: "Face Pull", sets: "3 x 15", weight: "Light", note: "Rear delt and rotator cuff health. Do these forever.", category: "secondary" },
        { name: "Hammer Curl", sets: "3 x 10–12", weight: "Moderate", note: "Brachialis builder — adds thickness and pushes bicep up.", category: "accessory" },
        { name: "Spider Curl or Preacher Curl", sets: "3 x 12", weight: "Light-moderate", note: "Isolates the bicep peak. Slow and controlled.", category: "accessory" },
        { name: "Hanging Leg Raise", sets: "3 x 12–15", weight: "Bodyweight", note: "Lower ab tie-in + hip flexor strength. Tuck pelvis at top.", category: "accessory" },
        { name: "Wrestler's Bridge Hold", sets: "3 x 20–30 sec", weight: "Bodyweight only — build up slowly", note: "Most powerful neck thickness builder. Start with very short holds. Progress carefully over weeks. Never force range.", category: "neck" },
        { name: "Neck Flexion / Extension (Plate)", sets: "2 x 15", weight: "5–10 lb plate", note: "Keep neck training consistent 3x/week. Results show in 6–8 weeks.", category: "neck" },
      ]
    },
    {
      id: "D", label: "DAY 4", name: "LOWER B — Deadlift Focus", tag: "Posterior Chain", color: "#c47bff",
      timing: { total: "55–65 min", compound_rest: 210, accessory_rest: 90, note: "Deadlift first while fresh. Everything else follows." },
      exercises: [
        { name: "Conventional Deadlift", sets: "4 x 4–5", weight: "Start at 225 lb — build the habit and technique first", note: "This lift will skyrocket fastest. Add 10 lb/week early on. Film your setup.", category: "main", trackPR: true },
        { name: "Front Squat or Paused Back Squat", sets: "3 x 5", weight: "Light — technique focus", note: "Front squat forces upright torso = teaches squat depth. Use paused back squat as alternative.", category: "main" },
        { name: "Bulgarian Split Squat", sets: "3 x 8 each leg", weight: "Dumbbells — start light", note: "Single leg work fixes imbalances and strengthens hips.", category: "secondary" },
        { name: "Glute Bridge or Hip Thrust", sets: "3 x 12", weight: "Barbell when ready", note: "Direct glute work. Fixes anterior pelvic tilt = back pain relief.", category: "secondary" },
        { name: "Calf Raise", sets: "3 x 15–20", weight: "Moderate", note: "Calves respond to high rep. Go full ROM.", category: "accessory" },
        { name: "Weighted Decline Crunch", sets: "3 x 12–15", weight: "10–25 lb plate", note: "Upper ab direct hit. Hold plate at chest.", category: "accessory" },
        { name: "Plank (Controlled)", sets: "3 x 45–60 sec", weight: "Bodyweight", note: "NOT to failure. Perfect brace, no lower back sag. Quality over duration.", category: "accessory" },
        { name: "Neck Lateral Flexion", sets: "3 x 15 each side", weight: "5 lb plate or hand resistance", note: "Third neck session of the week. Consistency is what builds neck size.", category: "neck" },
      ]
    }
  ],
  nutrition: [
    { time: "Morning", meal: "Protein shake or chocolate milk", note: "Liquid calories beat nausea on Azstarys. 30–40g protein." },
    { time: "Lunch", meal: "Rice + meat + anything calorie dense", note: "Make this your 2nd biggest meal. Don't skip it." },
    { time: "Pre-gym", meal: "Banana + peanut butter or granola bar", note: "30–45 min before training. Fast carbs = energy." },
    { time: "Post-gym dinner", meal: "Big protein + carb meal", note: "This is your main event. 50g+ protein. Rice, pasta, potatoes." },
  ],
  supplements: [
    { name: "Creatine Monohydrate", dose: "5g daily", note: "Already taking. Keep it up. Take it anytime, consistency matters." },
    { name: "Magnesium Glycinate", dose: "300–400mg before bed", note: "Helps ADD brain wind down. Improves sleep quality and recovery." },
    { name: "Protein Powder", dose: "1–2 scoops as needed", note: "Only if you're struggling to hit 130–155g protein from food." },
  ],
  gymBag: {
    essential: [
      { item: "Lifting belt", note: "You already use one. Keep it. Use it for heavy compounds only." },
      { item: "Chalk or liquid chalk", note: "Game changer for deadlifts and rows. Liquid chalk is less messy for commercial gyms." },
      { item: "Wrist wraps", note: "Bench and OHP. Keeps wrists neutral under heavy loads." },
      { item: "Water bottle (large)", note: "At least 32 oz. Dehydration kills strength and focus fast." },
      { item: "Creatine (pre-portioned)", note: "Small container or single-serve packets. Take it daily, gym or not." },
      { item: "Earbuds / headphones", note: "Non-negotiable. Music is your best legal stimulant." },
      { item: "Kindle Scribe", note: "Log every session. Sets, reps, weight. This is your most important tool." },
      { item: "Nike Waffles", note: "Lift in these, run in your Brooks Ghost. Swap at the gym." },
    ],
    useful: [
      { item: "Resistance bands", note: "Warm-up, mobility, face pulls, light accessory work. Light loop bands are fine." },
      { item: "Intra-workout carbs", note: "Gatorade, sports drink, or a banana in your bag. Clutch on leg day when you hit a wall." },
      { item: "Knee sleeves", note: "Not required but great on heavy squat days. Warmth helps. Not the same as knee wraps." },
      { item: "Extra shirt", note: "Practical. You will sweat." },
      { item: "Protein bar", note: "Emergency calories if you trained fasted. Not a habit, just insurance." },
    ],
    skip: [
      { item: "Lifting straps (for now)", note: "Build grip strength first. Straps too early stunts it." },
      { item: "Pre-workout every session", note: "Save it for hard days — daily use kills sensitivity fast. Max 3x/week." },
      { item: "Elbow sleeves", note: "Not needed at your training age unless you have joint pain." },
    ]
  },
  cardio: {
    philosophy: "Zone 2 on off days only. Conversational pace — if you can't hold a sentence you're going too hard. Two sessions a week builds the base without touching your lifting recovery.",
    weeks: [
      { phase: "Weeks 1–3", duration: "20 min", type: "Easy Zone 2 jog", target: "Conversational pace the whole time", note: "If you need to walk, walk. No shame. Build the habit first." },
      { phase: "Weeks 4–6", duration: "25–30 min", type: "Steady Zone 2", target: "Continuous jog, no walking needed", note: "Pace stays the same — just longer. Don't speed up." },
      { phase: "Weeks 7–9", duration: "30–35 min", type: "Steady Zone 2", target: "Starting to feel easy at this length", note: "One run per week can go slightly longer if feeling good." },
      { phase: "Weeks 10–12", duration: "35–40 min", type: "Zone 2 + optional progression", target: "Comfortable on 4–5 mile friend runs", note: "You're ready to keep up with XC friends on casual runs." },
    ],
    pacingTips: [
      { title: "The talk test", detail: "Zone 2 means you can speak full sentences without gasping. If you're too breathless to talk, slow down. Most beginners run Zone 3–4 thinking it's normal — it's why running feels awful. Slow down by more than you think." },
      { title: "Nose breathing check", detail: "A good Zone 2 cue: try breathing only through your nose. If you can maintain it, you're in Zone 2. The moment you have to open your mouth to breathe, you've pushed past it. Use this as a governor early on." },
      { title: "Heart rate target", detail: "If you have a smartwatch, Zone 2 is roughly 60–70% of max heart rate. At 17 your max is around 203 bpm, so Zone 2 is about 122–142 bpm. Below 120 is a walk, above 150 is too hard for recovery runs." },
      { title: "Start slower than you think", detail: "Your first mile should feel embarrassingly slow. Most people blow up in mile 1 and suffer through miles 2–3. If mile 1 feels easy, your pace is right. You'll naturally have more in the tank at the end." },
      { title: "Don't chase your XC friends' pace yet", detail: "XC runners have thousands of miles in their legs. Running their easy pace might be your Zone 4. Run your own pace alongside them — they'll respect the discipline more than they'd respect you suffering and quitting." },
      { title: "Cadence over stride", detail: "New runners overstride — big steps that land heel-first and brake you with every footfall. Aim for short, quick steps landing under your hips. Around 170–180 steps per minute. It feels choppy at first but is way more efficient and reduces knee stress." },
      { title: "Lift days vs run days", detail: "Never run the day before a heavy leg session. Your schedule has 4 lifting days — put cardio on the remaining days. If you only have 1 true off day in a week, one cardio session is fine. Don't force two." },
      { title: "Fueling for runs", detail: "For runs under 40 min you don't need to eat beforehand. Have water. For longer runs with friends, a banana 30 min before helps. Your Azstarys might suppress hunger on run days — drink something with carbs like Gatorade if you feel flat mid-run." },
      { title: "Soreness vs injury", detail: "General leg fatigue after runs is normal. Sharp knee pain, shin splints, or pain that gets worse as you run are not. Stop and rest if anything feels sharp. You're building a base — no run is worth an injury that sidelines your lifting." },
      { title: "Shoes", detail: "You have Brooks Ghosts — perfect. Run in those, lift in your Nike Waffles. Don't mix them up. Running in flat shoes wrecks your shins on any real distance." },
    ]
  },
  progressionRules: [
    "Add weight ONLY when you hit the top of the rep range for ALL sets",
    "Upper body: add 5 lb when ready",
    "Lower body: add 10 lb when ready",
    "Squat: earn depth before adding weight — depth first, always",
    "Log every session on your Kindle Scribe — sets, reps, weight, how it felt",
    "If you miss reps two sessions in a row, drop weight 10% and rebuild",
    "Neck training: never go heavy, progress slowly — injury there is serious",
    "Body scan monthly at the gym scale — first Saturday of each month, socks off, arms out",
  ],
  sleepProtocol: [
    { time: "Summer goal", action: "11:30 pm bedtime to start", note: "Build in 15 min earlier every week. Don't jump straight to 10:30." },
    { time: "2 hrs before bed", action: "Dim all lights", note: "Your melatonin is already delayed with ADD. Light is the enemy." },
    { time: "90 min before bed", action: "Stop eating", note: "Digestion raises core temp and keeps brain alert." },
    { time: "60 min before bed", action: "Take magnesium glycinate", note: "300–400mg. Glycinate form only — calms the nervous system." },
    { time: "30 min before bed", action: "Kindle only — no screens", note: "Read on your Scribe. This is your ADD wind-down cue AND log review time." },
    { time: "Caffeine rule", action: "Nothing after 2–3 pm", note: "Energy drinks/pre before that window. After 3pm it pushes your already-late sleep later." },
    { time: "Weekends", action: "Stay within 1 hr of weekday time", note: "Sleeping in 3+ hrs creates social jetlag — makes Monday harder for ADD brains." },
    { time: "Room temp", action: "65–68°F", note: "Core temp drop triggers sleep onset. Fan, AC, or open window." },
  ]
};

const categoryColors = {
  main: { bg: "bg-white/10", badge: "bg-white text-black", label: "MAIN" },
  secondary: { bg: "bg-white/5", badge: "bg-white/20 text-white", label: "SECONDARY" },
  accessory: { bg: "bg-white/5", badge: "bg-white/10 text-white/60", label: "ACCESSORY" },
  mobility: { bg: "bg-yellow-400/10", badge: "bg-yellow-400 text-black", label: "MOBILITY FIRST" },
  neck: { bg: "bg-purple-500/10", badge: "bg-purple-500 text-white", label: "NECK" },
};

const COMPOUND_CATS = ["main", "mobility"];

const PR_LIFTS = [
  { key: "bench", label: "Bench Press", color: "#e8ff47", unit: "lb" },
  { key: "squat", label: "Back Squat", color: "#ff6b35", unit: "lb" },
  { key: "deadlift", label: "Deadlift", color: "#47c8ff", unit: "lb" },
  { key: "ohp", label: "Overhead Press", color: "#c47bff", unit: "lb" },
  { key: "row", label: "Barbell Row", color: "#ff9f47", unit: "lb" },
];

const WEEK_SCHEDULE = [
  { day: "Mon", type: "lift", session: "A", label: "Upper A", color: "#e8ff47", work: "7:30–4:00" },
  { day: "Tue", type: "lift", session: "B", label: "Lower A", color: "#ff6b35", work: "7:30–4:00" },
  { day: "Wed", type: "lift", session: "C", label: "Upper B", color: "#47c8ff", work: "7:30–4:00" },
  { day: "Thu", type: "lift", session: "D", label: "Lower B", color: "#c47bff", work: "7:30–4:00" },
  { day: "Fri", type: "cardio", label: "Zone 2 Run", color: "#4ade80", work: "Off" },
  { day: "Sat", type: "cardio", label: "Zone 2 Run", color: "#4ade80", work: "Off", bodyScan: true },
  { day: "Sun", type: "rest", label: "Rest", color: "#444", work: "Off" },
];

// ── Rest Timer Component ──────────────────────────────────────────────────────
function RestTimer({ duration, color, label, onDone, onDismiss }) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          onDone?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [duration]);

  const pct = remaining / duration;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  // SVG ring
  const R = 54, C = 2 * Math.PI * R;
  const dash = pct * C;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)"
    }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>
        {label} REST
      </div>

      {/* Ring */}
      <div style={{ position: "relative", width: 160, height: 160, marginBottom: 32 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r={R} fill="none" stroke="#222" strokeWidth="8" />
          <circle cx="80" cy="80" r={R} fill="none" stroke={remaining === 0 ? "#4ade80" : color}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: remaining === 0 ? 28 : 52, color: remaining === 0 ? "#4ade80" : "white", lineHeight: 1 }}>
            {remaining === 0 ? "GO!" : timeStr}
          </div>
          {remaining > 0 && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>
              {Math.round(pct * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onDismiss} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          padding: "10px 24px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.15)",
          background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer"
        }}>
          Skip
        </button>
        {remaining > 0 && (
          <button onClick={onDone} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100, border: `1px solid ${color}`,
            background: color + "20", color, cursor: "pointer"
          }}>
            I'm Ready
          </button>
        )}
        {remaining === 0 && (
          <button onClick={onDismiss} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            padding: "10px 28px", borderRadius: 100, border: "none",
            background: "#4ade80", color: "#000", cursor: "pointer"
          }}>
            Let's Go →
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeDay, setActiveDay] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [bagFilter, setBagFilter] = useState("essential");
  const [prData, setPrData] = useState({});
  const [prInput, setPrInput] = useState({});
  const [repInput, setRepInput] = useState({});
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [storageReady, setStorageReady] = useState(false);
  const [activePrLift, setActivePrLift] = useState("bench");

  // Timer state
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerDuration, setTimerDuration] = useState(180);
  const [timerLabel, setTimerLabel] = useState("COMPOUND");
  const [timerKey, setTimerKey] = useState(0); // remount to restart
  const timerColor = program.days[activeDay]?.color || "#e8ff47";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pr_data");
      if (saved) setPrData(JSON.parse(saved));
    } catch (e) {}
    setStorageReady(true);
  }, []);

  const savePR = async (liftKey) => {
    const w = parseFloat(prInput[liftKey]);
    const r = parseInt(repInput[liftKey]) || 1;
    if (!w || w <= 0) return;
    const entry = { weight: w, reps: r, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    const updated = { ...prData, [liftKey]: [...(prData[liftKey] || []), entry] };
    setPrData(updated);
    setPrInput(p => ({ ...p, [liftKey]: "" }));
    setRepInput(p => ({ ...p, [liftKey]: "" }));
    try { localStorage.setItem("pr_data", JSON.stringify(updated)); } catch (e) {}
  };

  const deletePR = async (liftKey, idx) => {
    const updated = { ...prData, [liftKey]: prData[liftKey].filter((_, i) => i !== idx) };
    setPrData(updated);
    try { localStorage.setItem("pr_data", JSON.stringify(updated)); } catch (e) {}
  };

  const startRestTimer = (category) => {
    const day = program.days[activeDay];
    const isCompound = COMPOUND_CATS.includes(category);
    const dur = isCompound ? day.timing.compound_rest : day.timing.accessory_rest;
    const lbl = isCompound ? "COMPOUND" : "ACCESSORY";
    setTimerDuration(dur);
    setTimerLabel(lbl);
    setTimerKey(k => k + 1);
    setTimerVisible(true);
  };

  const toggleSet = (exIdx, setIdx, category) => {
    const key = `${activeDay}-${exIdx}-${setIdx}`;
    const wasCompleted = completedSets[key];
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
    if (!wasCompleted) {
      startRestTimer(category);
    }
  };

  const parseSetCount = (setsStr) => {
    const match = setsStr.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 3;
  };

  const day = program.days[activeDay];
  const tabs = ["home", "program", "prs", "planner", "nutrition", "cardio", "sleep", "bag", "rules"];
  const tabLabels = { home: "Home", program: "Program", prs: "PRs", planner: "Planner", nutrition: "Food", cardio: "Cardio", sleep: "Sleep", bag: "Bag", rules: "Rules" };

  const getMax = (liftKey) => {
    const entries = prData[liftKey] || [];
    if (!entries.length) return null;
    return entries.reduce((best, e) => e.weight > best.weight ? e : best, entries[0]);
  };

  const total1000 = () => {
    const b = getMax("bench");
    const s = getMax("squat");
    const d = getMax("deadlift");
    return (b ? b.weight : 225) + (s ? s.weight : 315) + (d ? d.weight : 225);
  };

  const fmtSecs = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif" }} className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { margin: 0; background: black; }
        .body-text { font-family: 'DM Sans', sans-serif; }
        .set-btn { transition: all 0.15s ease; }
        .set-btn:active { transform: scale(0.92); }
        .tab-pill { transition: all 0.2s ease; }
        input[type=number], input[type=text] { background: #1a1a1a; border: 1px solid #333; color: white; border-radius: 8px; padding: 8px 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; box-sizing: border-box; }
        input[type=number]:focus, input[type=text]:focus { outline: none; border-color: #555; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      {/* Rest Timer Overlay */}
      {timerVisible && (
        <RestTimer
          key={timerKey}
          duration={timerDuration}
          color={timerColor}
          label={timerLabel}
          onDone={() => setTimerVisible(false)}
          onDismiss={() => setTimerVisible(false)}
        />
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-3" style={{ background: "linear-gradient(180deg, #111 0%, #000 100%)" }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl leading-none tracking-wide" style={{ color: "#e8ff47" }}>1000LB CLUB</h1>
            <div className="body-text text-white/40 text-xs mt-1">{program.meta.subtitle}</div>
          </div>
          <div className="text-right">
            <div className="body-text text-white/30 text-xs">Current total</div>
            <div className="text-2xl tracking-wide" style={{ color: total1000() >= 1000 ? "#4ade80" : "#e8ff47" }}>{total1000()} lb</div>
            <div className="body-text text-white/30 text-xs">{total1000() >= 1000 ? "CLUB MEMBER 🏆" : `${1000 - total1000()} to go`}</div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`tab-pill body-text text-xs px-3 py-1.5 rounded-full font-medium uppercase tracking-wider whitespace-nowrap ${activeTab === tab ? "bg-white text-black" : "text-white/40 border border-white/10"}`}>
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* HOME TAB */}
      {activeTab === "home" && (
        <div className="px-4 pt-4 pb-24">
          <div className="p-4 rounded-2xl mb-4" style={{ background: "#111", border: "1px solid #e8ff4730" }}>
            <div className="body-text text-white text-sm leading-relaxed italic mb-1">"{QUOTES[quoteIdx].text}"</div>
            <div className="body-text text-white/30 text-xs">{QUOTES[quoteIdx].context}</div>
          </div>
          <div className="text-xl tracking-wide mb-3">TODAY'S PLAN</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {WEEK_SCHEDULE.slice(0, 4).map((s, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: "#111", border: `1px solid ${s.color}30` }}>
                <div className="body-text text-white/40 text-xs">{s.day} · {s.work}</div>
                <div className="text-lg tracking-wide mt-1" style={{ color: s.color }}>{s.label}</div>
                {s.type === "lift" && (
                  <button onClick={() => { setActiveDay(i); setActiveTab("program"); }}
                    className="set-btn body-text text-xs mt-2 px-3 py-1 rounded-full"
                    style={{ background: s.color + "20", color: s.color, border: `1px solid ${s.color}40` }}>
                    Open →
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="text-xl tracking-wide mb-3">PR SNAPSHOT</div>
          <div className="space-y-2 mb-5">
            {PR_LIFTS.slice(0, 3).map(lift => {
              const best = getMax(lift.key);
              return (
                <div key={lift.key} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#111", border: "1px solid #222" }}>
                  <div className="body-text text-white/60 text-sm">{lift.label}</div>
                  <div className="text-xl tracking-wide" style={{ color: lift.color }}>{best ? `${best.weight} lb` : "—"}</div>
                </div>
              );
            })}
          </div>
          <div className="p-4 rounded-2xl mb-4" style={{ background: "#47c8ff08", border: "1px solid #47c8ff25" }}>
            <div className="text-lg tracking-wide mb-1" style={{ color: "#47c8ff" }}>MONTHLY BODY SCAN</div>
            <div className="body-text text-white/50 text-xs leading-relaxed">First Saturday of each month. Socks off, arms extended at the gym scale.</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "#111", border: "1px solid #333" }}>
            <div className="body-text text-white/30 text-xs leading-relaxed">Medical physics path: BS in Physics → MS/PhD in Medical Physics → board certification. Your ACT science score (36) and AP Physics 100 already put you in the right lane.</div>
          </div>
        </div>
      )}

      {/* PROGRAM TAB */}
      {activeTab === "program" && (
        <div>
          <div className="mx-4 mt-4 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #e8ff4720, #e8ff4708)", border: "1px solid #e8ff4740" }}>
            <div className="text-sm tracking-widest" style={{ color: "#e8ff47" }}>⚡ BEFORE EVERY SESSION</div>
            <div className="body-text text-white/70 text-sm mt-1">8–10 min mobility prep. Non-negotiable.</div>
            <div className="mt-3 space-y-2">
              {program.mobilityRoutine.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="body-text text-white text-sm font-medium">{ex.name}</div>
                    <div className="body-text text-white/40 text-xs">{ex.note}</div>
                  </div>
                  <div className="body-text text-xs text-white/50 ml-2 text-right shrink-0">{ex.sets}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-4 mt-3 p-3 rounded-xl" style={{ background: "#ff6b3510", border: "1px solid #ff6b3530" }}>
            <div className="body-text text-xs text-white/60 leading-relaxed">
              <span style={{ color: "#ff6b35" }} className="font-semibold">BRACING: </span>{program.bracingNote}
            </div>
          </div>

          <div className="px-4 mt-5 mb-1">
            <div className="body-text text-xs text-white/30 tracking-widest mb-3 uppercase">Select Day</div>
            <div className="grid grid-cols-4 gap-2">
              {program.days.map((d, i) => (
                <button key={i} onClick={() => setActiveDay(i)} className="set-btn py-3 rounded-xl text-center"
                  style={{ background: activeDay === i ? d.color : "#111", border: `1px solid ${activeDay === i ? d.color : "#222"}`, color: activeDay === i ? "#000" : "#666" }}>
                  <div className="text-lg font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{d.id}</div>
                  <div className="body-text text-xs font-medium">{d.label.replace("DAY ", "D")}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="text-3xl tracking-wide" style={{ color: day.color }}>{day.name.split("—")[0].trim()}</div>
            <div className="body-text text-white/40 text-sm">{day.name.split("—")[1]?.trim()} · {day.tag}</div>

            {/* Rest time legend */}
            <div className="mt-3 p-3 rounded-xl flex gap-3 flex-wrap items-center" style={{ background: "#111", border: "1px solid #222" }}>
              <div><div className="body-text text-white/30 text-xs">Total time</div><div className="text-lg tracking-wide" style={{ color: day.color }}>{day.timing.total}</div></div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="text-center">
                  <div className="body-text text-white/30 text-xs mb-1">Compound rest</div>
                  <div className="body-text text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: day.color + "20", color: day.color, border: `1px solid ${day.color}40` }}>
                    {fmtSecs(day.timing.compound_rest)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="body-text text-white/30 text-xs mb-1">Accessory rest</div>
                  <div className="body-text text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: "#ffffff10", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    {fmtSecs(day.timing.accessory_rest)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 mb-3">
              <div className="body-text text-white/25 text-xs">Tap any set button → rest timer starts automatically</div>
            </div>

            <div className="space-y-3 pb-24">
              {day.exercises.map((ex, exIdx) => {
                const cat = categoryColors[ex.category];
                const setCount = parseSetCount(ex.sets);
                const isCompound = COMPOUND_CATS.includes(ex.category);
                return (
                  <div key={exIdx} className={`rounded-2xl p-4 ${cat.bg}`} style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`body-text text-xs px-2 py-0.5 rounded-full font-semibold ${cat.badge}`}>{cat.label}</span>
                          {ex.trackPR && <span className="body-text text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#e8ff4720", color: "#e8ff47" }}>PR TRACKED</span>}
                        </div>
                        <div className="text-xl mt-1 tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{ex.name}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg" style={{ color: day.color, fontFamily: "'Bebas Neue', sans-serif" }}>{ex.sets}</div>
                        <div className="body-text text-xs mt-0.5" style={{ color: isCompound ? day.color + "aa" : "rgba(255,255,255,0.25)" }}>
                          {fmtSecs(isCompound ? day.timing.compound_rest : day.timing.accessory_rest)} rest
                        </div>
                      </div>
                    </div>
                    <div className="body-text text-white/40 text-xs mb-1">{ex.weight}</div>
                    <div className="body-text text-white/60 text-xs leading-relaxed mb-3">{ex.note}</div>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: setCount }).map((_, si) => {
                        const key = `${activeDay}-${exIdx}-${si}`;
                        const done = completedSets[key];
                        return (
                          <button key={si} onClick={() => toggleSet(exIdx, si, ex.category)}
                            className="set-btn body-text text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{
                              background: done ? day.color : "rgba(255,255,255,0.05)",
                              color: done ? "#000" : "rgba(255,255,255,0.3)",
                              border: `1px solid ${done ? day.color : "rgba(255,255,255,0.1)"}`
                            }}>
                            SET {si + 1}{done ? " ✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PR TRACKER TAB */}
      {activeTab === "prs" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">PR TRACKER</div>
          <div className="body-text text-white/40 text-sm mb-1">Saved to your account — persists between sessions.</div>
          <div className="p-4 rounded-2xl mb-5" style={{ background: "#111", border: "1px solid #e8ff4730" }}>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xl tracking-wide" style={{ color: "#e8ff47" }}>1000 LB CLUB</div>
              <div className="text-2xl tracking-wide" style={{ color: total1000() >= 1000 ? "#4ade80" : "white" }}>{total1000()} / 1000</div>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ background: "#222", height: "6px" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (total1000() / 1000) * 100).toFixed(1)}%`, background: total1000() >= 1000 ? "#4ade80" : "#e8ff47", transition: "width 0.5s ease" }} />
            </div>
            <div className="body-text text-white/30 text-xs mt-2">Bench + Squat + Deadlift best weights combined</div>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {PR_LIFTS.map(lift => (
              <button key={lift.key} onClick={() => setActivePrLift(lift.key)}
                className="set-btn body-text text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
                style={{ background: activePrLift === lift.key ? lift.color : "#111", color: activePrLift === lift.key ? "#000" : "#666", border: `1px solid ${activePrLift === lift.key ? lift.color : "#333"}` }}>
                {lift.label}
              </button>
            ))}
          </div>
          {PR_LIFTS.filter(l => l.key === activePrLift).map(lift => {
            const entries = prData[lift.key] || [];
            const best = getMax(lift.key);
            return (
              <div key={lift.key}>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-2xl tracking-wide" style={{ color: lift.color }}>{lift.label.toUpperCase()}</div>
                  {best && <div className="body-text text-sm text-white/50">Best: <span style={{ color: lift.color }} className="font-semibold">{best.weight} lb × {best.reps}</span></div>}
                </div>
                <div className="p-4 rounded-2xl mb-4" style={{ background: "#111", border: `1px solid ${lift.color}30` }}>
                  <div className="body-text text-white/50 text-xs mb-3 uppercase tracking-wider">Log a set</div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <div className="body-text text-white/30 text-xs mb-1">Weight (lb)</div>
                      <input type="number" placeholder="225" value={prInput[lift.key] || ""} onChange={e => setPrInput(p => ({ ...p, [lift.key]: e.target.value }))} />
                    </div>
                    <div style={{ width: "80px" }}>
                      <div className="body-text text-white/30 text-xs mb-1">Reps</div>
                      <input type="number" placeholder="5" value={repInput[lift.key] || ""} onChange={e => setRepInput(p => ({ ...p, [lift.key]: e.target.value }))} />
                    </div>
                  </div>
                  <button onClick={() => savePR(lift.key)} className="set-btn body-text text-sm font-semibold w-full py-2 rounded-xl mt-1"
                    style={{ background: lift.color, color: "#000" }}>
                    Save Entry
                  </button>
                </div>
                {entries.length > 0 ? (
                  <div>
                    <div className="body-text text-white/30 text-xs uppercase tracking-wider mb-2">History ({entries.length} entries)</div>
                    <div className="space-y-2">
                      {[...entries].reverse().map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#111", border: "1px solid #222" }}>
                          <div>
                            <div className="text-xl tracking-wide" style={{ color: lift.color }}>{e.weight} lb</div>
                            <div className="body-text text-white/30 text-xs">{e.reps} rep{e.reps !== 1 ? "s" : ""} · {e.date}</div>
                          </div>
                          <button onClick={() => deletePR(lift.key, entries.length - 1 - i)}
                            className="set-btn body-text text-xs px-2 py-1 rounded-lg text-white/20 border border-white/10">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="body-text text-white/20 text-sm text-center py-8">No entries yet. Log your first set above.</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PLANNER TAB */}
      {activeTab === "planner" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">WEEKLY PLANNER</div>
          <div className="body-text text-white/40 text-sm mb-4">Mon–Thu work 7:30–4:00. Lift after work. Cardio on off days.</div>
          <div className="space-y-3 mb-6">
            {WEEK_SCHEDULE.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: `1px solid ${s.color}30` }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-2xl tracking-wide" style={{ color: s.color }}>{s.day.toUpperCase()}</div>
                      {s.bodyScan && <span className="body-text text-xs px-2 py-0.5 rounded-full" style={{ background: "#47c8ff20", color: "#47c8ff" }}>BODY SCAN (1st Sat)</span>}
                    </div>
                    <div className="body-text text-white text-sm font-medium">{s.label}</div>
                    <div className="body-text text-white/30 text-xs mt-0.5">Work: {s.work}</div>
                  </div>
                  <div className="text-right">
                    <div className="body-text text-xs px-2 py-1 rounded-full" style={{ background: s.type === "lift" ? "#e8ff4715" : s.type === "cardio" ? "#4ade8015" : "#ffffff08", color: s.type === "lift" ? "#e8ff47" : s.type === "cardio" ? "#4ade80" : "#444" }}>
                      {s.type.toUpperCase()}
                    </div>
                    {s.type === "lift" && <div className="body-text text-white/30 text-xs mt-1">~4:30 pm start</div>}
                    {s.type === "cardio" && <div className="body-text text-white/30 text-xs mt-1">Morning preferred</div>}
                  </div>
                </div>
                {s.type === "lift" && (
                  <button onClick={() => { setActiveDay(i); setActiveTab("program"); }}
                    className="set-btn body-text text-xs mt-3 px-4 py-1.5 rounded-full"
                    style={{ background: s.color + "20", color: s.color, border: `1px solid ${s.color}40` }}>
                    Open Day {s.session} →
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#ff6b3510", border: "1px solid #ff6b3530" }}>
            <div className="text-lg tracking-wide mb-2" style={{ color: "#ff6b35" }}>DELOAD REMINDER</div>
            <div className="body-text text-sm text-white/60 leading-relaxed">Every 4th week, reduce all weights by ~40% and cut volume in half.</div>
          </div>
        </div>
      )}

      {/* NUTRITION TAB */}
      {activeTab === "nutrition" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">NUTRITION</div>
          <div className="body-text text-white/40 text-sm mb-5">Built around your Azstarys appetite pattern</div>
          <div className="space-y-3 mb-6">
            {program.nutrition.map((meal, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="text-xl tracking-wide" style={{ color: "#e8ff47" }}>{meal.time.toUpperCase()}</div>
                <div className="body-text text-white font-medium mt-1">{meal.meal}</div>
                <div className="body-text text-white/40 text-xs mt-1">{meal.note}</div>
              </div>
            ))}
          </div>
          <div className="text-2xl tracking-wide mb-3">SUPPLEMENTS</div>
          <div className="space-y-3">
            {program.supplements.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="flex justify-between">
                  <div className="text-lg tracking-wide">{s.name.toUpperCase()}</div>
                  <div className="body-text text-xs px-2 py-1 rounded-full" style={{ background: "#e8ff4720", color: "#e8ff47" }}>{s.dose}</div>
                </div>
                <div className="body-text text-white/40 text-xs mt-1">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARDIO TAB */}
      {activeTab === "cardio" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">CARDIO</div>
          <div className="body-text text-white/40 text-sm mb-4">Keep up with your XC friends without killing gains</div>
          <div className="p-4 rounded-2xl mb-5" style={{ background: "#111", border: "1px solid #222" }}>
            <div className="text-lg tracking-wide mb-2" style={{ color: "#4ade80" }}>THE PHILOSOPHY</div>
            <div className="body-text text-sm text-white/60 leading-relaxed">{program.cardio.philosophy}</div>
          </div>
          <div className="text-xl tracking-wide mb-3">12-WEEK PROGRESSION</div>
          <div className="space-y-3 mb-6">
            {program.cardio.weeks.map((w, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #4ade8020" }}>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="text-lg tracking-wide" style={{ color: "#4ade80" }}>{w.phase.toUpperCase()}</div>
                  <div className="body-text text-xs px-2 py-1 rounded-full shrink-0" style={{ background: "#4ade8015", color: "#4ade80" }}>{w.duration}</div>
                </div>
                <div className="body-text text-white text-sm font-medium">{w.type}</div>
                <div className="body-text text-white/50 text-xs mt-1">Target: {w.target}</div>
                <div className="body-text text-white/30 text-xs mt-1">{w.note}</div>
              </div>
            ))}
          </div>
          <div className="text-xl tracking-wide mb-3">PACING TIPS</div>
          <div className="space-y-3">
            {program.cardio.pacingTips.map((tip, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="flex gap-3 items-start">
                  <div className="text-xl font-bold shrink-0" style={{ color: "#4ade80", fontFamily: "'Bebas Neue', sans-serif" }}>{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="body-text text-white text-sm font-medium mb-1">{tip.title}</div>
                    <div className="body-text text-white/50 text-xs leading-relaxed">{tip.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLEEP TAB */}
      {activeTab === "sleep" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">SLEEP</div>
          <div className="body-text text-white/40 text-sm mb-2">Your #1 free performance enhancer</div>
          <div className="p-3 rounded-xl mb-5 body-text text-xs text-white/60 leading-relaxed" style={{ background: "#47c8ff10", border: "1px solid #47c8ff30" }}>
            <span style={{ color: "#47c8ff" }} className="font-semibold">Summer plan: </span>
            Start at 11:30 pm. Move 15 min earlier every 5–7 days.
          </div>
          <div className="space-y-3 mb-6">
            {program.sleepProtocol.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="text-lg tracking-wide" style={{ color: "#47c8ff" }}>{s.time.toUpperCase()}</div>
                <div className="body-text text-white font-medium mt-1 text-sm">{s.action}</div>
                <div className="body-text text-white/40 text-xs mt-1">{s.note}</div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#c47bff10", border: "1px solid #c47bff30" }}>
            <div className="text-lg tracking-wide mb-2" style={{ color: "#c47bff" }}>WHY IT MATTERS FOR GAINS</div>
            <div className="space-y-2 body-text text-sm text-white/60">
              <div>→ ~70% of daily growth hormone releases in the first 2 hrs of deep sleep</div>
              <div>→ Testosterone peaks after 7–9 hrs — cutting to 6 hrs can drop it ~15%</div>
              <div>→ Your ADD brain masks fatigue until you crash — you're more tired than you feel</div>
              <div>→ Every late night costs more than a missed session</div>
            </div>
          </div>
        </div>
      )}

      {/* BAG TAB */}
      {activeTab === "bag" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">GYM BAG</div>
          <div className="body-text text-white/40 text-sm mb-4">What to pack and what to skip</div>
          <div className="flex gap-2 mb-4">
            {["essential", "useful", "skip"].map(f => (
              <button key={f} onClick={() => setBagFilter(f)} className="set-btn body-text text-xs px-4 py-2 rounded-full font-medium uppercase tracking-wider"
                style={{ background: bagFilter === f ? (f === "essential" ? "#e8ff47" : f === "useful" ? "#47c8ff" : "#ff6b35") : "#111", color: bagFilter === f ? "#000" : "#666", border: `1px solid ${bagFilter === f ? "transparent" : "#222"}` }}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {program.gymBag[bagFilter].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: "#111", border: `1px solid ${bagFilter === "essential" ? "#e8ff4720" : bagFilter === "useful" ? "#47c8ff20" : "#ff6b3520"}` }}>
                <div className="text-lg tracking-wide" style={{ color: bagFilter === "essential" ? "#e8ff47" : bagFilter === "useful" ? "#47c8ff" : "#ff6b35" }}>{item.item.toUpperCase()}</div>
                <div className="body-text text-white/50 text-xs mt-1">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === "rules" && (
        <div className="px-4 pt-4 pb-24">
          <div className="text-3xl tracking-wide mb-1">PROGRESSION</div>
          <div className="body-text text-white/40 text-sm mb-5">The rules that make the program work</div>
          <div className="space-y-3 mb-8">
            {program.progressionRules.map((rule, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-2xl" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="text-2xl font-bold shrink-0" style={{ color: "#e8ff47", fontFamily: "'Bebas Neue', sans-serif" }}>{String(i + 1).padStart(2, "0")}</div>
                <div className="body-text text-white/70 text-sm leading-relaxed self-center">{rule}</div>
              </div>
            ))}
          </div>
          <div className="text-2xl tracking-wide mb-3">YOUR TARGETS</div>
          <div className="space-y-3 mb-6">
            {[
              { lift: "BENCH", current: "225", target: "300+", color: "#e8ff47" },
              { lift: "SQUAT", current: "315 (depth)", target: "350+ ATG", color: "#ff6b35" },
              { lift: "DEADLIFT", current: "Unknown", target: "365+", color: "#47c8ff" },
              { lift: "TOTAL", current: "~850 est.", target: "1,000+", color: "#c47bff" },
            ].map((t, i) => (
              <div key={i} className="p-4 rounded-2xl flex items-center justify-between" style={{ background: "#111", border: `1px solid ${t.color}30` }}>
                <div>
                  <div className="text-2xl tracking-wide" style={{ color: t.color }}>{t.lift}</div>
                  <div className="body-text text-white/30 text-xs">Current: {t.current}</div>
                </div>
                <div className="text-right">
                  <div className="body-text text-xs text-white/30 mb-1">Target</div>
                  <div className="text-2xl tracking-wide text-white">{t.target}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}