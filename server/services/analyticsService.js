const Analytics = require("../models/Analytics");

const trackEvent = async ({ user, eventType, value = 1, metadata = {}, date = new Date() }) => {
  return Analytics.create({ user, eventType, value, metadata, date });
};

module.exports = { trackEvent };
