// app/page.tsx
"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Calculator,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Gauge,
  BadgeDollarSign,
  Sparkles,
  HelpCircle,
  Lock,
  Wallet,
} from "lucide-react";

export default function Page() {
  const reduceMotion = useReducedMotion();

  const COLORS = {
    primary: "#0F2A36", // azul petróleo
    secondary: "#D6CBBF", // arena técnico
    base: "#F5F6F7", // gris muy claro
    text: "#1F1F1F", // gris carbón
    positive: "#2E7D5B", // verde sobrio
    risk: "#B23A3A", // rojo controlado
    warning: "#C88A1A", // ámbar técnico
    primaryHover: "#0B1F28",
  };

  const container = "mx-auto w-full max-w-6xl px-4";

  const v = {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.08,
          delayChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0 : 0.35 },
      },
    },
  };

  const cardBase = "rounded-2xl border bg-white shadow-sm border-black/10";
  const iconWrap =
    "grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-white";

  // FAQ data inline (sin modularizar)
  const FAQS: Array<{ q: string; a: string }> = [
    {
      q: "¿Cómo creo mi cuenta si no hay registro?",
      a: "Solo entras con Google. En el primer inicio de sesión se crea tu cuenta automáticamente.",
    },
    {
      q: "¿Cuánto cuesta Limar?",
      a: "199 MXN al mes. Un solo plan: sencillo, directo y sin letras chiquitas.",
    },
    {
      q: "¿Para quién es?",
      a: "Para microprestamistas en México que quieren orden, control y criterios claros para renovar o detener préstamos.",
    },
    {
      q: "¿Limar presta dinero o es una financiera?",
      a: "No. Limar es un sistema de control de cartera. No presta dinero, no capta, no es banco ni institución financiera.",
    },
    {
      q: "¿Puedo usarlo desde el celular?",
      a: "Sí. La interfaz es responsive para operar desde móvil o computadora.",
    },
    {
      q: "¿Qué pasa si un cliente se atrasa?",
      a: "Tu cartera refleja el atraso y sus efectos (por ejemplo interés y multa, según tu operación). La idea es que tengas señales claras para actuar a tiempo.",
    },
  ];

  return (
    <div
      className="min-h-dvh"
      style={{ background: COLORS.base, color: COLORS.text }}
    >
      <Head>
        <title>Limar | Manejo de préstamos para microprestamistas (MX)</title>
        <meta
          name="description"
          content="Limar ayuda a microprestamistas en México a llevar su cartera con orden: cálculos, riesgo progresivo y criterios claros para renovación. Plan único: 199 MXN/mes."
        />
        <meta name="robots" content="index,follow" />
        {/* Si tienes dominio final, cambia este canonical */}
        <link rel="canonical" href="https://limar-eta.vercel.app/" />

        {/* Open Graph básico */}
        <meta
          property="og:title"
          content="Limar | Orden, control y criterio para tu cartera"
        />
        <meta
          property="og:description"
          content="Cartera con orden. Cálculos automáticos. Riesgo progresivo. Decisión clara. 199 MXN/mes."
        />
        <meta property="og:type" content="website" />
      </Head>

      {/* NAV */}
      <header
        className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className={container}>
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Limar - Manejo de préstamos para microprestamistas"
                  width={36}
                  height={36}
                  priority
                  className="h-9 w-auto"
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Limar</p>
                <p className="text-xs text-black/60">
                  Orden • Control • Criterio
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a
                className="text-sm text-black/70 hover:text-black"
                href="#producto"
              >
                Producto
              </a>
              <a
                className="text-sm text-black/70 hover:text-black"
                href="#criterio"
              >
                Criterio
              </a>
              <a
                className="text-sm text-black/70 hover:text-black"
                href="#precio"
              >
                Precio
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#faq">
                FAQ
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#cta">
                Empezar
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                style={{ background: COLORS.primary }}
              >
                Empezar con Google
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="pt-10 md:pt-14">
          <div className={container}>
            <motion.div
              variants={v.container}
              initial="hidden"
              animate="show"
              className="grid gap-8 md:grid-cols-2 md:items-start"
            >
              <motion.div variants={v.item}>
                <div
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium"
                  style={{ borderColor: COLORS.secondary }}
                >
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: COLORS.primary }}
                  />
                  Microprestamistas (MX)
                </div>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                  Menos intuición.
                  <br />
                  Más control.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-black/70">
                  Cartera con orden. Cálculos automáticos. Riesgo progresivo.
                  Decisión clara.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div
                    className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <BadgeDollarSign
                      className="h-4 w-4"
                      style={{ color: COLORS.primary }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      199 MXN/mes
                    </span>
                    <span className="text-black/60">plan único</span>
                  </div>

                  <div
                    className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <Lock
                      className="h-4 w-4"
                      style={{ color: COLORS.primary }}
                    />
                    <span className="text-black/70">Acceso con Google</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                    style={{ background: COLORS.primary }}
                  >
                    Entrar con Google
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#producto"
                    className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                    style={{
                      borderColor: COLORS.primary,
                      color: COLORS.primary,
                    }}
                  >
                    Ver cómo se ve
                  </a>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className={`${cardBase} p-4`}>
                    <p className="text-xs text-black/60">Automático</p>
                    <p className="mt-1 text-sm font-semibold">
                      Interés + multa
                    </p>
                  </div>
                  <div className={`${cardBase} p-4`}>
                    <p className="text-xs text-black/60">Progresivo</p>
                    <p className="mt-1 text-sm font-semibold">Riesgo</p>
                  </div>
                  <div className={`${cardBase} p-4`}>
                    <p className="text-xs text-black/60">Determinístico</p>
                    <p className="mt-1 text-sm font-semibold">Renovación</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-black/50">
                  No prestamos dinero. Limar solo te ayuda a llevar control de
                  tu cartera.
                </p>
              </motion.div>

              {/* Preview */}
              <motion.div
                variants={v.item}
                id="producto"
                className={`${cardBase} p-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Tablero</p>
                    <p className="mt-1 text-xs text-black/60">
                      Ejemplo (visual)
                    </p>
                  </div>
                  <span
                    className="rounded-lg px-2 py-1 text-xs font-medium"
                    style={{
                      background: COLORS.secondary,
                      color: COLORS.primary,
                    }}
                  >
                    Hoy
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-black/60">Vigente</p>
                      <CheckCircle2
                        className="h-4 w-4"
                        style={{ color: COLORS.positive }}
                      />
                    </div>
                    <p className="mt-2 text-lg font-semibold">$128,450</p>
                    <p className="mt-1 text-xs text-black/60">OK</p>
                  </motion.div>

                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-black/60">Por vencer</p>
                      <AlertTriangle
                        className="h-4 w-4"
                        style={{ color: COLORS.warning }}
                      />
                    </div>
                    <p className="mt-2 text-lg font-semibold">$23,900</p>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: COLORS.warning }}
                    >
                      7 días
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-black/60">Atraso</p>
                      <XCircle
                        className="h-4 w-4"
                        style={{ color: COLORS.risk }}
                      />
                    </div>
                    <p className="mt-2 text-lg font-semibold">$9,120</p>
                    <p className="mt-1 text-xs" style={{ color: COLORS.risk }}>
                      Acción
                    </p>
                  </motion.div>
                </div>

                <div
                  className="mt-5 rounded-2xl border p-4"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Conclusión</p>
                    <p className="text-xs text-black/60">explicable</p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #204</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: COLORS.positive }}
                      >
                        Aumentar
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #118</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: COLORS.warning }}
                      >
                        Mantener
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #055</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: COLORS.risk }}
                      >
                        No renovar
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-black/50">
                  Sin “humo” de IA: reglas claras.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* VALUE */}
        <section className="mt-12 md:mt-16">
          <div className={container}>
            <motion.div
              variants={v.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="grid gap-4 md:grid-cols-3"
            >
              {[
                {
                  icon: (
                    <Calculator
                      className="h-5 w-5"
                      style={{ color: COLORS.primary }}
                    />
                  ),
                  title: "Cálculo automático",
                  desc: "Interés y multa.",
                },
                {
                  icon: (
                    <Gauge
                      className="h-5 w-5"
                      style={{ color: COLORS.primary }}
                    />
                  ),
                  title: "Riesgo progresivo",
                  desc: "Señales por conducta.",
                },
                {
                  icon: (
                    <ShieldCheck
                      className="h-5 w-5"
                      style={{ color: COLORS.primary }}
                    />
                  ),
                  title: "Control del capital",
                  desc: "Decisión a tiempo.",
                },
              ].map((x) => (
                <motion.div
                  key={x.title}
                  variants={v.item}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  className={`${cardBase} p-6`}
                >
                  <div className="flex items-center gap-3">
                    <div className={iconWrap}>{x.icon}</div>
                    <p className="text-sm font-semibold">{x.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-black/70">{x.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CRITERIO */}
        <section id="criterio" className="mt-12 md:mt-16">
          <div className={container}>
            <div className={`${cardBase} p-8`}>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-medium text-black/60">Criterio</p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Renovar con reglas
                  </h2>
                </div>
                <Link
                  href="/login"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28] md:mt-0"
                  style={{ background: COLORS.primary }}
                >
                  Empezar con Google
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className="h-4 w-4"
                      style={{ color: COLORS.positive }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: COLORS.positive }}
                    >
                      Aumentar
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/60">
                    Puntualidad constante.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: COLORS.positive }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: COLORS.positive }}
                    >
                      Mantener
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/60">Estable.</p>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className="h-4 w-4"
                      style={{ color: COLORS.warning }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: COLORS.warning }}
                    >
                      Reducir
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/60">Señales mixtas.</p>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <div className="flex items-center gap-2">
                    <XCircle
                      className="h-4 w-4"
                      style={{ color: COLORS.risk }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: COLORS.risk }}
                    >
                      No renovar
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-black/60">Riesgo alto.</p>
                </motion.div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  {
                    icon: (
                      <Wallet
                        className="h-5 w-5"
                        style={{ color: COLORS.primary }}
                      />
                    ),
                    title: "Cuentas claras",
                    desc: "Sin discusiones.",
                  },
                  {
                    icon: (
                      <AlertTriangle
                        className="h-5 w-5"
                        style={{ color: COLORS.warning }}
                      />
                    ),
                    title: "Prevención",
                    desc: "Antes del atraso.",
                  },
                  {
                    icon: (
                      <ShieldCheck
                        className="h-5 w-5"
                        style={{ color: COLORS.primary }}
                      />
                    ),
                    title: "Protección",
                    desc: "Capital primero.",
                  },
                ].map((x) => (
                  <motion.div
                    key={x.title}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={iconWrap}>{x.icon}</div>
                      <p className="text-sm font-semibold">{x.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-black/70">{x.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRECIO */}
        <section id="precio" className="mt-12 md:mt-16">
          <div className={container}>
            <div className={`${cardBase} p-8`}>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-medium text-black/60">Precio</p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Simple: un solo plan
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    Para microprestamistas que quieren control sin complicarse.
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <div
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <p className="text-xs text-black/60">Limar mensual</p>
                    <p
                      className="mt-1 text-3xl font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      199
                      <span className="ml-1 text-sm font-semibold text-black/60">
                        MXN/mes
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-black/50">
                      Cobro recurrente. Cancela cuando quieras.
                    </p>
                    <Link
                      href="/login"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                      style={{ background: COLORS.primary }}
                    >
                      Empezar con Google
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  {
                    icon: (
                      <Calculator
                        className="h-5 w-5"
                        style={{ color: COLORS.primary }}
                      />
                    ),
                    title: "Cálculos",
                    desc: "Interés y multa reflejados en tu operación.",
                  },
                  {
                    icon: (
                      <Gauge
                        className="h-5 w-5"
                        style={{ color: COLORS.primary }}
                      />
                    ),
                    title: "Riesgo",
                    desc: "Señales para actuar antes de que se te vaya la cartera.",
                  },
                  {
                    icon: (
                      <ShieldCheck
                        className="h-5 w-5"
                        style={{ color: COLORS.primary }}
                      />
                    ),
                    title: "Criterio",
                    desc: "Conclusiones claras para renovar o detener.",
                  },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={iconWrap}>{x.icon}</div>
                      <p className="text-sm font-semibold">{x.title}</p>
                    </div>
                    <p className="mt-3 text-sm text-black/70">{x.desc}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs text-black/50">
                Consejo de conversión: el precio se muestra antes del final para
                filtrar y aumentar intención real.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-12 md:mt-16">
          <div className={container}>
            <div className={`${cardBase} p-8`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-black/60">FAQ</p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Preguntas frecuentes
                  </h2>
                  <p className="mt-2 text-sm text-black/70">
                    Respuestas rápidas, sin rodeos.
                  </p>
                </div>
                <div className={`${iconWrap}`}>
                  <HelpCircle
                    className="h-5 w-5"
                    style={{ color: COLORS.primary }}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {FAQS.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-2xl border bg-white p-5"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <p className="text-sm font-semibold">{f.q}</p>
                    <p className="mt-2 text-sm text-black/70">{f.a}</p>
                  </div>
                ))}
              </div>

              {/* <p className="mt-6 text-xs text-black/50">
                Nota: si después quieres SEO serio, estas FAQs se pueden
                reflejar en Schema FAQ (en layout/server) para mejorar snippets.
              </p> */}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mt-12 pb-16 md:mt-16 md:pb-24">
          <div className={container}>
            <div className={`${cardBase} p-8`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium text-black/60">Listo</p>
                  <p className="mt-1 text-xl font-semibold">
                    Operación con criterio.
                  </p>
                  <p className="mt-2 text-sm text-black/70">
                    Entra con Google y empieza hoy. Plan único:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      199 MXN/mes
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                    style={{ background: COLORS.primary }}
                  >
                    Empezar con Google
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#faq"
                    className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                    style={{
                      borderColor: COLORS.primary,
                      color: COLORS.primary,
                    }}
                  >
                    Ver FAQs
                  </a>
                </div>
              </div>

              <footer
                className="mt-8 border-t pt-6"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-black/50">
                    © {new Date().getFullYear()} Limar.
                  </p>
                  <p className="text-xs text-black/50">
                    Made by{" "}
                    <a
                      href="https://agsolutions.dev"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                      style={{ color: COLORS.primary }}
                    >
                      agsolutions.dev
                    </a>
                  </p>
                </div>

                <p className="mt-4 text-xs text-black/50">
                  Limar no es institución financiera. No otorga préstamos. Es
                  una herramienta de control de cartera.
                </p>
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
