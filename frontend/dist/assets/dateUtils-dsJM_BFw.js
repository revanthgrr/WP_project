function n(t=new Date){const e=t.getTimezoneOffset();return new Date(t.getTime()-e*60*1e3).toISOString().split("T")[0]}function a(t=new Date){return n(t).slice(0,7)}export{n as a,a as g};
