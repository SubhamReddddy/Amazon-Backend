import { OrderModel } from "../Models/OrderModle.js";
import { ProductModel } from "../Models/ProductModel.js";
import { userModel } from "../Models/UserModel.js";
import catchAsyncError from "../Utils/catchAsyncError.js";
import { calculatePercentage, getMonthlyTotals } from "../Utils/features.js";

export const Stats = catchAsyncError(async (req, res, next) => {
  // total number of products Categories
  const categories = [
    "Attire",
    "Bottom",
    "Camera",
    "Earbuds",
    "Earphone",
    "Footwear",
    "Laptop",
    "Jewellery",
    "kitchen accessories",
    "SmartPhones",
    "Tops",
    "Watch",
  ];

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

  const neonColors = [
    "#39FF14", // Neon Green
    "#FF6EC7", // Neon Pink
    "#1B03A3", // Neon Blue
    "#FFF700", // Neon Yellow
    "#FF5F1F", // Neon Orange
    "#BC13FE", // Neon Purple
    "#FF073A", // Neon Red
    "#FF00FF", // Neon Magenta
    "#FF6F61", // Neon Coral
    "#00FFCD", // Neon Teal
    "#E0B0FF", // Neon Lavender
    "#FFABAB", // Neon Peach
    "#FFD700", // Neon Gold
    "#00FFFF", // Neon Aqua
    "#98FF98", // Neon Mint
    "#FF007F", // Neon Rose
  ];

  // today's date
  const today = new Date();

  // this Month
  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 2),
    end: today,
  };

  // last Month
  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 2),
    end: new Date(today.getFullYear(), today.getMonth(), 1),
  };

  // last 6 month
  const last6Month = {
    start: new Date(today.getFullYear(), today.getMonth() - 5, 2),
    end: today,
  };

  // last 1year
  const last1Year = {
    start: new Date(today.getFullYear(), today.getMonth() - 11, 2),
    end: today,
  };

  // total number of users created in this month and last month
  const thisMonthUsersPromise = userModel.countDocuments({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });
  const lastMonthUsersPromise = userModel.countDocuments({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });

  // total number of products created in this month and last month
  const thisMonthProductsPromise = ProductModel.countDocuments({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });
  const lastMonthProductsPromise = ProductModel.countDocuments({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });

  // total number of orders created in this month and last month and in last 6 months
  const thisMonthOrdersPromise = OrderModel.find({
    createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
  });
  const lastMonthOrdersPromise = OrderModel.find({
    createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
  });
  const lastSixMonthOrdersPromise = OrderModel.find({
    createdAt: { $gte: last6Month.start, $lte: last6Month.end },
  })
    .select("totalAmount")
    .select("createdAt");

  {
    // total transaction in this month and last month
    // const totalnumberOfTransationThisMonthPromise = OrderModel.find({
    //   createdAt: { $gte: thisMonth.start, $lte: thisMonth.end },
    // }).select("totalAmount");
    // const totalnumberOfTransationLastMonthPromise = OrderModel.find({
    //   createdAt: { $gte: lastMonth.start, $lte: lastMonth.end },
    // }).select("totalAmount");
  }
  // finding total number of users,orders,products
  const totalUsersPromise = userModel.countDocuments();
  const totalProductsPromise = ProductModel.countDocuments();
  const totalOrdersPromise = OrderModel.find({})
    .select("orderItems")
    .select("totalAmount");

  // finding total number of stocks
  const TotalProducts = await ProductModel.find({}).select("productStock");
  let totalNumberOfProducts = 0;
  TotalProducts.forEach((itm) => {
    totalNumberOfProducts += itm.productStock;
  });
  totalNumberOfProducts = Number((100 / totalNumberOfProducts).toFixed(2));
  let productArray = [];

  const totalStockPromise = categories.map(async (item, idx) => {
    const res = await ProductModel.find({ productCategories: item })
      .select("productStock")
      .select("productCategories");
    if (res.length > 0) {
      let total = 0;
      res.forEach((elements) => {
        total += elements.productStock;
      });
      productArray.push({
        productName: item,
        value: Math.floor(totalNumberOfProducts * total),
        color: neonColors[idx],
      });
    } else {
      productArray.push({
        productName: item,
        value: 0,
        color: neonColors[idx],
      });
    }
  });

  const [
    thismonthUsers,
    lastMonthUsers,
    thisMonthProducts,
    lastMonthProducts,
    thisMonthOrders,
    lastMonthOrders,
    lastSixMonthOrders,
    totalUsers,
    totalProducts,
    totalOrders,
    // totalnumberOfTransationThisMonth,
    // totalnumberOfTransationLastMonth,
    totalStock,
  ] = await Promise.all([
    thisMonthUsersPromise,
    lastMonthUsersPromise,
    thisMonthProductsPromise,
    lastMonthProductsPromise,
    thisMonthOrdersPromise,
    lastMonthOrdersPromise,
    lastSixMonthOrdersPromise,
    totalUsersPromise,
    totalProductsPromise,
    totalOrdersPromise,
    // totalnumberOfTransationThisMonthPromise,
    // totalnumberOfTransationLastMonthPromise,
    totalStockPromise,
  ]);

  // finding all the orders from this month order and last month order
  let thismonthtotalOrder = 0;
  thisMonthOrders.forEach((order) => {
    thismonthtotalOrder += order.orderItems.length;
  });
  let lastmonthtotalOrder = 0;
  lastMonthOrders.forEach((order) => {
    lastmonthtotalOrder += order.orderItems.length;
  });

  // finding total numbers of products
  let totalOrdersCount = 0;
  let totaltransation = 0;
  const promise1 = totalOrders.forEach((order) => {
    totalOrdersCount += order.orderItems.length;
    totaltransation += Number(order.totalAmount.toFixed(0));
  });

  let thismonthTransactions = 0;
  let lastmonthTransactions = 0;
  const promise2 = thisMonthOrders.forEach((transaction) => {
    thismonthTransactions += transaction.totalAmount;
  });
  const promise3 = lastMonthOrders.forEach((transaction) => {
    lastmonthTransactions += transaction.totalAmount;
  });
  await Promise.all([promise1, promise2, promise3]);

  // finding percentage change
  const orderPercentage = calculatePercentage(
    thismonthtotalOrder,
    lastmonthtotalOrder
  );
  const productPercentage = calculatePercentage(
    thisMonthProducts,
    lastMonthProducts
  );
  const userPercentage = calculatePercentage(thismonthUsers, lastMonthUsers);

  const transactionPercentage = calculatePercentage(
    thismonthTransactions,
    lastmonthTransactions
  );

  const { months, totals } = getMonthlyTotals(lastSixMonthOrders);
  let rev = [];
  totals.forEach((items) => {
    rev.push((items * 20) / 100);
  });

  // find data for last one year products
  const lastYearOrders = await OrderModel.find({
    createdAt: { $gte: last1Year.start, $lte: last1Year.end },
  })
    .select("orderItems")
    .select("createdAt");
  let ordersarray = [];
  let Yearsarray = [];

  for (let i = 0; i < 12; i++) {
    const startdate = new Date(
      last1Year.start.getFullYear(),
      last1Year.start.getMonth() + i,
      2
    );
    const enddate = new Date(
      last1Year.start.getFullYear(),
      last1Year.start.getMonth() + i + 1,
      1
    );
    const res = await OrderModel.find({
      createdAt: { $gte: startdate, $lte: enddate },
    }).select("orderItems");
    if (res.length > 0) {
      let total = 0;
      res.forEach((items) => {
        total += items.orderItems.length;
      });
      ordersarray.push(total);
      Yearsarray.push(monthNames[startdate.getMonth()]);
    } else {
      ordersarray.push(0);
      Yearsarray.push(monthNames[startdate.getMonth()]);
    }
  }

  // Yearsarray.reverse();
  const chartData = {
    transactionPercentage,
    totaltransation,
    userPercentage,
    totalUsers,
    productPercentage,
    totalProducts,
    orderPercentage,
    totalOrdersCount,
    productArray,
    barChart: {
      months,
      totals,
      rev,
    },
    oneYearBarChart: {
      ordersarray,
      Yearsarray,
    },
  };

  res.status(200).json({
    sucess: true,
    chartData,
  });
});

