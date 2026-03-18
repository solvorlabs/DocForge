
import { BookSharp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { Trophy, Coffee, Hammer, Zap, CoffeeIcon, SwordIcon, LucideSwords, Joystick, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function DailyChallengeComingSoon() {
  return (
    <main className="min-h-screen bg-[#fdf6e3] flex flex-col items-center justify-center text-center relative overflow-hidden px-6">
      {/* Doodle background */}
      <div className="absolute inset-0 bg-[url('/doodle-bg.png')] bg-repeat opacity-10 pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10"
      >
        <h1 className="text-5xl font-handwritten text-[#222] mb-3 flex justify-center items-center gap-2">
          <Trophy className="text-yellow-500" />
          Daily Challenge
        </h1>
        <p className="text-lg text-[#444] font-doodle max-w-md mx-auto mb-10">
          <Settings /> We’re cooking up something epic — daily multiplayer quiz battles,
          power-ups, streaks, and bragging rights!
        </p>
      </motion.div>

      {/* Doodle Card */}
      <motion.div
        className="bg-white border-4 border-black rounded-3xl shadow-doodle p-8 w-full max-w-lg z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-2xl font-handwritten mb-4 flex justify-center gap-2">
          <Hammer className="text-gray-600" /> Under Construction
        </div>

        <p className="font-doodle text-[#333] mb-4 flex flex-col items-center">
          Our developers are currently busy pretending to debug while actually
          sipping coffee <span><CoffeeIcon /></span> and arguing about variable names.
        </p>
        <p className="font-doodle text-[#333] mb-6">
          Be patient, warrior! The **Daily Challenge Battle Arena** will soon
          rise from the ashes (and sleep schedules).
        </p>

        <p className="font-doodle text-[#555]">
          Till then, why not warm up your brain?
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <Link
            to="/questions"
            className="bg-[#ffdd57] hover:bg-[#ffc857] border-2 border-black rounded-xl px-4 py-2 font-handwritten shadow-doodle transition-transform hover:-translate-y-1"
          >
            <BookSharp /> Question Bank
          </Link>
          <Link
            to="/custom-rooms"
            className="bg-[#b5f5ec] hover:bg-[#7ddfdf] border-2 border-black rounded-xl px-4 py-2 font-handwritten shadow-doodle transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <LucideSwords /> 5v5 Battle Mode
          </Link>
          <Link
            to="/"
            className="bg-[#ffd6e0] hover:bg-[#ffabc1] border-2 border-black rounded-xl px-4 py-2 font-handwritten shadow-doodle transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Joystick /> Explore Other Modes
          </Link>
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p
        className="mt-10 text-sm text-[#777] font-doodle z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Zap className="inline mr-1" size={14} /> Coming soon: Power-ups, XP rewards, and chaos.
      </motion.p>
    </main>
  );
}