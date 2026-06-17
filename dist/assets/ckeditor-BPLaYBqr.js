import{S as $,bJ as V,bK as F,m as E,v as N,G,bH as H,T as q,Q as J,o as Q,R as X,bL as R}from"./index-CUT9AJRF.js";var Y=typeof global=="object"&&global&&global.Object===Object&&global,z=typeof self=="object"&&self&&self.Object===Object&&self,K=Y||z||Function("return this")(),h=K.Symbol,P=Object.prototype,Z=P.hasOwnProperty,ee=P.toString,p=h?h.toStringTag:void 0;function ne(e){var n=Z.call(e,p),o=e[p];try{e[p]=void 0;var i=!0}catch{}var u=ee.call(e);return i&&(n?e[p]=o:delete e[p]),u}var te=Object.prototype,re=te.toString;function ie(e){return re.call(e)}var ae="[object Null]",oe="[object Undefined]",D=h?h.toStringTag:void 0;function se(e){return e==null?e===void 0?oe:ae:D&&D in Object(e)?ne(e):ie(e)}function ue(e){return e!=null&&typeof e=="object"}var ce="[object Symbol]";function le(e){return typeof e=="symbol"||ue(e)&&se(e)==ce}var fe=/\s/;function de(e){for(var n=e.length;n--&&fe.test(e.charAt(n)););return n}var me=/^\s+/;function ge(e){return e&&e.slice(0,de(e)+1).replace(me,"")}function j(e){var n=typeof e;return e!=null&&(n=="object"||n=="function")}var _=NaN,be=/^[-+]0x[0-9a-f]+$/i,pe=/^0b[01]+$/i,ye=/^0o[0-7]+$/i,ve=parseInt;function x(e){if(typeof e=="number")return e;if(le(e))return _;if(j(e)){var n=typeof e.valueOf=="function"?e.valueOf():e;e=j(n)?n+"":n}if(typeof e!="string")return e===0?e:+e;e=ge(e);var o=pe.test(e);return o||ye.test(e)?ve(e.slice(2),o?2:8):be.test(e)?_:+e}var O=function(){return K.Date.now()},Te="Expected a function",he=Math.max,Ie=Math.min;function Ee(e,n,o){var i,u,c,d,r,l,g=0,y=!1,t=!1,s=!0;if(typeof e!="function")throw new TypeError(Te);n=x(n)||0,j(o)&&(y=!0,t="maxWait"in o,c=t?he(x(o.maxWait)||0,n):c,s="trailing"in o?!!o.trailing:s);function f(a){var m=i,b=u;return i=u=void 0,g=a,d=e.apply(b,m),d}function v(a){return g=a,r=setTimeout(T,n),y?f(a):d}function W(a){var m=a-l,b=a-g,k=n-m;return t?Ie(k,c-b):k}function w(a){var m=a-l,b=a-g;return l===void 0||m>=n||m<0||t&&b>=c}function T(){var a=O();if(w(a))return C(a);r=setTimeout(T,W(a))}function C(a){return r=void 0,s&&i?f(a):(i=u=void 0,d)}function M(){r!==void 0&&clearTimeout(r),g=0,i=l=u=r=void 0}function A(){return r===void 0?d:C(O())}function I(){var a=O(),m=w(a);if(i=arguments,u=this,l=a,m){if(r===void 0)return v(l);if(t)return clearTimeout(r),r=setTimeout(T,n),f(l)}return r===void 0&&(r=setTimeout(T,n)),d}return I.cancel=M,I.flush=A,I}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 *//**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */new Array(256).fill("").map((e,n)=>("0"+n.toString(16)).slice(-2));/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Oe(e,n){const o=e.extraPlugins||[];return{...e,extraPlugins:[...o,...n.filter(i=>!o.includes(i))]}}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function B(e){return!!e&&/^\d+\.\d+\.\d+/.test(e)}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function L(e){return e?["nightly","alpha","internal","nightly-","staging"].some(n=>e.includes(n)):!1}function Se(e){return B(e)||L(e)}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function je(e){if(!B(e))throw new Error(`Invalid semantic version: ${e||"<blank>"}.`);const[n,o,i]=e.split(".");return{major:Number.parseInt(n,10),minor:Number.parseInt(o,10),patch:Number.parseInt(i,10)}}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function we(e){if(L(e))return 3;const{major:n}=je(e);switch(!0){case n>=44:return 3;case n>=38:return 2;default:return 1}}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ce(){const{CKEDITOR_VERSION:e,CKEDITOR:n}=window;return Se(e)?{source:n?"cdn":"npm",version:e}:null}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function ke(){const e=Ce();return e?we(e.version):null}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function U(e,n){switch(n||(n=ke()||void 0),n){case 1:case 2:return e===void 0;case 3:return e==="GPL";default:return!1}}/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ve(e,n){return function(i){U(i.config.get("licenseKey"))||i.on("collectUsageData",(u,{setUsageData:c})=>{c(`integration.${e}`,n)})}}/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */const Ne=Ve("vue",{version:"7.3.0",frameworkVersion:R});/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */function De(e){return U(e.licenseKey)?e:Oe(e,[Ne])}const S="Lock from Vue integration (@ckeditor/ckeditor5-vue)",_e=300,Re=$({name:"CKEditor",__name:"ckeditor",props:V({editor:{},config:{default:()=>({})},tagName:{default:"div"},disabled:{type:Boolean,default:!1},disableTwoWayDataBinding:{type:Boolean,default:!1}},{modelValue:{type:String,default:""},modelModifiers:{}}),emits:V(["ready","destroy","blur","focus","input","update:modelValue"],["update:modelValue"]),setup(e,{expose:n,emit:o}){const i=F(e,"modelValue"),u=e,c=o,d=E(),r=E(),l=E();n({instance:r,lastEditorData:l}),N(i,t=>{r.value&&t!==l.value&&r.value.data.set(t)}),N(()=>u.disabled,t=>{t?r.value.enableReadOnlyMode(S):r.value.disableReadOnlyMode(S)});function g(){const t=window.CKEDITOR_VERSION;if(!t)return console.warn('Cannot find the "CKEDITOR_VERSION" in the "window" scope.');const[s]=t.split(".").map(Number);s>=42||t.startsWith("0.0.0")||console.warn("The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.")}function y(t){const s=Ee(f=>{if(u.disableTwoWayDataBinding)return;const v=l.value=t.data.get();c("update:modelValue",v,f,t),c("input",v,f,t)},_e,{leading:!0});t.model.document.on("change:data",s),t.editing.view.document.on("focus",f=>{c("focus",f,t)}),t.editing.view.document.on("blur",f=>{c("blur",f,t)})}return g(),G(()=>{const t=De(Object.assign({},u.config));i.value&&(t.initialData=i.value),u.editor.create(d.value,t).then(s=>{r.value=H(s),y(s),i.value!==t.initialData&&s.data.set(i.value),u.disabled&&s.enableReadOnlyMode(S),c("ready",s)}).catch(s=>{console.error(s)})}),q(()=>{r.value&&(r.value.destroy(),r.value=void 0),c("destroy")}),(t,s)=>(Q(),J(X(t.tagName),{ref_key:"element",ref:d},null,512))}});/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 *//* istanbul ignore if -- @preserve */if(!R.startsWith("3."))throw new Error("The CKEditor plugin works only with Vue 3+. For more information, please refer to https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs-v3.html");export{Re as _};
