// Plain module (no "use client") so the value is a real string on the server
// too; the inline boot script in layout.tsx reads the same key.
export const THEME_KEY = "arterial.theme";

export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
