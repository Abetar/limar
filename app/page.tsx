// app/page.tsx
import Link from "next/link";

export default function Page() {
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

  return (
    <div className="min-h-dvh" style={{ background: COLORS.base, color: COLORS.text }}>
      {/* NAV */}
      <header
        className="sticky top-0 z-40 border-b bg-white"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className={container}>
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{ background: COLORS.primary }}
                aria-hidden="true"
              >
                <span className="text-sm font-bold">L</span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  Limar
                </p>
                <p className="text-xs text-black/60">Orden, control y criterio</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a className="text-sm text-black/70 hover:text-black" href="#como-funciona">
                Cómo funciona
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#criterio">
                Criterio de renovación
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#beneficios">
                Beneficios
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#faq">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ background: COLORS.primary }}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="pt-10 md:pt-14">
          <div className={container}>
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium"
                  style={{ borderColor: COLORS.secondary }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.primary }} />
                  Diseñado para microprestamistas en México
                </div>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl" style={{ color: COLORS.text }}>
                  Menos intuición.
                  <br />
                  Más claridad.
                  <br />
                  Más control sobre tu capital.
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-black/70">
                  <span className="font-semibold" style={{ color: COLORS.text }}>
                    Limar
                  </span>{" "}
                  es un sistema profesional para llevar tu cartera con{" "}
                  <span className="font-semibold" style={{ color: COLORS.text }}>
                    orden, control y criterio
                  </span>
                  . Gestiona préstamos, calcula{" "}
                  <span className="font-semibold" style={{ color: COLORS.text }}>
                    intereses y multas automáticamente
                  </span>
                  , detecta{" "}
                  <span className="font-semibold" style={{ color: COLORS.text }}>
                    riesgos progresivos
                  </span>{" "}
                  y te ayuda a decidir cuándo{" "}
                  <span className="font-semibold" style={{ color: COLORS.text }}>
                    renovar, reducir o detener
                  </span>{" "}
                  un crédito.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                    style={{ background: COLORS.primary }}
                  >
                    Probar con mi cartera
                  </Link>

                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  >
                    Ver ejemplo realista
                  </a>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <p className="text-xs font-medium text-black/60">Automático</p>
                    <p className="mt-2 text-sm font-semibold" style={{ color: COLORS.text }}>
                      Intereses y multas
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black/60">Consistente, sin errores manuales.</p>
                  </div>

                  <div
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <p className="text-xs font-medium text-black/60">Progresivo</p>
                    <p className="mt-2 text-sm font-semibold" style={{ color: COLORS.text }}>
                      Riesgo por conducta
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black/60">No por una sola falta.</p>
                  </div>

                  <div
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <p className="text-xs font-medium text-black/60">Determinístico</p>
                    <p className="mt-2 text-sm font-semibold" style={{ color: COLORS.text }}>
                      Conclusión de renovación
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black/60">Reglas claras, explicables.</p>
                  </div>
                </div>

                <p className="mt-6 text-xs text-black/50">
                  Sin gradientes. Sin neón. Sin “fintech flashy”. Solo operación clara.
                </p>
              </div>

              {/* DEMO / PREVIEW */}
              <div
                id="demo"
                className="rounded-2xl border bg-white p-6 shadow-sm"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                      Vista de cartera (ejemplo)
                    </p>
                    <p className="mt-1 text-xs text-black/60">
                      Lo importante: quién está bien, quién se está desviando y quién ya es riesgo real.
                    </p>
                  </div>
                  <span
                    className="rounded-lg px-2 py-1 text-xs font-medium"
                    style={{ background: COLORS.secondary, color: COLORS.primary }}
                  >
                    Hoy
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-medium text-black/60">Capital vigente</p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
                      $128,450
                    </p>
                    <p className="mt-1 text-xs text-black/60">Al corriente</p>
                  </div>

                  <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-medium text-black/60">Por vencer</p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
                      $23,900
                    </p>
                    <p className="mt-1 text-xs" style={{ color: COLORS.warning }}>
                      Próx. 7 días
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-medium text-black/60">En atraso</p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
                      $9,120
                    </p>
                    <p className="mt-1 text-xs" style={{ color: COLORS.risk }}>
                      Acción requerida
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                      Señales de riesgo (progresivo)
                    </p>
                    <p className="text-xs text-black/60">sube/baja por comportamiento</p>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div
                      className="flex items-start justify-between gap-4 rounded-xl border bg-white p-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <div>
                        <p className="text-sm font-semibold">Cliente #204</p>
                        <p className="text-xs text-black/60">
                          Pagos puntuales · Sin “promesas” · Historial estable
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: COLORS.positive, color: COLORS.positive }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.positive }} />
                        Cumple
                      </span>
                    </div>

                    <div
                      className="flex items-start justify-between gap-4 rounded-xl border bg-white p-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <div>
                        <p className="text-sm font-semibold">Cliente #118</p>
                        <p className="text-xs text-black/60">Vence pronto · Pagos mixtos · Requiere seguimiento</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: COLORS.warning, color: COLORS.warning }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.warning }} />
                        Atención
                      </span>
                    </div>

                    <div
                      className="flex items-start justify-between gap-4 rounded-xl border bg-white p-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <div>
                        <p className="text-sm font-semibold">Cliente #055</p>
                        <p className="text-xs text-black/60">Atraso recurrente · Promesa sin pago · Riesgo alto</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                        style={{ borderColor: COLORS.risk, color: COLORS.risk }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.risk }} />
                        Riesgo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                    Conclusión sugerida (explicable)
                  </p>

                  <div className="mt-3 grid gap-2">
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #204</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.positive }}>
                        Aumentar
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #118</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.warning }}>
                        Mantener
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <span className="text-sm font-medium">Cliente #055</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.risk }}>
                        No renovar
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-black/50">
                    * Ejemplo para ilustrar lógica. La app define reglas según tu operación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section className="mt-14 md:mt-20">
          <div className={container}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <p className="text-xs font-semibold" style={{ color: COLORS.risk }}>
                  Sin Limar (lo común)
                </p>
                <h2 className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
                  Renovaciones por costumbre.
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-black/70">
                  <li>• Excel/WhatsApp: información dispersa y decisiones “al tanteo”.</li>
                  <li>• Multas/intereses inconsistentes: discusiones y pérdidas.</li>
                  <li>• Atrasos que se normalizan: el riesgo se detecta tarde.</li>
                  <li>• Capital expuesto: sigues prestando donde ya no conviene.</li>
                </ul>
              </div>

              <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <p className="text-xs font-semibold" style={{ color: COLORS.positive }}>
                  Con Limar (operación con criterio)
                </p>
                <h2 className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
                  Reglas claras. Decisiones explicables.
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-black/70">
                  <li>• Cartera ordenada: saldo, pagos, vencimientos y atrasos en un solo lugar.</li>
                  <li>• Cálculos automáticos: intereses y multas siempre iguales para todos.</li>
                  <li>• Riesgo progresivo: señales que suben/bajan por conducta real.</li>
                  <li>• Conclusión: renovar, reducir o detener con base en datos.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="mt-14 md:mt-20">
          <div className={container}>
            <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                    Cómo funciona
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                    No es “un CRM”. Es un sistema de cartera con criterio: registrar → cobrar → evaluar → decidir.
                  </p>
                </div>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                  style={{ background: COLORS.primary }}
                >
                  Empezar
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {[
                  { step: "Paso 1", title: "Crea el préstamo", desc: "Condiciones y fechas desde el inicio. Sin ambigüedad." },
                  { step: "Paso 2", title: "Registra pagos", desc: "Pagos parciales o completos actualizan saldo y estado." },
                  { step: "Paso 3", title: "Detecta riesgo", desc: "Riesgo progresivo según atrasos, promesas y patrón." },
                  { step: "Paso 4", title: "Decide renovación", desc: "Renovar, reducir o detener: regla clara y justificable." },
                ].map((x) => (
                  <div key={x.step} className="rounded-2xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-medium text-black/60">{x.step}</p>
                    <p className="mt-2 font-semibold" style={{ color: COLORS.text }}>
                      {x.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/70">{x.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border p-6" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fff" }}>
                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                  Riesgo progresivo (idea)
                </p>
                <p className="mt-1 text-xs text-black/60">
                  Señales pequeñas no te obligan a cortar; señales repetidas sí.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-semibold" style={{ color: COLORS.positive }}>
                      Bajo
                    </p>
                    <p className="mt-2 text-sm font-semibold">Cumple</p>
                    <p className="mt-1 text-xs text-black/60">Puntualidad + constancia</p>
                  </div>

                  <div className="rounded-xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-semibold" style={{ color: COLORS.warning }}>
                      Medio
                    </p>
                    <p className="mt-2 text-sm font-semibold">Se desvía</p>
                    <p className="mt-1 text-xs text-black/60">Retrasos leves / patrón mixto</p>
                  </div>

                  <div className="rounded-xl border p-4" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-xs font-semibold" style={{ color: COLORS.risk }}>
                      Alto
                    </p>
                    <p className="mt-2 text-sm font-semibold">Ya es pérdida en proceso</p>
                    <p className="mt-1 text-xs text-black/60">Atraso recurrente / promesa sin pago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CRITERIO */}
        <section id="criterio" className="mt-14 md:mt-20">
          <div className={container}>
            <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                Criterio de renovación
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
                La recomendación no es “mágica”. Es una conclusión determinística con reglas que se pueden explicar.
              </p>

              <div className="mt-6 overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-white">
                    <tr className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <th className="px-5 py-4 text-xs font-semibold text-black/60">Conclusión</th>
                      <th className="px-5 py-4 text-xs font-semibold text-black/60">Cuándo aplica</th>
                      <th className="px-5 py-4 text-xs font-semibold text-black/60">Qué proteges</th>
                      <th className="px-5 py-4 text-xs font-semibold text-black/60">Señal visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <td className="px-5 py-4 font-semibold" style={{ color: COLORS.positive }}>
                        Aumentar
                      </td>
                      <td className="px-5 py-4 text-black/70">Puntualidad consistente + comportamiento estable.</td>
                      <td className="px-5 py-4 text-black/70">Crecimiento sano del capital.</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: COLORS.positive, color: COLORS.positive }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.positive }} />
                          Verde
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <td className="px-5 py-4 font-semibold" style={{ color: COLORS.positive }}>
                        Mantener
                      </td>
                      <td className="px-5 py-4 text-black/70">Cliente estable pero sin margen para aumentar.</td>
                      <td className="px-5 py-4 text-black/70">Estabilidad sin riesgo extra.</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: COLORS.positive, color: COLORS.positive }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.positive }} />
                          Verde
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                      <td className="px-5 py-4 font-semibold" style={{ color: COLORS.warning }}>
                        Reducir
                      </td>
                      <td className="px-5 py-4 text-black/70">Señales mixtas: retrasos leves, patrón irregular.</td>
                      <td className="px-5 py-4 text-black/70">Reducir exposición antes de que escale.</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: COLORS.warning, color: COLORS.warning }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.warning }} />
                          Ámbar
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-5 py-4 font-semibold" style={{ color: COLORS.risk }}>
                        No renovar
                      </td>
                      <td className="px-5 py-4 text-black/70">Atraso recurrente, promesas sin pago, riesgo alto.</td>
                      <td className="px-5 py-4 text-black/70">Cortar pérdidas y proteger capital.</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: COLORS.risk, color: COLORS.risk }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.risk }} />
                          Rojo
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-black/50">
                La tabla es ilustrativa. Limar adapta criterios a tu operación sin volverlo confuso.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section id="beneficios" className="mt-14 md:mt-20">
          <div className={container}>
            <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
              Beneficios reales (no “features” genéricas)
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
              Esto es lo que cambia en la práctica cuando operas con reglas claras.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Evitas renovaciones malas",
                  desc: "Cuando el comportamiento ya te está diciendo que no conviene, Limar te lo hace visible a tiempo.",
                },
                {
                  title: "Cuentas claras con el cliente",
                  desc: "Intereses y multas consistentes: reduces discusiones y recuperas autoridad operativa.",
                },
                {
                  title: "Priorizas cobranza con foco",
                  desc: "No persigues todo: atiendes lo que realmente pone en riesgo tu capital.",
                },
                {
                  title: "Orden operativo",
                  desc: "Saldo, pagos, fechas y estados siempre en el mismo lugar. Menos caos, menos errores.",
                },
                {
                  title: "Control del riesgo (progresivo)",
                  desc: "No reaccionas tarde. El riesgo sube por patrón y te da margen para actuar antes.",
                },
                {
                  title: "Decisiones explicables",
                  desc: "La conclusión se puede justificar: a tu equipo, a tu socio o a ti mismo.",
                },
              ].map((x) => (
                <div
                  key={x.title}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <p className="text-base font-semibold" style={{ color: COLORS.text }}>
                    {x.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/70">{x.desc}</p>
                </div>
              ))}
            </div>

            <div
              className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                    ¿Listo para operar con criterio?
                  </p>
                  <p className="mt-1 text-sm text-black/70">Empieza con tu cartera hoy y deja de depender de intuición.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F28]"
                    style={{ background: COLORS.primary }}
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold"
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ + FOOTER */}
        <section id="faq" className="mt-14 pb-16 md:mt-20 md:pb-24">
          <div className={container}>
            <div className="rounded-2xl border bg-white p-8 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                Preguntas frecuentes
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    q: "¿Limar es para prestamistas pequeños o para equipos?",
                    a: "Para ambos. El enfoque es operación clara: cartera, riesgo y conclusión. Si trabajas con equipo, se puede escalar a roles/permisos.",
                  },
                  {
                    q: "¿Cómo calcula intereses y multas?",
                    a: "De forma automática y consistente según reglas definidas. El objetivo es evitar cálculos manuales y mantener criterio parejo.",
                  },
                  {
                    q: "¿Qué significa “riesgo progresivo”?",
                    a: "Que el riesgo no depende de un evento aislado: se ajusta por patrón de comportamiento (repetición, puntualidad, promesas sin pago, etc.).",
                  },
                  {
                    q: "¿La recomendación de renovación es “IA”?",
                    a: "No necesitas humo. La recomendación es determinística (reglas claras) para que sea explicable y confiable.",
                  },
                ].map((x) => (
                  <div key={x.q} className="rounded-2xl border p-6" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                      {x.q}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/70">{x.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-10 border-t pt-8" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-xl text-white"
                    style={{ background: COLORS.primary }}
                    aria-hidden="true"
                  >
                    <span className="text-sm font-bold">L</span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">Limar</p>
                    <p className="text-xs text-black/60">Menos intuición. Más control.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-black/70">
                  <a className="hover:underline" href="#como-funciona">
                    Cómo funciona
                  </a>
                  <a className="hover:underline" href="#criterio">
                    Criterio
                  </a>
                  <a className="hover:underline" href="#beneficios">
                    Beneficios
                  </a>
                  <Link className="hover:underline" href="/login">
                    Iniciar sesión
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-black/50">
                  © {new Date().getFullYear()} Limar. Todos los derechos reservados.
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
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}