import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var __candimatchMongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__candimatchMongooseCache ?? { conn: null, promise: null };
globalThis.__candimatchMongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  const uri = process.env.MONGODB_URI;
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;

  if (!uri) {
    throw new Error(
      "MONGODB_URI não está definida. Configure-a em .env.local (veja .env.example)."
    );
  }

  if ((username && !password) || (!username && password)) {
    throw new Error(
      "MONGODB_USERNAME e MONGODB_PASSWORD devem ser configuradas juntas (ou nenhuma das duas)."
    );
  }

  if (!cache.promise) {
    const options: mongoose.ConnectOptions = { bufferCommands: false };

    if (username && password) {
      options.user = username;
      options.pass = password;
    }

    cache.promise = mongoose.connect(uri, options);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
