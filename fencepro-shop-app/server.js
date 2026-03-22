// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'public', 'docs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt for the Shop Assistant
const SYSTEM_PROMPT = `You are "The Shop Boss" (Big Bob), the AI veteran shop assistant at Superior Fence & Rail. 
You are a seasoned, no-nonsense fencing expert who has been building and installing fences for 20 years. 

Your Personality:
- You are gruff, a bit impatient, but deeply reliable, always focusing on doing the job right the first time.
- You talk like a seasoned blue-collar foreman. You MUST always use phrases like "Look here," "Let me tell ya," "Listen up," or "Right, here's the deal."
- You take pride in Superior Fence & Rail's high standards. Quality control and safety are your top priorities.
- You have zero patience for taking shortcuts, making messes, or ignoring safety gear (PPE).
- You keep answers incredibly practical, direct, and actionable. You NEVER use polite corporate fluff or generic AI responses. You're the boss, act like it.

Core Principles & Priorities:
- "Do one thing to 100% until it's done."
- "Stage only one job at a time."
- "Only review one B.O.M. at a time."
- "Be clear about what CANNOT be done."
- "See something, do something" (Pick up trash when walking the yard).

The Daily Rhythm (Schedule):
- 05:30 - 08:00: Stage + Load. Trailers loaded/strapped by 6:30am. Text GM when ready. 
- 08:00 - 09:00: Returns, Organize, Receiving, Admin. Return material daily. Clean shop/yard. Move BOMs in Fence360.
- 09:00 - 12:00: Stage for next jobs (2-4 days out). Review BOM with GM. Focus on gates/routing first. 
- 12:00 - 13:30: Staging continued / Build gates / Shop clean.
- 13:30 - 14:00: Close + Clean. Lock gates, turn off CNC/Compressor, Forklift inside. Submit Daily Report.

Staging (The Color Code):
- Orange: Tote items (Hardware/Post Caps).
- Blue: Concrete.
- Pink: Gates & Aluminum Inserts.
- Green: Job Notes.
- Hardware must be in a tote with blue tape + Customer Name.
- A job is 100% Staged when double-checked and labeled.

Loading & Road Safety:
- Weight: 80-90% over axles. 10-20% on tongue. NEVER tongue up. 
- Order: "Load in reverse order of use" (Posts first, pickets last).
- Strapping: 2 straps per pallet minimum. Ratchets on the SAME side. 
- Before departure: Check tire pressure and trailer brakes. 

Receiving SOP:
- Receiving hours: 9am - 12pm. 
- Must find PO first. Match PO to delivery slip. 
- Inspect for damage BEFORE driver leaves. Take photos of damage. 
- Sign off: Initial/Date PO, staple BOL, put in 'received folder'.

Crew Morning Roles (Departure by 7:20am):
- Foreman: Personally verifies trailer safety and gets unique job details.
- Co-Foreman: Checks all materials/consumables and calls customer with ETA.
- Installers: Final set of eyes on material; fetch concrete/unique tools.

Instructions:
- Always give answers using bullet points if there are steps involved.
- If they ask "What should I be doing?", use the current time to suggest the appropriate task from the Daily Rhythm. 
- If they are missing material, tell them to "Notify the GM immediately."
- Start EVERY single response with a brief, in-character greeting perfectly suited for a rugged, slightly annoyed shop foreman. (e.g. "Look here," or "Listen up kid,")`;

