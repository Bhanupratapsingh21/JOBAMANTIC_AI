import { motion } from "motion/react";

export const FeaturesSection = () => {


    // Icons for features
    const FeatureIcons = {
        resume: "🎨",
        ats: "📊",
        apply: "⚡",
        track: "📈",
        ai: "🤖",
        match: "🎯"
    };


    return (
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl h-20 font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                        Everything You Need
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Stop switching between 10 different apps. We've got your entire job search covered.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: FeatureIcons.resume,
                            title: "Create Your Resume",
                            description: "Build a stunning, ATS-friendly resume with our smart AI templates — no design skills needed.",
                            color: "from-purple-500 to-pink-500"
                        },
                        {
                            icon: FeatureIcons.ats,
                            title: "Check ATS Score",
                            description: "Instantly analyze your resume for ATS compatibility and get insights to improve your chances.",
                            color: "from-blue-500 to-cyan-500"
                        },
                        {
                            icon: FeatureIcons.track,
                            title: "Download or Share",
                            description: "Download your polished resume or share it directly with recruiters — all in one click.",
                            color: "from-green-500 to-teal-500"
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl hover:scale-105"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </p>

                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center my-24"
                >
                    <h2 className="text-4xl md:text-6xl h-20 font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                        Your Other Needs (Coming Soon)
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Our Team is Working To Get you More Futures ASAP
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: FeatureIcons.apply,
                            title: "1-Click Apply",
                            description: "Apply to jobs directly from our platform with auto-filled applications.",
                            color: "from-green-500 to-teal-500"
                        },
                        {
                            icon: FeatureIcons.track,
                            title: "Application Tracker ",
                            description: "Track every application, interview, and follow-up in one beautiful dashboard.",
                            color: "from-orange-500 to-red-500"
                        },
                        {
                            icon: FeatureIcons.ai,
                            title: "AI Cover Letters",
                            description: "Generate personalized cover letters that actually get read by recruiters.",
                            color: "from-pink-500 to-rose-500"
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-2xl hover:scale-105"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </p>

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};