const formatCurrency = (value: number, currency = "JPY") =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export default formatCurrency;
