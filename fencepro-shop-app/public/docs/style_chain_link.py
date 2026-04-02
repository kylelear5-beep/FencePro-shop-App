import re

def main():
    file_path = 'c:/Users/kylel/OneDrive/Desktop/FencePro-shop-App/fencepro-shop-app/public/docs/chain_link_installation.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Insert Master SVG at the top of Page 2 (or bottom of Page 1)
    master_svg = """
    <!-- FENCE ASSEMBLY DIAGRAM -->
    <div style="text-align: center; margin: 20px 0;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="width:100%; max-width:700px; background:#fff; border:1px solid #D2CFC7; border-radius:6px;">
          <defs>
            <pattern id="chainlink" width="12" height="20" patternUnits="userSpaceOnUse">
              <path d="M6,0 L12,10 L6,20 L0,10 Z" stroke="#d0d0d0" stroke-width="1" fill="none"/>
            </pattern>
            <style>
              .callout { fill: #821302; }
              .callout-text { fill: white; font-family: 'Source Sans 3', sans-serif; font-size: 13px; font-weight: 800; text-anchor: middle; dominant-baseline: central; }
              .line { stroke: #821302; stroke-width: 1.5; stroke-dasharray: 2,2; }
            </style>
          </defs>

          <!-- Fabric -->
          <rect x="65" y="85" width="475" height="240" fill="url(#chainlink)"/>
          <rect x="590" y="85" width="150" height="220" fill="url(#chainlink)"/>

          <!-- Posts -->
          <rect x="50" y="50" width="20" height="320" fill="#9e9e9e" stroke="#6b6b6b"/>
          <rect x="300" y="50" width="14" height="320" fill="#9e9e9e" stroke="#6b6b6b"/>
          <rect x="540" y="50" width="20" height="320" fill="#9e9e9e" stroke="#6b6b6b"/>

          <!-- Top Rail -->
          <rect x="65" y="75" width="475" height="12" fill="#b1b1b1" stroke="#7b7b7b"/>

          <!-- Fittings Left Post -->
          <path d="M48,50 Q60,35 72,50 Z" fill="#bbbbbb" stroke="#777"/>
          <rect x="48" y="73" width="24" height="16" rx="2" fill="#888" stroke="#444"/>
          <path d="M72,75 L82,73 L82,87 L72,85 Z" fill="#aaa" stroke="#555"/>

          <rect x="48" y="120" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
          <rect x="48" y="180" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
          <rect x="48" y="240" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
          <rect x="48" y="300" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
          
          <rect x="80" y="100" width=\"6\" height=\"220\" fill=\"#ccc\" stroke=\"#888\"/>

          <!-- Fittings Middle Post -->
          <path d="M295,50 Q307,35 319,50 Z" fill="#bbbbbb" stroke="#777"/>
          <circle cx="307" cy="75" r="8" fill="#999" stroke="#555"/>

          <!-- Bottom Tension Wire -->
          <line x1="65" y1="320" x2="540" y2="320" stroke="#777" stroke-width="3"/>
          <circle cx="200" cy="320" r="3" stroke="#222" stroke-width="1.5" fill="none"/>

          <!-- Gate Frame -->
          <rect x="580" y="75" width="12" height="240" fill="#a5a5a5" stroke="#666"/>
          <rect x="592" y="75" width="148" height="12" fill="#a5a5a5" stroke="#666"/>
          <rect x="740" y="75" width="12" height="240" fill="#a5a5a5" stroke="#666"/>
          <rect x="592" y="303" width="148" height="12" fill="#a5a5a5" stroke="#666"/>

          <!-- Gate Hinges & Latch -->
          <rect x="560" y="100" width="16" height="12" rx="2" fill="#888" stroke="#444"/>
          <rect x="570" y="100" width="16" height="12" rx="2" fill="#888" stroke="#444"/>
          <path d="M752,180 L765,180 L765,200 L752,200 Z" fill="#888" stroke="#444"/>
          
          <!-- Callouts -->
          <line x1="60" y1="45" x2="60" y2="15" class="line"/><circle cx="60" cy="15" r="12" class="callout"/><text x="60" y="16" class="callout-text">1</text>
          <line x1="78" y1="75" x2="100" y2="45" class="line"/><circle cx="100" cy="45" r="12" class="callout"/><text x="100" y="46" class="callout-text">2</text>
          <line x1="48" y1="81" x2="25" y2="81" class="line"/><circle cx="15" cy="81" r="12" class="callout"/><text x="15" y="82" class="callout-text">3</text>
          <line x1="48" y1="124" x2="25" y2="124" class="line"/><circle cx="15" cy="124" r="12" class="callout"/><text x="15" y="125" class="callout-text">4</text>
          <line x1="307" y1="45" x2="307" y2="15" class="line"/><circle cx="307" cy="15" r="12" class="callout"/><text x="307" y="16" class="callout-text">5</text>
          <line x1="300" y1="150" x2="270" y2="150" class="line"/><path d="M295,148 C305,140 305,160 295,152" stroke="#444" fill="none"/><circle cx="260" cy="150" r="12" class="callout"/><text x="260" y="151" class="callout-text">6</text>
          <line x1="575" y1="106" x2="590" y2="50" class="line"/><circle cx="595" cy="40" r="12" class="callout"/><text x="595" y="41" class="callout-text">7</text>
          <line x1="565" y1="106" x2="545" y2="50" class="line"/><circle cx="540" cy="40" r="12" class="callout"/><text x="540" y="41" class="callout-text">8</text>
          <line x1="758" y1="190" x2="780" y2="190" class="line"/><circle cx="790" cy="190" r="12" class="callout"/><text x="790" y="191" class="callout-text">9</text>
          <line x1="60" y1="350" x2="60" y2="380" class="line"/><circle cx="60" cy="380" r="12" class="callout"/><text x="60" y="381" class="callout-text">10</text>
          <line x1="83" y1="320" x2="100" y2="360" class="line"/><circle cx="105" cy="365" r="12" class="callout"/><text x="105" y="366" class="callout-text">11</text>
          <line x1="180" y1="75" x2="180" y2="45" class="line"/><circle cx="180" cy="35" r="12" class="callout"/><text x="180" y="36" class="callout-text">12</text>
          <line x1="307" y1="350" x2="307" y2="380" class="line"/><circle cx="307" cy="380" r="12" class="callout"/><text x="307" y="381" class="callout-text">13</text>
          <line x1="400" y1="320" x2="400" y2="350" class="line"/><circle cx="400" cy="360" r="12" class="callout"/><text x="400" y="361" class="callout-text">14</text>
          <line x1="200" y1="320" x2="200" y2="350" class="line"/><circle cx="200" cy="360" r="12" class="callout"/><text x="200" y="361" class="callout-text">15</text>
        </svg>
    </div>
    """
    
    html = html.replace(
        '<p style="text-align:center; font-size:13px; color:#666; margin-bottom:16px;">\n            The numbered parts below correspond to the fence assembly diagram. Use this list when gathering materials.\n        </p>',
        '<p style="text-align:center; font-size:13px; color:#666; margin-bottom:16px;">\n            The numbered parts below correspond to the fence assembly diagram. Use this list when gathering materials.\n        </p>\n' + master_svg
    )

    # 2. Add SVGs for Page 3 Figures
    fig5_svg = """
        <div style="text-align:center; margin: 16px 0;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 250" style="width:100%; max-width:180px; height:auto;">
              <rect x="65" y="20" width="20" height="230" fill="#9e9e9e" stroke="#6b6b6b"/>
              <path d="M60,20 Q75,5 90,20 Z" fill="#bbbbbb" stroke="#777"/>
              <text x="55" y="15" font-size="10" text-anchor="end" fill="#555" font-weight="bold">Cap</text>
              <line x1="58" y1="13" x2="68" y2="13" stroke="#aaa"/>

              <rect x="63" y="44" width="24" height="12" rx="2" fill="#888" stroke="#444"/>
              <text x="55" y="48" font-size="10" text-anchor="end" fill="#555" font-weight="bold">Brace Band</text>
              <line x1="58" y1="46" x2="63" y2="46" stroke="#aaa"/>
              
              <path d="M87,42 L110,38 L110,57 L87,53 Z" fill="#ccc" stroke="#555"/>
              <rect x="105" y="42" width="40" height="10" fill="#b1b1b1" stroke="#777"/>
              
              <rect x="63" y="90" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
              <text x="55" y="94" font-size="10" text-anchor="end" fill="#555" font-weight="bold">Tension Bands</text>
              <line x1="58" y1="94" x2="63" y2="94" stroke="#aaa"/>
              
              <rect x="63" y="130" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
              <rect x="63" y="170" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
              <rect x="63" y="210" width="24" height="8" rx="2" fill="#888" stroke="#444"/>
              
              <rect x="92" y="80" width="6" height="150" fill="#ccc" stroke="#888"/>
              <text x="110" y="150" font-size="10" fill="#555" font-weight="bold">Tension Bar</text>
            </svg>
        </div>
    """
    html = html.replace('<strong>Fitting Layout — End &amp; Gate Post <span class="fig-ref">Fig. 5</span></strong>',
                        '<strong>Fitting Layout — End &amp; Gate Post <span class="fig-ref">Fig. 5</span></strong>\n' + fig5_svg)

    fig6_svg = """
        <div style="text-align:center; margin-top: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" style="width:100%; max-width:280px; height:auto;">
              <polyline points="10,120 120,120 120,80 240,80 240,40 290,40" fill="none" stroke="#689689" stroke-width="4"/>
              <rect x="20" y="60" width="100" height="60" fill="#821302" opacity="0.15"/>
              <rect x="130" y="20" width="100" height="60" fill="#821302" opacity="0.15"/>
              <rect x="250" y="-20" width="40" height="60" fill="#821302" opacity="0.15"/>
              
              <line x1="20" y1="60" x2="20" y2="120" stroke="#555" stroke-width="3"/>
              <line x1="120" y1="60" x2="120" y2="120" stroke="#555" stroke-width="4"/> 
              <line x1="126" y1="20" x2="126" y2="80" stroke="#555" stroke-width="4"/> 
              
              <line x1="240" y1="20" x2="240" y2="80" stroke="#555" stroke-width="4"/> 
              <line x1="246" y1="-20" x2="246" y2="40" stroke="#555" stroke-width="4"/> 
              
              <circle cx="123" cy="80" r="5" fill="#821302"/>
              <text x="123" y="98" font-size="12" font-weight="bold" fill="#821302" text-anchor="middle">A</text>
            </svg>
        </div>
    """
    html = html.replace('<strong>Terraced Ground <span class="fig-ref">Fig. 6</span></strong>',
                        '<strong>Terraced Ground <span class="fig-ref">Fig. 6</span></strong>\n' + fig6_svg)
    
    fig7_svg = """
        <div style="text-align:center; margin-top: 10px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" style="width:100%; max-width:280px; height:auto;">
              <polyline points="10,40 80,40 200,90 290,90" fill="none" stroke="#689689" stroke-width="4"/>
              <polygon points="10,-20 80,-20 80,40 10,40" fill="#821302" opacity="0.15"/>
              <polygon points="80,-20 200,30 200,90 80,40" fill="#821302" opacity="0.15"/>
              <polygon points="200,30 290,30 290,90 200,90" fill="#821302" opacity="0.15"/>
              
              <line x1="10" y1="-20" x2="10" y2="40" stroke="#555" stroke-width="3"/>
              <line x1="80" y1="-20" x2="80" y2="40" stroke="#555" stroke-width="5"/>
              <line x1="200" y1="30" x2="200" y2="90" stroke="#555" stroke-width="5"/>
              <line x1="290" y1="30" x2="290" y2="90" stroke="#555" stroke-width="3"/>

              <circle cx="80" cy="40" r="5" fill="#821302"/>
              <text x="80" y="58" font-size="12" font-weight="bold" fill="#821302" text-anchor="middle">A</text>
              
              <circle cx="200" cy="90" r="5" fill="#821302"/>
              <text x="200" y="108" font-size="12" font-weight="bold" fill="#821302" text-anchor="middle">B</text>
            </svg>
        </div>
    """
    html = html.replace('<strong>Very Uneven Ground <span class="fig-ref">Fig. 7</span></strong>',
                        '<strong>Very Uneven Ground <span class="fig-ref">Fig. 7</span></strong>\n' + fig7_svg)

    # 3. Add tiny icons for the parts on Page 2
    # Convert <div class="check-box"></div> to SVGs or highlighted numbers
    # Actually, we can add the numbered circles back from the diagram so they can cross-reference!
    
    # We will use simple regexes to replace the check-box DIV where the part ID is known.
    replacements = {
        'Terminal Post ⑩': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">10</div>',
        'Line Post ⑬': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">13</div>',
        'Top Rail ⑫': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">12</div>',
        'Tension Bar ⑪': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">11</div>',
        'Terminal Post Cap ①': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">1</div>',
        'Line Post Top (Loop Cap) ⑤': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">5</div>',
        'Rail End (Cup) ②': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">2</div>',
        'Rail End Band (Brace Band) ③': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">3</div>',
        'Tension Band ④': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">4</div>',
        'Gate Post Hinge (Male) ⑧': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">8</div>',
        'Gate Frame Hinge (Female) ⑦': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">7</div>',
        'Gate Fork Latch ⑨': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">9</div>',
        'Fence Tie ⑥': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">6</div>',
        'Bottom Tension Wire ⑭': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">14</div>',
        'Tension Wire Clip (Hog Ring) ⑮': '<div class="part-id" style="width:18px;height:18px;font-size:10px;margin-top:2px;flex-shrink:0;">15</div>',
    }
    
    # Simple replacement iteration to add part IDs into the empty checkboxes dynamically
    for part, r_html in replacements.items():
        pattern = r'<div class="check-box"></div>\s*<div class="part-info">\s*<div class="part-name">' + re.escape(part) + r'</div>'
        replacement = r_html + '\n                    <div class="part-info">\n                        <div class="part-name">' + part + '</div>'
        html = re.sub(pattern, replacement, html, count=1)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
if __name__ == '__main__':
    main()
