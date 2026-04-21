import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  Shield,
  Star,
  Coins,
  Clock,
  Zap,
  Brain,
  LogIn,
  TrendingUp,
  Flame,
  Moon,
  ChevronRight,
} from "lucide-react";

// ======================================================
// ประเภทข้อมูลสถานะของเกม
// ======================================================
type GameStatus = "GRINDING" | "BOSS_BATTLE" | "AT_THE_INN";

interface StatusConfig {
  label: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  icon: React.ReactNode;
  questName: string;
}

// ======================================================
// ฟังก์ชันคำนวณ % ความคืบหน้าใน Quest ปัจจุบัน
// ======================================================
function getQuestProgress(now: Date): { status: GameStatus; percent: number } {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;

  const mainStart = 8 * 60; // 08:00
  const mainEnd = 16 * 60 + 45; // 16:45
  const otStart = 16 * 60 + 45; // 16:45
  const otEnd = 20 * 60; // 20:00

  if (totalMinutes >= mainStart && totalMinutes < mainEnd) {
    // กำลัง Grind อยู่
    const elapsed = totalMinutes - mainStart;
    const duration = mainEnd - mainStart;
    return {
      status: "GRINDING",
      percent: Math.min((elapsed / duration) * 100, 100),
    };
  } else if (totalMinutes >= otStart && totalMinutes < otEnd) {
    // Overtime Boss Battle
    const elapsed = totalMinutes - otStart;
    const duration = otEnd - otStart;
    return {
      status: "BOSS_BATTLE",
      percent: Math.min((elapsed / duration) * 100, 100),
    };
  } else {
    // พักที่ Inn
    let elapsed: number;
    const duration = 24 * 60 - otEnd + mainStart; // เวลาทั้งหมดของ resting phase
    if (totalMinutes >= otEnd) {
      elapsed = totalMinutes - otEnd;
    } else {
      elapsed = 24 * 60 - otEnd + totalMinutes;
    }
    return {
      status: "AT_THE_INN",
      percent: Math.min((elapsed / duration) * 100, 100),
    };
  }
}

// ======================================================
// Component: Pixel Progress Bar (หลอด HP / MP / Quest)
// ======================================================
interface PixelBarProps {
  value: number; // 0-100
  color: string; // Tailwind bg class
  emptyColor?: string;
  segments?: number;
  animate?: boolean;
}

const PixelBar: React.FC<PixelBarProps> = ({
  value,
  color,
  emptyColor = "bg-slate-800",
  segments = 20,
  animate = false,
}) => {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex gap-[2px] p-[3px] border-2 border-slate-600 bg-black w-full">
      {[...Array(segments)].map((_, i) => (
        <motion.div
          key={i}
          initial={animate ? { opacity: 0, scaleY: 0 } : false}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: animate ? i * 0.03 : 0, duration: 0.2 }}
          className={`h-4 flex-1 ${i < filled ? color : emptyColor}`}
        />
      ))}
    </div>
  );
};

// ======================================================
// Component: 8-bit Pixel Avatar (ตัวละครหลัก)
// ======================================================
const HeroAvatar: React.FC = () => (
  <div
    className="w-14 h-14 border-2 border-black shrink-0"
    style={{ imageRendering: "pixelated" }}
  >
    {/* วาด Avatar ด้วย CSS Grid 8x8 */}
    <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
      {/* แถว 1: หมวก */}
      <div className="col-span-8 bg-transparent" />
      {/* แถว 2 */}
      <div className="col-span-2 bg-transparent" />
      <div className="col-span-4 bg-blue-600" />
      <div className="col-span-2 bg-transparent" />
      {/* แถว 3: หัว */}
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-6 bg-amber-300" />
      <div className="col-span-1 bg-transparent" />
      {/* แถว 4: ตา */}
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-1 bg-amber-300" />
      <div className="col-span-1 bg-slate-900" />
      <div className="col-span-2 bg-amber-300" />
      <div className="col-span-1 bg-slate-900" />
      <div className="col-span-1 bg-amber-300" />
      <div className="col-span-1 bg-transparent" />
      {/* แถว 5: ตัว */}
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-6 bg-blue-500" />
      <div className="col-span-1 bg-transparent" />
      {/* แถว 6: เข็มขัด */}
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-6 bg-yellow-600" />
      <div className="col-span-1 bg-transparent" />
      {/* แถว 7: ขา */}
      <div className="col-span-2 bg-transparent" />
      <div className="col-span-2 bg-slate-700" />
      <div className="col-span-2 bg-slate-700" />
      <div className="col-span-2 bg-transparent" />
      {/* แถว 8: เท้า */}
      <div className="col-span-2 bg-transparent" />
      <div className="col-span-2 bg-slate-900" />
      <div className="col-span-2 bg-slate-900" />
      <div className="col-span-2 bg-transparent" />
    </div>
  </div>
);

