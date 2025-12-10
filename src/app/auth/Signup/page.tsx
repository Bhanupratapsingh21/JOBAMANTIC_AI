"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";

export default function SignupPage() {
  const { fetchUser } = useUserStore();
  const { user } = useUserStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {

      const name = `${firstName} ${lastName}`.trim();
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const { fetchUser } = useUserStore.getState();
      await fetchUser();

    } catch (err: any) {
      toast.error(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) router.push("/dashboard");
    return
  }, [user])
  return (
    <div className="relative mx-auto min-h-screen px-14 flex bg-gradient-to-r from-red-100 to-purple-100 flex-col items-center justify-center">
      {/* Decorative borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-2xl backdrop-blur-sm dark:border-neutral-800 dark:bg-black/80"
        >
          {/* Header with animated text */}
          <div className="mb-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl font-bold text-neutral-800 dark:text-neutral-200"
            >
              {"Join Us Today"
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
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-2 text-neutral-600 dark:text-neutral-400"
            >
              Sign up to start generating ATS scores for your resumes
            </motion.p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex space-x-4"
            >
              <LabelInputContainer className="flex-1">
                <Label htmlFor="firstname" className="text-neutral-700 dark:text-neutral-300">
                  First name
                </Label>
                <Input
                  id="firstname"
                  placeholder="Tyler"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg border-neutral-300 bg-white/50 py-6 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-neutral-700 dark:bg-neutral-900/50 dark:focus:ring-purple-900"
                />
              </LabelInputContainer>

              <LabelInputContainer className="flex-1">
                <Label htmlFor="lastname" className="text-neutral-700 dark:text-neutral-300">
                  Last name
                </Label>
                <Input
                  id="lastname"
                  placeholder="Durden"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg border-neutral-300 bg-white/50 py-6 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-neutral-700 dark:bg-neutral-900/50 dark:focus:ring-purple-900"
                />
              </LabelInputContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <LabelInputContainer>
                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border-neutral-300 bg-white/50 py-6 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-neutral-700 dark:bg-neutral-900/50 dark:focus:ring-purple-900"
                />
              </LabelInputContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <LabelInputContainer>
                <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border-neutral-300 bg-white/50 py-6 shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-neutral-700 dark:bg-neutral-900/50 dark:focus:ring-purple-900"
                />
              </LabelInputContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full transform rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-md"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      Signing up...
                    </span>
                  ) : (
                    "Start Your Journey 🚀"
                  )}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{" "}
              <a href="/auth/Signin" className="font-semibold text-purple-600 transition-colors hover:text-purple-500">
                Sign in
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("flex w-full flex-col space-y-3", className)}>{children}</div>;