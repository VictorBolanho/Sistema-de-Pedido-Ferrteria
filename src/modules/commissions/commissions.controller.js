const commissionsService = require("./commissions.service");

async function getCommissions(req, res, next) {
  try {
    const commissions = await commissionsService.getCommissions(req.user);
    res.status(200).json({ commissions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCommissions,
};

