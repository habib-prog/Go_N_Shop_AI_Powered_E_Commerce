// Import Node's path utility So we can build stable absolute paths for our local modules.
const path = require('path');

// Build the absolute paths to the split auth controller files we want to test.
const signupControllerPath = path.resolve(
  __dirname,
  '../src/controllers/signupController.js'
);
const loginControllerPath = path.resolve(
  __dirname,
  '../src/controllers/loginController.js'
);
// Build the absolute path to the mail service dependency that we want to replace in tests.
const mailServicePath = path.resolve(
  __dirname,
  '../src/helpers/Mail/mailService.js'
);
// Build the absolute path to the OTP helper dependency that we want to replace in tests.
const otpPath = path.resolve(__dirname, '../src/helpers/Otp/otp.js');
// Build the absolute path to the access-token helper dependency that we want to replace in tests.
const accessTokenPath = path.resolve(
  __dirname,
  '../src/helpers/Jwt/generateAccessToken.js'
);
// Build the absolute path to the refresh-token helper dependency that we want to replace in tests.
const refreshTokenPath = path.resolve(
  __dirname,
  '../src/helpers/Jwt/generateRefreshToken.js'
);
// Build the absolute path to the user model dependency that we want to replace in tests.
const userModelPath = path.resolve(__dirname, '../src/models/userSchema.js');

// Create a reusable mail-service spy so we can assert when signup sends an email.
const mailServiceMock = vi.fn();
// Create a reusable OTP spy so we can control which OTP code signup generates.
const generateSecureOTPMock = vi.fn();
// Create a reusable access-token spy so we can control the login cookie value.
const generateAccessTokenMock = vi.fn();
// Create a reusable refresh-token spy so we can control the login cookie value.
const generateRefreshTokenMock = vi.fn();
// Create a reusable fake user model so we can stub database behavior without touching MongoDB.
const userModelMock = {
  findOne: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  find: vi.fn(),
};

// Replace one local module in Node's require cache so the controller receives our mock instead.
const mockLocalModule = (modulePath, mockExports) => {
  // Resolve the final module id exactly how Node would resolve it during require.
  const resolvedModulePath = require.resolve(modulePath);
  // Inject a fake loaded module record into the require cache with our mocked exports.
  require.cache[resolvedModulePath] = {
    id: resolvedModulePath,
    filename: resolvedModulePath,
    loaded: true,
    exports: mockExports,
  };
};

// Remove one module from the require cache so the next require call loads a fresh copy.
const clearLocalModule = (modulePath) => {
  // Resolve the final module id exactly how Node would resolve it during require.
  const resolvedModulePath = require.resolve(modulePath);
  // Delete the cached module entry so a later require gets a fresh instance.
  delete require.cache[resolvedModulePath];
};

// Build a tiny Express-like response object so we can inspect status, cookies, and JSON payloads.
const createResponse = () => {
  // Start with an empty shell that will receive spy methods immediately below.
  const res = {};
  // Mock res.status so the controller can set HTTP status codes and continue chaining.
  res.status = vi.fn().mockImplementation(() => res);
  // Mock res.json so the controller can send JSON responses and continue chaining.
  res.json = vi.fn().mockImplementation(() => res);
  // Mock res.cookie so the login controller can store auth cookies during the success flow.
  res.cookie = vi.fn().mockImplementation(() => res);
  // Return the finished fake response object to each test case.
  return res;
};

// Hold the currently loaded controller functions so each test can call them directly.
let signupController;
let loginController;

// Set up fresh mocks and a fresh controller instance before every test case runs.
beforeEach(() => {
  // Clear any previous call history from every Vitest spy used in this file.
  vi.clearAllMocks();
  // Reset Vitest's module registry so a fresh controller can be loaded every time.
  vi.resetModules();
  // Inject the mocked mail service before the controller is required.
  mockLocalModule(mailServicePath, mailServiceMock);
  // Inject the mocked OTP helper before the controller is required.
  mockLocalModule(otpPath, generateSecureOTPMock);
  // Inject the mocked access-token helper before the controller is required.
  mockLocalModule(accessTokenPath, generateAccessTokenMock);
  // Inject the mocked refresh-token helper before the controller is required.
  mockLocalModule(refreshTokenPath, generateRefreshTokenMock);
  // Inject the mocked user model before the controller is required.
  mockLocalModule(userModelPath, userModelMock);
  // Remove the controller files from cache so they capture the freshly mocked dependencies above.
  clearLocalModule(signupControllerPath);
  clearLocalModule(loginControllerPath);
  // Require the controllers after the mocks are in place so their dependencies are replaced.
  signupController = require(signupControllerPath);
  loginController = require(loginControllerPath);
});

// Clean up the mocked modules after every test so nothing leaks into other test files later.
afterEach(() => {
  // Remove the controller files from cache after the test finishes.
  clearLocalModule(signupControllerPath);
  clearLocalModule(loginControllerPath);
  // Remove the mocked mail service from cache after the test finishes.
  clearLocalModule(mailServicePath);
  // Remove the mocked OTP helper from cache after the test finishes.
  clearLocalModule(otpPath);
  // Remove the mocked access-token helper from cache after the test finishes.
  clearLocalModule(accessTokenPath);
  // Remove the mocked refresh-token helper from cache after the test finishes.
  clearLocalModule(refreshTokenPath);
  // Remove the mocked user model from cache after the test finishes.
  clearLocalModule(userModelPath);
});

