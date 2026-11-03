import { bounds, rgb, stepWorld, type MaterialTokens, type MaterialWorld } from "./material-core";
import { vertexShader, fragmentShader } from "./material-shader";
import { qualityScale } from "./quality";
export type MaterialProfilerHooks={begin(gl:WebGL2RenderingContext,timestamp:number):void;end(draws:number):void};
export type MaterialStage = { element: HTMLElement; world: MaterialWorld; width: number; height: number; tokens: MaterialTokens; light: boolean; visible: boolean; rect: DOMRect | null; loading?: boolean; sync?: () => boolean | void };
/** One context, one scheduler, scissored visible stages. DOM is measured on layout events only. */
export class MaterialRenderer {
  stages = new Set<MaterialStage>();
  frame = 0;
  private measureFrame = 0;
  previous = 0;
  fps = 0;
  draws = 0;
  quality = "auto";
  profiler:MaterialProfilerHooks|null=null;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private uniforms = new Map<string, WebGLUniformLocation | null>();
  private positions = new Float32Array(48);
  private radii = new Float32Array(12);
  private colors = new Float32Array(36);
  private waves = new Float32Array(18);
  private opacity = new Float32Array(12);
  private groups = new Float32Array(48);
  private lightWeights = new Float32Array(12);
  private contacts = new Float32Array(32);
  private contactAxes = new Float32Array(16);
  private backings = new Float32Array(48);
  private backingParams = new Float32Array(24);
  private bodyGroup = new Int32Array(12);
  private disposed = false;
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  private observer = new ResizeObserver(() => this.measure());
  private intersection = new IntersectionObserver(entries => {
    for (const entry of entries) for (const stage of this.stages) if (stage.element === entry.target) stage.visible = entry.isIntersecting;
    this.wake();
  });
  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL 2 is unavailable. The CSS material fallback is active.");
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!; gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message ?? "Material shader failed"); }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexShader), fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
    this.program = gl.createProgram()!; gl.attachShader(this.program, vertex); gl.attachShader(this.program, fragment); gl.linkProgram(this.program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program) ?? "Material program failed");
    gl.useProgram(this.program);
    this.buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(this.program, "position"); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    window.addEventListener("resize", this.measure); window.addEventListener("scroll", this.measure, { passive: true });
    document.addEventListener("visibilitychange", this.visibility);
    canvas.addEventListener("webglcontextlost", this.contextLost);
    this.reduced.addEventListener("change", this.wake);
    this.measure();
  }
  private u(name: string) { if (!this.uniforms.has(name)) this.uniforms.set(name, this.gl.getUniformLocation(this.program, name)); return this.uniforms.get(name)!; }
  capabilities(){const ext=this.gl.getExtension("WEBGL_debug_renderer_info");return{vendor:ext?String(this.gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)):null,renderer:ext?String(this.gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):null,gpuTimerAvailable:!!this.gl.getExtension("EXT_disjoint_timer_query_webgl2")};}
  setQuality(mode:string){this.quality=mode;this.measure();}
  add(stage: MaterialStage) { if(this.disposed)return()=>{};this.stages.add(stage); this.observer.observe(stage.element); this.intersection.observe(stage.element); this.measure(); return () => { this.stages.delete(stage); this.observer.unobserve(stage.element); this.intersection.unobserve(stage.element); this.wake(); }; }
  measure = () => {
    if(this.disposed||this.measureFrame)return;
    this.measureFrame=requestAnimationFrame(this.measureNow);
  };
  private measureNow = () => {
    this.measureFrame=0;
    if(this.disposed)return;
    const scale = qualityScale(this.quality,devicePixelRatio);
    const width = Math.round(innerWidth * scale), height = Math.round(innerHeight * scale);
    if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
    for (const stage of this.stages) stage.rect = stage.element.getBoundingClientRect();
    this.wake();
  };
  wake = () => { if (!this.disposed && !this.frame && !document.hidden) { this.previous = 0; this.frame = requestAnimationFrame(this.render); } };
  private visibility = () => { cancelAnimationFrame(this.frame); this.frame = 0; if (!document.hidden) this.wake(); };
  private contextLost = (event: Event) => { event.preventDefault(); this.dispose(); this.canvas.dispatchEvent(new Event("material:fallback")); };
  private render = (now: number) => {
    if(this.disposed)return;
    this.frame = 0;
    const frameSeconds = this.previous ? (now - this.previous) / 1000 : 1 / 60;
    const dt = Math.min(frameSeconds, .05);
    this.previous = now;
    if (frameSeconds > 0) this.fps = this.fps ? this.fps * .9 + (1 / frameSeconds) * .1 : 1 / frameSeconds;
    const gl = this.gl, scale = this.canvas.width / innerWidth;
    this.profiler?.begin(gl,now);
    gl.disable(gl.SCISSOR_TEST); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.SCISSOR_TEST); gl.useProgram(this.program);
    let active = false; this.draws = 0;
    for (const stage of this.stages) {
      const rect = stage.rect;
      if (!stage.visible || !rect || rect.bottom < 0 || rect.top > innerHeight || rect.width < 1) continue;
      active = stepWorld(stage.world, dt, this.reduced.matches) || active;
      active=!!stage.sync?.()||active;
      const w = stage.world, t = stage.tokens;
      gl.viewport(Math.round(rect.left*scale), Math.round((innerHeight-rect.bottom)*scale), Math.round(rect.width*scale), Math.round(rect.height*scale));
      gl.scissor(Math.max(0,Math.round(rect.left*scale)), Math.max(0,Math.round((innerHeight-rect.bottom)*scale)), Math.round(rect.width*scale), Math.round(rect.height*scale));
      const visibleBodies=w.bodies.filter(b=>b.opacity>.001);
      const count = Math.min(visibleBodies.length,12);
      if(!count)continue;
      for (let i=0;i<count;i++) { const b=visibleBodies[i]; this.positions.set([b.x,b.y,b.width,b.height],i*4); this.radii[i]=Math.min(b.radius*t.radius/40,b.width/2,b.height/2); this.colors.set(rgb(b.color),i*3);this.opacity[i]=b.opacity; }
      const lights=w.mergeMode==="none"?visibleBodies.map(b=>({...b,weight:b.opacity})):w.lights;
      lights.forEach((b,i)=>{this.groups.set([b.x,b.y,b.width,b.height],i*4);this.lightWeights[i]=b.weight;});
      const common=bounds(visibleBodies);
      for(let i=0;i<w.waves.length;i++)this.waves.set([w.waves[i].x,w.waves[i].y,w.waves[i].age],i*3);
      gl.uniform2f(this.u("size"),stage.width,stage.height); gl.uniform1i(this.u("count"),count);
      gl.uniform4fv(this.u("shapes[0]"),this.positions); gl.uniform1fv(this.u("radii[0]"),this.radii); gl.uniform3fv(this.u("colors[0]"),this.colors);
      gl.uniform1fv(this.u("bodyOpacity[0]"),this.opacity);
      gl.uniform1i(this.u("separateColors"),w.mergeMode==="none"?1:0);
      gl.uniform4fv(this.u("groups[0]"),this.groups);gl.uniform1i(this.u("groupCount"),lights.length);
      gl.uniform1fv(this.u("lightWeights[0]"),this.lightWeights);
      w.contacts.forEach((c,i)=>{this.contacts.set([c.x,c.y,c.amount,c.span],i*4);this.contactAxes.set([c.nx,c.ny],i*2);});
      gl.uniform1i(this.u("contactCount"),w.contacts.length);gl.uniform4fv(this.u("contacts[0]"),this.contacts);gl.uniform2fv(this.u("contactAxes[0]"),this.contactAxes);
      w.backings.forEach((b,i)=>{this.backings.set([b.x,b.y,b.width,b.height],i*4);this.backingParams.set([Math.min(b.radius*t.radius/40,b.width/2,b.height/2),b.flat],i*2);});
      visibleBodies.slice(0,12).forEach((b,i)=>{this.bodyGroup[i]=w.backings.findIndex(g=>g.ids.includes(b.id));});
      gl.uniform1i(this.u("geometryGroupCount"),w.backings.length);gl.uniform4fv(this.u("backings[0]"),this.backings);gl.uniform2fv(this.u("backingParams[0]"),this.backingParams);gl.uniform1iv(this.u("bodyGroup[0]"),this.bodyGroup);
      gl.uniform4f(this.u("unionBounds"),common.x,common.y,common.width,common.height);
      gl.uniform1f(this.u("alignedBlend"),w.alignedBlend);gl.uniform1f(this.u("alignedRadius"),this.radii[0]);
      gl.uniform1f(this.u("reactionAge"),w.reactionAge);
      gl.uniform4f(this.u("loading"),w.loading.progress,w.loading.phase,w.loading.rate,stage.loading?1:0);
      gl.uniform4f(this.u("params"),t.roughness,t.transmission,t.light,t.edge);
      gl.uniform4f(this.u("interaction"),w.pointer.x,w.pointer.y,w.hover,0);
      gl.uniform1f(this.u("mergeRadius"),w.mergeMode==="none"?0:12); gl.uniform1f(this.u("theme"),stage.light?1:0);
      gl.uniform1f(this.u("state"),["idle","error","success","loading"].indexOf(w.state)); gl.uniform1f(this.u("time"),w.elapsed);
      gl.uniform2f(this.u("stateBlend"),w.stateBlend.error,w.stateBlend.success);
      const emission=w.message.active&&w.message.sourceId?Math.sin(Math.min(1,w.message.age/.38)*Math.PI)*Math.exp(-w.message.age*2)*3.8:0;
      gl.uniform3f(this.u("emission"),w.message.origin.x,w.message.origin.y,emission);
      gl.uniform1f(this.u("emissionRadius"),w.message.age*100);
      gl.uniform1i(this.u("waveCount"),w.waves.length); gl.uniform3fv(this.u("waves[0]"),this.waves);
      gl.drawArrays(gl.TRIANGLES,0,6); this.draws++;
    }
    this.profiler?.end(this.draws);
    if(active)this.frame=requestAnimationFrame(this.render);
  };
  dispose() {
    if(this.disposed)return;
    this.disposed=true;
    cancelAnimationFrame(this.frame);cancelAnimationFrame(this.measureFrame);this.measureFrame=0; this.frame=0; this.observer.disconnect(); this.intersection.disconnect();
    window.removeEventListener("resize",this.measure); window.removeEventListener("scroll",this.measure); document.removeEventListener("visibilitychange",this.visibility);
    this.canvas.removeEventListener("webglcontextlost",this.contextLost); this.reduced.removeEventListener("change",this.wake);
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buffer);
  }
}
