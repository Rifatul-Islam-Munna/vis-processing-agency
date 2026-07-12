import {cookies} from "next/headers"; import {SignJWT,jwtVerify} from "jose"; import {redirect} from "next/navigation"; import {connectDB,hasDatabase} from "@/lib/db"; import {User} from "@/lib/models";
const COOKIE="vis_session"; const secret=new TextEncoder().encode(process.env.AUTH_SECRET||"development-only-change-this-secret-immediately");
export type SessionUser={id:string;name:string;email:string;role:"admin"|"user"};
export async function createSession(user:SessionUser){const token=await new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret);const c=await cookies();c.set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800})}
export async function clearSession(){(await cookies()).set(COOKIE,"",{httpOnly:true,path:"/",expires:new Date(0)})}
export async function getSession():Promise<SessionUser|null>{try{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);return {id:String(payload.id),name:String(payload.name),email:String(payload.email),role:payload.role==="admin"?"admin":"user"}}catch{return null}}
export async function getCurrentUser(){const s=await getSession();if(!s||!hasDatabase())return s;try{await connectDB();const u:any=await User.findById(s.id).lean();if(!u||!u.active)return null;return s}catch{return null}}
export async function requireUser(){const u=await getCurrentUser();if(!u)redirect("/login");return u}
export async function requireAdmin(){const u=await requireUser();if(u.role!=="admin")redirect("/account");return u}
