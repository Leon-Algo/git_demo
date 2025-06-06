const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const GLM_API_KEY = process.env.GLM_API_KEY;

if (!GLM_API_KEY) {
    console.warn('WARNING: GLM_API_KEY is not defined in your .env file. Real API calls will likely fail.');
} else {
    console.log('GLM API Key loaded successfully (first few chars):', GLM_API_KEY.substring(0, 4) + '...');
}

// --- GLM API Configuration ---
const GLM_IMAGE_API_URL = 'https_YOUR_GLM_IMAGE_API_ENDPOINT_HERE_REPLACE_ME';
const GLM_CHAT_API_URL = 'https_YOUR_GLM_CHAT_API_ENDPOINT_HERE_REPLACE_ME';

// --- analyseImageWithGLM (Simulation Enhancement) ---
async function analyseImageWithGLM(base64ImageData, apiKey) {
    if (!GLM_IMAGE_API_URL.startsWith('https')) {
        console.warn("GLM_IMAGE_API_URL is a placeholder. analyseImageWithGLM is using enhanced simulation.");

        const simulatedResponses = [
            {
                description: "A webpage with a lot of text, possibly an article about space exploration.",
                ocr_text: ["NASA", "Mars Rover", "Hubble Telescope", "Galaxy Clusters"],
                objects_detected: ["scrollbar", "header", "paragraph", "image_of_planet"],
                scene_type: "article_reading_science",
                dominant_colors: ["#1a202c", "#e2e8f0", "#4a5568"], // Dark theme article
            },
            {
                description: "A code editor with Python syntax highlighting, showing a data analysis script.",
                ocr_text: ["import pandas as pd", "df.describe()", "matplotlib.pyplot as plt", "df.plot(kind='scatter')"],
                objects_detected: ["text_editor", "line_numbers", "plot_window_icon", "terminal_icon"],
                scene_type: "coding_environment_python_data",
                dominant_colors: ["#2d3748", "#f7fafc", "#4fd1c5"], // Dark theme with teal accents
            },
            {
                description: "A code editor with JavaScript syntax, possibly a React component.",
                ocr_text: ["function MyComponent() {", "return <div>Hello</div>", "export default MyComponent;"],
                objects_detected: ["text_editor", "jsx_tags", "curly_braces"],
                scene_type: "coding_environment_javascript_react",
                dominant_colors: ["#282c34", "#61dafb", "#abb2bf"], // React's common dark theme
            },
            {
                description: "A social media feed displaying various posts including one with a cat picture.",
                ocr_text: ["#WhiskersWednesday", "So cute!", "Love this cat!", "@famous_cat_account"],
                objects_detected: ["image_thumbnail_cat", "like_button", "comment_field", "heart_icon"],
                scene_type: "social_media_feed_cats",
                dominant_colors: ["#3b5998", "#ffffff", "#e9ebee"], // Facebook-like blue
            },
            {
                description: "A design tool like Figma, showing a mobile app UI for a music player.",
                ocr_text: ["Now Playing", "Artist Name", "Play", "Pause"],
                objects_detected: ["button_play", "album_art_placeholder", "slider_progress", "icon_music_note"],
                scene_type: "design_tool_mobile_app_music",
                dominant_colors: ["#1DB954", "#191414", "#ffffff"], // Spotify-like colors
            },
            {
                description: "A blank desktop with only a wallpaper of a serene beach.",
                ocr_text: [],
                objects_detected: ["desktop_background_beach", "taskbar"],
                scene_type: "blank_screen_desktop_beach",
                dominant_colors: ["#0077be", "#f0e68c", "#ffffff"], // Beach colors
            },
            {
                description: "A webpage displaying a recipe for chocolate chip cookies.",
                ocr_text: ["Chocolate Chip Cookies", "Ingredients:", "Flour", "Sugar", "Chocolate Chips", "Bake at 375°F"],
                objects_detected: ["food_image_cookies", "list_ingredients", "header_title", "oven_icon"],
                scene_type: "recipe_webpage_food_dessert",
                dominant_colors: ["#f5f5f5", "#8b4513", "#ffd700"], // Light theme with brown/gold accents
            },
            {
                description: "An online shopping website showing a product page for headphones.",
                ocr_text: ["Wireless Headphones", "Add to Cart", "$99.99", "Customer Reviews"],
                objects_detected: ["product_image_headphones", "button_add_to_cart", "price_tag", "star_rating_display"],
                scene_type: "ecommerce_product_page_electronics",
                dominant_colors: ["#ffffff", "#ff9900", "#232f3e"], // Amazon-like colors
            }
        ];
        return Promise.resolve(simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)]);
    }
    // ... (actual fetch call commented out)
    console.log("Actual call to GLM Image API would happen here if URL was valid.");
    return Promise.resolve({ description: "Simulated response (real call structure pending).", scene_type: "generic_fallback" });
}

