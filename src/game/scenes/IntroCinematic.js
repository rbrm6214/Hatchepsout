import * as Phaser from 'phaser';

export class IntroCinematic extends Phaser.Scene
{
    skipRequested;
    backdrop;

    constructor ()
    {
        super('IntroCinematic');
        this.skipRequested = false;
        this.backdrop = null;
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#050403');

        this.createBackdrop(width, height);
        this.ensureTitleMusicRunning();

        const title = this.add.text(width / 2, height * 0.2, 'LES SCEAUX DE HATCHEPSOUT', {
            fontFamily: 'Georgia',
            fontSize: 44,
            color: '#f5d18a',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const story = this.add.text(width / 2, height * 0.55, '', {
            fontFamily: 'Georgia',
            fontSize: 40,
            color: '#efe2bc',
            align: 'center',
            wordWrap: { width: 930 },
            lineSpacing: 10
        }).setOrigin(0.5).setAlpha(0);

        const hint = this.add.text(width / 2, height - 42, 'Cliquer ou appuyer sur Espace, Entree, Echap pour passer', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#d9c38c'
        }).setOrigin(0.5).setAlpha(0.8);

        const lines = [
            'Egypte, 31 mai 2026. Dans le sanctuaire secret de Deir el-Bahari...',
            'Après une vie de famille tout ce qu\'il y a de plus normal et bien remplie,',
            'Veronique, jeune diplômée en archéologie,',
            'rêve de suivre les traces de son idôle : "Lara Croft"! et commence son exploration.',
            'Un mecanisme antique se declenche, (en fait c\'est simplement un piege qu\'elle a enclenchée car innexpérimentée ^^.)', 
            'La chambre funeraire se referme alors derriere elle.',
            'Les murs racontent la légitimité de la reine Hatchepsout, grande femme de l\'histoire devenue Pharaon.',
            'Chaque fresque est une enigme. Chaque enigme est un serment de pierre.',
            'Véro (de son petit nom) doit maintenant dechiffrer les sceaux, pour s\'en sortir vivante (et peut etre se rapprocher de Lara).'
        ];

        this.installSkipHandlers();

        // Phaser 4: createTimeline removed — use chained onComplete tweens
        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1200,
            ease: 'Sine.easeOut',
            onComplete: () => this.playLine(story, hint, lines, 0)
        });
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

    createBackdrop (width, height)
    {
        this.backdrop = this.add.graphics().setDepth(0);
        this.redrawBackdrop(0);
    }

