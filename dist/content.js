function a(){try{const o=document.querySelector("h1.ytd-watch-metadata yt-formatted-string")?.textContent?.trim()||"Unknown Title",e=window.location.href,n=document.querySelector(".ytp-time-duration")?.textContent?.trim()||"Unknown Duration";return{title:o,url:e,duration:n}}catch(t){return console.error("Error extracting video info:",t),null}}async function c(){try{const t=document.querySelector('[aria-label*="transcript" i], [aria-label*="captions" i]');if(!t)throw new Error("Transcript not available for this video");document.querySelector("#transcript")||(t.click(),await new Promise(n=>setTimeout(n,2e3)));const e=document.querySelectorAll("#transcript .ytd-transcript-segment-renderer"),r=Array.from(e).map(n=>n.textContent?.trim()).filter(n=>n).join(" ");if(!r)throw new Error("Unable to extract transcript text");return r}catch(t){throw console.error("Error getting transcript:",t),t}}async function s(t){try{const o=t.split(" "),e=Math.min(100,Math.floor(o.length*.1));return`Summary: ${o.slice(0,e).join(" ")+"..."}

[Note: This is a placeholder summary. Integrate with an AI service for better results.]`}catch(o){throw console.error("Error generating summary:",o),new Error("Failed to generate summary")}}chrome.runtime.onMessage.addListener((t,o,e)=>{if(t.action==="getVideoInfo"){const r=a();e(r)}else if(t.action==="summarizeVideo")return(async()=>{try{const r=await c(),n=await s(r);e({success:!0,summary:n})}catch(r){e({success:!1,error:r instanceof Error?r.message:"Unknown error occurred"})}})(),!0});function i(){if(document.querySelector("#youtube-summarizer-indicator"))return;const t=document.createElement("div");t.id="youtube-summarizer-indicator",t.style.cssText=`
    position: fixed;
    top: 10px;
    right: 10px;
    background: #ff0000;
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `,t.textContent="🎥 Summarizer Ready",document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i):i();
