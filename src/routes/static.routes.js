import express from 'express';
const router = express.Router();

// http://localhost:3000/static/images/uploads/userProfilePicture-1771252323550-280709467.jpg

/**
 *  @swagger
 *  /static/{image_url}:
 *   get:
 *     summary: Endpoint to get static content.
 *     description: Just append the image url to this endpoint to get the static content
 *     tags:
 *       - Static
 *     parameters:
 *       - in: path
 *         name: image_url
 *         schema:
 *           type: string
 *           minimum: 1
 *         description: The profile picture of the user to return. Also can be used to fetch any publicly available static content.
 *     responses:
 *         '200':
 *             description: A sample image
 *             content:
 *               image/jpeg:
 *                   schema:
 *                   type: string
 *                   format: binary
 *               image/png:
 *                   schema:
 *                   type: string
 *                   format: binary
 *     
 */
router.use('/', express.static('./public'));

export default router;