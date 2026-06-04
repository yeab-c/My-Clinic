// landing page

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ShieldCheck,
  UserRound,
  Sparkles,
  Stethoscope,
} from "lucide-react";

// datas 
const services = [
  {
    id: 1,
    name: "General Consultation",
    description: "Routine checkups and primary care visits with experienced physicians.",
    duration: 30,
    price: 500,
    icon: UserRound,
  },
  {
    id: 2,
    name: "Dental Checkup",
    description: "Comprehensive dental exams, cleaning, and preventive care.",
    duration: 30,
    price: 800,
    icon: Sparkles,
  },
  {
    id: 3,
    name: "Specialist Consultation",
    description: "In-depth consultations with specialist physicians for complex conditions.",
    duration: 30,
    price: 1200,
    icon: Stethoscope,
  },
];

const testimonials = [
  {
    quote: "Booking my appointment took less than two minutes. The doctor was thorough and the whole experience felt effortless.",
    author: "Selam T.",
    role: "Patient since 2023",
  },
  {
    quote: "I was skeptical at first but MyClinic completely changed how I think about going to the doctor. Clean, simple, professional.",
    author: "Dawit M.",
    role: "Patient since 2022",
  },
  {
    quote: "From booking to follow-up, everything was smooth. My cardiologist explained everything clearly and I never felt rushed.",
    author: "Hana B.",
    role: "Patient since 2024",
  },
];

const whyItems = [
  { icon: UserRound,    title: "Experienced doctors",  body: "Hand-picked specialists with years of clinical practice and proven patient outcomes." },
  { icon: CalendarCheck, title: "Easy scheduling",     body: "Find a slot, confirm, and add it to your calendar in under a minute." },
  { icon: ShieldCheck,  title: "Secure records",       body: "Your medical history, secured and available only to you." },
];

const steps = [
  "Choose a service",
  "Select your doctor",
  "Pick a date and time",
  "Confirm appointment",
];

// Page (combining all sections)
export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Services />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

// Hero section
function Hero() {
  const imgRef = useRef(null);

  useEffect(() => {
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!imgRef.current) return;
        imgRef.current.style.transform = `translateY(${window.scrollY * 0.1}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-120 w-120 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-10%] h-105 w-105 rounded-full bg-accent/40 blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Left */}
        <div>
          <h1 className="text-5xl font-semibold leading-[1.05] text-foreground md:text-7xl">
            Healthcare that respects your time.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Book consultations in under a minute. Keep your records close. MyClinic is a calm, modern way to care for the people who matter, including yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/portal/book">
                Book appointment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
            <Stat label="Sessions"   value="30 min"   />
            <Stat label="Specialists" value="3"      />
            <Stat label="Rating"      value="4.9 / 5" />
          </div>
        </div>

        {/* Right - hero image */}
        <div className="relative hidden justify-center lg:flex">
          <div
            ref={imgRef}
            className="transition-transform duration-75 ease-linear will-change-transform"
          >
            <Image
              src="/hero.png"
              alt="Doctor at MyClinic"
              width={480}
              height={580}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

// Services section
function Services() {
  return (
    <section id="services" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Services"
          title="Care for every chapter of life."
          description="Transparent pricing. 30-minute focused visits. No upsells."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.duration} min
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">From</div>
                  <div className="text-3xl font-semibold">ETB {s.price}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href="/portal/book">Book now</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why us - section
function WhyUs() {
  return (
    <section id="why" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Why MyClinic"
          title="A clinic that feels like it was built for you."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {whyItems.map((it) => (
            <div
              key={it.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-semibold">{it.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works - section
function HowItWorks() {
  return (
    <section id="how" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="How it works"
          title="Four calm steps. Zero confusion."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary">
                  {i + 1}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <p className="mt-6 text-2xl font-semibold">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Testimonials - section
function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Patients"
          title="Loved by the people we care for."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-7"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <blockquote className="mt-4 text-2xl font-semibold leading-snug">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{t.author}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA - section
function CTA() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-10 text-primary-foreground md:p-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Stethoscope className="h-6 w-6 opacity-80" />
              <h3 className="mt-4 max-w-xl text-4xl font-semibold md:text-5xl">
                Your next appointment is one tap away.
              </h3>
            </div>
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link href="/portal/book">
                Book now <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Shared headwer
function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </div>
        <h2 className="mt-3 max-w-2xl text-4xl font-semibold md:text-5xl">{title}</h2>
      </div>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}