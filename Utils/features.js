import jwt from "jsonwebtoken";
export const sendCookie = (user, res, message, statusCode = 200) => {
  // console.log(user)
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res
    .status(statusCode)
    .cookie("AmazonToken", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message,
      user,
    });
};

export const calculatePercentage = (first, second) => {
  if (second === 0) {
    return first * 100;
  } else {
    return ((first - second) / second).toFixed(2) * 100;
  }
};

export function getMonthlyTotals(orders) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5);

  // Filter orders within the last six months
  const filteredOrders = orders.filter(
    (order) => new Date(order.createdAt) >= sixMonthsAgo
  );

  const monthTotals = {};

  // Aggregate totals by month
  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    const monthName = monthNames[date.getMonth()];

    if (!monthTotals[monthName]) {
      monthTotals[monthName] = 0;
    }
    monthTotals[monthName] += Number(order.totalAmount.toFixed(0));
  });

  // Create arrays of months and totals
  const months = [];
  const totals = [];
  const currentDate = new Date(today.getFullYear(), today.getMonth());
  const iterDate = new Date(currentDate);

  // Fill months and totals arrays in chronological order from oldest to most recent
  while (iterDate >= sixMonthsAgo) {
    const monthName = monthNames[iterDate.getMonth()];
    months.unshift(monthName);
    totals.unshift(monthTotals[monthName] || 0);
    iterDate.setMonth(iterDate.getMonth() - 1);
  }

  return { months, totals };
}