// Group all auth-controller tests together so the output stays easy to scan.
describe('authController', () => {
  // Group the signup tests together because they share the same controller entry point.
  describe('signUp', () => {
    // Verify that signup returns 201 and the expected user payload when the request is valid.
    it('creates a user and returns the public signup response', async () => {
      // Build a request body that satisfies the Zod signup schema in the controller.
      const req = {
        body: {
          fullname: 'Test User',
          email: 'test@example.com',
          password: 'secret1',
          avatar: 'https://example.com/avatar.png',
          address: 'Dhaka',
        },
      };
      // Create a fresh fake response object for this individual test case.
      const res = createResponse();
      // Create a fake database user document that mirrors the public fields returned by signup.
      const createdUser = {
        fullname: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.png',
        address: 'Dhaka',
      };

      // Make the OTP helper return a predictable code so assertions stay stable.
      generateSecureOTPMock.mockReturnValue('654321');
      // Make the first lookup behave like no user exists with this email yet.
      userModelMock.findOne.mockResolvedValue(null);
      // Make user creation resolve to our fake stored user document.
      userModelMock.create.mockResolvedValue(createdUser);
      // Make the mail service resolve successfully instead of sending a real email.
      mailServiceMock.mockResolvedValue(undefined);

      // Run the signup controller with the arranged request and response objects.
      await signupController.signUp(req, res);

      // Confirm the duplicate-email lookup used the submitted email address.
      expect(userModelMock.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      // Confirm the created user payload included the generated OTP and a real expiry timestamp.
      expect(userModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: 'Test User',
          email: 'test@example.com',
          password: 'secret1',
          avatar: 'https://example.com/avatar.png',
          address: 'Dhaka',
          otp: '654321',
          otpExp: expect.any(Date),
        })
      );
      // Confirm the signup flow attempted to send the verification email.
      expect(mailServiceMock).toHaveBeenCalledTimes(1);
      // Confirm the controller responded with the created status code.
      expect(res.status).toHaveBeenCalledWith(201);
      // Confirm the controller returned only the public user fields in the JSON response.
      expect(res.json).toHaveBeenCalledWith({
        message: 'Sign Up successfull',
        user: {
          fullname: 'Test User',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.png',
          address: 'Dhaka',
        },
      });
    });
  });

  // Group the login tests together because they share the same controller entry point.
  describe('logIn', () => {
    // Verify that login stores both cookies and returns the public user payload for a valid account.
    it('logs in a verified user and sets auth cookies', async () => {
      // Build a request body that satisfies the Zod login schema in the controller.
      const req = {
        body: {
          email: 'test@example.com',
          password: 'secret1',
        },
      };
      // Create a fresh fake response object for this individual test case.
      const res = createResponse();
      // Create a fake user document with the fields and method that the login controller expects.
      const foundUser = {
        _id: 'user-id-1',
        fullname: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.png',
        address: 'Dhaka',
        role: 'user',
        isVerified: true,
        isBanned: false,
        comparePassword: vi.fn().mockResolvedValue(true),
      };
      // Create a fake query object because the controller calls .select on the query result.
      const selectQuery = {
        select: vi.fn().mockResolvedValue(foundUser),
      };

      // Set the JWT secrets expected by the login controller before token generation happens.
      process.env.JWT_ACCESS_SECRET = 'access-secret-for-tests';
      // Set the refresh secret expected by the login controller before token generation happens.
      process.env.JWT_REFRESH_SECRET = 'refresh-secret-for-tests';
      // Make the user lookup return our fake query object with a .select method.
      userModelMock.findOne.mockReturnValue(selectQuery);
      // Make the access-token helper return a predictable token value.
      generateAccessTokenMock.mockReturnValue('access-token-value');
      // Make the refresh-token helper return a predictable token value.
      generateRefreshTokenMock.mockReturnValue('refresh-token-value');

      // Run the login controller with the arranged request and response objects.
      await loginController.logIn(req, res);

      // Confirm the controller looked up the user by the submitted email.
      expect(userModelMock.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      // Confirm the controller requested the hidden password field from the model.
      expect(selectQuery.select).toHaveBeenCalledWith('+password');
      // Confirm the controller compared the submitted password with the stored password.
      expect(foundUser.comparePassword).toHaveBeenCalledWith('secret1');
      // Confirm the controller stored the access token as an HTTP-only cookie.
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token-value',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      // Confirm the controller stored the refresh token as an HTTP-only cookie.
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-value',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      // Confirm the controller responded with the success status code.
      expect(res.status).toHaveBeenCalledWith(200);
      // Confirm the controller returned the expected public login payload.
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: {
          _id: 'user-id-1',
          fullname: 'Test User',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.png',
          address: 'Dhaka',
          role: 'user',
          isVerified: true,
        },
      });
    });
  });
});
