import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api-base";
import { useGetProfile, getGetProfileQueryKey, useGetLinks, getGetLinksQueryKey } from "@workspace/api-client-react";
import logoPath from "@assets/image_1781908878316.png";
import { getIconComponent, ChevronRight } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MapPin, Star, Key, Building2, Phone, Mail, Users } from "lucide-react";

interface VisualConfig {
  firstName?: string;
  lastName?: string;
  firstNameColor?: string;
  lastNameColor?: string;
  subtitleText?: string;
  subtitleColor?: string;
  decoratorEnabled?: boolean;
  decoratorIcon?: string;
  decoratorColor?: string;
  tagline1?: string;
  tagline2?: string;
  tagline1Color?: string;
  tagline2Color?: string;
  bgOverlay?: number;
  bgBlur?: number;
  bgZoom?: number;
  bgPosition?: string;
  mobileBgPosition?: string;
  mobileBgZoom?: number;
  mobileBgOverlay?: number;
  gradientTop?: boolean;
  gradientBottom?: boolean;
  showDecorLines?: boolean;
  showGlow?: boolean;
  nameLetterSpacing?: string;
  showArrowOnButtons?: boolean;
  showAccentBarOnButtons?: boolean;
  badgeText?: string;
  badgeIcon?: string;
  badgeColor?: string;
  portraitUrl?: string;
  portraitOpacity?: number;
  portraitSize?: number;
  portraitBlendLeft?: number;
  portraitBlendTop?: number;
  bgPhrase?: string;
  bgPhraseEnabled?: boolean;
  bgPhraseOpacity?: number;
  stats?: { icon: string; value: string; label: string; enabled: boolean }[];
  statsEnabled?: boolean;
}

function getVC(profile: any): Required<VisualConfig> {
  const defaults = {
    firstName: "Claudia", lastName: "Alzate",
    firstNameColor: "#FFFFFF", lastNameColor: "#D4B483",
    subtitleText: "REALTOR", subtitleColor: "#D4B483",
    decoratorEnabled: true, decoratorIcon: "home", decoratorColor: "#D4B483",
    tagline1: "Te ayudo a encontrar más que una casa,", tagline2: "tu próximo hogar.",
    tagline1Color: "#FFFFFF", tagline2Color: "#D4B483",
    bgOverlay: 0.7, bgBlur: 0, bgZoom: 1, bgPosition: "center",
    mobileBgPosition: "60% center", mobileBgZoom: 1.15, mobileBgOverlay: 0.52,
    gradientTop: true, gradientBottom: true, showDecorLines: true, showGlow: true,
    nameLetterSpacing: "0.05em", showArrowOnButtons: true, showAccentBarOnButtons: true,
    badgeText: "", badgeIcon: "mappin", badgeColor: "#D4B483",
    portraitUrl: "", portraitOpacity: 0.85, portraitSize: 68,
    portraitBlendLeft: 50, portraitBlendTop: 30,
    bgPhrase: "Luxury Real Estate", bgPhraseEnabled: true, bgPhraseOpacity: 0.88,
    statsEnabled: true,
    stats: [
      { icon: "mappin", value: "", label: "Miami, FL", enabled: true },
      { icon: "home", value: "150+", label: "Propiedades Vendidas", enabled: true },
      { icon: "star", value: "10+", label: "Años de Experiencia", enabled: true },
      { icon: "users", value: "500+", label: "Clientes Satisfechos", enabled: true },
    ],
  };
  return { ...defaults, ...(profile?.visualConfig || {}) };
}

const STALE_MS = 5 * 60 * 1000;

