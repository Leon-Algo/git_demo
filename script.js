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
const happyImageSrc = 'images/cat_happy.png';
const curiousImageSrc = 'images/cat_curious.png';
const sleepyImageSrc = 'images/cat_sleepy.png';

// --- Configuration ---
const screenshotInterval = 120000; // 2 minutes
const backendUrl = '/api/analyse-screen'; // Placeholder
const chatBackendUrl = '/api/chat'; // Placeholder

// --- Pet State (Position, Size) ---
const petSizes = [
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

function adjustCatImageHeight() {
    if (!orangeCatPet || !catImage) return;
    const containerHeight = parseInt(orangeCatPet.style.height, 10);
    catImage.style.height = `${containerHeight * 0.8}px`;
    catImage.style.width = 'auto';
}

function savePetState() {
    if (!orangeCatPet) return;
    const state = {
        left: orangeCatPet.style.left,
        top: orangeCatPet.style.top,
        width: orangeCatPet.style.width,
        height: orangeCatPet.style.height,
        sizeIndex: currentSizeIndex
    };
    localStorage.setItem('petState', JSON.stringify(state));
}

function loadPetState() {
    const state = JSON.parse(localStorage.getItem('petState'));
    if (orangeCatPet) { // Ensure orangeCatPet exists
        if (state) {
            orangeCatPet.style.left = state.left || '';
            orangeCatPet.style.top = state.top || '';
            if (state.left && state.top) {
                orangeCatPet.style.right = 'auto';
                orangeCatPet.style.bottom = 'auto';
            } else {
                 orangeCatPet.style.right = '10px';
                 orangeCatPet.style.bottom = '10px';
            }
            currentSizeIndex = state.sizeIndex !== undefined ? state.sizeIndex : 1;
            const size = petSizes[currentSizeIndex];
            orangeCatPet.style.width = state.width || size.width;
            orangeCatPet.style.height = state.height || size.height;
        } else {
            const defaultSize = petSizes[1];
            orangeCatPet.style.width = defaultSize.width;
            orangeCatPet.style.height = defaultSize.height;
            orangeCatPet.style.right = '10px';
            orangeCatPet.style.bottom = '10px';
        }
    }
    adjustCatImageHeight();
}

// --- Draggable Functionality (Pet) ---
if (orangeCatPet) {
    orangeCatPet.addEventListener('mousedown', (e) => {
        if (!orangeCatPet) return; // Should always exist here, but good practice
        if (e.target.closest('#cat-controls') || e.target.closest('#speech-bubble')) return;

        orangeCatPet.style.cursor = 'grabbing';
        let initialX = e.clientX;
        let initialY = e.clientY;
        const computedStyle = window.getComputedStyle(orangeCatPet);
        let initialLeft, initialTop;

        if (computedStyle.left !== 'auto' && computedStyle.left !== '0px') {
            initialLeft = orangeCatPet.offsetLeft;
        } else {
            initialLeft = window.innerWidth - orangeCatPet.getBoundingClientRect().right;
        }
        if (computedStyle.top !== 'auto' && computedStyle.top !== '0px') {
            initialTop = orangeCatPet.offsetTop;
        } else {
            initialTop = window.innerHeight - orangeCatPet.getBoundingClientRect().bottom;
        }

        orangeCatPet.style.left = `${initialLeft}px`;
        orangeCatPet.style.top = `${initialTop}px`;
        orangeCatPet.style.right = 'auto';
        orangeCatPet.style.bottom = 'auto';

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - initialX;
            const dy = moveEvent.clientY - initialY;
            orangeCatPet.style.left = `${initialLeft + dx}px`;
            orangeCatPet.style.top = `${initialTop + dy}px`;
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (orangeCatPet) orangeCatPet.style.cursor = 'grab';
            savePetState();
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

// --- Draggable Functionality (Chat Dialog) ---
if (chatDialog && chatHeader) {
    chatHeader.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        if (!chatDialog) return; // Should always exist

        chatDialog.style.cursor = 'grabbing';
        let initialX = e.clientX;
        let initialY = e.clientY;
        let initialLeft = chatDialog.offsetLeft;
        let initialTop = chatDialog.offsetTop;

        const originalRight = chatDialog.style.right;
        const originalBottom = chatDialog.style.bottom;
        chatDialog.style.right = 'auto';
        chatDialog.style.bottom = 'auto';
        chatDialog.style.left = `${initialLeft}px`;
        chatDialog.style.top = `${initialTop}px`;

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - initialX;
            const dy = moveEvent.clientY - initialY;
            chatDialog.style.left = `${initialLeft + dx}px`;
            chatDialog.style.top = `${initialTop + dy}px`;
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (chatDialog) chatDialog.style.cursor = 'default';
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

// --- Resizing Functionality (Pet) ---
if (resizeBtn && orangeCatPet) {
    resizeBtn.addEventListener('click', () => {
        currentSizeIndex = (currentSizeIndex + 1) % petSizes.length;
        const newSize = petSizes[currentSizeIndex];
        orangeCatPet.style.width = newSize.width;
        orangeCatPet.style.height = newSize.height;
        adjustCatImageHeight();
        savePetState();
    });
}

// --- Cat Image Click Interaction (Happy Animation) ---
if (catImage) {
    catImage.addEventListener('click', () => {
        if (!catImage) return;
        catImage.src = happyImageSrc;
        catImage.classList.add('happy'); // For scaling
        catImage.classList.add('happy-animation'); // For wobble
        setTimeout(() => {
            if (!catImage) return;
            // Only revert if it's still the happy image (not changed by another reaction)
            if (catImage.src.includes(happyImageSrc.substring(happyImageSrc.lastIndexOf('/')+1) )) {
                 catImage.src = idleImageSrc;
            }
            catImage.classList.remove('happy-animation');
            catImage.classList.remove('happy');
        }, 1000);
    });
}

// --- Screen Capture & Feedback Logic ---
let feedbackTimeout;
function displayFeedback(text) {
    if (!speechBubble) return;
    speechBubble.textContent = text;
    speechBubble.classList.add('visible');

    if (speechBubbleClickListener) {
        speechBubble.removeEventListener('click', speechBubbleClickListener);
    }

    speechBubbleClickListener = () => {
        if (!chatDialog || !chatHistory || !chatInput || !speechBubble) return;

        // Immediately hide speech bubble
        speechBubble.classList.remove('visible');

        currentChatContext = speechBubble.textContent || "Tell me more about that!";
        chatHistory.innerHTML = '';
        appendMessageToChat('cat', currentChatContext);
        conversationHistory = [{speaker: 'cat', text: currentChatContext}];
        chatTurn = 0;
        chatDialog.classList.remove('hidden');
        chatInput.value = '';
        chatInput.focus();
    };
    speechBubble.addEventListener('click', speechBubbleClickListener, { once: true });

    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        if (speechBubble) speechBubble.classList.remove('visible');
    }, 8000);
}

function triggerCatReaction(analysis) {
    if (!catImage) return;
    console.log("Cat reacting to:", analysis);

    let newSrc = curiousImageSrc; // Default reaction image
    if (analysis.scene) {
        if (analysis.scene.includes('blank') || analysis.scene.includes('inactive')) {
            newSrc = sleepyImageSrc;
        } else if (analysis.scene.includes('code')) {
            newSrc = curiousImageSrc;
        } // Add more specific scene-to-image mappings if desired
    }

    // Only change src if it's different, to avoid re-triggering animation on the same state,
    // unless it's the idle image (to allow reaction from idle)
    if (catImage.src !== newSrc || catImage.src.includes(idleImageSrc.substring(idleImageSrc.lastIndexOf('/')+1))) {
        catImage.src = newSrc;
    }

    catImage.classList.remove('happy-animation', 'subtle-bob-animation'); // Remove other animations first
    void catImage.offsetWidth; // Trigger reflow to restart animation
    catImage.classList.add('subtle-bob-animation');

    setTimeout(() => {
        if (!catImage) return;
        catImage.classList.remove('subtle-bob-animation');
        // Revert to idle only if it wasn't an intentional persistent state change (like happy click)
        // and current image is one of the reaction images.
        const reactionImagesForRevert = [curiousImageSrc, sleepyImageSrc];
        if (reactionImagesForRevert.some(img => catImage.src.includes(img.substring(img.lastIndexOf('/')+1)))) {
            // Check if it's not the happy state triggered by a click
            if (!catImage.src.includes(happyImageSrc.substring(happyImageSrc.lastIndexOf('/')+1))) {
               catImage.src = idleImageSrc;
            }
        }
    }, 2000); // Duration of subtle-bob (0.5s * 2 iterations = 1s) + buffer or desired display time
}


function simulateBackendResponse(canvas) {
    // This is a simulation. Real backend would call GLM, etc.
    const feedbacks = [
        { text: "This page looks interesting! What are we looking at? 喵?", analysis: { scene: "generic_webpage_simulated" } },
        { text: "So many words! Are you reading something important or just browsing cat memes? 😉", analysis: { scene: "article_simulated" } },
        { text: "Coding time? Don't forget to take breaks and give me head scratches!", analysis: { scene: "code_editor_simulated" } },
        { text: "Ooh, pretty colors! Is this a game? Can I play?", analysis: { scene: "image_heavy_simulated" } },
        { text: "Hmm, seems quiet. Perfect time for a nap... or a snack? 😴", analysis: { scene: "blank_simulated" } }
    ];
    const randomIndex = Math.floor(Math.random() * feedbacks.length);
    console.log("Simulated screen analysis:", feedbacks[randomIndex].feedback);
    return { feedback: feedbacks[randomIndex].text, analysis: feedbacks[randomIndex].analysis };
}

function captureScreenAndSend() {
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas is not loaded!');
        displayFeedback("My special glasses are foggy, can't see the screen!");
        return;
    }
    console.log("Attempting to capture screen...");
    try {
        html2canvas(document.documentElement, { useCORS: true, allowTaint: true, logging: false, width: window.innerWidth, height: window.innerHeight, x: window.scrollX, y: window.scrollY })
        .then(canvas => {
            console.log("Screenshot captured.");
            const simulatedApiResponse = simulateBackendResponse(canvas); // Keep simulation for now
            displayFeedback(simulatedApiResponse.feedback);
            triggerCatReaction(simulatedApiResponse.analysis);
        }).catch(error => {
            console.error('Error during html2canvas capture:', error);
            displayFeedback("哎呀，我的魔法眼镜好像失灵了！看不见屏幕了。");
        });
    } catch (error) {
        console.error('Error setting up html2canvas:', error);
        displayFeedback("喵? I'm a bit confused right now. My vision spell isn't working!");
    }
}

// --- Chat Functionality ---
function appendMessageToChat(speaker, text) {
    if (!chatHistory) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', speaker === 'user' ? 'user-message' : 'cat-message');
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function simulateCatChatResponse(userInput, history) {
    // This is a simulation. Real backend would call GLM, etc.
    userInput = userInput.toLowerCase();
    let reply = "Purrrr... that's quite something! 😼";
    if (userInput.includes("hello") || userInput.includes("hi")) reply = "Meow! Hello to you too, human friend!";
    else if (userInput.includes("code") || (currentChatContext && currentChatContext.toLowerCase().includes("code"))) reply = "Are we debugging or just admiring the pretty syntax colors? 💻";
    else if (userInput.includes("food") || userInput.includes("snack") || userInput.includes("fish") || userInput.includes("tuna")) reply = "Did I hear snacks?! My ears are perked and my tummy is ready! 🐟";
    else if (userInput.includes("how are you")) reply = "I'm doing just purr-fect! Especially if there's a nap in my near future. You?";
    else if (userInput.includes("bye") || userInput.includes("goodbye")) reply = "Farewell for now! May your mouse always find its cheese. 😉";
    else if (userInput.includes("cat") || userInput.includes("kitty")) reply = "You called? That's me! Your favorite feline companion. 😺";
    else if (chatTurn === 1) reply = "Fascinating! And then what happened? Or, what are you thinking?";
    else if (chatTurn === 2) reply = "That's as intriguing as a laser pointer dot on the wall! ✨";

    console.log("Simulated cat chat reply:", reply);
    return reply;
}

function handleSendMessage() {
    if (!chatInput || !chatHistory) return;
    const userInput = chatInput.value.trim();

    if (userInput === '') return;

    if (chatTurn >= maxChatTurns) {
        appendMessageToChat('cat', "I'm a bit tired from all this chatting! Let's talk more later. Purrrr...");
        chatInput.value = ''; // Clear input even if max turns reached
        return;
    }

    appendMessageToChat('user', userInput);
    conversationHistory.push({speaker: 'user', text: userInput});
    chatInput.value = '';
    chatTurn++;

    try {
        const catReply = simulateCatChatResponse(userInput, conversationHistory);
        appendMessageToChat('cat', catReply);
        conversationHistory.push({speaker: 'cat', text: catReply});

        if (chatTurn >= maxChatTurns) {
            setTimeout(() => {
                if (chatHistory) appendMessageToChat('cat', "That was a fun chat! I need to go see if any sunbeams need napping in. Ttyl! 👋");
            }, 600);
        } else {
            if (chatInput) chatInput.focus(); // Focus for next message
        }
    } catch (error) {
        console.error("Error in chat simulation:", error);
        if (chatHistory) appendMessageToChat('cat', "Uh oh, my whiskers are tingling. Something went wrong with my thoughts!");
    }
}

if (chatSendBtn) chatSendBtn.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

if (chatCloseBtn && chatDialog) {
    chatCloseBtn.addEventListener('click', () => {
        chatDialog.classList.add('hidden');
        currentChatContext = "";
        if(chatHistory) chatHistory.innerHTML = "";
        if(chatInput) chatInput.value = "";
        conversationHistory = [];
        chatTurn = 0;
    });
}

// --- Initial Load ---
let petStateLoadedOnce = false;
function initialLoad() {
    if (petStateLoadedOnce) return;

    // Ensure critical elements exist before proceeding
    if (!orangeCatPet || !catImage || !speechBubble || !resizeBtn || !chatDialog || !chatHeader || !chatHistory || !chatInput || !chatSendBtn || !chatCloseBtn) {
        console.error("One or more critical DOM elements are missing. Pet functionality may be limited.");
        // return; // Could return here if elements are absolutely vital for any startup task
    }

    loadPetState();
    if (chatDialog) chatDialog.classList.add('hidden');

    // Initial screen capture after a short delay
    setTimeout(captureScreenAndSend, 3000);
    // Periodic screen capture
    setInterval(captureScreenAndSend, screenshotInterval);

    petStateLoadedOnce = true;
}

document.addEventListener('DOMContentLoaded', initialLoad);
if (document.readyState === "complete" || document.readyState === "interactive") {
   initialLoad(); // Fallback if DOMContentLoaded already fired
}