export const PieChart = catchAsyncError(async (req, res, next) => {
  let status = ["Delivered", "Processing", "Pending", "Shipped"];
  let statusCount = [];

  // orderstatus
  const orders = await OrderModel.find({}).select("orderItems");
  status.forEach((sta) => {
    let temp = 0;
    orders.forEach((ord) => {
      if (ord.orderItems.length > 0) {
        ord.orderItems.forEach((item) => {
          if (item.deliveryStatus === sta) {
            temp++;
          }
        });
      } else {
        temp = 0;
      }
    });
    statusCount.push(temp);
  });

  // stockStatus
  const products = await ProductModel.find({}).select("productStock");
  const stock = ["In Stock", "Out Stock"];
  let v1 = 0;
  let v2 = 0;
  products.forEach((item) => {
    item.productStock > 0 ? v1++ : v2++;
  });
  const stockCount = [v1, v2];

  // Revenue status
  const orders1 = await OrderModel.find({}).select("totalAmount");
  let totaltransation = 0;
  orders1.forEach((item) => {
    totaltransation += Number(item.totalAmount.toFixed(2));
  });
  const taxAmount = Number(((totaltransation / 100) * 25).toFixed(2));
  const revenue = Number(
    (((totaltransation - taxAmount) / 100) * 25).toFixed(2)
  );
  const productionCost = totaltransation - (taxAmount + revenue);

  const admin = await userModel.countDocuments({ role: "admin" });
  const user = await userModel.countDocuments({ role: "user" });

  const pieChartData = {
    orderstatus: {
      status,
      statusCount,
    },
    stockStatus: {
      stock,
      stockCount,
    },
    RevenueStatus: {
      lableData: ["tax", "revenue", "production"],
      revenueArray: [taxAmount, revenue, productionCost],
    },
    useradminStatus: {
      lableData: ["user", "admin"],
      userArray: [user, admin],
    },
  };

  res.json({
    sucess: true,
    pieChartData,
  });
});
