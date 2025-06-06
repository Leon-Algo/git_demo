console.log("Script loaded!");

// --- Main Application Elements ---
const orangeCatPet = document.getElementById('orange-cat-pet');
const catImage = document.getElementById('cat-image');
const speechBubble = document.getElementById('speech-bubble');
const resizeBtn = document.getElementById('resize-btn');

// --- Chat Dialog Elements ---
const chatDialog = document.getElementById('chat-dialog');
const chatHeader = document.getElementById('chat-header');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatCloseBtn = document.getElementById('chat-close-btn');

// --- Image Sources ---
const idleImageSrc = 'images/cat_idle.png';
const happyImageSrc = 'images/cat_happy.png'; // Primarily for direct click/pat
const curiousImageSrc = 'images/cat_curious.png'; // General "thinking" or observing
const sleepyImageSrc = 'images/cat_sleepy.png';   // For blank/idle screens
// Conceptual new images (actual files would need to be created)
const catConfusedImageSrc = 'images/cat_confused.png'; // For errors or confusing scenes
const catExcitedImageSrc = 'images/cat_excited.png';   // For very positive things like food/toys
const catCodingImageSrc = 'images/cat_coding.png';     // For coding related scenes

// --- Configuration ---
const screenshotInterval = 120000;
const analyseScreenBackendUrl = 'http://localhost:3000/api/analyse-screen';
const chatBackendUrl = 'http://localhost:3000/api/chat';

// --- Pet State (Position, Size) ---
const petSizes = [ /* ... same ... */
    { width: '150px', height: '150px', name: 'Small' },
    { width: '200px', height: '200px', name: 'Medium' },
    { width: '250px', height: '250px', name: 'Large' }
];
let currentSizeIndex = 1;

// --- Chat State ---
let currentChatContext = "";
let chatTurn = 0;
const maxChatTurns = 3;
let conversationHistory = [];
let speechBubbleClickListener = null;

// --- Helper Functions (adjustCatImageHeight, savePetState, loadPetState) ---
// (Assuming these are largely unchanged, keeping them concise)
function adjustCatImageHeight() { if (!orangeCatPet || !catImage) return; const cH = parseInt(orangeCatPet.style.height,10); catImage.style.height = `${cH*0.8}px`; catImage.style.width='auto';}
function savePetState() { if(!orangeCatPet) return; localStorage.setItem('petState', JSON.stringify({left:orangeCatPet.style.left,top:orangeCatPet.style.top,width:orangeCatPet.style.width,height:orangeCatPet.style.height,sizeIndex:currentSizeIndex})); }
function loadPetState() { const s = JSON.parse(localStorage.getItem('petState')); if(orangeCatPet){ if(s){ orangeCatPet.style.left=s.left||''; orangeCatPet.style.top=s.top||''; if(s.left&&s.top){orangeCatPet.style.right='auto';orangeCatPet.style.bottom='auto';}else{orangeCatPet.style.right='10px';orangeCatPet.style.bottom='10px';} currentSizeIndex=s.sizeIndex!==undefined?s.sizeIndex:1;const sz=petSizes[currentSizeIndex]; orangeCatPet.style.width=s.width||sz.width;orangeCatPet.style.height=s.height||sz.height;}else{const dS=petSizes[1];orangeCatPet.style.width=dS.width;orangeCatPet.style.height=dS.height;orangeCatPet.style.right='10px';orangeCatPet.style.bottom='10px';}} adjustCatImageHeight();}