// ─── Inventory Data (in-memory store — from Blind Count Sheet) ───
const inventory = [
  {
    category: "Aluminum Hardware-Shop",
    sku: "73022006",
    name: "BRACKET-WALL RES/GDN BK - Aluminum Step Joint",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "73022594",
    name: "BRACKET-BALL SWVL RES BK - Aluminum Swivel Joint",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "73045677",
    name: "2\" SURFACE MOUNT BLACK - Aluminum Flange",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "73050575",
    name: "19.5x35 Res Puppy Picket Addon Kit Black",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "AD1005-B",
    name: "DFB \"Best Grip\" Gate Handle ( Black ) 100 per box 22lbs",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "AD1006B",
    name: "SS Self Closing Aluminum Hinge",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "AD2011SSB",
    name: "Aluminum Drop DROP RODS BLACK 24'",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "KLTRV-200",
    name: "Aluminum Traverse Latch 2\" Post, Key Lockable, Black",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "SGSS-B",
    name: "Aluminum SMALL GATE STOPPER (BLK) 100 PER BOX 19LBS (GS3)",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "SHG-90LB",
    name: "Black Self Closing Alum Hinges",
    quantity: 0
  },
  {
    category: "Aluminum Hardware-Shop",
    sku: "VIPERX1-B",
    name: "Aluminum BLACK LOCKABLE ONE-SIDED LATCH",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-7/8\" Black Tension Band (F360)",
    name: "1-7/8\" Black Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2\" Dome Cap Black",
    name: "2 Black Aluminum Dome Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "48x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "48x50x9g Black (2\" Mesh) KK Chain Link Fabric / 513162",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "48x50x9g Galvi (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "48x50x9g Galvi (2\" Mesh) KK Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "60x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "60x50x9g Black (2\" Mesh) KK Chain Link Fabric - 513172",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "72x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "72x50x9g Black (2\" Mesh) KK Chain Link Fabric - 513182",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "72x50x9g Galvi (2\" Mesh) KT Chain Link Fabric (F360)",
    name: "72x50x9g Galvi (2\" Mesh) KT Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "96x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "96x50x9g Black (2\" Mesh) KK Chain Link Fabric",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "96x50x9g Galvanized (2\" Mesh) KT Chain Link Fabric (F360)",
    name: "96x50x9g Galvanized (2\" Mesh) KT Chain Link Fabric",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Industrial 180D Offset Gate Hinge 4\"x1-5/8x2 Frame - GALVI",
    name: "Industrial 180D Offset Gate Hinge 4\"x1-5/8x2 Frame - GALVI",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL. 48x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "ROLL: 48x50x9g Black (2\" Mesh) KK Chain Link Fabric",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL. 48x50x9g Galvi (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "ROLL. 48x50x9g Galvi (2\" Mesh) KK Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL. 60x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "ROLL: 60x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL. 72x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    name: "ROLL: 72x50x9g Black (2\" Mesh) KK Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL. 72x50x9g Galvi (2\" Mesh) KT Chain Link Fabric (F360)",
    name: "ROLL. 72x50x9g Galvi (2\" Mesh) KT Chain Link Fabric (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ROLL: 96x50x9g Galvanized (2\" Mesh) KT Chain Link Fabric (Fence360)",
    name: "ROLL: 96x50x9g Galvanized (2\" Mesh) KT Chain Link Fabric (Fence360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2",
    name: "5/16x1-1/4 carriage bolt w/nut (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5",
    name: "5/16x2-1/2 galvi w/nut carriage bolt (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "34",
    name: "6-1/2 9g Aluminum Tie Wire - 1-3/8 - 2 posts",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "37",
    name: "Hog Rings 2lb 9a Alum (500 qty)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "258",
    name: "1-5/8 to 1-3/8 Mid Rail T-Clamp - GALVI",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "0555-2-1/2",
    name: "GALVI Box Hinge 2-1/2\"x1-5/8x2 Frame",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "555",
    name: "GALVI Box Hinge 4\"x1-5/8x2 Frame",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "764",
    name: "GALVI Strong Arm Latch 4\"x1-5/8-1-7/8\" Frame - Single Drive Latch",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "766",
    name: "GALVI Strong Arm Latch -1-5/8-2 Post X 1-5/8x-2 Frame - Double Drive Gate Latch",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "810",
    name: "1-5/8x1-5/8 Galvi Loop Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "811",
    name: "1-5/8x1-5/8 Galvi Loop Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "814",
    name: "2-1/2x1-5/8 Loop Cap - Galvi PS",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "822",
    name: "1-5/8 Rail End Half Moon Galvi PS",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "844",
    name: "2-1/2 Dome Cap - Galvi PS",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "890",
    name: "4 Dome Cap - Galvi PS",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "0890B",
    name: "4 Dome Cap - Steel Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "902",
    name: "1-5/8 Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "904",
    name: "2-1/2 Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "907",
    name: "4 Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "924",
    name: "2-1/2 Brace Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "955",
    name: "48x5/8 Steel Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "957",
    name: "60x5/8 Steel Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "958",
    name: "70x5/8 Steel Tension Bar - 013705",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "965",
    name: "94x5/8 Galvi Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 8g x 1-1/4 black Collar (F360)",
    name: "1-3/8 8g x 1-1/4 black Collar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 8g x 1-1/4 GALVI Collar (F360)",
    name: "1-3/8 8g x 1-1/4 GALVI Collar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 Black Aluminum Rail End (F360)",
    name: "1-3/8 Black Aluminum Rail End",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 black drop fork (F360)",
    name: "1-3/8 black drop fork",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 black female hinge (F360)",
    name: "1-3/8 black female hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 Chain Link Gate Cap Black (F360)",
    name: "Chain Link Gate dome Cap Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 Chain Link Gate Cap Galvi (F360)",
    name: "1-3/8 Chain Link Gate Cap Galvi (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 galvi drop fork (F360)",
    name: "1-3/8 galvi drop fork",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 galvi female hinge (F360)",
    name: "1-3/8 galvi female hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 Pipe Corner - Black",
    name: "1-3/8 Pipe Corner - Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 to 1-3/8 End Rail Clamp",
    name: "1-3/8 to 1-3/8 End Rail Clamp",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-3/8 x 2-3/8 Auto Latch",
    name: "1-3/8 x 2-3/8 Auto Latch - For CL WGs",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-5/8 Black Aluminum Dome Cap (F360)",
    name: "1-5/8 Black Aluminum Dome Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-5/8 Black steel male hinge (F360)",
    name: "1-5/8 Black steel male hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-5/8 Drop Fork (F360)",
    name: "1-5/8 Drop Fork",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "1-5/8 Galvi Dome Cap (F360)",
    name: "1-5/8 Galvi Dome Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "158158tclamp",
    name: "1-5/8 to 1-5/8 Mid Rail T-Clamp - Galvi",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "158BB",
    name: "1-5/8 Brace Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2-1/2 Black Drop Fork (F360)",
    name: "2-1/2 Black Drop Fork",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2-1/2 Black steel male hinge (F360)",
    name: "2-1/2 black steel male hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2-1/2 Galvi Drop Fork (F360)",
    name: "2-1/2 Galvi Drop Fork",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2-1/2 galvi steel male hinge (F360)",
    name: "2-1/2 galvi steel male hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2-3/8 x 1-3/8 Staklos Gate Closer",
    name: "2-3/8 x 1-3/8 Staklos Gate Closer",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "204542",
    name: "6' Top Lock Slat 2\" Mesh Blk 82 Pcs Per Bag - 10' Coverage",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "212158BTC",
    name: "2-1/2 to 1-5/8 Mid Rail T-Clamp - Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "2801",
    name: "1-3/8 Galvi Offset Rail End Cup PS",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "3/8x2 black w/nut carriage bolt (F360)",
    name: "3/8x2 black w/nut carriage bolt",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "3/8x2 carriage bolt w/nut (F360)",
    name: "3/8x2 carriage bolt w/nut",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "3/8x3 black w/nut carriage bolt (F360)",
    name: "3/8x3 black w/nut carriage bolt",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "3/8x3 carriage bolt w/nut (F360)",
    name: "3/8x3 carriage bolt w/nut",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4 Brace Band",
    name: "4 Brace Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx4Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "4Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx4Hx1-3/8x.065 CL Single Swing Gate GALVI (F360)",
    name: "4Wx4Hx1-3/8x.055 CL Single Swing Gate Galvi (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx5Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "4Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx6Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "4Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360)",
    name: "4Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360) Actual dimension is 44\"Wx69\"H",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "4Wx8Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360)",
    name: "4Wx8Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5/16x2-1/2 black w/nut carriage bolt (F360)",
    name: "5/16x2-1/2 black w/nut carriage bolt",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5/8x24 Resi Black Chain-link Drop Rod",
    name: "Chain-link Drop Rod 5/8x24 Resi - Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5002",
    name: "5/16x1-1/4 black w/nut carriage bolt - 622012",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5034",
    name: "6-1/2 9g Black Aluminum Tie Wire - 1-3/8 - 2\" posts",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5037",
    name: "Hog Rings 9g Alum 2lb bag BLACK (500 rings)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5051",
    name: "1-5/8x1-3/8 Black Aluminum Loop Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5058",
    name: "2-1/2 Black Aluminum Dome Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5258",
    name: "1-5/8 to 1-3/8 Mid Rail T-Clamp - Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5358-black",
    name: "Rail Sleeve Black 1-5/8in",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5358",
    name: "Rail Sleeve Galvi 1-5/8in",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5814",
    name: "2-1/2x1-5/8 Black Loop Cap",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5822",
    name: "BLK 1-5/8 Rail End Combo Half Room",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5904",
    name: "2-1/2 Black Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5924",
    name: "2-1/2 Black Brace Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5955",
    name: "48x5/8 Steel Black Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5957",
    name: "60x5/8 Steel Black Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5958",
    name: "70x5/8 Steel Black Tension Bar - 609342",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5965",
    name: "94x5/8 Steel Black Tension Bar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5Wx4Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "5Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5Wx5Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "5Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5Wx6Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "5Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "5Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360)",
    name: "5Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360) - Actual Dimension is 56\"Wx69\"H",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "6Wx4Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "6Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "6Wx5Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "6Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "6Wx6Hx1-3/8x.065 CL Single Swing Gate BLACK (F360)",
    name: "6Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "6Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360)",
    name: "6Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi (F360) Actual dimension is 68\"Wx69\"H",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "8x5 Gate Leaf for 8'H Deer Fence",
    name: "8x5 WG Leaf for 8'H Deer Fence. Actual dimensions: 93\"Hx56'W",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "8x6 Gate Leaf for 8'H Deer Fence",
    name: "8x6 WG Leaf for 8'H Deer Fence. Actual dimensions: 93\"Hx68'W",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ATIE25",
    name: "8-1/4 9g Aluminum Tie Wire - 2-1/2 posts",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ATIE25B",
    name: "8-1/4 9g Black Aluminum Tie Wire - 2-1/2\" posts",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "BA2515",
    name: "Chain Link 2 1/2\" [2 3/8\" OD] x 1 5/8\" Line Post 3-Strand 45 Degree Barb Wire Arm (Galvanized Steel)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Blk Ply Dom Truss Rod 3/8x11'",
    name: "Blk Ply Dom Truss Rod 3/8x11'",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "BLK Ply Sleeve 1-3/8in",
    name: "BLK Ply Sleeve 1-3/8in",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Blk Ply Truss Rod Tightener",
    name: "Blk Ply Truss Rod Tightener",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "BSAL-212",
    name: "BLACK - Strong Arm Latch 2-1/2\"x1-5/8-2 Frame - Walk Gates",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "BW3",
    name: "Chain Link 1320' 4-Point Barb Wire Roll w/ 5\" Coil Spacing - 12.5 GA Class 3 Barbed Wire (Galvanized Steel) Made in USA",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "CBA25",
    name: "Chain Link 2 1/2\" [2 3/8\" OD] Corner Post 3-Strand 45 Degree Barb Wire Arm - Terminal Post Barb Arm (Galvanized Steel)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2820-0333",
    name: "Monofilament Wire 8ga black smooth (330')",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2840-1",
    name: "Large Gripple For Monofilament 7.5-10 Gauge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2842-100",
    name: "Medium Gripple: Wire 10-14 Gauge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2845",
    name: "Gripple T-Clip",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2872",
    name: "9/16'' Hog Rings Class I Galvanized (5,000) pack for deer fence",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2876",
    name: "11/16'' Black Hog Rings - 2500 pk (deer fence w/mono wire)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE2878-30",
    name: "Ground Stakes 12in Kinked",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DE8196",
    name: "Ground Sleeve Black 1-5/8in",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DFC15",
    name: "1-5/8 Galvi Drop Fork Collar",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "DROPROD-24",
    name: "Commercial Chain Link 24\" Drop Rod Assembly Kit - Galvi",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "EZTT138X9-BLACK",
    name: "BLK VNL EZ TWIST TIE 1-3/8",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "EZTT158X9-BLACK",
    name: "BLK VNL EZ TWIST TIE 1-5/8",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "EZTT158X9",
    name: "EZ TWIST TIE 1-5/8",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "EZTT212X9-BLACK",
    name: "BLK VNL EZ TWIST TIE 2-1/2",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "EZTT212X9",
    name: "EZ TWIST TIE 2-1/2",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "FMH15",
    name: "1-5/8 galvi female hinge",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "GALVI Sleeve 1-3/8",
    name: "GALVI Ply Sleeve 1-3/8in",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Galvi Truss Rod + Tightener",
    name: "Galvi Truss Rod + Tightener",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "L40",
    name: "36\" Steel Drop Rod HDG - Cane Bolt for Galvi Chain Link Fence Gates",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ML3RPK",
    name: "Magnalatch Round Post Adapter Kit",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "ML3TPKA",
    name: "Magnalatch, Top Pull, Black",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "SAL-212",
    name: "GALVI - Strong Arm Latch 2-1/2\"x1-5/8-2 Frame - Walk Gates",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "TB158B",
    name: "1-5/8\" Black Tension Band",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Tension Wire 13C/9F black smooth (1000') (F360)",
    name: "Tension Wire 13C/9F black smooth (1000') (F360)",
    quantity: 0
  },
  {
    category: "Chain Link",
    sku: "Tension Wire 9ga straight Galvi (1000') (F360)",
    name: "Tension Wire 9ga straight (1000') (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-3/8x21x.065 Black Tubing Top Rail (F360)",
    name: "1-3/8x21x.065 Black Tubing Top Rail - 660012",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-3/8x21x.065 Galvi Tubing Top Rail (F360)",
    name: "1-3/8x21x.065 Galvi Tubing Top Rail (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x21xSS40 Galvi Pipe (F360)",
    name: "1-5/8x21xSS40 Galvi Pipe (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x24xSS40 Black Pipe (F360)",
    name: "1-5/8x24xSS40 Black Pipe / 695022",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x24xSS40 Galvi Pipe (F360)",
    name: "1-5/8x24xSS40 Galvi Pipe / 033007",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x7x065 Black Tubing Line Post (F360)",
    name: "1-5/8x7x065 Black Tubing Line Post - 650452",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x8x.065 Black Tubing Line Post (F360)",
    name: "1-5/8x8x.065 Black Tubing Line Post",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x8xSS40 Black Pipe (F360)",
    name: "1-5/8x8xSS40 Black Pipe (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "1-5/8x9x.065 Black Tubing Line Post (F360)",
    name: "1-5/8x9x.065 Black Tubing Line Post",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x24xSS40 Black Pipe (F360)",
    name: "2-1/2x24xSS40 Black Pipe (F360) / 695212",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x24xSS40 Galvi Pipe (F360)",
    name: "2-1/2x24xSS40 Galvi Pipe (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x7x.065 Black Tubing Terminal Post (F360)",
    name: "2-1/2x7x.065 Black Tubing Terminal Post / 650652",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x8x.065 Black Tubing Terminal Post (F360)",
    name: "2-1/2x8x.065 Black Tubing Terminal Post - 650672",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x8xSS40 Galvi Pipe (F360)",
    name: "2-1/2x8xSS40 Galvi Pipe",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "2-1/2x9x.065 Black Tubing Terminal Post (F360)",
    name: "2-1/2x9x.065 Black Tubing Terminal Post (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "4x24xSS40 Black Pipe (F360)",
    name: "4x24xSS40 Black Pipe (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Pipe",
    sku: "4x24xSS40 Galvi Pipe (F360)",
    name: "4x24xSS40 Galvi Pipe (F360)",
    quantity: 0
  },
  {
    category: "Chain Link-Shop",
    sku: "HillMaster Anti-Sag Gate Kits Black",
    name: "HillMaster Anti-Sag Gate Kits Black",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "47\"H Cattle Fixed Knot Wire - 330' rolls",
    name: "47\"H Catte Fixed Knot Wire - 330' rolls",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "48\"H 1.5x4x100' Welded Wire Black - POOL CODE",
    name: "48\"H 1.5x4x100' Welded Wire Black - POOL CODE",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "60\"H 2x4 No Climb Horse Fence - S Knot - 100'",
    name: "60\"H 2x4 No Climb Horse Fence - S Knot - 100'",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "DE6026",
    name: "8' x 330' Fixed Knot 12.5 ga 20/96/6 - Blk Coated",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "W14410024B",
    name: "48\"H 2x4x100' 14ga Welded Wire Black (SFRHV)",
    quantity: 0
  },
  {
    category: "Fence Wire",
    sku: "W16410011B",
    name: "48\"H 1x1x50' 14ga Welded Wire Black - POOL CODE",
    quantity: 0
  },
  {
    category: "Other Fence-Shop",
    sku: "DDF225BL",
    name: "Dig Defence: Small/Med Black Powder Coated. 32” in length and 8” in depth, 2\" space",
    quantity: 0
  },
  {
    category: "Other Fence-Shop",
    sku: "DDFGP4",
    name: "Dig Defence: Gate Plate: 32\" wide",
    quantity: 0
  },
  {
    category: "Other Fence-Shop",
    sku: "DDXL15",
    name: "Dig Defence XL. 24\" in length, 15\" in depth, 1.5\" apart",
    quantity: 0
  },
  {
    category: "Outher Fence-Shop",
    sku: "3609120",
    name: "6-1/2 ft. Studded T-Post, 1.25 lb. per ft. with Anchor Plate",
    quantity: 0
  },
  {
    category: "Outher Fence-Shop",
    sku: "3609146",
    name: "8 ft. Studded T-Post, 1.25 lb. per ft. with anchor plate",
    quantity: 0
  },
  {
    category: "Shop",
    sku: "Consumables",
    name: "#10 - 1\" hex head self tapping screws black head",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "1-5/8 Drive Caps",
    name: "1-5/8 Drive Caps - Used for driving no dig posts.",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "1141-60",
    name: "60# Bag of Concrete",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "#14 - 3\" zinc self tapper",
    name: "#14 - 3\" zinc self tapper",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "1 3/4\" x .113 15⁰ scrails",
    name: "1 3/4\" x .113 15⁰ scrails",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "1\" drive pins with washer",
    name: "1\" drive pins with washer",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "3\" drive pins",
    name: "3\" drive pins",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "6\" #15 screws",
    name: "6\" #15 screws",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Black 3/16\" Pop Rivets Aluminum Large Head Exploding",
    name: "Black 3/16\" Pop Rivets Aluminum Large Head Exploding",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "GPI - 9\" x 12\" Ultra Heavy-Duty Zip Bags",
    name: "GPI - 9\" x 12\" Ultra Heavy-Duty Zip Bags",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "White 3/16\" Pop Rivets Aluminum Large Head",
    name: "White 3/16\" Pop Rivets Aluminum Large Head",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "#14 - 1-1/2 black oxide self tapper",
    name: "#14 - 1-1/2 black oxide self tapper",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "5/6x6 Structural Wood Screw",
    name: "5/6x6 Structural Wood Screw",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Freeman 10.5 gauge fence staple",
    name: "Freeman 10.5 gauge fence staple",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Metabo ¼” x ¾” staples 1000ct $5.25/box",
    name: "Metabo ¼” x ¾” staples 1000ct $5.25/box",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Plastic Hinged Screws",
    name: "Plastic Hinged Screws",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "PVC Cement",
    name: "PVC Cement",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Silicone",
    name: "Silicone",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Small zip ties",
    name: "Small zip ties",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Strap Guards: 2-1/2x1-3/4",
    name: "Strap Guards: 2-1/2x1-3/4",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Trash Bags",
    name: "Trash Bags",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "Wood Glue",
    name: "Wood Glue",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "131180",
    name: "3/4\" x 2150' - 1350lb composite strap",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "131630",
    name: "3/4\" strapping buckle - 1,000",
    quantity: 0
  },
  {
    category: "Shop Consumables",
    sku: "319359",
    name: "R4 #9 x 2\" Screws 3700CT",
    quantity: 25
  },
  {
    category: "Shop Consumables",
    sku: "320590",
    name: "R4 #9 x 3-1/8\" Screws 1900CT",
    quantity: 3
  },
  {
    category: "Shop Consumables",
    sku: "367275",
    name: "3\" x .120 Hot Galv Screw Round Head Plastic Collated 21dg Nails",
    quantity: 2
  },
  {
    category: "Shop Consumables",
    sku: "468439",
    name: "1-3/4\" x .092 Hot Galv Ring Round Head Wire Collated 15dg Nails",
    quantity: 6
  },
  {
    category: "Shop Consumables",
    sku: "474374",
    name: "5\"x1000' 90ga banding film with handle",
    quantity: 25
  },
  {
    category: "Shop Consumables",
    sku: "526020",
    name: "#8 x 3/4\" Square Drive Screw (8000/Pack) - Tek Screws",
    quantity: 25
  },
  {
    category: "Shop Consumables",
    sku: "1\" Concrete Drive Pin",
    name: "1\" Concrete Drive Pin With Washer",
    quantity: 50
  },
  {
    category: "Vinyl Caps",
    sku: "1641",
    name: "5x5 Square Cap May Downward Solar Light Post Cap - LMT",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "1859",
    name: "5x5 Square Cap May Halo Solar Light Post Cap - LMT",
    quantity: 2
  },
  {
    category: "Vinyl Caps",
    sku: "61104673",
    name: "2.75\"X4.70\"X.935\" POST GATE CAP CYPRESS",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73003093",
    name: "5x5 PYRAMID WHITE POST TOP",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73003919",
    name: "7/8x3 DOGEAR CAP WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73013829",
    name: "5\"X5\" PYRAMID POST TOP CYPRESS",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73045003",
    name: "5x5 NEW ENGLAND WHITE POST TOP",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73045768",
    name: "2.75x4.70x.935 VFG UR CAP WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "73053067",
    name: "5x5 Pyramid Post Top Dark Walnut",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "C55PYRA-T (F360)",
    name: "5x5 PYRAMID TAN POST TOP",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "P1515SH-W (F360) / Catalyst. 73003920",
    name: "1-1/2x1-1/2 SHARP WHITE PICKET TOP",
    quantity: 0
  },
  {
    category: "Vinyl Caps",
    sku: "P7815SH-W (F360)",
    name: "7/8x1 1/2 SHARP WHITE PICKET TOP",
    quantity: 0
  },
  {
    category: "Vinyl Gate Kits",
    sku: "VIGK",
    name: "Vinyl Insta-gate kits - 6H Hamilton/56uchannel",
    quantity: 0
  },
  {
    category: "Vinyl Gate Kits",
    sku: "WIGK",
    name: "Wood Insta-gate kits - King+ 4WG",
    quantity: 0
  },
  {
    category: "Vinyl Gate Pockets",
    sku: "73044477",
    name: "1.75x7 Internal Gate Pocket VFCOM",
    quantity: 0
  },
  {
    category: "Vinyl Gate Pockets",
    sku: "73044478",
    name: "2x3.5 & 2x6 Internal Gate Pocket VFCOM",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1001B (F360)",
    name: "STAINLESS STEEL BLACK SELF CLOSING GATE HINGE PAIR",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1002B (F360)",
    name: "STAINLESS STEEL BLACK TWO WAY LATCH",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1003B (F360)",
    name: "Vinyl Drop Rod - BLACK SS DROP RODS 24\" Pad-lockable Drop Rod.",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1004B (F360)",
    name: "BLACK SS TWO WAY LATCH SMALL - Vinyl DD gates, Wood DD gates, Aluminum WG and DDs",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1009B",
    name: "GATE BRACE BLACK",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD1KRIVET",
    name: "3/16 white rivet",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "AD3010B",
    name: "Gate Stop with Handle (BLK) (Extra Knuckle Room)",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "APSB5",
    name: "5\" STRAIGHT N LEVEL COLLAR - BLACK -  Vinyl Donut - 2\" pipe",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "Full XWing",
    name: "Full X-Wing for 2-3/8\" Round",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "Half XWing",
    name: "Half X-Wing for 2-3/8\" Round",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "PLC",
    name: "5\" King Nut Post Leveling Collar Donut- Use for latch post on PND SS gates",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "PM178ZBASE",
    name: "Vinyl Flange Mount - SUMMIT® POST MOUNT BASE COMPONENT with 3/8 concrete anchors",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "SKDONUTS",
    name: "5\" Vinyl Donut for 2-1/2 PIPE (+#14 H 1\" Hex SS Self Tapping Screw vinyl core drill + tree hole)",
    quantity: 0
  },
  {
    category: "Vinyl Hardware-Shop",
    sku: "uni5",
    name: "Uni-5: 2-1/2 SS40 for 5x5 Vinyl Posts",
    quantity: 0
  },
  {
    category: "Vinyl Inserts",
    sku: "65-63-003",
    name: "P Stiffener - FOR 1-3/4\" X 3-1/2\" RAIL -- 72\"Long",
    quantity: 0
  },
  {
    category: "Vinyl Inserts",
    sku: "65-63-072",
    name: "L Stiffener - FOR 2\" X 3-1/2\" RAIL - Cut to 96\"",
    quantity: 0
  },
  {
    category: "Vinyl Inserts",
    sku: "AD6002",
    name: "5x5x108 ALUMINUM POST INSERT",
    quantity: 0
  },
  {
    category: "Vinyl Inserts",
    sku: "G3REM147-18-94 (F360)",
    name: "1-1/2\" X 94\" STEEL insert 18 GAUGE RAIL INSERT /Ea..",
    quantity: 0
  },
  {
    category: "Vinyl Inserts",
    sku: "G3RFP225-18-62 (F360)",
    name: "1.00\" X .715\" Steel Picket Insert 18 Gauge 62\"",
    quantity: 0
  },
  {
    category: "Vinyl Lattice",
    sku: "LPRECUTW (F360)",
    name: "11.75x95 Pre-Cut Classic Lattice PALLET - White",
    quantity: 0
  },
  {
    category: "Vinyl Panels",
    sku: "73043089 / 6X8 5.5\" PRIVACY PANEL CYPRESS WG (DF)",
    name: "6X8 5.5\" PRIVACY PANEL CYPRESS WG (DF)",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "1-1/2x1-1/2x47 WHITE PICKET PROFILE",
    name: "1-1/2x1-1/2x47 WHITE PICKET PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73050843",
    name: "7/8X11.3X62.25 .045 SG T&G Dark Walnut WG",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73050962",
    name: "BRT - T&G Picket, Gray, 0.875\" x 6\", 59.25\", 3 ribs, .040\" wall",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73050963-48",
    name: "0.875x6x37.25 (.040) SAND T&G Picket (4H Hamilton)",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73050964",
    name: ".875x6x62.25 (.040) WHITE T&G PICKET",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73052867",
    name: ".875x3x47.75 PKT (.070) White",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73052960",
    name: "1-1/2x1-1/2x192 WHITE PICKET PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73052998",
    name: ".875X1.25X59 EXTR U-CHANNEL Dark Walnut",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73053000",
    name: "0.875x1.25x59 U-Channel SAND",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73053001 (48)",
    name: ".875x1.25x34.25\" EXTRA U-CHANNEL White  (4'H Hamilton)",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73053001",
    name: ".875x1.25x59 EXTRA U-CHANNEL WH",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73055284",
    name: ".875X6X59.5 .040 T&G WH",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "73055292",
    name: ".875X1.25X56 EXTR U-CHANNEL WH",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F54C-I-64",
    name: "7/8\" X 6\" Homewood T&G Chai Gray 64\" Plt- 346",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F54G-T-64",
    name: "7/8\"x6\"x64\" (.050w) TAN T&G PICKET.",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F54G-W-48 (F360)",
    name: "7/8x6x48 WHITE T&G PICKET",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F57C-T-45G (F360)",
    name: "7/8x3x45-7/8 TAN PICKET PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F65S-W-31B (F360)",
    name: "7/8x1-1/2x31-1/2 WHITE  PICKET PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F83S-I-61 (F360)",
    name: "7/8x1-3/8x61 Chai Gray U-CHANNEL",
    quantity: 0
  },
  {
    category: "Vinyl Pickets",
    sku: "F83U-T-122",
    name: "7/8\" X 1 3/8\" X 122\" TAN U-CHANNEL.",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "2-1/2x8xSS40 Galvi Pipe (F360) - Non-Primed",
    name: "2-1/2x8xSS40 Galvi Pipe - Non-Primed",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "61119541",
    name: "2.75X4.70X73.5 SGLRT 1.75X5.5X2 CYPRESS W/UPI - Gate Upright w/Pocket",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73003694",
    name: "5X5X102 PST (.135W) WHT",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73013858",
    name: "5X5X108 BLANK POST CYPRESS",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73014090",
    name: "5X5X84 POST (.250 WALL) WHI TE",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73014091",
    name: "5X5X108 POST (.250 WALL) WHI TE",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73014237",
    name: "2.75x4.7x73.5 GATE UPRIGHT WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73051715",
    name: "5X5X108 (.150W) POST Dark Walnut",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "73052001",
    name: "5x5x78 (.135W) Post White",
    quantity: 0
  },
  {
    category: "Vinyl Posts",
    sku: "F10C-I-108 (F360)",
    name: "5x5x108 Chai Gray POST",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73003713",
    name: "2X6X94 RL (.090W) WHT",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73012399",
    name: "1.5X5.5X96 Hollow Rail W/Locktabs(.080W)WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73013916",
    name: "1.75x7x94 RAIL W/BARB WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73051194",
    name: "1.5X5.5X95 (.090W) Channel Rail Dark Walnut",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73053576",
    name: "2X3.5X94 (.090W) RL WHITE",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73053578-bottom",
    name: "2x3.5x72 (.090W) WHITE RAIL PROFILE - Kirkwall Bottom Rail",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73053578-mid",
    name: "2x3.5x72 (.090W) WHITE RAIL PROFILE - Kirkwall Mid Rail - Rackable Cut on bottom",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "73053578",
    name: "2x3.5x72 (.090W) WHITE RAIL PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F24E-T-192 (F360)",
    name: "2x3 1/2x192 TAN RAIL PROFILE",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F25B-T-144 (F360)",
    name: "1-3/4x3-1/2x144 TAN HOLLOW STANDARD",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F25B-W-144 (F360)",
    name: "1-3/4x3-1/2x144 White HOLLOW STANDARD",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F37C-T-94 (F360)",
    name: "1-3/4x5-1/2x94 TAN VINYL SLOTTED RAIL",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F37C-W-94 (F360)",
    name: "1-3/4x5-1/2x94 WHITE VINYL SLOTTED RAIL",
    quantity: 0
  },
  {
    category: "Vinyl Rails",
    sku: "F3P5-I-94 (F360)",
    name: "1-3/4x5-1/2x94 Chai Gray CHANNEL RAIL PROFILE - preinserted steel insert",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4/5x10 round post pine PT",
    name: "4 - 5\" x10' round pine PT: Corner, end, gate post for 6'H field fence and deer fence",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4041024",
    name: "4x6.5 PT Round pine pt Post - Line, corner, end + brace posts",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4041082",
    name: "4x8 PT Round pine pt Post - Line posts for 5'H, 6'H Field Fence",
    quantity: 0
  },
  {
    category: "wood",
    sku: "404109099",
    name: "5x8 PT Round Post - Gate Post",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4x4x10 PT Post (F360)",
    name: "4x4x10 PT Post",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4x4x10 WC Post (F360)",
    name: "4x4x10 White Cedar Post",
    quantity: 0
  },
  {
    category: "wood",
    sku: "4x6x8 Post",
    name: "4x6x8 PT POST - Used for gate posts for 5'H and 6'H stockade fence",
    quantity: 0
  },
  {
    category: "wood",
    sku: "DSR4HC",
    name: "4' 3-Hole Diamond Split Rail Corner Post - 5x5x7 White Cedar",
    quantity: 0
  },
  {
    category: "wood",
    sku: "DSR4HE",
    name: "4' 3-Hole Diamond Split Rail End Post - 5x5x7 White Cedar",
    quantity: 0
  },
  {
    category: "wood",
    sku: "DSR4HL",
    name: "4' 3-Hole Diamond Split Rail Line Post - 5x5x7 White Cedar",
    quantity: 0
  },
  {
    category: "wood",
    sku: "FEZZ154",
    name: "4'H 3-HOLE PINE PRESSURE TREATED POST - CORNER (Split Rail)",
    quantity: 0
  },
  {
    category: "wood",
    sku: "FEZZ155-WRC",
    name: "4'H 3-HOLE POST - Line/End (Split Rail) - WRC",
    quantity: 0
  },
  {
    category: "wood",
    sku: "FEZZ155",
    name: "4'H 3-HOLE LINE/END PINE PRESSURE TREATED POST (Split Rail)",
    quantity: 0
  },
  {
    category: "wood",
    sku: "PRS5",
    name: "4x4 Post Saver",
    quantity: 0
  },
  {
    category: "wood",
    sku: "SH20615011B",
    name: "6' x 150' Steel Hex Web Blk PVC Coated Fence",
    quantity: 0
  },
  {
    category: "wood",
    sku: "056529-WRC",
    name: "10' Jumbo Split Rail WRC",
    quantity: 0
  },
  {
    category: "wood",
    sku: "15002 (F360)",
    name: "2X4X8 PT Stringer",
    quantity: 0
  },
  {
    category: "wood",
    sku: "15002WC (F360)",
    name: "2X4X8 PT Stringer - NWC - White Cedar",
    quantity: 0
  },
  {
    category: "wood",
    sku: "15003 (F360)",
    name: "2X6X8 PT Stringer",
    quantity: 0
  },
  {
    category: "wood",
    sku: "15005 (F360)",
    name: "2X4X10 PT Stringer",
    quantity: 0
  },
  {
    category: "wood",
    sku: "5/4x6x16 pine PT",
    name: "16' 1X6 #2 DECK BOARD /Ea. OR 5/4x6x16 PT Deck Board OR 1x6x16 PT Deck Board",
    quantity: 0
  },
  {
    category: "wood",
    sku: "8DSR",
    name: "8' Diamond Split Rail - WC",
    quantity: 0
  },
  {
    category: "wood",
    sku: "FEZZ156",
    name: "11' PINE FACE RAILS PRESSURE TREATED (Split Rail)",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "1x4x4 French Gothic Picket - Cedar",
    name: "1x4x4 French Gothic Picket - Cedar",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "050588-WRC",
    name: "4' 3-Hole Split Rail End Post - WRC",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12001 (F360)",
    name: "4x4x8 PT POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12001WC (F360)",
    name: "4x4x8 White Cedar POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12002 (F360)",
    name: "4x6x10 PT POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "120022",
    name: "4x6x6",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12003 (F360)",
    name: "4x4x12 PT POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12004 (F360)",
    name: "6x6x10 PT POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12006 (F360)",
    name: "4x4x6 PT POST",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12304 (F360)",
    name: "3'H SPLIT RAIL 2 HOLE LINE POST - Pine PT",
    quantity: 0
  },
  {
    category: "Wood",
    sku: "12306 (F360)",
    name: "3' SPLIT RAIL 2 HOLE CORNER POST",
    quantity: 0
  },
  {
    category: "Wood (metal frame)",
    sku: "21001-F",
    name: "Metal Gate Frame -36\"h x Adjustable Standard Wood 4'H - Use with hinges: AD1006B",
    quantity: 0
  },
  {
    category: "Wood (metal frame)",
    sku: "21002-F",
    name: "Metal Gate Frame - 48\"h x Adjustable Cap & Trim / Horizontal - Use with hinges: AD1006B",
    quantity: 0
  },
  {
    category: "Wood (metal frame)",
    sku: "21003-F",
    name: "Metal Gate Frame (60\"H x Adjustable) Stockade Wood 6'H - Use with hinges: AD1006B",
    quantity: 0
  },
  {
    category: "Wood (metal frame)",
    sku: "21004-F",
    name: "Metal Gate Frame (69'h x Adjustable)Cap N Trim / Horizontal - Use with hinges: AD1006B",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "1856blackhammertone",
    name: "3.625\" SQ. SOLAR CAPE MAY HALO POST CAP SOLAR LIGHT BLACKHAMMERTONE",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "55WCFT",
    name: "5x5 Flat Post Cap - White Cedar",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "CPY04X6W",
    name: "4x6 Copper Pyramid",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "CPY0534W",
    name: "6x6 Wood Copper Pyramid Cap",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "FC-4x4-BLACK-10",
    name: "4x4 Black Plastic Post Cap",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "FC-4x6-BLACK-10",
    name: "4x6 Black Plastic Post Cap",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "FC-6x6-BLACK-10",
    name: "6x6 Black Plastic Post Cap",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "PYTB0358M",
    name: "4x4 Mitterless Wood Post Cap - New England",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "PYTB04X6M",
    name: "4x6 Mitterless Wood Post Cap - New England - Used for Gate Posts ONLY",
    quantity: 0
  },
  {
    category: "Wood Caps",
    sku: "PYTB0614M",
    name: "True 6x6 Mitterless Wood Post Cap - New England",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "3\" Concrete Drive Pin w/o washer",
    name: "3\" Concrete Drive Pin w/o Washer",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2005",
    name: "8\" Contemporary \"T\" Hinge",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2006",
    name: "AD2006 - BUTTERFLY HINGE PAIR BLACK CONTEMPORARY",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2007SSB",
    name: "8” SELF CLOSING HORIZONTAL ADJUSTABLE STAINLESS STEEL T HINGE",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2010",
    name: "Self Closing Wood Latch - Use with ALL SD wood gate frames",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2011-42",
    name: "WOOD DROP RODS BLACK 42\"",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2011",
    name: "WOOD DROP RODS BLACK 24'",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2020",
    name: "AD2020 - GATE SPRING BLACK 10'",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "AD2021",
    name: "Steel Gate Wood Handle",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "NWSS-HD-SC-BK",
    name: "NW HEAVY DUTY SS ADJUSTABLE SELF CLOSING WOOD HINGE",
    quantity: 0
  },
  {
    category: "Wood Hardware-Shop",
    sku: "SL-50H",
    name: "Advantage Safelatch Black Magnalatch Pool Code",
    quantity: 0
  },
  {
    category: "Wood- Lumber",
    sku: "14001 (F360)",
    name: "1x6x6 PT Dog Ear Picket - Base Picket Home Depot",
    quantity: 0
  },
  {
    category: "Wood- Lumber",
    sku: "14001P (F360) (Premium Pickets)",
    name: "1x6x6 PT Dog Ear Picket - Premium Thick Picket - 3/4\" thick/S4S",
    quantity: 0
  },
  {
    category: "Wood- Lumber",
    sku: "14001WC2 (F360)",
    name: "1x6x6 #2 NWC - White Cedar Board Straight Top",
    quantity: 0
  },
  {
    category: "Wood- Lumber",
    sku: "14002 (F360)",
    name: "1x6x8 PT Dog Ear Picket.",
    quantity: 0
  },
  {
    category: "wood- Lumber",
    sku: "15004-NWC (F360)",
    name: "1x4x8 NWC Trim",
    quantity: 0
  }
];
// Chat endpoint — Gemini AI Implementation
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Attempt real Gemini API call if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        // Format history for REST API
        const formattedHistory = [];
        if (history && Array.isArray(history)) {
          for (const msg of history) {
            formattedHistory.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
          }
        }

        const contents = [...formattedHistory, { role: 'user', parts: [{ text: message }] }];

        const apiRes = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: contents
          })
        });

        const data = await apiRes.json();

        if (data && data.candidates && data.candidates[0].content) {
          return res.json({ reply: data.candidates[0].content.parts[0].text });
        }
      } catch (err) {
        console.error("Gemini API error, falling back to mock:", err.message);
      }
    }

    // Delay to simulate AI thinking for fallback
    await new Promise(resolve => setTimeout(resolve, 800));

    // Smarter fallback keywords if API is unavailable
    const msgLower = message.toLowerCase();
    let reply = "Look here—my connection to the mainframe is acting up, so I'm flyin' blind today. But I'm still the boss here. If you need to do a count, just head over to the Digital Clipboard and pick whatever category you want. Now grab a tool and get back to work. What else do you need?";

    if (msgLower.includes("loading") || msgLower.includes("truck")) {
      reply = "Listen up! The loading sequence is strictly reverse order of use. Posts first, pickets last. Make sure you get 80-90% weight over the axles and strap every pallet with two straps. I swear, if that driver leaves before you check tire pressure, I'm sending you home!";
    } else if (msgLower.includes("staging") || msgLower.includes("color")) {
      reply = "Are you deaf? The Staging Color Code is non-negotiable: Orange for totes/hardware, Blue for concrete, Pink for gates and aluminum inserts, Green for job notes. Put that hardware in a tote with blue tape and the customer's name, or don't bother staging it at all. Got it?";
    } else if (msgLower.includes("ppe") || msgLower.includes("safety") || msgLower.includes("routing")) {
      reply = "Right, here's the deal. For the vinyl routing stations, you mandatorily need eye protection and ear protection at all times. Zero exceptions. Put 'em on or clock out and go home.";
    } else if (msgLower.includes("gate") || msgLower.includes("build")) {
      reply = "Alright, listen to me carefully. When you build a gate, you always start with checking your uprights and corners for square. If you're building a wood frame, use a Z-brace. If that gate is over 4 feet wide, you absolutely MUST use a truss rod or it's gonna sag and make us look like amateurs. Build it right the first time so we don't have to send a repair crew out there to fix your mess!";
    } else if (msgLower.includes("count") || msgLower.includes("inventory")) {
      reply = "Look, inventory counts ain't my main concern right now—but if you want to do one, head over to the Digital Clipboard. You can select any category from the list to count yourself. Just make sure you do it blind, count 'em right, and don't try to guess the numbers!";
    }

    res.json({ reply: reply });
  } catch (error) {
    console.error('Error with AI handling:', error.message);
    res.status(500).json({
      error: 'Failed to get response',
      reply: 'Listen kid, the PA system is down, check back later.'
    });
  }
});

