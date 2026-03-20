// server.js
require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize the Google GenAI client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt for the Shop Assistant
const SYSTEM_PROMPT = `You are "The Shop Boss" (Big Bob), the AI veteran shop assistant at Superior Fence & Rail. 
You are a seasoned, no-nonsense fencing expert who has been building and installing fences for 20 years. 

Your Personality:
- You are gruff but deeply reliable, always focusing on doing the job right the first time.
- You talk like a seasoned blue-collar foreman. Use phrases like "Look here," "Let me tell ya," "Listen up," or "Right, here's the deal."
- You take pride in Superior Fence & Rail's high standards. Quality control and safety are your top priorities.
- You have zero patience for taking shortcuts or ignoring safety gear (PPE).
- You keep answers incredibly practical, direct, and actionable. You don't use fluffy corporate jargon.

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
- Start your first response with a brief, in-character greeting perfectly suited for a rugged shop foreman.`;

// ─── Inventory Data (in-memory store — from Blind Count Sheet) ───
const inventory = [
  // ── Aluminum Hardware ──
  { category: 'Aluminum Hardware', sku: '73022006', name: 'BRACKET-WALL RES/GDN BK - Aluminum Step Joint', quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73022594', name: 'BRACKET-BALL SWVL RES BK - Aluminum Swivel Joint', quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73045677', name: '2" SURFACE MOUNT BLACK - Aluminum Flange', quantity: 0 },
  { category: 'Aluminum Hardware', sku: '73050575', name: '19.5x35 Res Puppy Picket Addon Kit Black', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'AD1005-B', name: 'DFB "Best Grip" Gate Handle (Black)', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'AD1006B', name: 'SS Self Closing Aluminum Hinge', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'AD2011SSB', name: "Aluminum Drop DROP RODS BLACK 24'", quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'KLTRV-200', name: 'Aluminum Traverse Latch 2" Post, Key Lockable, Black', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'SGSS-B', name: 'Aluminum SMALL GATE STOPPER (BLK)', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'SHG-90LB', name: 'Black Self Closing Alum Hinges', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'VIPERX1-B', name: 'Aluminum BLACK LOCKABLE ONE-SIDED LATCH', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDF225BL', name: 'Dig Defence: Small/Med Black Powder Coated', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDFGP4', name: 'Dig Defence: Gate Plate: 32" wide', quantity: 0 },
  { category: 'Aluminum Hardware', sku: 'DDXL15', name: 'Dig Defence XL. 24"x15"', quantity: 0 },

  // ── Chain Link - Black ──
  { category: 'Chain Link - Black', sku: '0890B', name: '4 Dome Cap - Steel Black', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5955', name: '48x5/8 Steel Black Tension Bar', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5957', name: '60x5/8 Steel Black Tension Bar', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5958', name: '70x5/8 Steel Black Tension Bar', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5965', name: '94x5/8 Steel Black Tension Bar', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Collar Blk', name: '1-3/8 8g x 1-1/4 black Collar', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Rail End Blk', name: '1-3/8 Black Aluminum Rail End', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Drop Fork Blk', name: '1-3/8 black drop fork', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Fem Hinge Blk', name: '1-3/8 black female hinge', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Gate Cap Blk', name: 'Chain Link Gate dome Cap Black', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8 Corner Blk', name: '1-3/8 Pipe Corner - Black', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-3/8x21 Blk Tube', name: '1-3/8x21x.065 Black Tubing Top Rail', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8 Dome Cap Blk', name: '1-5/8 Black Aluminum Dome Cap', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8 Male Hinge Blk', name: '1-5/8 Black steel male hinge', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x7 Line Blk', name: '1-5/8x7x065 Black Tubing Line Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x8 Line Blk', name: '1-5/8x8x.065 Black Tubing Line Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-5/8x9 Line Blk', name: '1-5/8x9x.065 Black Tubing Line Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '1-7/8 Tension Blk', name: '1-7/8" Black Tension Band', quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x7 Term Blk', name: '2-1/2x7x.065 Black Tubing Terminal Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x8 Term Blk', name: '2-1/2x8x.065 Black Tubing Terminal Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '2-1/2x9 Term Blk', name: '2-1/2x9x.065 Black Tubing Terminal Post', quantity: 0 },
  { category: 'Chain Link - Black', sku: '48x50x9g Blk Fab', name: '48x50x9g Black (2" Mesh) KK Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Black', sku: '60x50x9g Blk Fab', name: '60x50x9g Black (2" Mesh) KK Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Black', sku: '72x50x9g Blk Fab', name: '72x50x9g Black (2" Mesh) KK Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Black', sku: '96x50x9g Blk Fab', name: '96x50x9g Black (2" Mesh) KK Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5904', name: '2-1/2 Black Tension Band', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5924', name: '2-1/2 Black Brace Band', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5051', name: '1-5/8x1-3/8 Black Aluminum Loop Cap', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5814', name: '2-1/2x1-5/8 Black Loop Cap', quantity: 0 },
  { category: 'Chain Link - Black', sku: '5822', name: 'BLK 1-5/8 Rail End Combo Half Room', quantity: 0 },
  { category: 'Chain Link - Black', sku: 'Tension Wire Blk', name: "Tension Wire 13C/9F black smooth (1000')", quantity: 0 },

  // ── Chain Link - Galvanized ──
  { category: 'Chain Link - Galvanized', sku: '258', name: '1-5/8 to 1-3/8 Mid Rail T-Clamp - GALVI', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '811', name: '1-5/8x1-3/8 Galvi Loop Cap', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '814', name: '2-1/2x1-5/8 Loop Cap - Galvi PS', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '822', name: '1-5/8 Rail End Half Moon Galvi PS', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '844', name: '2-1/2 Dome Cap - Galvi PS', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '902', name: '1-5/8 Tension Band', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '904', name: '2-1/2 Tension Band', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '924', name: '2-1/2 Brace Band', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '955', name: '48x5/8 Steel Tension Bar', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '957', name: '60x5/8 Steel Tension Bar', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Collar Galv', name: '1-3/8 8g x 1-1/4 GALVI Collar', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Drop Fork Galv', name: '1-3/8 galvi drop fork', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8 Fem Hinge Galv', name: '1-3/8 galvi female hinge', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '1-3/8x21 Galv Tube', name: '1-3/8x21x.065 Galvi Tubing Top Rail', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '48x50x9g Galv Fab', name: '48x50x9g Galvi (2" Mesh) KK Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '72x50x9g Galv Fab', name: '72x50x9g Galvi (2" Mesh) KT Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: '96x50x9g Galv Fab', name: '96x50x9g Galvanized (2" Mesh) KT Chain Link Fabric', quantity: 0 },
  { category: 'Chain Link - Galvanized', sku: 'Tension Wire Galv', name: "Tension Wire 9ga straight (1000')", quantity: 0 },

  // ── Chain Link - Misc/Tools ──
  { category: 'Chain Link - Misc/Tools', sku: '2', name: '5/16x1-1/4 carriage bolt w/nut', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5', name: '5/16x2-1/2 galvi w/nut carriage bolt', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '34', name: '6-1/2 9g Aluminum Tie Wire - 1-3/8 - 2 posts', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '37', name: 'Hog Rings 2lb 9a Alum (500 qty)', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5002', name: '5/16x1-1/4 black w/nut carriage bolt', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5034', name: '6-1/2 9g Black Aluminum Tie Wire - 1-3/8 - 2" posts', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: '5037', name: 'Hog Rings 9g Alum 2lb bag BLACK (500 rings)', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ATIE25', name: '8-1/4 9g Aluminum Tie Wire - 2-1/2 posts', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ATIE25B', name: '8-1/4 9g Black Aluminum Tie Wire - 2-1/2" posts', quantity: 0 },
  { category: 'Chain Link - Misc/Tools', sku: 'ML3TPKA', name: 'Magnalatch, Top Pull, Black', quantity: 0 },

  // ── Shop Consumables ──
  { category: 'Shop Consumables', sku: '474374', name: '5"x1000\' 90ga banding film with handle', quantity: 0 },
  { category: 'Shop Consumables', sku: '131180', name: '3/4" x 2150\' - 1350lb composite strap', quantity: 0 },
  { category: 'Shop Consumables', sku: '131630', name: '3/4" strapping buckle - 1,000', quantity: 0 },
  { category: 'Shop Consumables', sku: 'Strap Guards', name: 'Strap Guards: 2-1/2x1-3/4', quantity: 0 },
  { category: 'Shop Consumables', sku: '468439', name: '1-3/4" x .092 Hot Galv Ring 15dg Nails', quantity: 11600 },
  { category: 'Shop Consumables', sku: '367275', name: '3" x .120 Hot Galv Screw 21dg Nails', quantity: 15500 },
  { category: 'Shop Consumables', sku: '320590', name: 'R4 #9 x 3-1/8" Screws 1900CT', quantity: 3500 },
  { category: 'Shop Consumables', sku: '319359', name: 'R4 #9 x 2" Screws 3700CT', quantity: 200 },
  { category: 'Shop Consumables', sku: 'Metabo Staples', name: 'Metabo 1/4" x 3/4" staples 1000ct', quantity: 22 },
  { category: 'Shop Consumables', sku: '15dg Scrails', name: '1 3/4" x .113 15deg scrails', quantity: 2600 },
  { category: 'Shop Consumables', sku: 'Structural Screw', name: '5/6x6 Structural Wood Screw', quantity: 500 },
  { category: 'Shop Consumables', sku: 'Freeman Staple', name: 'Freeman 10.5 gauge fence staple', quantity: 4200 },
  { category: 'Shop Consumables', sku: 'Wood Glue', name: 'Wood Glue for caps', quantity: 0 },
  { category: 'Shop Consumables', sku: '3" Drive Pins', name: '3" drive pins (no dig fence)', quantity: 900 },
  { category: 'Shop Consumables', sku: 'Silicone', name: 'Silicone (12 of 2.8oz)', quantity: 33 },
  { category: 'Shop Consumables', sku: 'PVC Cement', name: 'PVC Cement 32 oz', quantity: 52 },
  { category: 'Shop Consumables', sku: 'Trash Bags', name: 'Trash Bags', quantity: 500 },
  { category: 'Shop Consumables', sku: 'Zip Bags', name: 'GPI - 9" x 12" Ultra Heavy-Duty Zip Bags', quantity: 8 },
  { category: 'Shop Consumables', sku: '526020', name: '#8 x 3/4" Square Drive Screw - Tek Screws', quantity: 22500 },
  { category: 'Shop Consumables', sku: 'Black Rivets', name: 'Black 3/16" Pop Rivets Aluminum Large Head Exploding', quantity: 0 },
  { category: 'Shop Consumables', sku: 'White Rivets', name: 'White 3/16" Pop Rivets Aluminum Large Head', quantity: 400 },

  // ── Vinyl Caps ──
  { category: 'Vinyl Caps', sku: '73003093', name: '5x5 PYRAMID WHITE POST TOP', quantity: 0 },
  { category: 'Vinyl Caps', sku: '73003919', name: '7/8x3 DOGEAR CAP WHITE', quantity: 0 },
  { category: 'Vinyl Caps', sku: '73013829', name: '5"X5" PYRAMID POST TOP CYPRESS', quantity: 0 },
  { category: 'Vinyl Caps', sku: '73045003', name: '5x5 NEW ENGLAND WHITE POST TOP', quantity: 0 },
  { category: 'Vinyl Caps', sku: '73045768', name: '2.75x4.70x.935 VFG UR CAP WHITE', quantity: 0 },
  { category: 'Vinyl Caps', sku: '73053067', name: '5x5 Pyramid Post Top Dark Walnut', quantity: 0 },
  { category: 'Vinyl Caps', sku: 'C55PYRA-T', name: '5x5 PYRAMID TAN POST TOP', quantity: 0 },
  { category: 'Vinyl Caps', sku: 'P1515SH-W', name: '1-1/2x1-1/2 SHARP WHITE PICKET TOP', quantity: 0 },
  { category: 'Vinyl Caps', sku: 'P7815SH-W', name: '7/8x1 1/2 SHARP WHITE PICKET TOP', quantity: 0 },
  { category: 'Vinyl Caps', sku: '1641', name: '5x5 Square Cap May Downward Solar Light', quantity: 0 },
  { category: 'Vinyl Caps', sku: '1859', name: '5x5 Square Cap May Halo Solar Light', quantity: 0 },

  // ── Vinyl Hardware ──
  { category: 'Vinyl Hardware', sku: 'AD1001B', name: 'STAINLESS STEEL BLACK SELF CLOSING GATE HINGE PAIR', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1002B', name: 'STAINLESS STEEL BLACK TWO WAY LATCH', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1003B', name: 'Vinyl Drop Rod - BLACK SS DROP RODS 24"', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1004B', name: 'BLACK SS TWO WAY LATCH SMALL', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD1009B', name: 'GATE BRACE BLACK', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD3010B', name: 'Gate Stop with Handle (BLK)', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'APSB5', name: '5" STRAIGHT N LEVEL COLLAR - BLACK', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'PLC', name: '5" King Nut Post Leveling Collar Donut', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'uni5', name: 'Uni-5: 2-1/2 SS40 for 5x5 Vinyl Posts', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'AD6002', name: '5x5x108 ALUMINUM POST INSERT', quantity: 0 },
  { category: 'Vinyl Hardware', sku: 'VIGK', name: 'Vinyl Insta-gate kits - 6H Hamilton', quantity: 0 },

  // ── Vinyl Linears ──
  { category: 'Vinyl Linears', sku: '73003694', name: '5X5X102 PST (.135W) WHT', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73014091', name: '5X5X108 POST (.250 WALL) WHITE', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052001', name: '5x5x78 (.135W) Post White', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73051715', name: '5X5X108 (.150W) POST Dark Walnut', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73003713', name: '2X6X94 RL (.090W) WHT', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73013916', name: '1.75x7x94 RAIL W/BARB WHITE', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053576', name: '2X3.5X94 (.090W) RL WHITE', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73050964', name: '.875x6x62.25 (.040) WHITE T&G PICKET', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73055284', name: '.875X6X59.5 .040 T&G WH', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73052960', name: '1-1/2x1-1/2x192 WHITE PICKET PROFILE', quantity: 0 },
  { category: 'Vinyl Linears', sku: '73053001', name: '.875x1.25x59 EXTRA U-CHANNEL WH', quantity: 0 },
];
// Chat endpoint — Gemini AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI not configured',
        reply: 'The AI assistant is not configured yet. Please add your GEMINI_API_KEY to the .env file.'
      });
    }

    // Build conversation contents
    const contents = [];

    // Add history if provided
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Generate content using the new SDK
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    const text = result.text;

    res.json({ reply: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error.status, error.message);
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        reply: "Hold on there — I'm getting too many questions at once. Give me a second and try again."
      });
    }
    res.status(500).json({
      error: 'Failed to get response from AI',
      reply: 'Sorry, I had trouble processing that. Please try again.'
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

// Documents list
app.get('/api/documents', (req, res) => {
  res.json({
    categories: [
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
    ]
  });
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
    const color = i.variance === 0 ? '#059669' : i.variance > 0 ? '#2563eb' : '#dc2626';
    const label = i.variance === 0 ? 'MATCH' : `${i.variance > 0 ? '+' : ''}${i.variance}`;
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
    console.log(`[Count Report] Emailed to: ${REPORT_EMAILS.join(', ')}`);
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
      actualCount: i.quantity, // already updated by reconcile calls
      variance: 0, // will be overridden below
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

// Only start listening when run directly (not when required by tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`\n🏗️  FencePro Shop Assistant running at http://localhost:${port}\n`);
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  Warning: GEMINI_API_KEY not set. AI chat will not work.');
      console.log('   Create a .env file with: GEMINI_API_KEY=your_key_here\n');
    }
  });
}

module.exports = app;
