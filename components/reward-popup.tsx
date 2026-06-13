"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimDailyReward } from "@/app/actions/rewards";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export function RewardPopup({ initialHasClaimed = false, userId }: { initialHasClaimed?: boolean; userId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(initialHasClaimed);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Small delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClaim = async () => {
    if (!userId) return; // Should be handled by UI, but double check
    
    setIsClaiming(true);
    try {
      const result = await claimDailyReward();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("10 coins claimed successfully!");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4ff3a', '#ffffff', '#222222']
        });
        window.dispatchEvent(new CustomEvent('coins-updated', { detail: { amount: 10 } }));
        setHasClaimed(true);
        // Optional: close the popup automatically after claiming
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (err) {
      toast.error("Failed to claim reward");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 px-4 sm:p-6"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-border bg-panel shadow-2xl"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/reward-bg.png" 
                alt="Reward Background" 
                fill 
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row min-h-[400px]">
              {/* Left Side: Animated Coin */}
              <div className="flex w-full sm:w-1/2 items-center justify-center p-8 pb-4 sm:pb-8">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes floatPulse {
                    0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 15px rgba(212, 255, 58, 0.4)); }
                    50% { transform: translateY(-20px); filter: drop-shadow(0 0 35px rgba(212, 255, 58, 0.8)); }
                  }
                  .animate-float-pulse {
                    animation: floatPulse 4s ease-in-out infinite;
                  }
                `}} />
                <div className="relative h-32 w-32 sm:h-64 sm:w-64 animate-float-pulse">
                  <Image 
                    src="/coin-asset.png" 
                    alt="Floating Reward Coin" 
                    fill 
                    className="object-contain drop-shadow-[0_0_25px_rgba(212,255,58,0.6)]"
                  />
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="flex w-full sm:w-1/2 flex-col justify-center px-8 pb-8 pt-2 sm:p-8 sm:pl-0 text-center sm:text-left">
                <h2 className="font-display text-3xl sm:text-4xl font-black uppercase leading-tight tracking-tight text-white mb-4">
                  {hasClaimed ? (
                    <>You&apos;re <span className="text-accent">All Set!</span></>
                  ) : (
                    <>Daily <span className="text-accent">Check-In.</span></>
                  )}
                </h2>
                <p className="mb-8 text-base text-muted-foreground">
                  {hasClaimed 
                    ? "You've already claimed your daily reward. Come back tomorrow for more coins, or submit a prompt to earn now!" 
                    : "Earn coins by daily check-in and contributing prompts! Claim your reward now to unlock exclusive perks in the community."}
                </p>
                
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {!userId ? (
                    <Button 
                      asChild 
                      size="lg" 
                      className="w-full rounded-full bg-accent text-black font-display font-black uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(212,255,58,0.5)] transition-all group"
                      onClick={handleClose}
                    >
                      <Link href="/login">
                        Sign In To Claim
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  ) : !hasClaimed ? (
                    <Button 
                      size="lg" 
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="w-full rounded-full bg-accent text-black font-display font-black uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(212,255,58,0.5)] transition-all group"
                    >
                      {isClaiming ? <Loader2 className="h-5 w-5 animate-spin" /> : "Claim 10 Coins!"}
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      size="lg" 
                      className="w-full rounded-full bg-accent text-black font-display font-black uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(212,255,58,0.5)] transition-all group"
                      onClick={handleClose}
                    >
                      <Link href="/contribute">
                        Start Earning
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                  {hasClaimed && (
                    <Button 
                      variant="secondary"
                      size="lg" 
                      onClick={handleClose}
                      className="w-full rounded-full font-display font-black uppercase tracking-widest"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button placed at the very end of the DOM to guarantee it's on top of everything */}
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 z-[100] flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95 cursor-pointer shadow-xl border border-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
