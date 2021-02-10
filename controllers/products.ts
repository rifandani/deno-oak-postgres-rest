import { RouterContext } from 'https://deno.land/x/oak/mod.ts';
// files
import { TProduct, IProduct } from '../interfaces/index.ts';
import { dbPool, client } from '../services/postgres.ts';

let products: IProduct[] = [
  {
    id: 1,
    name: 'Paper',
    price: 500,
  },
  {
    id: 2,
    name: 'Pen',
    price: 2000,
  },
  {
    id: 3,
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
    await client.connect(); // connectDB
    const res = await client.queryObject<TProduct>('SELECT * FROM products;');

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
  } finally {
    await client.end();
  }
};

// @desc    GET product
// @route   GET /api/v1/products/:id
export const getProduct = async (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const id = ctx.params.id;

    const poolClient = await dbPool.connect(); // connectDB
    const res = await poolClient.queryObject<TProduct>(
      'SELECT id, name, price FROM products WHERE id=$1;',
      id,
    );

    // product not found
    if ((res.rowCount as number) > 0) {
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        product: res.rows[0],
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        msg: 'Product not found',
      };
    }
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: err.message,
      err,
    };
  } finally {
    await dbPool.end();
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
    return;
  }

  try {
    const newProduct: IProduct = await ctx.request.body({
      type: 'json',
    }).value;

    await client.connect(); // connectDB
    const res = await client.queryObject<TProduct>(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *;',
      newProduct.name,
      newProduct.price,
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      msg: 'Product added',
      newProduct: res.rows[0],
    };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: 'Product add error',
    };
  } finally {
    client.end();
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

  try {
    const id = ctx.params?.id;

    await client.connect(); // connectDB
    const res = await client.queryObject(
      'SELECT id, name, price FROM products WHERE id=$1;',
      parseInt(id!),
    );

    if (res.rowCount! > 0) {
      const reqBody: IProduct = await ctx.request.body({
        type: 'json',
      }).value;

      const res2 = await client.queryObject<TProduct>(
        'UPDATE products SET name=$1, price=$2 WHERE id=$3 RETURNING *',
        reqBody.name,
        reqBody.price,
        id,
      );

      // products = products.map((pro) =>
      //   pro.id === parseInt(id!)
      //     ? {
      //         ...pro,
      //         ...reqBody,
      //       }
      //     : pro,
      // );

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        msg: 'Product updated',
        editedProduct: res2.rows[0],
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        msg: 'Product not found',
      };
    }
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      msg: 'product edit error',
    };
  } finally {
    await client.end();
  }
};

// @desc    DELETE product
// @route   DELETE /api/v1/products/:id
export const deleteProduct = async (
  ctx: RouterContext<
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  const id = ctx.params?.id;

  await client.connect();
  const res = await client.queryObject<TProduct>(
    'SELECT * FROM products WHERE id=$1;',
    parseInt(id!),
  );

  if (res.rowCount! > 0) {
    // bisa multiple, tinggal ditambahin di IN
    const res2 = await client.queryObject<TProduct>(
      'DELETE FROM products WHERE id IN ($1) RETURNING *;',
      id,
    );

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      msg: 'Product removed',
      deletedProduct: res2.rows[0],
    };
  } else {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      msg: 'Product not found',
    };
  }
};