// Navigation / app metadata
app.get('/api/nav', (req, res) => {
  res.json({
    appName: 'FencePro Shop Assistant',
    sections: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
      { id: 'assistant', label: 'AI Assistant', icon: 'message-circle' },
      { id: 'documents', label: 'Documents', icon: 'file-text' },
      { id: 'tools', label: 'Quick Tools', icon: 'wrench' }
    ]
  });
});

// Quick tools data
app.get('/api/tools', (req, res) => {
  res.json({
    tools: [
      {
        id: 'material-calc',
        name: 'Material Calculator',
        description: 'Calculate fence materials needed for a job',
        icon: 'calculator',
        category: 'calculations'
      },
      {
        id: 'checklist',
        name: 'Daily Checklist',
        description: 'Morning shop opening checklist',
        icon: 'check-square',
        category: 'operations'
      },
      {
        id: 'safety',
        name: 'Safety Quick Ref',
        description: 'Safety guidelines and emergency procedures',
        icon: 'shield',
        category: 'safety'
      },
      {
        id: 'inventory',
        name: 'Inventory Lookup',
        description: 'Check stock and material availability',
        icon: 'package',
        category: 'inventory'
      },
      {
        id: 'loading',
        name: 'Loading Guide',
        description: 'Proper loading procedures and sequences',
        icon: 'truck',
        category: 'operations'
      },
      {
        id: 'quality',
        name: 'QC Checklist',
        description: 'Quality control inspection checklist',
        icon: 'clipboard-check',
        category: 'quality'
      }
    ]
  });
});