// --- Draggable Functionality (Pet & Chat Dialog) ---
// (Assuming these are largely unchanged)
if (orangeCatPet) { orangeCatPet.addEventListener('mousedown', (e) => { if (!orangeCatPet || e.target.closest('#cat-controls') || e.target.closest('#speech-bubble')) return; orangeCatPet.style.cursor = 'grabbing'; let iX = e.clientX, iY = e.clientY; const cS = getComputedStyle(orangeCatPet); let iL = (cS.left!=='auto'&&cS.left!=='0px')?orangeCatPet.offsetLeft:innerWidth-orangeCatPet.getBoundingClientRect().right; let iT = (cS.top!=='auto'&&cS.top!=='0px')?orangeCatPet.offsetTop:innerHeight-orangeCatPet.getBoundingClientRect().bottom; orangeCatPet.style.left=`${iL}px`;orangeCatPet.style.top=`${iT}px`;orangeCatPet.style.right='auto';orangeCatPet.style.bottom='auto'; const oMM=(me)=>{orangeCatPet.style.left=`${iL+me.clientX-iX}px`;orangeCatPet.style.top=`${iT+me.clientY-iY}px`;}; const oMU=()=>{removeEventListener('mousemove',oMM);removeEventListener('mouseup',oMU);if(orangeCatPet)orangeCatPet.style.cursor='grab';savePetState();}; addEventListener('mousemove',oMM);addEventListener('mouseup',oMU);});}
if (chatDialog && chatHeader) { chatHeader.addEventListener('mousedown', (e) => { if(e.target.tagName==='BUTTON'||!chatDialog)return; chatDialog.style.cursor='grabbing';let iX=e.clientX,iY=e.clientY,iL=chatDialog.offsetLeft,iT=chatDialog.offsetTop; chatDialog.style.right='auto';chatDialog.style.bottom='auto';chatDialog.style.left=`${iL}px`;chatDialog.style.top=`${iT}px`; const oMM=(me)=>{chatDialog.style.left=`${iL+me.clientX-iX}px`;chatDialog.style.top=`${iT+me.clientY-iY}px`;}; const oMU=()=>{removeEventListener('mousemove',oMM);removeEventListener('mouseup',oMU);if(chatDialog)chatDialog.style.cursor='default';}; addEventListener('mousemove',oMM);addEventListener('mouseup',oMU);});}

// --- Resizing Functionality (Pet) ---
if (resizeBtn && orangeCatPet) { resizeBtn.addEventListener('click', () => { currentSizeIndex=(currentSizeIndex+1)%petSizes.length; const nS=petSizes[currentSizeIndex]; orangeCatPet.style.width=nS.width;orangeCatPet.style.height=nS.height;adjustCatImageHeight();savePetState();});}

// --- Cat Image Click Interaction (Happy Animation) ---
if (catImage) {
    catImage.addEventListener('click', () => {
        if (!catImage) return;
        // Add a temporary marker class to distinguish this happy state
        catImage.classList.add('happy-by-click');
        catImage.src = happyImageSrc;
        catImage.classList.remove('subtle-bob-animation', 'shake-animation', 'bounce-animation'); // Remove other anims
        void catImage.offsetWidth;
        catImage.classList.add('happy-animation'); // Wobble for happy
        setTimeout(() => {
            if (!catImage) return;
            // Only revert if it's still the happy image AND was triggered by click
            if (catImage.src.includes(happyImageSrc.substring(happyImageSrc.lastIndexOf('/')+1)) && catImage.classList.contains('happy-by-click')) {
                 catImage.src = idleImageSrc;
            }
            catImage.classList.remove('happy-animation');
            catImage.classList.remove('happy-by-click'); // Clean up marker
        }, 1000); // Happy animation duration
    });
}

// --- Screen Capture & Feedback Logic ---
let feedbackTimeout;
function displayFeedback(text) { /* ... same, ensures speechBubbleClickListener is set up ... */
    if (!speechBubble) return; speechBubble.textContent = text; speechBubble.classList.add('visible');
    if (speechBubbleClickListener) speechBubble.removeEventListener('click', speechBubbleClickListener);
    speechBubbleClickListener = () => { if (!chatDialog||!chatHistory||!chatInput||!speechBubble) return; speechBubble.classList.remove('visible'); currentChatContext = speechBubble.textContent||"Tell me more!"; chatHistory.innerHTML=''; conversationHistory=[{speaker:'cat',text:currentChatContext}]; appendMessageToChat('cat',currentChatContext); chatTurn=0; chatDialog.classList.remove('hidden'); chatInput.value=''; chatInput.focus();};
    speechBubble.addEventListener('click', speechBubbleClickListener, { once: true });
    clearTimeout(feedbackTimeout); feedbackTimeout = setTimeout(() => {if(speechBubble)speechBubble.classList.remove('visible');}, 8000);
}

