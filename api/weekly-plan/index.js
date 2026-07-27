const { handleWeeklyPlan, WeeklyPlanError } = require("../shared/weekly-plan");

module.exports = async function (context, req) {
  try {
    const result = await handleWeeklyPlan(req.body || {}, process.env);
    context.res = { status: 200, body: result };
  } catch (error) {
    const status = error instanceof WeeklyPlanError ? error.status : 500;
    const message = error instanceof WeeklyPlanError ? error.message : "周计划服务异常";
    context.log.error("weekly-plan error:", message);
    context.res = { status, body: { error: message } };
  }
};
