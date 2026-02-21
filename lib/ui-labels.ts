// lib/ui-labels.ts
export function conclusionLabel(c: string) {
  switch (c) {
    case "NO_RENOVAR":
      return "No renovar";
    case "REDUCIR":
      return "Bajarle";
    case "MANTENER":
      return "Mantener";
    case "AUMENTAR":
      return "Subirle";
    default:
      return c;
  }
}

export function trendLabel(t: string) {
  switch (t) {
    case "IMPROVING":
      return "Va mejorando";
    case "STABLE":
      return "Va igual";
    case "WORSENING":
      return "Va empeorando";
    default:
      return t;
  }
}

export function frequencyLabel(f: string) {
  switch (f) {
    case "WEEKLY":
      return "Semanal";
    case "BIWEEKLY":
      return "Quincenal";
    case "MONTHLY":
      return "Mensual";
    default:
      return f;
  }
}

export function scheduleStatusLabel(s: string) {
  switch (s) {
    case "PAID":
      return "Pagado";
    case "PARTIAL":
      return "Abonado";
    case "PENDING":
      return "Pendiente";
    case "MISSED":
      return "Vencido";
    default:
      return s;
  }
}

export function loanStatusLabel(s: string) {
  switch (s) {
    case "ACTIVE":
      return "Activo";
    case "COMPLETED":
      return "Terminado";
    case "DEFAULTED":
      return "En cobranza";
    case "CANCELLED":
      return "Cancelado";
    case "DRAFT":
      return "Borrador";
    default:
      return s;
  }
}

export function moneyLabel(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}
