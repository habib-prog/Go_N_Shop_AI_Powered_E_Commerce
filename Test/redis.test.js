const path = require("path");

const redisModulePath = require.resolve("redis");
const redisConfigPath = path.resolve(__dirname, "../src/config/redis.js");

const mockRedisClient = {
  on: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  isOpen: false,
};

const mockCreateClient = vi.fn(() => mockRedisClient);

const mockLocalModule = (modulePath, mockExports) => {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: mockExports,
  };
};

const clearLocalModule = (modulePath) => {
  delete require.cache[modulePath];
};

describe("redis config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.REDIS_URL;
    mockLocalModule(redisModulePath, { createClient: mockCreateClient });
    clearLocalModule(redisConfigPath);
  });

  afterEach(() => {
    clearLocalModule(redisConfigPath);
    clearLocalModule(redisModulePath);
  });

  it("creates a redis client with the default local url and connects it", async () => {
    const redis = require(redisConfigPath);

    expect(mockCreateClient).toHaveBeenCalledWith({
      url: "redis://127.0.0.1:6379",
    });
    expect(redis).toBe(mockRedisClient);
    expect(mockRedisClient.on).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
    expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
  });

  it("uses REDIS_URL when it is provided", async () => {
    process.env.REDIS_URL = "redis://localhost:6380";

    require(redisConfigPath);

    expect(mockCreateClient).toHaveBeenCalledWith({
      url: "redis://localhost:6380",
    });
    expect(mockRedisClient.connect).toHaveBeenCalledTimes(1);
  });
});