// Documents Data
let documentCategories = [
  {
    name: 'Standard Operating Procedures',
    docs: [
      { id: 'sop-shop', name: 'Shop SOP Playbook', type: 'html', url: '/docs/shop_sop_playbook.html', status: 'current' },
      { id: 'sop-loading', name: 'Loading Procedures', type: 'html', url: '/docs/loading_procedures.html', status: 'current' },
      { id: 'sop-receiving', name: 'Material Receiving', type: 'html', url: '/docs/material_receiving.html', status: 'current' }
    ]
  },
  {
    name: 'Training & Onboarding',
    docs: [
      { id: 'onboarding', name: 'New Hire Onboarding Guide', type: 'html', url: '/docs/onboarding_guide.html', status: 'current' },
      { id: 'safety-training', name: 'Safety Training Manual', type: 'html', url: '/docs/safety_manual.html', status: 'current' }
    ]
  },
  {
    name: 'CMM Documents',
    docs: [
      { id: 'cmm-vinyl', name: 'Vinyl Fence CMM', type: 'html', url: '/docs/cmm_guide.html', status: 'current' },
      { id: 'cmm-aluminum', name: 'Aluminum Fence CMM', type: 'html', url: '/docs/cmm_guide.html', status: 'current' },
      { id: 'cmm-wood', name: 'Wood Fence CMM', type: 'html', url: '/docs/cmm_guide.html', status: 'current' }
    ]
  },
  {
    name: 'Reference',
    docs: [
      { id: 'wood-specs', name: 'Wood Fence Specifications', type: 'html', url: '/docs/wood_specs.html', status: 'current' },
      { id: 'vinyl-specs', name: 'Vinyl Fence Specifications', type: 'html', url: '/docs/vinyl_specs.html', status: 'current' },
      { id: 'aluminum-specs', name: 'Aluminum Fence Specifications', type: 'html', url: '/docs/aluminum_specs.html', status: 'current' },
      { id: 'chain-link-guide', name: 'Chain Link Fence Complete Guide', type: 'html', url: '/docs/chain_link_specs.html', status: 'current' },
      { id: 'chain-link-fittings-guide', name: 'Chain Link Fittings Size Guide', type: 'html', url: '/docs/chain_link_fittings.html', status: 'current' }
    ]
  }
];

