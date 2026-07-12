import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef<any>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate("/admin");
    } else {
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        navigate("/");
      }, 400); // 400ms window for triple click
    }
  };

  return (
    <footer className="border-t border-border bg-background pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-xl leading-none">G</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-primary">Get Ease</span>
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Learn Smarter. Build Faster. Achieve More. The premium educational experience.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-primary mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-sm text-secondary hover:text-primary transition-colors">Explore Courses</Link></li>
              <li><Link to="/pricing" className="text-sm text-secondary hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/instructors" className="text-sm text-secondary hover:text-primary transition-colors">Instructors</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-primary mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-secondary hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-secondary hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-sm text-secondary hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/faq" className="text-sm text-secondary hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
          <p className="text-xs text-secondary mb-4 md:mb-0">
            © {new Date().getFullYear()} Get Ease. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
