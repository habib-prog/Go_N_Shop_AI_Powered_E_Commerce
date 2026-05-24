const path = require("path");

const controllerPath = path.resolve(
  __dirname,
  "../src/controllers/categoryController.js",
);
const categoryModelPath = path.resolve(
  __dirname,
  "../src/models/CategorySchema.js",
);

const categoryModelMock = {
  findOne: vi.fn(),
  create: vi.fn(),
};

const mockLocalModule = (modulePath, mockExports) => {
  const resolvedModulePath = require.resolve(modulePath);
  require.cache[resolvedModulePath] = {
    id: resolvedModulePath,
    filename: resolvedModulePath,
    loaded: true,
    exports: mockExports,
  };
};

const clearLocalModule = (modulePath) => {
  const resolvedModulePath = require.resolve(modulePath);
  delete require.cache[resolvedModulePath];
};

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockImplementation(() => res);
  res.json = vi.fn().mockImplementation(() => res);
  return res;
};

let categoryController;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  mockLocalModule(categoryModelPath, categoryModelMock);
  clearLocalModule(controllerPath);
  categoryController = require(controllerPath);
});

afterEach(() => {
  clearLocalModule(controllerPath);
  clearLocalModule(categoryModelPath);
});

describe("categoryController", () => {
  describe("CreateCategory", () => {
    it("creates a category and returns the created response", async () => {
      const req = {
        body: {
          name: "Smartphones",
          thumbnail: "https://example.com/smartphones.jpg",
        },
      };
      const res = createResponse();
      const createdCategory = {
        _id: "category-id-1",
        name: "Smartphones",
        thumbnail: "https://example.com/smartphones.jpg",
      };

      categoryModelMock.findOne.mockResolvedValue(null);
      categoryModelMock.create.mockResolvedValue(createdCategory);

      await categoryController.CreateCategory(req, res);

      expect(categoryModelMock.findOne).toHaveBeenCalledWith({
        name: "Smartphones",
      });
      expect(categoryModelMock.create).toHaveBeenCalledWith({
        name: "Smartphones",
        thumbnail: "https://example.com/smartphones.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Category created successfully",
        category: createdCategory,
      });
    });

    it("returns validation errors when the request body is invalid", async () => {
      const req = {
        body: {
          name: "TV",
        },
      };
      const res = createResponse();

      await categoryController.CreateCategory(req, res);

      expect(categoryModelMock.findOne).not.toHaveBeenCalled();
      expect(categoryModelMock.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Validation Failed",
        errors: {
          name: ["Name must be minimum of 3 charecters"],
          thumbnail: ["Invalid input: expected string, received undefined"],
        },
      });
    });

    it("returns 409 when the category already exists", async () => {
      const req = {
        body: {
          name: "Laptops",
          thumbnail: "https://example.com/laptops.jpg",
        },
      };
      const res = createResponse();

      categoryModelMock.findOne.mockResolvedValue({
        _id: "category-id-2",
        name: "Laptops",
      });

      await categoryController.CreateCategory(req, res);

      expect(categoryModelMock.findOne).toHaveBeenCalledWith({
        name: "Laptops",
      });
      expect(categoryModelMock.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Category already exists",
      });
    });
  });
});