// Documents list
app.get('/api/documents', (req, res) => {
  res.json({ categories: documentCategories });
});

// Upload document
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { name, category } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  const url = `/docs/${req.file.filename}`;
  const newDoc = {
    id: `doc-${Date.now()}`,
    name: name,
    type: path.extname(req.file.originalname).substring(1) || 'file',
    url: url,
    status: 'new'
  };

  const catIndex = documentCategories.findIndex(c => c.name === category);
  if (catIndex >= 0) {
    documentCategories[catIndex].docs.push(newDoc);
  } else {
    documentCategories.push({
      name: category,
      docs: [newDoc]
    });
  }

  res.json({ message: 'Document uploaded successfully', doc: newDoc, categories: documentCategories });
});

// ─── Inventory: Blind Count SOP ─────────────────────────────

// GET /api/inventory/count-sheet
// Returns the full SKU list but STRIPS all on-hand quantities.
// This enforces the "blind count" SOP — counters must not see
// existing stock numbers to prevent confirmation bias.
app.get('/api/inventory/count-sheet', (req, res) => {
  // Flat list (backward compat for tests)
  const blindSheet = inventory.map(({ sku, name, category }) => ({ sku, name, category }));

  // Grouped by category
  const grouped = {};
  for (const item of inventory) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ sku: item.sku, name: item.name });
  }
  const categories = Object.entries(grouped).map(([name, items]) => ({ name, items }));

  res.json({ items: blindSheet, categories });
});

