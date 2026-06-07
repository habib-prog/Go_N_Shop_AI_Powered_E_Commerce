const productservices = require("../services/productServices.js");

exports.addProduct = async (req, res) => {
    try {
        const savedProduct = await productservices.createNewProduct(req.body);
        res.status(200).json({
            message: "Product Added Successfully.",
            status: true,
            data: savedProduct
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false,
            data: null
        })
    }
};

