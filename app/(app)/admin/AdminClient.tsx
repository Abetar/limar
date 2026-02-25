// app/(app)/admin/AdminClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { setSubscriptionOverrideAction, setUserEnabledAction } from "./actions";

type AdminOrgRow = {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  subscriptionOverride: boolean;
  subscriptionOverrideReason: string | null;
  subscriptionOverrideAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
};

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isEnabled: boolean;
  organizationId: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    subscriptionStatus: string;
    subscriptionOverride: boolean;
  } | null;
};

function fmtDate(d: string | null) {
  if (!d) return "No aplica";
  try {
    return new Date(d).toLocaleDateString("es-MX");
  } catch {
    return "No aplica";
  }
}

export default function AdminClient(props: {
  adminEmail: string;
  orgs: AdminOrgRow[];
  users: AdminUserRow[];
}) {
  const [isPending, startTransition] = useTransition();

  // Control local para toggles de org sin “parpadeo”
  const [orgOverride, setOrgOverride] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const o of props.orgs) m[o.id] = !!o.subscriptionOverride;
    return m;
  });

  const [q, setQ] = useState("");

  const filteredOrgs = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return props.orgs;

    return props.orgs.filter((o) => {
      const hay = `${o.name} ${o.slug} ${o.subscriptionStatus} ${o.stripeCustomerId ?? ""} ${
        o.stripeSubscriptionId ?? ""
      }`.toLowerCase();
      return hay.includes(s);
    });
  }, [props.orgs, q]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return props.users;

    return props.users.filter((u) => {
      const hay = `${u.name ?? ""} ${u.email ?? ""} ${u.role} ${u.organization?.name ?? ""} ${
        u.organization?.slug ?? ""
      }`.toLowerCase();
      return hay.includes(s);
    });
  }, [props.users, q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Admin global</h1>
        <p className="mt-1 text-sm text-black/55">
          Panel interno. Controla acceso manual por organización y bloqueo por usuario.
        </p>
      </div>

      <Card>
        <CardHeader title="Búsqueda" subtitle="Filtra por correo, nombre, organización o slug." />
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej. abrahamgm85, Limar, mi-negocio, INACTIVE..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
            />
            <div className="shrink-0 text-xs text-black/50">
              Orgs: <span className="font-semibold text-black/70">{filteredOrgs.length}</span> · Usuarios:{" "}
              <span className="font-semibold text-black/70">{filteredUsers.length}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-black/50">
            Tu acceso a este panel está amarrado a <span className="font-semibold">{props.adminEmail}</span> vía{" "}
            <span className="font-semibold">ADMIN_EMAIL</span>.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Organizaciones"
          subtitle="Stripe manda el estado, pero puedes forzar FULL con acceso manual por org."
        />
        <CardBody>
          <div className="space-y-2">
            {filteredOrgs.map((o) => {
              const override = orgOverride[o.id] ?? !!o.subscriptionOverride;

              return (
                <div
                  key={o.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-[#1F1F1F]">{o.name}</div>
                      <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-xs font-semibold text-black/70">
                        {o.slug}
                      </span>

                      {override ? (
                        <span className="rounded-full border border-[#2E7D5B]/20 bg-[#2E7D5B]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2E7D5B]">
                          Override ON
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-xs text-black/55">
                      Stripe: <span className="font-semibold text-black/70">{o.subscriptionStatus}</span> · Periodo:{" "}
                      <span className="font-semibold text-black/70">{fmtDate(o.currentPeriodEnd)}</span> · Creada:{" "}
                      <span className="font-semibold text-black/70">{fmtDate(o.createdAt)}</span>
                    </div>

                    {o.subscriptionOverrideReason || o.subscriptionOverrideAt ? (
                      <div className="mt-1 text-xs text-black/50">
                        Último override:{" "}
                        <span className="font-semibold text-black/70">{fmtDate(o.subscriptionOverrideAt)}</span>
                        {o.subscriptionOverrideReason ? ` · ${o.subscriptionOverrideReason}` : ""}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        const next = !override;
                        setOrgOverride((prev) => ({ ...prev, [o.id]: next }));

                        startTransition(async () => {
                          await setSubscriptionOverrideAction(
                            o.id,
                            next,
                            next ? "Acceso gratuito (admin global)" : "Override apagado (admin global)"
                          );
                        });
                      }}
                      className={
                        override
                          ? "rounded-2xl bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                          : "rounded-2xl bg-[#0F2A36] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                      }
                    >
                      {override ? "Apagar override" : "Prender override"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredOrgs.length === 0 ? (
              <div className="text-sm text-black/55">No hay organizaciones con ese filtro.</div>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-black/55">
            Si el override está prendido, esa organización entra en modo FULL aunque Stripe diga INACTIVE.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Usuarios" subtitle="Kill switch por usuario. Si está deshabilitado, no entra a nada." />
        <CardBody>
          <div className="space-y-2">
            {filteredUsers.map((u) => {
              const orgName = u.organization?.name ?? "Sin organización";
              const orgSlug = u.organization?.slug ?? "n/a";
              const isOwner = u.role === "OWNER";

              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#1F1F1F]">
                      {u.name?.trim() || u.email || "Usuario"}
                    </div>

                    <div className="mt-1 truncate text-xs text-black/55">
                      {u.email || "Sin correo"} · {isOwner ? "Dueño" : "Miembro"} ·{" "}
                      <span className="font-semibold text-black/70">{orgName}</span>{" "}
                      <span className="text-black/45">({orgSlug})</span>
                    </div>

                    <div className="mt-1 text-xs text-black/50">
                      Creado: <span className="font-semibold text-black/70">{fmtDate(u.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={
                        u.isEnabled
                          ? "rounded-full border border-[#2E7D5B]/20 bg-[#2E7D5B]/10 px-3 py-1 text-xs font-semibold text-[#2E7D5B]"
                          : "rounded-full border border-[#B23A3A]/20 bg-[#B23A3A]/10 px-3 py-1 text-xs font-semibold text-[#B23A3A]"
                      }
                    >
                      {u.isEnabled ? "Habilitado" : "Deshabilitado"}
                    </span>

                    <button
                      type="button"
                      disabled={isPending || !u.email || isOwner}
                      onClick={() => {
                        startTransition(async () => {
                          await setUserEnabledAction(u.id, !u.isEnabled);
                        });
                      }}
                      className={
                        u.isEnabled
                          ? "rounded-2xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5 disabled:opacity-60"
                          : "rounded-2xl bg-[#0F2A36] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                      }
                      title={
                        !u.email
                          ? "No se puede administrar un usuario sin email"
                          : isOwner
                            ? "No puedes deshabilitar a un OWNER desde aquí"
                            : ""
                      }
                    >
                      {u.isEnabled ? "Deshabilitar" : "Habilitar"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 ? (
              <div className="text-sm text-black/55">No hay usuarios con ese filtro.</div>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-black/55">
            Este switch es el “apagón total”: si un usuario está deshabilitado, queda bloqueado aunque tenga suscripción
            activa.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}