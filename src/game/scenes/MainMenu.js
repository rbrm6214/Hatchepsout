import { EventBus } from '../EventBus';
import { DIFFICULTY, difficultyLabel, getBonusUnlocked, getStoredDifficulty, setBonusUnlocked, setStoredDifficulty } from '../GameSettings';
import * as Phaser from 'phaser';

const HIERO_ONE = '𓏺';
const HIERO_TEN = '𓎆';
const HIERO_HUNDRED = '𓍢';
const HIERO_THOUSAND = '𓆼';

export class MainMenu extends Phaser.Scene
{
    difficultyText;
    optionsWindowNodes;
    passwordWindowNodes;
    choiceWindowNodes;
    bonusWindowNodes;
    bonusButtonNodes;
    bonusUnlocked;

    constructor ()
    {
        super('MainMenu');
        this.optionsWindowNodes = [];
        this.passwordWindowNodes = [];
        this.choiceWindowNodes = [];
        this.bonusWindowNodes = [];
        this.bonusButtonNodes = [];
        this.bonusUnlocked = false;
    }

    create ()
    {
        // The scene instance can be reused; clear stale node references before rebuilding UI.
        this.optionsWindowNodes = [];
        this.passwordWindowNodes = [];
        this.choiceWindowNodes = [];
        this.bonusWindowNodes = [];
        this.bonusButtonNodes = [];

        const width = this.scale.width;
        const height = this.scale.height;
        const difficulty = getStoredDifficulty();
        this.registry.set('difficulty', difficulty);
        this.bonusUnlocked = getBonusUnlocked();

        this.ensureTitleMusicRunning();

        this.drawTempleBackdrop(width, height);

        this.add.text(width / 2, 170, 'LES SCEAUX DE HATCHEPSOUT', {
            fontFamily: 'Georgia',
            fontSize: 52,
            color: '#f6d28b',
            stroke: '#20150c',
            strokeThickness: 6,
            align: 'center'
        }).setDepth(20).setOrigin(0.5);

        this.add.text(width / 2, 228, 'Veronique prisonniere de la chambre funeraire', {
            fontFamily: 'Georgia',
            fontSize: 24,
            color: '#e5d6b2',
            align: 'center'
        }).setDepth(20).setOrigin(0.5);

        this.createMenuButton(width / 2, 430, 'Jouer', () => {
            this.stopTitleMusic();
            this.scene.start('Game', { difficulty: this.registry.get('difficulty') });
        });

        this.createMenuButton(width / 2, 515, 'Options', () => {
            this.openDifficultyWindow();
        });

        this.createMenuButton(width / 2, 600, 'Password', () => {
            this.openPasswordWindow();
        });

        if (this.bonusUnlocked)
        {
            this.showBonusButton();
        }

        this.difficultyText = this.add.text(width / 2, 660, 'Difficulte: ' + difficultyLabel(difficulty), {
            fontFamily: 'Georgia',
            fontSize: 22,
            color: '#e5d6b2',
            align: 'center'
        }).setDepth(20).setOrigin(0.5);

        this.difficultyText.setY(height - 20);

        this.add.text(width / 2, height - 38, ' ', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#d2bf94'
        }).setOrigin(0.5);
        
