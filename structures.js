function escapeStructureText(text) {  
  return String(text)  
    .replaceAll("&", "&amp;")  
    .replaceAll("<", "&lt;")  
    .replaceAll(">", "&gt;");  
}  
  
function ringPoints(centerX, centerY, radius) {  
  const angles = [-90, -30, 30, 90, 150, 210];  
  
  return angles.map(angle => {  
    const rad = angle * Math.PI / 180;  
    return {  
      x: centerX + radius * Math.cos(rad),  
      y: centerY + radius * Math.sin(rad),  
      rad  
    };  
  });  
}  
  
function renderRing(centerX, centerY, radius, substituents = []) {  
  const points = ringPoints(centerX, centerY, radius);  
  
  const ringBonds = points.map((point, index) => {  
    const next = points[(index + 1) % points.length];  
    return `<line x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}" class="svg-bond" />`;  
  }).join("");  
  
  const doubleBonds = `  
    <line x1="${centerX + 4}" y1="${centerY - 48}" x2="${centerX + 42}" y2="${centerY - 26}" class="svg-thin-bond" />  
    <line x1="${centerX + 43}" y1="${centerY + 26}" x2="${centerX + 4}" y2="${centerY + 48}" class="svg-thin-bond" />  
    <line x1="${centerX - 44}" y1="${centerY + 26}" x2="${centerX - 44}" y2="${centerY - 26}" class="svg-thin-bond" />  
  `;  
  
  const substituentParts = substituents.map(sub => {  
    const point = points[sub.position];  
    const unitX = Math.cos(point.rad);  
    const unitY = Math.sin(point.rad);  
  
    const bondEndX = point.x + unitX * (sub.bondLength || 32);  
    const bondEndY = point.y + unitY * (sub.bondLength || 32);  
  
    const labelX = point.x + unitX * (sub.labelDistance || 58) + (sub.offsetX || 0);  
    const labelY = point.y + unitY * (sub.labelDistance || 58) + (sub.offsetY || 0);  
  
    return `  
      <line x1="${point.x}" y1="${point.y}" x2="${bondEndX}" y2="${bondEndY}" class="svg-bond" />  
      <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" class="${sub.small ? "svg-atom-small" : "svg-atom"}">  
        ${escapeStructureText(sub.label)}  
      </text>  
    `;  
  }).join("");  
  
  return `${ringBonds}${doubleBonds}${substituentParts}`;  
}  
  
function singleRingSVG(substituents = []) {  
  return `  
    <svg width="360" height="260" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">  
      ${structureStyle()}  
      ${renderRing(180, 130, 58, substituents)}  
    </svg>  
  `;  
}  
  
function twoRingAzoSVG(rightLabel) {  
  const leftRing = renderRing(115, 130, 48, []);  
  const rightRing = renderRing(245, 130, 48, [  
    { position: 3, label: rightLabel, labelDistance: 52 }  
  ]);  
  
  return `  
    <svg width="360" height="260" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">  
      ${structureStyle()}  
      ${leftRing}  
      ${rightRing}  
  
      <line x1="157" y1="130" x2="190" y2="130" class="svg-bond" />  
      <text x="202" y="130" text-anchor="middle" dominant-baseline="middle" class="svg-atom-small">N=N</text>  
      <line x1="215" y1="130" x2="203" y2="130" class="svg-bond" />  
    </svg>  
  `;  
}  
  
function acetoneSVG() {  
  return `  
    <svg width="360" height="260" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">  
      ${structureStyle()}  
      <text x="180" y="110" text-anchor="middle" class="svg-atom">CH₃–C–CH₃</text>  
      <line x1="180" y1="118" x2="180" y2="160" class="svg-bond" />  
      <line x1="188" y1="118" x2="188" y2="160" class="svg-thin-bond" />  
      <text x="184" y="190" text-anchor="middle" class="svg-atom">O</text>  
      <text x="180" y="225" text-anchor="middle" class="svg-caption">アセトン：CH₃COCH₃</text>  
    </svg>  
  `;  
}  
  
function structureStyle() {  
  return `  
    <style>  
      .svg-bond {  
        stroke: #111827;  
        stroke-width: 4;  
        stroke-linecap: round;  
        fill: none;  
      }  
  
      .svg-thin-bond {  
        stroke: #111827;  
        stroke-width: 2.5;  
        stroke-linecap: round;  
        fill: none;  
      }  
  
      .svg-atom {  
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif;  
        font-size: 24px;  
        font-weight: 850;  
        fill: #111827;  
      }  
  
      .svg-atom-small {  
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif;  
        font-size: 19px;  
        font-weight: 850;  
        fill: #111827;  
      }  
  
      .svg-caption {  
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Noto Sans JP", sans-serif;  
        font-size: 14px;  
        font-weight: 700;  
        fill: #667085;  
      }  
    </style>  
  `;  
}  
  
