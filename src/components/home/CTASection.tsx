import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";


// components/sections/CTASection.tsx
export const CTASection = () => {
  const router = useRouter();
  const { user } = useUserStore();


  const handleRedirect = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/Signin");
    }
  }

  return (
   
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-3xl mx-4 mb-8">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Job Search?
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Join 1000+ job seekers who got hired faster. Your dream job is waiting. ✨
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleRedirect}
                className="px-12 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl hover:shadow-white/25"
              >
                Start Free Today 🚀
              </button>

              <button
                onClick={() => router.push("/resume/create")}
                className="px-12 py-4 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Create Resume Now ✨
              </button>
            </motion.div>

         
          </motion.div>
        </div>
      </section>
  );
};