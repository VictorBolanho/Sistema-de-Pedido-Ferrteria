const commissionsModel = require("./commissions.model");
const HttpError = require("../../utils/http-error");

function mapCommission(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    advisorId: row.advisor_id,
    percentage: Number(row.percentage),
    value: Number(row.value),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function resolveCommissionPercentage(orderTotal) {
  if (orderTotal >= 10000000) {
    return 6;
  }
  if (orderTotal >= 5000000) {
    return 3;
  }
  if (orderTotal >= 1000000) {
    return 2;
  }
  return 0;
}

function calculateCommission(orderTotal) {
  const percentage = resolveCommissionPercentage(orderTotal);
  const value = Number(((orderTotal * percentage) / 100).toFixed(2));
  return { percentage, value };
}

async function createCommissionForOrder(
  { orderId, advisorId, orderTotal },
  transactionalClient
) {
  const { percentage, value } = calculateCommission(orderTotal);
  const created = await commissionsModel.createCommission(
    {
      orderId,
      advisorId,
      percentage,
      value,
    },
    transactionalClient
  );

  return mapCommission(created);
}

async function getCommissions(requester) {
  if (requester.role === "admin") {
    const rows = await commissionsModel.listCommissions();
    return rows.map(mapCommission);
  }

  if (requester.role === "advisor") {
    const advisor = await commissionsModel.findAdvisorByUserId(requester.sub);
    if (!advisor) {
      throw new HttpError(403, "Advisor profile not found for current user");
    }

    const rows = await commissionsModel.listCommissionsByAdvisorId(advisor.id);
    return rows.map(mapCommission);
  }

  throw new HttpError(403, "Forbidden");
}

module.exports = {
  calculateCommission,
  createCommissionForOrder,
  getCommissions,
};