const structureSpecs = {  
  benzene: [],  
  nitrobenzene: [{ position: 0, label: "NO₂" }],  
  aniline: [{ position: 0, label: "NH₂" }],  
  anilinium_chloride: [{ position: 0, label: "NH₃⁺Cl⁻", small: true }],  
  acetanilide: [{ position: 0, label: "NHCOCH₃", small: true }],  
  tribromoaniline: [  
    { position: 0, label: "NH₂" },  
    { position: 1, label: "Br" },  
    { position: 3, label: "Br" },  
    { position: 5, label: "Br" }  
  ],  
  diazonium: [{ position: 0, label: "N₂⁺Cl⁻", small: true }],  
  chlorobenzene: [{ position: 0, label: "Cl" }],  
  bromobenzene: [{ position: 0, label: "Br" }],  
  benzenesulfonic_acid: [{ position: 0, label: "SO₃H", small: true }],  
  sodium_phenoxide: [{ position: 0, label: "ONa" }],  
  phenol: [{ position: 0, label: "OH" }],  
  phenyl_acetate: [{ position: 0, label: "OCOCH₃", small: true }],  
  tribromophenol: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "Br" },  
    { position: 3, label: "Br" },  
    { position: 5, label: "Br" }  
  ],  
  o_nitrophenol: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "NO₂" }  
  ],  
  p_nitrophenol: [  
    { position: 0, label: "OH" },  
    { position: 3, label: "NO₂" }  
  ],  
  picric_acid: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "NO₂" },  
    { position: 3, label: "NO₂" },  
    { position: 5, label: "NO₂" }  
  ],  
  salicylic_acid: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "COOH", small: true, offsetX: 8 }  
  ],  
  sodium_salicylate: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "COONa", small: true, offsetX: 12 }  
  ],  
  acetylsalicylic_acid: [  
    { position: 0, label: "OCOCH₃", small: true },  
    { position: 1, label: "COOH", small: true, offsetX: 8 }  
  ],  
  methyl_salicylate: [  
    { position: 0, label: "OH" },  
    { position: 1, label: "COOCH₃", small: true, offsetX: 14 }  
  ],  
  toluene: [{ position: 0, label: "CH₃" }],  
  benzyl_chloride: [{ position: 0, label: "CH₂Cl", small: true }],  
  benzyl_alcohol: [{ position: 0, label: "CH₂OH", small: true }],  
  benzaldehyde: [{ position: 0, label: "CHO" }],  
  benzoic_acid: [{ position: 0, label: "COOH", small: true }],  
  sodium_benzoate: [{ position: 0, label: "COONa", small: true }],  
  methyl_benzoate: [{ position: 0, label: "COOCH₃", small: true }],  
  o_xylene: [  
    { position: 0, label: "CH₃" },  
    { position: 1, label: "CH₃" }  
  ],  
  p_xylene: [  
    { position: 0, label: "CH₃" },  
    { position: 3, label: "CH₃" }  
  ],  
  phthalic_acid: [  
    { position: 0, label: "COOH", small: true },  
    { position: 1, label: "COOH", small: true, offsetX: 8 }  
  ],  
  terephthalic_acid: [  
    { position: 0, label: "COOH", small: true },  
    { position: 3, label: "COOH", small: true }  
  ],  
  cumene: [{ position: 0, label: "CH(CH₃)₂", small: true }],
  acetophenone: [{ position: 0, label: "COCH₃", small: true }]  
};  
  

function cyclohexaneSVG() {
  return `
    <svg width="360" height="260" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
      ${structureStyle()}
      <polygon points="180,55 245,92 245,168 180,205 115,168 115,92" class="svg-bond" />
      <text x="180" y="235" text-anchor="middle" class="svg-caption">シクロヘキサン：C₆H₁₂</text>
    </svg>
  `;
}

function benzeneHexachlorideSVG() {
  return `
    <svg width="360" height="260" viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg">
      ${structureStyle()}
      <polygon points="180,55 245,92 245,168 180,205 115,168 115,92" class="svg-bond" />
      <text x="180" y="34" text-anchor="middle" class="svg-atom-small">Clが6個付加</text>
      <text x="180" y="235" text-anchor="middle" class="svg-caption">ベンゼンヘキサクロリド：C₆H₆Cl₆</text>
    </svg>
  `;
}

window.getStructureSVG = function getStructureSVG(compoundId) {  
  if (compoundId === "cyclohexane") {
    return cyclohexaneSVG();
  }

  if (compoundId === "benzene_hexachloride") {
    return benzeneHexachlorideSVG();
  }

  if (compoundId === "acetone") {  
    return acetoneSVG();  
  }  
  
  if (compoundId === "azo_phenol") {  
    return twoRingAzoSVG("OH");  
  }  
  
  if (compoundId === "azo_aniline") {  
    return twoRingAzoSVG("NH₂");  
  }  
  
  const spec = structureSpecs[compoundId];  
  
  if (!spec) {  
    return `  
      <div class="structure-empty">  
        この物質の構造式SVGはまだ未登録です。  
      </div>  
    `;  
  }  
  
  return singleRingSVG(spec);  
};  