export default function PublicProfile() {
  const { data: profile } = useGetProfile({
    query: {
      queryKey: getGetProfileQueryKey(),
      staleTime: STALE_MS,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  });

  const { data: links, isLoading: isLinksLoading } = useGetLinks({
    query: {
      queryKey: getGetLinksQueryKey(),
      staleTime: STALE_MS,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  });

  const activeLinks = links?.filter(link => link.active).sort((a, b) => a.order - b.order) || [];

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      body: JSON.stringify({ type: 'page_view' }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  }, []);

  // Ensure external URLs always have a protocol so browsers never treat them as
  // relative paths (which would let wouter intercept them and show a 404).
  const toExternalUrl = (url: string) => {
    if (!url) return '#';
    if (/^https?:\/\//i.test(url)) return url;
    if (/^mailto:|^tel:|^sms:/i.test(url)) return url;
    return `https://${url}`;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: any) => {
    e.preventDefault();
    // Open immediately — must be synchronous within the user gesture (tap/click)
    // so mobile browsers don't block it as a popup.
    window.open(toExternalUrl(link.url), '_blank', 'noopener,noreferrer');
    // Track analytics in background after navigation is already triggered
    fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      body: JSON.stringify({ type: 'link_click', linkId: link.id }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  };

  const vc = getVC(profile);
  
  const BadgeIcon = (() => {
    const n = vc.badgeIcon?.toLowerCase();
    if (n === "phone") return Phone;
    if (n === "mail") return Mail;
    if (n === "building2" || n === "building") return Building2;
    return MapPin;
  })();

  const DecoratorIcon = (() => {
    const name = vc.decoratorIcon?.toLowerCase();
    if (name === "mappin") return MapPin;
    if (name === "star") return Star;
    if (name === "key") return Key;
    if (name === "building2" || name === "building") return Building2;
    return Home;
  })();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent lg:bg-background text-foreground relative flex flex-col lg:flex-row overflow-hidden lg:overflow-hidden">
      {/* Mobile background — full-bleed image with luxury gradient layers */}
      <div className="absolute inset-0 lg:hidden -z-10 overflow-hidden">
        {profile?.backgroundUrl ? (
          <>
            {/* Base image — fills entire screen, zoomed & repositioned for portrait */}
            <img
              src={profile.backgroundUrl}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: vc.mobileBgPosition || "60% center",
                transform: `scale(${vc.mobileBgZoom || 1.15})`,
                transformOrigin: "center center",
                filter: vc.bgBlur ? `blur(${vc.bgBlur}px)` : undefined,
              }}
            />
            {/* Base overlay — light, just to unify tone */}
            <div className="absolute inset-0" style={{ background: "rgba(5,3,2,0.22)" }} />
            {/* Top vignette — enough to read text, not enough to kill the image */}
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: "48%",
                background: "linear-gradient(to bottom, rgba(5,3,2,0.80) 0%, rgba(5,3,2,0.38) 50%, transparent 100%)",
              }}
            />
            {/* Bottom cinematic fade — image melts into the dark links section */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: "52%",
                background: "linear-gradient(to top, rgba(5,3,2,1) 0%, rgba(5,3,2,0.90) 18%, rgba(5,3,2,0.55) 50%, transparent 100%)",
              }}
            />
            {/* Lateral vignette — subtle edge depth */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(5,3,2,0.35) 100%)",
              }}
            />

          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] to-background" />
        )}
      </div>

      {/* Mobile portrait — z-index 50 so it sits above all content columns and overlays */}
      {vc.portraitUrl && (
        <img
          src={vc.portraitUrl}
          alt=""
          aria-hidden="true"
          className="lg:hidden absolute bottom-0 right-0 pointer-events-none"
          style={{
            zIndex: 50,
            height: `${Math.min(38, (vc.portraitSize ?? 50) * 0.65)}%`,
            width: "auto",
            maxWidth: "48%",
            objectFit: "contain",
            objectPosition: "bottom right",
            opacity: vc.portraitOpacity ?? 0.85,
          }}
        />
      )}

      {/* Left Column / Mobile Header */}
      <div className="relative w-full lg:w-[40%] flex flex-col items-center justify-center px-8 pt-6 pb-3 lg:p-12 z-10 
        lg:border-r border-primary/20 shrink-0 lg:h-[100dvh] overflow-hidden">
        
        {/* Desktop left column background */}
        <div className="absolute inset-0 hidden lg:block -z-10">
          {profile?.backgroundUrl ? (
            <>
              <div 
                className="absolute inset-0 scale-105"
                style={{
                  backgroundImage: `url(${profile.backgroundUrl})`,
                  backgroundSize: `${(vc.bgZoom || 1) * 100}%`,
                  backgroundPosition: vc.bgPosition || "center",
                  filter: `blur(${vc.bgBlur || 0}px)`
                }}
              />
              <div className="absolute inset-0 bg-black" style={{ opacity: vc.bgOverlay ?? 0.7 }} />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] to-background" />
          )}

        </div>

        {vc.gradientTop && (
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
        )}
        
        {vc.gradientBottom && (
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background z-0 hidden lg:block pointer-events-none" />
        )}

        {vc.showDecorLines && (
          <>
            <div className="absolute w-px h-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent left-0 top-1/4 pointer-events-none" />
            <div className="absolute w-px h-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent right-0 top-1/4 pointer-events-none" />
          </>
        )}

        {/* Desktop-only corner ornaments — luxury architecture-inspired */}
        <div className="hidden lg:block absolute top-8 left-8 z-10 pointer-events-none">
          <div className="w-8 h-px bg-gradient-to-r from-primary/60 to-transparent" />
          <div className="w-px h-8 bg-gradient-to-b from-primary/60 to-transparent mt-0" />
        </div>
        <div className="hidden lg:block absolute top-8 right-8 z-10 pointer-events-none">
          <div className="w-8 h-px bg-gradient-to-l from-primary/60 to-transparent ml-auto" />
          <div className="w-px h-8 bg-gradient-to-b from-primary/60 to-transparent ml-auto" />
        </div>
        <div className="hidden lg:block absolute bottom-8 left-8 z-10 pointer-events-none">
          <div className="w-px h-8 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="w-8 h-px bg-gradient-to-r from-primary/60 to-transparent" />
        </div>

        {vc.showGlow && (
          <div className="absolute w-96 h-96 -top-24 left-1/2 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        )}

        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-3 lg:mb-8 rounded-full relative z-10"
        >
          <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.15)] scale-[1.05]"></div>
          <div className="w-20 h-20 lg:w-36 lg:h-36 overflow-hidden rounded-full border border-primary/40 bg-black/60 p-1 backdrop-blur-sm relative z-10">
            <img src={profile?.logoUrl || logoPath} alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </motion.div>

        {/* Identity */}
        <div className="flex flex-col items-center mb-1 lg:mb-3 z-10">
          <motion.span 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl lg:text-6xl font-serif text-center font-light"
            style={{ color: vc.firstNameColor, letterSpacing: vc.nameLetterSpacing, fontFamily: "'Playfair Display', serif" }}
          >
            {vc.firstName}
          </motion.span>
          <motion.span 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl lg:text-6xl font-serif text-center font-medium"
            style={{ color: vc.lastNameColor, letterSpacing: vc.nameLetterSpacing, fontFamily: "'Playfair Display', serif" }}
          >
            {vc.lastName}
          </motion.span>
        </div>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs font-sans uppercase mb-2 lg:mb-6 text-center tracking-[0.4em] z-10"
          style={{ color: vc.subtitleColor, fontFamily: "'Montserrat', sans-serif" }}
        >
          {vc.subtitleText}
        </motion.p>

        {vc.decoratorEnabled !== false && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-row items-center gap-3 mb-2 lg:mb-6 z-10 w-full max-w-[160px]"
          >
            <div className="flex-1 max-w-[60px] h-px bg-primary opacity-50" />
            <DecoratorIcon className="w-3 h-3" style={{ color: vc.decoratorColor }} />
            <div className="flex-1 max-w-[60px] h-px bg-primary opacity-50" />
          </motion.div>
        )}
        
        <div className="flex flex-col items-center gap-1 lg:gap-2 z-10">
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-sans text-xs lg:text-sm opacity-80 text-center"
            style={{ color: vc.tagline1Color }}
          >
            {vc.tagline1}
          </motion.p>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg lg:text-2xl font-semibold text-center"
            style={{ color: vc.tagline2Color, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
          >
            {vc.tagline2}
          </motion.p>
        </div>

        {/* Desktop bottom bar: copyright only (badge moved to right column) */}
        <div className="hidden lg:flex absolute bottom-8 left-0 right-0 items-end justify-center z-10 px-8">
          <p className="text-[10px] text-muted-foreground/60 font-sans tracking-widest uppercase">
            © {new Date().getFullYear()} {vc.firstName} {vc.lastName}
          </p>
        </div>
      </div>

      {/* Right Column / Mobile Links */}
      <div className="w-full lg:w-[60%] flex flex-col items-center justify-center px-6 pt-2 pb-6 lg:p-12 lg:h-[100dvh] lg:overflow-y-auto bg-background/50 relative z-10 overflow-hidden">

        {/* ── Desktop-only decorative layer ── */}

        {/* Top gold separator line */}
        <div className="hidden lg:block absolute top-0 inset-x-0 pointer-events-none" style={{ height: "2px", background: "linear-gradient(to right, transparent 0%, rgba(212,175,55,0.22) 15%, rgba(212,175,55,0.55) 50%, rgba(212,175,55,0.22) 85%, transparent 100%)" }} />

        {/* Top-right corner bracket */}
        <div className="hidden lg:block absolute top-7 right-7 pointer-events-none z-10">
          <div style={{ width: 36, height: 1, background: "linear-gradient(to left, rgba(212,175,55,0.7), transparent)", marginLeft: "auto" }} />
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(212,175,55,0.7), transparent)", marginLeft: "auto" }} />
        </div>

        {/* Top-left corner bracket */}
        <div className="hidden lg:block absolute top-7 left-7 pointer-events-none z-10">
          <div style={{ width: 36, height: 1, background: "linear-gradient(to right, rgba(212,175,55,0.7), transparent)" }} />
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(212,175,55,0.7), transparent)" }} />
        </div>

        {/* Left vertical accent line */}
        <div className="hidden lg:block absolute left-0 top-1/4 w-px h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.28) 50%, transparent)" }} />

        {/* Soft gold glow — upper center */}
        <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 320, height: 180, background: "radial-gradient(ellipse at top, rgba(212,175,55,0.07) 0%, transparent 70%)" }} />

        {/* Diamond ornament — top center */}
        <div className="hidden lg:block absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="5" y="0.7" width="6.5" height="6.5" rx="0.3" transform="rotate(45 5 5)" stroke="rgba(212,175,55,0.65)" strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Bottom separator */}
        <div className="hidden lg:block absolute bottom-0 inset-x-0 pointer-events-none" style={{ height: "1px", background: "linear-gradient(to right, transparent 0%, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.25) 70%, transparent 100%)" }} />

        {/* Portrait — desktop only, large transparent PNG anchored bottom-right */}
        {vc.portraitUrl && (
          <img
            src={vc.portraitUrl}
            alt=""
            aria-hidden="true"
            className="hidden lg:block absolute bottom-0 right-0 pointer-events-none z-0"
            style={{
              height: "72%",
              width: "auto",
              maxWidth: "40%",
              objectFit: "contain",
              objectPosition: "bottom right",
              opacity: vc.portraitOpacity ?? 0.9,
            }}
          />
        )}

        {/* ── Quote block — desktop only, upper-right, above portrait ── */}
        {vc.bgPhraseEnabled !== false && vc.bgPhrase && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden lg:flex absolute top-[14%] right-10 flex-col items-end pointer-events-none z-10 max-w-[220px]"
          >
            {/* Top accent line */}
            <div className="w-8 h-px mb-3" style={{ background: "linear-gradient(to left, rgba(212,175,55,0.9), transparent)" }} />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.45,
                letterSpacing: "0.02em",
                opacity: vc.bgPhraseOpacity ?? 0.88,
                color: "#D4B483",
                textAlign: "right",
              }}
            >
              {vc.bgPhrase}
            </p>
            {/* Bottom accent line */}
            <div className="w-5 h-px mt-3" style={{ background: "linear-gradient(to left, rgba(212,175,55,0.5), transparent)" }} />
          </motion.div>
        )}

        <main className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-14 lg:mr-auto flex flex-col flex-1 lg:flex-none justify-center relative z-10">
          
          {/* Links */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full space-y-3 lg:space-y-4 mb-8 lg:mb-0"
          >
            {isLinksLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-xl bg-card/40" />)
            ) : (
              activeLinks.map((link) => {
                const Icon = getIconComponent(link.icon);
                return (
                  <motion.div
                    variants={itemVariants}
                    key={link.id}
                  >
                    <a
                      href={toExternalUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e, link)}
                      className="group relative block w-full bg-card/40 backdrop-blur-md border border-primary/15 rounded-2xl py-5 px-6 transition-all duration-400 hover:bg-card/70 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(212,175,55,0.12)] overflow-hidden"
                    >
                      {vc.showAccentBarOnButtons !== false && (
                        <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-primary/8 rounded-xl p-3 shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-sans font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                              {link.description}
                            </p>
                          )}
                        </div>
                        {vc.showArrowOnButtons !== false && (
                          <div className="shrink-0">
                            <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary/80 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        )}
                      </div>
                    </a>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* ── Stats — desktop only ── */}
          {vc.statsEnabled !== false && (vc.stats || []).filter(s => s.enabled).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-5 mt-8 pt-7 border-t border-primary/10"
            >
              {(vc.stats || []).filter(s => s.enabled).map((stat, i) => {
                const StatIcon = getIconComponent(stat.icon);
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                      <StatIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      {stat.value && (
                        <p
                          className="text-sm font-semibold leading-tight font-sans"
                          style={{ color: "#D4B483" }}
                        >
                          {stat.value}
                        </p>
                      )}
                      <p className={`text-xs leading-tight font-sans ${stat.value ? "text-muted-foreground/60 mt-0.5" : "text-foreground/75 font-medium"}`}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </main>

        {/* Desktop badge — bottom-left of right column, above portrait area */}
        {vc.badgeText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="hidden lg:flex absolute bottom-8 left-8 z-20 items-center gap-2 bg-black/50 backdrop-blur-md border border-primary/20 rounded-full px-3.5 py-2"
          >
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: vc.badgeColor }} />
            <span
              className="text-[11px] font-medium leading-none"
              style={{ color: vc.badgeColor, fontFamily: "'Montserrat', sans-serif" }}
            >
              {vc.badgeText}
            </span>
          </motion.div>
        )}

        {/* Footer (Mobile only, Desktop handles it in left col) */}
        <footer className="lg:hidden py-10 text-center w-full mt-auto flex flex-col items-center border-t border-primary/10">
          <div className="w-12 h-px bg-primary/40 mb-6" />
          <p className="text-[10px] text-muted-foreground/40 font-sans tracking-wider uppercase">
            © {new Date().getFullYear()} {vc.firstName} {vc.lastName}
          </p>
        </footer>
      </div>

      {/* Mobile badge — fixed bottom-left, visible only on mobile */}
      {vc.badgeText && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="fixed bottom-5 left-4 z-50 lg:hidden flex items-center gap-2 bg-black/55 backdrop-blur-md border border-white/12 rounded-full px-3.5 py-2 shadow-lg"
        >
          <BadgeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: vc.badgeColor }} />
          <span
            className="text-[12px] font-medium leading-none"
            style={{ color: vc.badgeColor, fontFamily: "'Montserrat', sans-serif" }}
          >
            {vc.badgeText}
          </span>
        </motion.div>
      )}
    </div>
  );
}