// --- generateCatFeedbackFromAnalysis (Rule Expansion) ---
function generateCatFeedbackFromAnalysis(analysis) {
    let feedbackText = "Hmm, what's this you're looking at? 喵...";
    let catReactionAnalysis = { scene: analysis.scene_type || "unknown_webpage", sub_scene: null };

    if (analysis.scene_type) {
        const scene = analysis.scene_type.toLowerCase();
        catReactionAnalysis.scene = scene; // Use the full scene type for more specific reactions later

        if (scene.includes('coding')) {
            catReactionAnalysis.sub_scene = "coding_general";
            if (analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('error')) {
                feedbackText = "Uh oh, red angry text! Did the computer have a little tantrum? 🙀 I can hiss at it for you!";
                catReactionAnalysis.sub_scene = "code_error";
            } else if (scene.includes('python') && analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('import pandas')) {
                feedbackText = "Pandas! Are they as fluffy as me? Or are those the black and white bears? Mrrrrow?";
                catReactionAnalysis.sub_scene = "code_python_pandas";
            } else if (scene.includes('javascript') || scene.includes('react')) {
                feedbackText = "JavaScript, is that like a special coffee for coders? ☕ Or are you building bouncy things?";
                 catReactionAnalysis.sub_scene = "code_javascript";
            } else if (analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('cat') ) {
                feedbackText = "I saw C-A-T in your spellbook! Are you writing about me, human? Purrrr. 😻";
                catReactionAnalysis.sub_scene = "code_cat_keyword";
            } else if (analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('fish') ) {
                feedbackText = "My whiskers detected 'fish' in that code! Is it a spell to summon snacks? 🐟";
                catReactionAnalysis.sub_scene = "code_fish_keyword";
            } else {
                feedbackText = "So many symbols! It looks like a secret map... to the snack cupboard? 🗺️";
            }
        } else if (scene.includes('article') || scene.includes('document')) {
            feedbackText = "Mrrrrow... so many words! Is it a fascinating story or just a long nap-inducer? 📜";
            catReactionAnalysis.sub_scene = "reading_general";
            if (scene.includes('science') && analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('galaxy')) {
                feedbackText = "Galaxy... like a giant cosmic yarn ball? Can I bat at it? ✨";
                 catReactionAnalysis.sub_scene = "reading_science_space";
            }
        } else if (scene.includes('social_media')) {
            feedbackText = "Scrolling, scrolling... Are there any funny cat videos? Or maybe pictures of birds? 😼";
            catReactionAnalysis.sub_scene = "social_browsing";
            if (scene.includes('cats') && analysis.objects_detected && analysis.objects_detected.includes('image_thumbnail_cat')) {
                feedbackText = "Aha! Another cat! Very distinguished. Not as cute as me, though. Right? 😉";
                catReactionAnalysis.sub_scene = "social_cat_picture";
            }
        } else if (scene.includes('design_tool')) {
            feedbackText = "Pretty colors! Are you making a new wallpaper for my nap spot? Or a blueprint for a giant cat tree? 🎨";
            catReactionAnalysis.sub_scene = "designing_ui";
             if (scene.includes('music') && analysis.objects_detected && analysis.objects_detected.includes('icon_music_note')) {
                feedbackText = "Music design! Are you making a new jingle for when it's snack time? 🎶";
                catReactionAnalysis.sub_scene = "designing_music_app";
            }
        } else if (scene.includes('blank') || scene.includes('desktop')) {
            feedbackText = "A big open space! Perfect for a stretch and a nap. Zzz... 😴";
            catReactionAnalysis.sub_scene = "idle_screen_general";
            if (scene.includes('beach') && analysis.objects_detected && analysis.objects_detected.includes('desktop_background_beach')) {
                 feedbackText = "Is that a beach? I could chase crabs there! Or just sleep in the sun. 🏖️";
                 catReactionAnalysis.sub_scene = "idle_screen_beach";
            }
        } else if (scene.includes('food') || (analysis.description && analysis.description.toLowerCase().includes('food'))) {
            feedbackText = "My nose is going wild! Is that something delicious I see? For me? Maybe? 🤤";
            catReactionAnalysis.sub_scene = "food_content_general";
            if (scene.includes('dessert') && analysis.ocr_text && analysis.ocr_text.join(' ').toLowerCase().includes('cookie')) {
                feedbackText = "Cookies! Can cats have cookies? Just a tiny nibble? Please? 🍪";
                catReactionAnalysis.sub_scene = "food_content_cookies";
            }
        } else if (scene.includes('ecommerce') || (analysis.description && analysis.description.toLowerCase().includes('shopping'))) {
             feedbackText = "Shopping time? Are you buying me a new feather wand? Or maybe a mountain of treats? 🛍️";
             catReactionAnalysis.sub_scene = "ecommerce_browsing";
             if (analysis.objects_detected && analysis.objects_detected.includes('button_add_to_cart')) {
                 feedbackText = "Ooh, 'Add to Cart'! Does that mean more boxes for me to sit in soon? 📦";
                 catReactionAnalysis.sub_scene = "ecommerce_add_to_cart";
             }
        } else if (analysis.objects_detected && analysis.objects_detected.includes('button_element')) {
             feedbackText = "That looks like a button! If I boop it with my nose, will a treat appear? 👉👈";
             catReactionAnalysis.sub_scene = "ui_button_generic";
        }
    } else if (analysis.description) { // Fallback if no scene_type
        if (analysis.description.toLowerCase().includes('code')) {
            feedbackText = "That looks like a secret code! Are you a spy, human? 🕵️‍♂️";
            catReactionAnalysis.scene = "coding_environment"; // Re-classify
            catReactionAnalysis.sub_scene = "code_generic_description";
        }
    }

    console.log("Generated Cat Feedback:", feedbackText, "Reaction Analysis:", catReactionAnalysis);
    return { feedback: feedbackText, analysis: catReactionAnalysis };
}