// ======================================================
// Component: Boss Avatar (ศัตรู Overtime)
// ======================================================
const BossAvatar: React.FC = () => (
  <div
    className="w-14 h-14 border-2 border-black shrink-0"
    style={{ imageRendering: "pixelated" }}
  >
    <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
      {/* เขา */}
      <div className="col-span-1 bg-red-700" />
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-4 bg-transparent" />
      <div className="col-span-1 bg-transparent" />
      <div className="col-span-1 bg-red-700" />
      {/* หัว row2 */}
      <div className="col-span-1 bg-red-600" />
      <div className="col-span-6 bg-red-500" />
      <div className="col-span-1 bg-red-600" />
      {/* ตา */}
      <div className="col-span-1 bg-red-500" />
      <div className="col-span-1 bg-yellow-400" />
      <div className="col-span-1 bg-red-500" />
      <div className="col-span-2 bg-red-500" />
      <div className="col-span-1 bg-red-500" />
      <div className="col-span-1 bg-yellow-400" />
      <div className="col-span-1 bg-red-500" />
      {/* ปาก */}
      <div className="col-span-1 bg-red-500" />
      <div className="col-span-1 bg-slate-900" />
      <div className="col-span-1 bg-red-700" />
      <div className="col-span-2 bg-red-700" />
      <div className="col-span-1 bg-red-700" />
      <div className="col-span-1 bg-slate-900" />
      <div className="col-span-1 bg-red-500" />
      {/* ตัว */}
      <div className="col-span-8 bg-red-700" />
      {/* แขน */}
      <div className="col-span-1 bg-red-900" />
      <div className="col-span-6 bg-red-800" />
      <div className="col-span-1 bg-red-900" />
      {/* ขา */}
      <div className="col-span-2 bg-transparent" />
      <div className="col-span-2 bg-red-900" />
      <div className="col-span-2 bg-red-900" />
      <div className="col-span-2 bg-transparent" />
      {/* เท้า */}
      <div className="col-span-2 bg-transparent" />
      <div className="col-span-2 bg-slate-900" />
      <div className="col-span-2 bg-slate-900" />
      <div className="col-span-2 bg-transparent" />
    </div>
  </div>
);

// ======================================================
// Component: INN Avatar (ตัวละครกำลังนอนหลับ)
// ======================================================
const InnAvatar: React.FC = () => (
  <div className="w-14 h-14 border-2 border-blue-900 shrink-0 bg-blue-950 flex items-center justify-center">
    <Moon className="text-blue-300 w-7 h-7" />
  </div>
);

