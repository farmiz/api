export const convertDiscoveryDuration = (duration: {
  type: "day" | "month" | "year";
  value: number;
}) => {
  const durationMapper = {
    day: 1,
    year: 365,
    month: 31,
  };

  return durationMapper[duration.type] * duration.value;
};