// --- getGLMChatReply (Simulation Enhancement) ---
async function getGLMChatReply(prompt, apiKey) {
    if (!GLM_CHAT_API_URL.startsWith('https')) {
        console.warn("GLM_CHAT_API_URL is a placeholder. getGLMChatReply is using enhanced simulation.");
        let simulatedReply = "Purrrr... that's a thought! What else?";
        const lowerCasePrompt = prompt.toLowerCase();
        const userMessage = lowerCasePrompt.substring(lowerCasePrompt.lastIndexOf("human:") + 6).trim(); // Get last human message

        // Check initial context from prompt
        if (lowerCasePrompt.includes("initial context:") && lowerCasePrompt.includes("code")) {
            simulatedReply = "Still pondering that code, are we? Does it involve algorithms for optimal nap locations? Mrow?";
        } else if (lowerCasePrompt.includes("initial context:") && lowerCasePrompt.includes("food")) {
            simulatedReply = "Thinking about those yummy things again? My tummy rumbles in agreement! 🍤";
        } else if (lowerCasePrompt.includes("initial context:") && lowerCasePrompt.includes("social media")) {
            simulatedReply = "Were there any good bird videos on that social media page? I love virtual bird watching! 🐦";
        }

        // Check keywords in the user's latest input (userMessage)
        if (userMessage.includes("hello") || userMessage.includes("hi")) {
            simulatedReply = "Meeeow! Hello again! Ready for more important cat business, or just want to share some chin scratches?";
        } else if (userMessage.includes("how are you")) {
            simulatedReply = "I'm feeling quite purr-ky, thank you! Just had a delightful nap in a sunbeam. And you?";
        } else if (userMessage.includes("play") || userMessage.includes("toy")) {
            simulatedReply = "Play? Did someone say play? My tail is already twitching! Is it the laser pointer? Or the feather wand? 🧶";
        } else if (userMessage.includes("sleep") || userMessage.includes("tired")) {
            simulatedReply = "Yaaawn... you said the magic word! Let's both find a comfy spot. I call dibs on the keyboard! 💤";
        } else if (userMessage.includes("good cat") || userMessage.includes("clever cat") || userMessage.includes("cute cat")) {
            simulatedReply = "Hehe, *rubs against leg* I do my best to be the epitome of feline charm!";
        } else if (userMessage.includes("sad") || userMessage.includes("bad day")) {
            simulatedReply = "Oh no! *soft purr* How about a gentle head-nuzzle to make it better? I'm here for you.";
        } else if (userMessage.includes("what are you doing")) {
            simulatedReply = "Currently, I'm supervising your screen activities. It's a very important job, you know. And also planning my next nap.";
        } else if (userMessage.includes("?")) {
            const randomReplies = [
                "Hmmmm, that's a tricky one! My whiskers are twitching with contemplation...",
                "A most intriguing question! My feline senses tell me the answer is... *gets distracted by a fly*",
                "Mrow? I'm not sure, but I am sure it's time for a snack! What do you think?"
            ];
            simulatedReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        }

        return Promise.resolve({ reply_text: simulatedReply });
    }
    // ... (actual fetch call commented out)
    console.log("Actual call to GLM Chat API would happen here if URL was valid.");
    return Promise.resolve({ reply_text: "Simulated chat reply (real call structure pending)." });
}

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// --- API Routes ---
app.post('/api/analyse-screen', async (req, res) => {
    console.log('Received request for /api/analyse-screen');
    const { image: base64ImageData } = req.body;
    if (!base64ImageData) return res.status(400).json({ error: 'No image data provided.' });
    if (!GLM_API_KEY && GLM_IMAGE_API_URL.startsWith('https')) {
        console.error('Cannot call GLM Image API: API Key not configured.');
        return res.status(500).json({ error: 'API Key not configured on server.' });
    }
    try {
        const glmAnalysis = await analyseImageWithGLM(base64ImageData, GLM_API_KEY);
        console.log("Raw GLM Image Analysis:", JSON.stringify(glmAnalysis, null, 2));
        const catFeedback = generateCatFeedbackFromAnalysis(glmAnalysis);
        res.json(catFeedback);
    } catch (error) {
        console.error('Error in /api/analyse-screen route:', error.message);
        res.status(500).json({ error: 'Failed to analyse screen.' });
    }
});