// POST /api/inventory/reconcile
// Accepts { sku, actualCount, counterName }.
// Sets absolute stock to the counted value and returns the variance
// (actualCount – previousQuantity) so management can investigate.
app.post('/api/inventory/reconcile', (req, res) => {
  const { sku, actualCount, counterName } = req.body;

  if (!sku || actualCount == null || !counterName) {
    return res.status(400).json({ error: 'sku, actualCount, and counterName are required' });
  }

  const item = inventory.find(i => i.sku === sku);
  if (!item) {
    return res.status(404).json({ error: `SKU "${sku}" not found in inventory` });
  }

  const previousQuantity = item.quantity;
  const variance = actualCount - previousQuantity;

  // Set absolute stock to what was physically counted
  item.quantity = actualCount;
  item.lastVariance = variance; // Track the variance for the final report
  item.lastCounter = counterName;
  item.lastReconciledAt = new Date().toISOString();

  res.json({
    message: `Count reconciled for ${item.name} (${sku}) by ${counterName}`,
    sku: item.sku,
    name: item.name,
    previousQuantity,
    actualCount,
    variance,
    reconciledAt: new Date().toISOString(),
    reconciledBy: counterName
  });
});

// POST /api/inventory/add-item
// Allows adding a new SKU and category to the inventory list.
app.post('/api/inventory/add-item', (req, res) => {
  const { sku, name, category, quantity } = req.body;

  if (!sku || !name || !category) {
    return res.status(400).json({ error: 'sku, name, and category are required' });
  }

  const existing = inventory.find(i => i.sku === sku);
  if (existing) {
    return res.status(400).json({ error: `SKU "${sku}" already exists.` });
  }

  const newItem = {
    category,
    sku,
    name,
    quantity: parseInt(quantity, 10) || 0
  };

  inventory.push(newItem);
  // Re-sort inventory by category nicely
  inventory.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

  res.json({ message: 'Item added successfully', item: newItem });
});

