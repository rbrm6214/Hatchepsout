const fs = require('fs');

const p = 'src/game/scenes/Game.js';
let s = fs.readFileSync(p, 'utf8');

const HG1 = '\uD80C\uDFFA'; // 𓏺
const HG10 = '\uD80C\uDF86'; // 𓎆
const hgNum = (n) => HG10.repeat(Math.floor(n / 10)) + HG1.repeat(n % 10);
const oneToNine = Array.from({ length: 9 }, (_, i) => hgNum(i + 1));
const tenToTwenty = [hgNum(10), ...Array.from({ length: 9 }, (_, i) => hgNum(11 + i)), hgNum(20)];
const glyphLine = `${oneToNine.join(' ')} | ${tenToTwenty.join(' ')}`;

const quoteLine = `\"Balance du Sud: ${glyphLine}\" -Parchemin.`;

s = s.replace(/this\.addNavArrow\('hub', cx, 175, 'nord',\s*'[^']*NORD'\);/, "this.addNavArrow('hub', cx, 175, 'nord',  '▲  NORD');");
s = s.replace(/this\.addNavArrow\('hub', cx, 540, 'sud',\s*'[^']*SUD'\);/, "this.addNavArrow('hub', cx, 540, 'sud',   '▼  SUD');");
s = s.replace(/this\.addNavArrow\('hub', 820, cy, 'est',\s*'[^']*EST'\);/, "this.addNavArrow('hub', 820, cy, 'est',   '▶  EST');");
s = s.replace(/this\.addNavArrow\('hub', 204, cy, 'ouest',\s*'[^']*OUEST'\);/, "this.addNavArrow('hub', 204, cy, 'ouest', '◀  OUEST');");
s = s.replace(/const dot = this\.add\.text\(d\.x, d\.y, '[^']*', \{/, "const dot = this.add.text(d.x, d.y, '○', {");
s = s.replace(/const backTxt = this\.add\.text\(100, 660, '[^']*Retour', \{/, "const backTxt = this.add.text(100, 660, '◀ Retour', {");
s = s.replace(/const seals\s*=\s*\[[^\]]+\];/, "const seals    = ['LEVANT\\n☀', 'MIDI\\n⚭', 'COUCHANT\\n☽', 'ZENITH\\n★'];");
s = s.replace(/this\.createCollectible\('est', w - 120, 220, 'amulette', 'Amulette Stellaire',\s*'[^']*',/, "this.createCollectible('est', w - 120, 220, 'amulette', 'Amulette Stellaire', '✦',");

s = s.replace(/const targetGlyph = .*;/, "const targetGlyph = '𓎆'.repeat(Math.floor(targetWeight / 10)) + '𓏺'.repeat(targetWeight % 10);");
s = s.replace(/return .*repeat\(tens\) \+ .*repeat\(ones\);/, "return '𓎆'.repeat(tens) + '𓏺'.repeat(ones);");

s = s.replace(/const offerings = isEasy \?[\s\S]*?\n\s*\];\n\s*const spacing = offerings.length > 4 \? 112 : 140;/,
`const offerings = isEasy ? [
            { name: 'Scarabee', icon: '🪲', value: 3, glyph: '𓏺𓏺𓏺' },
            { name: 'Plume',    icon: '🪶', value: 4, glyph: '𓏺𓏺𓏺𓏺' },
            { name: 'Couronne', icon: '👑', value: 8, glyph: '𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺' },
            { name: 'Ankh',     icon: '☥',  value: 5, glyph: '𓏺𓏺𓏺𓏺𓏺' }
        ] : [
            { name: 'Scarabee', icon: '🪲', value: 3, glyph: '𓏺𓏺𓏺' },
            { name: 'Plume',    icon: '🪶', value: 4, glyph: '𓏺𓏺𓏺𓏺' },
            { name: 'Couronne', icon: '👑', value: 8, glyph: '𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺' },
            { name: 'Ankh',     icon: '☥',  value: 5, glyph: '𓏺𓏺𓏺𓏺𓏺' },
            { name: 'Lotus',    icon: '✿',  value: 1, glyph: '𓏺' },
            { name: 'Sceptre',  icon: '⚚',  value: 6, glyph: '𓏺𓏺𓏺𓏺𓏺𓏺' },
            { name: 'Masque',   icon: '🎭', value: 2, glyph: '𓏺𓏺' },
            { name: 'Oeil',     icon: '◉',  value: 7, glyph: '𓏺𓏺𓏺𓏺𓏺𓏺𓏺' }
        ];
        const spacing = offerings.length > 4 ? 112 : 140;`
);

s = s.replace(/('OUEST -- Les Miroirs du Couchant',\n\s*)'[^']*'\);/, "$1'\"Râ doit recharger la pierre du crépuscule.\"');");
s = s.replace(/\n\s*'[^']*',\n\s*'La pierre rayonne encore de la lumiere de Ra\.'/, "\n                                    '◉',\n                                    'La pierre rayonne encore de la lumiere de Ra.'");

s = s.replace(/this\.createCollectible\('ouest',[\s\S]*?'Cristal de Quartz',[\s\S]*?-Parchemin\.'\);/,
`this.createCollectible('ouest', w - 120, 220, 'cristal', 'Cristal de Quartz', '◆',
            '${quoteLine}');`
);

s = s.replace(/if \(indicator\) indicator\.setText\('[^']*'\)\.setColor\('#f0d060'\);/, "if (indicator) indicator.setText('✦').setColor('#f0d060');");

s = s.replace(/this\.crystalHintGlyphsText[\s\S]*?\.setY\(624\)[\s\S]*?\.setText\('[\s\S]*?'\)\s*\.setVisible\(true\);/,
`this.crystalHintGlyphsText
                .setY(624)
                .setText('${glyphLine}')
                .setVisible(true);`
);

fs.writeFileSync(p, s, 'utf8');
console.log('Game.js encoding symbols repaired');
