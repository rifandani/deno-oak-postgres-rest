import { RouterContext } from 'https://deno.land/x/oak/mod.ts';
// files
import { Product } from '../interfaces/index.ts';
import { runQuery } from '../services/postgres.ts';

let products: Product[] = [
  {
    id: '1',
    name: 'Paper',
    price: 500,
  },
  {
    id: '2',
    name: 'Pen',
    price: 2000,
  },
  {
    id: '3',
    name: 'Pencil',
    price: 1500,
  },
];

// @desc    GET products
// @route   GET /api/v1/products
export const getProducts = async (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const res = await runQuery('SELECT id, name, price FROM products');

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      products: res.rows,
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.message,
      err,
    };
  }
};

// @desc    GET product
// @route   GET /api/v1/products/:id
export const getProduct = (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  const id = ctx.params.id;
  const product = products.find((product) => product.id === id);

  // product not found
  if (product) {
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      product,
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      msg: 'Product not found',
    };
  }
};

// @desc    POST product
// @route   POST /api/v1/products
export const addProduct = async (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  // req body kosong
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      msg: 'No input body',
    };
  } else {
    try {
      const newProduct: Product = await ctx.request.body({
        type: 'json',
      }).value;

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        msg: 'Product added',
        newProduct,
      };
    } catch (err) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        msg: 'Product add error',
      };
    }
  }
};

// @desc    PUT product
// @route   PUT /api/v1/products/:id
export const editProduct = async (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      msg: 'No input body',
    };
    return;
  }

  const id = ctx.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    const reqBody: Product = await ctx.request.body({
      type: 'json',
    }).value;

    products = products.map((pro) =>
      pro.id === id
        ? {
            ...pro,
            ...reqBody,
          }
        : pro,
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: 'Product updated',
      updatedProduct: products.find((p) => p.id === id),
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      msg: 'Product not found',
    };
  }
};

// @desc    DELETE product
// @route   DELETE /api/v1/products/:id
export const deleteProduct = (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  const id = ctx.params.id;
  const product = products.find((product) => product.id === id);

  if (product) {
    products = products.filter((product) => product.id !== id);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: 'Product removed',
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      msg: 'Product not found',
    };
  }
};
