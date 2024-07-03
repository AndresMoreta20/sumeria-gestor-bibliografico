export const chartColors = {
  default: {
    primary: "#00D1B2",
    info: "#209CEE",
    danger: "#FF3860",
  },
};

const datasetObject = (color, data) => {
  return {
    fill: false,
    borderColor: chartColors.default[color],
    borderWidth: 2,
    pointBackgroundColor: chartColors.default[color],
    pointBorderColor: "rgba(255,255,255,0)",
    pointHoverBackgroundColor: chartColors.default[color],
    pointBorderWidth: 20,
    pointHoverRadius: 4,
    pointHoverBorderWidth: 15,
    pointRadius: 4,
    data: data,
    tension: 0.5,
    cubicInterpolationMode: "default",
  };
};

export const generateChartData = (data) => {
  const labels = data.map((item) => item.date || item.created_at || item.label);
  const dataset = data.map(
    (item) => item.total_sales || item.orders_count || item.value
  );

  return {
    labels,
    datasets: [datasetObject("primary", dataset)],
  };
};