// ======================================================
// Component: Floating Reward Popup (แอนิเมชัน +Gold +EXP)
// ======================================================
interface FloatingRewardProps {
  show: boolean;
}
const FloatingReward: React.FC<FloatingRewardProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key="reward"
        initial={{ opacity: 1, y: 0, scale: 0.5 }}
        animate={{ opacity: 1, y: -80, scale: 1.2 }}
        exit={{ opacity: 0, y: -140, scale: 0.8 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      >
        <div
          className="bg-yellow-400 text-black px-4 py-3 border-4 border-black text-center shadow-2xl"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px" }}
        >
          <div className="text-green-800 text-sm mb-1">✨ REWARD!!</div>
          <div>+50 GOLD</div>
          <div>+20 EXP</div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ======================================================
// Component: Level Up Banner (แบนเนอร์ Level Up!)
// ======================================================
interface LevelUpBannerProps {
  show: boolean;
}
const LevelUpBanner: React.FC<LevelUpBannerProps> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        key="levelup"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        exit={{ opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.4, ease: "backOut" }}
        className="fixed top-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          className="bg-yellow-400 text-black px-8 py-3 border-4 border-b-8 border-black shadow-2xl text-center"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "14px" }}
        >
          ⭐ LEVEL UP! ⭐
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ======================================================
// Component: Scanline Overlay (ลาย CRT)
// ======================================================
const Scanlines: React.FC = () => (
  <div
    className="absolute inset-0 pointer-events-none rounded-sm z-10 opacity-[0.07]"
    style={{
      backgroundImage:
        "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)",
    }}
  />
);

// ======================================================
// Main App Component
// ======================================================
const PixelRPGApp: React.FC = () => {
  // ---- State ----
  const [time, setTime] = useState<Date>(new Date());
  const [gold, setGold] = useState<number>(120);
  const [exp, setExp] = useState<number>(340);
  const [level, setLevel] = useState<number>(7);
  const [hp, setHp] = useState<number>(75); // เปอร์เซ็นต์ HP (Energy)
  const [mp, setMp] = useState<number>(60); // เปอร์เซ็นต์ MP (Focus)
  const [checkedIn, setCheckedIn] = useState<boolean>(false); // Check-in แล้วหรือยัง
  const [showReward, setShowReward] = useState<boolean>(false); // แสดง Popup รางวัล
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false); // แสดงแบนเนอร์ Level Up
  const [questPercent, setQuestPercent] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>("GRINDING");
  const [shakeCheckIn, setShakeCheckIn] = useState<boolean>(false);
  const rewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- อัพเดทนาฬิกาทุกวิ ----
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      const { status: s, percent: p } = getQuestProgress(now);
      setStatus(s);
      setQuestPercent(p);
    }, 1000);

    // คำนวณค่าเริ่มต้นทันที
    const { status: s, percent: p } = getQuestProgress(new Date());
    setStatus(s);
    setQuestPercent(p);

    return () => clearInterval(timer);
  }, []);

  // ---- Config ตามสถานะ ----
  const statusConfig: Record<GameStatus, StatusConfig> = {
    GRINDING: {
      label: "🗡 GRINDING EXP",
      color: "text-green-400",
      glowColor: "rgba(74,222,128,0.4)",
      borderColor: "border-green-600",
      bgColor: "bg-green-900/20",
      icon: <Sword className="w-4 h-4" />,
      questName: "MAIN QUEST: DAILY GRIND",
    },
    BOSS_BATTLE: {
      label: "🔥 BOSS BATTLE",
      color: "text-orange-400",
      glowColor: "rgba(251,146,60,0.4)",
      borderColor: "border-orange-600",
      bgColor: "bg-orange-900/20",
      icon: <Flame className="w-4 h-4" />,
      questName: "OVERTIME RAID: THE TOWER",
    },
    AT_THE_INN: {
      label: "🌙 AT THE INN",
      color: "text-blue-400",
      glowColor: "rgba(96,165,250,0.4)",
      borderColor: "border-blue-600",
      bgColor: "bg-blue-900/20",
      icon: <Moon className="w-4 h-4" />,
      questName: "RESTING: RECOVER MP/HP",
    },
  };

  const cfg = statusConfig[status];

  // ---- Daily Check-in Handler ----
  const handleCheckIn = () => {
    if (checkedIn) {
      // สั่น button ถ้ากดซ้ำ
      setShakeCheckIn(true);
      setTimeout(() => setShakeCheckIn(false), 600);
      return;
    }

    setCheckedIn(true);
    setGold((g) => g + 50);
    setExp((e) => {
      const newExp = e + 20;
      // ตรวจสอบ Level Up (ทุกๆ 100 EXP ต่อ level)
      if (Math.floor(newExp / 100) > Math.floor(e / 100)) {
        setLevel((lv) => lv + 1);
        setShowLevelUp(true);
        if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
        levelUpTimerRef.current = setTimeout(() => setShowLevelUp(false), 3000);
      }
      return newExp;
    });

    // แสดง Popup รางวัล
    setShowReward(true);
    if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = setTimeout(() => setShowReward(false), 1800);

    // Restore HP และ MP นิดหน่อย
    setHp((h) => Math.min(h + 10, 100));
    setMp((m) => Math.min(m + 15, 100));
  };

  // ---- Bar สีตามค่า HP ----
  const hpBarColor =
    hp > 50 ? "bg-green-500" : hp > 25 ? "bg-yellow-500" : "bg-red-500";
  const mpBarColor = "bg-blue-500";

  const currentTimeStr = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const expToNextLevel = (level + 1) * 100;
  const expThisLevel = exp % 100;

  // ---- Bar สีตาม Quest Progress ----
  const questBarColor =
    status === "GRINDING"
      ? "bg-green-500"
      : status === "BOSS_BATTLE"
        ? "bg-orange-500"
        : "bg-blue-500";

  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center p-3 md:p-6 selection:bg-yellow-500 selection:text-black"
      style={{ fontFamily: "'Press Start 2P', cursive", lineHeight: "1.6" }}
    >
      {/* Level Up Banner */}
      <LevelUpBanner show={showLevelUp} />

      {/* ======================================================
          Outer Console Frame (กรอบเครื่องเกม – ไม้มันวาว)
      ====================================================== */}
      <div
        className="relative w-full max-w-2xl"
        style={{
          background:
            "linear-gradient(145deg, #c47d3a 0%, #a0612a 40%, #7a4520 100%)",
          padding: "12px",
          borderRadius: "16px",
          border: "4px solid #e3a06b",
          borderBottom: "10px solid #5a2e10",
          borderRight: "10px solid #5a2e10",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* ลวดลายไม้ */}
        <div
          className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px)",
          }}
        />

        {/* Logo แถบบน */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-[8px] text-amber-900 tracking-widest">
            NINTEGA™ CORP.
          </div>
          <div className="flex gap-1">
            {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${c} opacity-70`} />
            ))}
          </div>
        </div>

        {/* ======================================================
            Screen Bezel
        ====================================================== */}
        <div
          style={{
            background: "#0f0f0f",
            padding: "8px",
            borderRadius: "10px",
            border: "4px solid #1a1a1a",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.9)",
          }}
        >
          {/* ======================================================
              THE SCREEN (เนื้อหาทั้งหมด)
          ====================================================== */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0d1117 0%, #111827 100%)",
              padding: "16px",
              borderRadius: "6px",
              boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), 0 0 20px ${cfg.glowColor}`,
            }}
          >
            <Scanlines />

            {/* ---- Header: ชื่อเกม + นาฬิกา ---- */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2 relative z-20">
              <motion.div
                animate={{
                  textShadow: [
                    "0 0 8px #facc15",
                    "0 0 20px #facc15",
                    "0 0 8px #facc15",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-400 text-[9px] md:text-[11px] text-center"
              >
                ⚔ WORK LIFE RPG ⚔
              </motion.div>
              <div className="flex items-center gap-2 bg-black px-3 py-2 border-2 border-slate-600 text-[10px]">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300 tabular-nums">
                  {currentTimeStr}
                </span>
              </div>
            </div>

            {/* ---- Stats Bar (Gold, EXP, Level) ---- */}
            <div className="flex flex-wrap gap-3 mb-4 relative z-20">
              {/* Gold */}
              <div className="flex items-center gap-2 bg-black border-2 border-yellow-600 px-3 py-2">
                <Coins className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-[10px]">
                  {gold.toString().padStart(5, "0")}
                </span>
              </div>
              {/* EXP */}
              <div className="flex items-center gap-2 bg-black border-2 border-purple-600 px-3 py-2">
                <Star className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300 text-[10px]">{exp} EXP</span>
              </div>
              {/* Level */}
              <div className="flex items-center gap-2 bg-black border-2 border-green-600 px-3 py-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-[10px]">LV.{level}</span>
              </div>
            </div>

            {/* ---- Character Section ---- */}
            <div
              className={`relative z-20 border-4 ${cfg.borderColor} ${cfg.bgColor} p-4 mb-4`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center gap-2 ${cfg.color} text-[9px] md:text-[11px]`}
                >
                  {cfg.icon}
                  <motion.span
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {cfg.label}
                  </motion.span>
                </div>
                <div className="text-slate-500 text-[8px]">
                  {status === "GRINDING"
                    ? "08:00 - 16:45"
                    : status === "BOSS_BATTLE"
                      ? "16:45 - 20:00"
                      : "20:00 - 08:00"}
                </div>
              </div>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <motion.div
                  animate={
                    status === "BOSS_BATTLE"
                      ? { x: [0, -2, 2, -2, 0] }
                      : { x: 0 }
                  }
                  transition={
                    status === "BOSS_BATTLE"
                      ? { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
                      : {}
                  }
                >
                  {status === "GRINDING" ? (
                    <HeroAvatar />
                  ) : status === "BOSS_BATTLE" ? (
                    <BossAvatar />
                  ) : (
                    <InnAvatar />
                  )}
                </motion.div>

                {/* Quest Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[9px] md:text-[11px] mb-2">
                    {cfg.questName}
                  </div>
                  <div className="text-slate-400 text-[8px] mb-3">
                    {status === "GRINDING" &&
                      "TARGET: Complete daily work tasks & gain EXP"}
                    {status === "BOSS_BATTLE" &&
                      "TARGET: Survive overtime & claim BONUS GOLD"}
                    {status === "AT_THE_INN" &&
                      "TARGET: Rest & recover HP/MP for tomorrow"}
                  </div>

                  {/* Quest Progress Bar */}
                  <div className="text-[8px] text-slate-400 mb-1 flex justify-between">
                    <span>QUEST PROGRESS</span>
                    <span className={cfg.color}>
                      {Math.round(questPercent)}%
                    </span>
                  </div>
                  <PixelBar
                    value={questPercent}
                    color={questBarColor}
                    segments={16}
                    animate
                  />
                </div>
              </div>
            </div>

            {/* ---- HP / MP Stats ---- */}
            <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* HP Bar */}
              <div className="bg-black border-2 border-slate-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[9px]">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">HP (ENERGY)</span>
                  </div>
                  <span className="text-[9px] text-white">{hp}/100</span>
                </div>
                <PixelBar value={hp} color={hpBarColor} segments={20} />
              </div>

              {/* MP Bar */}
              <div className="bg-black border-2 border-slate-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[9px]">
                    <Brain className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400">MP (FOCUS)</span>
                  </div>
                  <span className="text-[9px] text-white">{mp}/100</span>
                </div>
                <PixelBar value={mp} color={mpBarColor} segments={20} />
              </div>
            </div>

            {/* ---- EXP to Next Level ---- */}
            <div className="relative z-20 bg-black border-2 border-purple-900 p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[9px]">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-400">EXP TO NEXT LEVEL</span>
                </div>
                <span className="text-[9px] text-purple-300">
                  {expThisLevel}/{100}
                </span>
              </div>
              <PixelBar
                value={(expThisLevel / 100) * 100}
                color="bg-purple-500"
                segments={20}
              />
              <div className="text-[8px] text-slate-500 mt-2 text-right">
                NEXT: LV.{level + 1} at {expToNextLevel} EXP
              </div>
            </div>

            {/* ---- Quest Log ---- */}
            <div className="relative z-20 bg-black border-2 border-slate-700 p-3 mb-4 text-[8px] text-slate-400">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <ChevronRight className="w-3 h-3" />
                QUEST LOG
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  <span>08:00 – Start daily grind (MAIN QUEST)</span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={
                      status === "BOSS_BATTLE"
                        ? "text-orange-400"
                        : status === "AT_THE_INN"
                          ? "text-green-500"
                          : "text-slate-600"
                    }
                  >
                    {status === "AT_THE_INN"
                      ? "✓"
                      : status === "BOSS_BATTLE"
                        ? "▶"
                        : "○"}
                  </span>
                  <span
                    className={status === "GRINDING" ? "text-slate-600" : ""}
                  >
                    16:45 – Overtime raid begins (BOSS EVENT)
                  </span>
                </div>
                <div className="flex gap-2">
                  <span
                    className={
                      status === "AT_THE_INN"
                        ? "text-blue-400 animate-pulse"
                        : "text-slate-600"
                    }
                  >
                    {status === "AT_THE_INN" ? "▶" : "○"}
                  </span>
                  <span
                    className={status !== "AT_THE_INN" ? "text-slate-600" : ""}
                  >
                    20:00 – Return to inn (REST PHASE)
                  </span>
                </div>
              </div>
            </div>

            {/* ---- Check-in Button อยู่ตรงนี้ ---- */}
            <div className="relative z-20">
              <motion.button
                id="daily-checkin-btn"
                onClick={handleCheckIn}
                disabled={checkedIn}
                animate={shakeCheckIn ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={!checkedIn ? { scale: 1.02 } : {}}
                whileTap={!checkedIn ? { scale: 0.97, y: 4 } : {}}
                className={`
                  w-full py-4 text-[10px] md:text-xs border-4 border-black
                  transition-all relative overflow-hidden
                  ${
                    checkedIn
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed border-b-[6px]"
                      : "bg-yellow-500 text-black cursor-pointer border-b-[8px] border-r-[6px] border-yellow-900 hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  }
                `}
              >
                <span className="flex items-center justify-center gap-3">
                  <LogIn className="w-4 h-4" />
                  {checkedIn
                    ? "✓ CHECKED IN TODAY"
                    : "⭐ DAILY CHECK-IN (+50G / +20EXP)"}
                </span>

                {/* Floating Reward Popup */}
                <FloatingReward show={showReward} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ======================================================
            Physical Buttons Area (ปุ่มด้านล่างกรอบเครื่อง)
        ====================================================== */}
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 mt-4 px-1 pb-1">
          <motion.button
            id="check-progress-btn"
            whileTap={{ scale: 0.96, y: 4 }}
            onClick={() =>
              alert(
                `Quest Progress: ${Math.round(questPercent)}%\nStatus: ${cfg.label}`,
              )
            }
            className="flex-1 bg-[#3b82f6] text-white py-3 border-4 border-black border-b-[6px] border-r-[4px] border-[#1d4ed8] active:border-b-[2px] active:translate-y-1 transition-all text-[8px] md:text-[10px] hover:bg-[#60a5fa] cursor-pointer"
          >
            CHECK
            <br />
            PROGRESS
          </motion.button>

          <motion.button
            id="boost-mp-btn"
            whileTap={{ scale: 0.96, y: 4 }}
            onClick={() => setMp((m) => Math.min(m + 10, 100))}
            className="flex-1 bg-[#8b5cf6] text-white py-3 border-4 border-black border-b-[6px] border-r-[4px] border-[#6d28d9] transition-all text-[8px] md:text-[10px] hover:bg-[#a78bfa] cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          >
            MEDITATE
            <br />
            (+MP)
          </motion.button>

          <motion.button
            id="rest-btn"
            whileTap={{ scale: 0.96, y: 4 }}
            onClick={() => {
              setHp((h) => Math.min(h + 15, 100));
              setMp((m) => Math.min(m + 10, 100));
            }}
            className="flex-1 bg-[#22c55e] text-white py-3 border-4 border-black border-b-[6px] border-r-[4px] border-[#15803d] transition-all text-[8px] md:text-[10px] hover:bg-[#4ade80] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            REST
            <br />
            (+HP)
          </motion.button>

          <motion.button
            id="logout-btn"
            whileTap={{ scale: 0.96, y: 4 }}
            onClick={() => {
              if (confirm("LOG OUT? Your HP/MP will be saved.")) {
                setHp(100);
                setMp(100);
              }
            }}
            className="flex-1 bg-[#ef4444] text-white py-3 border-4 border-black border-b-[6px] border-r-[4px] border-[#991b1b] transition-all text-[8px] md:text-[10px] hover:bg-[#f87171] cursor-pointer"
          >
            LOG
            <br />
            OUT
          </motion.button>
        </div>

        {/* D-Pad decoration */}
        <div className="flex justify-between items-center mt-3 px-2">
          <div className="grid grid-cols-3 grid-rows-3 w-10 h-10">
            <div className="col-start-2 bg-amber-900 rounded-sm" />
            <div className="row-start-2 bg-amber-900 rounded-sm" />
            <div className="col-start-2 row-start-2 bg-amber-800 rounded-sm" />
            <div className="col-start-3 row-start-2 bg-amber-900 rounded-sm" />
            <div className="col-start-2 row-start-3 bg-amber-900 rounded-sm" />
          </div>

          <div className="text-[7px] text-amber-900 text-center tracking-wider">
            WORK LIFE RPG
            <br />
            v1.0.0
          </div>

          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-red-800 border-2 border-red-900 shadow-inner" />
            <div className="w-6 h-6 rounded-full bg-blue-800 border-2 border-blue-900 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelRPGApp;
