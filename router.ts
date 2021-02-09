import { Router } from 'https://deno.land/x/oak/mod.ts';
// files
import {
  getProducts,
  getProduct,
  addProduct,
  editProduct,
  deleteProduct,
} from './controllers/products.ts';

// initiate Oak Router
const router = new Router();

// Routes
router.get('/api/v1/products', getProducts);
router.get('/api/v1/products/:id', getProduct);
router.post('/api/v1/products', addProduct);
router.put('/api/v1/products/:id', editProduct);
router.delete('/api/v1/products/:id', deleteProduct);

export default router;
