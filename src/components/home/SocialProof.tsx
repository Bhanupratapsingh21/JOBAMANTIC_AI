import { motion } from "motion/react";



export const SocialProof = () => {
    const testimonials = [
        {
            name: "Bhanu Pratap Singh",
            role: "Tech Lead Newral.in",
            content: "After months of job searching, I tried JOBAMANTIC Ai's Resume Builder. Within 2 weeks, I had 5 interviews and landed my dream job with a 30% salary increase!",
            avatar: "👩‍💼"
        },
        {
            name: "Ram Bhardwaj .",
            role: "Software Engineer",
            content: "The ATS optimization made all the difference. My resume went from zero responses to recruiters reaching out daily.",
            avatar: "👨‍💻"
        }
    ];

    const stats = [
        { number: "3X", label: "More Interviews" },
        { number: "74%", label: "Higher Response Rate" },
        { number: "300%", label: "ATS Pass Rate Improvement" },
        { number: "15", label: "Days to Job Offer" }
    ];

    return (
        <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Loved by Job Seekers
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
                        >
                            <div className="flex items-center mb-4">
                                <div className="text-2xl mr-4">{testimonial.avatar}</div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 italic">
                                "{testimonial.content}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};