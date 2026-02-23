// lib/contracts/LoanContractPdf.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type ScheduleRow = {
  installmentNumber: number;
  dueDate: Date;
  expectedAmount: string; // ya formateado
};

type Props = {
  lenderName: string; // prestamista (el usuario)
  borrowerName: string;
  borrowerPhone?: string | null;

  loanId: string;
  startDate: Date;
  frequencyLabel: string;
  termCount: number;

  principal: string;
  interestRatePct: string;
  expectedInstallment: string;
  totalExpected: string;

  lateFeeFlat?: string | null;
  lateFeePerDay?: string | null;

  place: string; // por defecto "México"
  createdAt: Date;

  schedule: ScheduleRow[];
};

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica", lineHeight: 1.35 },
  h1: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  h2: { fontSize: 12, fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  p: { marginBottom: 8, color: "#111" },
  small: { fontSize: 9, color: "#444" },
  box: { borderWidth: 1, borderColor: "#DDD", padding: 10, borderRadius: 6, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  col: { flexGrow: 1 },
  table: { borderWidth: 1, borderColor: "#DDD", borderRadius: 6, overflow: "hidden" },
  trHead: { flexDirection: "row", backgroundColor: "#F5F6F7", borderBottomWidth: 1, borderBottomColor: "#DDD" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  th: { padding: 6, fontSize: 9, fontWeight: "bold" },
  td: { padding: 6, fontSize: 9 },
  w1: { width: "10%" },
  w2: { width: "30%" },
  w3: { width: "30%" },
  w4: { width: "30%" },
  signLine: { borderBottomWidth: 1, borderBottomColor: "#111", width: 220, marginTop: 28 },
});

function fmtDateMX(d: Date) {
  return new Date(d).toLocaleDateString("es-MX");
}

export function LoanContractPdf(props: Props) {
  const {
    lenderName,
    borrowerName,
    borrowerPhone,
    loanId,
    startDate,
    frequencyLabel,
    termCount,
    principal,
    interestRatePct,
    expectedInstallment,
    totalExpected,
    lateFeeFlat,
    lateFeePerDay,
    place,
    createdAt,
    schedule,
  } = props;

  const lateText =
    lateFeeFlat || lateFeePerDay
      ? `En caso de mora: ${
          lateFeeFlat ? `multa fija ${lateFeeFlat}` : ""
        }${lateFeeFlat && lateFeePerDay ? " y " : ""}${
          lateFeePerDay ? `multa por día ${lateFeePerDay}` : ""
        }.`
      : "En caso de mora: se aplicarán recargos/multas conforme acuerden las partes por escrito.";

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <Text style={s.h1}>CONTRATO DE MUTUO CON INTERÉS (ENTRE PARTICULARES)</Text>

        <View style={s.box}>
          <Text style={s.p}>
            En {place}, a {fmtDateMX(createdAt)}, comparecen:
          </Text>
          <Text style={s.p}>
            <Text style={{ fontWeight: "bold" }}>EL PRESTAMISTA:</Text> {lenderName}.
          </Text>
          <Text style={s.p}>
            <Text style={{ fontWeight: "bold" }}>EL DEUDOR:</Text> {borrowerName}
            {borrowerPhone ? `, teléfono ${borrowerPhone}` : ""}.
          </Text>
          <Text style={s.small}>
            Identificador de préstamo: {loanId}
          </Text>
        </View>

        <Text style={s.h2}>1) Objeto</Text>
        <Text style={s.p}>
          EL PRESTAMISTA entrega a EL DEUDOR la cantidad de {principal} (moneda nacional),
          obligándose EL DEUDOR a restituirla en los términos del presente contrato.
        </Text>

        <Text style={s.h2}>2) Interés y forma de pago</Text>
        <Text style={s.p}>
          La tasa de interés pactada es de {interestRatePct}. El pago se realizará en {termCount}{" "}
          pagos {frequencyLabel.toLowerCase()}, iniciando el {fmtDateMX(startDate)}, con una cuota esperada de{" "}
          {expectedInstallment}. El total esperado a cubrir es {totalExpected}.
        </Text>

        <Text style={s.h2}>3) Mora</Text>
        <Text style={s.p}>{lateText}</Text>

        <Text style={s.h2}>4) Calendario de pagos (referencial)</Text>
        <View style={s.table}>
          <View style={s.trHead}>
            <Text style={[s.th, s.w1]}>#</Text>
            <Text style={[s.th, s.w2]}>Vence</Text>
            <Text style={[s.th, s.w3]}>Monto esperado</Text>
            <Text style={[s.th, s.w4]}>Frecuencia</Text>
          </View>
          {schedule.slice(0, 60).map((r, idx) => (
            <View key={idx} style={s.tr}>
              <Text style={[s.td, s.w1]}>{r.installmentNumber}</Text>
              <Text style={[s.td, s.w2]}>{fmtDateMX(r.dueDate)}</Text>
              <Text style={[s.td, s.w3]}>{r.expectedAmount}</Text>
              <Text style={[s.td, s.w4]}>{frequencyLabel}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>5) Jurisdicción</Text>
        <Text style={s.p}>
          Para la interpretación y cumplimiento, las partes se someten a las leyes y tribunales
          competentes del lugar de celebración, renunciando a cualquier otro fuero que pudiera corresponderles.
        </Text>

        <Text style={s.h2}>6) Firma</Text>
        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.signLine}></Text>
            <Text style={s.small}>EL PRESTAMISTA: {lenderName}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.signLine}></Text>
            <Text style={s.small}>EL DEUDOR: {borrowerName}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={s.small}>
            Nota: Este documento es un formato informativo. Si necesitas máxima fuerza legal, consulta a un abogado
            para adecuarlo a tu caso (domicilios, identificaciones, pagaré, etc.).
          </Text>
        </View>
      </Page>
    </Document>
  );
}