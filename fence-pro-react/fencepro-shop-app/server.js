// server.js
require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'public', 'docs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const inventoryFile = path.join(__dirname, 'inventory.json');
function saveInventory(data) {
  try {
    fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving inventory:', err.message);
  }
}

function loadInventory() {
  try {
    if (fs.existsSync(inventoryFile)) {
      return JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading inventory:', err.message);
  }
  return null;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
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
- Always give direct, unformatted answers. DO NOT USE ANY MARKDOWN SYMBOLS (no asterisks, no hashes, no italics, no bold syntax, no backticks). The voice synthesizer reads them out loud and ruins the persona!
- Speak like a gruff, slightly annoyed shop foreman who values hard work over everything. Use plain text formatting only.
- If there are steps, use simple dashes or numbered lists without special markdown.
- If they ask "What should I be doing?", use the current time to suggest the appropriate task from the Daily Rhythm. 
- If they are missing material, tell them to "Notify the GM immediately."
- Start EVERY single response with a brief, in-character greeting perfectly suited for a rugged shop boss. (e.g. "Look here," or "Listen up kid,")

KNOWLEDGE BASE (TECHNICAL SPECS):
1. ALUMINUM STANDARDS:
   - Material: 6000 Series Aluminum alloy, powder-coated.
   - Thickness: Residential 0.060"-0.125", Commercial 0.125"+.
   - Styles: Flat Top, Spear Top, Alternating Spear.
   - Colors: Black, Bronze, White.
2. WOOD STANDARDS:
   - Styles: Privacy (Stockade/Board-on-Board), Shadowbox (double-sided), Picket (4ft), Split Rail.
   - Species: PT Pine (rot-resistant, cost-effective), Western Red Cedar (naturally resistant, smells good), Redwood (premium durability), Cypress (best for water/humidity).
3. VINYL STANDARDS:
   - Material: PVC with SolarShield UV protection.
   - Thickness: Posts 0.135"-0.150", Rails 0.080"-0.120".
   - Styles: Privacy (T&G), Semi-Privacy, Picket, Post-and-Rail.
4. CHAIN LINK STANDARDS:
   - Posts OD: 1-5/8" to 2" (Residential Line), 1-7/8" to 2-3/8" (Terminal), 3"+ (Commercial).
   - Rails: 1-3/8" or 1-5/8" (21ft lengths).
   - Weights: .065 (Residential), SS20 (Commercial grade), SS40 (Heavy Industrial).
   - Mesh: 11.5ga (Res) to 6ga (Comm). Standard 2" square.

SOP & PROCEDURES:
- Receiving: 9am-12pm. Inspect BEFORE driver leaves. Take photos. Sign PO only if matching BOL.
- Staging goal: 100% done by 2pm the day before. 
- Loading goal: Trailers strapped by 6:30am. 
- Loading weight: 80-90% over axles. Minimum 2 straps per pallet.
- PPE: Mandatory eye/ear protection for all CNC and routing operations. No exceptions.

You have access to the full "Shop SOP Playbook". If someone asks about a procedure, give it to 'em straight.`;

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Inventory Data (Master List Ã¢â‚¬â€ updated from shop spreadsheet) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
let inventory = loadInventory() || [

  // Ã¢â€â‚¬Ã¢â€â‚¬ Aluminum Hardware Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Aluminum Hardware', sku: '73022006',    name: 'BRACKET-WALL RES/GDN BK - Aluminum Step Joint',           quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73022594',    name: 'BRACKET-BALL SWVL RES BK - Aluminum Swivel Joint',        quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73045677',    name: '2" SURFACE MOUNT BLACK - Aluminum Flange',               quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73050575',    name: '19.5x35 Res Puppy Picket Addon Kit Black',                quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'AD1005-B',    name: 'DFB "Best Grip" Gate Handle (Black)',                     quantity: 3 },
  { category: 'Aluminum Hardware', sku: 'AD1006B',     name: 'SS Self Closing Aluminum Hinge',                         quantity: 3 },
  { category: 'Aluminum Hardware', sku: 'AD2011SSB',   name: "Aluminum Drop DROP RODS BLACK 24'",                      quantity: 3 },
  { category: 'Aluminum Hardware', sku: 'KLTRV-200',   name: 'Aluminum Traverse Latch 2" Post, Key Lockable, Black',   quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'SGSS-B',      name: 'Aluminum SMALL GATE STOPPER (BLK)',                      quantity: 4 },
  { category: 'Aluminum Hardware', sku: 'SHG-90LB',    name: 'Black Self Closing Alum Hinges',                         quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'VIPERX1-B',   name: 'Aluminum BLACK LOCKABLE ONE-SIDED LATCH',                quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDF225BL',    name: 'Dig Defence: Small/Med Black Powder Coated',             quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDFGP4',      name: 'Dig Defence: Gate Plate: 32" wide',                      quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDXL15',      name: 'Dig Defence XL. 24"x15"',                                quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Chain Link - Black Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Chain Link - Black', sku: '5955',               name: '48x5/8 Steel Black Tension Bar',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '5957',               name: '60x5/8 Steel Black Tension Bar',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '5958',               name: '70x5/8 Steel Black Tension Bar - 609342',                 quantity: 0 },
  { category: 'Chain Link - Black', sku: '5965',               name: '94x5/8 Steel Black Tension Bar',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Collar Blk',  name: '1-3/8 8g x 1-1/4 black Collar',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Rail End Blk',name: '1-3/8 Black Aluminum Rail End',                           quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Drop Fork Blk',name:'1-3/8 black drop fork',                                   quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Fem Hinge Blk',name:'1-3/8 black female hinge',                               quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Gate Cap Blk',name: 'Chain Link Gate dome Cap Black',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '0890B',              name: '4 Dome Cap - Steel Black',                                quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Corner Blk',  name: '1-3/8 Pipe Corner - Black',                              quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8x21 Blk Tube', name: '1-3/8x21x.065 Black Tubing Top Rail - 660012',           quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8 Dome Cap Blk',name: '1-5/8 Black Aluminum Dome Cap',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8 Male Hinge Blk',name:'1-5/8 Black steel male hinge',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x24 SS40 Blk', name: '1-5/8x24xSS40 Black Pipe / 695022',                      quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x7 Line Blk',  name: '1-5/8x7x065 Black Tubing Line Post - 650452',            quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x8 Line Blk',  name: '1-5/8x8x.065 Black Tubing Line Post',                    quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x8 SS40 Blk',  name: '1-5/8x8xSS40 Black Pipe',                                quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x9 Line Blk',  name: '1-5/8x9x.065 Black Tubing Line Post',                    quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-7/8 Tension Blk', name: '1-7/8" Black Tension Band',                              quantity: 0 },
  { category: 'Chain Link - Black', sku: '2 Dome Cap Blk',     name: '2 Black Aluminum Dome Cap',                              quantity: 0 },
  { category: 'Chain Link - Black', sku: '204542',             name: "6' Top Lock Slat 2\" Mesh Blk",                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2 Drop Fork Blk',name:'2-1/2 Black Drop Fork',                                  quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2 Male Hinge Blk',name:'2-1/2 black steel male hinge',                          quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x24 SS40 Blk', name: '2-1/2x24xSS40 Black Pipe / 695212',                      quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x7 Term Blk',  name: '2-1/2x7x.065 Black Tubing Terminal Post',                quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x8 Term Blk',  name: '2-1/2x8x.065 Black Tubing Terminal Post',                quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x9 Term Blk',  name: '2-1/2x9x.065 Black Tubing Terminal Post',                quantity: 0 },
  { category: 'Chain Link - Black', sku: '212158BTC',          name: '2-1/2 to 1-5/8 Mid Rail T-Clamp - Black',                quantity: 0 },
  { category: 'Chain Link - Black', sku: '48x50x9g Blk Fab',  name: '48x50x9g Black (2" Mesh) KK Chain Link Fabric',          quantity: 0 },
  { category: 'Chain Link - Black', sku: '4Wx4H Gate Blk',    name: '4Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK',            quantity: 0 },
  { category: 'Chain Link - Black', sku: '4Wx5H Gate Blk',    name: '4Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK',            quantity: 0 },
  { category: 'Chain Link - Black', sku: '4Wx6H Gate Blk',    name: '4Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK',            quantity: 0 },
  { category: 'Chain Link - Black', sku: '4x24xSS40 Blk Pipe',name: '4x24xSS40 Black Pipe',                                   quantity: 0 },
  { category: 'Chain Link - Black', sku: '5/8x24 Drop Rod Blk',name:'Chain-link Drop Rod 5/8x24 Resi - Black',                 quantity: 0 },
  { category: 'Chain Link - Black', sku: '5051',              name: '1-5/8x1-3/8 Black Aluminum Loop Cap',                     quantity: 0 },
  { category: 'Chain Link - Black', sku: '5058',              name: '2-1/2 Black Aluminum Dome Cap',                           quantity: 0 },
  { category: 'Chain Link - Black', sku: '5258',              name: '1-5/8 to 1-3/8 Mid Rail T-Clamp - Black',                 quantity: 0 },
  { category: 'Chain Link - Black', sku: '5358-black',        name: 'Rail Sleeve Black 1-5/8in',                               quantity: 0 },
  { category: 'Chain Link - Black', sku: '5814',              name: '2-1/2x1-5/8 Black Loop Cap',                              quantity: 0 },
  { category: 'Chain Link - Black', sku: '5822',              name: 'BLK 1-5/8 Rail End Combo Half Room',                      quantity: 0 },
  { category: 'Chain Link - Black', sku: '5904',              name: '2-1/2 Black Tension Band',                                quantity: 0 },
  { category: 'Chain Link - Black', sku: '5924',              name: '2-1/2 Black Brace Band',                                  quantity: 0 },
  { category: 'Chain Link - Black', sku: '5Wx4H Gate Blk',   name: '5Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '5Wx5H Gate Blk',   name: '5Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '5Wx6H Gate Blk',   name: '5Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '60x50x9g Blk Fab', name: '60x50x9g Black (2" Mesh) KK Chain Link Fabric',           quantity: 0 },
  { category: 'Chain Link - Black', sku: '6Wx4H Gate Blk',   name: '6Wx4Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '6Wx5H Gate Blk',   name: '6Wx5Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '6Wx6H Gate Blk',   name: '6Wx6Hx1-3/8x.055 CL Single Swing Gate BLACK',             quantity: 0 },
  { category: 'Chain Link - Black', sku: '72x50x9g Blk Fab', name: '72x50x9g Black (2" Mesh) KK Chain Link Fabric',           quantity: 0 },
  { category: 'Chain Link - Black', sku: '96x50x9g Blk Fab', name: '96x50x9g Black (2" Mesh) KK Chain Link Fabric',           quantity: 0 },
  { category: 'Chain Link - Black', sku: 'BSAL-212',          name: 'BLACK - Strong Arm Latch 2-1/2"x1-5/8-2 Frame',           quantity: 0 },
  { category: 'Chain Link - Black', sku: 'DE8196',            name: 'Ground Sleeve Black 1-5/8in',                             quantity: 0 },
  { category: 'Chain Link - Black', sku: 'Tension Wire Blk',  name: "Tension Wire 13C/9F black smooth (1000')",                quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Chain Link - Galvanized Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Chain Link - Galvanized', sku: '258',               name: '1-5/8 to 1-3/8 Mid Rail T-Clamp - GALVI',            quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '555',               name: 'GALVI Box Hinge 4"x1-5/8x2 Frame',                   quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '0555-2-1/2',        name: 'GALVI Box Hinge 2-1/2"x1-5/8x2 Frame',               quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '764',               name: 'GALVI Strong Arm Latch 4"x1-5/8-1-7/8"',             quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '766',               name: 'GALVI Strong Arm Latch -1-5/8-2 Post',               quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '810',               name: '1-5/8x1-5/8 Galvi Loop Cap',                         quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '811',               name: '1-5/8x1-3/8 Galvi Loop Cap',                         quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '814',               name: '2-1/2x1-5/8 Loop Cap - Galvi PS',                    quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '822',               name: '1-5/8 Rail End Half Moon Galvi PS',                  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '844',               name: '2-1/2 Dome Cap - Galvi PS',                          quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '890',               name: '4 Dome Cap - Galvi PS',                              quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '902',               name: '1-5/8 Tension Band',                                 quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '904',               name: '2-1/2 Tension Band',                                 quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '924',               name: '2-1/2 Brace Band',                                   quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '907',               name: '4 Tension Band',                                     quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '955',               name: '48x5/8 Steel Tension Bar',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '957',               name: '60x5/8 Steel Tension Bar',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '958',               name: '70x5/8 Steel Tension Bar',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '965',               name: '94x5/8 Galvi Tension Bar',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Collar Galv',   name: '1-3/8 8g x 1-1/4 GALVI Collar',                  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Gate Cap Galv', name: '1-3/8 Chain Link Gate Cap Galvi',                 quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Drop Fork Galv',name: '1-3/8 galvi drop fork',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Fem Hinge Galv',name: '1-3/8 galvi female hinge',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8x21 Galv Tube', name: '1-3/8x21x.065 Galvi Tubing Top Rail',             quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-5/8 Dome Cap Galv',name: '1-5/8 Galvi Dome Cap',                             quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-5/8 Drop Fork',    name: '1-5/8 Drop Fork',                                  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-5/8x21 SS40 Galv', name: '1-5/8x21xSS40 Galvi Pipe',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-5/8x24 SS40 Galv', name: '1-5/8x24xSS40 Galvi Pipe / 033007',               quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '158158tclamp',        name: '1-5/8 to 1-5/8 Mid Rail T-Clamp - Galvi',         quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '158BB',               name: '1-5/8 Brace Band',                                quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '2-1/2 Drop Fork Galv',name: '2-1/2 Galvi Drop Fork',                           quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '2-1/2 Male Hinge Galv',name:'2-1/2 galvi steel male hinge',                    quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '2-1/2x24 SS40 Galv', name: '2-1/2x24xSS40 Galvi Pipe',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '2-1/2x8 SS40 Galv',  name: '2-1/2x8xSS40 Galvi Pipe',                         quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '2801',                name: '1-3/8 Galvi Offset Rail End Cup PS',              quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '4 Brace Band',        name: '4 Brace Band',                                    quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '48x50x9g Galv Fab',  name: '48x50x9g Galvi (2" Mesh) KK Chain Link Fabric',   quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '4Wx4H Gate Galv',    name: '4Wx4Hx1-3/8x.055 CL Single Swing Gate Galvi',     quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '4Wx6H Gate Galv',    name: '4Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '4Wx8H Gate Galv',    name: '4Wx8Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '4x24 SS40 Galv',     name: '4x24xSS40 Galvi Pipe',                            quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '5358',               name: 'Rail Sleeve Galvi 1-5/8in',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '5Wx6H Gate Galv',    name: '5Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '6Wx6H Gate Galv',    name: '6Wx6Hx1-5/8xSS40 Comm CL Single Swing Gate Galvi',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '72x50x9g Galv Fab',  name: '72x50x9g Galvi (2" Mesh) KT Chain Link Fabric',   quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '96x50x9g Galv Fab',  name: '96x50x9g Galvanized (2" Mesh) KT Chain Link Fabric',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'BA2515',             name: '2 1/2" x 1 5/8" Line Post 3-Strand 45 Degree Barb Arm',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'CBA25',              name: '2 1/2" Corner Post 3-Strand 45 Degree Barb Arm',  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'BW3',                name: "1320' 4-Point Barb Wire Roll w/ 5\" Coil Spacing", quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'DFC15',              name: '1-5/8 Galvi Drop Fork Collar',                    quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'DROPROD-24',         name: 'Commercial Chain Link 24" Drop Rod Kit - Galvi',  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'FMH15',              name: '1-5/8 galvi female hinge',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'GALVI Sleeve 1-3/8', name: 'GALVI Ply Sleeve 1-3/8in',                        quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'Galvi Truss Rod',    name: 'Galvi Truss Rod + Tightener',                     quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'Industrial 180D Hinge',name:'Industrial 180D Offset Gate Hinge 4"x1-5/8x2 Galvi',quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'L40',                name: '36" Steel Drop Rod HDG - Cane Bolt for Galvi',    quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'SAL-212',            name: 'GALVI - Strong Arm Latch 2-1/2"x1-5/8-2 Frame',  quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'Tension Wire Galv',  name: "Tension Wire 9ga straight (1000')",               quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Chain Link - Misc/Tools Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Chain Link - Misc/Tools', sku: '2',                    name: '5/16x1-1/4 carriage bolt w/nut',                quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5',                    name: '5/16x2-1/2 galvi w/nut carriage bolt',          quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '34',                   name: '6-1/2 9g Aluminum Tie Wire - 1-3/8 - 2 posts', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '37',                   name: 'Hog Rings 2lb 9a Alum (500 qty)',               quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5002',                 name: '5/16x1-1/4 black w/nut carriage bolt - 622012', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5034',                 name: '6-1/2 9g Black Aluminum Tie Wire - 1-3/8 - 2" posts',quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5037',                 name: 'Hog Rings 9g Alum 2lb bag BLACK (500 rings)',   quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '3/8x2 Carriage Blk',  name: '3/8x2 black w/nut carriage bolt',               quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '3/8x2 Carriage',      name: '3/8x2 carriage bolt w/nut',                     quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '3/8x3 Carriage Blk',  name: '3/8x3 black w/nut carriage bolt',               quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '3/8x3 Carriage',      name: '3/8x3 carriage bolt w/nut',                     quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5/16x2-1/2 Carriage Blk',name:'5/16x2-1/2 black w/nut carriage bolt',        quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '1-3/8 End Rail Clamp',name: '1-3/8 to 1-3/8 End Rail Clamp',                quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '1-3/8 x 2-3/8 Auto Latch',name:'1-3/8 x 2-3/8 Auto Latch - For CL WGs',     quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '2-3/8 x 1-3/8 Staklos',name:'2-3/8 x 1-3/8 Staklos Gate Closer',            quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '8x5 Deer Gate',       name: '8x5 WG Leaf for 8\'H Deer Fence (93"Hx56\'W)', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '8x6 Deer Gate',       name: '8x6 WG Leaf for 8\'H Deer Fence (93"Hx68\'W)', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ATIE25',              name: '8-1/4 9g Aluminum Tie Wire - 2-1/2 posts',      quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ATIE25B',             name: '8-1/4 9g Black Aluminum Tie Wire - 2-1/2" posts',quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2820-0333',         name: "Monofilament Wire 8ga black smooth (330')",      quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2840-1',            name: 'Large Gripple For Monofilament 7.5-10 Gauge',   quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2842-100',          name: 'Medium Gripple: Wire 10-14 Gauge',               quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2845',              name: 'Gripple T-Clip',                                 quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2872',              name: "9/16'' Hog Rings Class I Galvanized (5,000) pk", quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2876',              name: "11/16'' Black Hog Rings - 2500 pk (deer fence)", quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'DE2878-30',           name: 'Ground Stakes 12in Kinked',                     quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'EZTT138X9-BLACK',     name: 'BLK VNL EZ TWIST TIE 1-3/8',                   quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'EZTT158X9',           name: 'EZ TWIST TIE 1-5/8',                            quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'EZTT158X9-BLACK',     name: 'BLK VNL EZ TWIST TIE 1-5/8',                   quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'EZTT212X9',           name: 'EZ TWIST TIE 2-1/2',                            quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'EZTT212X9-BLACK',     name: 'BLK VNL EZ TWIST TIE 2-1/2',                   quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'HillMaster Anti-Sag', name: 'HillMaster Anti-Sag Gate Kits Black',           quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ML3RPK',              name: 'Magnalatch Round Post Adapter Kit',             quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ML3TPKA',             name: 'Magnalatch, Top Pull, Black',                   quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Shop Consumables Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Shop Consumables', sku: '474374',          name: "5\"x1000' 90ga banding film with handle",              quantity: 0 },
  { category: 'Shop Consumables', sku: '131180',          name: "3/4\" x 2150' - 1350lb composite strap",               quantity: 0 },
  { category: 'Shop Consumables', sku: '131630',          name: '3/4" strapping buckle - 1,000',                        quantity: 0 },
  { category: 'Shop Consumables', sku: 'Strap Guards',    name: 'Strap Guards: 2-1/2x1-3/4',                            quantity: 0 },
  { category: 'Shop Consumables', sku: '468439',          name: '1-3/4" x .092 Hot Galv Ring 15dg Nails',               quantity: 11600 },
  { category: 'Shop Consumables', sku: '367275',          name: '3" x .120 Hot Galv Screw 21dg Nails',                  quantity: 15500 },
  { category: 'Shop Consumables', sku: '320590',          name: 'R4 #9 x 3-1/8" Screws 1900CT',                         quantity: 3500 },
  { category: 'Shop Consumables', sku: '319359',          name: 'R4 #9 x 2" Screws 3700CT',                             quantity: 200 },
  { category: 'Shop Consumables', sku: 'Metabo Staples',  name: 'Metabo 1/4" x 3/4" staples 1000ct',                   quantity: 22 },
  { category: 'Shop Consumables', sku: '15dg Scrails',    name: '1 3/4" x .113 15deg scrails',                          quantity: 2600 },
  { category: 'Shop Consumables', sku: 'Structural Screw',name: '5/6x6 Structural Wood Screw',                          quantity: 500 },
  { category: 'Shop Consumables', sku: 'Freeman Staple',  name: 'Freeman 10.5 gauge fence staple',                      quantity: 4200 },
  { category: 'Shop Consumables', sku: 'Wood Glue',       name: 'Wood Glue for caps',                                   quantity: 0 },
  { category: 'Shop Consumables', sku: '3" Drive Pins',   name: '3" drive pins (no dig fence)',                         quantity: 900 },
  { category: 'Shop Consumables', sku: 'Hinged Screws',   name: 'Plastic Hinged Screws',                                quantity: 450 },
  { category: 'Shop Consumables', sku: 'Zip Ties',        name: 'Small zip ties',                                       quantity: 190 },
  { category: 'Shop Consumables', sku: 'Black Rivets',    name: 'Black 3/16" Pop Rivets Aluminum Large Head Exploding', quantity: 0 },
  { category: 'Shop Consumables', sku: 'White Rivets',    name: 'White 3/16" Pop Rivets Aluminum Large Head',           quantity: 400 },
  { category: 'Shop Consumables', sku: '1" Drive Pins',   name: '1" drive pins with washer',                            quantity: 1000 },
  { category: 'Shop Consumables', sku: '526020',          name: '#8 x 3/4" Square Drive Screw - Tek Screws',            quantity: 22500 },
  { category: 'Shop Consumables', sku: 'Zinc Self Tapper',name: '#14 - 3" zinc self tapper',                            quantity: 300 },
  { category: 'Shop Consumables', sku: '6" #15 Screws',   name: '6" #15 screws (Vinyl gates)',                          quantity: 1300 },
  { category: 'Shop Consumables', sku: 'Black Oxide Tapper',name:'#14 - 1-1/2 black oxide self tapper',                 quantity: 233 },
  { category: 'Shop Consumables', sku: 'Silicone',        name: 'Silicone (12 of 2.8oz)',                               quantity: 33 },
  { category: 'Shop Consumables', sku: 'PVC Cement',      name: 'PVC Cement 32 oz',                                     quantity: 52 },
  { category: 'Shop Consumables', sku: 'Black Hex Head',  name: '#10 - 1" hex head self tapping screws black head',     quantity: 600 },
  { category: 'Shop Consumables', sku: 'Trash Bags',      name: 'Trash Bags',                                           quantity: 500 },
  { category: 'Shop Consumables', sku: 'Zip Bags',        name: 'GPI - 9" x 12" Ultra Heavy-Duty Zip Bags',             quantity: 8 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Vinyl Caps Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Vinyl Caps', sku: '1641',       name: '5x5 Square Cap May Downward Solar Light',         quantity: 0 },
  { category: 'Vinyl Caps', sku: '1859',       name: '5x5 Square Cap May Halo Solar Light',             quantity: 0 },
  { category: 'Vinyl Caps', sku: '61104673',   name: '2.75"X4.70"X.935" POST GATE CAP CYPRESS',         quantity: 0 },
  { category: 'Vinyl Caps', sku: '73003093',   name: '5x5 PYRAMID WHITE POST TOP',                      quantity: 0 },
  { category: 'Vinyl Caps', sku: '73003919',   name: '7/8x3 DOGEAR CAP WHITE',                          quantity: 0 },
  { category: 'Vinyl Caps', sku: '73013829',   name: '5"X5" PYRAMID POST TOP CYPRESS',                  quantity: 0 },
  { category: 'Vinyl Caps', sku: '73045003',   name: '5x5 NEW ENGLAND WHITE POST TOP',                  quantity: 0 },
  { category: 'Vinyl Caps', sku: '73045768',   name: '2.75x4.70x.935 VFG UR CAP WHITE',                 quantity: 0 },
  { category: 'Vinyl Caps', sku: '73053067',   name: '5x5 Pyramid Post Top Dark Walnut',                quantity: 0 },
  { category: 'Vinyl Caps', sku: 'C55PYRA-T',  name: '5x5 PYRAMID TAN POST TOP',                        quantity: 0 },
  { category: 'Vinyl Caps', sku: 'P1515SH-W',  name: '1-1/2x1-1/2 SHARP WHITE PICKET TOP',             quantity: 0 },
  { category: 'Vinyl Caps', sku: 'P7815SH-W',  name: '7/8x1 1/2 SHARP WHITE PICKET TOP',               quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Vinyl Hardware Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Vinyl Hardware', sku: '1" Concrete Drive Pin', name: '1" Concrete Drive Pin With Washer',                   quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1001B',   name: 'STAINLESS STEEL BLACK SELF CLOSING GATE HINGE PAIR',             quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1002B',   name: 'STAINLESS STEEL BLACK TWO WAY LATCH',                            quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1003B',   name: 'Vinyl Drop Rod - BLACK SS DROP RODS 24"',                        quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1004B',   name: 'BLACK SS TWO WAY LATCH SMALL',                                   quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1009B',   name: 'GATE BRACE BLACK',                                               quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1KRIVET', name: '3/16 white rivet',                                               quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD3010B',   name: 'Gate Stop with Handle (BLK)',                                    quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'APSB5',     name: '5" STRAIGHT N LEVEL COLLAR - BLACK',                            quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'Full XWing',name: 'Full X-Wing for 2-3/8" Round',                                  quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'Half XWing',name: 'Half X-Wing for 2-3/8" Round',                                  quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'PLC',       name: '5" King Nut Post Leveling Collar Donut',                        quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'PM178ZBASE',name: 'Vinyl Flange Mount w/ 3/8 anchors for 2" pipe',                 quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'SKDONUTS',  name: '5" Vinyl Donut for 2-1/2 PIPE',                                 quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'uni5',      name: 'Uni-5: 2-1/2 SS40 for 5x5 Vinyl Posts',                         quantity: 0 },
  { category: 'Vinyl Hardware', sku: '73044477',  name: '1.75x7 Internal Gate Pocket VFCOM',                             quantity: 0 },
  { category: 'Vinyl Hardware', sku: '73044478',  name: '2x3.5 & 2x6 Internal Gate Pocket VFCOM',                        quantity: 0 },
  { category: 'Vinyl Hardware', sku: '65-63-003', name: 'P Stiffener - FOR 1-3/4" X 3-1/2" RAIL -- 72"Long',            quantity: 0 },
  { category: 'Vinyl Hardware', sku: '65-63-072', name: 'L Stiffener - FOR 2" X 3-1/2" RAIL - Cut to 96"',              quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD6002',    name: '5x5x108 ALUMINUM POST INSERT',                                   quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'G3REM147-18-94',name:'1-1/2" X 94" STEEL insert 18 GAUGE RAIL INSERT',             quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'G3RFP225-18-62',name:'1.00" X .715" Steel Picket Insert 18 Gauge 62"',            quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'VIGK',      name: 'Vinyl Insta-gate kits - 6H Hamilton',                           quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'WIGK',      name: 'Wood Insta-gate kits - King+ 4WG',                              quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'LPRECUTW',  name: '11.75x95 Pre-Cut Classic Lattice PALLET - White',               quantity: 0 },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Vinyl Linears Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  { category: 'Vinyl Linears', sku: '1-1/2x1-1/2x47 WHITE', name: '1-1/2x1-1/2x47 WHITE PICKET PROFILE',                quantity: 0 },
  { category: 'Vinyl Linears', sku: '73050843',  name: '7/8X11.3X62.25 .045 SG T&G Dark Walnut WG',                     quantity: 0 },
  { category: 'Vinyl Linears', sku: '73050962',  name: 'BRT - T&G Picket, Gray, 0.875" x 6", 59.25"',                   quantity: 0 },
  { category: 'Vinyl Linears', sku: '73050963-48',name:'0.875x6x37.25 (.040) SAND T&G Picket',                           quantity: 0 },
  { category: 'Vinyl Linears', sku: '73050964',  name: '.875x6x62.25 (.040) WHITE T&G PICKET',                           quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052867',  name: '.875x3x47.75 PKT (.070) White',                                  quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052960',  name: '1-1/2x1-1/2x192 WHITE PICKET PROFILE',                          quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052998',  name: '.875X1.25X59 EXTR U-CHANNEL Dark Walnut',                        quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053000',  name: '0.875x1.25x59 U-Channel SAND',                                   quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053001',  name: '.875x1.25x59 EXTRA U-CHANNEL WH',                                quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053001 (48)',name:'.875x1.25x34.25" EXTRA U-CHANNEL White',                       quantity: 0 },
  { category: 'Vinyl Linears', sku: '73055284',  name: '.875X6X59.5 .040 T&G WH',                                        quantity: 0 },
  { category: 'Vinyl Linears', sku: '73055292',  name: '.875X1.25X56 EXTR U-CHANNEL WH',                                 quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F54C-I-64', name: '7/8" X 6" Homewood T&G Chai Gray 64"',                          quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F54G-T-64', name: '7/8"x6"x64" (.050w) TAN T&G PICKET',                            quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F54G-W-48', name: '7/8x6x48 WHITE T&G PICKET',                                     quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F57C-T-45G',name: '7/8x3x45-7/8 TAN PICKET PROFILE',                               quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F65S-W-31B',name: '7/8x1-1/2x31-1/2 WHITE PICKET PROFILE',                         quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F83S-I-61', name: '7/8x1-3/8x61 Chai Gray U-CHANNEL',                              quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F83U-T-122',name: '7/8" X 1 3/8" X 122" TAN U-CHANNEL',                            quantity: 0 },
  { category: 'Vinyl Linears', sku: '2-1/2x8xSS40 Galvi Pipe', name: '2-1/2x8xSS40 Galvi Pipe - Non-Primed',           quantity: 0 },
  { category: 'Vinyl Linears', sku: '61119541',  name: '2.75X4.70X73.5 SGLRT Gate Upright w/Pocket',                    quantity: 0 },
  { category: 'Vinyl Linears', sku: '73003694',  name: '5X5X102 PST (.135W) WHT',                                        quantity: 0 },
  { category: 'Vinyl Linears', sku: '73013858',  name: '5X5X108 BLANK POST CYPRESS',                                     quantity: 0 },
  { category: 'Vinyl Linears', sku: '73014090',  name: '5X5X84 POST (.250 WALL) WHITE',                                  quantity: 0 },
  { category: 'Vinyl Linears', sku: '73014091',  name: '5X5X108 POST (.250 WALL) WHITE',                                 quantity: 0 },
  { category: 'Vinyl Linears', sku: '73014237',  name: '2.75x4.7x73.5 GATE UPRIGHT WHITE',                               quantity: 0 },
  { category: 'Vinyl Linears', sku: '73051715',  name: '5X5X108 (.150W) POST Dark Walnut',                               quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052001',  name: '5x5x78 (.135W) Post White',                                      quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F10C-I-108',name: '5x5x108 Chai Gray POST',                                         quantity: 0 },
  { category: 'Vinyl Linears', sku: '73003713',  name: '2X6X94 RL (.090W) WHT',                                          quantity: 0 },
  { category: 'Vinyl Linears', sku: '73012399',  name: '1.5X5.5X96 Hollow Rail W/Locktabs(.080W)WHITE',                  quantity: 0 },
  { category: 'Vinyl Linears', sku: '73013916',  name: '1.75x7x94 RAIL W/BARB WHITE',                                    quantity: 0 },
  { category: 'Vinyl Linears', sku: '73051194',  name: '1.5X5.5X95 (.090W) Channel Rail Dark Walnut',                   quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053576',  name: '2X3.5X94 (.090W) RL WHITE',                                      quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053578',  name: '2x3.5x72 (.090W) WHITE RAIL PROFILE',                            quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053578-bottom',name:'2x3.5x72 WHITE RAIL PROFILE - Kirkwall Bottom',              quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053578-mid',   name:'2x3.5x72 WHITE RAIL PROFILE - Kirkwall Mid',                 quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F24E-T-192',name: '2x3 1/2x192 TAN RAIL PROFILE',                                   quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F25B-T-144',name: '1-3/4x3-1/2x144 TAN HOLLOW STANDARD',                           quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F25B-W-144',name: '1-3/4x3-1/2x144 White HOLLOW STANDARD',                         quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F37C-T-94', name: '1-3/4x5-1/2x94 TAN VINYL SLOTTED RAIL',                         quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F37C-W-94', name: '1-3/4x5-1/2x94 WHITE VINYL SLOTTED RAIL',                       quantity: 0 },
  { category: 'Vinyl Linears', sku: 'F3P5-I-94', name: '1-3/4x5-1/2x94 Chai Gray CHANNEL RAIL PROFILE',                 quantity: 0 },
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
    let reply = "Look hereÃ¢â‚¬â€my connection to the mainframe is acting up, so I'm flyin' blind today. But I'm still the boss here. If you need to do a count, just head over to the Digital Clipboard and pick whatever category you want. Now grab a tool and get back to work. What else do you need?";

    if (msgLower.includes("loading") || msgLower.includes("truck")) {
      reply = "Listen up! The loading sequence is strictly reverse order of use. Posts first, pickets last. Make sure you get 80-90% weight over the axles and strap every pallet with two straps. I swear, if that driver leaves before you check tire pressure, I'm sending you home!";
    } else if (msgLower.includes("staging") || msgLower.includes("color")) {
      reply = "Are you deaf? The Staging Color Code is non-negotiable: Orange for totes/hardware, Blue for concrete, Pink for gates and aluminum inserts, Green for job notes. Put that hardware in a tote with blue tape and the customer's name, or don't bother staging it at all. Got it?";
    } else if (msgLower.includes("ppe") || msgLower.includes("safety") || msgLower.includes("routing")) {
      reply = "Right, here's the deal. For the vinyl routing stations, you mandatorily need eye protection and ear protection at all times. Zero exceptions. Put 'em on or clock out and go home.";
    } else if (msgLower.includes("gate") || msgLower.includes("build")) {
      reply = "Alright, listen to me carefully. When you build a gate, you always start with checking your uprights and corners for square. If you're building a wood frame, use a Z-brace. If that gate is over 4 feet wide, you absolutely MUST use a truss rod or it's gonna sag and make us look like amateurs. Build it right the first time so we don't have to send a repair crew out there to fix your mess!";
    } else if (msgLower.includes("count") || msgLower.includes("inventory")) {
      reply = "Look, inventory counts ain't my main concern right nowÃ¢â‚¬â€but if you want to do one, head over to the Digital Clipboard. You can select any category from the list to count yourself. Just make sure you do it blind, count 'em right, and don't try to guess the numbers!";
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
      { id: 'cmm-aluminum', name: 'Aluminum Fence', type: 'html', url: '/docs/aluminum_specs.html', status: 'current' },
      { id: 'cmm-wood', name: 'Wood Fence', type: 'html', url: '/docs/wood_specs.html', status: 'current' }
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Inventory: Blind Count SOP Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

// GET /api/inventory/count-sheet
// Returns the full SKU list but STRIPS all on-hand quantities.
// This enforces the "blind count" SOP Ã¢â‚¬â€ counters must not see
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
  item.lastVariance = variance;
  saveInventory(inventory);

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
  inventory.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  saveInventory(inventory);

  res.json({ message: 'Item added successfully', item: newItem });
});

// DELETE /api/inventory/item/:sku
// Removes the item matching the given SKU from the in-memory inventory.
// Both shop (BlindCountBoard) and management (InventoryManager) hit this endpoint
// so both sides stay in sync.
app.delete('/api/inventory/item/:sku', (req, res) => {
  const sku = decodeURIComponent(req.params.sku);
  const idx = inventory.findIndex(i => i.sku === sku);

  if (idx === -1) {
    return res.status(404).json({ error: `SKU "${sku}" not found` });
  }

  const [removed] = inventory.splice(idx, 1);
  saveInventory(inventory);
  res.json({ message: `Removed "${removed.name}" (${sku}) from inventory`, sku });
});


// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Daily Count Assignment (Big Bob's Orders) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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

  // Weekend Ã¢â‚¬â€ no count
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return res.json({
      assigned: false,
      message: "It's the weekend. Rest up Ã¢â‚¬â€ we hit the yard again Monday.",
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
    `Listen up Ã¢â‚¬â€ today's count day. I need you on **${todaysCategories.join('** and **')}**. Grab a clipboard and don't skip anything.`,
    `Right, here's the deal. Today we're hitting **${todaysCategories.join('** and **')}**. Count what you see, not what you think should be there.`,
    `Alright crew, ${dayNames[workDayIndex]} count: **${todaysCategories.join('**, **')}**. Let me know when you're done Ã¢â‚¬â€ no shortcuts.`,
    `Look here Ã¢â‚¬â€ we got **${todaysCategories.join('** and **')}** on the board today. Take your time and get it right the first time.`,
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Not Counted Tracking Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

// In-memory store for items that were not counted
let notCountedItems = [];

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Email Report Helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

// Configure via .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//   COUNT_REPORT_EMAIL_1, COUNT_REPORT_EMAIL_2
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // TLS 
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

const REPORT_EMAILS = [
  process.env.COUNT_REPORT_EMAIL_1 || '',
  process.env.COUNT_REPORT_EMAIL_2 || '',
  process.env.COUNT_REPORT_EMAIL_3 || '',
  process.env.COUNT_REPORT_EMAIL_4 || '',
].filter(Boolean);

async function sendCountReport({ category, counterName, countedItems, startTime, finishTime }) {
  // Ã¢â€â‚¬Ã¢â€â‚¬ Only send a report if at least one item was actually counted Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  if (!countedItems || countedItems.length === 0) {
    console.log('[Count Report] Nothing counted Ã¢â‚¬â€ no email sent.');
    return { sent: false, reason: 'No items counted' };
  }

  if (REPORT_EMAILS.length === 0 || !process.env.SMTP_USER) {
    console.log('[Count Report] Email not configured Ã¢â‚¬â€ skipping send. Set SMTP_* and COUNT_REPORT_EMAIL_* in .env');
    return { sent: false, reason: 'Email not configured' };
  }

  const now     = new Date();
  const dateStr   = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const formatTime = (iso) => {
    if (!iso) return 'Ã¢â‚¬â€';
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const startTimeStr = formatTime(startTime);
  const finishTimeStr = formatTime(finishTime);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Variance color thresholds (same logic as front-end VarianceBadge) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const BULK_CATS = ['Shop Consumables', 'Chain Link', 'Vinyl Caps', 'Vinyl Hardware', 'Aluminum Hardware'];
  const isBulkCategory = BULK_CATS.some(c => category.toLowerCase().includes(c.toLowerCase()));

  const countedRows = countedItems.map(i => {
    const previousQty     = Math.max(0, i.actualCount - i.variance);
    const isBulk          = isBulkCategory || previousQty > 100;
    const greenThreshold  = Math.ceil(previousQty * (isBulk ? 0.02 : 0.05));
    const orangeThreshold = Math.ceil(previousQty * (isBulk ? 0.05 : 0.10));
    const absVar          = Math.abs(i.variance);

    // Ã°Å¸Å¸Â¢ GREEN  = good / within tolerance
    // Ã°Å¸Å¸Â  ORANGE = minor variance, worth a review
    // Ã°Å¸â€Â´ RED    = significant Ã¢â‚¬â€ investigate
    // Uses absolute value so -8 and +8 are treated identically
    let bgColor   = '#d1fae5';  // green
    let textColor = '#065f46';
    let label     = 'GOOD';

    if (i.variance !== 0) {
      const sign = i.variance > 0 ? '+' : '';
      label = `${sign}${i.variance}`;

      if (absVar <= greenThreshold) {
        bgColor = '#d1fae5'; textColor = '#065f46';       // Ã°Å¸Å¸Â¢ green
      } else if (absVar <= orangeThreshold) {
        bgColor = '#ffedd5'; textColor = '#c2410c';       // Ã°Å¸Å¸Â  orange
      } else {
        bgColor = '#fee2e2'; textColor = '#dc2626';       // Ã°Å¸â€Â´ red
      }
    }

    const badgeStyle = `display:inline-block;padding:3px 10px;border-radius:4px;background:${bgColor};color:${textColor};font-weight:800;font-size:12px`;

    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:14px">${i.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;color:#6b7280">${i.sku}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700">${i.actualCount}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center"><span style="${badgeStyle}">${label}</span></td>
    </tr>`;
  }).join('');


  // Ã¢â€â‚¬Ã¢â€â‚¬ Summary counts for header Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const goodCount   = countedItems.filter(i => i.variance === 0).length;
  const BULK_C      = isBulkCategory;
  const flaggedItems = countedItems.filter(i => {
    if (i.variance === 0) return false;
    const prev      = Math.max(0, i.actualCount - i.variance);
    const gp        = (BULK_C || prev > 100) ? 0.02 : 0.05;
    const maxG      = Math.ceil(prev * gp);
    const minG      = -maxG;
    return !(i.variance >= minG && i.variance <= maxG);
  });
  const redCount    = flaggedItems.filter(i => {
    const prev   = Math.max(0, i.actualCount - i.variance);
    const op     = (BULK_C || prev > 100) ? 0.05 : 0.10;
    const gp     = (BULK_C || prev > 100) ? 0.02 : 0.05;
    return Math.abs(i.variance) > Math.ceil(prev * op) || (i.variance < 0 && Math.abs(i.variance) > Math.ceil(prev * gp));
  }).length;
  const orangeCount = flaggedItems.length - redCount;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">

      <!-- Header -->
      <div style="background:#111827;color:white;padding:22px 28px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px;text-transform:uppercase;letter-spacing:1px">Ã°Å¸â€â€™ Cycle Count Report</h1>
        <p style="margin:8px 0 0;color:#fbbf24;font-size:16px;font-weight:900;text-transform:uppercase">Employee: ${counterName}</p>
        <div style="margin:12px 0 0;padding-top:12px;border-top:1px solid #374151;display:flex;gap:24px">
          <div>
            <p style="margin:0;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Category</p>
            <p style="margin:2px 0 0;color:#e5e7eb;font-size:14px;font-weight:700">${category}</p>
          </div>
          <div>
            <p style="margin:0;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Start Time</p>
            <p style="margin:2px 0 0;color:#e5e7eb;font-size:14px;font-weight:700">${startTimeStr}</p>
          </div>
          <div>
            <p style="margin:0;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Finish Time</p>
            <p style="margin:2px 0 0;color:#e5e7eb;font-size:14px;font-weight:700">${finishTimeStr}</p>
          </div>
        </div>
      </div>

      <!-- Summary chips -->
      <div style="background:#1f2937;padding:14px 28px;display:flex;gap:16px">
        <span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:800">
          Ã¢Å“â€œ ${goodCount} GOOD
        </span>
        ${orangeCount > 0 ? `<span style="background:#ffedd5;color:#c2410c;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:800">Ã¢Å¡Â  ${orangeCount} REVIEW</span>` : ''}
        ${redCount    > 0 ? `<span style="background:#fee2e2;color:#dc2626;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:800">Ã°Å¸â€Â´ ${redCount} INVESTIGATE</span>` : ''}
        <span style="background:#374151;color:#d1d5db;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:700">
          ${countedItems.length} items counted
        </span>
      </div>

      <!-- Counted items table  (ONLY what was counted) -->
      <div style="border:2px solid #e5e7eb;border-top:0">
        <div style="background:#065f46;color:white;padding:12px 24px">
          <strong style="font-size:14px;text-transform:uppercase;letter-spacing:0.5px">Ã¢Å“â€œ Counted Items</strong>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Item</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">SKU</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Count</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Variance</th>
            </tr>
          </thead>
          <tbody>${countedRows}</tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;border:2px solid #e5e7eb;border-top:0;padding:16px 24px;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:12px;color:#9ca3af">
          Ã°Å¸â€œâ€¹ Auto-generated by FencePro Shop &bull; Only counted items are included in this report.
          Skipped items are tracked separately in the Inventory tab.
        </p>
      </div>
    </div>
  `;

  try {
    // Ã¢â€â‚¬Ã¢â€â‚¬ Uncomment below and remove the mock lines once SMTP is configured Ã¢â€â‚¬Ã¢â€â‚¬
    await smtpTransport.sendMail({
      from: `"FencePro Shop" <${process.env.SMTP_USER}>`,
      to:   REPORT_EMAILS.join(', '),
      subject: `Cycle Count - ${category}`,
      html,
    });
    console.log(`[Count Report] Sent report for ${category} (${countedItems.length} items) to: ${REPORT_EMAILS.join(', ')}`);
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
  const { countedSkus, category, counterName, sendReport, startTime, finishTime } = req.body;

  console.log(`[Finish Day] Processing ${category} for ${counterName}. SKUs reported: ${countedSkus?.length || 0}`);

  if (!category || !counterName) {
    return res.status(400).json({ error: 'category and counterName are required' });
  }

  const categoryItems = inventory.filter(i => i.category === category);
  console.log(`[Finish Day] Found ${categoryItems.length} items in master inventory for category: "${category}"`);
  
  const countedSet = new Set(countedSkus || []);

  // Build variance data for counted items
  const countedItems = categoryItems
    .filter(i => countedSet.has(i.sku))
    .map(i => ({
      sku: i.sku,
      name: i.name,
      actualCount: i.quantity,
      variance: i.lastVariance || 0, // Properly read the saved variance!
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
      startTime,
      finishTime,
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

// Only start listening when run directly (not when required by tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`\nÃ°Å¸Ââ€”Ã¯Â¸Â  FencePro Shop Assistant running at http://localhost:${port}\n`);
    if (!process.env.GEMINI_API_KEY) {
      console.log('Ã¢Å¡Â Ã¯Â¸Â  Warning: GEMINI_API_KEY not set. AI chat will not work.');
      console.log('   Create a .env file with: GEMINI_API_KEY=your_key_here\n');
    }
  });
}

module.exports = app;