        EventBus.emit('current-scene-ready', this);
    }

    playTone (frequency, duration = 0.35, type = 'sine', volume = 0.03)
    {
        const ctx = this.sound?.context;
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.04);
    }

    ensureTitleMusicRunning ()
    {
        if (this.registry.get('titleMusicIntervals')) return;

        const melody = [196, 220, 247, 220, 196, 165, 196, 247];
        let m = 0;
        const melodyId = window.setInterval(() => {
            this.playTone(melody[m % melody.length], 0.9, 'triangle', 0.03);
            m++;
        }, 1150);

        const bass = [98, 110, 123, 98];
        let b = 0;
        const bassId = window.setInterval(() => {
            this.playTone(bass[b % bass.length], 1.3, 'sine', 0.02);
            b++;
        }, 2300);

        this.registry.set('titleMusicIntervals', [melodyId, bassId]);
    }

    stopTitleMusic ()
    {
        const ids = this.registry.get('titleMusicIntervals');
        if (!ids) return;

        const [melodyId, bassId] = ids;
        if (melodyId)
        {
            window.clearInterval(melodyId);
        }
        if (bassId)
        {
            window.clearInterval(bassId);
        }
        this.registry.set('titleMusicIntervals', null);
    }

    drawTempleBackdrop (width, height)
    {
        const g = this.add.graphics();

        g.fillGradientStyle(0x22170d, 0x22170d, 0x4d351f, 0x4d351f, 1);
        g.fillRect(0, 0, width, height);

        g.fillStyle(0x2a1d10, 1);
        g.fillRect(0, 510, width, 258);

        g.fillStyle(0x6e4c2d, 1);
        g.fillRect(170, 210, 684, 360);

        g.fillStyle(0x8f6540, 1);
        for (let i = 0; i < 6; i++)
        {
            g.fillRect(210 + i * 100, 240, 42, 300);
        }

        g.fillStyle(0x4b341e, 1);
        g.fillRect(458, 340, 108, 230);

        for (let i = 0; i < 18; i++)
        {
            const x = Phaser.Math.Between(40, width - 40);
            const y = Phaser.Math.Between(70, 440);
            g.fillStyle(0xf3d597, Phaser.Math.FloatBetween(0.08, 0.35));
            g.fillCircle(x, y, Phaser.Math.Between(1, 3));
        }
    }

    createMenuButton (x, y, label, onClick)
    {
        const buttonBg = this.add.rectangle(x, y, 260, 58, 0x2b1f14, 0.9)
            .setStrokeStyle(2, 0xd9b878)
            .setInteractive({ useHandCursor: true })
            .setDepth(20);

        const buttonText = this.add.text(x, y, label, {
            fontFamily: 'Georgia',
            fontSize: 31,
            color: '#f2dfb5'
        }).setOrigin(0.5).setDepth(21);

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x3c2a1a, 0.95);
            buttonText.setColor('#fff3d1');
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x2b1f14, 0.9);
            buttonText.setColor('#f2dfb5');
        });

        buttonBg.on('pointerdown', onClick);

        return { buttonBg, buttonText };
    }

    showBonusButton ()
    {
        if (this.bonusButtonNodes.length > 0) return;
        const { buttonBg, buttonText } = this.createMenuButton(this.scale.width / 2, 685, 'Bonus', () => {
            this.openBonusWindow();
        });
        this.bonusButtonNodes = [buttonBg, buttonText];
    }

    openBonusWindow ()
    {
        if (this.bonusWindowNodes.length > 0) return;

        const width = this.scale.width;
        const height = this.scale.height;
        const bonusSlides = [
            { key: 'bonus-scarabees-party', title: 'Scarabées Party', fileName: 'scarabéesParty.jpeg' },
            { key: 'bonus-vero-croft', title: 'Vero Croft', fileName: 'VeroCroft.jpeg' },
            { key: 'bonus-puzzle-oracle', title: 'Puzzle Oracle', fileName: 'puzzleOracle.png' },
            { key: 'bonus-bd-intro-page-1', title: 'BD Intro - Page 1', fileName: 'BD_intro_page1.png' },
            { key: 'bonus-bd-intro-page-2', title: 'BD Intro - Page 2', fileName: 'BD_intro_page2.png' },
            { key: 'bonus-surprise-comics-v1', title: 'Surprise Comics v1', fileName: 'Surprise_comics_version_1.png' },
            { key: 'bonus-surprise-realiste-v1', title: 'Surprise Réaliste v1', fileName: 'Surprise_realiste_version_1.png' }
        ].filter(item => this.textures.exists(item.key));

        if (bonusSlides.length === 0)
        {
            this.bonusWindowNodes = [
                this.add.text(width / 2, height / 2, 'Aucune image Bonus chargée.', {
                    fontFamily: 'Georgia',
                    fontSize: 30,
                    color: '#f5e4be'
                }).setOrigin(0.5).setDepth(50)
            ];
            this.time.delayedCall(1800, () => {
                this.bonusWindowNodes.forEach(n => n.destroy());
                this.bonusWindowNodes = [];
            });
            return;
        }

        let currentIndex = 0;
        const nodes = [];
        const addNode = (obj) => {
            nodes.push(obj);
            return obj;
        };

        const closeWindow = () => {
            nodes.forEach(n => n.destroy());
            this.bonusWindowNodes = [];
        };

        addNode(this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72)
            .setDepth(40)
            .setInteractive());

        addNode(this.add.rectangle(width / 2, height / 2, width - 80, height - 90, 0x26190f, 0.96)
            .setStrokeStyle(3, 0xd7b574)
            .setDepth(41));

        addNode(this.add.text(width / 2, 72, 'VISUALISEUR BONUS', {
            fontFamily: 'Georgia',
            fontSize: 42,
            color: '#f3d8a0',
            align: 'center'
        }).setOrigin(0.5).setDepth(42));

        const slideTitle = addNode(this.add.text(width / 2, 118, '', {
            fontFamily: 'Georgia',
            fontSize: 24,
            color: '#ead8b0',
            align: 'center'
        }).setOrigin(0.5).setDepth(42));

        const slideCounter = addNode(this.add.text(width / 2, height - 82, '', {
            fontFamily: 'Georgia',
            fontSize: 20,
            color: '#e7d1a5',
            align: 'center'
        }).setOrigin(0.5).setDepth(42));

        const slideFileName = addNode(this.add.text(width / 2, height - 58, '', {
            fontFamily: 'Georgia',
            fontSize: 18,
            color: '#d8be8d',
            align: 'center'
        }).setOrigin(0.5).setDepth(42));

        const slideImage = addNode(this.add.image(width / 2, height / 2 + 8, bonusSlides[0].key)
            .setDepth(42));

        const refreshSlide = () => {
            const current = bonusSlides[currentIndex];
            slideImage.setTexture(current.key);
            const tex = this.textures.get(current.key);
            const src = tex?.getSourceImage?.();
            const srcW = src?.width ?? 1;
            const srcH = src?.height ?? 1;
            const maxW = width - 250;
            const maxH = height - 270;
            const scale = Math.min(maxW / srcW, maxH / srcH);
            slideImage.setDisplaySize(Math.round(srcW * scale), Math.round(srcH * scale));
            slideTitle.setText(current.title);
            slideCounter.setText((currentIndex + 1) + ' / ' + bonusSlides.length);
            slideFileName.setText('Image: ' + current.fileName);
        };
        refreshSlide();

        const leftBg = addNode(this.add.rectangle(88, height / 2, 76, 76, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(42)
            .setInteractive({ useHandCursor: true }));
        const leftTxt = addNode(this.add.text(88, height / 2, '◀', {
            fontFamily: 'Georgia',
            fontSize: 40,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(43));
        leftBg.on('pointerdown', () => {
            currentIndex = (currentIndex - 1 + bonusSlides.length) % bonusSlides.length;
            refreshSlide();
        });
        leftBg.on('pointerover', () => {
            leftBg.setFillStyle(0x4a3522, 0.95);
            leftTxt.setColor('#fff3d0');
        });
        leftBg.on('pointerout', () => {
            leftBg.setFillStyle(0x2f2116, 0.95);
            leftTxt.setColor('#f5e4be');
        });

        const rightBg = addNode(this.add.rectangle(width - 88, height / 2, 76, 76, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(42)
            .setInteractive({ useHandCursor: true }));
        const rightTxt = addNode(this.add.text(width - 88, height / 2, '▶', {
            fontFamily: 'Georgia',
            fontSize: 40,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(43));
        rightBg.on('pointerdown', () => {
            currentIndex = (currentIndex + 1) % bonusSlides.length;
            refreshSlide();
        });
        rightBg.on('pointerover', () => {
            rightBg.setFillStyle(0x4a3522, 0.95);
            rightTxt.setColor('#fff3d0');
        });
        rightBg.on('pointerout', () => {
            rightBg.setFillStyle(0x2f2116, 0.95);
            rightTxt.setColor('#f5e4be');
        });

        const closeBg = addNode(this.add.rectangle(width / 2, height - 38, 230, 56, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(42)
            .setInteractive({ useHandCursor: true }));

        const closeTxt = addNode(this.add.text(width / 2, height - 38, 'Fermer', {
            fontFamily: 'Georgia',
            fontSize: 30,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(43));

        closeBg.on('pointerover', () => {
            closeBg.setFillStyle(0x4a3522, 0.95);
            closeTxt.setColor('#fff3d0');
        });
        closeBg.on('pointerout', () => {
            closeBg.setFillStyle(0x2f2116, 0.95);
            closeTxt.setColor('#f5e4be');
        });
        closeBg.on('pointerdown', closeWindow);

        this.bonusWindowNodes = nodes;
    }

    buildGlyphOptions (step, symbol)
    {
        const options = [{ value: 0, glyph: '∅' }];
        for (let i = 1; i <= 9; i++)
        {
            options.push({
                value: i * step,
                glyph: symbol.repeat(i)
            });
        }
        return options;
    }

    closeChoiceWindow ()
    {
        this.choiceWindowNodes.forEach(n => n.destroy());
        this.choiceWindowNodes = [];
    }

    openChoiceWindow (title, options, onPick)
    {
        this.closeChoiceWindow();

        const width = this.scale.width;
        const height = this.scale.height;
        const nodes = [];
        const addNode = (obj) => {
            nodes.push(obj);
            return obj;
        };

        const closeWindow = () => {
            nodes.forEach(n => n.destroy());
            this.choiceWindowNodes = [];
        };

        addNode(this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
            .setDepth(60)
            .setInteractive());

        const panelHeight = Math.min(620, options.length * 48 + 140);
        addNode(this.add.rectangle(width / 2, height / 2, 760, panelHeight, 0x21160d, 0.97)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(61));

        addNode(this.add.text(width / 2, height / 2 - panelHeight / 2 + 36, title, {
            fontFamily: 'Georgia',
            fontSize: 30,
            color: '#f3d8a0'
        }).setOrigin(0.5).setDepth(62));

        const startY = height / 2 - panelHeight / 2 + 82;
        options.forEach((opt, idx) => {
            const y = startY + idx * 48;
            const bg = addNode(this.add.rectangle(width / 2, y, 700, 42, 0x372617, 0.95)
                .setStrokeStyle(1, 0xb9915a)
                .setDepth(62)
                .setInteractive({ useHandCursor: true }));

            const text = addNode(this.add.text(width / 2, y,
                opt.glyph, {
                    fontFamily: 'Georgia',
                    fontSize: 34,
                    color: '#f2dfb5',
                    align: 'center'
                }).setOrigin(0.5).setDepth(63));

            bg.on('pointerover', () => bg.setFillStyle(0x4a3522, 0.96));
            bg.on('pointerout', () => bg.setFillStyle(0x372617, 0.95));
            bg.on('pointerdown', () => {
                onPick(opt);
                closeWindow();
            });
        });

        const closeBg = addNode(this.add.rectangle(width / 2, height / 2 + panelHeight / 2 - 36, 220, 48, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(62)
            .setInteractive({ useHandCursor: true }));
        const closeTxt = addNode(this.add.text(width / 2, height / 2 + panelHeight / 2 - 36, 'Fermer', {
            fontFamily: 'Georgia',
            fontSize: 26,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(63));
        closeBg.on('pointerdown', closeWindow);
        closeBg.on('pointerover', () => {
            closeBg.setFillStyle(0x4a3522, 0.95);
            closeTxt.setColor('#fff3d0');
        });
        closeBg.on('pointerout', () => {
            closeBg.setFillStyle(0x2f2116, 0.95);
            closeTxt.setColor('#f5e4be');
        });

        this.choiceWindowNodes = nodes;
    }

    openPasswordWindow ()
    {
        if (this.passwordWindowNodes.length > 0) return;

        const width = this.scale.width;
        const height = this.scale.height;
        const values = [0, 0, 0, 0]; // Unites, Dizaines, Centaines, Milliers
        const slots = [];

        const slotDefs = [
            { options: this.buildGlyphOptions(1, HIERO_ONE) },
            { options: this.buildGlyphOptions(10, HIERO_TEN) },
            { options: this.buildGlyphOptions(100, HIERO_HUNDRED) },
            { options: this.buildGlyphOptions(1000, HIERO_THOUSAND) }
        ];

        const nodes = [];
        const addNode = (obj) => {
            nodes.push(obj);
            return obj;
        };

        const closeWindow = () => {
            this.closeChoiceWindow();
            nodes.forEach(n => n.destroy());
            this.passwordWindowNodes = [];
        };

        const getOptionByValue = (slotIndex, value) => {
            return slotDefs[slotIndex].options.find(o => o.value === value) ?? slotDefs[slotIndex].options[0];
        };

        const refreshSlot = (slotIndex) => {
            const choice = getOptionByValue(slotIndex, values[slotIndex]);
            const slot = slots[slotIndex];
            slot.glyphText.setText(choice.glyph);
            slot.valueText.setText(choice.value === 0 ? 'Vide' : '');
        };

        addNode(this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.62)
            .setDepth(50)
            .setInteractive());

        addNode(this.add.rectangle(width / 2, height / 2, 920, 560, 0x26190f, 0.97)
            .setStrokeStyle(3, 0xd7b574)
            .setDepth(51));

        addNode(this.add.text(width / 2, height / 2 - 220, 'PASSWORD HIÉROGLYPHIQUE', {
            fontFamily: 'Georgia',
            fontSize: 40,
            color: '#f3d8a0'
        }).setOrigin(0.5).setDepth(52));

        const statusText = addNode(this.add.text(width / 2, height / 2 + 195, '', {
            fontFamily: 'Georgia',
            fontSize: 22,
            color: '#f5e4be',
            align: 'center'
        }).setOrigin(0.5).setDepth(52));

        const startX = width / 2 - 315;
        const spacing = 210;
        slotDefs.forEach((def, idx) => {
            const x = startX + idx * spacing;
            const box = addNode(this.add.rectangle(x, height / 2 - 10, 180, 240, 0x352417, 0.95)
                .setStrokeStyle(2, 0xc79d62)
                .setDepth(52)
                .setInteractive({ useHandCursor: true }));

            const glyphText = addNode(this.add.text(x, height / 2 - 26, '', {
                fontFamily: 'Georgia',
                fontSize: 64,
                color: '#f8e6bf',
                align: 'center'
            }).setOrigin(0.5).setDepth(53));

            const valueText = addNode(this.add.text(x, height / 2 + 72, 'Vide', {
                fontFamily: 'Georgia',
                fontSize: 20,
                color: '#d8be8d'
            }).setOrigin(0.5).setDepth(53));

            box.on('pointerover', () => box.setFillStyle(0x45301d, 0.97));
            box.on('pointerout', () => box.setFillStyle(0x352417, 0.95));
            box.on('pointerdown', () => {
                this.openChoiceWindow('Choisir un glyphe', def.options, (opt) => {
                    values[idx] = opt.value;
                    refreshSlot(idx);
                });
            });

            slots.push({ box, glyphText, valueText });
            refreshSlot(idx);
        });

        const validateBg = addNode(this.add.rectangle(width / 2, height / 2 + 128, 250, 56, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(52)
            .setInteractive({ useHandCursor: true }));
        const validateTxt = addNode(this.add.text(width / 2, height / 2 + 128, 'Valider', {
            fontFamily: 'Georgia',
            fontSize: 30,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(53));

        validateBg.on('pointerover', () => {
            validateBg.setFillStyle(0x4a3522, 0.95);
            validateTxt.setColor('#fff3d0');
        });
        validateBg.on('pointerout', () => {
            validateBg.setFillStyle(0x2f2116, 0.95);
            validateTxt.setColor('#f5e4be');
        });

        validateBg.on('pointerdown', () => {
            const codeValue = values[0] + values[1] + values[2] + values[3];
            if (codeValue === 1959)
            {
                setBonusUnlocked(true);
                this.bonusUnlocked = true;
                this.showBonusButton();
                statusText.setColor('#d9f0a8').setText('Code valide: Bonus débloqué !');
                return;
            }
            statusText.setColor('#f0ad96').setText('Code invalide.');
        });

        const closeBg = addNode(this.add.rectangle(width / 2, height / 2 + 255, 230, 50, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(52)
            .setInteractive({ useHandCursor: true }));
        const closeTxt = addNode(this.add.text(width / 2, height / 2 + 255, 'Fermer', {
            fontFamily: 'Georgia',
            fontSize: 28,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(53));
        closeBg.on('pointerover', () => {
            closeBg.setFillStyle(0x4a3522, 0.95);
            closeTxt.setColor('#fff3d0');
        });
        closeBg.on('pointerout', () => {
            closeBg.setFillStyle(0x2f2116, 0.95);
            closeTxt.setColor('#f5e4be');
        });
        closeBg.on('pointerdown', closeWindow);

        this.passwordWindowNodes = nodes;
    }

    openDifficultyWindow ()
    {
        if (this.optionsWindowNodes.length > 0) return;

        const width = this.scale.width;
        const height = this.scale.height;
        let currentDifficulty = this.registry.get('difficulty') ?? getStoredDifficulty();

        const nodes = [];
        const addNode = (obj) => {
            nodes.push(obj);
            return obj;
        };

        const closeWindow = () => {
            nodes.forEach(n => n.destroy());
            this.optionsWindowNodes = [];
        };

        addNode(this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
            .setDepth(40)
            .setInteractive());

        addNode(this.add.rectangle(width / 2, height / 2, 760, 420, 0x26190f, 0.96)
            .setStrokeStyle(3, 0xd7b574)
            .setDepth(41));

        addNode(this.add.text(width / 2, height / 2 - 145, 'CHOIX DE DIFFICULTE', {
            fontFamily: 'Georgia',
            fontSize: 42,
            color: '#f3d8a0'
        }).setOrigin(0.5).setDepth(42));

        const statusText = addNode(this.add.text(width / 2, height / 2 - 85,
            'Actuel: ' + difficultyLabel(currentDifficulty), {
                fontFamily: 'Georgia',
                fontSize: 24,
                color: '#ead8b0',
                align: 'center'
            }).setOrigin(0.5).setDepth(42));

        const refreshers = [];
        const createDifficultyButton = (x, y, label, value) => {
            const bg = addNode(this.add.rectangle(x, y, 200, 58, 0x3a2a1a, 0.95)
                .setStrokeStyle(2, 0xd9b878)
                .setDepth(42)
                .setInteractive({ useHandCursor: true }));

            const txt = addNode(this.add.text(x, y, label, {
                fontFamily: 'Georgia',
                fontSize: 28,
                color: '#f2dfb5'
            }).setOrigin(0.5).setDepth(43));

            const refresh = () => {
                const active = currentDifficulty === value;
                bg.setFillStyle(active ? 0x5a3f24 : 0x3a2a1a, 0.95);
                txt.setColor(active ? '#fff3d1' : '#f2dfb5');
            };

            bg.on('pointerover', () => {
                if (currentDifficulty !== value) bg.setFillStyle(0x4a3522, 0.95);
            });

            bg.on('pointerout', refresh);

            bg.on('pointerdown', () => {
                currentDifficulty = setStoredDifficulty(value);
                this.registry.set('difficulty', currentDifficulty);
                statusText.setText('Actuel: ' + difficultyLabel(currentDifficulty));
                if (this.difficultyText) this.difficultyText.setText('Difficulte: ' + difficultyLabel(currentDifficulty));
                refreshers.forEach(fn => fn());
            });

            refreshers.push(refresh);
        };

        createDifficultyButton(width / 2 - 220, height / 2 + 10, 'Facile', DIFFICULTY.EASY);
        createDifficultyButton(width / 2, height / 2 + 10, 'Moyen', DIFFICULTY.NORMAL);
        createDifficultyButton(width / 2 + 220, height / 2 + 10, 'Difficile', DIFFICULTY.HARD);
        refreshers.forEach(fn => fn());

        const closeBg = addNode(this.add.rectangle(width / 2, height / 2 + 130, 230, 56, 0x2f2116, 0.95)
            .setStrokeStyle(2, 0xd7b574)
            .setDepth(42)
            .setInteractive({ useHandCursor: true }));

        const closeTxt = addNode(this.add.text(width / 2, height / 2 + 130, 'Fermer', {
            fontFamily: 'Georgia',
            fontSize: 30,
            color: '#f5e4be'
        }).setOrigin(0.5).setDepth(43));

        closeBg.on('pointerover', () => {
            closeBg.setFillStyle(0x4a3522, 0.95);
            closeTxt.setColor('#fff3d0');
        });

        closeBg.on('pointerout', () => {
            closeBg.setFillStyle(0x2f2116, 0.95);
            closeTxt.setColor('#f5e4be');
        });

        closeBg.on('pointerdown', closeWindow);

        this.optionsWindowNodes = nodes;
    }
}
