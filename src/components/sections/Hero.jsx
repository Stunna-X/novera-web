import { motion } from "framer-motion";

import Container from "../ui/Container";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-44 pb-28">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-5xl text-center"
        >
          <div className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
            Built for African Field Service Businesses 🌍
          </div>

          <h1 className="text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Manage Field Operations
            <br />
            From Dispatch to Completion.
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400">
            Whether you're drilling boreholes, installing solar systems,
            managing construction projects, or coordinating field technicians,
            Novera helps you assign work, monitor crews, track progress,
            and grow your business from one powerful platform.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button>
              Start Free Trial
            </Button>

            <Button variant="secondary">
              Book a Demo
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}