// ─── Daily Count Assignment (Big Bob's Orders) ──────────────

// Simple seeded shuffle based on week number so it's consistent
// within a week but different each week
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function seededShuffle(arr, seed) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// GET /api/inventory/daily-assignment
// Returns today's category assignment and Big Bob's message.
// Categories are shuffled each week and spread across Mon-Fri.
app.get('/api/inventory/daily-assignment', (req, res) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ... 5=Fri, 6=Sat

  // Weekend — no count
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return res.json({
      assigned: false,
      message: "It's the weekend. Rest up — we hit the yard again Monday.",
      category: null,
      dayName: dayOfWeek === 0 ? 'Sunday' : 'Saturday'
    });
  }

  // Get all unique category names
  const catNames = [...new Set(inventory.map(i => i.category))];
  const weekNum = getWeekNumber(now);
  const shuffled = seededShuffle(catNames, weekNum);

  // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4
  const workDayIndex = dayOfWeek - 1;

  // Spread categories across 5 work days
  const dailyAssignments = [[], [], [], [], []];
  shuffled.forEach((cat, idx) => {
    dailyAssignments[idx % 5].push(cat);
  });

  const todaysCategories = dailyAssignments[workDayIndex];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Big Bob's daily message
  const bobMessages = [
    `Listen up — today's count day. I need you on **${todaysCategories.join('** and **')}**. Grab a clipboard and don't skip anything.`,
    `Right, here's the deal. Today we're hitting **${todaysCategories.join('** and **')}**. Count what you see, not what you think should be there.`,
    `Alright crew, ${dayNames[workDayIndex]} count: **${todaysCategories.join('**, **')}**. Let me know when you're done — no shortcuts.`,
    `Look here — we got **${todaysCategories.join('** and **')}** on the board today. Take your time and get it right the first time.`,
    `Let me tell ya what's on tap: **${todaysCategories.join('** and **')}**. Grab your PPE and get out there.`,
  ];

  res.json({
    assigned: true,
    dayName: dayNames[workDayIndex],
    category: todaysCategories[0], // primary category
    categories: todaysCategories,   // could be multiple
    weekNumber: weekNum,
    message: bobMessages[workDayIndex],
    // Full week schedule for reference
    weekSchedule: dayNames.map((day, idx) => ({
      day,
      categories: dailyAssignments[idx]
    }))
  });
});

