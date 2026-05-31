import { Scene } from 'phaser';
import anubisImg from '../../images/Anubis.png';
import apophisImg from '../../images/Apophis.png';
import aresImg from '../../images/Ares.png';
import baalImg from '../../images/Baal.png';
import cronusImg from '../../images/Cronus.png';
import heruUrImg from '../../images/Heru-Ur.png';
import molocImg from '../../images/Moloc.png';
import nirrtiImg from '../../images/Nirrti.png';
import raImg from '../../images/Ra.png';
import sethImg from '../../images/Seth.png';
import sokarImg from '../../images/Sokar.png';
import svarogImg from '../../images/Svarog.png';
import yuImg from '../../images/Yu.png';
import papyrusImg from '../../Murs/Papyrus.png';
import puzzleOracleImg from '../../Murs/puzzleOracle.png';
import horusImg from '../../Murs/horus.png';
import bonusScarabesPartyImg from '../../bonus/scarabéesParty.jpeg';
import bonusVeroCroftImg from '../../bonus/VeroCroft.jpeg';
import bonusPuzzleOracleImg from '../../bonus/puzzleOracle.png';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.image('logo', 'assets/logo.png');
        this.load.image('star', 'assets/star.png');

        this.load.image('nord-anubis', anubisImg);
        this.load.image('nord-apophis', apophisImg);
        this.load.image('nord-ares', aresImg);
        this.load.image('nord-baal', baalImg);
        this.load.image('nord-cronus', cronusImg);
        this.load.image('nord-heru-ur', heruUrImg);
        this.load.image('nord-moloc', molocImg);
        this.load.image('nord-nirrti', nirrtiImg);
        this.load.image('nord-ra', raImg);
        this.load.image('nord-seth', sethImg);
        this.load.image('nord-sokar', sokarImg);
        this.load.image('nord-svarog', svarogImg);
        this.load.image('nord-yu', yuImg);
        this.load.image('papyrus-wall', papyrusImg);
        this.load.image('oracle-vision', puzzleOracleImg);
        this.load.image('oracle-horus', horusImg);
        this.load.image('bonus-scarabees-party', bonusScarabesPartyImg);
        this.load.image('bonus-vero-croft', bonusVeroCroftImg);
        this.load.image('bonus-puzzle-oracle', bonusPuzzleOracleImg);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the intro cinematic before showing the title screen.
        this.scene.start('IntroCinematic');
    }
}
