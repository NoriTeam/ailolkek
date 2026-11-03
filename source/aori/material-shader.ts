export const vertexShader = `#version 300 es
in vec2 position;
out vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
export const fragmentShader = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 outputColor;
uniform vec2 size;
uniform int count;
uniform vec4 shapes[12];
uniform float radii[12];
uniform vec3 colors[12];
uniform float bodyOpacity[12];
uniform bool separateColors;
uniform vec4 groups[12];
uniform float lightWeights[12];
uniform int groupCount;
uniform vec4 unionBounds;
uniform float alignedBlend;
uniform float alignedRadius;
uniform float reactionAge;
uniform vec4 loading;
uniform vec4 params;
uniform vec4 interaction;
uniform vec3 waves[6];
uniform int waveCount;
uniform float mergeRadius;
uniform float theme;
uniform float state;
uniform vec2 stateBlend;
uniform vec3 emission;
uniform float emissionRadius;
uniform float time;
uniform int contactCount;
uniform vec4 contacts[8];
uniform vec2 contactAxes[8];
uniform int geometryGroupCount;
uniform int bodyGroup[12];
uniform vec4 backings[12];
uniform vec2 backingParams[12];
float rectDistance(vec2 p,vec4 b,float r){vec2 q=abs(p-b.xy)-b.zw*.5+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float unionDistance(float a,float b){float k=max(mergeRadius,.001);float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
float perimeterLength(vec4 b,float r){return 2.*(b.z+b.w-4.*r)+6.2831853*r;}
float perimeterPosition(vec2 p,vec4 b,float r){
 vec2 q=p-b.xy,c=b.zw*.5-r;float w=2.*c.x,h=2.*c.y,arc=1.5707963*r;
 if(q.y<=-c.y&&abs(q.x)<=c.x)return q.x+c.x;
 if(q.x>=c.x&&q.y<=-c.y)return w+(atan(q.y+c.y,q.x-c.x)+1.5707963)*r;
 if(q.x>=c.x&&abs(q.y)<=c.y)return w+arc+q.y+c.y;
 if(q.x>=c.x&&q.y>=c.y)return w+arc+h+atan(q.y-c.y,q.x-c.x)*r;
 if(q.y>=c.y&&abs(q.x)<=c.x)return w+2.*arc+h+c.x-q.x;
 if(q.x<=-c.x&&q.y>=c.y)return 2.*w+2.*arc+h+(atan(q.y-c.y,q.x+c.x)-1.5707963)*r;
 if(q.x<=-c.x&&abs(q.y)<=c.y)return 2.*w+3.*arc+h+c.y-q.y;
 if(q.x<=-c.x&&q.y<=-c.y)return 2.*w+3.*arc+2.*h+(atan(q.y+c.y,q.x+c.x)+3.1415927)*r;
 if(abs(q.y/c.y)>abs(q.x/c.x))return q.y<0.?q.x+c.x:w+2.*arc+h+c.x-q.x;
 return q.x>0.?w+arc+q.y+c.y:2.*w+3.*arc+h+c.y-q.y;
}
float baseShape(vec2 p){float d=10000.;if(separateColors){for(int i=0;i<12;i++){if(i>=count)break;d=min(d,rectDistance(p,shapes[i],radii[i]));}return d;}for(int g=0;g<12;g++){if(g>=geometryGroupCount)break;float component=10000.;for(int i=0;i<12;i++){if(i>=count)break;if(bodyGroup[i]!=g)continue;component=unionDistance(component,rectDistance(p,shapes[i],radii[i]));}component=max(component,rectDistance(p,backings[g],0.));component=mix(component,rectDistance(p,backings[g],backingParams[g].x),backingParams[g].y);d=min(d,component);}return d;}
float successFront(){float t=clamp(reactionAge/.85,0.,1.);float travel=t*t*(3.-2.*t);return unionBounds.y+unionBounds.w*(.7-travel*1.4);}
float completionBand(vec2 p){return exp(-pow((p.y-successFront())/max(16.,unionBounds.w*.22),2.))*smoothstep(0.,.08,reactionAge)*(1.-smoothstep(.7,.95,reactionAge));}
float loadingMask(vec2 p){float s=perimeterPosition(p,unionBounds,alignedRadius)/max(1.,perimeterLength(unionBounds,alignedRadius));float q=fract((s-loading.y)*3.);float segment=mix(.48,.15,loading.x);return smoothstep(0.,.035,q)*(1.-smoothstep(segment-.035,segment,q));}
float loadingVisibility(){return state>2.5?1.:(state>1.5&&state<2.5?1.-stateBlend.y:0.);}
float shape(vec2 p){
 float d=baseShape(p);
 d-=emission.z*exp(-pow((length(p-emission.xy)-emissionRadius)/9.,2.))*exp(-abs(d)/9.);
 float envelope=smoothstep(0.,.07,reactionAge)*exp(-reactionAge*3.2)*(1.-smoothstep(.65,1.,reactionAge));
 if(state>1.5&&state<2.5)d-=completionBand(p)*2.6*exp(-abs(d)/12.);
 if(state>.5&&state<1.5){float perimeter=max(1.,perimeterLength(unionBounds,alignedRadius));float s=perimeterPosition(p,unionBounds,alignedRadius)/perimeter;float peaks=max(12.,floor(perimeter/16.));float triangle=1.-abs(fract(s*peaks)-.5)*2.;float spikes=pow(max(0.,(triangle-.42)/.58),1.4);d-=spikes*14.*envelope*exp(-abs(d)/18.);}
 if(loading.w>.5)d-=loadingMask(p)*1.35*loadingVisibility()*exp(-abs(d)/10.);
 return d;}
void main(){
 vec2 p=vec2(uv.x,1.-uv.y)*size;
 if(state>.5&&state<1.5)p-=vec2(sin(reactionAge*75.)*1.15,sin(reactionAge*99.)*.55)*smoothstep(0.,.025,reactionAge)*exp(-reactionAge*9.);
 float d=shape(p);
 float aa=max(fwidth(d),.65);
 float coverage=1.-smoothstep(-aa,aa,d);
 vec3 tint=vec3(0.),localTint=vec3(0.);float weights=0.;float closest=10000.,localOpacity=1.;int nearestIndex=0;
 for(int i=0;i<12;i++){if(i>=count)break;float weight=exp(-length(p-shapes[i].xy)/max(max(shapes[i].z,shapes[i].w),1.)*3.);tint+=colors[i]*weight;weights+=weight;float bd=rectDistance(p,shapes[i],radii[i]);if(bd<closest){closest=bd;localOpacity=bodyOpacity[i];localTint=colors[i];nearestIndex=i;}}
 tint/=max(weights,.001);
 if(separateColors)tint=localTint;
 tint=mix(tint,vec3(1.,.28,.43),stateBlend.x*.8);
 tint=mix(tint,vec3(.32,.9,.58),stateBlend.y*.8);
 float rough=params.x,transmission=params.y,intensity=params.z*mix(1.,.24,theme),edge=params.w;
 bool errorState=state>.5&&state<1.5;
 float shadingDistance=errorState?baseShape(p):d;
 vec2 gradient=errorState?vec2(baseShape(p+vec2(1.,0.))-shadingDistance,baseShape(p+vec2(0.,1.))-shadingDistance):vec2(shape(p+vec2(1.,0.))-d,shape(p+vec2(0.,1.))-d);
 float gradientStrength=clamp(length(gradient),0.,1.);
 vec2 n=gradient/max(length(gradient),1.);
 float rim=exp(-abs(d)/1.05)*coverage;
 float bevel=exp(-abs(shadingDistance)/10.)*coverage*gradientStrength*gradientStrength;
 float topLight=clamp(dot(n,normalize(vec2(.65,-.8)))*.5+.5,0.,1.);
 vec3 base=mix(vec3(.055,.047,.10),vec3(.76,.75,.82),theme);
 vec3 color=base+tint*(.12+.14*transmission);
 float vertical=1.-p.y/size.y;
 color+=tint*vertical*.07;
 if(state>1.5&&state<2.5)color+=mix(tint,vec3(1.),.45)*completionBand(p)*(rim*.38+.018);
 for(int i=0;i<12;i++){if(i>=groupCount)break;
  if(separateColors&&i!=nearestIndex)continue;
  vec2 lamp=groups[i].xy+vec2(groups[i].z*.35,-groups[i].w*.48);
  float broad=exp(-length((p-lamp)/max(groups[i].zw,vec2(1.)))*2.4);
  float edgeLight=exp(-length((p-lamp)/max(groups[i].zw,vec2(1.)))*4.5);
  color+=mix(tint,vec3(1.),.18)*broad*intensity*.32*lightWeights[i];
  color+=mix(tint,vec3(1.),.62)*edgeLight*rim*intensity*(.25+.18*(1.-rough))*lightWeights[i];
 }
 if(separateColors)for(int i=0;i<12;i++){if(i>=count)break;if(i==nearestIndex)continue;float proximity=exp(-max(rectDistance(p,shapes[i],radii[i]),0.)/24.)*bodyOpacity[i];color+=colors[i]*proximity*(.065+rim*.20)*intensity;}
 float pointerLight=exp(-length(p-interaction.xy)/65.)*interaction.z;
 color+=tint*pointerLight*intensity*.10;
 color+=mix(tint,vec3(1.),.3)*pointerLight*rim*.20;
 float ripple=0.;
 for(int i=0;i<6;i++){if(i>=waveCount)break;float age=waves[i].z;float radius=age*115.;float ring=exp(-pow((length(p-waves[i].xy)-radius)/8.,2.));ripple+=ring*exp(-age*4.2);}
 color+=mix(tint,vec3(1.),.3)*ripple*.30;
 float loadingStripe=0.;
 float contactHalo=0.;
 for(int i=0;i<8;i++){if(i>=contactCount)break;vec2 q=p-contacts[i].xy,axis=contactAxes[i];float across=dot(q,axis),along=dot(q,vec2(-axis.y,axis.x));float energy=exp(-pow(across/19.,2.)-pow(along/contacts[i].w,2.))*contacts[i].z;vec3 light=mix(tint,vec3(1.),.6);color+=light*energy*intensity*(exp(-abs(d)/3.)*coverage*1.3+exp(-abs(d)/35.)*.20);contactHalo+=energy*.32;}
 if(loading.w>.5){loadingStripe=loadingMask(p)*loadingVisibility();color+=mix(tint,vec3(1.),.7)*rim*loadingStripe*.72;}
 color+=mix(tint,vec3(1.),.5)*rim*(.35+edge)*( .3+topLight*.85)*mix(1.,.18,theme);
 color+=tint*bevel*(.05+topLight*.18)*mix(1.,.3,theme);
 float shadow=exp(-max(shadingDistance,0.)/12.)*.18;
 float halo=exp(-max(d,0.)/18.)*edge*.16+exp(-max(d,0.)/8.)*(loadingStripe*.08+contactHalo);
 float alpha=(coverage*(1.-transmission*.32)+(1.-coverage)*max(shadow,halo))*localOpacity;
 vec3 outside=mix(vec3(.025,.02,.04),mix(tint,vec3(1.),min(contactHalo,.45)),halo/(shadow+halo+.001));
 color=mix(outside,color,coverage);
 outputColor=vec4(color*alpha,alpha);
}`;
