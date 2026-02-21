// app/page.tsx
import Link from "next/link";

const COLORS = {
  primary: "#0F2A36",
  secondary: "#D6CBBF",
  base: "#F5F6F7",
  text: "#1F1F1F",
  positive: "#2E7D5B",
  risk: "#B23A3A",
  warning: "#C88A1A",
  primaryHover: "#0B1F28",
};

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "warning" | "risk";
}) {
  const toneMap: Record<string, string> = {
    neutral: `border-[${COLORS.secondary}] bg-white text-[${COLORS.text}]`,
    positive: `border-[${COLORS.positive}] bg-white text-[${COLORS.positive}]`,
    warning: `border-[${COLORS.warning}] bg-white text-[${COLORS.warning}]`,
    risk: `border-[${COLORS.risk}] bg-white text-[${COLORS.risk}]`,
  };

  const dot =
    tone === "neutral"
      ? COLORS.primary
      : tone === "positive"
      ? COLORS.positive
      : tone === "warning"
      ? COLORS.warning
      : COLORS.risk;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        toneMap[tone],
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      {children}
    </span>
  );
}

function Card({
  title,
  desc,
  meta,
}: {
  title: string;
  desc: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold" style={{ color: COLORS.text }}>
          {title}
        </h3>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-black/70">{desc}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-black/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold" style={{ color: COLORS.text }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-black/60">{hint}</p>
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors"
      style={{ background: COLORS.primary }}
    >
      {children}
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border bg-white px-5 py-3 text-sm font-semibold transition-colors"
      style={{ borderColor: COLORS.primary, color: COLORS.primary }}
    >
      {children}
    </Link>
  );
}

export default function Page() {
  return (
    <div className="min-h-dvh" style={{ background: COLORS.base, color: COLORS.text }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: "white", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
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
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <a className="text-sm text-black/70 hover:text-black" href="#beneficios">
                Beneficios
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#funciones">
                Funciones
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#como-funciona">
                Cómo funciona
              </a>
              <a className="text-sm text-black/70 hover:text-black" href="#planes">
                Planes
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <SecondaryButton href="/login">Iniciar sesión</SecondaryButton>
              <PrimaryButton href="/register">Crear cuenta</PrimaryButton>
            </div>
          </div>
        </Container>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-10 md:pt-14">
          <Container>
            <div className="grid items-start gap-10 md:grid-cols-2">
              <div>
                <Badge>Para microprestamistas que operan en serio</Badge>

                <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl" style={{ color: COLORS.text }}>
                  Menos intuición. <br />
                  Más claridad. <br />
                  Más control sobre tu capital.
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-black/70">
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    Limar
                  </span>{" "}
                  es un sistema profesional para llevar tu cartera con{" "}
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    orden, control y criterio
                  </span>
                  . Gestiona préstamos, calcula{" "}
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    intereses y multas automáticamente
                  </span>
                  , detecta{" "}
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    riesgos progresivos
                  </span>{" "}
                  y te ayuda a decidir cuándo{" "}
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    renovar, reducir o detener
                  </span>{" "}
                  un crédito.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton href="/register">Empezar ahora</PrimaryButton>
                  <SecondaryButton href="#demo">Ver demo</SecondaryButton>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-xs text-black/60">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.positive }} />
                    Pagos y cumplimiento claros
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.warning }} />
                    Alertas por vencimiento y riesgo
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.risk }} />
                    Señales reales para cortar pérdidas
                  </span>
                </div>
              </div>

              {/* Preview panel */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm" id="demo">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                    Tablero (ejemplo)
                  </p>
                  <span className="rounded-lg px-2 py-1 text-xs font-medium" style={{ background: COLORS.secondary, color: COLORS.primary }}>
                    Hoy
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Stat label="Capital vigente" value="$128,450" hint="Al corriente" />
                  <Stat label="Por vencer" value="$23,900" hint="Próx. 7 días" />
                  <Stat label="En atraso" value="$9,120" hint="Acción requerida" />
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Riesgo progresivo</p>
                    <span className="text-xs text-black/60">se actualiza por comportamiento</span>
                  </div>

                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Cliente #204</p>
                        <p className="text-xs text-black/60">Pagó a tiempo. Perfil estable.</p>
                      </div>
                      <Badge tone="positive">Cumplimiento</Badge>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Cliente #118</p>
                        <p className="text-xs text-black/60">Vence pronto. Seguimiento preventivo.</p>
                      </div>
                      <Badge tone="warning">Atención</Badge>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">Cliente #055</p>
                        <p className="text-xs text-black/60">Atraso recurrente. Riesgo alto.</p>
                      </div>
                      <Badge tone="risk">Riesgo</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-black/10 p-4">
                  <p className="text-sm font-semibold">Conclusión sugerida (ejemplo)</p>
                  <div className="mt-3 grid gap-2">
                    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                      <span className="text-sm font-medium">Cliente #204</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.positive }}>
                        Aumentar
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                      <span className="text-sm font-medium">Cliente #118</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.warning }}>
                        Mantener
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                      <span className="text-sm font-medium">Cliente #055</span>
                      <span className="text-sm font-semibold" style={{ color: COLORS.risk }}>
                        No renovar
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-black/50">
                  * Vista de ejemplo para ilustrar criterios (no datos reales).
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Benefits */}
        <section id="beneficios" className="mt-14 md:mt-20">
          <Container>
            <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
              Orden, control y criterio — aterrizado a tu operación
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
              Lo que importa: saber quién está bien, quién se está desviando y quién ya representa un riesgo.
              Todo con reglas claras, sin improvisación.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card
                title="Menos intuición"
                desc="Decisiones basadas en historial de pagos, puntualidad y comportamiento. Sin “corazonadas”."
                meta={<Badge>Decisión</Badge>}
              />
              <Card
                title="Más claridad"
                desc="Estados sobrios: al corriente, por vencer, atraso y riesgo. Prioriza cobranza con foco."
                meta={<Badge tone="warning">Prioridad</Badge>}
              />
              <Card
                title="Más control del capital"
                desc="Evita renovaciones mal hechas. Reduce exposición antes de que el atraso se convierta en pérdida."
                meta={<Badge tone="risk">Protección</Badge>}
              />
            </div>
          </Container>
        </section>

        {/* Features */}
        <section id="funciones" className="mt-14 md:mt-20">
          <Container>
            <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                Funciones clave
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                Lo esencial para llevar cartera profesional sin complicar tu día.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card
                  title="Gestión de préstamos"
                  desc="Registro claro de monto, plazo, frecuencia, fechas clave y condiciones. Todo entendible."
                />
                <Card
                  title="Intereses y multas automáticas"
                  desc="Cálculo consistente para evitar errores manuales y discusiones innecesarias."
                />
                <Card
                  title="Riesgo progresivo"
                  desc="Señales que suben o bajan según comportamiento real, no por una sola falta."
                />
                <Card
                  title="Vencimientos y atrasos"
                  desc="Detección y prioridades para que cobres a tiempo y con orden."
                />
                <Card
                  title="Conclusión de renovación"
                  desc="Recomendación clara: renovar, reducir, mantener o detener, basada en reglas."
                />
                <Card
                  title="Historial y trazabilidad"
                  desc="Mejor control de lo que pasó y por qué tomaste una decisión."
                />
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="mt-14 md:mt-20">
          <Container>
            <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                    Cómo funciona (simple)
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                    Registrar → cobrar → evaluar → decidir. Eso es.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <SecondaryButton href="/register">Empezar con mi cartera</SecondaryButton>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {[
                  ["Paso 1", "Crea el préstamo", "Definen condiciones, fechas y reglas desde el inicio."],
                  ["Paso 2", "Registra pagos", "Pagos parciales o completos actualizan saldo y estado."],
                  ["Paso 3", "Detecta riesgo", "Vencimientos/atrasos elevan riesgo de forma progresiva."],
                  ["Paso 4", "Toma criterio", "Conclusión: renovar, reducir o detener con base en datos."],
                ].map(([step, title, desc]) => (
                  <div key={step} className="rounded-2xl border border-black/10 p-5">
                    <p className="text-xs font-medium text-black/60">{step}</p>
                    <p className="mt-2 font-semibold">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-black/70">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-black/10 p-5">
                <p className="text-sm font-semibold">Estados visuales (sobrios)</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="positive">Pagado / Cumple</Badge>
                  <Badge>Vigente</Badge>
                  <Badge tone="warning">Por vencer</Badge>
                  <Badge tone="risk">Atraso / No renovar</Badge>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Plans */}
        <section id="planes" className="mt-14 pb-16 md:mt-20 md:pb-24">
          <Container>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: COLORS.text }}>
                  Planes simples
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                  Empieza sin fricción y escala cuando la operación lo pida.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <SecondaryButton href="/register">Crear cuenta</SecondaryButton>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold">Base</p>
                <p className="mt-2 text-3xl font-semibold" style={{ color: COLORS.text }}>
                  $0 <span className="ml-2 text-sm font-medium text-black/60">/ mes</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-black/70">Para iniciar y validar el flujo.</p>
                <ul className="mt-5 space-y-2 text-sm text-black/70">
                  <li>• Registro de clientes y préstamos</li>
                  <li>• Pagos y estados</li>
                  <li>• Vencimientos</li>
                </ul>
                <div className="mt-6">
                  <PrimaryButton href="/register">Empezar</PrimaryButton>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Operación</p>
                  <span
                    className="rounded-lg px-2 py-1 text-xs font-semibold"
                    style={{ background: COLORS.secondary, color: COLORS.primary }}
                  >
                    Recomendado
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold" style={{ color: COLORS.text }}>
                  $— <span className="ml-2 text-sm font-medium text-black/60">/ mes</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-black/70">
                  Para operar con riesgo progresivo y criterio de renovación.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-black/70">
                  <li>• Intereses y multas automáticas</li>
                  <li>• Riesgo progresivo</li>
                  <li>• Conclusión de renovación</li>
                </ul>
                <div className="mt-6">
                  <PrimaryButton href="/register">Crear cuenta</PrimaryButton>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold">Equipo</p>
                <p className="mt-2 text-3xl font-semibold" style={{ color: COLORS.text }}>
                  $— <span className="ml-2 text-sm font-medium text-black/60">/ mes</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-black/70">
                  Para multiusuario, permisos y operación más grande.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-black/70">
                  <li>• Roles y permisos</li>
                  <li>• Auditoría</li>
                  <li>• Configuración avanzada</li>
                </ul>
                <div className="mt-6">
                  <SecondaryButton href="/register">Hablar con ventas</SecondaryButton>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 border-t pt-8" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
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
                    <p className="text-xs text-black/60">Orden, control y criterio.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-black/70">
                  <Link className="hover:underline" href="/login">
                    Iniciar sesión
                  </Link>
                  <Link className="hover:underline" href="/login">
                    Crear cuenta
                  </Link>
                  <a className="hover:underline" href="#beneficios">
                    Beneficios
                  </a>
                  <a className="hover:underline" href="#funciones">
                    Funciones
                  </a>
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
          </Container>
        </section>
      </main>
    </div>
  );
}