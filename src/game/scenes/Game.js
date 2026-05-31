import { EventBus } from '../EventBus';
import { DIFFICULTY, normalizeDifficulty } from '../GameSettings';
import * as Phaser from 'phaser';
import { InventoryManager } from '../InventoryManager';

const HIERO_ONE = '𓏺';
const HIERO_TEN = '𓎆';
const HIERO_HUNDRED = '𓍢';
const HIERO_THOUSAND = '𓆼';
const HIERO_TEN_THOUSAND = '𓂭';
const HIERO_HUNDRED_THOUSAND = '𓆐';
const HIERO_MILLION = '𓁨';
const SOUTH_BALANCE_GUIDE = '𓏺 𓏺𓏺 𓏺𓏺𓏺 𓏺𓏺𓏺𓏺 𓏺𓏺𓏺𓏺𓏺 𓏺𓏺𓏺𓏺𓏺𓏺 𓏺𓏺𓏺𓏺𓏺𓏺𓏺 𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺 𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺 | 𓎆 𓎆𓏺 𓎆𓏺𓏺 𓎆𓏺𓏺𓏺 𓎆𓏺𓏺𓏺𓏺 𓎆𓏺𓏺𓏺𓏺𓏺 𓎆𓏺𓏺𓏺𓏺𓏺𓏺 𓎆𓏺𓏺𓏺𓏺𓏺𓏺𓏺 𓎆𓏺𓏺𓏺𓏺𓏺𓏺𓏺𓏺 𓎆𓎆';
const NORD_DEITIES = [
    { id: 'anubis',  name: 'Anubis',   textureKey: 'nord-anubis' },
    { id: 'apophis', name: 'Apophis',  textureKey: 'nord-apophis' },
    { id: 'ares',    name: 'Ares',     textureKey: 'nord-ares' },
    { id: 'baal',    name: 'Baal',     textureKey: 'nord-baal' },
    { id: 'cronus',  name: 'Cronus',   textureKey: 'nord-cronus' },
    { id: 'heruur',  name: 'Heru-Ur',  textureKey: 'nord-heru-ur' },
    { id: 'moloc',   name: 'Moloc',    textureKey: 'nord-moloc' },
    { id: 'nirrti',  name: 'Nirrti',   textureKey: 'nord-nirrti' },
    { id: 'ra',      name: 'Ra',       textureKey: 'nord-ra' },
    { id: 'seth',    name: 'Seth',     textureKey: 'nord-seth' },
    { id: 'sokar',   name: 'Sokar',    textureKey: 'nord-sokar' },
    { id: 'svarog',  name: 'Svarog',   textureKey: 'nord-svarog' },
    { id: 'yu',      name: 'Yu',       textureKey: 'nord-yu' }
];

export class Game extends Phaser.Scene
{
    currentRoom;
    rooms;
    solvedIndicators;
    sealOrder;
    sealTarget;
    dialValues;
    dialTargets;
    selectedOfferings;
    mirrorStates;
    mirrorTargets;
    puzzlesSolved;
    messageText;
    crystalHintGlyphsText;
    progressText;
    timerText;
    exitButton;
    exitText;
    inventory;
    ouestBeamPlaying;
    ouestBeamGraphic;
    timeRemainingSeconds;
    countdownEvent;
    hasTriggeredGameOver;
    difficulty;
    showHints;
    duskStonePlacedOnDial;
    duskStoneCharged;
    duskStonePlacedOnSarcophagus;
    ouestCenterSlotText;
    sudStoneCollectible;
    sarcophagusSocketText;
    sarcophagusPowerOval;
    hubSarcophagusLid;
    sudWeightTexts;
    gameMusicEvent;
    gameDroneEvent;
    centreIntroPlayed;
    centreIntroPlaying;
    centreScarabChallengeStarted;
    centreScarabChallengeCompleted;
    centreScarabTotal;
    centreScarabsRemaining;
    centreScarabNodes;
    centreScarabArena;
    centreCounterText;
    centreDescendButton;
    centreDescendText;
    centreShoeCursor;
    centreScarabTickEvent;
    inLowerLevel;
    phase2RelicsCollected;
    phase2SphinxSolved;
    phase2SphinxOrder;
    phase2OrderText;
    phase2CenterStatusText;
    phase2OrderPanelNodes;
    phase2CollectedText;
    phase2OracleVisionSolved;
    phase2SphinxUnlockHandler;
    phase2SphinxAskedQuestionIndexes;
    phase2HubGate;
    phase2HubGateInner;
    phase2HubGateActivationDisk;
    phase2PortalActivated;
    phase2PortalReady;
    helpOverlayNodes;

    constructor ()
    {
        super('Game');
        this.resetRuntimeState();
        this.phase2NordClueText = null;
        this.phase2NordWallSolved = false;
    }

    resetRuntimeState ()
    {
        this.centreScarabTickEvent?.remove(false);
        this.centreScarabTickEvent = null;

        this.currentRoom = 'hub';
        this.rooms = {
            hub: [], est: [], nord: [], sud: [], ouest: [], centre: [],
            hub2: [], est2: [], nord2: [], sud2: [], ouest2: [], centre2: []
        };
        this.solvedIndicators = {};
        this.sealOrder = [];
        this.sealTarget = ['LEVANT', 'MIDI', 'COUCHANT', 'ZENITH'];
        this.dialValues = [0, 0, 0];
        this.dialTargets = [2, 1, 3];
        this.selectedOfferings = new Set();
        this.mirrorStates = [0, 0, 0, 0];
        this.mirrorTargets = [1, 0, 1, 1];
        this.puzzlesSolved = { est: false, nord: false, sud: false, ouest: false };
        this.ouestBeamPlaying = false;
        this.ouestBeamGraphic = null;
        this.timeRemainingSeconds = 60 * 60;
        this.countdownEvent = null;
        this.hasTriggeredGameOver = false;
        this.difficulty = DIFFICULTY.NORMAL;
        this.showHints = true;
        this.duskStonePlacedOnDial = false;
        this.duskStoneCharged = false;
        this.duskStonePlacedOnSarcophagus = false;
        this.ouestCenterSlotText = null;
        this.sudStoneCollectible = null;
        this.sarcophagusSocketText = null;
        this.sarcophagusPowerOval = null;
        this.hubSarcophagusLid = null;
        this.sudWeightTexts = [];
        this.gameMusicEvent = null;
        this.gameDroneEvent = null;
        this.centreIntroPlayed = false;
        this.centreIntroPlaying = false;
        this.centreScarabChallengeStarted = false;
        this.centreScarabChallengeCompleted = false;
        this.centreScarabTotal = 0;
        this.centreScarabsRemaining = 0;
        this.centreScarabNodes = [];
        this.centreScarabArena = null;
        this.centreCounterText = null;
        this.centreDescendButton = null;
        this.centreDescendText = null;
        this.centreShoeCursor = null;
        this.inLowerLevel = false;
        this.phase2RelicsCollected = new Set();
        this.phase2SphinxSolved = false;
        this.phase2SphinxOrder = [];
        this.phase2OrderText = null;
        this.phase2CenterStatusText = null;
        this.phase2OrderPanelNodes = [];
        this.phase2CollectedText = null;
        this.phase2OracleVisionSolved = false;
        this.phase2SphinxUnlockHandler = null;
        this.phase2SphinxAskedQuestionIndexes = new Set();
        this.phase2HubGate = null;
        this.phase2HubGateInner = null;
        this.phase2HubGateActivationDisk = null;
        this.phase2PortalActivated = false;
        this.phase2PortalReady = false;
        this.helpOverlayNodes = [];
        this.debugHotspots = false;
        this.phase2DebugZones = [];
        this.phase2NordClueText = null;
        this.phase2NordWallSolved = false;
    }

    init (data)
    {
        // Scene instances are reused between runs, so gameplay state must be reset on each start.
        this.resetRuntimeState();

        const configured = data?.difficulty ?? this.registry.get('difficulty') ?? DIFFICULTY.NORMAL;
        this.difficulty = normalizeDifficulty(configured);
        this.timeRemainingSeconds = this.getInitialTimeSecondsByDifficulty();
        this.showHints = true;
        this.registry.set('difficulty', this.difficulty);
    }

    getInitialTimeSecondsByDifficulty ()
    {
        if (this.difficulty === DIFFICULTY.EASY) return 30 * 60;
        if (this.difficulty === DIFFICULTY.HARD) return 90 * 60;
        return 60 * 60;
    }

    getPaidHelpCostMinutes ()
    {
        if (this.difficulty === DIFFICULTY.EASY) return 3;
        if (this.difficulty === DIFFICULTY.HARD) return 8;
        return 5;
    }

    create ()
    {
        const w = this.scale.width;
        const h = this.scale.height;

        this.drawChamber(w, h);

        // Toggle du mode debug avec la touche D
        this.input.keyboard.on('keydown-D', () => {
            this.debugHotspots = !this.debugHotspots;
            if (this.currentRoom === 'nord2') {
                this.clearPhase2DebugZones();
                if (this.debugHotspots) {
                    this.drawPhase2PapyrusDebugZones();
                }
            }
            const msg = this.debugHotspots ? 'Mode DEBUG ACTIVÉ' : 'Mode DEBUG DÉSACTIVÉ';
            this.updateMessage(msg);
        });

        // ------------------------------------------------------------
        this.add.text(w / 2, 42, 'Chambre Funeraire d\'Hatchepsout', {
            fontFamily: 'Georgia', fontSize: 32, color: '#f5d7a0',
            stroke: '#25180d', strokeThickness: 5
        }).setOrigin(0.5).setDepth(10);

        this.messageText = this.add.text(w / 2, 660, 'Choisis une direction pour explorer.', {
            fontFamily: 'Georgia', fontSize: 19, color: '#f7d392', align: 'center'
        }).setOrigin(0.5).setDepth(10).setVisible(this.showHints);

        this.crystalHintGlyphsText = this.add.text(w / 2, 628, '', {
            fontFamily: 'Georgia', fontSize: 57, color: '#f7d392', align: 'center'
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        this.progressText = this.add.text(w / 2, 700, 'Enigmes resolues: 0 / 4', {
            fontFamily: 'Georgia', fontSize: 17, color: '#d9efae'
        }).setOrigin(0.5).setDepth(10);

        this.timerText = this.add.text(w - 48, 42, '', {
            fontFamily: 'Georgia', fontSize: 22, color: '#f7d392', align: 'right',
            stroke: '#25180d', strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(10);
        this.updateTimerText();

        this.exitButton = this.add.rectangle(w / 2, 650, 240, 44, 0x384024, 0.85)
            .setStrokeStyle(2, 0xc7d178)
            .setInteractive({ useHandCursor: true })
            .setVisible(false).setDepth(11);
        this.exitText = this.add.text(w / 2, 650, 'Ouvrir la sortie', {
            fontFamily: 'Georgia', fontSize: 22, color: '#e7f0b0'
        }).setOrigin(0.5).setVisible(false).setDepth(12);
        this.exitButton.on('pointerdown', () => {
            this.playSfx('victory');
            this.stopCountdown();
            this.stopGameMusic();
            this.scene.start('GameOver', { outcome: 'success', timeRemainingSeconds: this.timeRemainingSeconds });
        });
        this.exitButton.on('pointerover', () => {
            this.exitButton.setFillStyle(0x4a5731, 0.95);
            this.exitText.setColor('#f6ffd1');
        });
        this.exitButton.on('pointerout', () => {
            this.exitButton.setFillStyle(0x384024, 0.85);
            this.exitText.setColor('#e7f0b0');
        });

        this.inventory = new InventoryManager(this);
        this.startGameMusic();
        this.input.off('pointermove', this.handleCentrePointerMove, this);
        this.input.on('pointermove', this.handleCentrePointerMove, this);
        this.events.once('shutdown', () => {
            this.stopGameMusic();
            this.input.off('pointermove', this.handleCentrePointerMove, this);
            this.centreScarabTickEvent?.remove(false);
            this.centreScarabTickEvent = null;
        });
        this.events.once('destroy', () => {
            this.stopGameMusic();
            this.input.off('pointermove', this.handleCentrePointerMove, this);
            this.centreScarabTickEvent?.remove(false);
            this.centreScarabTickEvent = null;
        });

        // ------------------------------------------------------------
        this.buildHubView(w, h);
        this.buildRoomEst(w, h);
        this.buildRoomNord(w, h);
        this.buildRoomSud(w, h);
        this.buildRoomOuest(w, h);
        this.buildRoomCentre(w, h);
        this.buildLowerLevelHub(w, h);
        this.buildLowerLevelNord(w, h);
        this.buildLowerLevelSud(w, h);
        this.buildLowerLevelEst(w, h);
        this.buildLowerLevelOuest(w, h);
        this.buildLowerLevelCentre(w, h);

        this.showRoom('hub');
        this.startCountdown();

        EventBus.emit('current-scene-ready', this);
    }

    startCountdown ()
    {
        this.stopCountdown();
        this.countdownEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.hasTriggeredGameOver) return;
                this.timeRemainingSeconds = Math.max(0, this.timeRemainingSeconds - 1);
                this.updateTimerText();
                if (this.timeRemainingSeconds <= 0)
                {
                    this.triggerCollapseGameOver();
                }
            }
        });
    }

    stopCountdown ()
    {
        if (this.countdownEvent)
        {
            this.countdownEvent.remove(false);
            this.countdownEvent = null;
        }
    }

    updateTimerText ()
    {
        const minutes = Math.floor(this.timeRemainingSeconds / 60);
        const seconds = this.timeRemainingSeconds % 60;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        if (this.timerText)
        {
            this.timerText.setText('Temps restant: ' + mm + ':' + ss);
        }
    }

    triggerCollapseGameOver ()
    {
        if (this.hasTriggeredGameOver) return;
        this.hasTriggeredGameOver = true;
        this.stopCountdown();
        this.stopGameMusic();
        this.scene.start('GameOver', { outcome: 'collapse', timeRemainingSeconds: this.timeRemainingSeconds });
    }

