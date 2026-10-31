globalThis.process??={},globalThis.process.env??={};var e=Object.defineProperty,t=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,n=(e,n,r)=>t(e,typeof n==`symbol`?n:n+``,r),r=`Powered by <a href="https://workers.cloudflare.com/product/ai-search" target="_blank" rel="noopener noreferrer">Cloudflare AI Search <svg width="32" height="10" viewBox="0 0 412 186" xmlns="http://www.w3.org/2000/svg" aria-label="Cloudflare" role="img">
  <path fill="#f38020" d="m280.8395,183.31456c11,-26 -4,-38 -19,-38l-148,-2c-4,0 -4,-6 1,-7l150,-2c17,-1 37,-15 43,-33c0,0 10,-21 9,-24a97,97 0 0 0 -187,-11c-38,-25 -78,9 -69,46c-48,3 -65,46 -60,72c0,1 1,2 3,2l274,0c1,0 3,-1 3,-3z"/>
  <path fill="#faae40" d="m330.8395,81.31456c-4,0 -6,-1 -7,1l-5,21c-5,16 3,30 20,31l32,2c4,0 4,6 -1,7l-33,1c-36,4 -46,39 -46,39c0,2 0,3 2,3l113,0l3,-2a81,81 0 0 0 -78,-103"/>
</svg></a>`,i={loadingAriaLabel:`Loading`,errorPrefix:`Error:`,missingApiUrlError:`The api-url attribute is required. Please provide a valid API URL.`,poweredBy:`Powered by`,poweredByLinkLabel:`Cloudflare AI Search`,placeholder:`Search...`,searchButtonLabel:`Search`,searchInputAriaLabel:`Search input`,searchResultsAriaLabel:`Search results`,emptyStateTitle:`Start Searching`,emptyStateDescription:`Enter a query to search for results`,modalEmptyStateDescription:`Start typing to search`,noResultsTitle:`No Results Found`,noResultsDescription:`No results found for "{query}"`,modalNoResultsTitle:`No results found`,modalNoResultsDescription:`No results for "{query}"`,resultsCount:`Found {n} result`,resultsCountPlural:`Found {n} results`,resultsCountOverflow:`Showing {n} of {total} results`,modalResultsCount:`{n} result`,modalResultsCountPlural:`{n} results`,modalResultsCountZero:`0 results`,modalResultsCountError:`Error`,seeMoreResults:`See more results`,groupOther:`Other`,favoriteResults:`Favorites`,recentResults:`Recent`,addFavorite:`Add to favorites`,removeFavorite:`Remove from favorites`,navigateHint:`Navigate`,selectHint:`Select`,closeHint:`Close`,chatTitle:`Chat`,chatPlaceholder:`Type a message...`,chatInputAriaLabel:`Chat message input`,sendButtonLabel:`Send`,sendButtonAriaLabel:`Send message`,chatEmptyTitle:`Start a Conversation`,chatEmptyDescription:`Send a message to begin chatting`,userAvatar:`U`,assistantAvatar:`AI`,unknownError:`Unknown error`,openChatAriaLabel:`Open chat`,clearHistoryAriaLabel:`Clear history`,minimizeAriaLabel:`Minimize`,closeAriaLabel:`Close`,historyTitle:`History`,newChatButton:`New Chat`,clearChatButton:`Clear Chat`,toggleSidebarTitle:`Toggle sidebar`,deleteChatTitle:`Delete chat`,noChatsYet:`No chats yet`,yesterday:`Yesterday`,justNow:`Just now`,minuteAgo:`{n} minute ago`,minutesAgo:`{n} minutes ago`,hourAgo:`{n} hour ago`,hoursAgo:`{n} hours ago`,loadingMessages:[`Searching...`,`Digging through results...`,`Scanning the knowledge base...`,`Finding the best matches...`,`Sifting through the data...`,`Almost there...`,`Looking far and wide...`,`Connecting the dots...`,`Rummaging through pages...`,`Hunting down answers...`]};function a(e){if(!e||typeof e!=`object`)return i;let t={...i};for(let n of Object.keys(e)){let r=e[n];if(r!=null){if(n===`loadingMessages`){Array.isArray(r)&&r.length>0&&(t.loadingMessages=r.filter(e=>typeof e==`string`),t.loadingMessages.length===0&&(t.loadingMessages=i.loadingMessages));continue}typeof r==`string`&&(t[n]=r)}}return t}function o(e,t={}){return e.replace(/\{(\w+)\}/g,(e,n)=>Object.hasOwn(t,n)?String(t[n]):e)}function s(e,t){if(!e)return null;try{let t=JSON.parse(e);if(typeof t!=`object`||!t||Array.isArray(t))throw Error(`translations must be a JSON object`);return t}catch(e){return console.error(`${t}: invalid translations attribute`,e),null}}var c=`
:host {
  /* Colors - Light Mode */
  --search-snippet-primary-color: #2563eb;
  --search-snippet-primary-hover: #0f51dfff;
  --search-snippet-background: #ffffff;
  --search-snippet-surface: #f8f9fa;
  --search-snippet-text-color: #212529;
  --search-snippet-text-secondary: #6c757d;
  --search-snippet-text-description: #495057;
  --search-snippet-border-color: #dee2e6;
  --search-snippet-hover-background: #f1f3f5;
  --search-snippet-focus-ring: #0066cc40;
  --search-snippet-error-color: #dc3545;
  --search-snippet-error-background: #f8d7da;
  --search-snippet-success-color: #28a745;
  --search-snippet-success-background: #d4edda;
  --search-snippet-warning-color: #ffc107;
  --search-snippet-warning-background: #fff3cd;
  
  /* Message Colors */
  --search-snippet-user-message-bg: #0066cc;
  --search-snippet-user-message-text: #ffffff;
  --search-snippet-assistant-message-bg: #f1f3f5;
  --search-snippet-assistant-message-text: #212529;
  --search-snippet-system-message-bg: #fff3cd;
  --search-snippet-system-message-text: #856404;
  
  /* Typography */
  --search-snippet-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                                'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 
                                'Segoe UI Emoji', 'Segoe UI Symbol';
  --search-snippet-font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  --search-snippet-font-size-base: 14px;
  --search-snippet-font-size-sm: 12px;
  --search-snippet-font-size-lg: 16px;
  --search-snippet-font-size-xl: 18px;
  --search-snippet-line-height: 1.5;
  --search-snippet-font-weight-normal: 400;
  --search-snippet-font-weight-medium: 500;
  --search-snippet-font-weight-bold: 600;
  
  /* Spacing */
  --search-snippet-spacing-xs: 4px;
  --search-snippet-spacing-sm: 8px;
  --search-snippet-spacing-md: 12px;
  --search-snippet-spacing-lg: 16px;
  --search-snippet-spacing-xl: 24px;
  --search-snippet-spacing-xxl: 32px;
  
  /* Sizing */
  --search-snippet-width: 100%;
  --search-snippet-max-width: 100%;
  --search-snippet-min-width: 320px;
  --search-snippet-max-height: 600px;
  --search-snippet-input-height: 44px;
  --search-snippet-button-height: 36px;
  --search-snippet-icon-size: 20px;
  
  /* Border */
  --search-snippet-border-width: 1px;
  --search-snippet-border-radius: 18px;
  
  /* Shadows */
  --search-snippet-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --search-snippet-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --search-snippet-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --search-snippet-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
  --search-snippet-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  
  /* Animation */
  --search-snippet-transition-fast: 150ms ease;
  --search-snippet-transition: 200ms ease;
  --search-snippet-transition-slow: 300ms ease;
  --search-snippet-animation-duration: 0.2s;
  
  /* Z-index */
  --search-snippet-z-dropdown: 1000;
  --search-snippet-z-modal: 1050;
  --search-snippet-z-popover: 1060;
  --search-snippet-z-tooltip: 1070;
  
  /* Layout */
  display: block;
  width: var(--search-snippet-width);
  max-width: var(--search-snippet-max-width);
  min-width: var(--search-snippet-min-width);
  font-family: var(--search-snippet-font-family);
  font-size: var(--search-snippet-font-size-base);
  line-height: var(--search-snippet-line-height);
  color: var(--search-snippet-text-color);


  /* Search */
  --search-snippet-icon-size: 20px;
  --search-snippet-icon-margin-left: 6px;
  --search-snippet-result-icon-size: 20px;
  --search-snippet-result-icon-color: var(--search-snippet-text-secondary);
  --search-snippet-result-icon-active-color: var(--search-snippet-primary-color);
  --search-snippet-result-item-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  /* Chat Bubble */
  --chat-bubble-button-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  --chat-bubble-window-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  --chat-bubble-button-size: 60px;
  --chat-bubble-button-radius: 50%;
  --chat-bubble-button-icon-size: 28px;
  --chat-bubble-button-icon-color: white;
  --chat-bubble-button-bottom: 20px;
  --chat-bubble-button-right: 20px;
  --chat-bubble-button-z-index: 9999;
  --chat-bubble-position: fixed;


}

:host(:not([theme="dark"])) {
  /* Colors - Light Mode */
  --search-snippet-primary-color: #2563eb;
  --search-snippet-primary-hover: #0f51dfff;
  --search-snippet-background: #ffffff;
  --search-snippet-surface: #f8f9fa;
  --search-snippet-text-color: #212529;
  --search-snippet-text-secondary: #6c757d;
  --search-snippet-text-description: #495057;
  --search-snippet-border-color: #dee2e6;
  --search-snippet-hover-background: #f1f3f5;
  --search-snippet-focus-ring: #0066cc40;
  --search-snippet-error-color: #dc3545;
  --search-snippet-error-background: #f8d7da;
  --search-snippet-success-color: #28a745;
  --search-snippet-success-background: #d4edda;
  --search-snippet-warning-color: #ffc107;
  --search-snippet-warning-background: #fff3cd;
  
  /* Message Colors */
  --search-snippet-user-message-bg: #0066cc;
  --search-snippet-user-message-text: #ffffff;
  --search-snippet-assistant-message-bg: #f1f3f5;
  --search-snippet-assistant-message-text: #212529;
  --search-snippet-system-message-bg: #fff3cd;
  --search-snippet-system-message-text: #856404;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :host(:not([theme="light"])) {
    --search-snippet-primary-color: #2563eb;
    --search-snippet-primary-hover: #0f51dfff;
    --search-snippet-background: #1a1b1e;
    --search-snippet-surface: #25262b;
    --search-snippet-text-color: #c1c2c5;
    --search-snippet-text-secondary: #909296;
    --search-snippet-text-description: #adb5bd;
    --search-snippet-border-color: #373a40;
    --search-snippet-hover-background: #2c2e33;
    --search-snippet-focus-ring: #4dabf740;
    --search-snippet-error-color: #ff6b6b;
    --search-snippet-error-background: #3d1f1f;
    --search-snippet-success-color: #51cf66;
    --search-snippet-success-background: #1f3d24;
    --search-snippet-warning-color: #ffd43b;
    --search-snippet-warning-background: #3d3419;
    
    --search-snippet-user-message-bg: #4dabf7;
    --search-snippet-user-message-text: #1a1b1e;
    --search-snippet-assistant-message-bg: #2c2e33;
    --search-snippet-assistant-message-text: #c1c2c5;
    --search-snippet-system-message-bg: #3d3419;
    --search-snippet-system-message-text: #ffd43b;
    color-scheme: dark;
  }
}

/* Auto theme support */
:host([theme="light"]) {
  color-scheme: light;
}


/* Base reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Metadata-driven result icons are hidden until an external ::part() rule displays them. */
.result-icon {
  display: none;
  flex: 0 0 var(--search-snippet-result-icon-size);
  width: var(--search-snippet-result-icon-size);
  height: var(--search-snippet-result-icon-size);
  color: var(--search-snippet-result-icon-color);
}

a:hover > .result-icon,
a:focus-visible > .result-icon,
a.active > .result-icon {
  color: var(--search-snippet-result-icon-active-color);
}

/* Container */
.container {
  background: var(--search-snippet-background);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  border-radius: var(--search-snippet-border-radius);
  box-shadow: var(--search-snippet-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  padding: var(--search-snippet-spacing-md);
  border-bottom: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  background: var(--search-snippet-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--search-snippet-spacing-md);
}

.header-title {
  font-size: var(--search-snippet-font-size-lg);
  font-weight: var(--search-snippet-font-weight-bold);
  color: var(--search-snippet-text-color);
}

/* Input */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--search-snippet-spacing-sm);
}

.input {
  width: 100%;
  height: var(--search-snippet-input-height);
  padding: var(--search-snippet-spacing-sm) var(--search-snippet-spacing-md);
  font-family: var(--search-snippet-font-family);
  font-size: var(--search-snippet-font-size-base);
  line-height: var(--search-snippet-line-height);
  color: var(--search-snippet-text-color);
  background: var(--search-snippet-background);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  border-radius: var(--search-snippet-border-radius);
  outline: none;
  transition: var(--search-snippet-transition);
}

.input:focus {
  border-color: var(--search-snippet-primary-color);
  box-shadow: 0 0 0 3px var(--search-snippet-focus-ring);
}

.input::placeholder {
  color: var(--search-snippet-text-secondary);
}

.input:disabled {
  background: var(--search-snippet-surface);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Button */
.button {
  height: var(--search-snippet-button-height);
  padding: 0 var(--search-snippet-spacing-lg);
  font-family: var(--search-snippet-font-family);
  font-size: var(--search-snippet-font-size-base);
  font-weight: var(--search-snippet-font-weight-medium);
  color: #ffffff;
  background: var(--search-snippet-primary-color);
  border: none;
  border-radius: var(--search-snippet-border-radius);
  cursor: pointer;
  outline: none;
  transition: var(--search-snippet-transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--search-snippet-spacing-sm);
  white-space: nowrap;
}

.button:hover:not(:disabled) {
  background: var(--search-snippet-primary-hover);
}

.button:focus-visible {
  box-shadow: 0 0 0 3px var(--search-snippet-focus-ring);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-secondary {
  background: var(--search-snippet-surface);
  color: var(--search-snippet-text-color);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
}

.button-secondary:hover:not(:disabled) {
  background: var(--search-snippet-hover-background);
}

/* Content area */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--search-snippet-spacing-md);
}

/* Scrollbar styling */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: var(--search-snippet-surface);
}

.content::-webkit-scrollbar-thumb {
  background: var(--search-snippet-border-color);
  border-radius: var(--search-snippet-border-radius);
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--search-snippet-text-secondary);
}

/* Loading spinner */
.loading {
  display: inline-block;
  width: var(--search-snippet-icon-size);
  height: var(--search-snippet-icon-size);
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Loading message animation */
@keyframes loading-message-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-text {
  font-size: var(--search-snippet-font-size-sm);
  color: var(--search-snippet-text-secondary);
}

.loading-text-animate {
  animation: loading-message-in 0.3s ease-out;
}

/* Error message */
.error {
  padding: var(--search-snippet-spacing-md);
  color: var(--search-snippet-error-color);
  background: var(--search-snippet-error-background);
  border-radius: var(--search-snippet-border-radius);
  font-size: var(--search-snippet-font-size-sm);
}

/* Empty state */
.empty {
  padding: var(--search-snippet-spacing-xl);
  text-align: center;
  color: var(--search-snippet-text-secondary);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focus visible polyfill */
.focus-visible:focus {
  outline: 2px solid var(--search-snippet-primary-color);
  outline-offset: 2px;
}

/* Powered by branding - block style (for sidebars) */
.powered-by {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--search-snippet-spacing-xs);
  padding: var(--search-snippet-spacing-sm) var(--search-snippet-spacing-md);
  font-size: var(--search-snippet-font-size-sm);
  color: var(--search-snippet-text-secondary);
  background: var(--search-snippet-surface);
  border-top: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  margin-top: auto;
  flex-shrink: 0;
}

.powered-by svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.powered-by a,
.powered-by-inline a {
  color: var(--search-snippet-text-secondary);
  text-decoration: none;
  transition: color var(--search-snippet-transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.powered-by a:hover,
.powered-by-inline a:hover {
  color: var(--search-snippet-primary-color);
}

/* Powered by branding - inline style (for headers/subtle placement) */
.powered-by-inline {
  font-size: var(--search-snippet-font-size-sm);
  color: var(--search-snippet-text-secondary);
  padding: var(--search-snippet-spacing-xs) 0;
  text-align: center;
}
`,l=`@cf/meta/llama-3.3-70b-instruct-fp8-fast`,u=`You rewrite a multi-turn chat into a single standalone search query for a retrieval system.

Inputs: the full conversation in \`messages\`. The final user message is the one to answer; earlier messages are context only.

Rules:
- Output ONLY the rewritten query as plain text. No preamble, no quotes, no markdown, no explanation.
- Resolve pronouns and references (it, that, they, the second one, the previous one, etc.) using prior turns.
- Inline any entities, names, versions, products, or constraints from earlier turns that the final message depends on.
- Preserve the user's original language and terminology. Do not translate.
- Do not invent facts, sources, dates, or details not present in the conversation.
- If the final user message is already fully self-contained, return it unchanged (modulo trivial cleanup).
- Drop greetings, thanks, and meta questions about the assistant itself; keep only the information need.
- Keep it concise — a search query, not a sentence. Aim for under 200 characters when possible.

Return only the rewritten query.`;function d(e){let t=`message`,n=[];for(let r of e.split(`
`)){let e=r.endsWith(`\r`)?r.slice(0,-1):r;if(e===``||e.startsWith(`:`))continue;let i=e.indexOf(`:`),a=i===-1?e:e.slice(0,i),o=i===-1?``:e.slice(i+1);o.startsWith(` `)&&(o=o.slice(1)),a===`event`?t=o:a===`data`&&n.push(o)}return n.length===0?null:{event:t,data:n.join(`
`)}}function f(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function p(...e){let t={};for(let n of e)if(n)for(let[e,r]of Object.entries(n)){let n=t[e];t[e]=f(n)&&f(r)?p(n,r):r}return t}function m(e,t){if(!f(t))return e;let n=new URLSearchParams;for(let[e,r]of Object.entries(t))r!=null&&n.append(e,String(r));let r=n.toString();if(!r)return e;let i=e.indexOf(`#`),a=i===-1?e:e.slice(0,i),o=i===-1?``:e.slice(i);return`${a}${a.includes(`?`)?`&`:`?`}${r}${o}`}function h(e){if(!f(e))return{};let t={};for(let[n,r]of Object.entries(e))r!=null&&(t[n]=String(r));return t}function g(e){return f(e)?e:void 0}var _=class{constructor(e){n(this,`activeRequests`,new Map),n(this,`baseUrl`),this.baseUrl=e.replace(/\/$/,``)}request(e,t,n,r){let i=t===`search`?`snippet-search`:`snippet-chat-completions`,a=m(`${this.baseUrl}/${t}`,r?.queryParams);return fetch(a,{method:`POST`,body:JSON.stringify(p(g(r?.body),e)),headers:{...h(r?.headers),"Content-Type":`application/json`,Accept:e.stream?`text/event-stream`:`application/json`,"cf-ai-search-source":i},signal:n})}async search(e,t={}){let n=this.generateRequestId(),r=new AbortController,i=t.signal||r.signal;this.registerRequest(n,r);try{let n=await this.request({messages:[{role:`user`,content:e}],stream:!1,ai_search_options:{retrieval:{metadata_only:!0,max_num_results:t.maxResults??30}}},`search`,i,t.request);if(!n.ok)throw Error(`HTTP error! status: ${n.status}`);if(!n.body)throw Error(`Response body is empty`);let r=await n.json();if(r.success&&r.result)return r.result.chunks.map(e=>({type:`result`,id:e.id,title:b(e.item.metadata?.title),description:e.item.metadata?.description?b(e.item.metadata?.description):``,timestamp:e.item.timestamp??void 0,url:e.item.key,image:e.item.metadata?.image||void 0,metadata:{...e.item.metadata,instance_id:e.instance_id}}));throw r.success===!1?Error(r.error):Error(`Unknown error`)}finally{this.unregisterRequest(n)}}async*searchStream(e,t={}){let n=this.generateRequestId(),r=new AbortController,i=t.signal||r.signal;this.registerRequest(n,r);let a=await this.request({messages:[{role:`user`,content:e}],stream:!0,...t.maxResults!==void 0&&{max_num_results:t.maxResults}},`ai-search`,i,t.request);if(!a.ok)throw Error(`HTTP error! status: ${a.status}`);if(!a.body)throw Error(`Response body is empty`);let o=``,s=a.body.getReader(),c=new TextDecoder;for(;;){let{done:e,value:t}=await s.read();if(e)break;let n=c.decode(t,{stream:!0});o+=n}yield{type:`result`,id:``,title:``,description:o.replaceAll(`data: `,``).trim().split(`

`).map(e=>JSON.parse(e)).map(e=>e.response).join(``),url:``,metadata:{}}}async*chat(e,t){let n=new AbortController,r=t?.signal||n.signal,i=t?.stream??!0,a={messages:[...t?.history??[],{role:`user`,content:e}],stream:i};if(t?.queryRewrite){let e=typeof t.queryRewrite==`object`?t.queryRewrite:{};a.ai_search_options={query_rewrite:{enabled:!0,model:e.model??l,rewrite_prompt:e.rewritePrompt??u}}}let o=await this.request(a,`chat/completions`,r);if(!o.ok)throw Error(`HTTP error! status: ${o.status}`);if(!o.body)throw Error(`Response body is empty`);if(!i){yield{type:`text`,message:(await o.json()).choices.map(e=>e.message.content).join(``)};return}yield*this.parseChatStream(o.body)}async*parseChatStream(e){let t=e.getReader(),n=new TextDecoder,r=``,i=e=>{let t=d(e);if(!t||t.event===`chunks`)return null;if(t.data===`[DONE]`)return`done`;try{let e=JSON.parse(t.data).choices?.[0]?.delta?.content;if(typeof e==`string`&&e.length>0)return{type:`text`,message:e}}catch(e){console.error(`AISearchClient: failed to parse SSE chat chunk`,e)}return null};try{for(;;){let{done:e,value:a}=await t.read();if(e)break;r+=n.decode(a,{stream:!0});let o=r.indexOf(`

`);for(;o!==-1;){let e=r.slice(0,o);r=r.slice(o+2);let t=i(e);if(t===`done`)return;t&&(yield t),o=r.indexOf(`

`)}}if(r+=n.decode(),r.trim().length>0){let e=i(r);e&&e!==`done`&&(yield e)}}catch(e){if(e.name===`AbortError`)return;throw e}finally{t.releaseLock()}}cancelRequest(e){let t=this.activeRequests.get(e);t&&(t.controller.abort(),this.unregisterRequest(e))}cancelAllRequests(){for(let[e]of this.activeRequests)this.cancelRequest(e)}registerRequest(e,t){this.activeRequests.set(e,{id:e,controller:t,timestamp:Date.now()})}unregisterRequest(e){this.activeRequests.delete(e)}generateRequestId(){return`req-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}},v=2500;function y(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function b(e){return new DOMParser().parseFromString(e,`text/html`).documentElement.textContent||``}function x(e,t){let n=a(t),r=new Date(e),i=new Date().getTime()-r.getTime();if(i<6e4)return n.justNow;if(i<36e5){let e=Math.floor(i/6e4);return o(e===1?n.minuteAgo:n.minutesAgo,{n:e})}if(i<864e5){let e=Math.floor(i/36e5);return o(e===1?n.hourAgo:n.hoursAgo,{n:e})}return r.toLocaleString(void 0,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})}function S(e=`id`){return`${e}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}function C(e,t){return e===null?t:e}function w(e,t){return e===null?t:e===`true`||e===``}function T(e,t){if(e!==null&&e!==``)try{let t=JSON.parse(e);if(typeof t!=`object`||!t||Array.isArray(t))throw Error(`chat-query-rewrite must be a JSON object`);let n=t,r={};return typeof n.enabled==`boolean`&&(r.enabled=n.enabled),typeof n.model==`string`&&(r.model=n.model),typeof n.rewritePrompt==`string`&&(r.rewritePrompt=n.rewritePrompt),r}catch(e){console.error(`${t}: invalid chat-query-rewrite attribute`,e);return}}function E(e,t){return new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!0})}function D(e){if(!e)throw Error(`API URL is required`);return new _(e)}var O=/^[a-z][a-z0-9+.-]*:/i,k=new Set([`http:`,`https:`,`mailto:`,`tel:`]);function A(e){if(typeof e!=`string`)return``;let t=e.replace(/^[\s\u0000-\u001f\u007f]+|[\s\u0000-\u001f\u007f]+$/g,``);if(t===``)return``;if(!O.test(t))return t;let n;try{n=new URL(t)}catch{return``}return k.has(n.protocol)?t:``}var j=Object.defineProperty,M=(e,t,n)=>t in e?j(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,N=(e,t,n)=>M(e,typeof t==`symbol`?t:t+``,n),P=`
/* Chat container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

/* Messages area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--search-snippet-spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--search-snippet-spacing-md);
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--search-snippet-surface);
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--search-snippet-border-color);
  border-radius: var(--search-snippet-border-radius);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--search-snippet-text-secondary);
}

/* Message */
.chat-message {
  display: flex;
  gap: var(--search-snippet-spacing-sm);
  max-width: 85%;
  animation: slideIn var(--search-snippet-animation-duration) ease-out;
  animation-fill-mode: both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.chat-message-assistant {
  align-self: flex-start;
}

.chat-message-system {
  align-self: center;
  max-width: 100%;
}

/* Message avatar */
.chat-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--search-snippet-font-size-sm);
  font-weight: var(--search-snippet-font-weight-bold);
  background: var(--search-snippet-primary-color);
  color: white;
}

.chat-message-assistant .chat-message-avatar {
  background: var(--search-snippet-surface);
  color: var(--search-snippet-text-color);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
}

/* Message content */
.chat-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--search-snippet-spacing-xs);
  max-width: 100%;
}

.chat-message-content ol, .chat-message-content ul {
  margin-inline-start: 16px;
}

.chat-message-content ol li, .chat-message-content ul li {
  padding-inline-start: 0;
}

.chat-message-bubble {
  padding: var(--search-snippet-spacing-sm) var(--search-snippet-spacing-md);
  border-radius: var(--search-snippet-border-radius);
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* Isolate layout cost of bubble height changes during streaming so
     siblings don't reflow. */
  contain: layout style;
}

.chat-message-user .chat-message-bubble {
  background: var(--search-snippet-user-message-bg);
  color: var(--search-snippet-user-message-text);
  border-top-right-radius: var(--search-snippet-spacing-xs);
}

.chat-message-assistant .chat-message-bubble {
  background: var(--search-snippet-assistant-message-bg);
  color: var(--search-snippet-assistant-message-text);
  border-top-left-radius: var(--search-snippet-spacing-xs);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
}

.chat-message-system .chat-message-bubble {
  background: var(--search-snippet-system-message-bg);
  color: var(--search-snippet-system-message-text);
  text-align: center;
  font-size: var(--search-snippet-font-size-sm);
  padding: var(--search-snippet-spacing-xs) var(--search-snippet-spacing-md);
}

.chat-message-text {
  font-size: var(--search-snippet-font-size-base);
  line-height: 1.5;
  white-space: wrap;
}
.chat-message-text li{
  padding-inline-start: var(--search-snippet-spacing-md);
}

.chat-message-metadata {
  display: flex;
  align-items: center;
  gap: var(--search-snippet-spacing-sm);
  font-size: var(--search-snippet-font-size-sm);
  color: var(--search-snippet-text-secondary);
}

.chat-message-user .chat-message-metadata {
  justify-content: flex-end;
}

.chat-message-time {
  opacity: 0.7;
}

/* Streaming indicator */
.chat-streaming {
  display: flex;
  align-items: center;
  gap: var(--search-snippet-spacing-xs);
}

.chat-streaming-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.4s ease-in-out infinite;
}

.chat-streaming-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.chat-streaming-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-streaming .loading-text {
  margin-left: var(--search-snippet-spacing-xs);
}

/* Input area */
.chat-input-area {
  padding: var(--search-snippet-spacing-md);
  border-top: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  background: var(--search-snippet-surface);
}

.chat-input-wrapper {
  display: flex;
  gap: var(--search-snippet-spacing-sm);
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  min-height: var(--search-snippet-input-height);
  max-height: 120px;
  padding: var(--search-snippet-spacing-sm) var(--search-snippet-spacing-md);
  font-family: var(--search-snippet-font-family);
  font-size: var(--search-snippet-font-size-base);
  line-height: var(--search-snippet-line-height);
  color: var(--search-snippet-text-color);
  background: var(--search-snippet-background);
  border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
  border-radius: var(--search-snippet-border-radius);
  outline: none;
  resize: vertical;
  transition: var(--search-snippet-transition);
}

.chat-input:focus {
  border-color: var(--search-snippet-primary-color);
  box-shadow: 0 0 0 3px var(--search-snippet-focus-ring);
}

.chat-input::placeholder {
  color: var(--search-snippet-text-secondary);
}

.chat-input:disabled {
  background: var(--search-snippet-surface);
  cursor: not-allowed;
  opacity: 0.6;
}

.chat-send-button {
  flex-shrink: 0;
  height: var(--search-snippet-input-height);
  padding: 0 var(--search-snippet-spacing-lg);
}

.chat-send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty chat state */
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--search-snippet-spacing-xxl);
  gap: var(--search-snippet-spacing-md);
  color: var(--search-snippet-text-secondary);
  text-align: center;
  height: 100%;
}

.chat-empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.chat-empty-title {
  font-size: var(--search-snippet-font-size-lg);
  font-weight: var(--search-snippet-font-weight-medium);
  color: var(--search-snippet-text-color);
}

.chat-empty-description {
  font-size: var(--search-snippet-font-size-sm);
}

/* Code blocks in messages */
.chat-message-bubble pre {
  background: var(--search-snippet-surface);
  padding: var(--search-snippet-spacing-sm);
  border-radius: var(--search-snippet-border-radius);
  overflow-x: auto;
  font-family: var(--search-snippet-font-family-mono);
  font-size: var(--search-snippet-font-size-sm);
  margin: var(--search-snippet-spacing-xs) 0;
}

.chat-message-bubble code {
  font-family: var(--search-snippet-font-family-mono);
  font-size: 0.9em;
  background: var(--search-snippet-surface);
  padding: 2px 4px;
  border-radius: var(--search-snippet-border-radius);
}

.chat-message-bubble pre code {
  background: none;
  padding: 0;
}

/* Links in messages */
.chat-message-bubble a {
  color: var(--search-snippet-primary-color);
  text-decoration: underline;
}

.chat-message-bubble a:hover {
  text-decoration: none;
}
`;function F(e){let t=e;t=L(t),t=t.replace(/```([\s\S]*?)```/g,(e,t)=>`<pre><code>${t.trim()}</code></pre>`);let n=t.split(`
`),r=[],i=!1,a=``;for(let e=0;e<n.length;e++){let t=n[e],o=t.match(/^(#{1,6})\s+(.+)$/);if(o){let e=o[1].length,t=o[2];r.push(`<h${e}>${I(t)}</h${e}>`);continue}if(t.match(/^---+$/)){r.push(`<hr />`);continue}if(t.match(/^>\s+/)){let e=t.replace(/^>\s+/,``);r.push(`<blockquote>${I(e)}</blockquote>`);continue}let s=t.match(/^[-*]\s+(.+)$/);if(s){(!i||a!==`ul`)&&(i&&r.push(`</${a}>`),r.push(`<ul>`),i=!0,a=`ul`),r.push(`<li>${I(s[1])}</li>`);continue}let c=t.match(/^\d+\.\s+(.+)$/);if(c){(!i||a!==`ol`)&&(i&&r.push(`</${a}>`),r.push(`<ol>`),i=!0,a=`ol`),r.push(`<li>${I(c[1])}</li>`);continue}if(i&&(r.push(`</${a}>`),i=!1,a=``),t.trim()===``){r.push(`<br />`);continue}r.push(`<p>${I(t)}</p>`)}return i&&r.push(`</${a}>`),r.join(`
`)}function I(e){let t=e;return t=t.replace(/`([^`]+)`/g,`<code>$1</code>`),t=t.replace(/\*\*\*(.+?)\*\*\*/g,`<strong><em>$1</em></strong>`),t=t.replace(/___(.+?)___/g,`<strong><em>$1</em></strong>`),t=t.replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`),t=t.replace(/__(.+?)__/g,`<strong>$1</strong>`),t=t.replace(/\*(.+?)\*/g,`<em>$1</em>`),t=t.replace(/_(.+?)_/g,`<em>$1</em>`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(e,t,n)=>{let r=A(n);return r?`<a href="${r}" target="_blank" rel="noopener noreferrer">${t}</a>`:t}),t}function L(e){let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`};return e.replace(/[&<>"']/g,e=>t[e]||e)}var R=64,z=class{constructor(e,t,n){N(this,`container`),N(this,`client`),N(this,`props`),N(this,`translations`),N(this,`inputElement`,null),N(this,`messagesContainer`,null),N(this,`sendButton`,null),N(this,`messages`,[]),N(this,`isStreaming`,!1),N(this,`currentStreamingMessageId`,null),N(this,`currentChatAbortController`,null),N(this,`loadingMessageInterval`,null),N(this,`loadingMessageIndex`,0),N(this,`pendingScrollFrame`,null),N(this,`handleInputResize`,null),N(this,`handleInputKeydown`,null),N(this,`handleSendClick`,null),this.container=e,this.client=t,this.props=n,this.translations=a(n.translations),this.render(),this.attachEventListeners()}render(){let e=this.translations;this.container.innerHTML=`
      <div class="chat-container">
        <div class="chat-messages">
          ${this.renderEmptyStateHTML()}
        </div>
        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <textarea
              class="chat-input"
              placeholder="${y(this.props.placeholder||e.chatPlaceholder)}"
              aria-label="${y(e.chatInputAriaLabel)}"
              style="height: 40px;"
              rows="1"
            ></textarea>
            <button class="button chat-send-button" aria-label="${y(e.sendButtonAriaLabel)}">
              <span>${y(e.sendButtonLabel)}</span>
            </button>
          </div>
        </div>
      </div>
    `,this.messagesContainer=this.container.querySelector(`.chat-messages`),this.inputElement=this.container.querySelector(`.chat-input`),this.sendButton=this.container.querySelector(`.chat-send-button`)}renderEmptyStateHTML(){let e=this.translations;return`
      <div class="chat-empty">
        <svg class="chat-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div class="chat-empty-title">${y(e.chatEmptyTitle)}</div>
        <div class="chat-empty-description">
          ${y(e.chatEmptyDescription)}
        </div>
      </div>
    `}attachEventListeners(){!this.inputElement||!this.sendButton||(this.handleInputResize=e=>{let t=e.target;t.style.height=`auto`,t.style.height=`${t.scrollHeight}px`},this.inputElement.addEventListener(`input`,this.handleInputResize),this.handleInputKeydown=e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),this.handleSendMessage())},this.inputElement.addEventListener(`keydown`,this.handleInputKeydown),this.handleSendClick=()=>{this.handleSendMessage()},this.sendButton.addEventListener(`click`,this.handleSendClick))}async handleSendMessage(){if(!this.inputElement||this.isStreaming)return;let e=this.inputElement.value.trim();e.length!==0&&(this.inputElement.value=``,this.inputElement.style.height=`auto`,await this.sendMessage(e))}async sendMessage(e){let t=this.messages.map(e=>({role:e.role,content:e.content})),n=this.resolveQueryRewriteOption(t),r={id:S(`msg`),role:`user`,content:e,timestamp:Date.now()};this.addMessage(r),this.renderMessages(!0),this.setStreamingState(!0);let i=S(`msg`),a={id:i,role:`assistant`,content:``,timestamp:Date.now()};this.addMessage(a),this.currentStreamingMessageId=i,this.renderMessages(!0);let o=new AbortController;this.currentChatAbortController=o;try{let r=this.client.chat(e,{history:t,queryRewrite:n,signal:o.signal}),s=``;for await(let e of r)if(e.type===`text`&&e.message)s+=e.message,this.updateStreamingMessage(i,s);else if(e.type===`error`){this.showErrorInMessage(i,e.message||this.translations.unknownError);break}let c=this.messages.findIndex(e=>e.id===i);c!==-1&&(this.messages[c].content=s),this.container.dispatchEvent(E(`message`,{message:a}))}catch(e){this.showErrorInMessage(i,e.message),this.container.dispatchEvent(E(`error`,{error:{message:e.message,code:`CHAT_ERROR`}}))}finally{this.currentChatAbortController===o&&(this.currentChatAbortController=null),this.setStreamingState(!1),this.renderMessages(),this.currentStreamingMessageId=null}}resolveQueryRewriteOption(e){let t=this.props.chatQueryRewrite;return t?.enabled===!1||e.length===0?!1:t&&(t.model!==void 0||t.rewritePrompt!==void 0)?{model:t.model,rewritePrompt:t.rewritePrompt}:!0}addMessage(e){this.messages.push(e),this.renderMessages()}updateStreamingMessage(e,t){let n=this.messages.findIndex(t=>t.id===e);n!==-1&&(this.messages[n].content=t,this.updateStreamingMessageDOM(e,t)||this.renderMessages(!0))}updateStreamingMessageDOM(e,t){if(!this.messagesContainer)return!1;let n=this.messagesContainer.querySelector(`[data-message-id="${CSS.escape(e)}"]`);if(!n)return!1;let r=n.querySelector(`.chat-message-bubble`);if(!r)return!1;let i=this.isNearBottom(),a=r.querySelector(`.chat-message-text`);if(!a){let e=document.createElement(`div`);e.className=`chat-message-text`;let t=r.querySelector(`.chat-streaming`);t?r.insertBefore(e,t):r.appendChild(e),a=e}return a.textContent=t,i&&this.scheduleScrollToBottom(),!0}showErrorInMessage(e,t){let n=this.messages.findIndex(t=>t.id===e);n!==-1&&(this.messages[n].content=`${this.translations.errorPrefix} ${t}`,this.renderMessages())}renderMessages(e=!1){if(!this.messagesContainer)return;if(this.messages.length===0){this.messagesContainer.innerHTML=this.renderEmptyStateHTML();return}let t=this.messages.map(t=>this.renderMessage(t,e&&t.id===this.currentStreamingMessageId)).join(``);this.messagesContainer.innerHTML=t,this.scheduleScrollToBottom()}renderMessage(e,t=!1){let n=this.translations,r=`chat-message-${e.role}`,i=e.role===`user`?n.userAvatar:n.assistantAvatar,a=n.loadingMessages[this.loadingMessageIndex]??``,o=e.content?t?y(e.content):F(e.content):``;return`
      <div class="chat-message ${r}" data-message-id="${y(e.id)}">
        <div class="chat-message-avatar">${y(i)}</div>
        <div class="chat-message-content">
          <div class="chat-message-bubble">
            ${o?`<div class="chat-message-text">${o}</div>`:``}
            ${t?`<div class="chat-streaming"><span class="chat-streaming-dot"></span><span class="chat-streaming-dot"></span><span class="chat-streaming-dot"></span><span class="loading-text">${y(a)}</span></div>`:``}
          </div>
          <div class="chat-message-metadata">
            <span class="chat-message-time">${y(x(e.timestamp,this.translations))}</span>
          </div>
        </div>
      </div>
    `}isNearBottom(){let e=this.messagesContainer;return!e||e.scrollHeight-e.scrollTop-e.clientHeight<R}scheduleScrollToBottom(){this.messagesContainer&&this.pendingScrollFrame===null&&(this.pendingScrollFrame=requestAnimationFrame(()=>{this.pendingScrollFrame=null;let e=this.messagesContainer;e&&(e.scrollTop=e.scrollHeight)}))}setStreamingState(e){this.isStreaming=e,this.inputElement&&(this.inputElement.disabled=e),this.sendButton&&(this.sendButton.disabled=e,this.sendButton.innerHTML=e?`<div class="loading"></div>`:`<span>${y(this.translations.sendButtonLabel)}</span>`),e?this.startLoadingMessages():this.clearLoadingMessages()}startLoadingMessages(){this.clearLoadingMessages();let e=this.translations.loadingMessages;this.loadingMessageIndex=Math.floor(Math.random()*e.length),this.loadingMessageInterval=setInterval(()=>{let e=this.translations.loadingMessages;this.loadingMessageIndex=(this.loadingMessageIndex+1)%e.length,this.isStreaming&&(this.updateLoadingTextDOM(e[this.loadingMessageIndex]??``)||this.renderMessages(!0))},v)}updateLoadingTextDOM(e){if(!this.messagesContainer||!this.currentStreamingMessageId)return!1;let t=this.messagesContainer.querySelector(`[data-message-id="${CSS.escape(this.currentStreamingMessageId)}"]`);if(!t)return!1;let n=t.querySelector(`.chat-streaming .loading-text`);return n?(n.textContent=e,!0):!1}clearLoadingMessages(){this.loadingMessageInterval&&=(clearInterval(this.loadingMessageInterval),null)}getMessages(){return[...this.messages]}clearMessages(){this.currentChatAbortController&&=(this.currentChatAbortController.abort(),null),this.isStreaming&&(this.setStreamingState(!1),this.currentStreamingMessageId=null),this.pendingScrollFrame!==null&&(cancelAnimationFrame(this.pendingScrollFrame),this.pendingScrollFrame=null),this.messages=[],this.renderMessages()}setMessages(e){this.messages=[...e],this.renderMessages()}setProps(e){this.props=e,this.translations=a(e.translations),this.detachEventListeners(),this.render(),this.attachEventListeners(),this.renderMessages(this.isStreaming),this.isStreaming&&this.setStreamingState(!0)}detachEventListeners(){this.inputElement&&(this.handleInputResize&&this.inputElement.removeEventListener(`input`,this.handleInputResize),this.handleInputKeydown&&this.inputElement.removeEventListener(`keydown`,this.handleInputKeydown)),this.sendButton&&this.handleSendClick&&this.sendButton.removeEventListener(`click`,this.handleSendClick),this.handleInputResize=null,this.handleInputKeydown=null,this.handleSendClick=null}destroy(){this.currentChatAbortController&&=(this.currentChatAbortController.abort(),null),this.clearLoadingMessages(),this.pendingScrollFrame!==null&&(cancelAnimationFrame(this.pendingScrollFrame),this.pendingScrollFrame=null),this.isStreaming&&this.client.cancelAllRequests(),this.inputElement&&(this.handleInputResize&&this.inputElement.removeEventListener(`input`,this.handleInputResize),this.handleInputKeydown&&this.inputElement.removeEventListener(`keydown`,this.handleInputKeydown)),this.sendButton&&this.handleSendClick&&this.sendButton.removeEventListener(`click`,this.handleSendClick),this.handleInputResize=null,this.handleInputKeydown=null,this.handleSendClick=null}},B=`chat-bubble-snippet`,V=class extends HTMLElement{constructor(){super(),N(this,`shadow`),N(this,`client`,null),N(this,`chatView`,null),N(this,`container`,null),N(this,`isExpanded`,!1),N(this,`isMinimized`,!1),N(this,`translationsOverride`,null),N(this,`resolvedTranslations`,a(null)),N(this,`chatQueryRewriteOverride`,null),N(this,`handleBubbleClick`,null),N(this,`handleCloseClick`,null),N(this,`handleMinimizeClick`,null),N(this,`handleClearClick`,null),this.shadow=this.attachShadow({mode:`open`})}static get observedAttributes(){return[`api-url`,`placeholder`,`theme`,`hide-branding`,`translations`,`chat-query-rewrite`]}connectedCallback(){this.syncTranslationsFromAttribute(),this.render(),this.initializeClient(),this.dispatchEvent(E(`ready`,void 0))}disconnectedCallback(){this.cleanup()}attributeChangedCallback(e,t,n){t!==n&&(e===`api-url`?this.initializeClient():e===`theme`?this.updateTheme(n):e===`translations`&&(this.syncTranslationsFromAttribute(),this.isConnected&&this.rerenderAfterTranslationsChange()))}get translations(){return this.translationsOverride}get chatQueryRewrite(){return this.chatQueryRewriteOverride}set chatQueryRewrite(e){this.chatQueryRewriteOverride=e??null,this.chatView&&this.chatView.setProps(this.getProps())}set translations(e){this.translationsOverride=e??null,this.resolvedTranslations=a(this.translationsOverride),this.isConnected&&this.rerenderAfterTranslationsChange()}syncTranslationsFromAttribute(){if(this.translationsOverride){this.resolvedTranslations=a(this.translationsOverride);return}let e=s(this.getAttribute(`translations`),`ChatBubbleSnippet`);this.resolvedTranslations=a(e)}rerenderAfterTranslationsChange(){let e=this.isExpanded,t=this.isMinimized;this.removeEventListeners();let n=this.chatView?this.shadow.querySelector(`.chat-content`):null;n?.parentNode&&n.parentNode.removeChild(n),this.render(),e&&(this.shadow.querySelector(`.bubble-button`)?.classList.add(`hidden`),this.shadow.querySelector(`.chat-window`)?.classList.add(`expanded`),t&&this.shadow.querySelector(`.chat-window`)?.classList.add(`minimized`));let r=this.shadow.querySelector(`.chat-window`);if(this.chatView&&n&&r){let e=r.querySelector(`.chat-content`);e?r.replaceChild(n,e):r.appendChild(n),this.chatView.setProps(this.getProps())}else e&&this.initializeChatView()}getProps(){let e=this.resolvedTranslations;return{apiUrl:C(this.getAttribute(`api-url`),``),placeholder:C(this.getAttribute(`placeholder`),e.chatPlaceholder),theme:C(this.getAttribute(`theme`),`auto`),hideBranding:w(this.getAttribute(`hide-branding`),!1),translations:this.translationsOverride??void 0,chatQueryRewrite:this.resolveChatQueryRewrite()}}resolveChatQueryRewrite(){return this.chatQueryRewriteOverride===null?T(this.getAttribute(`chat-query-rewrite`),`ChatBubbleSnippet`):this.chatQueryRewriteOverride}initializeClient(){let e=this.getProps();if(!e.apiUrl){console.error(`ChatBubbleSnippet: api-url attribute is required`),this.client=null;return}try{this.client=D(e.apiUrl)}catch(e){console.error(`ChatBubbleSnippet:`,e)}}render(){let e=document.createElement(`style`);e.textContent=`${c}
${P}
${this.getBubbleStyles()}`,this.container=document.createElement(`div`),this.container.className=`chat-bubble-widget`,this.container.innerHTML=this.getBaseHTML(),this.shadow.innerHTML=``,this.shadow.appendChild(e),this.shadow.appendChild(this.container),this.attachEventListeners()}getBubbleStyles(){return`
      .chat-bubble-widget {
        position: var(--chat-bubble-position);
        bottom: var(--chat-bubble-button-bottom);
        right: var(--chat-bubble-button-right);
        z-index: var(--chat-bubble-button-z-index);
        font-family: var(--search-snippet-font-family);
        font-size: var(--search-snippet-font-size-base);
      }

      .bubble-button {
        width: var(--chat-bubble-button-size);
        height: var(--chat-bubble-button-size);
        border-radius: var(--chat-bubble-button-radius);
        background: var(--search-snippet-primary-color);
        border: none;
        cursor: pointer;
        box-shadow: var(--chat-bubble-button-shadow);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      }

      .bubble-button:hover {
        background: var(--search-snippet-primary-hover);
        transform: scale(1.05);
      }

      .bubble-button svg {
        width: var(--chat-bubble-button-icon-size);
        height: var(--chat-bubble-button-icon-size);
        color: var(--chat-bubble-button-icon-color);
      }

      .bubble-button.hidden {
        opacity: 0;
        pointer-events: none;
        transform: scale(0);
      }

      .chat-window {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 380px;
        height: 500px;
        background: var(--search-snippet-background);
        border-radius: var(--search-snippet-border-radius);
        box-shadow: var(--chat-bubble-window-shadow);
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: scale(0.8) translateY(20px);
        transform-origin: bottom right;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        pointer-events: none;
        overflow: hidden;
        border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
      }

      .chat-window.expanded {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }

      .chat-window.minimized {
        height: 58px;
        overflow: hidden;
      }

      .chat-header {
        background: var(--search-snippet-surface);
        padding: var(--search-snippet-spacing-md);
        border-bottom: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .chat-header-title {
        font-weight: var(--search-snippet-font-weight-bold);
        color: var(--search-snippet-text-color);
        display: flex;
        align-items: center;
        gap: var(--search-snippet-spacing-sm);
        font-size: var(--search-snippet-font-size-lg);
      }

      .chat-header-title svg {
        width: 20px;
        height: 20px;
      }

      .chat-header-actions {
        display: flex;
        gap: var(--search-snippet-spacing-xs);
      }

      .icon-button {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: var(--search-snippet-border-radius);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--search-snippet-transition-fast);
        color: var(--search-snippet-text-color);
      }

      .icon-button:hover {
        background: var(--search-snippet-hover-background);
      }

      .icon-button svg {
        width: 18px;
        height: 18px;
      }

      .chat-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      @media (max-width: 480px) {
        .chat-window {
          width: calc(100vw - 40px);
          max-width: 400px;
        }
      }
    `}getBaseHTML(){let e=this.getProps(),t=this.resolvedTranslations,n=e.hideBranding?``:`<div class="powered-by">${r}</div>`;return`
      <button class="bubble-button" aria-label="${y(t.openChatAriaLabel)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div class="chat-window">
        <div class="chat-header">
          <div class="chat-header-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>${y(t.chatTitle)}</span>
          </div>
          <div class="chat-header-actions">
            <button class="icon-button clear-button" aria-label="${y(t.clearHistoryAriaLabel)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button class="icon-button minimize-button" aria-label="${y(t.minimizeAriaLabel)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="icon-button close-button" aria-label="${y(t.closeAriaLabel)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="chat-content"></div>
        ${n}
      </div>
    `}attachEventListeners(){let e=this.shadow.querySelector(`.bubble-button`),t=this.shadow.querySelector(`.close-button`),n=this.shadow.querySelector(`.minimize-button`),r=this.shadow.querySelector(`.clear-button`);this.handleBubbleClick=()=>this.toggleChat(),this.handleCloseClick=()=>this.closeChat(),this.handleMinimizeClick=()=>this.toggleMinimize(),this.handleClearClick=()=>this.clearChat(),e?.addEventListener(`click`,this.handleBubbleClick),t?.addEventListener(`click`,this.handleCloseClick),n?.addEventListener(`click`,this.handleMinimizeClick),r?.addEventListener(`click`,this.handleClearClick)}removeEventListeners(){let e=this.shadow.querySelector(`.bubble-button`),t=this.shadow.querySelector(`.close-button`),n=this.shadow.querySelector(`.minimize-button`),r=this.shadow.querySelector(`.clear-button`);this.handleBubbleClick&&e?.removeEventListener(`click`,this.handleBubbleClick),this.handleCloseClick&&t?.removeEventListener(`click`,this.handleCloseClick),this.handleMinimizeClick&&n?.removeEventListener(`click`,this.handleMinimizeClick),this.handleClearClick&&r?.removeEventListener(`click`,this.handleClearClick),this.handleBubbleClick=null,this.handleCloseClick=null,this.handleMinimizeClick=null,this.handleClearClick=null}toggleChat(){this.isExpanded=!this.isExpanded;let e=this.shadow.querySelector(`.bubble-button`),t=this.shadow.querySelector(`.chat-window`);this.isExpanded?(e?.classList.add(`hidden`),t?.classList.add(`expanded`),this.initializeChatView()):(e?.classList.remove(`hidden`),t?.classList.remove(`expanded`))}closeChat(){this.isExpanded=!1,this.isMinimized=!1;let e=this.shadow.querySelector(`.bubble-button`),t=this.shadow.querySelector(`.chat-window`);e?.classList.remove(`hidden`),t?.classList.remove(`expanded`,`minimized`)}toggleMinimize(){this.isMinimized=!this.isMinimized;let e=this.shadow.querySelector(`.chat-window`);this.isMinimized?e?.classList.add(`minimized`):e?.classList.remove(`minimized`)}initializeChatView(){if(this.chatView)return;let e=this.shadow.querySelector(`.chat-content`);if(!e)return;if(!this.client){let t=this.resolvedTranslations;e.innerHTML=`
        <div style="padding: 16px; color: var(--search-snippet-error-color, #ef4444); font-family: var(--search-snippet-font-family, sans-serif); font-size: var(--search-snippet-font-size-base, 14px);">
          <strong>${y(t.errorPrefix)}</strong> ${y(t.missingApiUrlError)}
        </div>
      `;return}let t=this.getProps();this.chatView=new z(e,this.client,t)}updateTheme(e){(e===`light`||e===`dark`?e:null)===null&&this.hasAttribute(`theme`)&&this.getAttribute(`theme`)!==`auto`&&this.removeAttribute(`theme`)}cleanup(){this.removeEventListeners(),this.client&&this.client.cancelAllRequests(),this.chatView&&this.chatView.destroy()}clearChat(){this.chatView?.clearMessages()}async sendMessage(e){this.chatView&&await this.chatView.sendMessage(e)}getMessages(){return this.chatView?.getMessages()||[]}};customElements.get(B)||customElements.define(B,V);var H=`chat-page-snippet`,U=`chat-page-sessions`,W=class extends HTMLElement{constructor(){super(),N(this,`shadow`),N(this,`client`,null),N(this,`chatView`,null),N(this,`container`,null),N(this,`sessions`,[]),N(this,`currentSessionId`,null),N(this,`sidebarCollapsed`,!1),N(this,`translationsOverride`,null),N(this,`resolvedTranslations`,a(null)),N(this,`chatQueryRewriteOverride`,null),N(this,`handleClearClick`,null),N(this,`handleNewChatClick`,null),N(this,`handleToggleSidebarClick`,null),N(this,`handleChatListClick`,null),N(this,`handleMessageEvent`,null),this.shadow=this.attachShadow({mode:`open`}),this.loadSessions()}static get observedAttributes(){return[`api-url`,`placeholder`,`theme`,`hide-branding`,`translations`,`chat-query-rewrite`]}connectedCallback(){this.syncTranslationsFromAttribute(),this.render(),this.initializeClient(),this.setupView(),this.dispatchEvent(E(`ready`,void 0))}disconnectedCallback(){this.saveCurrentSession(),this.cleanup()}attributeChangedCallback(e,t,n){t!==n&&(e===`api-url`?(this.initializeClient(),this.setupView()):e===`theme`?this.updateTheme(n):e===`translations`&&(this.syncTranslationsFromAttribute(),this.isConnected&&this.rerenderAfterTranslationsChange()))}get translations(){return this.translationsOverride}get chatQueryRewrite(){return this.chatQueryRewriteOverride}set chatQueryRewrite(e){this.chatQueryRewriteOverride=e??null,this.chatView&&this.chatView.setProps(this.getProps())}set translations(e){this.translationsOverride=e??null,this.resolvedTranslations=a(this.translationsOverride),this.refreshDefaultSessionTitles(),this.isConnected&&this.rerenderAfterTranslationsChange()}syncTranslationsFromAttribute(){if(this.translationsOverride){this.resolvedTranslations=a(this.translationsOverride),this.refreshDefaultSessionTitles();return}let e=s(this.getAttribute(`translations`),`ChatPageSnippet`);this.resolvedTranslations=a(e),this.refreshDefaultSessionTitles()}refreshDefaultSessionTitles(){if(this.sessions.length===0)return;let e=this.resolvedTranslations.newChatButton,t=!1;for(let n of this.sessions)n.titleIsDefault&&n.title!==e&&(n.title=e,t=!0);t&&this.saveSessions()}rerenderAfterTranslationsChange(){this.removeEventListeners();let e=this.chatView?this.shadow.querySelector(`.container`):null;e?.parentNode&&e.parentNode.removeChild(e),this.render(),this.attachEventListeners(),this.renderChatList();let t=this.shadow.querySelector(`.chat-page-content`);if(this.chatView&&e&&t){let n=t.querySelector(`.container`);n?t.replaceChild(e,n):t.appendChild(e),this.chatView.setProps(this.getProps()),this.handleMessageEvent=()=>{this.saveCurrentSession(),this.updateSessionTitle(),this.renderChatList()},e.addEventListener(`message`,this.handleMessageEvent)}}getProps(){let e=this.resolvedTranslations;return{apiUrl:C(this.getAttribute(`api-url`),``),placeholder:C(this.getAttribute(`placeholder`),e.chatPlaceholder),theme:C(this.getAttribute(`theme`),`auto`),hideBranding:w(this.getAttribute(`hide-branding`),!1),translations:this.translationsOverride??void 0,chatQueryRewrite:this.resolveChatQueryRewrite()}}resolveChatQueryRewrite(){return this.chatQueryRewriteOverride===null?T(this.getAttribute(`chat-query-rewrite`),`ChatPageSnippet`):this.chatQueryRewriteOverride}initializeClient(){let e=this.getProps();if(!e.apiUrl){console.error(`ChatPageSnippet: api-url attribute is required`),this.client=null;return}try{this.client=D(e.apiUrl)}catch(e){console.error(`ChatPageSnippet:`,e)}}render(){let e=document.createElement(`style`);e.textContent=`${c}
${P}
${this.getPageStyles()}`,this.container=document.createElement(`div`),this.container.className=`chat-page-container`,this.container.innerHTML=this.getBaseHTML(),this.shadow.innerHTML=``,this.shadow.appendChild(e),this.shadow.appendChild(this.container),this.attachEventListeners()}getPageStyles(){return`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }

      .chat-page-container {
        display: flex;
        height: 100%;
        background: var(--search-snippet-background);
      }

      /* Sidebar styles */
      .chat-sidebar {
        width: 280px;
        min-width: 280px;
        background: var(--search-snippet-surface);
        border-right: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        display: flex;
        flex-direction: column;
        transition: var(--search-snippet-transition);
        overflow: hidden;
      }

      .chat-sidebar.collapsed {
        width: 0;
        min-width: 0;
        border-right: none;
      }

      .sidebar-header {
        padding: var(--search-snippet-spacing-lg);
        border-bottom: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        height: 69px;
      }

      .sidebar-title {
        font-size: var(--search-snippet-font-size-lg);
        font-weight: var(--search-snippet-font-weight-bold);
        color: var(--search-snippet-text-color);
      }

      .new-chat-button {
        width: 100%;
        height: var(--search-snippet-button-height);
        margin: var(--search-snippet-spacing-md) var(--search-snippet-spacing-lg);
        padding: 0 var(--search-snippet-spacing-lg);
        font-family: var(--search-snippet-font-family);
        font-size: var(--search-snippet-font-size-base);
        font-weight: var(--search-snippet-font-weight-medium);
        color: #fff;
        background: var(--search-snippet-primary-color);
        border: none;
        border-radius: var(--search-snippet-border-radius);
        cursor: pointer;
        outline: none;
        transition: var(--search-snippet-transition);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--search-snippet-spacing-sm);
        box-sizing: border-box;
        width: calc(100% - var(--search-snippet-spacing-lg) * 2);
      }

      .new-chat-button:hover {
        opacity: 0.9;
      }

      .new-chat-button svg {
        width: 16px;
        height: 16px;
      }

      .chat-list {
        flex: 1;
        overflow-y: auto;
        padding: var(--search-snippet-spacing-sm);
      }

      .chat-list-item {
        display: flex;
        align-items: center;
        padding: var(--search-snippet-spacing-md) var(--search-snippet-spacing-lg);
        margin-bottom: var(--search-snippet-spacing-xs);
        border-radius: var(--search-snippet-border-radius);
        cursor: pointer;
        transition: var(--search-snippet-transition);
        gap: var(--search-snippet-spacing-sm);
      }

      .chat-list-item:hover {
        background: var(--search-snippet-hover-background);
      }

      .chat-list-item.active {
        background: var(--search-snippet-hover-background);
        border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
      }

      .chat-list-item-content {
        flex: 1;
        min-width: 0;
      }

      .chat-list-item-title {
        font-size: var(--search-snippet-font-size-base);
        font-weight: var(--search-snippet-font-weight-medium);
        color: var(--search-snippet-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chat-list-item-date {
        font-size: var(--search-snippet-font-size-sm);
        color: var(--search-snippet-text-secondary);
        margin-top: 2px;
      }

      .chat-list-item-delete {
        opacity: 0;
        background: none;
        border: none;
        padding: var(--search-snippet-spacing-xs);
        cursor: pointer;
        color: var(--search-snippet-text-secondary);
        border-radius: var(--search-snippet-border-radius-sm);
        transition: var(--search-snippet-transition);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chat-list-item:hover .chat-list-item-delete {
        opacity: 1;
      }

      .chat-list-item-delete:hover {
        background: var(--search-snippet-error-background, rgba(239, 68, 68, 0.1));
        color: var(--search-snippet-error-color, #ef4444);
      }

      .chat-list-item-delete svg {
        width: 14px;
        height: 14px;
      }

      .chat-list-empty {
        padding: var(--search-snippet-spacing-xl);
        text-align: center;
        color: var(--search-snippet-text-secondary);
        font-size: var(--search-snippet-font-size-sm);
      }

      /* Main content area */
      .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .chat-page-header {
        background: var(--search-snippet-surface);
        padding: var(--search-snippet-spacing-lg);
        border-bottom: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .chat-page-header-left {
        display: flex;
        align-items: center;
        gap: var(--search-snippet-spacing-md);
      }

      .toggle-sidebar-button {
        width: 36px;
        height: 36px;
        padding: 0;
        font-family: var(--search-snippet-font-family);
        color: var(--search-snippet-text-color);
        background: var(--search-snippet-background);
        border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        border-radius: var(--search-snippet-border-radius);
        cursor: pointer;
        outline: none;
        transition: var(--search-snippet-transition);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .toggle-sidebar-button:hover {
        background: var(--search-snippet-hover-background);
      }

      .toggle-sidebar-button svg {
        width: 18px;
        height: 18px;
      }

      .chat-page-header-title {
        font-size: var(--search-snippet-font-size-xl);
        font-weight: var(--search-snippet-font-weight-bold);
        color: var(--search-snippet-text-color);
        display: flex;
        align-items: center;
        gap: var(--search-snippet-spacing-md);
      }

      .chat-page-header-title svg {
        width: 28px;
        height: 28px;
      }

      .chat-page-header-actions {
        display: flex;
        gap: var(--search-snippet-spacing-sm);
      }

      .header-button {
        height: var(--search-snippet-button-height);
        padding: 0 var(--search-snippet-spacing-lg);
        font-family: var(--search-snippet-font-family);
        font-size: var(--search-snippet-font-size-base);
        font-weight: var(--search-snippet-font-weight-medium);
        color: var(--search-snippet-text-color);
        background: var(--search-snippet-background);
        border: var(--search-snippet-border-width) solid var(--search-snippet-border-color);
        border-radius: var(--search-snippet-border-radius);
        cursor: pointer;
        outline: none;
        transition: var(--search-snippet-transition);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--search-snippet-spacing-sm);
      }

      .header-button:hover {
        background: var(--search-snippet-hover-background);
      }

      .header-button svg {
        width: 16px;
        height: 16px;
      }

      .chat-page-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .container {
        border: none;
        box-shadow: none;
        height: 100%;
        width: 100%;
        background: var(--search-snippet-background);
        border-radius: 0;
      }
    `}getBaseHTML(){let e=this.getProps(),t=this.resolvedTranslations,n=e.hideBranding?``:`<div class="powered-by">${r}</div>`;return`
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">${y(t.historyTitle)}</span>
        </div>
        <button class="new-chat-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          ${y(t.newChatButton)}
        </button>
        <div class="chat-list"></div>
        ${n}
      </div>
      <div class="chat-main">
        <div class="chat-page-header">
          <div class="chat-page-header-left">
            <button class="toggle-sidebar-button" title="${y(t.toggleSidebarTitle)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18"></path>
              </svg>
            </button>
            <div class="chat-page-header-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${y(t.chatTitle)}</span>
            </div>
          </div>
          <div class="chat-page-header-actions">
            <button class="header-button clear-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              ${y(t.clearChatButton)}
            </button>
          </div>
        </div>
        <div class="chat-page-content">
          <div class="container"></div>
        </div>
      </div>
    `}attachEventListeners(){let e=this.shadow.querySelector(`.clear-button`),t=this.shadow.querySelector(`.new-chat-button`),n=this.shadow.querySelector(`.toggle-sidebar-button`),r=this.shadow.querySelector(`.chat-list`);this.handleClearClick=()=>this.clearCurrentChat(),this.handleNewChatClick=()=>this.createNewChat(),this.handleToggleSidebarClick=()=>this.toggleSidebar(),this.handleChatListClick=e=>this.onChatListClick(e),e?.addEventListener(`click`,this.handleClearClick),t?.addEventListener(`click`,this.handleNewChatClick),n?.addEventListener(`click`,this.handleToggleSidebarClick),r?.addEventListener(`click`,this.handleChatListClick)}removeEventListeners(){let e=this.shadow.querySelector(`.clear-button`),t=this.shadow.querySelector(`.new-chat-button`),n=this.shadow.querySelector(`.toggle-sidebar-button`),r=this.shadow.querySelector(`.chat-list`),i=this.shadow.querySelector(`.container`);this.handleClearClick&&e?.removeEventListener(`click`,this.handleClearClick),this.handleNewChatClick&&t?.removeEventListener(`click`,this.handleNewChatClick),this.handleToggleSidebarClick&&n?.removeEventListener(`click`,this.handleToggleSidebarClick),this.handleChatListClick&&r?.removeEventListener(`click`,this.handleChatListClick),this.handleMessageEvent&&i&&i.removeEventListener(`message`,this.handleMessageEvent),this.handleClearClick=null,this.handleNewChatClick=null,this.handleToggleSidebarClick=null,this.handleChatListClick=null,this.handleMessageEvent=null}setupView(){let e=this.shadow.querySelector(`.container`);if(!this.client){if(e){let t=this.resolvedTranslations;e.innerHTML=`
          <div style="padding: 16px; color: var(--search-snippet-error-color, #ef4444); font-family: var(--search-snippet-font-family, sans-serif); font-size: var(--search-snippet-font-size-base, 14px);">
            <strong>${y(t.errorPrefix)}</strong> ${y(t.missingApiUrlError)}
          </div>
        `}return}if(!e)return;let t=this.getProps();if(this.chatView=new z(e,this.client,t),this.sessions.length===0)this.createNewChat();else{let e=this.sessions[0];this.switchToSession(e.id)}this.handleMessageEvent=()=>{this.saveCurrentSession(),this.updateSessionTitle(),this.renderChatList()},e.addEventListener(`message`,this.handleMessageEvent),this.renderChatList()}generateSessionId(){return`session_${Date.now()}_${Math.random().toString(36).substring(2,9)}`}loadSessions(){try{let e=localStorage.getItem(U);e&&(this.sessions=JSON.parse(e),this.sessions.sort((e,t)=>t.updatedAt-e.updatedAt))}catch(e){console.error(`Failed to load chat sessions:`,e)}}saveSessions(){try{localStorage.setItem(U,JSON.stringify(this.sessions))}catch(e){console.error(`Failed to save chat sessions:`,e)}}saveCurrentSession(){if(!this.currentSessionId||!this.chatView)return;let e=this.sessions.findIndex(e=>e.id===this.currentSessionId);e!==-1&&(this.sessions[e].messages=this.chatView.getMessages(),this.sessions[e].updatedAt=Date.now(),this.saveSessions())}updateSessionTitle(){if(!this.currentSessionId)return;let e=this.sessions.find(e=>e.id===this.currentSessionId);if(!e||e.messages.length===0||!(e.titleIsDefault??e.title===this.resolvedTranslations.newChatButton))return;let t=e.messages.find(e=>e.role===`user`);t&&(e.title=t.content.slice(0,50)+(t.content.length>50?`...`:``),e.titleIsDefault=!1,this.saveSessions())}createNewChat(){this.saveCurrentSession();let e={id:this.generateSessionId(),title:this.resolvedTranslations.newChatButton,messages:[],createdAt:Date.now(),updatedAt:Date.now(),titleIsDefault:!0};this.sessions.unshift(e),this.currentSessionId=e.id,this.saveSessions(),this.chatView?.clearMessages(),this.renderChatList()}switchToSession(e){if(e===this.currentSessionId)return;this.saveCurrentSession();let t=this.sessions.find(t=>t.id===e);t&&this.chatView&&(this.currentSessionId=e,this.chatView.setMessages(t.messages),this.renderChatList())}deleteSession(e){let t=this.sessions.findIndex(t=>t.id===e);t!==-1&&(this.sessions.splice(t,1),this.saveSessions(),e===this.currentSessionId&&(this.sessions.length>0?this.switchToSession(this.sessions[0].id):this.createNewChat()),this.renderChatList())}clearCurrentChat(){if(!this.currentSessionId)return;let e=this.sessions.find(e=>e.id===this.currentSessionId);e&&(e.messages=[],e.title=this.resolvedTranslations.newChatButton,e.titleIsDefault=!0,e.updatedAt=Date.now(),this.saveSessions()),this.chatView?.clearMessages(),this.renderChatList()}toggleSidebar(){this.sidebarCollapsed=!this.sidebarCollapsed,this.shadow.querySelector(`.chat-sidebar`)?.classList.toggle(`collapsed`,this.sidebarCollapsed)}onChatListClick(e){let t=e.target,n=t.closest(`.chat-list-item-delete`);if(n){e.stopPropagation();let t=n.getAttribute(`data-session-id`);t&&this.deleteSession(t);return}let r=t.closest(`.chat-list-item`);if(r){let e=r.getAttribute(`data-session-id`);e&&this.switchToSession(e)}}renderChatList(){let e=this.shadow.querySelector(`.chat-list`);if(!e)return;let t=this.resolvedTranslations;if(this.sessions.length===0){e.innerHTML=`<div class="chat-list-empty">${this.escapeHTML(t.noChatsYet)}</div>`;return}e.innerHTML=this.sessions.map(e=>this.renderChatListItem(e)).join(``)}renderChatListItem(e){let t=e.id===this.currentSessionId,n=this.formatDate(e.updatedAt),r=this.resolvedTranslations.deleteChatTitle;return`
      <div class="chat-list-item ${t?`active`:``}" data-session-id="${e.id}">
        <div class="chat-list-item-content">
          <div class="chat-list-item-title">${this.escapeHTML(e.title)}</div>
          <div class="chat-list-item-date">${n}</div>
        </div>
        <button class="chat-list-item-delete" data-session-id="${e.id}" title="${this.escapeHTML(r)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `}formatDate(e){let t=new Date(e),n=new Date().getTime()-t.getTime(),r=Math.floor(n/864e5);return r===0?t.toLocaleTimeString(void 0,{hour:`2-digit`,minute:`2-digit`}):r===1?this.resolvedTranslations.yesterday:r<7?t.toLocaleDateString(void 0,{weekday:`long`}):t.toLocaleDateString(void 0,{month:`short`,day:`numeric`})}escapeHTML(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}updateTheme(e){(e===`light`||e===`dark`?e:null)===null&&this.hasAttribute(`theme`)&&this.getAttribute(`theme`)!==`auto`&&this.removeAttribute(`theme`)}cleanup(){this.removeEventListeners(),this.client&&this.client.cancelAllRequests(),this.chatView&&this.chatView.destroy()}clearChat(){this.clearCurrentChat()}async sendMessage(e){this.chatView&&(await this.chatView.sendMessage(e),this.saveCurrentSession())}getMessages(){return this.chatView?.getMessages()||[]}getSessions(){return[...this.sessions]}getCurrentSession(){return this.sessions.find(e=>e.id===this.currentSessionId)||null}};customElements.get(H)||customElements.define(H,W);var G=document.querySelector(`chat-bubble-snippet`),K=document.documentElement,q=()=>G?.setAttribute(`theme`,K.dataset.theme??`auto`);q(),new MutationObserver(q).observe(K,{attributeFilter:[`data-theme`]}),document.getElementById(`starlight__sidebar`)?.addEventListener(`toggle`,e=>{G?.toggleAttribute(`inert`,e.newState===`open`)});