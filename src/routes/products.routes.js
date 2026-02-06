import express from 'express';
import verifyToken from '../middlewares/verifyToken.auth.js';
import { getAllProducts, getAllProductVariants } from '../controllers/products.controller.js';
import { validateUuidUrlParam } from '../middlewares/parseUUIDs.js';
const router = express.Router();

router.use(verifyToken)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Endpoint to get all details of all products.
 *     description: It retrieves the main product's variant details, as well as the base product information. Can filter by category using query parameter.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Optional category filter
 *     responses:
 *       200:
 *         description: Details of all available products or products of the selected category.
 *       404:
 *         description: That category does not exist.
 */
router.get('/', verifyToken, getAllProducts);

/**
 * @swagger
 * /products/{productId}/variants:
 *   get:
 *     summary: Endpoint to get all variants of a product with a given UUID in endpoint.
 *     description: It retrieves the base product's details Object, product tags Array, and an Array of Objects of all product variants of the product.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID v7 of the product
 *     responses:
 *       200:
 *         description: Details of all available product variants.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               type: 1
 *               message: Details of all available product variants
 *               data:
 *                 products_details:
 *                  -  "product_id": "019c28e5-33d4-7666-bd05-9dbf24baa7db"
 *                     "product_name": "Ergonomic Marble Mouse"
 *                     "company_name": "Bednar, Johnston and Koch"
 *                     "category_name": "HAIR"
 *                     "product_rating": "4"
 *                     "details": "Calculus ipsum corrigo somniculosus ara munt iusto tutis theca ater."
 *                     "whats_in_it": "speculum bos blandior utilis carus celebrer a usus"
 *                     "how_to_use": "Quis tandem argentum defungoro. Beibero deleniti."
 *                 "product_tags": [
 *                    "Cruelty Free",
 *                    "Paraben Free",
 *                    "Vegan",
 *                    "Suitable for Sensitive Skin"
 *                 ]
 *                 "product_variants": [
 *                      {
 *                        "id": "019c28e5-33d8-7e5f-9ff7-22223b415fd2",
 *                        "name": "Tasty",
 *                        "main": false,
 *                        "price_retail": "67.75",
 *                        "image_url": "https://picsum.photos/seed/hS6Hx5e0t/2906/1219",
 *                        "color_code": "#8ead33"
 *                      },
 *                      {
 *                        "id": "019c28e5-33d5-7384-b936-d1a51cd7b6c8",
 *                        "name": "Ergonomic",
 *                        "main": true,
 *                        "price_retail": "60.75",
 *                        "image_url": "https://picsum.photos/seed/zwqjqLBTrB/2677/3317",
 *                        "color_code": "#1ddf0f"
 *                      },
 *                 ]
 *       404:
 *         description: No product variants found of this product id.
 */
router.get('/:productId/variants', verifyToken, validateUuidUrlParam, getAllProductVariants);
// router.post(
// 	'/profile-picture-upload',
// 	verifyToken,
// 	uploadImages.single('userProfilePicture'),
// 	uploadUserProfilePicture
// );

export default router;