    playTone (frequency, duration = 0.2, type = 'sine', volume = 0.035)
    {
        const ctx = this.sound?.context;
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.03);
    }

    playSfx (name)
    {
        if (name === 'pickup')
        {
            this.playTone(740, 0.11, 'triangle', 0.05);
            this.time.delayedCall(80, () => this.playTone(988, 0.14, 'triangle', 0.045));
            return;
        }
        if (name === 'place')
        {
            this.playTone(240, 0.18, 'sine', 0.05);
            return;
        }
        if (name === 'openNote')
        {
            this.playTone(523, 0.16, 'triangle', 0.04);
            this.time.delayedCall(95, () => this.playTone(659, 0.2, 'triangle', 0.035));
            return;
        }
        if (name === 'closeNote')
        {
            this.playTone(659, 0.14, 'triangle', 0.03);
            this.time.delayedCall(70, () => this.playTone(440, 0.15, 'triangle', 0.03));
            return;
        }
        if (name === 'solve')
        {
            this.playTone(392, 0.17, 'triangle', 0.04);
            this.time.delayedCall(110, () => this.playTone(523, 0.2, 'triangle', 0.04));
            this.time.delayedCall(220, () => this.playTone(659, 0.25, 'triangle', 0.04));
            return;
        }
        if (name === 'victory')
        {
            this.playTone(523, 0.18, 'triangle', 0.045);
            this.time.delayedCall(120, () => this.playTone(659, 0.22, 'triangle', 0.045));
            this.time.delayedCall(250, () => this.playTone(784, 0.35, 'triangle', 0.045));
            return;
        }
        if (name === 'portalVictory')
        {
            this.playTone(392, 0.2, 'sine', 0.04);
            this.time.delayedCall(120, () => this.playTone(523, 0.22, 'triangle', 0.045));
            this.time.delayedCall(250, () => this.playTone(659, 0.26, 'triangle', 0.045));
            this.time.delayedCall(410, () => this.playTone(784, 0.4, 'sine', 0.05));
        }
    }

    startGameMusic ()
    {
        const melody = [147, 165, 147, 131, 147, 196, 175, 147];
        let m = 0;
        this.gameMusicEvent = this.time.addEvent({
            delay: 1400,
            loop: true,
            callback: () => {
                this.playTone(melody[m % melody.length], 1.0, 'triangle', 0.022);
                m++;
            }
        });

        const drone = [73, 82, 73, 65];
        let d = 0;
        this.gameDroneEvent = this.time.addEvent({
            delay: 2800,
            loop: true,
            callback: () => {
                this.playTone(drone[d % drone.length], 1.7, 'sine', 0.017);
                d++;
            }
        });
    }

    stopGameMusic ()
    {
        if (this.gameMusicEvent)
        {
            this.gameMusicEvent.remove(false);
            this.gameMusicEvent = null;
        }
        if (this.gameDroneEvent)
        {
            this.gameDroneEvent.remove(false);
            this.gameDroneEvent = null;
        }
    }

    // ------------------------------------------------------------
    // Dessin de la chambre (decor persistant)
    // ------------------------------------------------------------

    drawChamber (width, height)
    {
        this.cameras.main.setBackgroundColor('#060402');

        const g = this.add.graphics();

        // Plafond
        g.fillGradientStyle(0x0b1520, 0x0c1825, 0x1c1408, 0x1c1408, 1);
        g.fillRect(0, 0, width, 152);

        // Etoiles deterministes
        for (let i = 0; i < 36; i++)
        {
            const sx = 30 + (i * 31 + i * i * 7) % (width - 60);
            const sy = 8 + (i * 13 + i * 5) % 128;
            g.fillStyle(0xe8ddb0, 0.1 + (i % 6) * 0.07);
            g.fillCircle(sx, sy, (i % 3) * 0.6 + 0.4);
        }

        // Murs en pierre
        g.fillGradientStyle(0x3d2815, 0x3d2815, 0x52361e, 0x52361e, 1);
        g.fillRect(0, 148, width, height - 148);

        // Mur interieur en retrait
        g.fillStyle(0x4a3020, 1);
        g.fillRect(68, 155, width - 136, 452);

        // Assises de briques (deterministes)
        const brickColors = [0x3e2914, 0x472e18, 0x41291a, 0x4c3320];
        for (let row = 0; row < 7; row++)
        {
            const offset = row % 2 === 0 ? 0 : 34;
            for (let col = 0; col < 15; col++)
            {
                const bx = 70 + col * 63 + offset;
                const by = 158 + row * 62;
                if (bx + 58 <= width - 72)
                {
                    g.fillStyle(brickColors[(row + col) % brickColors.length], 0.48);
                    g.fillRect(bx, by, 58, 57);
                    g.fillStyle(0x140c06, 0.3);
                    g.fillRect(bx, by, 58, 2);
                    g.fillRect(bx, by, 2, 57);
                }
            }
        }

        // Sol
        g.fillStyle(0x2a1c0e, 1);
        g.fillRect(68, 605, width - 136, 32);
        for (let col = 0; col < 9; col++)
        {
            g.fillStyle(col % 2 === 0 ? 0x5e3d22 : 0x3d2412, 0.9);
            g.fillRect(70 + col * 99, 607, 96, 28);
            g.fillStyle(0x1a0e08, 0.35);
            g.fillRect(70 + col * 99, 607, 2, 28);
            g.fillRect(70 + col * 99, 607, 96, 2);
        }

        // Bordures en or
        g.fillStyle(0xd4a52e, 1);
        g.fillRect(68, 152, width - 136, 5);
        g.fillRect(68, 604, width - 136, 4);
        g.fillStyle(0xb8901e, 1);
        g.fillRect(68, 152, 5, 452);
        g.fillRect(width - 73, 152, 5, 452);

        // Ornements de coin
        [[73, 157], [width - 107, 157], [73, 588], [width - 107, 588]].forEach(([cx, cy]) => {
            g.fillStyle(0xf0c840, 1);
            g.fillRect(cx, cy, 28, 28);
            g.fillStyle(0x3d2817, 1);
            g.fillRect(cx + 7, cy + 7, 14, 14);
        });

        // Pilastres
        this.drawPilaster(g, 73, 232, 26, 162);
        this.drawPilaster(g, 73, 446, 26, 142);
        this.drawPilaster(g, width - 99, 232, 26, 162);
        this.drawPilaster(g, width - 99, 446, 26, 142);

        // Frise de hieroglyphes
        this.drawHieroglyphFrieze(g, 108, 158, width - 216, 24);

        // Ombre du sarcophage
        g.fillStyle(0x100806, 0.7);
        g.fillEllipse(width / 2, 478, 235, 36);

        // Sarcophage central
        this.drawSarcophage(g, width / 2, 418);

        // Halos de torches (statiques)
        [[140, 268], [398, 202], [628, 202], [885, 268]].forEach(([tx, ty]) => {
            g.fillStyle(0xf79020, 0.065);
            g.fillCircle(tx, ty, 70);
            g.fillStyle(0xf79020, 0.03);
            g.fillCircle(tx, ty, 112);
        });

        // Torches animees
        [[140, 256], [398, 194], [628, 194], [885, 256]].forEach(([tx, ty]) => {
            this.addTorch(tx, ty);
        });
    }

    drawPilaster (g, x, y, w, h)
    {
        g.fillStyle(0x9a7040, 1);
        g.fillRect(x, y, w + 10, 15);
        g.fillGradientStyle(0x7a5530, 0x5e3f22, 0x7a5530, 0x5e3f22, 1);
        g.fillRect(x + 3, y + 15, w, h - 26);
        g.fillStyle(0x9a7040, 1);
        g.fillRect(x, y + h - 11, w + 10, 13);
        g.fillStyle(0x3a2010, 0.4);
        for (let i = 0; i < 3; i++) g.fillRect(x + 3, y + 23 + i * 36, w, 3);
    }

    drawHieroglyphFrieze (g, x, y, w, h)
    {
        g.fillStyle(0x5a3c1e, 0.72);
        g.fillRect(x, y, w, h);
        g.fillStyle(0xd4a52e, 1);
        g.fillRect(x, y, w, 2);
        g.fillRect(x, y + h - 2, w, 2);
        const step = Math.floor(w / 13);
        for (let i = 0; i < 13; i++)
        {
            const sx = x + 10 + i * step;
            g.fillStyle(0xc8922e, 0.48);
            if (i % 4 === 0) g.fillCircle(sx, y + h / 2, 4);
            else if (i % 4 === 1) g.fillRect(sx - 2, y + 3, 5, h - 6);
            else if (i % 4 === 2) g.fillTriangle(sx, y + 2, sx - 5, y + h - 2, sx + 5, y + h - 2);
            else
            {
                g.fillRect(sx - 5, y + h / 2 - 1, 10, 3);
                g.fillRect(sx - 1, y + 3, 3, h - 6);
            }
        }
    }

    drawSarcophage (g, x, y)
    {
        // Socle
        g.fillStyle(0x4a3318, 1);
        g.fillRect(x - 107, y + 57, 214, 19);
        g.fillStyle(0xd4a52e, 1);
        g.fillRect(x - 111, y + 55, 222, 5);
        // Corps
        g.fillGradientStyle(0xb07820, 0x8a5c18, 0xb07820, 0x8a5c18, 1);
        g.fillRect(x - 97, y - 60, 194, 120);
        // Bordure or
        g.fillStyle(0xf0c840, 1);
        g.fillRect(x - 97, y - 60, 194, 4);
        g.fillRect(x - 97, y + 56, 194, 4);
        g.fillRect(x - 97, y - 60, 4, 120);
        g.fillRect(x + 93, y - 60, 4, 120);
        g.fillStyle(0xf0c840, 0.4);
        g.fillRect(x - 87, y - 51, 174, 3);
        g.fillRect(x - 87, y + 47, 174, 3);
        g.fillRect(x - 87, y - 51, 3, 101);
        g.fillRect(x + 84, y - 51, 3, 101);
        // Masque facial
        g.fillStyle(0xd4a030, 1);
        g.fillEllipse(x, y - 6, 88, 106);
        g.fillStyle(0xc8902a, 1);
        g.fillEllipse(x, y - 6, 78, 96);
        // Yeux
        g.fillStyle(0x0a2030, 1);
        g.fillRect(x - 26, y - 28, 20, 7);
        g.fillRect(x + 6, y - 28, 20, 7);
        g.fillStyle(0x40a0c0, 1);
        g.fillRect(x - 22, y - 27, 12, 5);
        g.fillRect(x + 10, y - 27, 12, 5);
        // Barbe
        g.fillStyle(0xd4a030, 1);
        g.fillRect(x - 9, y + 41, 18, 14);
        g.fillStyle(0x1a5078, 1);
        for (let i = 0; i < 3; i++) g.fillRect(x - 7 + i * 6, y + 43, 4, 10);
        // Glyphes lateraux
        g.fillStyle(0xf0c840, 0.28);
        [-72, 58].forEach(ox => {
            for (let i = 0; i < 4; i++) g.fillRect(x + ox, y - 38 + i * 20, 14, 3);
        });
    }

    addTorch (x, y)
    {
        const g = this.add.graphics();
        g.fillStyle(0x3d2510, 1);
        g.fillRect(x - 5, y + 2, 10, 16);
        g.fillRect(x - 9, y, 18, 5);
        g.fillStyle(0xa02808, 1);
        g.fillTriangle(x - 7, y, x + 7, y, x, y - 22);
        g.fillStyle(0xf08020, 1);
        g.fillTriangle(x - 4, y - 2, x + 4, y - 2, x, y - 17);
        g.fillStyle(0xfae050, 1);
        g.fillCircle(x, y - 15, 4);

        const glow = this.add.graphics();
        glow.fillStyle(0xf79020, 0.15);
        glow.fillCircle(x, y - 10, 26);
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.5, to: 1.0 },
            duration: 220 + (x % 88),
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    // ------------------------------------------------------------
    // Navigation par pieces
    // ------------------------------------------------------------

    r (room, obj)
    {
        this.rooms[room].push(obj);
        return obj;
    }

    showRoom (key)
    {
        // Nettoyer les zones de debug quand on quitte nord2
        if (this.currentRoom === 'nord2') {
            this.clearPhase2DebugZones();
        }

        this.currentRoom = key;
        Object.keys(this.rooms).forEach(k => {
            this.rooms[k].forEach(obj => {
                const isCollected = !!obj.getData?.('collected');
                const isLocked = !!obj.getData?.('locked');
                obj.setVisible(k === key && !isCollected && !isLocked);
            });
        });

        if (this.sudWeightTexts.length > 0)
        {
            const canShowSouthWeights = this.difficulty === DIFFICULTY.EASY || this.puzzlesSolved.nord;
            this.sudWeightTexts.forEach(txt => {
                txt.setVisible(key === 'sud' && canShowSouthWeights);
            });
        }

        this.setCentreCursorActive(key === 'centre');
        if (key === 'centre' && this.centreIntroPlayed && !this.centreScarabChallengeStarted && !this.centreScarabChallengeCompleted)
        {
            this.startCentreScarabChallenge();
        }
        if (key === 'ouest2')
        {
            this.phase2SphinxUnlockHandler?.();
        }

        const roomMessages = {
            hub: 'Choisis une direction pour explorer.',
            est: 'Associe chaque symbole visible au bon nom de dieu.',
            nord: 'Decode les equations de reliques pour retrouver leurs poids.',
            sud: 'Choisis les reliques a peser pour atteindre le poids sacre.',
            ouest: 'Râ et le sens des miroirs doivent etre bien positionnes.',
            centre: 'Ecrase tous les scarabees voraces avant qu\'ils ne se dispersent.',
            hub2: 'Clique les elements du decor: sphinx, oeil d\'Horus, papyrus nord, escaliers.',
            nord2: 'Trouve 4 reliques cachees dans les objets du mur nord.',
            sud2: 'Observe la vision de l\'oracle et recompose-la.',
            est2: 'Escalier de retour: c\'est par la que tu es arrivee.',
            ouest2: 'Le Sphinx attend que la vision de l\'oracle soit résolue.',
            centre2: 'Le Chappa\'ai attend les 10 reliques dans le bon ordre.'
        };
        if (key === 'ouest2' && !this.phase2OracleVisionSolved)
        {
            this.updateMessage('Le Sphinx garde le silence. Va au sud et résous la vision de l\'oracle.');
            return;
        }
        this.updateMessage(roomMessages[key] ?? roomMessages.hub);
    }

    // ------------------------------------------------------------

    buildHubView (w, h)
    {
        const cx = w / 2;
        const cy = h / 2;

        this.r('hub', this.add.text(cx, 80, 'Chambre Centrale', {
            fontFamily: 'Georgia', fontSize: 28, color: '#f0d080'
        }).setOrigin(0.5).setDepth(5));

        this.r('hub', this.add.text(cx, 118,
            '"Chaque mur cache un secret. Choisis ta direction, Veronique."', {
                fontFamily: 'Georgia', fontSize: 18, color: '#d9c49a',
                align: 'center', wordWrap: { width: 700 }
            }).setOrigin(0.5).setDepth(5));

        // Fleches de navigation
        this.addNavArrow('hub', cx, 175, 'nord',  '▲  NORD');
        this.addNavArrow('hub', cx, 540, 'sud',   '▼  SUD');
        this.addNavArrow('hub', 820, cy, 'est',   '▶  EST');
        this.addNavArrow('hub', 204, cy, 'ouest', '◀  OUEST');

        // Indicateurs de progression places juste avant chaque fleche
        const dirs = [
            { key: 'nord',  x: cx - 72,  y: 175 },
            { key: 'sud',   x: cx - 72,  y: 540 },
            { key: 'est',   x: 748,      y: cy  },
            { key: 'ouest', x: 132,      y: cy  }
        ];
        dirs.forEach(d => {
            const dot = this.add.text(d.x, d.y, '○', {
                fontFamily: 'Georgia', fontSize: 22, color: '#8a7a5a'
            }).setOrigin(0.5).setDepth(6);
            this.r('hub', dot);
            this.solvedIndicators[d.key] = dot;
        });

        const sarcophagusHit = this.add.rectangle(cx, 418, 232, 156, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);
        sarcophagusHit.on('pointerdown', () => this.handleSarcophagusClick());
        this.r('hub', sarcophagusHit);

        this.sarcophagusSocketText = this.add.text(cx, 442, 'O', {
            fontFamily: 'Georgia', fontSize: 36, color: '#f0d080'
        }).setOrigin(0.5).setDepth(12);
        this.r('hub', this.sarcophagusSocketText);

        this.sarcophagusPowerOval = this.add.ellipse(cx, 442, 86, 54, 0x1e90c8, 0.0)
            .setDepth(11)
            .setStrokeStyle(2, 0x76c8ff, 0.0);
        this.sarcophagusPowerOval.setData('locked', true);
        this.r('hub', this.sarcophagusPowerOval);
        this.updateSarcophagusPowerVisual();

        this.hubSarcophagusLid = this.add.rectangle(cx - 97, 478, 194, 120, 0xb07820, 0.48)
            .setOrigin(0, 1)
            .setStrokeStyle(2, 0xf0c840, 0.65)
            .setDepth(13)
            .setAngle(0);
        this.hubSarcophagusLid.setData('opened', false);
        this.r('hub', this.hubSarcophagusLid);

                // Carnet de Lara (collectible hub)
        this.createCollectible('hub', 940, 160, 'carnet', 'Carnet de Lara', '\u2630',
            `Pour les Égyptiens de l'Antiquité, les deux premiers nombres de l'univers sont le 2 et le 3. Tous les phénomènes, sans exception, possèdent une nature polaire et un principe ternaire. Ainsi, les chiffres 2 et 3 sont les seuls nombres premiers dont dérivent les autres.

"Deux" symbolisent le pouvoir de multiplicité, la femelle, le récipient mutable, tandis que "Trois" symbolisent le mâle. Il s'agissait de la musique des sphères, les harmonies universelles jouées entre les deux symboles universels primordiaux mâle et femelle qu'étaient Osiris et Isis, dont le mariage céleste enfanta leur fils Horus. Plutarque confirme cette sagesse égyptienne dans ses Œuvres morales, Vol. V:

\'En effet "Trois" [Osiris] est le premier nombre impair et parfait; "Quatre" est le carré de "Deux", premier nombre pair["Isis"]; et "Cinq" [Horus], qui est composé de "Trois" et de "Deux", tient à la fois et de son père et de sa mère.\'`);
    }

    addNavArrow (room, x, y, targetRoom, label)
    {
        const bg = this.add.rectangle(x, y, 190, 52, 0x3d2b19, 0.9)
            .setStrokeStyle(2, 0xb07820)
            .setInteractive({ useHandCursor: true }).setDepth(6);
        const txt = this.add.text(x, y, label, {
            fontFamily: 'Georgia', fontSize: 22, color: '#f5d7a0'
        }).setOrigin(0.5).setDepth(7);

        bg.on('pointerover', () => { bg.setFillStyle(0x5a3d1e, 0.95); txt.setColor('#fff3cc'); });
        bg.on('pointerout',  () => { bg.setFillStyle(0x3d2b19, 0.9);  txt.setColor('#f5d7a0'); });
        bg.on('pointerdown', () => this.showRoom(targetRoom));

        this.r(room, bg);
        this.r(room, txt);
    }

    // ------------------------------------------------------------

    buildRoomOverlay (room, w, h, title, clue, backTarget = 'hub')
    {
        const panel = this.add.rectangle(w / 2, h / 2 - 10, w - 100, h - 160, 0x1a0f07, 0.88)
            .setStrokeStyle(3, 0xb07820).setDepth(3);
        this.r(room, panel);

        this.r(room, this.add.text(w / 2, 82, title, {
            fontFamily: 'Georgia', fontSize: 28, color: '#f0d080',
            stroke: '#1a0f07', strokeThickness: 4
        }).setOrigin(0.5).setDepth(8));

        const clueText = this.add.text(w / 2, 126, clue, {
            fontFamily: 'Georgia', fontSize: 16, color: '#d9c49a',
            align: 'center', wordWrap: { width: w - 160 }
        }).setOrigin(0.5).setDepth(8).setVisible(this.showHints);
        this.r(room, clueText);

        const sep = this.add.graphics().setDepth(8);
        sep.fillStyle(0xb07820, 0.6);
        sep.fillRect(80, 152, w - 160, 2);
        this.r(room, sep);

        // Bouton retour
        const backBg = this.add.rectangle(100, 660, 140, 42, 0x2c1c0d, 0.9)
            .setStrokeStyle(2, 0x8a6030).setInteractive({ useHandCursor: true }).setDepth(8);
        const backTxt = this.add.text(100, 660, '◀ Retour', {
            fontFamily: 'Georgia', fontSize: 20, color: '#d4b070'
        }).setOrigin(0.5).setDepth(9);
        backBg.on('pointerover', () => { backBg.setFillStyle(0x42281a, 0.95); backTxt.setColor('#f5d7a0'); });
        backBg.on('pointerout',  () => { backBg.setFillStyle(0x2c1c0d, 0.9);  backTxt.setColor('#d4b070'); });
        backBg.on('pointerdown', () => this.showRoom(backTarget));
        this.r(room, backBg);
        this.r(room, backTxt);
    }

    buildLowerLevelBackdrop (room, w, h)
    {
        const bg = this.add.graphics().setDepth(2);
        bg.fillStyle(0x20140d, 1);
        bg.fillRect(0, 0, w, h);
        bg.fillStyle(0x2b1c11, 1);
        bg.fillRect(56, 136, w - 112, 560);
        bg.fillStyle(0x8f6534, 0.95);
        bg.fillRect(56, 132, w - 112, 4);
        bg.fillRect(56, 696, w - 112, 3);
        this.r(room, bg);
    }

    buildRoomCentre (w, h)
    {
        this.buildRoomOverlay('centre', w, h,
            'CENTRE -- ahhhhh des scarabés voraces',
            '"Ne les laisse pas t\'envahir. Ecrase-les tous."');

        const arenaX = w / 2;
        const arenaY = 394;
        const arenaW = w - 240;
        const arenaH = 430;
        this.centreScarabArena = {
            left: arenaX - arenaW / 2 + 20,
            right: arenaX + arenaW / 2 - 20,
            top: arenaY - arenaH / 2 + 20,
            bottom: arenaY + arenaH / 2 - 20
        };

        const arenaBg = this.add.rectangle(arenaX, arenaY, arenaW, arenaH, 0x130d08, 0.94)
            .setStrokeStyle(3, 0x8c6030)
            .setDepth(8);
        this.r('centre', arenaBg);

        const halfOpenSarcophagus = this.add.rectangle(arenaX, 250, 320, 96, 0x6e4924, 0.94)
            .setStrokeStyle(3, 0xc89a4f)
            .setDepth(9);
        this.r('centre', halfOpenSarcophagus);

        const sarcoLid = this.add.rectangle(arenaX + 88, 218, 250, 42, 0x876032, 0.95)
            .setStrokeStyle(2, 0xd6b16f)
            .setAngle(-18)
            .setDepth(10);
        this.r('centre', sarcoLid);

        const scarabNestGlow = this.add.ellipse(arenaX, 248, 150, 64, 0x2f6826, 0.3)
            .setDepth(10);
        this.r('centre', scarabNestGlow);

        this.centreCounterText = this.add.text(arenaX, 178, 'Scarabes restants: 0 / 0', {
            fontFamily: 'Georgia',
            fontSize: 24,
            color: '#f1dfb8',
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        this.r('centre', this.centreCounterText);

        const objectiveText = this.add.text(arenaX, 622,
            'Objectif: ecrase tous les scarabees en cliquant dessus.', {
                fontFamily: 'Georgia',
                fontSize: 20,
                color: '#e7c88f',
                align: 'center'
            }).setOrigin(0.5).setDepth(10);
        this.r('centre', objectiveText);

        this.centreDescendButton = this.add.rectangle(arenaX + 265, 586, 220, 50, 0x2f4d2b, 0.95)
            .setStrokeStyle(2, 0xb9df99)
            .setInteractive({ useHandCursor: true })
            .setDepth(11)
            .setVisible(false);
        this.centreDescendButton.on('pointerdown', () => {
            this.enterLowerLevel();
        });
        this.centreDescendButton.on('pointerover', () => this.centreDescendButton.setFillStyle(0x3f6939, 0.97));
        this.centreDescendButton.on('pointerout', () => this.centreDescendButton.setFillStyle(0x2f4d2b, 0.95));
        this.r('centre', this.centreDescendButton);

        this.centreDescendText = this.add.text(arenaX + 265, 586, 'Descendre', {
            fontFamily: 'Georgia',
            fontSize: 26,
            color: '#e9ffd8'
        }).setOrigin(0.5).setDepth(12).setVisible(false);
        this.r('centre', this.centreDescendText);

        this.centreShoeCursor = this.add.text(arenaX, arenaY, '👞', {
            fontFamily: 'Segoe UI Emoji',
            fontSize: 32
        }).setDepth(100).setVisible(false);
        this.r('centre', this.centreShoeCursor);
    }

    // ------------------------------------------------------------
    // SALLE EST -- La Sequence du Soleil
    // ------------------------------------------------------------

    buildRoomEst (w, h)
    {
        this.buildRoomOverlay('nord', w, h,
            'NORD -- Calcul des reliques',
            '"Retrouve la valeur numerique de chaque relique."');

        const allArtifactDefs = [
            { letter: 'A', name: 'Amulette',  icon: '◇', value: 7 },
            { letter: 'B', name: 'Masque',    icon: '🎭', value: 2 },
            { letter: 'C', name: 'Sceptre',   icon: '⚚', value: 6 },
            { letter: 'D', name: 'Lotus',     icon: '✿', value: 1 },
            { letter: 'E', name: 'Scarabee',  icon: '🪲', value: 3 },
            { letter: 'F', name: 'Serpent',   icon: '🐍', value: 9 },
            { letter: 'G', name: 'Djed',      icon: '𓊽', value: 0 },
            { letter: 'H', name: 'Plume',     icon: '🪶', value: 4 },
            { letter: 'I', name: 'Ankh',      icon: '☥', value: 5 },
            { letter: 'J', name: 'Couronne',  icon: '👑', value: 8 }
        ];
        const isHardEst = this.difficulty === DIFFICULTY.HARD;
        const artifactDefs = allArtifactDefs.filter(def => isHardEst ? def.value !== 9 : true);
        const byLetter = Object.fromEntries(artifactDefs.map(def => [def.letter, def]));
        const toSymbols = (word) => word.split('').map(letter => byLetter[letter].icon).join('');
        const byValue = Object.fromEntries(artifactDefs.map(def => [def.value, def]));
        const digitsToSymbols = (digits) => digits.split('').map(d => byValue[Number(d)]?.icon ?? '?').join('');

        const equationVisual = isHardEst
            ? [
                `${digitsToSymbols('818')} - ${digitsToSymbols('267')} = ${digitsToSymbols('551')}`,
                '   -       +       -',
                `${digitsToSymbols('240')} + ${digitsToSymbols('111')} = ${digitsToSymbols('351')}`,
                '   =       =       =',
                `${digitsToSymbols('578')} - ${digitsToSymbols('378')} = ${digitsToSymbols('200')}`
            ].join('\n')
            : [
                `${toSymbols('JDD')} - ${toSymbols('CAB')} = ${toSymbols('DEF')}`,
                '   +       -       +',
                `${toSymbols('DGF')} + ${toSymbols('HIJ')} = ${toSymbols('ICA')}`,
                '   =       =       =',
                `${toSymbols('FBG')} - ${toSymbols('BDH')} = ${toSymbols('AGC')}`
            ].join('\n');

        const equationText = this.add.text(w / 2, 250, equationVisual, {
            fontFamily: 'Courier New',
            fontSize: 33,
            color: '#f3dfbb',
            align: 'center',
            lineSpacing: 11
        }).setOrigin(0.5).setDepth(8);
        this.r('nord', equationText);

        const instructionText = this.add.text(w / 2, 375, isHardEst
            ? 'Attribue une valeur (0 a 8) a chaque relique :'
            : 'Attribue une valeur (0 a 9) a chaque relique :', {
            fontFamily: 'Georgia',
            fontSize: 20,
            color: '#f4e6c6',
            align: 'center'
        }).setOrigin(0.5).setDepth(8);
        this.r('nord', instructionText);

        const chosenValues = new Map();
        const rowNodes = new Map();
        let activeMenuNodes = [];
        const easyKnownValues = this.difficulty === DIFFICULTY.EASY
            ? new Map([
                ['E', 3], // Scarabee
                ['I', 5], // Ankh
                ['H', 4], // Plume
                ['J', 8]  // Couronne
            ])
            : new Map();

        const closeNumberMenu = () => {
            activeMenuNodes.forEach(node => node.destroy());
            activeMenuNodes = [];
        };

        const setRowStyle = (node, state) => {
            if (state === 'good')
            {
                node.fieldBg.setFillStyle(0x1f4a2b, 0.98).setStrokeStyle(2, 0x9be2b3);
                node.fieldText.setColor('#d8ffd8');
            }
            else if (state === 'bad')
            {
                node.fieldBg.setFillStyle(0x5a2222, 0.98).setStrokeStyle(2, 0xf1a0a0);
                node.fieldText.setColor('#ffd7d7');
            }
            else
            {
                node.fieldBg.setFillStyle(0x2f3d22, 0.92).setStrokeStyle(2, 0xb9c686);
                node.fieldText.setColor('#eef6c6');
            }
        };

        const evaluateEntries = () => {
            if (this.puzzlesSolved.nord) return;
            if (chosenValues.size < artifactDefs.length)
            {
                this.updateMessage('Renseigne une valeur pour chacune des reliques.');
                rowNodes.forEach(node => setRowStyle(node, 'neutral'));
                return;
            }

            const allGood = artifactDefs.every(def => chosenValues.get(def.letter) === def.value);
            if (allGood)
            {
                rowNodes.forEach(node => {
                    setRowStyle(node, 'good');
                    node.fieldBg.disableInteractive();
                });
                this.markRoomSolved('nord');
                return;
            }

            rowNodes.forEach(node => setRowStyle(node, 'bad'));
            this.updateMessage('Ce n\'est pas la bonne combinaison de valeurs.');
        };

        const openNumberMenu = (letter, x, y) => {
            if (this.puzzlesSolved.nord) return;
            closeNumberMenu();

            const menuWidth = 92;
            const rowHeight = 27;
            const menuHeight = 10 * rowHeight + 10;
            const menuX = Phaser.Math.Clamp(x, 74, w - 74);
            const menuY = Phaser.Math.Clamp(y + 8, 186, h - menuHeight - 26);

            const clickCatcher = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.001)
                .setInteractive()
                .setDepth(19);
            clickCatcher.on('pointerdown', () => closeNumberMenu());
            activeMenuNodes.push(clickCatcher);
            this.r('nord', clickCatcher);

            const panel = this.add.rectangle(menuX, menuY + menuHeight / 2, menuWidth, menuHeight, 0x20160c, 0.97)
                .setStrokeStyle(2, 0xb18f5c)
                .setDepth(20);
            activeMenuNodes.push(panel);
            this.r('nord', panel);

            const maxValue = isHardEst ? 8 : 9;
            for (let value = 0; value <= maxValue; value++)
            {
                const itemY = menuY + 5 + value * rowHeight + rowHeight / 2;
                const itemBg = this.add.rectangle(menuX, itemY, menuWidth - 10, rowHeight - 3, 0x2f3d22, 0.95)
                    .setStrokeStyle(1, 0x98aa6d)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(21);
                const itemText = this.add.text(menuX, itemY, String(value), {
                    fontFamily: 'Georgia', fontSize: 19, color: '#eef6c6', align: 'center'
                }).setOrigin(0.5).setDepth(22);

                itemBg.on('pointerover', () => itemBg.setFillStyle(0x3e5130, 0.98));
                itemBg.on('pointerout', () => itemBg.setFillStyle(0x2f3d22, 0.95));
                itemBg.on('pointerdown', () => {
                    const node = rowNodes.get(letter);
                    if (!node) return;
                    chosenValues.set(letter, value);
                    node.fieldText.setText(String(value));
                    setRowStyle(node, 'neutral');
                    closeNumberMenu();
                    evaluateEntries();
                });

                activeMenuNodes.push(itemBg, itemText);
                this.r('nord', itemBg);
                this.r('nord', itemText);
            }
        };

        artifactDefs.forEach((def, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = w / 2 + (col === 0 ? -235 : 235);
            const y = 425 + row * 46;

            const label = this.add.text(x - 58, y, `${def.icon} ${def.name}`, {
                fontFamily: 'Georgia',
                fontSize: 20,
                color: '#efd9b0',
                align: 'left'
            }).setOrigin(0, 0.5).setDepth(9);

            const fieldBg = this.add.rectangle(x + 122, y, 64, 32, 0x2f3d22, 0.92)
                .setStrokeStyle(2, 0xb9c686)
                .setInteractive({ useHandCursor: true })
                .setDepth(9);

            const fieldText = this.add.text(x + 122, y, '?', {
                fontFamily: 'Georgia',
                fontSize: 21,
                color: '#eef6c6',
                align: 'center'
            }).setOrigin(0.5).setDepth(10);

            fieldBg.on('pointerdown', () => openNumberMenu(def.letter, x + 122, y + 18));

            rowNodes.set(def.letter, { fieldBg, fieldText, def });

            if (easyKnownValues.has(def.letter))
            {
                const value = easyKnownValues.get(def.letter);
                chosenValues.set(def.letter, value);
                fieldText.setText(String(value));
                fieldBg.disableInteractive();
                setRowStyle({ fieldBg, fieldText }, 'good');
            }

            this.r('nord', label);
            this.r('nord', fieldBg);
            this.r('nord', fieldText);
        });

        // Tablette collectible
        this.createCollectible('nord', w - 120, 220, 'cristal', 'Tablette du scribe Otis', '▭',
            'La numeration egyptienne est le systeme de numeration employe dans l\'Egypte antique d\'environ 3000 av. J.-C. jusqu\'au debut du premier millenaire apr. J.-C. C\'est un systeme decimal, mais dans lequel zero n\'existe pas. Chaque ordre de grandeur (unites, dizaines, centaines, etc.) possede un signe repete le nombre de fois necessaire. Autrement dit, il s\'agit d\'un systeme additif et non pas d\'un systeme de position.\n\n'
            + 'Unites: ' + HIERO_ONE + '\n'
            + 'Dizaines: ' + HIERO_TEN + '\n'
            + 'Centaines: ' + HIERO_HUNDRED + '\n'
            + 'Milliers: ' + HIERO_THOUSAND + '\n'
            + 'Dix-milliers: ' + HIERO_TEN_THOUSAND + '\n'
            + 'Cent-milliers: ' + HIERO_HUNDRED_THOUSAND + '\n'
            + 'Millions: ' + HIERO_MILLION + '\n\n'
            + 'Exemple 2026: '
            + HIERO_THOUSAND + HIERO_THOUSAND
            + HIERO_TEN + HIERO_TEN
            + HIERO_ONE + HIERO_ONE + HIERO_ONE + HIERO_ONE + HIERO_ONE + HIERO_ONE);
    }

    // ------------------------------------------------------------
    // SALLE NORD -- Les Goa'ulds
    // ------------------------------------------------------------

    buildRoomNord (w, h)
    {
        this.buildRoomOverlay('est', w, h,
            'EST -- Les "faux" dieux',
            '"Jaffa cri!"');

        const targetCount = this.difficulty === DIFFICULTY.EASY
            ? 3
            : this.difficulty === DIFFICULTY.NORMAL
            ? 6
                : 9;

        const fixedIds = ['ra', 'apophis'];
        const fixed = NORD_DEITIES.filter(d => fixedIds.includes(d.id));
        const randomPool = this.shuffleArray(NORD_DEITIES.filter(d => !fixedIds.includes(d.id)));
        const picked = randomPool.slice(0, Math.max(0, targetCount - fixed.length));
        const challengeDeities = this.shuffleArray([...fixed, ...picked]);
        const nameChoices = this.shuffleArray(challengeDeities.map(d => d.name));

        const symbolNodes = new Map();
        const chosenNames = new Map();
        let activeMenuNodes = [];

        const isHardNord = targetCount === 9;
        const symbolCols = Math.min(3, challengeDeities.length);
        const symbolSpacingX = targetCount <= 5 ? 240 : 220;
        const symbolSpacingY = targetCount === 5 ? 230 : (targetCount === 6 ? 250 : (targetCount <= 5 ? 190 : 170));
        const symbolStartX = w / 2 - ((symbolCols - 1) * symbolSpacingX) / 2;
        const symbolStartY = isHardNord ? 220 : (challengeDeities.length > 6 ? 230 : 260);
        const hardRows = [4, 5];
        const hardSpacingX = 190;
        const hardRowSpacingY = 240;
        const tileW = targetCount <= 5 ? 190 : 170;
        const tileH = targetCount <= 5 ? 164 : 146;
        const glyphW = targetCount <= 5 ? 176 : 156;
        const glyphH = targetCount <= 5 ? 136 : 118;
        const fieldOffsetY = targetCount <= 5 ? 118 : 108;

        const closeNameMenu = () => {
            activeMenuNodes.forEach(node => node.destroy());
            activeMenuNodes = [];
        };

        const setFieldStyle = (node, state) => {
            if (state === 'good')
            {
                node.fieldBg.setFillStyle(0x1f4a2b, 0.98).setStrokeStyle(2, 0x9be2b3);
                node.fieldText.setColor('#d8ffd8');
            }
            else if (state === 'bad')
            {
                node.fieldBg.setFillStyle(0x5a2222, 0.98).setStrokeStyle(2, 0xf1a0a0);
                node.fieldText.setColor('#ffd7d7');
            }
            else
            {
                node.fieldBg.setFillStyle(0x2f3d22, 0.92).setStrokeStyle(2, 0xb9c686);
                node.fieldText.setColor('#eef6c6');
            }
        };

        const evaluateAnswers = () => {
            if (this.puzzlesSolved.est) return;
            if (chosenNames.size < challengeDeities.length)
            {
                this.updateMessage('Renseigne un nom sous chaque symbole.');
                symbolNodes.forEach(node => {
                    setFieldStyle(node, 'neutral');
                });
                return;
            }

            const allGood = Array.from(symbolNodes.entries())
                .every(([id, node]) => chosenNames.get(id) === node.deity.name);

            if (allGood)
            {
                symbolNodes.forEach(node => {
                    setFieldStyle(node, 'good');
                    node.tile.setFillStyle(0x1f4a2b, 0.98).setStrokeStyle(3, 0x9be2b3);
                    node.fieldBg.disableInteractive();
                });
                this.markRoomSolved('est');
            }
            else
            {
                symbolNodes.forEach(node => {
                    setFieldStyle(node, 'bad');
                    node.tile.setFillStyle(0x3e2b18, 0.95).setStrokeStyle(3, 0xc29d67);
                });
                this.updateMessage('Ce n\'est pas la bonne combinaison.');
            }
        };

        const openNameMenu = (symbolId, x, y) => {
            if (this.puzzlesSolved.est) return;
            closeNameMenu();

            const menuWidth = 190;
            const rowHeight = 34;
            const menuHeight = nameChoices.length * rowHeight + 10;
            const menuX = Phaser.Math.Clamp(x, 100, w - 100);
            const menuY = Phaser.Math.Clamp(y + 8, 190, h - menuHeight - 30);

            const clickCatcher = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.001)
                .setInteractive()
                .setDepth(19);
            clickCatcher.on('pointerdown', () => closeNameMenu());
            activeMenuNodes.push(clickCatcher);
            this.r('est', clickCatcher);

            const panel = this.add.rectangle(menuX, menuY + menuHeight / 2, menuWidth, menuHeight, 0x20160c, 0.97)
                .setStrokeStyle(2, 0xb18f5c)
                .setDepth(20);
            activeMenuNodes.push(panel);
            this.r('est', panel);

            nameChoices.forEach((name, idx) => {
                const itemY = menuY + 5 + idx * rowHeight + rowHeight / 2;
                const itemBg = this.add.rectangle(menuX, itemY, menuWidth - 10, rowHeight - 3, 0x2f3d22, 0.95)
                    .setStrokeStyle(1, 0x98aa6d)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(21);
                const itemTxt = this.add.text(menuX, itemY, name, {
                    fontFamily: 'Georgia', fontSize: 20, color: '#eef6c6', align: 'center'
                }).setOrigin(0.5).setDepth(22);

                itemBg.on('pointerover', () => itemBg.setFillStyle(0x3e5130, 0.98));
                itemBg.on('pointerout', () => itemBg.setFillStyle(0x2f3d22, 0.95));
                itemBg.on('pointerdown', () => {
                    const node = symbolNodes.get(symbolId);
                    if (!node) return;
                    chosenNames.set(symbolId, name);
                    node.fieldText.setText(name);
                    setFieldStyle(node, 'neutral');
                    closeNameMenu();
                    evaluateAnswers();
                });

                activeMenuNodes.push(itemBg, itemTxt);
                this.r('est', itemBg);
                this.r('est', itemTxt);
            });
        };

        challengeDeities.forEach((deity, idx) => {
            let x;
            let y;
            if (isHardNord)
            {
                const row = idx < hardRows[0] ? 0 : 1;
                const col = row === 0 ? idx : idx - hardRows[0];
                const rowCount = hardRows[row];
                const rowStartX = w / 2 - ((rowCount - 1) * hardSpacingX) / 2;
                x = rowStartX + col * hardSpacingX;
                y = symbolStartY + row * hardRowSpacingY;
            }
            else
            {
                const col = idx % symbolCols;
                const row = Math.floor(idx / symbolCols);
                x = symbolStartX + col * symbolSpacingX;
                y = symbolStartY + row * symbolSpacingY;
            }

            const tile = this.add.rectangle(x, y, tileW, tileH, 0x3e2b18, 0.95)
                .setStrokeStyle(3, 0xc29d67)
                .setDepth(8);
            const glyph = this.add.image(x, y - 10, deity.textureKey)
                .setDisplaySize(glyphW, glyphH)
                .setOrigin(0.5)
                .setDepth(9);
            const fieldBg = this.add.rectangle(x, y + fieldOffsetY, tileW, 42, 0x2f3d22, 0.92)
                .setStrokeStyle(2, 0xb9c686)
                .setInteractive({ useHandCursor: true })
                .setDepth(9);
            const fieldText = this.add.text(x, y + fieldOffsetY, '', {
                fontFamily: 'Georgia', fontSize: 20, color: '#eef6c6', align: 'center'
            }).setOrigin(0.5).setDepth(10);

            fieldBg.on('pointerdown', () => {
                openNameMenu(deity.id, x, y + fieldOffsetY + 20);
            });

            symbolNodes.set(deity.id, { tile, fieldBg, fieldText, deity });
            this.r('est', tile);
            this.r('est', glyph);
            this.r('est', fieldBg);
            this.r('est', fieldText);
        });

        // Amulette collectible
        this.createCollectible('est', w - 120, 220, 'amulette', 'Amulette Stellaire', '◇',
            '"Rê (ou Râ) est le dieu Soleil dans la mythologie égyptienne, créateur de l\'univers. Il peut apparaître sous plusieurs formes, dont celle de Khépri, le scarabée bousier : symbolisant la naissance ou la renaissance ou encore Atoum, l\'être achevé (le clergé égyptien expliquait que l\'astre solaire pouvait revêtir des formes différentes lors de sa course dans le ciel : Khépri était le soleil levant tandis que Rê était le soleil à son zénith et Atoum, le soleil couchant). Au fil du temps, Atoum est assimilé progressivement par les théologiens égyptiens à la forme de Rê, de sorte que l\'on parle de Rê-Atoum, le dieu créateur, qui préside la Grande Ennéade constituée des neuf dieux principaux. Son œil est considéré comme une extension de son pouvoir. Bien que l\'Œil de Râ reflète bon nombre des mêmes concepts que l\'Œil d\'Horus, il comporte également un aspect de danger et de violence (la chaleur et la colère du soleil). L\'œil de Râ se distingue en ce qu\'il s\'agit de l\'œil droit plutôt que de l\'œil gauche."');
    }

    shuffleArray (arr)
    {
        const out = [...arr];
        for (let i = out.length - 1; i > 0; i--)
        {
            const j = Phaser.Math.Between(0, i);
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    // ------------------------------------------------------------
    // SALLE SUD -- La Balance d'Anubis
    // ------------------------------------------------------------

    buildRoomSud (w, h)
    {
        const isEasy = this.difficulty === DIFFICULTY.EASY;
        const showSouthWeights = isEasy || this.puzzlesSolved.nord;
        const targetWeight = isEasy ? 12 : 20;
        const targetGlyph = HIERO_TEN.repeat(Math.floor(targetWeight / 10)) + HIERO_ONE.repeat(targetWeight % 10);
        this.sudWeightTexts = [];

        this.buildRoomOverlay('sud', w, h,
            'SUD -- La Balance d\'Anubis',
            '');

        const sudCluePrefix = this.add.text(w / 2, 126,
            (isEasy
                ? '"Trois reliques de vie pour un poids sacré de"'
                : '"Mets X reliques dans la balance (X étant l\'un des deux premiers nombres de l\'univers, le plus \'parfait\') pour atteindre le poids sacré de"'), {
                fontFamily: 'Georgia', fontSize: 16, color: '#d9c49a',
                align: 'center', wordWrap: { width: w - 200 }
            }).setOrigin(0.5).setDepth(8);
        const sudClueNumber = this.add.text(w / 2, 168, targetGlyph, {
            fontFamily: 'Georgia', fontSize: 60, color: '#d9c49a'
        }).setOrigin(0.5).setDepth(8);
        sudCluePrefix.setVisible(this.showHints && isEasy);
        sudClueNumber.setVisible(this.showHints && isEasy);
        this.r('sud', sudCluePrefix);
        this.r('sud', sudClueNumber);

        const offerings = isEasy ? [
            { name: 'Scarabee', icon: '🪲', value: 3, glyph: HIERO_ONE.repeat(3) },
            { name: 'Plume',    icon: '🪶', value: 4, glyph: HIERO_ONE.repeat(4) },
            { name: 'Couronne', icon: '👑', value: 8, glyph: HIERO_ONE.repeat(8) },
            { name: 'Ankh',     icon: '☥',  value: 5, glyph: HIERO_ONE.repeat(5) }
        ] : [
            { name: 'Scarabee', icon: '🪲', value: 3, glyph: HIERO_ONE.repeat(3) },
            { name: 'Plume',    icon: '🪶', value: 4, glyph: HIERO_ONE.repeat(4) },
            { name: 'Couronne', icon: '👑', value: 8, glyph: HIERO_ONE.repeat(8) },
            { name: 'Ankh',     icon: '☥',  value: 5, glyph: HIERO_ONE.repeat(5) },
            { name: 'Lotus',    icon: '✿',  value: 1, glyph: HIERO_ONE },
            { name: 'Sceptre',  icon: '⚚',  value: 6, glyph: HIERO_ONE.repeat(6) },
            { name: 'Masque',   icon: '🎭', value: 2, glyph: HIERO_ONE.repeat(2) },
            { name: 'Amulette', icon: '◇',  value: 7, glyph: HIERO_ONE.repeat(7) }
        ];
        const spacing = offerings.length > 4 ? 112 : 140;
        const startX = w / 2 - ((offerings.length - 1) * spacing) / 2;

        offerings.forEach((o, idx) => {
            const bx = startX + idx * spacing;
            const by = 370;
            const tile = this.add.rectangle(bx, by, offerings.length > 4 ? 96 : 120, 130, 0x4a321f, 0.9)
                .setStrokeStyle(2, 0xb18f5c).setInteractive({ useHandCursor: true }).setDepth(8);
            const iconTxt = this.add.text(bx, by - 24, o.icon, {
                fontFamily: 'Arial', fontSize: 28
            }).setOrigin(0.5).setDepth(9);
            const nameTxt = this.add.text(bx, by + 16, o.name, {
                fontFamily: 'Georgia', fontSize: 15, color: '#efd9b0'
            }).setOrigin(0.5).setDepth(9);
            const valTxt = this.add.text(bx, by + 14, o.glyph, {
                fontFamily: 'Georgia', fontSize: 84, color: '#f0c97f'
            }).setOrigin(0.5).setDepth(9).setVisible(showSouthWeights);

            tile.on('pointerover', () => {
                if (!this.selectedOfferings.has(idx) && !this.puzzlesSolved.sud)
                    tile.setFillStyle(0x5a3f27, 0.93);
            });
            tile.on('pointerout', () => {
                if (!this.selectedOfferings.has(idx) && !this.puzzlesSolved.sud)
                    tile.setFillStyle(0x4a321f, 0.9);
            });
            tile.on('pointerdown', () => {
                if (this.puzzlesSolved.sud) return;
                if (this.selectedOfferings.has(idx))
                {
                    this.selectedOfferings.delete(idx);
                    tile.setFillStyle(0x4a321f, 0.9);
                }
                else
                {
                    this.selectedOfferings.add(idx);
                    tile.setFillStyle(0x6a4b2f, 0.95);
                }
                let total = 0;
                this.selectedOfferings.forEach(i => { total += offerings[i].value; });
                const selectedCount = this.selectedOfferings.size;
                const easySolved = isEasy && total === targetWeight && selectedCount === 3;
                const normalSolved = !isEasy && total === targetWeight;
                if (easySolved || normalSolved)
                {
                    this.markRoomSolved('sud');
                    this.updateMessage('Balance equilibree!');
                }
                else if (isEasy && total === targetWeight)
                {
                    this.updateMessage('Poids ' + total + ': il faut exactement 3 reliques pour valider.');
                }
                else if (isEasy && total > targetWeight)
                {
                    this.updateMessage('Poids ' + total + ': trop lourd pour la balance.');
                }
                else if (isEasy)
                {
                    this.updateMessage('Poids ' + total + ': la mesure sacree vise ' + targetWeight + '.');
                }
                else
                {
                    this.updateMessage('La balance reagit, mais l\'equilibre sacre n\'est pas encore atteint.');
                }
            });
            this.r('sud', tile);
            this.r('sud', iconTxt);
            this.r('sud', nameTxt);
            this.r('sud', valTxt);
            this.sudWeightTexts.push(valTxt);
        });

        this.sudStoneCollectible = this.createCollectible(
            'sud',
            w / 2,
            622,
            'pierre_crepuscule_brute',
            'Coeur d\'Atoum',
            '○',
            'Un coeur froid est un coeur sans vie.'
        );

        if (this.sudStoneCollectible)
        {
            this.sudStoneCollectible.glow.setData('locked', true);
            this.sudStoneCollectible.bg.setData('locked', true);
            this.sudStoneCollectible.iconText.setData('locked', true);
            this.sudStoneCollectible.glow.setVisible(false);
            this.sudStoneCollectible.bg.setVisible(false).disableInteractive();
            this.sudStoneCollectible.iconText.setVisible(false);
        }
    }

    // ------------------------------------------------------------
    // SALLE OUEST -- Les Miroirs amplificateurs
    // ------------------------------------------------------------

    buildRoomOuest (w, h)
    {
        this.buildRoomOverlay('ouest', w, h,
            'OUEST -- Les Miroirs amplificateurs',
            '"La bénédiction de Rê à chaque instant de la journée"');

        const cx = w / 2;
        const cy = 612;
        const radius = (w - 200) / 2;
        const notchCount = 12;
        const sundialValues = Array.from({ length: notchCount }, (_, i) => 8 + i);
        const labels = [];
        const notchTargets = [];

        const isEasyOuest = this.difficulty === DIFFICULTY.EASY;

        const toHieroglyphNumber = (n) => {
            const tens = Math.floor(n / 10);
            const ones = n % 10;
            return HIERO_TEN.repeat(tens) + HIERO_ONE.repeat(ones);
        };

        const dial = this.add.graphics().setDepth(10);
        dial.lineStyle(5, 0xba9862, 1);
        dial.beginPath();
        dial.arc(cx, cy, radius, Math.PI, 0, false);
        dial.strokePath();
        this.r('ouest', dial);

        const ticks = this.add.graphics().setDepth(10);
        ticks.lineStyle(3, 0xd4b078, 1);
        this.r('ouest', ticks);

        sundialValues.forEach((value, i) => {
            const t = i / (notchCount - 1);
            const angle = Math.PI - t * Math.PI;

            const x1 = cx + Math.cos(angle) * (radius - 18);
            const y1 = cy - Math.sin(angle) * (radius - 18);
            const x2 = cx + Math.cos(angle) * (radius + 12);
            const y2 = cy - Math.sin(angle) * (radius + 12);

            ticks.beginPath();
            ticks.moveTo(x1, y1);
            ticks.lineTo(x2, y2);
            ticks.strokePath();

            const lx = cx + Math.cos(angle) * (radius + 62);
            const ly = cy - Math.sin(angle) * (radius + 62);
            const labelText = isEasyOuest ? (value + 'h') : toHieroglyphNumber(value);
            const label = this.add.text(lx, ly, labelText, {
                fontFamily: 'Georgia', fontSize: isEasyOuest ? 30 : 40, color: '#f1e0bf'
            }).setOrigin(0.5).setDepth(11);
            this.r('ouest', label);
            labels.push(label);

            const hit = this.add.circle(x2, y2, 20, 0xffffff, 0.001)
                .setInteractive({ useHandCursor: true }).setDepth(11);
            hit.on('pointerdown', () => {
                if (this.puzzlesSolved.ouest) return;
                setDialIndex(i);
            });
            this.r('ouest', hit);
            notchTargets.push({ x: x2, y: y2, angle, value });
        });

        const cursor = this.add.circle(cx, cy, 14, 0xf0c860, 1)
            .setStrokeStyle(3, 0x6b4a1f).setDepth(14);
        this.r('ouest', cursor);

        const centerSlot = this.add.text(cx, cy, 'O', {
            fontFamily: 'Georgia', fontSize: 46, color: '#f0d090'
        }).setOrigin(0.5).setDepth(14).setInteractive({ useHandCursor: true });
        this.r('ouest', centerSlot);
        this.ouestCenterSlotText = centerSlot;

        const updateOuestCenterGlyph = () => {
            centerSlot.setText(this.duskStonePlacedOnDial ? '●' : 'O');
            centerSlot.setColor(this.duskStonePlacedOnDial ? '#ffd18f' : '#f0d090');
        };

        const handleOuestCenterClick = () => {
            if (this.duskStonePlacedOnDial)
            {
                if (!this.duskStoneCharged)
                {
                    this.updateMessage('Le Coeur d\'Atoum n\'est pas encore recharge.');
                    return;
                }

                if (this.inventory.hasItem('pierre_crepuscule_chargee'))
                {
                    this.updateMessage('Le Coeur d\'Atoum charge est deja dans votre sac.');
                    return;
                }

                this.inventory.addItem(
                    'pierre_crepuscule_chargee',
                    'Coeur d\'Atoum charge',
                    '◉',
                    'Le coeur d\'Atoum est chaud et semble plus lourd.'
                );
                this.duskStonePlacedOnDial = false;
                this.duskStoneCharged = false;
                if (this.ouestBeamGraphic)
                {
                    this.ouestBeamGraphic.destroy();
                    this.ouestBeamGraphic = null;
                }
                updateOuestCenterGlyph();
                this.updateMessage('Tu recuperes le Coeur d\'Atoum charge.');
                return;
            }

            if (this.inventory.hasItem('pierre_crepuscule_brute'))
            {
                this.inventory.removeItem('pierre_crepuscule_brute');
                this.duskStonePlacedOnDial = true;
                this.duskStoneCharged = false;
                updateOuestCenterGlyph();
                this.playSfx('place');
                this.updateMessage('Le Coeur d\'Atoum est depose au centre du cadran.');
                triggerBeamIfReady();
                return;
            }

            if (this.inventory.hasItem('pierre_crepuscule_chargee'))
            {
                this.inventory.removeItem('pierre_crepuscule_chargee');
                this.duskStonePlacedOnDial = true;
                this.duskStoneCharged = true;
                updateOuestCenterGlyph();
                this.playSfx('place');
                this.updateMessage('Le Coeur d\'Atoum charge est replace au centre du cadran.');
                triggerBeamIfReady();
                return;
            }

            this.updateMessage('une creu rond et fondu.');
        };

        centerSlot.on('pointerdown', handleOuestCenterClick);
        centerSlot.on('pointerover', () => {
            if (this.duskStonePlacedOnDial)
            {
                this.updateMessage(this.duskStoneCharged
                    ? 'Clique pour recuperer le Coeur d\'Atoum charge.'
                    : 'Le Coeur d\'Atoum est en cours de recharge.');
                return;
            }

            if (this.inventory.hasItem('pierre_crepuscule_brute') || this.inventory.hasItem('pierre_crepuscule_chargee'))
            {
                this.updateMessage('clique pour deposer le Coeur d\'Atoum');
                return;
            }

            this.updateMessage('une creu rond et fondu.');
        });
        updateOuestCenterGlyph();

        const gridLeft = cx - radius + 100;
        const gridRight = cx + radius - 100;
        const gridTop = cy - radius + 72;
        const gridBottom = cy - 96;
        const cellW = (gridRight - gridLeft) / 3;
        const cellH = (gridBottom - gridTop) / 3;
        const cellCenter = (row, col) => ({
            x: gridLeft + (col - 1) * cellW,
            y: gridTop + (row - 1) * cellH
        });

        const mirrorSlots = isEasyOuest ? [
            { row: 1, col: 1, target: '/'  },
            { row: 1, col: 3, target: '\\' },
            { row: 2, col: 3, target: '\\' },
            { row: 2, col: 4, target: '\\' },
            { row: 3, col: 1, target: '\\' },
            { row: 3, col: 2, target: '\\' },
            { row: 4, col: 2, target: '\\' },
            { row: 4, col: 4, target: '\\' }
        ] : [
            { row: 1, col: 1, target: '/'  },
            { row: 1, col: 3, target: '\\' },
            { row: 2, col: 2, target: '/'  },
            { row: 2, col: 3, target: '/'  },
            { row: 2, col: 4, target: '\\' },
            { row: 3, col: 1, target: '\\' },
            { row: 3, col: 2, target: '\\' },
            { row: 3, col: 3, target: '/'  },
            { row: 4, col: 2, target: '\\' },
            { row: 4, col: 4, target: '\\' }
        ];

        this.mirrorStates = new Array(mirrorSlots.length).fill(0);
        this.mirrorTargets = mirrorSlots.map(slot => slot.target === '/' ? 1 : 0);
        const mirrorNodes = {};

        mirrorSlots.forEach((slot, i) => {
            const pos = cellCenter(slot.row, slot.col);
            const shiftedY = pos.y + cellH;
            const tile = this.add.rectangle(pos.x, shiftedY, 84, 84, 0x3e2b18, 0.95)
                .setStrokeStyle(3, 0xba9862)
                .setInteractive({ useHandCursor: true })
                .setDepth(12);
            const glyph = this.add.text(pos.x, shiftedY, '\\', {
                fontFamily: 'Georgia', fontSize: 52, color: '#f1e0bf'
            }).setOrigin(0.5).setDepth(13);
            mirrorNodes[`${slot.row},${slot.col}`] = { x: pos.x, y: shiftedY, tile, glyph };

            tile.on('pointerover', () => {
                if (!this.puzzlesSolved.ouest && !this.ouestBeamPlaying) tile.setFillStyle(0x4f361f, 0.96);
            });
            tile.on('pointerout', () => {
                tile.setFillStyle(this.puzzlesSolved.ouest ? 0x1f3d1f : 0x3e2b18, 0.95);
            });
            tile.on('pointerdown', () => {
                if (this.puzzlesSolved.ouest || this.ouestBeamPlaying) return;
                this.mirrorStates[i] = this.mirrorStates[i] === 0 ? 1 : 0;
                glyph.setText(this.mirrorStates[i] === 1 ? '/' : '\\');

                if (this.mirrorStates.every((state, idx) => state === this.mirrorTargets[idx]))
                {
                    triggerBeamIfReady();
                    if (!this.ouestBeamPlaying)
                    {
                        const activeTarget = notchTargets[currentDialIndex];
                        if (activeTarget?.value === 19 && !this.duskStonePlacedOnDial)
                        {
                            this.updateMessage('c\'est curieux, il doit manquer quelque chose');
                        }
                        else if (isEasyOuest)
                        {
                            this.updateMessage('Miroirs alignes: regle maintenant le cadran sur 19.');
                        }
                    }
                }
            });

            this.r('ouest', tile);
            this.r('ouest', glyph);
        });

        let currentDialIndex = 0;

        const triggerBeamIfReady = () => {
            if (this.ouestBeamPlaying || this.puzzlesSolved.ouest) return;
            if (!this.duskStonePlacedOnDial) return;
            const target = notchTargets[currentDialIndex];
            const mirrorsAligned = this.mirrorStates.every((state, idx) => state === this.mirrorTargets[idx]);
            if (target.value === 19 && mirrorsAligned)
            {
                this.ouestBeamPlaying = true;
                this.playOuestBeamAnimation(
                    { x: target.x, y: target.y },
                    { x: cx, y: cy },
                    mirrorNodes,
                    centerSlot,
                    () => {
                        this.ouestBeamPlaying = false;
                        this.duskStoneCharged = true;
                        updateOuestCenterGlyph();
                        this.markRoomSolved('ouest');
                        this.updateMessage('Le coeur du cadran est charge. Clique le centre pour recuperer le Coeur d\'Atoum.');
                    }
                , isEasyOuest);
            }
        };

        const setDialIndex = (index) => {
            if (this.ouestBeamPlaying) return;
            currentDialIndex = index;
            const target = notchTargets[index];
            const mirrorsAligned = this.mirrorStates.every((state, idx) => state === this.mirrorTargets[idx]);

            cursor.setPosition(target.x, target.y);

            labels.forEach((label, i) => {
                label.setColor(i === index ? '#fff2c4' : '#f1e0bf');
            });

            triggerBeamIfReady();

            if (!this.ouestBeamPlaying)
            {
                if (target.value === 19)
                {
                    if (mirrorsAligned && !this.duskStonePlacedOnDial)
                    {
                        this.updateMessage('c\'est curieux, il doit manquer quelque chose');
                    }
                    else if (isEasyOuest && !mirrorsAligned)
                    {
                        this.updateMessage('Le cadran est sur 19, mais les miroirs ne sont pas encore alignes.');
                    }
                    else if (isEasyOuest)
                    {
                        this.updateMessage('Le cadran est pret.');
                    }
                }
                else if (isEasyOuest)
                {
                    this.updateMessage('Le cadran indique ' + target.value + ': poursuis vers le couchant.');
                }
            }
        };

        setDialIndex(0);

        // Cle Ankh collectible
        this.createCollectible('ouest', w - 120, 220, 'ankh', 'Cle Ankh', '☥',
            `Anubis le chacal
Apophis le serpent
Ba'al le taureau
Cronos le Titan
Nirrti la seule "femme" ici (Hindoue)
Râ le faucon
Sokar l'emergence du soleil
Yu le chinois
Arès le sanglier
Heru'ur est Horus l'Ancien le faucon
Seth l'hybride (museau effilé et oreilles dressées mais tronquées)
Svarog le dragon ailé (Slave)
Moloch le Phénicien`);
    }

    enterLowerLevel ()
    {
        this.inLowerLevel = true;
        this.phase2RelicsCollected = new Set();
        const relicKeys = ['ankh', 'amulette', 'scarabee', 'djed', 'uraeus', 'masque', 'sceptre', 'plume', 'couronne', 'lotus'];
        relicKeys.forEach(key => {
            if (this.inventory?.hasItem(key)) this.phase2RelicsCollected.add(key);
        });
        if (!this.phase2SphinxOrder || this.phase2SphinxOrder.length !== 10)
        {
            this.phase2SphinxOrder = this.shuffleArray([
                'ankh', 'amulette', 'scarabee', 'djed', 'uraeus',
                'lotus', 'sceptre', 'plume', 'couronne', 'masque'
            ]);
        }
        this.exitButton?.setVisible(false);
        this.exitText?.setVisible(false);
        this.showRoom('hub2');
        this.updatePhase2CollectedUI();
    }

    buildLowerLevelHub (w, h)
    {
        const cx = w / 2;
        const cy = h / 2;

        const roomBg = this.add.graphics().setDepth(3);
        roomBg.fillStyle(0x20140d, 1);
        roomBg.fillRect(0, 0, w, h);
        roomBg.fillStyle(0x2f1f12, 1);
        roomBg.fillRect(70, 160, w - 140, 520);
        roomBg.fillStyle(0x8f6534, 1);
        roomBg.fillRect(70, 156, w - 140, 5);
        roomBg.fillRect(70, 676, w - 140, 4);
        this.r('hub2', roomBg);
        this.r('hub2', this.add.text(cx, 92, 'Nouvelle Piece Souterraine', {
            fontFamily: 'Georgia', fontSize: 32, color: '#f2d395'
        }).setOrigin(0.5).setDepth(8));

        this.r('hub2', this.add.text(cx, 136,
            'Clique les elements: papyrus au nord, sphinx, oeil d\'Horus, escaliers.', {
                fontFamily: 'Georgia', fontSize: 19, color: '#d8c49a', align: 'center'
            }).setOrigin(0.5).setDepth(8));

        const northPapyrusHit = this.add.rectangle(cx, 166, w - 180, 18, 0xc8a870, 0.16)
            .setStrokeStyle(1, 0xd7b37c, 0.9)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        northPapyrusHit.on('pointerdown', () => this.showRoom('nord2'));
        this.r('hub2', northPapyrusHit);

        const sphinx = this.add.graphics().setDepth(8);
        sphinx.fillStyle(0x6f5634, 0.98);
        sphinx.lineStyle(2, 0xc7a069, 0.95);
        sphinx.fillEllipse(170, 228, 178, 84);   // corps de lion
        sphinx.strokeEllipse(170, 228, 178, 84);
        sphinx.fillRect(112, 246, 42, 18);       // patte avant
        sphinx.strokeRect(112, 246, 42, 18);
        sphinx.fillRect(162, 246, 42, 18);       // patte avant
        sphinx.strokeRect(162, 246, 42, 18);
        sphinx.fillRect(208, 246, 28, 14);       // patte arriere
        sphinx.strokeRect(208, 246, 28, 14);
        sphinx.fillEllipse(226, 200, 62, 78);    // tete humaine
        sphinx.strokeEllipse(226, 200, 62, 78);
        sphinx.fillTriangle(192, 168, 260, 168, 226, 194); // coiffe nemes
        sphinx.strokeTriangle(192, 168, 260, 168, 226, 194);
        sphinx.fillStyle(0x7a6242, 0.98);
        // Cagoule laterale style <|   |> tombant vers les oreilles.
        sphinx.fillTriangle(198, 172, 178, 214, 198, 218);
        sphinx.fillTriangle(254, 172, 274, 214, 254, 218);
        sphinx.lineStyle(2, 0xc7a069, 0.95);
        sphinx.strokeTriangle(198, 172, 178, 214, 198, 218);
        sphinx.strokeTriangle(254, 172, 274, 214, 254, 218);
        sphinx.fillStyle(0x8d7350, 0.95);
        sphinx.fillRect(220, 204, 12, 20);       // nez stylise
        sphinx.fillRect(214, 230, 24, 8);        // bouche stylisee
        sphinx.fillTriangle(88, 224, 62, 236, 82, 246); // queue
        sphinx.lineStyle(2, 0xc7a069, 0.95);
        sphinx.strokeTriangle(88, 224, 62, 236, 82, 246);
        this.r('hub2', sphinx);

        const sphinxHit = this.add.rectangle(176, 220, 236, 156, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        sphinxHit.on('pointerdown', () => this.showRoom('ouest2'));
        this.r('hub2', sphinxHit);

        const horusEye = this.add.image(324, 578, 'oracle-horus')
            .setDisplaySize(138, 138)
            .setAlpha(0.93)
            .setDepth(9)
            .setInteractive({ useHandCursor: true });
        horusEye.on('pointerdown', () => this.showRoom('sud2'));
        this.r('hub2', horusEye);

        const stairs = this.add.graphics().setDepth(8);
        const stepA = { x: 888, y: 520, w: 46, h: 152 };
        const stepB = { x: 916, y: 548, w: 32, h: 124 };
        const stepC = { x: 936, y: 574, w: 18, h: 98 };
        stairs.fillStyle(0x4b331d, 1);
        // Dessin du plus grand au plus petit pour gerer le recouvrement.
        stairs.fillRect(stepA.x, stepA.y, stepA.w, stepA.h);
        stairs.fillRect(stepB.x, stepB.y, stepB.w, stepB.h);
        stairs.fillRect(stepC.x, stepC.y, stepC.w, stepC.h);

        stairs.lineStyle(2, 0xc59a60, 0.96);
        // Step A: contour seulement sur les parties encore visibles (haut + gauche avant recouvrement).
        stairs.beginPath();
        stairs.moveTo(stepA.x, stepA.y);
        stairs.lineTo(stepB.x, stepA.y);
        stairs.moveTo(stepA.x, stepA.y);
        stairs.lineTo(stepA.x, stepA.y + stepA.h);
        stairs.strokePath();

        // Step B: contour visible propre (haut + gauche), sans traits caches sous le step C.
        stairs.beginPath();
        stairs.moveTo(stepB.x, stepB.y);
        stairs.lineTo(stepC.x, stepB.y);
        stairs.moveTo(stepB.x, stepB.y);
        stairs.lineTo(stepB.x, stepB.y + stepB.h);
        stairs.strokePath();

        // Step C: contour complet visible car au premier plan.
        stairs.strokeRect(stepC.x, stepC.y, stepC.w, stepC.h);
        this.r('hub2', stairs);

        const stairsHit = this.add.rectangle(922, 596, 120, 172, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        stairsHit.on('pointerdown', () => this.showRoom('hub'));
        this.r('hub2', stairsHit);

        const gate = this.add.circle(cx, 366, 92, 0x3a3a3a, 0.95)
            .setStrokeStyle(4, 0x7f7f7f)
            .setInteractive({ useHandCursor: true })
            .setDepth(8);
        gate.on('pointerdown', () => {
            if (this.phase2PortalReady)
            {
                this.stopCountdown();
                this.stopGameMusic();
                this.scene.start('GameOver', { outcome: 'success', timeRemainingSeconds: this.timeRemainingSeconds });
                return;
            }
            if (this.phase2PortalActivated)
            {
                this.updateMessage('Le vortex se stabilise... encore un instant.');
                return;
            }
            this.showRoom('centre2');
        });
        this.r('hub2', gate);
        this.phase2HubGate = gate;

        const hubGateInner = this.add.circle(cx, 366, 70, 0x2f1f12, 1).setDepth(8);
        this.r('hub2', hubGateInner);
        this.phase2HubGateInner = hubGateInner;

        const hubGateActivationDisk = this.add.circle(cx, 366, 70, 0x3f9cff, 0.95)
            .setScale(0.06)
            .setAlpha(0)
            .setVisible(false)
            .setDepth(9.5);
        this.r('hub2', hubGateActivationDisk);
        this.phase2HubGateActivationDisk = hubGateActivationDisk;

        this.r('hub2', this.add.text(cx, 366, 'Chappa\'ai', {
            fontFamily: 'Georgia', fontSize: 28, color: '#e2d2b6'
        }).setOrigin(0.5).setDepth(9));

        this.phase2CollectedText = this.add.text(cx, 628, '', {
            fontFamily: 'Georgia', fontSize: 20, color: '#d5efb5', align: 'center'
        }).setOrigin(0.5).setDepth(9);
        this.r('hub2', this.phase2CollectedText);
        this.updatePhase2CollectedUI();
    }

    buildLowerLevelEst (w, h)
    {
        this.buildRoomOverlay('est2', w, h,
            'EST -- Escalier de retour',
            '"C\'est le passage d\'ou tu viens."',
            'hub2');

        const gx = this.add.graphics().setDepth(9);
        gx.fillStyle(0x3a2a18, 1);
        for (let i = 0; i < 9; i++)
        {
            gx.fillRect(300 + i * 36, 520 - i * 22, 420 - i * 36, 22);
        }
        this.r('est2', gx);

        this.r('est2', this.add.text(w / 2, 300,
            'Des marches remontent vers la chambre precedente.', {
                fontFamily: 'Georgia', fontSize: 26, color: '#efd8aa', align: 'center'
            }).setOrigin(0.5).setDepth(9));
    }

    createPhase2HiddenRelic (room, x, y, key, label, icon)
    {
        const bg = this.add.circle(x, y, 16, 0x423018, 0.86)
            .setStrokeStyle(1, 0x8f6b3b)
            .setInteractive({ useHandCursor: true })
            .setDepth(10);
        const txt = this.add.text(x, y, icon, {
            fontFamily: 'Georgia', fontSize: 18, color: '#f3e0b7'
        }).setOrigin(0.5).setDepth(11);

        const collect = () => {
            if (this.phase2RelicsCollected.has(key))
            {
                this.updateMessage(label + ' est deja trouvee.');
                return;
            }
            this.phase2RelicsCollected.add(key);
            bg.setVisible(false).disableInteractive();
            txt.setVisible(false);
            this.playSfx('pickup');
            this.updatePhase2CollectedUI();
            this.updateMessage('Relique trouvee: ' + label);
        };

        bg.on('pointerdown', collect);
        this.r(room, bg);
        this.r(room, txt);
    }

    createPhase2PapyrusRelicSpot (room, x, y, width, height, key, label, icon)
    {
        const hit = this.add.rectangle(x, y, width, height, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: false })
            .setDepth(10);

        hit.on('pointerdown', () => {
            if (this.phase2RelicsCollected.has(key) || this.inventory?.hasItem(key))
            {
                return;
            }

            const added = this.inventory?.addItem(key, label, icon, 'Relique du papyrus: ' + label);
            if (!added)
            {
                this.updateMessage('Sac plein: impossible de recuperer ' + label + '.');
                return;
            }

            this.phase2RelicsCollected.add(key);
            this.updatePhase2CollectedUI();
        });

        this.r(room, hit);
    }

    clearPhase2DebugZones ()
    {
        this.phase2DebugZones.forEach(obj => obj.destroy());
        this.phase2DebugZones = [];
    }

    drawPhase2PapyrusDebugZones ()
    {
        // Données des hotspots (mêmes que dans createPhase2PapyrusRelicSpot)
        const hotspots = [
            // Scarabee
            { x: 282, y: 285, w: 14, h: 14, label: 'Scarabee', color: 0xff6464 },
            // Masques
            { x: 295, y: 446, w: 15, h: 20, label: 'Masque 1', color: 0x64c864 },
            { x: 310, y: 446, w: 15, h: 20, label: 'Masque 2', color: 0x64c864 },
            { x: 325, y: 446, w: 15, h: 20, label: 'Masque 3', color: 0x64c864 },
            // Serpents
            { x: 303, y: 401, w: 30, h: 30, label: 'Serpent 1', color: 0x6496ff },
            { x: 323, y: 401, w: 30, h: 30, label: 'Serpent 2', color: 0x6496ff },
            // Sceptre
            { x: 443, y: 438, w: 25, h: 200, label: 'Sceptre', color: 0xffc864 },
            // Djed
            { x: 565, y: 532, w: 25, h: 80, label: 'Djed 1', color: 0xc864c8 },
            { x: 615, y: 536, w: 25, h: 80, label: 'Djed 2', color: 0xc864c8 },
            // Lotus
            { x: 173, y: 316, w: 15, h: 15, label: 'Lotus 1', color: 0xff8cc8 },
            { x: 563, y: 473, w: 15, h: 15, label: 'Lotus 2', color: 0xff8cc8 },
            { x: 611, y: 473, w: 15, h: 15, label: 'Lotus 3', color: 0xff8cc8 },
            // Couronne
            { x: 473, y: 291, w: 25, h: 50, label: 'Couronne', color: 0xf4de7a },
            // Plumes
            { x: 560, y: 288, w: 30, h: 30, label: 'Plume 1', color: 0x7ad9d9 },
            { x: 570, y: 314, w: 30, h: 30, label: 'Plume 2', color: 0x7ad9d9 },
            { x: 580, y: 300, w: 30, h: 30, label: 'Plume 3', color: 0x7ad9d9 },
            // Cle Ankh
            { x: 635, y: 445, w: 25, h: 25, label: 'Cle Ankh', color: 0xd9d9d9 }
        ];

        hotspots.forEach(spot => {
            // Dessiner le rectangle
            const rect = this.add.rectangle(spot.x, spot.y, spot.w, spot.h, spot.color, 0.4)
                .setStrokeStyle(2, spot.color)
                .setDepth(11);
            this.r('nord2', rect);
            this.phase2DebugZones.push(rect);

            // Afficher les coordonnées
            const coordText = this.add.text(spot.x, spot.y - spot.h / 2 - 18, 
                `(${spot.x}, ${spot.y})`, {
                fontFamily: 'Arial', fontSize: 10, color: '#fff',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(12);
            this.r('nord2', coordText);
            this.phase2DebugZones.push(coordText);

            // Afficher la taille
            const sizeText = this.add.text(spot.x, spot.y, 
                `${spot.w}x${spot.h}`, {
                fontFamily: 'Arial', fontSize: 10, color: '#fff',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(12);
            this.r('nord2', sizeText);
            this.phase2DebugZones.push(sizeText);

            // Afficher le label
            const labelText = this.add.text(spot.x, spot.y + spot.h / 2 + 8, 
                spot.label, {
                fontFamily: 'Arial', fontSize: 9, color: '#fff',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(12);
            this.r('nord2', labelText);
            this.phase2DebugZones.push(labelText);
        });
    }

    buildLowerLevelNord (w, h)
    {
        this.buildLowerLevelBackdrop('nord2', w, h);
        this.buildRoomOverlay('nord2', w, h,
            'NORD -- Objets caches',
            '',
            'hub2');

        this.phase2NordClueText = this.add.text(w / 2, 126, '', {
            fontFamily: 'Georgia', fontSize: 16, color: '#d9c49a',
            align: 'center', wordWrap: { width: w - 160 }
        }).setOrigin(0.5).setDepth(8).setVisible(this.showHints);
        this.r('nord2', this.phase2NordClueText);
        this.updatePhase2NordClueText();

        const frame = this.add.rectangle(w / 2, 406, 774, 444, 0x1f140c, 0.94)
            .setStrokeStyle(3, 0xb48e58)
            .setDepth(8);
        this.r('nord2', frame);

        const papyrus = this.add.image(w / 2, 406, 'papyrus-wall')
            .setDisplaySize(760, 430)
            .setDepth(9);
        this.r('nord2', papyrus);

        // Coordonnees alignees sur solutionPapyrus (zones volontairement un peu larges).
        // Scarabee: dans les hieroglyphes au-dessus des serpents.
        this.createPhase2PapyrusRelicSpot('nord2', 282, 285, 14, 14, 'scarabee', 'Scarabee', '🪲');

        // Masques (3 spots): sous les serpents sur la meme tour.
        this.createPhase2PapyrusRelicSpot('nord2', 295, 446, 15, 20, 'masque', 'Masque', '🎭');
        this.createPhase2PapyrusRelicSpot('nord2', 310, 446, 15, 20, 'masque', 'Masque', '🎭');
        this.createPhase2PapyrusRelicSpot('nord2', 325, 446, 15, 20, 'masque', 'Masque', '🎭');

        // Serpents (2 spots): position des masques, Y decale de -25.
        this.createPhase2PapyrusRelicSpot('nord2', 303, 401, 30, 30, 'uraeus', 'Serpent', '🐍');
        this.createPhase2PapyrusRelicSpot('nord2', 323, 401, 30, 30, 'uraeus', 'Serpent', '🐍');

        // Sceptre (1 spot): personnage central a tete d'oiseau.
        this.createPhase2PapyrusRelicSpot('nord2', 443, 438, 25, 200, 'sceptre', 'Sceptre', '⚚');

        // Djed (2 spots): zone droite, entre les tours/personnage crocodile.
        this.createPhase2PapyrusRelicSpot('nord2', 565, 532, 25, 80, 'djed', 'Djed', '𓊽');
        this.createPhase2PapyrusRelicSpot('nord2', 615, 536, 25, 80, 'djed', 'Djed', '𓊽');

        // Lotus (3 spots): un a gauche, deux au-dessus des djed.
        this.createPhase2PapyrusRelicSpot('nord2', 173, 316, 15, 15, 'lotus', 'Lotus', '✿');
        this.createPhase2PapyrusRelicSpot('nord2', 563, 473, 15, 15, 'lotus', 'Lotus', '✿');
        this.createPhase2PapyrusRelicSpot('nord2', 611, 473, 15, 15, 'lotus', 'Lotus', '✿');

        // Couronne (1 spot)
        this.createPhase2PapyrusRelicSpot('nord2', 473, 291, 25, 50, 'couronne', 'Couronne', '👑');

        // Plumes (3 spots)
        this.createPhase2PapyrusRelicSpot('nord2', 560, 288, 30, 30, 'plume', 'Plume', '🪶');
        this.createPhase2PapyrusRelicSpot('nord2', 570, 314, 30, 30, 'plume', 'Plume', '🪶');
        this.createPhase2PapyrusRelicSpot('nord2', 580, 300, 30, 30, 'plume', 'Plume', '🪶');

        // Cle Ankh
        this.createPhase2PapyrusRelicSpot('nord2', 635, 445, 25, 25, 'ankh', 'Cle Ankh', '☥');

        // Afficher les zones de debug si le mode est activé
        if (this.debugHotspots) {
            this.drawPhase2PapyrusDebugZones();
        }
    }

    buildLowerLevelSud (w, h)
    {
        this.buildLowerLevelBackdrop('sud2', w, h);
        this.buildRoomOverlay('sud2', w, h,
            'SUD -- Vision de l\'oracle',
            '"L\'oeil d\'Horus voit tout: passé, présent, futur."',
            'hub2');

        const wall = this.add.graphics().setDepth(8);
        wall.fillStyle(0x2f2114, 1);
        wall.fillRect(170, 190, w - 340, 430);
        for (let i = 0; i < 24; i++)
        {
            wall.fillStyle((i % 4 === 0) ? 0x5b3b23 : 0x3f2818, 0.55);
            wall.fillCircle(210 + (i * 73) % 620, 220 + (i * 47) % 360, 11);
        }
        this.r('sud2', wall);

        this.buildOracleVisionPuzzle('sud2', w, h);
    }

    buildOracleVisionPuzzle (room, w, h)
    {
        const cfg = this.getOraclePuzzleConfig();
        const gridSize = cfg.gridSize;
        const totalCells = gridSize * gridSize;
        const boardSize = gridSize >= 4 ? 336 : 300;
        const tileSize = boardSize / gridSize;
        const tileDrawSize = tileSize - 4;
        const boardX = w / 2 - boardSize / 2;
        const boardY = h / 2 - boardSize / 2 + 34;
        const emptyTargetIndex = 0; // case vide en haut a gauche

        const tileAtCell = new Array(totalCells).fill(0);
        const tilesById = {};
        let emptyIndex = emptyTargetIndex;
        let isAnimating = false;

        const frame = this.add.rectangle(w / 2, boardY - 46, 520, 58, 0x2a1b10, 0.94)
            .setStrokeStyle(2, 0xbf9150)
            .setDepth(9);
        this.r(room, frame);

        const title = this.add.text(w / 2, boardY - 46,
            'Vision de l\'oracle', {
                fontFamily: 'Georgia', fontSize: 18, color: '#f3dfbe', align: 'center'
            })
            .setOrigin(0.5)
            .setDepth(10);
        this.r(room, title);

        const boardBg = this.add.rectangle(w / 2, boardY + boardSize / 2, boardSize + 12, boardSize + 12, 0x1a120a, 0.96)
            .setStrokeStyle(2, 0x8f6b3b)
            .setDepth(8);
        this.r(room, boardBg);

        const emptyHint = this.add.rectangle(
            boardX + tileSize / 2,
            boardY + tileSize / 2,
            tileDrawSize,
            tileDrawSize,
            0x352313,
            0.92
        )
            .setStrokeStyle(2, 0xc79a60, 0.75)
            .setDepth(9);
        this.r(room, emptyHint);

        const grid = this.add.graphics().setDepth(9);
        grid.lineStyle(1, 0x8a6640, 0.8);
        for (let i = 0; i <= gridSize; i++)
        {
            const x = boardX + i * tileSize;
            const y = boardY + i * tileSize;
            grid.lineBetween(x, boardY, x, boardY + boardSize);
            grid.lineBetween(boardX, y, boardX + boardSize, y);
        }
        this.r(room, grid);

        const tex = this.textures.get('oracle-vision');
        const src = tex?.getSourceImage();
        const srcTileW = src.width / gridSize;
        const srcTileH = src.height / gridSize;

        const ensurePieceTexture = (tileId) => {
            const row = Math.floor(tileId / gridSize);
            const col = tileId % gridSize;
            const key = 'oracle-vision-piece-' + gridSize + '-' + tileId;
            if (this.textures.exists(key)) return key;

            const piece = this.textures.createCanvas(key, Math.ceil(srcTileW), Math.ceil(srcTileH));
            const ctx = piece.getContext();
            ctx.clearRect(0, 0, Math.ceil(srcTileW), Math.ceil(srcTileH));
            ctx.drawImage(
                src,
                col * srcTileW,
                row * srcTileH,
                srcTileW,
                srcTileH,
                0,
                0,
                Math.ceil(srcTileW),
                Math.ceil(srcTileH)
            );
            piece.refresh();
            return key;
        };

        const cellToPos = (index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            return {
                x: boardX + col * tileSize + tileSize / 2,
                y: boardY + row * tileSize + tileSize / 2
            };
        };

        const neighborsOf = (cellIndex) => {
            const row = Math.floor(cellIndex / gridSize);
            const col = cellIndex % gridSize;
            const out = [];
            if (row > 0) out.push(cellIndex - gridSize);
            if (row < gridSize - 1) out.push(cellIndex + gridSize);
            if (col > 0) out.push(cellIndex - 1);
            if (col < gridSize - 1) out.push(cellIndex + 1);
            return out;
        };

        const areNeighbors = (a, b) => {
            const ar = Math.floor(a / gridSize);
            const ac = a % gridSize;
            const br = Math.floor(b / gridSize);
            const bc = b % gridSize;
            return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
        };

        const placeTileAt = (tileId, cellIndex, immediate = true) => {
            const tile = tilesById[tileId];
            tile.cellIndex = cellIndex;
            tileAtCell[cellIndex] = tileId;
            const pos = cellToPos(cellIndex);
            if (immediate)
            {
                tile.sprite.setPosition(pos.x, pos.y);
                return;
            }
            this.tweens.add({
                targets: tile.sprite,
                x: pos.x,
                y: pos.y,
                duration: 120,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    isAnimating = false;
                }
            });
        };

        const isSolvedState = () => {
            if (emptyIndex !== emptyTargetIndex) return false;
            for (let i = 1; i < totalCells; i++)
            {
                if (tileAtCell[i] !== i) return false;
            }
            return true;
        };

        const applySolvedVisual = () => {
            for (let i = 0; i < totalCells; i++)
            {
                tileAtCell[i] = i;
            }
            tileAtCell[emptyTargetIndex] = 0;
            emptyIndex = emptyTargetIndex;
            for (let id = 1; id < totalCells; id++)
            {
                const tile = tilesById[id];
                tile.cellIndex = id;
                const pos = cellToPos(id);
                tile.sprite.setPosition(pos.x, pos.y);
            }
        };

        const finalizeSolvedSequence = () => {
            if (this.phase2OracleVisionSolved) return;
            this.phase2OracleVisionSolved = true;
            isAnimating = true;

            Object.values(tilesById).forEach(tile => tile.sprite.disableInteractive());

            const missingTile = this.add.image(
                boardX + tileSize / 2,
                boardY + tileSize / 2,
                ensurePieceTexture(0)
            )
                .setDisplaySize(tileDrawSize, tileDrawSize)
                .setAlpha(0)
                .setScale(0.85)
                .setDepth(12);
            this.r(room, missingTile);

            this.tweens.add({
                targets: missingTile,
                alpha: 1,
                scale: 1,
                duration: 280,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    const fullImage = this.add.image(
                        boardX + boardSize / 2,
                        boardY + boardSize / 2,
                        'oracle-vision'
                    )
                        .setDisplaySize(boardSize - 4, boardSize - 4)
                        .setAlpha(0)
                        .setDepth(13);
                    this.r(room, fullImage);

                    this.tweens.add({
                        targets: Object.values(tilesById).map(t => t.sprite).concat([missingTile]),
                        alpha: 0,
                        duration: 200,
                        ease: 'Sine.easeIn'
                    });

                    this.tweens.add({
                        targets: fullImage,
                        alpha: 1,
                        duration: 260,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            title.setText('Vision recomposée.');
                            this.updateMessage('La vision de l\'oracle est résolue. Le Sphinx de l\'ouest te parlera.');
                            this.playSfx('solve');
                            isAnimating = false;
                        }
                    });
                }
            });
        };

        for (let id = 1; id < totalCells; id++)
        {
            const pos = cellToPos(id);
            const sprite = this.add.image(pos.x, pos.y, ensurePieceTexture(id))
                .setDisplaySize(tileDrawSize, tileDrawSize)
                .setInteractive({ useHandCursor: true })
                .setDepth(10);

            tilesById[id] = { id, sprite, cellIndex: id };
            tileAtCell[id] = id;
            this.r(room, sprite);

            sprite.on('pointerdown', () => {
                if (this.phase2OracleVisionSolved || isAnimating) return;

                const tile = tilesById[id];
                if (!areNeighbors(tile.cellIndex, emptyIndex)) return;

                const from = tile.cellIndex;
                const to = emptyIndex;
                isAnimating = true;
                tileAtCell[from] = 0;
                emptyIndex = from;
                placeTileAt(id, to, false);

                if (isSolvedState())
                {
                    this.time.delayedCall(130, () => finalizeSolvedSequence());
                }
            });
        }

        // Melange solvable: enchainement de mouvements valides depuis l'etat resolu.
        let previousEmpty = -1;
        for (let i = 0; i < cfg.shuffleMoves; i++)
        {
            const candidates = neighborsOf(emptyIndex).filter(index => index !== previousEmpty);
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            const movingId = tileAtCell[pick];
            if (!movingId) continue;

            tileAtCell[pick] = 0;
            tileAtCell[emptyIndex] = movingId;
            tilesById[movingId].cellIndex = emptyIndex;
            previousEmpty = emptyIndex;
            emptyIndex = pick;
        }

        for (let id = 1; id < totalCells; id++)
        {
            const tile = tilesById[id];
            const pos = cellToPos(tile.cellIndex);
            tile.sprite.setPosition(pos.x, pos.y);
        }

        if (isSolvedState())
        {
            applySolvedVisual();
            const options = neighborsOf(emptyIndex);
            const forced = options[0];
            const forcedId = tileAtCell[forced];
            if (forcedId)
            {
                tileAtCell[forced] = 0;
                tileAtCell[emptyIndex] = forcedId;
                tilesById[forcedId].cellIndex = emptyIndex;
                emptyIndex = forced;
                const p = cellToPos(tilesById[forcedId].cellIndex);
                tilesById[forcedId].sprite.setPosition(p.x, p.y);
            }
        }
    }

    getOraclePuzzleConfig ()
    {
        if (this.difficulty === DIFFICULTY.EASY)
        {
            return { gridSize: 2, shuffleMoves: 16 };
        }
        if (this.difficulty === DIFFICULTY.HARD)
        {
            return { gridSize: 4, shuffleMoves: 220 };
        }
        return { gridSize: 3, shuffleMoves: 90 };
    }

    buildLowerLevelOuest (w, h)
    {
        this.buildLowerLevelBackdrop('ouest2', w, h);
        this.buildRoomOverlay('ouest2', w, h,
            'OUEST -- Le Sphinx',
            '"Le Sphinx sait tout, mais il ne parle qu\'à ceux guidés par l\'oracle."',
            'hub2');

        const blocked = this.add.text(w / 2, 260,
            'Le Sphinx baisse les yeux et garde le silence.\n\n' +
            'Retourne au sud voir l\'oracle et résous sa vision du passé, présent, futur.', {
                fontFamily: 'Georgia', fontSize: 24, color: '#f0d7a8', align: 'center',
                wordWrap: { width: w - 260 }
            })
            .setOrigin(0.5)
            .setDepth(9);
        this.r('ouest2', blocked);

        const cfg = this.getSphinxDifficultyConfig();
        const bank = this.buildTombRaiderQuestionBank();
        const usedQuestionIndexes = this.phase2SphinxAskedQuestionIndexes;
        let picked = [];
        let index = 0;
        let score = 0;
        let waveStarted = false;
        let requiredScore = cfg.minScore;

        const sphinxAnswerText = this.add.text(w / 2, 464, '', {
            fontFamily: 'Georgia', fontSize: 16, color: '#d7f0c5', align: 'center', wordWrap: { width: w - 220 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);
        this.r('ouest2', sphinxAnswerText);

        const qText = this.add.text(w / 2, 206, '', {
            fontFamily: 'Georgia', fontSize: 21, color: '#f3e5c8', align: 'center', wordWrap: { width: w - 260 }
        }).setOrigin(0.5).setDepth(9);
        this.r('ouest2', qText);

        const optionButtons = [];
        for (let i = 0; i < 5; i++)
        {
            const y = 266 + i * 36;
            const bg = this.add.rectangle(w / 2, y, 640, 30, 0x2a1b10, 0.94)
                .setStrokeStyle(1, 0xb48e58)
                .setInteractive({ useHandCursor: true })
                .setDepth(9);
            const txt = this.add.text(w / 2, y, '', {
                fontFamily: 'Georgia', fontSize: 16, color: '#f2dfbc'
            }).setOrigin(0.5).setDepth(10);
            this.r('ouest2', bg);
            this.r('ouest2', txt);
            optionButtons.push({ bg, txt });
        }

        const relicNames = {
            ankh: 'Ankh', amulette: 'Amulette', scarabee: 'Scarabee', djed: 'Djed',
            uraeus: 'Serpent', lotus: 'Lotus', sceptre: 'Sceptre', plume: 'Plume',
            couronne: 'Couronne', masque: 'Masque'
        };
        const relicWeights = {
            djed: 0, lotus: 1, masque: 2, scarabee: 3, plume: 4,
            ankh: 5, sceptre: 6, amulette: 7, couronne: 8, uraeus: 9
        };

        const getSphinxRevealText = () => {
            if (!this.phase2SphinxOrder || this.phase2SphinxOrder.length !== 10)
            {
                return '';
            }
            if (this.difficulty === DIFFICULTY.EASY)
            {
                const namesLine = this.phase2SphinxOrder.map((k, idx) => (idx + 1) + '-' + relicNames[k]).join('  |  ');
                return 'Le Sphinx révèle les reliques: ' + namesLine;
            }
            const weightsLine = this.phase2SphinxOrder.map((k, idx) => (idx + 1) + '-' + relicWeights[k]).join('  |  ');
            return 'Le Sphinx annonce les poids: ' + weightsLine;
        };

        const renderQuestion = () => {
            const item = picked[index];
            const correct = item.o[item.a];
            const distractors = item.o.filter((_, i) => i !== item.a);
            const shown = this.shuffleArray([correct, ...this.shuffleArray(distractors).slice(0, cfg.optionCount - 1)]);
            const correctIndex = shown.indexOf(correct);

            qText.setText('Question ' + (index + 1) + ' / ' + picked.length + ': ' + item.q);
            optionButtons.forEach((o, i) => {
                const active = i < cfg.optionCount;
                o.bg.setVisible(active);
                o.txt.setVisible(active);
                if (!active)
                {
                    o.bg.disableInteractive();
                    o.txt.setText('');
                    o.bg.off('pointerdown');
                    return;
                }

                o.bg.setAlpha(1).setInteractive({ useHandCursor: true });
                o.txt.setText((i + 1) + '. ' + shown[i]);
                o.bg.off('pointerdown');
                o.bg.on('pointerdown', () => {
                    if (i === correctIndex) score++;
                    index++;
                    if (index >= picked.length)
                    {
                        if (score >= requiredScore)
                        {
                            this.playSfx('victory');
                            this.phase2SphinxSolved = true;
                            if (!this.phase2SphinxOrder || this.phase2SphinxOrder.length !== 10)
                            {
                                this.phase2SphinxOrder = this.shuffleArray([
                                    'ankh', 'amulette', 'scarabee', 'djed', 'uraeus',
                                    'lotus', 'sceptre', 'plume', 'couronne', 'masque'
                                ]);
                            }

                            if (this.difficulty === DIFFICULTY.EASY)
                            {
                                const namesLine = this.phase2SphinxOrder.map((k, idx) => (idx + 1) + '-' + relicNames[k]).join('  |  ');
                                this.updateMessage('Le Sphinx valide ton savoir et accepte de transmettre son secret.');
                            }
                            else
                            {
                                const weightsLine = this.phase2SphinxOrder.map((k, idx) => (idx + 1) + '-' + relicWeights[k]).join('  |  ');
                                this.updateMessage('Le Sphinx valide ton savoir et accepte de transmettre son secret.');
                            }

                            sphinxAnswerText.setText(getSphinxRevealText()).setVisible(true);
                        }
                        else
                        {
                            this.updateMessage('Le Sphinx refuse. Une nouvelle vague de questions apparaît.');
                            this.time.delayedCall(220, () => startWave());
                            return;
                        }
                        qText.setText('Interrogatoire termine. Score: ' + score + ' / ' + picked.length);
                        optionButtons.forEach(o => o.bg.disableInteractive().setAlpha(0.45));
                        return;
                    }
                    renderQuestion();
                });
            });
        };

        const startWave = () => {
            let available = bank
                .map((q, i) => ({ ...q, _idx: i }))
                .filter(q => !usedQuestionIndexes.has(q._idx));

            if (available.length === 0)
            {
                // Plus aucune question inedite: le sphinx cede et revele l'ordre.
                this.phase2SphinxSolved = true;
                if (!this.phase2SphinxOrder || this.phase2SphinxOrder.length !== 10)
                {
                    this.phase2SphinxOrder = this.shuffleArray([
                        'ankh', 'amulette', 'scarabee', 'djed', 'uraeus',
                        'lotus', 'sceptre', 'plume', 'couronne', 'masque'
                    ]);
                }

                const revealText = getSphinxRevealText();
                sphinxAnswerText.setText(revealText).setVisible(true);
                this.updateMessage('Le sphinx n\'a plus de nouvelles questions et te confie son ordre.');
                qText.setText('Le sphinx n\'a plus de nouvelles questions et te transmet l\'ordre.');
                optionButtons.forEach(o => {
                    o.bg.setVisible(false).disableInteractive();
                    o.txt.setVisible(false).setText('');
                });
                return;
            }

            picked = this.shuffleArray(available).slice(0, Math.min(cfg.qCount, available.length));
            requiredScore = Math.max(1, Math.ceil((cfg.minScore / cfg.qCount) * picked.length));
            picked.forEach(q => usedQuestionIndexes.add(q._idx));
            index = 0;
            score = 0;
            optionButtons.forEach(o => o.bg.setAlpha(1));
            renderQuestion();
        };

        const updateSphinxAccessState = () => {
            const unlocked = this.phase2OracleVisionSolved;
            blocked.setVisible(!unlocked);
            if (!unlocked)
            {
                sphinxAnswerText.setVisible(false).setText('');
                qText.setText('');
                optionButtons.forEach(o => {
                    o.bg.setVisible(false).disableInteractive();
                    o.txt.setVisible(false).setText('');
                });
                return;
            }

            blocked.setVisible(false);
            if (!waveStarted && !this.phase2SphinxSolved)
            {
                sphinxAnswerText.setVisible(false).setText('');
                waveStarted = true;
                startWave();
                return;
            }

            if (this.phase2SphinxSolved)
            {
                sphinxAnswerText.setText(getSphinxRevealText()).setVisible(true);
                optionButtons.forEach(o => {
                    o.bg.setVisible(true).disableInteractive().setAlpha(0.45);
                    o.txt.setVisible(true);
                });
            }
        };

        this.phase2SphinxUnlockHandler = updateSphinxAccessState;
        updateSphinxAccessState();
    }

    getSphinxDifficultyConfig ()
    {
        if (this.difficulty === DIFFICULTY.EASY)
        {
            return { qCount: 4, optionCount: 3, minScore: 2 };
        }
        if (this.difficulty === DIFFICULTY.HARD)
        {
            return { qCount: 10, optionCount: 5, minScore: 8 };
        }
        return { qCount: 8, optionCount: 4, minScore: 5 };
    }

    buildTombRaiderQuestionBank ()
    {
        const facts = [
            { q: 'quel studio a developpe le premier Tomb Raider (1996) ?', o: ['Core Design', 'Naughty Dog', 'Eidos Montreal', 'Square Enix', 'Crystal Dynamics'], a: 0 },
            { q: 'comment s\'appelle l\'heroine principale de la saga ?', o: ['Lara Croft', 'Ada Wong', 'Chloe Frazer', 'Jill Valentine', 'Samus Aran'], a: 0 },
            { q: 'dans quel pays se situe Angkor Wat (TR4) ?', o: ['Cambodge', 'Thailande', 'Laos', 'Vietnam', 'Inde'], a: 0 },
            { q: 'quel artefact est central dans Tomb Raider 1 ?', o: ['Scion', 'Excalibur', 'Pomme d\'or', 'Triforce', 'Miroir d\'obsidienne'], a: 0 },
            { q: 'quel jeu relance la trilogie reboot en 2013 ?', o: ['Tomb Raider', 'Legend', 'Underworld', 'Chronicles', 'Angel of Darkness'], a: 0 },
            { q: 'qui accompagne Lara dans Rise of the Tomb Raider en Siberie ?', o: ['Jonah', 'Zip', 'Winston', 'Pierre', 'Roth'], a: 0 },
            { q: 'dans TR1, quel animal apparait tres tot au Perou ?', o: ['Loup', 'Tigre', 'Lion', 'Ours', 'Panthere'], a: 0 },
            { q: 'quelle arme est iconique pour Lara ?', o: ['Double pistolets', 'Katana', 'Fouet', 'Lance', 'Boomerang'], a: 0 },
            { q: 'Shadow of the Tomb Raider se deroule surtout dans quelle region ?', o: ['Perou et Mexique', 'Japon et Coree', 'Egypte et Libye', 'Islande et Norvege', 'Australie et NZ'], a: 0 },
            { q: 'quel est le nom de famille de Lara ?', o: ['Croft', 'Drake', 'Belmont', 'Fisher', 'Marston'], a: 0 },
            { q: 'qui est Natla dans TR1 ?', o: ['Une antagoniste atlante', 'Une guide locale', 'Une archeologue alliee', 'La mere de Lara', 'Une journaliste'], a: 0 },
            { q: 'dans Tomb Raider Legend, quel artefact est recherche ?', o: ['Excalibur', 'Scion', 'Medaillon de Jade', 'Orbe d\'Amon', 'Aigle d\'or'], a: 0 },
            { q: 'dans TR Underworld, quel personnage revient comme rival principal ?', o: ['Amanda', 'Winston', 'Zip', 'Alister', 'Jonah'], a: 0 },
            { q: 'quel studio gere les episodes modernes (depuis Legend) ?', o: ['Crystal Dynamics', 'Core Design', 'Remedy', 'Bioware', 'Bethesda'], a: 0 },
            { q: 'quel est le metier de Lara ?', o: ['Archeologue-aventuriere', 'Pilote', 'Detective privee', 'Medic', 'Ingenieure navale'], a: 0 },
            { q: 'quelle vue caracterise les premiers Tomb Raider ?', o: ['Troisieme personne', 'Premiere personne', 'Vue isometrique fixe', 'Vue 2D laterale', 'RTS'], a: 0 },
            { q: 'dans Rise, quel objet est recherche dans Kitezh ?', o: ['Source divine', 'Scion', 'Masque de Cthulhu', 'Pierre philosophale', 'Calice rouge'], a: 0 },
            { q: 'dans Shadow, quelle civilisation est centrale ?', o: ['Maya/Inca', 'Grecque', 'Norse', 'Egyptienne', 'Babylonienne'], a: 0 },
            { q: 'quel est le manoir traditionnel de Lara ?', o: ['Croft Manor', 'Raven Hall', 'Ashford Keep', 'Drake House', 'Winter Lodge'], a: 0 },
            { q: 'quel personnage est un ami recurrent de Lara (trilogie reboot) ?', o: ['Jonah', 'Winston', 'Larson', 'Pierre', 'Werner'], a: 0 }
        ];

        return facts.map(f => ({ q: f.q, o: [...f.o], a: f.a }));
    }

    buildLowerLevelCentre (w, h)
    {
        this.buildRoomOverlay('centre2', w, h,
            'CENTRE -- Chappa\'ai',
            '"Place les 10 reliques dans l\'ordre du sphinx."',
            'hub2');

        const cx = w / 2;
        const cy = 376;
        const radius = 170;

        const ring = this.add.circle(cx, cy, 104, 0x3a3a3a, 0.95)
            .setStrokeStyle(4, 0x777777)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        ring.on('pointerdown', () => this.openPhase2OrderPanel());
        this.r('centre2', ring);

        const innerVoid = this.add.circle(cx, cy, 78, 0x2f1f12, 1).setDepth(9);
        this.r('centre2', innerVoid);

        this.r('centre2', this.add.text(cx, cy, 'ACTIVER', {
            fontFamily: 'Georgia', fontSize: 24, color: '#e2d2b6'
        }).setOrigin(0.5).setDepth(10));

        for (let i = 0; i < 10; i++)
        {
            const angle = -Math.PI / 2 + (i * Math.PI * 2) / 10;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            const slot = this.add.rectangle(x, y, 42, 42, 0x2a1b10, 0.95)
                .setStrokeStyle(2, 0xb48e58)
                .setDepth(9);
            this.r('centre2', slot);
            this.r('centre2', this.add.text(x, y, String(i + 1), {
                fontFamily: 'Georgia', fontSize: 15, color: '#f2dfbc'
            }).setOrigin(0.5).setDepth(10));
        }

        this.phase2CenterStatusText = this.add.text(cx, 610, '', {
            fontFamily: 'Georgia', fontSize: 20, color: '#d9edc5', align: 'center', wordWrap: { width: w - 240 }
        }).setOrigin(0.5).setDepth(10);
        this.r('centre2', this.phase2CenterStatusText);
        this.updatePhase2CollectedUI();
    }

    updatePhase2CollectedUI ()
    {
        const total = this.phase2RelicsCollected?.size ?? 0;
        this.phase2CollectedText?.setText('Reliques trouvees: ' + total + ' / 10');
        this.phase2CenterStatusText?.setText('Reliques disponibles: ' + total + ' / 10');
        this.updatePhase2NordClueText();
    }

    getPhase2NordRemainingCount ()
    {
        const nordRelicKeys = ['ankh', 'couronne', 'djed', 'lotus', 'masque', 'plume', 'scarabee', 'sceptre', 'uraeus'];
        let remaining = 0;
        nordRelicKeys.forEach(key => {
            if (!this.phase2RelicsCollected?.has(key)) remaining++;
        });
        return remaining;
    }

    updatePhase2NordClueText ()
    {
        if (!this.phase2NordClueText) return;
        const remaining = this.getPhase2NordRemainingCount();
        this.phase2NordClueText.setText('"Trouve les ' + remaining + ' reliques cachées dans ce mur."');

        if (remaining === 0 && !this.phase2NordWallSolved)
        {
            this.phase2NordWallSolved = true;
            this.playSfx('victory');
            this.updateMessage('Bravo, tu as trouvé toutes les reliques du mur.');
        }
    }

    triggerPhase2HubPortalActivation ()
    {
        if (this.phase2PortalActivated) return;

        this.phase2PortalActivated = true;
        this.phase2PortalReady = false;
        this.showRoom('hub2');

        const disk = this.phase2HubGateActivationDisk;
        const inner = this.phase2HubGateInner;
        const gate = this.phase2HubGate;
        if (!disk || !inner || !gate)
        {
            this.phase2PortalReady = true;
            return;
        }

        disk.setVisible(true).setAlpha(0).setScale(0.06);
        inner.setAlpha(1);
        gate.setStrokeStyle(4, 0x6fbfff);

        this.tweens.add({
            targets: inner,
            alpha: 0.2,
            duration: 520,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: disk,
            alpha: 0.95,
            scale: 1,
            duration: 900,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.playSfx('portalVictory');
                this.phase2PortalReady = true;
                this.tweens.add({
                    targets: disk,
                    alpha: { from: 0.82, to: 0.98 },
                    duration: 860,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                this.updateMessage('Le Chappa\'ai s\'active, tu peux le traverser');
            }
        });
    }

    openPhase2OrderPanel ()
    {
        if (this.phase2OrderPanelNodes.length > 0) return;
        if (!this.phase2SphinxSolved)
        {
            this.updateMessage('Le sphinx doit d\'abord te donner l\'ordre de pose.');
            return;
        }
        if ((this.phase2RelicsCollected?.size ?? 0) < 10)
        {
            this.updateMessage('Il te manque des reliques: explore les murs nord et sud.');
            return;
        }

        const w = this.scale.width;
        const h = this.scale.height;
        const nodes = [];
        const addNode = (obj) => { nodes.push(obj); return obj; };

        addNode(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55).setDepth(60).setInteractive());
        addNode(this.add.rectangle(w / 2, h / 2, 840, 520, 0x1a1109, 0.97).setStrokeStyle(3, 0xbf9150).setDepth(61));
        addNode(this.add.text(w / 2, h / 2 - 228, 'Ordonnancer les 10 reliques', {
            fontFamily: 'Georgia', fontSize: 32, color: '#f2dbab'
        }).setOrigin(0.5).setDepth(62));

        const names = {
            ankh: 'Ankh', amulette: 'Amulette', scarabee: 'Scarabee', djed: 'Djed', uraeus: 'Serpent',
            lotus: 'Lotus', sceptre: 'Sceptre', plume: 'Plume', couronne: 'Couronne', masque: 'Masque'
        };
        const icons = {
            ankh: '☥', amulette: '◇', scarabee: '🪲', djed: '𓊽', uraeus: '🐍',
            lotus: '✿', sceptre: '⚚', plume: '🪶', couronne: '👑', masque: '🎭'
        };
        const available = [...this.phase2SphinxOrder];
        const chosen = [];

        const lineText = addNode(this.add.text(w / 2, h / 2 - 176, 'Choix: ', {
            fontFamily: 'Georgia', fontSize: 20, color: '#d6f2ff', wordWrap: { width: 760 }
        }).setOrigin(0.5).setDepth(62));

        const status = addNode(this.add.text(w / 2, h / 2 + 170, '', {
            fontFamily: 'Georgia', fontSize: 20, color: '#f3e0c0'
        }).setOrigin(0.5).setDepth(62));

        const validate = () => {
            lineText.setText('Choix: ' + chosen.map(k => names[k]).join('  >  '));
            if (chosen.length < 10)
            {
                status.setText('Selection: ' + chosen.length + ' / 10');
                return;
            }

            const ok = chosen.every((k, i) => k === this.phase2SphinxOrder[i]);
            if (ok)
            {
                status.setText('Sequence validee. Le Chappa\'ai s\'active.');
                this.updateMessage('Sequence parfaite. Retour au Chappa\'ai...');
                this.time.delayedCall(800, () => {
                    nodes.forEach(n => n.destroy());
                    this.phase2OrderPanelNodes = [];
                    this.triggerPhase2HubPortalActivation();
                });
            }
            else
            {
                status.setText('Mauvais ordre. Recommence.');
                chosen.length = 0;
                validate();
            }
        };

        available.forEach((key, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);
            const x = w / 2 - 300 + col * 150;
            const y = h / 2 - 90 + row * 80;
            const bg = addNode(this.add.rectangle(x, y, 132, 48, 0x2d1d11, 0.95)
                .setStrokeStyle(2, 0xb79058)
                .setDepth(62)
                .setInteractive({ useHandCursor: true }));
            addNode(this.add.text(x, y, icons[key], {
                fontFamily: 'Georgia', fontSize: 26, color: '#f0dfbb'
            }).setOrigin(0.5).setDepth(63));
            bg.on('pointerdown', () => {
                if (chosen.length >= 10) return;
                chosen.push(key);
                validate();
            });
        });

        const close = addNode(this.add.rectangle(w / 2, h / 2 + 220, 180, 44, 0x4a2f1b, 0.95)
            .setStrokeStyle(2, 0xd5b375)
            .setDepth(62)
            .setInteractive({ useHandCursor: true }));
        addNode(this.add.text(w / 2, h / 2 + 220, 'Fermer', {
            fontFamily: 'Georgia', fontSize: 22, color: '#ffe8bf'
        }).setOrigin(0.5).setDepth(63));
        close.on('pointerdown', () => {
            nodes.forEach(n => n.destroy());
            this.phase2OrderPanelNodes = [];
        });

        validate();
        this.phase2OrderPanelNodes = nodes;
    }

    playOuestBeamAnimation (startPoint, centerPoint, mirrorNodes, centerSlot, onComplete, isEasy = false)
    {
        const normalPath = [
            { key: '4,4' },
            { key: '2,4' },
            { key: '2,3' },
            { key: '3,3' },
            { key: '3,2' },
            { key: '2,2' },
            { key: '2,3' },
            { key: '1,3' },
            { key: '1,1' },
            { key: '3,1' },
            { key: '3,2' },
            { key: '4,2' },
            { key: 'CENTER' }
        ];
        const easyPath = [
            { key: '4,4' },
            { key: '2,4' },
            { key: '2,3' },
            { key: '1,3' },
            { key: '1,1' },
            { key: '3,1' },
            { key: '3,2' },
            { key: '4,2' },
            { key: 'CENTER' }
        ];
        const steps = (isEasy ? easyPath : normalPath).map(step => {
            if (step.key === 'CENTER') return { x: centerPoint.x, y: centerPoint.y, key: 'CENTER' };
            return { x: mirrorNodes[step.key].x, y: mirrorNodes[step.key].y, key: step.key };
        });

        const beam = this.add.graphics().setDepth(16);
        this.ouestBeamGraphic = beam;
        const spark = this.add.circle(startPoint.x, startPoint.y, 7, 0xffa33a, 1).setDepth(17);
        this.r('ouest', beam);
        this.r('ouest', spark);

        const touched = new Set();

        const touchNode = (key) => {
            if (key === 'CENTER')
            {
                centerSlot.setColor('#ffcf8f');
                return;
            }
            if (touched.has(key)) return;
            touched.add(key);
            const node = mirrorNodes[key];
            if (!node) return;
            node.glyph.setColor('#ff5a5a');
            node.tile.setFillStyle(0x1f4a2b, 0.97);
            node.tile.setStrokeStyle(3, 0x9be2b3);
        };

        const drawBeam = (segmentIndex, currentX, currentY) => {
            beam.clear();
            beam.lineStyle(5, 0xff9b2f, 0.95);
            beam.beginPath();
            beam.moveTo(startPoint.x, startPoint.y);

            for (let i = 0; i < segmentIndex; i++)
            {
                beam.lineTo(steps[i].x, steps[i].y);
            }

            beam.lineTo(currentX, currentY);
            beam.strokePath();
        };

        const runSegment = (index) => {
            if (index >= steps.length)
            {
                this.tweens.add({
                    targets: spark,
                    alpha: 0,
                    duration: 220,
                    onComplete: () => {
                        spark.destroy();
                        if (onComplete) onComplete();
                    }
                });
                return;
            }

            const from = index === 0 ? startPoint : steps[index - 1];
            const to = steps[index];

            this.tweens.add({
                targets: spark,
                x: to.x,
                y: to.y,
                duration: 430,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    drawBeam(index, spark.x, spark.y);
                },
                onComplete: () => {
                    drawBeam(index + 1, to.x, to.y);
                    touchNode(to.key);
                    runSegment(index + 1);
                }
            });
        };

        drawBeam(0, startPoint.x, startPoint.y);
        runSegment(0);
    }

    // ------------------------------------------------------------
    // Resolution et Progression
    // ------------------------------------------------------------

    markRoomSolved (room)
    {
        if (this.puzzlesSolved[room]) return;
        this.playSfx('solve');
        this.puzzlesSolved[room] = true;
        const indicator = this.solvedIndicators[room];
        if (indicator) indicator.setText('✦').setColor('#f0d060');
        this.updateProgress();
        this.checkAllSolved();

        if (room === 'sud')
        {
            if (this.sudStoneCollectible)
            {
                this.sudStoneCollectible.glow.setVisible(true);
                this.sudStoneCollectible.glow.setData('locked', false);
                this.sudStoneCollectible.bg.setVisible(true).setInteractive({ useHandCursor: true });
                this.sudStoneCollectible.bg.setData('locked', false);
                this.sudStoneCollectible.iconText.setVisible(true);
                this.sudStoneCollectible.iconText.setData('locked', false);
            }
            this.updateMessage('Balance equilibree! Le Coeur d\'Atoum apparait en bas.');
            return;
        }

        if (room === 'nord')
        {
            this.updateMessage('Enigme resolue ! Retourne a la chambre centrale.');
            return;
        }

        if (room === 'est')
        {
            if (this.duskStonePlacedOnSarcophagus)
            {
                // In this flow, center progression takes over, so the classic exit button must stay hidden.
                this.exitButton?.setVisible(false);
                this.exitText?.setVisible(false);
                this.updateMessage('L\'acces au Chappa\'ai est ouvert et allimenter');
            }
            else
            {
                this.updateMessage('L\'acces au Chappa\'ai est deverouille, il ne manque qu\'une source d\'energie.');
            }
            this.updateSarcophagusPowerVisual();
            return;
        }

        this.updateMessage('Enigme resolue ! Retourne a la chambre centrale.');
    }

    updateProgress ()
    {
        const count = Object.values(this.puzzlesSolved).filter(Boolean).length;
        this.progressText.setText('Enigmes resolues: ' + count + ' / 4');
    }

    checkAllSolved ()
    {
        if (Object.values(this.puzzlesSolved).every(Boolean))
        {
            this.playSfx('victory');
            this.exitButton?.setVisible(false);
            this.exitText?.setVisible(false);
            this.updateMessage('Tous les sceaux sont levés. Le sarcophage central peut maintenant être activé.');
        }
    }

    handleSarcophagusClick ()
    {
        if (this.duskStonePlacedOnSarcophagus)
        {
            if (!this.puzzlesSolved.est)
            {
                this.updateMessage('C\'est coince, quelque chose bloque l\'ouverture.');
                return;
            }
            this.updateMessage('Le Coeur d\'Atoum charge est bien en place dans le creux du sarcophage.');
            this.updateSarcophagusPowerVisual();
            this.tryOpenCenterRoom();
            return;
        }

        if (this.puzzlesSolved.est)
        {
            this.updateMessage('Ca bouge un peu, mais ca reste bloque, on vois par contre un creux rond pour y mettre une pierre peut etre?');
        }
        else
        {
            this.updateMessage('Le sarcophage presente un creux rond pour y inserer une pierre.');
        }

        if (this.inventory.hasItem('pierre_crepuscule_chargee'))
        {
            this.inventory.removeItem('pierre_crepuscule_chargee');
            this.duskStonePlacedOnSarcophagus = true;
            if (this.sarcophagusSocketText)
            {
                this.sarcophagusSocketText.setText('●').setColor('#ffd18f');
            }
            this.playSfx('place');
            this.updateMessage('Le Coeur d\'Atoum chargé tient parfaitement dans le creux du sarcophage.');
            this.updateSarcophagusPowerVisual();
            return;
        }

        if (this.inventory.hasItem('pierre_crepuscule_brute'))
        {
            this.updateMessage('Le coeur d\'Atoum a la bonne taille, mais il est rejete par le sarcophage...');
        }
    }

    tryOpenCenterRoom ()
    {
        if (!this.puzzlesSolved.est) return;
        if (!this.duskStonePlacedOnSarcophagus) return;

        if (!this.centreIntroPlayed)
        {
            if (this.centreIntroPlaying) return;
            this.playCentreIntroAnimation(() => {
                this.centreIntroPlayed = true;
                this.showRoom('centre');
                this.startCentreScarabChallenge();
            });
            return;
        }

        this.showRoom('centre');
        if (!this.centreScarabChallengeStarted && !this.centreScarabChallengeCompleted)
        {
            this.startCentreScarabChallenge();
        }
    }

    getCentreScarabTotal ()
    {
        if (this.difficulty === DIFFICULTY.EASY) return 10;
        if (this.difficulty === DIFFICULTY.HARD) return 30;
        return 15;
    }

    getCentreScarabSpeedRange ()
    {
        if (this.difficulty === DIFFICULTY.EASY)
        {
            return { min: 0.45, max: 1.2 };
        }
        return { min: 0.9, max: 2.4 };
    }

    playCentreIntroAnimation (onDone)
    {
        this.centreIntroPlaying = true;
        const w = this.scale.width;
        const h = this.scale.height;
        const cx = w / 2;
        const cy = h / 2;

        const nodes = [];
        const addNode = (obj) => {
            nodes.push(obj);
            return obj;
        };

        addNode(this.add.rectangle(cx, cy, w, h, 0x000000, 0.7).setDepth(80).setInteractive());
        const chamber = addNode(this.add.rectangle(cx, cy, 660, 390, 0x1b120a, 0.96).setStrokeStyle(3, 0xb17d3d).setDepth(81));
        const base = addNode(this.add.rectangle(cx, cy + 28, 300, 120, 0x6d4723, 0.98).setStrokeStyle(3, 0xd3a867).setDepth(82));
        const lid = addNode(this.add.rectangle(cx, cy - 8, 280, 52, 0x886037, 0.98).setStrokeStyle(2, 0xe0bf86).setDepth(83));
        const title = addNode(this.add.text(cx, cy - 146, 'Le sarcophage s\'ouvre...', {
            fontFamily: 'Georgia', fontSize: 30, color: '#f7dca8'
        }).setOrigin(0.5).setDepth(84));

        const scarabBursts = [];
        for (let i = 0; i < 42; i++)
        {
            const dot = this.add.circle(cx, cy + 14, Phaser.Math.Between(2, 4), 0x5b7a30, 0.95).setDepth(84);
            scarabBursts.push(dot);
            addNode(dot);
        }

        this.tweens.add({
            targets: lid,
            y: cy - 132,
            angle: -30,
            duration: 950,
            ease: 'Sine.easeInOut'
        });

        scarabBursts.forEach((dot, idx) => {
            this.tweens.add({
                targets: dot,
                x: cx + Phaser.Math.Between(-290, 290),
                y: cy + Phaser.Math.Between(-120, 155),
                alpha: { from: 0.95, to: 0.0 },
                duration: 650 + (idx % 8) * 70,
                delay: 220 + (idx % 10) * 30,
                ease: 'Quad.easeOut'
            });
        });

        this.time.delayedCall(1650, () => {
            this.centreIntroPlaying = false;
            nodes.forEach(n => n.destroy());
            this.animateHubSarcophagusLid();
            onDone?.();
            if (chamber && base && title) { /* keep lints quiet for scene graph references */ }
        });
    }

    animateHubSarcophagusLid ()
    {
        if (!this.hubSarcophagusLid) return;
        if (this.hubSarcophagusLid.getData('opened')) return;
        this.hubSarcophagusLid.setData('opened', true);

        this.tweens.add({
            targets: this.hubSarcophagusLid,
            angle: -45,
            duration: 900,
            ease: 'Sine.easeInOut'
        });
    }

    startCentreScarabChallenge ()
    {
        if (this.centreScarabChallengeStarted || this.centreScarabChallengeCompleted) return;
        if (!this.centreScarabArena) return;

        this.centreScarabChallengeStarted = true;
        this.centreScarabTotal = this.getCentreScarabTotal();
        this.centreScarabsRemaining = this.centreScarabTotal;
        this.updateCentreCounter();
        this.centreDescendButton?.setVisible(false);
        this.centreDescendText?.setVisible(false);
        const speedRange = this.getCentreScarabSpeedRange();

        for (let i = 0; i < this.centreScarabTotal; i++)
        {
            const x = Phaser.Math.Between(this.centreScarabArena.left, this.centreScarabArena.right);
            const y = Phaser.Math.Between(this.centreScarabArena.top + 70, this.centreScarabArena.bottom);
            const speed = Phaser.Math.FloatBetween(speedRange.min, speedRange.max);
            const bug = this.add.text(x, y, '🪲', {
                fontFamily: 'Segoe UI Emoji',
                fontSize: Phaser.Math.Between(18, 24)
            }).setOrigin(0.5).setDepth(12).setInteractive({ useHandCursor: false });

            const node = {
                sprite: bug,
                vx: Phaser.Math.FloatBetween(-1.8, 1.8),
                vy: Phaser.Math.FloatBetween(-1.8, 1.8),
                speed,
                alive: true
            };

            bug.on('pointerdown', () => this.squashCentreScarab(node));
            this.centreScarabNodes.push(node);
            this.r('centre', bug);
        }

        this.centreScarabTickEvent?.remove(false);
        this.centreScarabTickEvent = this.time.addEvent({
            delay: 33,
            loop: true,
            callback: () => this.updateCentreScarabs()
        });
    }

    updateCentreCounter ()
    {
        if (!this.centreCounterText) return;
        this.centreCounterText.setText('Scarabes restants: ' + this.centreScarabsRemaining + ' / ' + this.centreScarabTotal);
    }

    updateCentreScarabs ()
    {
        if (this.currentRoom !== 'centre') return;
        if (!this.centreScarabChallengeStarted || this.centreScarabChallengeCompleted) return;
        if (!this.centreScarabArena) return;
        if (this.debugHotspots) return;

        const pointer = this.input.activePointer;
        const bounds = this.centreScarabArena;

        this.centreScarabNodes.forEach(node => {
            if (!node.alive || !node.sprite.active) return;

            const bug = node.sprite;
            const dx = bug.x - pointer.x;
            const dy = bug.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 95 && dist > 0.001)
            {
                const repel = (95 - dist) / 95;
                node.vx += (dx / dist) * 0.58 * repel;
                node.vy += (dy / dist) * 0.58 * repel;
            }

            node.vx += Phaser.Math.FloatBetween(-0.16, 0.16);
            node.vy += Phaser.Math.FloatBetween(-0.16, 0.16);
            node.vx = Phaser.Math.Clamp(node.vx, -3.2, 3.2);
            node.vy = Phaser.Math.Clamp(node.vy, -3.2, 3.2);

            bug.x += node.vx * node.speed;
            bug.y += node.vy * node.speed;

            if (bug.x < bounds.left)
            {
                bug.x = bounds.left;
                node.vx = Math.abs(node.vx);
            }
            else if (bug.x > bounds.right)
            {
                bug.x = bounds.right;
                node.vx = -Math.abs(node.vx);
            }

            if (bug.y < bounds.top)
            {
                bug.y = bounds.top;
                node.vy = Math.abs(node.vy);
            }
            else if (bug.y > bounds.bottom)
            {
                bug.y = bounds.bottom;
                node.vy = -Math.abs(node.vy);
            }
        });
    }

    squashCentreScarab (node)
    {
        if (!node || !node.alive || this.centreScarabChallengeCompleted) return;
        node.alive = false;
        node.sprite.disableInteractive();
        this.playSfx('pickup');
        this.tweens.add({
            targets: node.sprite,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 0.45,
            duration: 120,
            onComplete: () => node.sprite.destroy()
        });

        this.centreScarabsRemaining = Math.max(0, this.centreScarabsRemaining - 1);
        this.updateCentreCounter();
        if (this.centreScarabsRemaining === 0)
        {
            this.playSfx('victory');
            this.finishCentreScarabChallenge();
        }
    }

    finishCentreScarabChallenge ()
    {
        this.centreScarabChallengeCompleted = true;
        this.centreScarabTickEvent?.remove(false);
        this.centreScarabTickEvent = null;

        this.updateMessage('ouf c\'est néttoyer, vous appercevez un escalier dans le sarcophage');
        if (this.centreDescendButton && this.centreDescendText)
        {
            this.centreDescendButton.setVisible(true);
            this.centreDescendText.setVisible(true);
        }
    }

    setCentreCursorActive (active)
    {
        if (!this.centreShoeCursor) return;
        const shoeCursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><path d=\'M4 20 L12 14 L19 15 L24 19 L28 20 L28 24 L4 24 Z\' fill=\'%23543a22\' stroke=\'%2328180b\' stroke-width=\'1.6\'/><ellipse cx=\'23\' cy=\'24\' rx=\'5\' ry=\'1.2\' fill=\'%23342518\'/></svg>") 16 16, auto';
        if (active)
        {
            this.input.setDefaultCursor(shoeCursor);
            this.centreShoeCursor.setVisible(false);
            return;
        }

        this.input.setDefaultCursor('default');
        this.centreShoeCursor.setVisible(false);
    }

    handleCentrePointerMove (pointer)
    {
        if (!this.centreShoeCursor) return;
        if (this.currentRoom !== 'centre') return;
        this.centreShoeCursor.setVisible(false);
    }

    updateSarcophagusPowerVisual ()
    {
        if (!this.sarcophagusPowerOval) return;

        this.tweens.killTweensOf(this.sarcophagusPowerOval);
        this.sarcophagusPowerOval
            .setVisible(false)
            .setData('locked', true)
            .setData('fillStarted', false)
            .setData('pulseStarted', false)
            .setFillStyle(0x1e90c8, 0)
            .setStrokeStyle(2, 0x76c8ff, 0)
            .setScale(1, 1)
            .setAlpha(1);
    }

    // ------------------------------------------------------------
    // Collectibles
    // ------------------------------------------------------------

    createCollectible (room, x, y, key, label, icon, hint)
    {
        const glow = this.add.circle(x, y, 20, 0xf0d060, 0.2).setDepth(50);
        const bg = this.add.circle(x, y, 14, 0x5a3d1a, 0.92)
            .setStrokeStyle(2, 0xeec050).setDepth(51)
            .setInteractive({ useHandCursor: true });
        const iconText = this.add.text(x, y, icon, {
            fontFamily: 'Georgia', fontSize: 16, color: '#f5e5a0'
        }).setOrigin(0.5).setDepth(52);

        glow.setData('collectibleKey', key).setData('collected', false);
        bg.setData('collectibleKey', key).setData('collected', false);
        iconText.setData('collectibleKey', key).setData('collected', false);

        this.tweens.add({
            targets: glow,
            alpha: { from: 0.06, to: 0.38 },
            duration: 950, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        if (this.inventory?.hasItem(key))
        {
            glow.setData('collected', true).setVisible(false);
            bg.setData('collected', true).setVisible(false).disableInteractive();
            iconText.setData('collected', true).setVisible(false);
        }

        bg.on('pointerdown', () => {
            if (this.inventory.hasItem(key))
            {
                this.updateMessage(label + ' est deja dans votre sac.');
                return;
            }
            this.inventory.addItem(key, label, icon, hint);
            glow.setData('collected', true);
            bg.setData('collected', true);
            iconText.setData('collected', true);
            glow.setVisible(false);
            bg.setVisible(false);
            bg.disableInteractive();
            iconText.setVisible(false);
        });
        bg.on('pointerover', () => {
            bg.setFillStyle(0x7a5530, 0.95);
            this.updateMessage('[ Ramasser: ' + label + ' ]');
        });
        bg.on('pointerout', () => { bg.setFillStyle(0x5a3d1a, 0.92); });

        this.r(room, glow);
        this.r(room, bg);
        this.r(room, iconText);

        return { glow, bg, iconText };
    }

    requestPaidHelp ()
    {
        if (this.hasTriggeredGameOver) return false;

        const helpCostSeconds = this.getPaidHelpCostMinutes() * 60;
        this.timeRemainingSeconds = Math.max(0, this.timeRemainingSeconds - helpCostSeconds);
        this.updateTimerText();

        const hint = this.getContextualHelpText();
        this.playSfx('openNote');
        this.updateMessage('Aide utilisée (-' + String(this.getPaidHelpCostMinutes()).padStart(2, '0') + ':00).');
        this.showHelpWindow(hint, {
            showOracleImage: this.currentRoom === 'sud2' && !this.phase2OracleVisionSolved
        });

        if (this.timeRemainingSeconds <= 0)
        {
            this.triggerCollapseGameOver();
        }

        return true;
    }

    getContextualHelpText ()
    {
        if (this.currentRoom === 'hub')
        {
            const remaining = Object.entries(this.puzzlesSolved)
                .filter(([, solved]) => !solved)
                .map(([room]) => room.toUpperCase());
            if (remaining.length === 0)
            {
                return 'Les quatre énigmes sont résolues. Vérifie le sarcophage central.';
            }
            return 'Concentre-toi sur les salles encore non résolues: ' + remaining.join(', ') + '.';
        }

        if (this.currentRoom === 'est')
        {
            if (this.puzzlesSolved.est) return 'Cette énigme est déjà résolue.';
            return 'Observe les détails de chaque visage divin: l\'association symbole-nom demande de comparer les traits visibles.';
        }

        if (this.currentRoom === 'nord')
        {
            if (this.puzzlesSolved.nord) return 'Le calcul des reliques est déjà validé.';
            if (this.difficulty === DIFFICULTY.HARD)
            {
                return 'En difficile, fais des suppositions guidées avec les symboles plus grand que / plus petit que. Les chiffres vont de 0 à 8. Tu as déjà compris que Djed vaut 0, et Lotus vaut 1.';
            }
            return 'Pose d\'abord les valeurs évidentes, puis vérifie chaque ligne et colonne pour éliminer les incohérences.';
        }

        if (this.currentRoom === 'sud')
        {
            if (this.puzzlesSolved.sud) return 'La balance est déjà équilibrée.';
            if (this.difficulty !== DIFFICULTY.EASY && !this.puzzlesSolved.nord)
            {
                return 'Résous d\'abord le Nord pour déduire les poids, puis combine les reliques pour atteindre le poids sacré.';
            }
            return 'Le poids final visé est sacré: teste les combinaisons en observant la somme de chaque relique.';
        }

        if (this.currentRoom === 'ouest')
        {
            if (this.puzzlesSolved.ouest) return 'L\'énigme des miroirs est déjà résolue.';
            if (this.difficulty !== DIFFICULTY.EASY)
            {
                return 'Les miroirs sont amplificateurs, et la lumière du crépuscule est faible: il faut utiliser tous les miroirs.';
            }
            return 'Aligne chaque miroir pour guider le rayon jusqu\'au réceptacle final.';
        }

        if (this.currentRoom === 'centre')
        {
            if (this.centreScarabChallengeCompleted) return 'Le passage est déjà ouvert: tu peux descendre.';
            return 'Reste mobile avec la souris pour regrouper les scarabées, puis clique vite pour les écraser un par un.';
        }

        if (this.currentRoom === 'hub2')
        {
            return 'Dans cette zone, le décor est interactif: Sphinx, œil d\'Horus, papyrus nord et escaliers.';
        }

        if (this.currentRoom === 'nord2')
        {
            const remaining = this.getPhase2NordRemainingCount();
            if (remaining <= 0) return 'Le mur papyrus est entièrement résolu.';
            return 'Inspecte les zones décoratives du mur: il reste ' + remaining + ' reliques cachées à trouver.';
        }

        if (this.currentRoom === 'sud2')
        {
            if (this.phase2OracleVisionSolved) return 'La vision est déjà recomposée: retourne voir le Sphinx.';
            return 'Fais glisser les tuiles adjacentes à la case vide pour recomposer exactement l\'image finale affichée en aperçu.';
        }

        if (this.currentRoom === 'ouest2')
        {
            if (!this.phase2OracleVisionSolved)
            {
                return 'Le Sphinx restera silencieux tant que la vision de l\'oracle n\'est pas recomposée au Sud.';
            }
            if (this.phase2SphinxSolved)
            {
                return 'Le Sphinx a déjà donné l\'ordre. Utilise-le au Chappa\'ai (centre bas).';
            }
            return 'Réponds aux questions du Sphinx avec méthode: élimine les options incohérentes avant de valider.';
        }

        if (this.currentRoom === 'centre2')
        {
            if (this.phase2PortalReady)
            {
                return 'Le Chappa\'ai est activé: traverse le portail central.';
            }
            if (!this.phase2SphinxSolved)
            {
                return 'Tu dois d\'abord obtenir l\'ordre des 10 reliques donné par le Sphinx.';
            }
            return 'Place les 10 reliques exactement dans l\'ordre du Sphinx pour activer le disque bleu.';
        }

        return 'Observe la scène active: chaque énigme suit la logique des indices déjà affichés dans la pièce.';
    }

    showHelpWindow (hint, options = {})
    {
        this.helpOverlayNodes?.forEach(node => node?.destroy());
        this.helpOverlayNodes = [];

        const w = this.scale.width;
        const h = this.scale.height;
        const showOracleImage = !!options.showOracleImage && this.textures.exists('oracle-vision');

        const veil = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.35)
            .setDepth(220)
            .setScrollFactor(0)
            .setInteractive();

        const panelHeight = showOracleImage ? 520 : 300;
        const panel = this.add.rectangle(w / 2, h / 2, 760, panelHeight, 0x130d09, 0.78)
            .setStrokeStyle(2, 0xb07820)
            .setDepth(221)
            .setScrollFactor(0)
            .setInteractive();

        const title = this.add.text(w / 2, h / 2 - panelHeight / 2 + 34, 'Aide contextuelle', {
            fontFamily: 'Georgia',
            fontSize: 28,
            color: '#f0d080'
        }).setOrigin(0.5).setDepth(222).setScrollFactor(0);

        const bodyY = showOracleImage ? h / 2 - 86 : h / 2;
        const body = this.add.text(w / 2, bodyY, hint, {
            fontFamily: 'Georgia',
            fontSize: 22,
            color: '#f3e3c4',
            align: 'center',
            wordWrap: { width: 680 }
        }).setOrigin(0.5).setDepth(222).setScrollFactor(0);

        const nodes = [veil, panel, title, body];

        if (showOracleImage)
        {
            const oracleTitle = this.add.text(w / 2, h / 2 + 52, 'Aperçu de la vision finale', {
                fontFamily: 'Georgia',
                fontSize: 18,
                color: '#d9c49a'
            }).setOrigin(0.5).setDepth(222).setScrollFactor(0);

            const image = this.add.image(w / 2, h / 2 + 164, 'oracle-vision')
                .setDisplaySize(260, 196)
                .setDepth(222)
                .setScrollFactor(0);
            nodes.push(oracleTitle, image);
        }

        const footer = this.add.text(w / 2, h / 2 + panelHeight / 2 - 24,
            'Clique pour fermer', {
                fontFamily: 'Georgia',
                fontSize: 14,
                color: '#caa06a'
            }).setOrigin(0.5).setDepth(222).setScrollFactor(0);
        nodes.push(footer);

        this.helpOverlayNodes = nodes;

        const close = () => {
            this.helpOverlayNodes?.forEach(node => node?.destroy());
            this.helpOverlayNodes = [];
        };

        veil.once('pointerdown', close);
        panel.once('pointerdown', close);
        this.time.delayedCall(9000, () => {
            if (this.helpOverlayNodes.length > 0) close();
        });
    }

    updateMessage (text)
    {
        if (!this.showHints)
        {
            this.crystalHintGlyphsText.setVisible(false);
            this.messageText.setVisible(false);
            return;
        }

        this.messageText.setVisible(true);
        if (text.startsWith('"Balance du Sud:'))
        {
            this.messageText
                .setY(670)
                .setText('"Balance du Sud: nombres sacres" -Parchemin.');

            this.crystalHintGlyphsText
                .setY(612)
                .setText(SOUTH_BALANCE_GUIDE)
                .setVisible(true);
            return;
        }

        this.crystalHintGlyphsText.setVisible(false);
        this.messageText.setY(660).setText(text);
    }
}





