import mongoose from "mongoose";
const URI=process.env.MONGODB_URI;
type Cache={conn:typeof mongoose|null;promise:Promise<typeof mongoose>|null};
const g=globalThis as typeof globalThis & {mongooseCache?:Cache};
const cache=g.mongooseCache??{conn:null,promise:null}; g.mongooseCache=cache;
export function hasDatabase(){return Boolean(URI)}
export async function connectDB(){if(!URI) throw new Error("MONGODB_URI is not configured"); if(cache.conn)return cache.conn; if(!cache.promise)cache.promise=mongoose.connect(URI,{bufferCommands:false}); cache.conn=await cache.promise; return cache.conn}
