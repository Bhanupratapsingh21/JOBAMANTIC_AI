// components/sections/HowItWorks.tsx
import { motion } from "motion/react";

export const HowItWorks = () => {
    return (
        <section
            id="how-it-works"
            className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50"
        >
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Create. Check. Share. Your perfect resume in just 3 simple steps. 🚀
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                    {[
                        {
                            step: "01",
                            title: "Create or Upload",
                            description:
                                "Start fresh with our AI builder or upload your existing resume to upgrade it instantly.",
                            emoji: "📝",
                        },
                        {
                            step: "02",
                            title: "Check ATS Score",
                            description:
                                "Let AI analyze your resume and job description — get real-time ATS insights and keyword matches.",
                            emoji: "🎯",
                        },
                        {
                            step: "03",
                            title: "Download or Share",
                            description:
                                "Download your optimized resume or share it directly with recruiters — all in one click.",
                            emoji: "⚡",
                        },
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative text-center group"
                        >
                            {/* Connecting Line */}
                            {index < 2 && (
                                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent z-0"></div>
                            )}

                            <div className="relative z-10">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                                    <span className="text-3xl">{step.emoji}</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-purple-600 border border-purple-200 dark:border-purple-800">
                                    {step.step}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
