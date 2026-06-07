const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redis.on("error", (error) => {
  console.log("Redis error:", error);
});

(async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
})();

module.exports = redis;
