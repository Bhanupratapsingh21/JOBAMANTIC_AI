


"use client";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  AuthButton,
  MobileAuthButton
} from "@/components/Header";
import { FeaturesSection } from "@/components/home/FeatureSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SocialProof } from "@/components/home/SocialProof";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/footer";


export default function Page() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRedirect = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/Signin");
    }
  }

  const navItems = [
    { name: "Home", link: "#" },
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Testimonials", link: "#testimonials" },

  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Custom Navbar Header */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <AuthButton />
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                className="w-full py-3 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 transition-colors text-lg font-medium"
                onClick={closeMobileMenu}
              >
                {item.name}
              </a>
            ))}
            <MobileAuthButton onItemClick={closeMobileMenu} />
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200 dark:border-purple-800"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🚀 Used by 100+ job seekers
              </span>
            </motion.div>

            <h1 className="relative z-10 mx-auto max-w-4xl text-3xl text-slate-800 md:text-5xl py-4 lg:text-7xl dark:text-slate-200">
              {"Get Your Resume Shortlisted  Land Your Dream Job Fast"
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.3, delay: index * 0.08, ease: "easeInOut" }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Start your journey — create, optimize, apply
              <span className="font-semibold text-purple-600"> All in one app. </span>
              No more Resume maintaining chaos. ✨
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={handleRedirect}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-bold text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Analyz Your Current Resume</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => router.push("/resume/create")}
                className="group px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:scale-105"
              >
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Create Resume with AI
                </span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
            >
              {[
                { number: "100+", label: "Resumes Created" },
                { number: "74%", label: "Saves Time" },
                { number: "99%", label: "ATS Pass Rate" },
                { number: "50+", label: "Hired" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* New Sections */}
      <FeaturesSection />
      <HowItWorks />
      <SocialProof />
      <CTASection />
      <Footer />

    </div>
  );
}

/*

"use client";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useUserStore } from "@/store/userStore";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  AuthButton,
  MobileAuthButton
} from "@/components/Header"; // Adjust import path as needed
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function Page() {
  const { user, loading } = useUserStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRedirect = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/Signin");
    }
  }

  const navItems = [
    { name: "Home", link: "#" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "About", link: "#about" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-red-100 to-purple-100 dark:from-red-900/20 dark:to-purple-900/20">
     
      <Navbar>
       
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <AuthButton />
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                className="w-full py-2 text-neutral-600 dark:text-neutral-300"
                onClick={closeMobileMenu}
              >
                {item.name}
              </a>
            ))}
            <MobileAuthButton onItemClick={closeMobileMenu} />
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <div className="relative mx-auto  px-4 sm:px-6 lg:px-14 flex flex-col items-center justify-center pt-20">
     
        <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        </div>

        <div className="py-20 text-center w-full">
          <h1 className="relative z-10 mx-auto max-w-4xl text-3xl text-slate-800 md:text-5xl lg:text-7xl dark:text-slate-200">
            {"Get your resume noticed and land your dream job"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.3, delay: index * 0.08, ease: "easeInOut" }}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="relative z-10 mx-auto mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-400"
          >
            Upload your resume, get AI-powered ATS scoring, and see how fast you can get shortlisted
            by your favorite companies. Job hunting made <span className="font-bold text-purple-500">easy</span> and <span className="font-bold text-purple-500">fun</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={handleRedirect}
              className="w-60 transform rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Try it Now 🚀
            </button>
            <button
              onClick={()=> router.push("/resume/create")}
              className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-black shadow transition-all hover:-translate-y-1 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900"
            >
              Create New
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.4 }}
            className="relative z-10 mt-16 rounded-3xl"
          >
            <ContainerScroll
              titleComponent={
                <>
                  <h1 className="text-4xl font-semibold text-black dark:text-white">
                    Job hunting made easy and fun. <br />
                    <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                      With trainingbasket.in/
                    </span>
                  </h1>
                </>
              }
            >
              <img
                src="https://res.cloudinary.com/djwzwq4cu/image/upload/v1758817040/2b76a600-9e7d-451c-a89a-1a853beb2713.png"
                alt="hero"
                height={720}
                width={1400}
                className="mx-auto rounded-2xl object-cover h-full "
                draggable={false}
              />
            </ContainerScroll>
          </motion.div>


          <div className="h-max flex items-center justify-center mt-12">
            <TextHoverEffect text="trainingbasket.in" />
          </div>
        </div>
      </div>
    </div>
  );
}

*/