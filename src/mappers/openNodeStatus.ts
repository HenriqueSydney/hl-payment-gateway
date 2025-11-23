export function mapOpenNodeStatus(
  openNodeStatus: string
): "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" {
  switch (openNodeStatus) {
    case "paid":
      return "COMPLETED";
    case "processing":
    case "underpaid": // Mantemos pendente até ele pagar o resto ou expirar
      return "PENDING";
    case "refunded":
      return "REFUNDED";
    case "expired":
      return "FAILED";
    default:
      return "PENDING";
  }
}
