import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_NAV_LINKS = [
  { name: "Explore", path: "/explore" },
  { name: "Courses", path: "/courses" },
  { name: "Pricing", path: "/pricing" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const STUDENT_NAV_LINKS = [
  { name: "Browse", path: "/courses" },
  { name: "My Learning", path: "/dashboard" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  const navLinks = isAuthenticated ? STUDENT_NAV_LINKS : PUBLIC_NAV_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 mx-auto w-full",
          isScrolled ? "pt-4 px-4 max-w-5xl" : "pt-6 px-6 max-w-7xl"
        )}
      >
        <div 
          className={cn(
            "flex items-center justify-between px-6 transition-all duration-300",
            isScrolled 
              ? "h-14 bg-[#151515]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.3)] rounded-full" 
              : "h-20 bg-transparent rounded-2xl"
          )}
        >
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-background font-bold text-xl leading-none">G</span>
            </div>
            <span className={cn(
              "font-bold text-lg tracking-tight text-primary transition-all duration-300",
              isScrolled ? "hidden sm:block" : "block"
            )}>
              Get Ease
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.path ? "text-primary" : "text-secondary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>


          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-secondary hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-border" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <PrimaryButton size="sm" className="rounded-full h-9 px-5">
                    Get Started
                  </PrimaryButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden pt-28 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-border my-4" />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-secondary">
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-xl font-medium text-secondary text-left cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-secondary">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <PrimaryButton size="lg" className="w-full justify-center rounded-xl">
                      Get Started
                    </PrimaryButton>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