    redrawBackdrop (index)
    {
        if (!this.backdrop) return;

        const g = this.backdrop;
        const width = this.scale.width;
        const height = this.scale.height;
        g.clear();

        g.fillGradientStyle(0x1b1308, 0x1b1308, 0x050403, 0x050403, 1);
        g.fillRect(0, 0, width, height);
        g.fillStyle(0x100b05, 0.95);
        g.fillRect(0, height * 0.78, width, height * 0.22);

        const drawStars = () => {
            for (let i = 0; i < 26; i++)
            {
                const x = 28 + (i * 39 + i * i * 7) % (width - 56);
                const y = 24 + (i * 17 + i * 13) % Math.floor(height * 0.62);
                g.fillStyle(0xf5cf8b, 0.16 + (i % 5) * 0.06);
                g.fillCircle(x, y, (i % 3) + 1);
            }
        };

        const drawPerson = (x, y, scale = 1, color = 0x20140a) => {
            g.fillStyle(color, 1);
            g.fillCircle(x, y - 22 * scale, 9 * scale);
            g.fillRect(x - 8 * scale, y - 12 * scale, 16 * scale, 40 * scale);
            g.fillRect(x - 13 * scale, y + 24 * scale, 8 * scale, 28 * scale);
            g.fillRect(x + 5 * scale, y + 24 * scale, 8 * scale, 28 * scale);
        };

        const drawCat = (x, y, scale = 1, color = 0x20140a) => {
            g.fillStyle(color, 1);
            g.fillEllipse(x, y, 24 * scale, 12 * scale);
            g.fillCircle(x + 10 * scale, y - 5 * scale, 6 * scale);
            g.fillTriangle(x + 14 * scale, y - 9 * scale, x + 9 * scale, y - 16 * scale, x + 18 * scale, y - 14 * scale);
            g.fillTriangle(x + 8 * scale, y - 9 * scale, x + 3 * scale, y - 16 * scale, x + 12 * scale, y - 14 * scale);
        };

        const drawPyramids = () => {
            g.fillStyle(0x2e2011, 1);
            g.fillTriangle(100, height, width * 0.42, height * 0.34, width * 0.63, height);
            g.fillStyle(0x22170b, 1);
            g.fillTriangle(width * 0.37, height, width * 0.62, height * 0.28, width * 0.87, height);
        };

        switch (index)
        {
            case 1: {
                drawStars();
                const y = height * 0.66;
                const famColor = 0x6f4a29;
                const catColor = 0x8b6036;
                g.fillStyle(0xf6d38f, 0.18);
                g.fillEllipse(width * 0.79, y + 40, 220, 84);
                // famille: 1 homme, 1 femme, 3 garcons, 2 chats
                drawPerson(width * 0.22, y, 1.2, famColor);
                drawPerson(width * 0.34, y, 1.16, famColor);
                drawPerson(width * 0.47, y + 12, 0.86, famColor);
                drawPerson(width * 0.56, y + 14, 0.82, famColor);
                drawPerson(width * 0.65, y + 12, 0.86, famColor);
                drawCat(width * 0.76, y + 42, 1.1, catColor);
                drawCat(width * 0.84, y + 47, 1.0, catColor);
                break;
            }
            case 2: {
                drawStars();
                drawPerson(width * 0.5, height * 0.65, 1.3);
                g.fillStyle(0x2a1a0c, 1);
                g.fillRect(width * 0.45, height * 0.5, 96, 8);
                g.fillTriangle(width * 0.5, height * 0.5, width * 0.56, height * 0.54, width * 0.44, height * 0.54);
                break;
            }
            case 3: {
                drawPyramids();
                drawPerson(width * 0.26, height * 0.68, 1.1);
                g.fillStyle(0xe8b35a, 0.35);
                g.fillCircle(width * 0.27, height * 0.54, 15);
                g.fillRect(width * 0.27, height * 0.54, 170, 5);
                break;
            }
            case 4: {
                drawPyramids();
                g.fillStyle(0x2a1a0c, 1);
                for (let i = 0; i < 12; i++)
                {
                    const x = 70 + i * 82;
                    g.fillTriangle(x, height * 0.78, x + 28, height * 0.69, x + 56, height * 0.78);
                }
                break;
            }
            case 5: {
                g.fillStyle(0x2b1c10, 1);
                g.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.58);
                g.fillStyle(0x50321a, 1);
                g.fillRect(width * 0.47, height * 0.2, width * 0.06, height * 0.58);
                break;
            }
            case 6: {
                g.fillStyle(0x3b2614, 1);
                g.fillRect(width * 0.15, height * 0.16, width * 0.7, height * 0.62);
                g.fillStyle(0xc8922e, 0.55);
                for (let i = 0; i < 9; i++) g.fillRect(width * 0.2 + i * 70, height * 0.28, 10, 220);
                g.fillCircle(width * 0.5, height * 0.42, 24);
                g.fillTriangle(width * 0.5, height * 0.3, width * 0.56, height * 0.36, width * 0.44, height * 0.36);
                break;
            }
            case 7: {
                g.fillStyle(0x352314, 1);
                g.fillRect(width * 0.12, height * 0.2, width * 0.76, height * 0.56);
                g.fillStyle(0xc8922e, 0.55);
                for (let r = 0; r < 4; r++)
                {
                    for (let c = 0; c < 11; c++)
                    {
                        const x = width * 0.16 + c * 70;
                        const y = height * 0.26 + r * 72;
                        if ((r + c) % 3 === 0) g.fillCircle(x, y, 5);
                        else if ((r + c) % 3 === 1) g.fillRect(x - 3, y - 8, 6, 16);
                        else g.fillTriangle(x, y - 8, x - 6, y + 8, x + 6, y + 8);
                    }
                }
                break;
            }
            case 8: {
                drawPyramids();
                drawPerson(width * 0.48, height * 0.66, 1.25);
                g.fillStyle(0xf7b249, 0.5);
                g.fillCircle(width * 0.53, height * 0.49, 16);
                g.fillStyle(0xf7b249, 0.2);
                g.fillCircle(width * 0.53, height * 0.49, 40);
                break;
            }
            default:
                drawPyramids();
                drawStars();
                break;
        }
    }

    installSkipHandlers ()
    {
        const requestSkip = () => {
            if (this.skipRequested)
            {
                return;
            }

            this.skipRequested = true;
            this.goToMenu();
        };

        this.input.once('pointerdown', requestSkip);

        this.input.keyboard.once('keydown-SPACE', requestSkip);
        this.input.keyboard.once('keydown-ENTER', requestSkip);
        this.input.keyboard.once('keydown-ESC', requestSkip);
    }

    playLine (story, hint, lines, index)
    {
        if (this.skipRequested) return;

        if (index >= lines.length)
        {
            // All lines shown — fade out and go to menu
            this.tweens.add({
                targets: [story, hint],
                alpha: 0,
                duration: 600,
                ease: 'Sine.easeIn',
                onComplete: () => this.goToMenu()
            });
            return;
        }

        // Fade out current text
        this.tweens.add({
            targets: story,
            alpha: 0,
                duration: 600,
            onComplete: () => {
                if (this.skipRequested) return;
                story.setText(lines[index]);
                this.redrawBackdrop(index);
                // Fade in
                this.tweens.add({
                    targets: story,
                    alpha: 1,
                        duration: 1300,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        if (this.skipRequested) return;
                        // Hold, then show next line
                            this.time.delayedCall(4800, () => {
                            this.playLine(story, hint, lines, index + 1);
                        });
                    }
                });
            }
        });
    }

    goToMenu ()
    {
        this.scene.start('MainMenu');
    }
}