// Updated triggerCatReaction
function triggerCatReaction(analysis) {
    if (!catImage || !analysis) {
        console.warn("triggerCatReaction called without catImage or analysis");
        return;
    }
    console.log("Cat reacting to (refined analysis):", analysis);

    // Default to idle after animation, unless a specific persistent state is set (like sleepy)
    let imageToSet = curiousImageSrc; // Default reaction image
    let animationToApply = 'subtle-bob-animation'; // Default animation
    let isPersistentState = false; // Flag for states like sleepy that shouldn't revert to idle immediately

    const mainScene = analysis.scene ? analysis.scene.toLowerCase() : "unknown";
    const subScene = analysis.sub_scene ? analysis.sub_scene.toLowerCase() : null;

    if (mainScene.includes('error') || (subScene && subScene.includes('error'))) {
        imageToSet = catConfusedImageSrc || curiousImageSrc; // Use confused if available, else curious
        animationToApply = 'shake-animation';
    } else if (subScene) {
        if (subScene.includes('food') || subScene.includes('fish') || subScene.includes('dessert')) {
            imageToSet = catExcitedImageSrc || happyImageSrc; // Use excited if available, else happy
            animationToApply = 'bounce-animation';
        } else if (subScene.includes('code_error')) {
            imageToSet = catConfusedImageSrc || curiousImageSrc;
            animationToApply = 'shake-animation';
        } else if (subScene.includes('code_cat_keyword') || subScene.includes('code_fish_keyword')) {
            imageToSet = catExcitedImageSrc || curiousImageSrc;
            animationToApply = 'bounce-animation';
        } else if (subScene.includes('code')) { // general coding
            imageToSet = catCodingImageSrc || curiousImageSrc;
            animationToApply = 'subtle-bob-animation';
        } else if (subScene.includes('idle_screen') || subScene.includes('blank')) {
            imageToSet = sleepyImageSrc;
            isPersistentState = true; // Sleepy can be a longer state
        } else if (subScene.includes('social_cat_picture')) {
            imageToSet = curiousImageSrc; // Could be a specific "jealous" or "interested" pose
            animationToApply = 'subtle-bob-animation';
        } else { // Default for other known sub-scenes
            imageToSet = curiousImageSrc;
        }
    } else if (mainScene.includes('blank') || mainScene.includes('inactive') || mainScene.includes('idle')) {
        imageToSet = sleepyImageSrc;
        isPersistentState = true;
    } else { // Default for main scenes if no sub_scene matched
        imageToSet = curiousImageSrc;
    }

    // Don't interrupt a user-triggered happy state unless the new reaction is also happy-like
    if (catImage.classList.contains('happy-by-click') && imageToSet !== happyImageSrc && imageToSet !== (catExcitedImageSrc || happyImageSrc)) {
        console.log("Skipping contextual reaction to preserve user-triggered happy state.");
        return;
    }

    if (catImage.src !== imageToSet) {
        catImage.src = imageToSet;
    }

    catImage.classList.remove('subtle-bob-animation', 'shake-animation', 'bounce-animation', 'happy-animation');
    void catImage.offsetWidth;
    catImage.classList.add(animationToApply);

    setTimeout(() => {
        if (!catImage) return;
        catImage.classList.remove(animationToApply);

        // Revert to idle only if not a persistent state and not the happy-by-click state
        if (!isPersistentState && !catImage.classList.contains('happy-by-click')) {
            catImage.src = idleImageSrc;
        }
        // If it was a persistent state (like sleepy), it remains until the next triggerCatReaction or user interaction.
        // If it was happy-by-click, its own timeout handles reverting it.
    }, 2000); // General duration for reaction animations
}


async function captureScreenAndSend() { /* ... same as before ... */
    if(typeof html2canvas==='undefined'){console.error('html2canvas not loaded.');return;}
    console.log("Attempting to capture screen...");
    try{
        const canvas = await html2canvas(document.documentElement,{useCORS:true,allowTaint:true});
        console.log("Screen captured."); const imageData=canvas.toDataURL('image/png');
        console.log(`Sending image to backend: ${analyseScreenBackendUrl}`);
        const response = await fetch(analyseScreenBackendUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:imageData}),});
        if(!response.ok){let eM=`Backend error: ${response.status} ${response.statusText}`;try{const eD=await response.json();eM=eD.error||eM;}catch(e){} console.error('Screen analysis error:',eM);displayFeedback(`喵... Thinking cap fuzzy! (Err: ${response.status})`);triggerCatReaction({scene:"error_generic"});return;}
        const data = await response.json(); console.log("Backend analysis:",data);
        if(data.feedback){displayFeedback(data.feedback);triggerCatReaction(data.analysis||{scene:"unknown_backend_response"});}
        else{displayFeedback("Thinking cap strange reply... 갸르릉?");triggerCatReaction({scene:"error_empty_feedback"});}
    }catch(error){console.error('Capture/send error:',error);displayFeedback("Magic camera broke! (Capture/Network Error)");triggerCatReaction({scene:"error_capture_or_network"});}
}