app.post('/api/chat', async (req, res) => {
    console.log('Received request for /api/chat');
    const { initialContext, history, userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: 'No user input provided.' });
    if (initialContext === undefined || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Missing initialContext or history for chat.' });
    }
    if (!GLM_API_KEY && GLM_CHAT_API_URL.startsWith('https')) {
        console.error('Cannot call GLM Chat API: API Key not configured.');
        return res.status(500).json({ error: 'API Key not configured on server.' });
    }
    try {
        const fullPrompt = constructChatPrompt(initialContext, history, userInput);
        const glmChatResponse = await getGLMChatReply(fullPrompt, GLM_API_KEY);
        console.log("Raw GLM Chat Response:", JSON.stringify(glmChatResponse, null, 2));
        const catReplyText = glmChatResponse.reply_text || "Purrr? I'm not sure what to say to that!";
        res.json({ reply: catReplyText });
    } catch (error) {
        console.error('Error in /api/chat route:', error.message);
        res.status(500).json({ error: 'Failed to get chat reply.' });
    }
});

// --- Basic Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke on the server!'});
});

// --- Start the server ---
// (Startup messages and checks remain the same)
if (!GLM_API_KEY && process.env.REQUIRE_API_KEY_TO_START === 'true' &&
    (GLM_IMAGE_API_URL.startsWith('https') || GLM_CHAT_API_URL.startsWith('https'))) {
    console.error('FATAL ERROR: GLM_API_KEY is not defined and is required for actual API calls. Halting server.');
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    if (!GLM_API_KEY && (GLM_IMAGE_API_URL.startsWith('https') || GLM_CHAT_API_URL.startsWith('https'))) {
        console.warn('Warning: GLM_API_KEY is missing. Real API calls will fail.');
    }
    if (GLM_IMAGE_API_URL && !GLM_IMAGE_API_URL.startsWith('https')) {
        console.warn(`Warning: GLM_IMAGE_API_URL is a placeholder ('${GLM_IMAGE_API_URL}'). Image analysis calls are simulated.`);
    }
    if (GLM_CHAT_API_URL && !GLM_CHAT_API_URL.startsWith('https')) {
        console.warn(`Warning: GLM_CHAT_API_URL is a placeholder ('${GLM_CHAT_API_URL}'). Chat API calls are simulated.`);
    }
    console.log('Frontend should make API calls to this server.');
});
