import dayjs from "dayjs";
import { PeriodType } from "@prisma/client";

export const getDateRangeByPeriod = (period: PeriodType, referenceDate = new Date()) => {
  const ref = dayjs(referenceDate);

  switch (period) {
    case "DAILY":
      return {
        currentStart: ref.startOf("day").toDate(),
        currentEnd: ref.endOf("day").toDate(),
        previousStart: ref.subtract(1, "day").startOf("day").toDate(),
        previousEnd: ref.subtract(1, "day").endOf("day").toDate(),
        bucketCount: 1
      };
    case "WEEKLY":
      return {
        currentStart: ref.startOf("week").toDate(),
        currentEnd: ref.endOf("week").toDate(),
        previousStart: ref.subtract(1, "week").startOf("week").toDate(),
        previousEnd: ref.subtract(1, "week").endOf("week").toDate(),
        bucketCount: 7
      };
    case "YEARLY":
      return {
        currentStart: ref.startOf("year").toDate(),
        currentEnd: ref.endOf("year").toDate(),
        previousStart: ref.subtract(1, "year").startOf("year").toDate(),
        previousEnd: ref.subtract(1, "year").endOf("year").toDate(),
        bucketCount: 12
      };
    case "MONTHLY":
    default:
      return {
        currentStart: ref.startOf("month").toDate(),
        currentEnd: ref.endOf("month").toDate(),
        previousStart: ref.subtract(1, "month").startOf("month").toDate(),
        previousEnd: ref.subtract(1, "month").endOf("month").toDate(),
        bucketCount: ref.daysInMonth()
      };
  }
};