// --- Chat Functionality ---
function appendMessageToChat(speaker, text) { /* ... same ... */ if(!chatHistory)return;const mD=document.createElement('div');mD.classList.add('chat-message',speaker==='user'?'user-message':'cat-message');mD.textContent=text;chatHistory.appendChild(mD);chatHistory.scrollTop=chatHistory.scrollHeight;}

async function handleSendMessage() { /* ... same as before, using chatBackendUrl ... */
    if(!chatInput||!chatHistory||!chatDialog||!chatSendBtn)return; const uI=chatInput.value.trim(); if(uI==="")return;
    if(chatTurn>=maxChatTurns&&uI!==""){appendMessageToChat('cat',"I'm really sleepy now... Zzz...");chatInput.value='';chatInput.disabled=true;chatSendBtn.disabled=true;return;}
    appendMessageToChat('user',uI);conversationHistory.push({speaker:'user',text:uI});const cI=uI;chatInput.value="";chatTurn++;
    chatInput.disabled=true;chatSendBtn.disabled=true;
    try{
        console.log(`Sending chat to backend: ${chatBackendUrl}`);
        const response=await fetch(chatBackendUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initialContext:currentChatContext,history:conversationHistory.slice(-6),userInput:cI}),});
        if(!response.ok){let eM=`Chat backend error: ${response.status} ${response.statusText}`;try{const eD=await response.json();eM=eD.error||eM;}catch(e){} console.error('Chat reply error:',eM);appendMessageToChat('cat',`Hiss! Tangled whiskers! (Err: ${response.status})`);return;}
        const data=await response.json(); console.log("Backend chat reply:",data);
        if(data.reply){appendMessageToChat('cat',data.reply);conversationHistory.push({speaker:'cat',text:data.reply});}
        else{appendMessageToChat('cat',"Purrr? Lost my meow...");}
    }catch(error){console.error('Chat send/receive error:',error);appendMessageToChat('cat',"Meee-ouch! Static on the line!");}
    finally{
        chatInput.disabled=false;chatSendBtn.disabled=false;
        if(chatTurn<maxChatTurns){if(chatInput)chatInput.focus();}
        else{console.log("Max chat turns. Final message.");setTimeout(()=>{if(chatHistory)appendMessageToChat('cat',"Phew, lots of talking! Ttyl!");},500);if(chatInput)chatInput.disabled=true;if(chatSendBtn)chatSendBtn.disabled=true;}
    }
}

if (chatSendBtn) chatSendBtn.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });
if (chatCloseBtn && chatDialog) { chatCloseBtn.addEventListener('click', () => { chatDialog.classList.add('hidden');currentChatContext="";if(chatHistory)chatHistory.innerHTML="";if(chatInput){chatInput.value="";chatInput.disabled=false;}if(chatSendBtn)chatSendBtn.disabled=false;conversationHistory=[];chatTurn=0;});}

// --- Initial Load ---
let petStateLoadedOnce = false;
function initialLoad() { /* ... same ... */ if(petStateLoadedOnce)return;if(!orangeCatPet||!catImage||!speechBubble||!resizeBtn||!chatDialog||!chatHeader||!chatHistory||!chatInput||!chatSendBtn||!chatCloseBtn){console.error("Critical DOM elements missing.");} loadPetState();if(chatDialog)chatDialog.classList.add('hidden');setTimeout(captureScreenAndSend,3000);setInterval(captureScreenAndSend,screenshotInterval);petStateLoadedOnce=true;}
document.addEventListener('DOMContentLoaded', initialLoad);
if (document.readyState === "complete" || document.readyState === "interactive") initialLoad();
