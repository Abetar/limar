import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  text: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  strong: {
    fontWeight: "bold",
  },
  signatureBlock: {
    marginTop: 60,
  },
  line: {
    marginTop: 30,
    borderTop: "1px solid black",
    width: "60%",
  },
});

export function PagarePdf({
  lenderName,
  borrowerName,
  borrowerPhone,
  amountNumber,
  amountText,
  place,
  createdAt,
  dueDate,
}: {
  lenderName: string;
  borrowerName: string;
  borrowerPhone?: string | null;
  amountNumber: number;
  amountText: string;
  place: string;
  createdAt: Date;
  dueDate: Date;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PAGARÉ</Text>

        <Text style={styles.text}>
          En {place}, a {new Date(createdAt).toLocaleDateString("es-MX")}.
        </Text>

        <Text style={styles.text}>
          Debo y pagaré incondicionalmente a la orden de{" "}
          <Text style={styles.strong}>{lenderName}</Text>, la cantidad de{" "}
          <Text style={styles.strong}>
            ${amountNumber.toLocaleString("es-MX")} MXN
          </Text>{" "}
          ({amountText}) el día{" "}
          <Text style={styles.strong}>
            {new Date(dueDate).toLocaleDateString("es-MX")}
          </Text>.
        </Text>

        <Text style={styles.text}>
          Este pagaré causa intereses moratorios y/o cargos adicionales en caso de incumplimiento,
          mismos que podrán ser determinados por el acreedor.
        </Text>

        <Text style={styles.text}>
          Nombre del deudor:{" "}
          <Text style={styles.strong}>{borrowerName}</Text>
        </Text>

        {borrowerPhone ? (
          <Text style={styles.text}>
            Teléfono: {borrowerPhone}
          </Text>
        ) : null}

        <View style={styles.signatureBlock}>
          <Text>Firma del deudor:</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.signatureBlock}>
          <Text>Firma del acreedor:</Text>
          <View style={styles.line} />
        </View>
      </Page>
    </Document>
  );
}