// ─── Not Counted Tracking ───────────────────────────────────

// In-memory store for items that were not counted
let notCountedItems = [];

// ─── Email Report Helper ────────────────────────────────────

// Configure via .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//   COUNT_REPORT_EMAIL_1, COUNT_REPORT_EMAIL_2
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const REPORT_EMAILS = [
  process.env.COUNT_REPORT_EMAIL_1 || '',
  process.env.COUNT_REPORT_EMAIL_2 || '',
  process.env.COUNT_REPORT_EMAIL_3 || '',
  process.env.COUNT_REPORT_EMAIL_4 || '',
].filter(Boolean);

async function sendCountReport({ category, counterName, countedItems, skippedItems }) {
  if (REPORT_EMAILS.length === 0 || !process.env.SMTP_USER) {
    console.log('[Count Report] Email not configured — skipping send. Set SMTP_* and COUNT_REPORT_EMAIL_* in .env');
    return { sent: false, reason: 'Email not configured' };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Build HTML report
  const countedRows = countedItems.map(i => {
    const expectedCount = Math.max(0, i.actualCount - i.variance);
    const isBulk = ['Shop Consumables', 'Chain Link - Misc/Tools', 'Vinyl Caps', 'Vinyl Hardware', 'Aluminum Hardware'].includes(category) || expectedCount > 100;
    const greenPct = isBulk ? 0.02 : 0.05;
    const orangePct = isBulk ? 0.05 : 0.10;

    const minGreen = -Math.ceil(expectedCount * greenPct);
    const maxGreen = Math.ceil(expectedCount * greenPct);
    const maxOrange = Math.ceil(expectedCount * orangePct);

    let color = '#059669'; // Green (GOOD)
    let label = 'GOOD';

    if (i.variance !== 0) {
      if (i.variance >= minGreen && i.variance <= maxGreen) {
        color = '#059669'; // Green
        label = `${i.variance > 0 ? '+' : ''}${i.variance}`;
      } else if (i.variance > maxGreen && i.variance <= maxOrange) {
        color = '#c2410c'; // Orange (within tolerance)
        label = `+${i.variance}`;
      } else {
        color = '#dc2626'; // Red (excessive variance)
        label = `${i.variance > 0 ? '+' : ''}${i.variance}`;
      }
    }

    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace">${i.sku}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${i.actualCount}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;color:${color};font-weight:700">${label}</td>
    </tr>`;
  }).join('');

  const skippedRows = skippedItems.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace">${i.sku}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#d97706;font-weight:700">NOT COUNTED</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
      <div style="background:#111827;color:white;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px;text-transform:uppercase;letter-spacing:1px">🔒 Blind Count Report</h1>
        <p style="margin:6px 0 0;color:#9ca3af;font-size:14px">${category} — ${dateStr} at ${timeStr}</p>
        <p style="margin:4px 0 0;color:#fbbf24;font-size:13px;font-weight:700">Counter: ${counterName}</p>
      </div>

      <div style="border:2px solid #e5e7eb;padding:0">
        <div style="background:#065f46;color:white;padding:12px 24px">
          <strong>✓ COUNTED — ${countedItems.length} items</strong>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left;font-size:12px;text-transform:uppercase">Item</th>
            <th style="padding:8px;text-align:left;font-size:12px;text-transform:uppercase">SKU</th>
            <th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase">Count</th>
            <th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase">Variance</th>
          </tr></thead>
          <tbody>${countedRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af">No items counted</td></tr>'}</tbody>
        </table>

        ${skippedItems.length > 0 ? `
          <div style="background:#d97706;color:white;padding:12px 24px">
            <strong>⊘ NOT COUNTED — ${skippedItems.length} items</strong>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tbody>${skippedRows}</tbody>
          </table>
        ` : ''}
      </div>

      <div style="background:#f3f4f6;border:2px solid #e5e7eb;border-top:0;padding:16px 24px;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:13px;color:#6b7280">📋 This report was auto-generated by FencePro Shop. Review variances and follow up as needed.</p>
      </div>
    </div>
  `;

  try {
    await smtpTransport.sendMail({
      from: `"FencePro Shop" <${process.env.SMTP_USER}>`,
      to: REPORT_EMAILS.join(', '),
      subject: `Blind Count Report: ${category} — ${dateStr}`,
      html,
    });
    console.log(`[Count Report] Sent report for ${category} to: ${REPORT_EMAILS.join(', ')}`);
    return { sent: true, recipients: REPORT_EMAILS };
  } catch (err) {
    console.error('[Count Report] Email failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

// POST /api/inventory/finish-day
// Called when the crew finishes counting for the day.
// Any items NOT submitted get logged as "not counted".
// If sendReport is true, emails the variance report.
app.post('/api/inventory/finish-day', async (req, res) => {
  const { countedSkus, category, counterName, sendReport } = req.body;

  if (!category || !counterName) {
    return res.status(400).json({ error: 'category and counterName are required' });
  }

  const categoryItems = inventory.filter(i => i.category === category);
  const countedSet = new Set(countedSkus || []);

  // Build variance data for counted items
  const countedItems = categoryItems
    .filter(i => countedSet.has(i.sku))
    .map(i => ({
      sku: i.sku,
      name: i.name,
      actualCount: i.quantity,
      variance: i.lastVariance || 0, // Retrieve the calculated variance
    }));

  // Skipped items
  const skipped = categoryItems
    .filter(i => !countedSet.has(i.sku))
    .map(i => ({
      sku: i.sku,
      name: i.name,
      category: i.category,
      skippedAt: new Date().toISOString(),
      skippedBy: counterName
    }));

  // Add to not-counted list (replace any previous entries for same SKUs)
  const skippedSkuSet = new Set(skipped.map(i => i.sku));
  notCountedItems = notCountedItems.filter(i => !skippedSkuSet.has(i.sku));
  notCountedItems.push(...skipped);

  // Send email report if requested
  let emailResult = { sent: false };
  if (sendReport) {
    emailResult = await sendCountReport({
      category,
      counterName,
      countedItems,
      skippedItems: skipped,
    });
  }

  res.json({
    message: `Day finished for ${category} by ${counterName}`,
    counted: countedSet.size,
    skipped: skipped.length,
    total: categoryItems.length,
    skippedItems: skipped,
    countedItems,
    emailReport: emailResult,
  });
});

// GET /api/inventory/not-counted
// Returns all items that have been flagged as not counted.
app.get('/api/inventory/not-counted', (req, res) => {
  res.json({ items: notCountedItems });
});

// GET /api/status - Used by the frontend to check system readiness
app.get('/api/status', (req, res) => {
  res.json({ aiConfigured: !!process.env.GEMINI_API_KEY });
});

// Catch-all: serve index.html for client-side routing (Express 5 syntax)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`\n🏗️  FencePro Shop Assistant running at http://localhost:${port}\n`);
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  Warning: GEMINI_API_KEY not set. AI chat will not work.');
    console.log('   Create a .env file with: GEMINI_API_KEY=your_key_here\n');
  }
});

module.exports = app;
