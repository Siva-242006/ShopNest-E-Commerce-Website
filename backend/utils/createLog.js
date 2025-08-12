const UAParser = require("ua-parser-js");
const Log = require("../models/logs");

async function createLog(req, action, metadata = {}) {
  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const uaResult = parser.getResult();

    const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";

    const location = req.location || { country: "unknown", city: "unknown" };

    const log = new Log({
      userId: req.user?._id || null,
      action,
      ip,
      userAgent: req.headers["user-agent"] || "unknown",
      deviceType: uaResult.device.type || "desktop",
      browser: uaResult.browser.name || "unknown",
      os: uaResult.os.name || "unknown",
      location: { country: location.country, city: location.city },
      metadata
    });

    await log.save();
    console.log("Log saved:", action);
  } catch (error) {
    console.error("Error saving log:", error.message);
  }
}

module.exports = createLog;