export type SurfaceQuality="auto"|"high"|"medium"|"low";
export function qualityScale(mode:string,dpr:number):number {
  if(mode==="low")return .85;
  return Math.min(dpr,mode==="high"?1.75:mode==="medium"?1:1.25);
}
