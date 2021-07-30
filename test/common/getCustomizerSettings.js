'use strict'
const expect = require('chai').expect;
const getCustomizerSettings = require('../../routines/getCustomizerSettings');

describe('getCustomizerSettings', function() {
    context('verify default customizer settings', function() {
        it('allows quickswap', function () {
            expect(getCustomizerSettings().allow_quickswap).to.be.true;
        });

        it('no glitches', function () {
            expect(getCustomizerSettings().glitches).to.equal('none');
        });

        it('advanced item placement', function () {
            expect(getCustomizerSettings().item_placement).to.equal('advanced');
        });

        it('standard dungeon item placement', function () {
            expect(getCustomizerSettings().dungeon_items).to.equal('standard');
        });

        it('advanced item placement', function () {
            expect(getCustomizerSettings().item_placement).to.equal('advanced');
        });

        it('items accessibility', function () {
            expect(getCustomizerSettings().accessibility).to.equal('items');
        });

        it('defeat ganon goal', function () {
            expect(getCustomizerSettings().goal).to.equal('ganon');
        });

        it('7 crystals GT', function () {
            expect(getCustomizerSettings().crystals.tower).to.equal('7');
        });

        it('7 crystals Ganon', function () {
            expect(getCustomizerSettings().crystals.ganon).to.equal('7');
        });

        it('standard mode', function () {
            expect(getCustomizerSettings().mode).to.equal('standard');
        });

        it('hints off', function () {
            expect(getCustomizerSettings().hints).to.equal('off');
        });

        it('randomized swords', function () {
            expect(getCustomizerSettings().weapons).to.equal('randomized');
        });

        it('normal item pool', function () {
            expect(getCustomizerSettings().item.pool).to.equal('normal');
        });

        it('normal item functionality', function () {
            expect(getCustomizerSettings().item.functionality).to.equal('normal');
        });

        it('race seed', function () {
            expect(getCustomizerSettings().tournament).to.be.true;
        });

        it('spoilers off', function () {
            expect(getCustomizerSettings().spoilers).to.equal('off');
        });

        it('english language', function () {
            expect(getCustomizerSettings().lang).to.equal('en');
        });

        it('boss shuffle off', function () {
            expect(getCustomizerSettings().enemizer.boss_shuffle).to.equal('none');
        });

        it('enemy shuffle off', function () {
            expect(getCustomizerSettings().enemizer.enemy_shuffle).to.equal('none');
        });

        it('default enemy damage', function () {
            expect(getCustomizerSettings().enemizer.enemy_damage).to.equal('default');
        });

        it('default enemy health', function () {
            expect(getCustomizerSettings().enemizer.enemy_health).to.equal('default');
        });

        it('3 hearts to start', function () {
            expect(getCustomizerSettings().eq).has.a.lengthOf(3);
            expect(getCustomizerSettings().eq[0]).to.equal('BossHeartContainer');
            expect(getCustomizerSettings().eq[1]).to.equal('BossHeartContainer');
            expect(getCustomizerSettings().eq[2]).to.equal('BossHeartContainer');
        });

        it('no custom prize packs', function () {
            expect(getCustomizerSettings().custom['customPrizePacks']).to.be.false;
        });

        it('no item requirement', function () {
            expect(getCustomizerSettings().custom['item.Goal.Required']).to.equal('');
        });

        it('do not allow dark room navigation', function () {
            expect(getCustomizerSettings().custom['item.require.Lamp']).to.be.false;
        });

        it('no timers', function () {
            expect(getCustomizerSettings().custom['item.value.BlueClock']).to.equal('');
            expect(getCustomizerSettings().custom['item.value.GreenClock']).to.equal('');
            expect(getCustomizerSettings().custom['item.value.RedClock']).to.equal('');
            expect(getCustomizerSettings().custom['rom.timerMode']).to.equal('off');
            expect(getCustomizerSettings().custom['rom.timerStart']).to.equal('');
            expect(getCustomizerSettings().custom['item.value.Rupoor']).to.equal('');
        });

        it('prizes are shuffled properly', function () {
            expect(getCustomizerSettings().custom['prize.crossWorld']).to.be.true;
            expect(getCustomizerSettings().custom['prize.shuffleCrystals']).to.be.true;
            expect(getCustomizerSettings().custom['prize.shufflePendants']).to.be.true;
        });

        it('bosses can have dungeon items', function () {
            expect(getCustomizerSettings().custom['region.bossNormalLocation']).to.be.true;
        });

        it('no special dungeon item setup', function () {
            expect(getCustomizerSettings().custom['region.wildBigKeys']).to.be.false;
            expect(getCustomizerSettings().custom['region.wildCompasses']).to.be.false;
            expect(getCustomizerSettings().custom['region.wildKeys']).to.be.false;
            expect(getCustomizerSettings().custom['region.wildMaps']).to.be.false;
            expect(getCustomizerSettings().custom['rom.dungeonCount']).to.equal('off');
            expect(getCustomizerSettings().custom['rom.freeItemMenu']).to.be.false;
            expect(getCustomizerSettings().custom['rom.freeItemText']).to.be.false;
            expect(getCustomizerSettings().custom['rom.mapOnPickup']).to.be.false;
        });

        it('uncle does not spoil boots', function () {
            expect(getCustomizerSettings().custom['spoil.BootsLocation']).to.be.false;
        });

        it('no retro settings', function () {
            expect(getCustomizerSettings().custom['rom.rupeeBow']).to.be.false;
            expect(getCustomizerSettings().custom['rom.genericKeys']).to.be.false;
        });

        it('no glitches logic', function () {
            expect(getCustomizerSettings().custom['rom.logicMode']).to.equal('NoGlitches');
            expect(getCustomizerSettings().custom['canBombJump']).to.be.false;
            expect(getCustomizerSettings().custom['canBootsClip']).to.be.false;
            expect(getCustomizerSettings().custom['canBunnyRevive']).to.be.false;
            expect(getCustomizerSettings().custom['canBunnySurf']).to.be.false;
            expect(getCustomizerSettings().custom['canDungeonRevive']).to.be.false;
            expect(getCustomizerSettings().custom['canFakeFlipper']).to.be.false;
            expect(getCustomizerSettings().custom['canMirrorClip']).to.be.false;
            expect(getCustomizerSettings().custom['canMirrorWrap']).to.be.false;
            expect(getCustomizerSettings().custom['canOneFrameClipOW']).to.be.false;
            expect(getCustomizerSettings().custom['canOneFrameClipUW']).to.be.false;
            expect(getCustomizerSettings().custom['canOWYBA']).to.be.false;
            expect(getCustomizerSettings().custom['canSuperBunny']).to.be.false;
            expect(getCustomizerSettings().custom['canSuperSpeed']).to.be.false;
            expect(getCustomizerSettings().custom['canWaterFairyRevive']).to.be.false;
            expect(getCustomizerSettings().custom['canWaterWalk']).to.be.false;
        });

        it('default items', function () {
            expect(getCustomizerSettings().custom.item.count['BottleWithRandom']).to.equal(4);
            expect(getCustomizerSettings().custom.item.count['Nothing']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['L1Sword']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['L1SwordAndShield']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['MasterSword']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['L3Sword']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['L4Sword']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BlueShield']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['RedShield']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['MirrorShield']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['FireRod']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['IceRod']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Hammer']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Hookshot']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Bow']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['Boomerang']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Powder']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Bombos']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Ether']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Quake']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Lamp']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Shovel']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['OcarinaInactive']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CaneOfSomaria']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Bottle']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['PieceOfHeart']).to.equal(24);
            expect(getCustomizerSettings().custom.item.count['CaneOfByrna']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Cape']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MagicMirror']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['PowerGlove']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['TitansMitt']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BookOfMudora']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['Flippers']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MoonPearl']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BugCatchingNet']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BlueMail']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['RedMail']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['Bomb']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['ThreeBombs']).to.equal(16);
            expect(getCustomizerSettings().custom.item.count['Mushroom']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['RedBoomerang']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BottleWithRedPotion']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BottleWithGreenPotion']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BottleWithBluePotion']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['TenBombs']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['OneRupee']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['FiveRupees']).to.equal(4);
            expect(getCustomizerSettings().custom.item.count['TwentyRupees']).to.equal(28);
            expect(getCustomizerSettings().custom.item.count['TwentyRupees2']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BowAndArrows']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BowAndSilverArrows']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BottleWithBee']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BottleWithFairy']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BossHeartContainer']).to.equal(10);
            expect(getCustomizerSettings().custom.item.count['HeartContainer']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['OneHundredRupees']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['FiftyRupees']).to.equal(7);
            expect(getCustomizerSettings().custom.item.count['Heart']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['Arrow']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['TenArrows']).to.equal(12);
            expect(getCustomizerSettings().custom.item.count['SmallMagic']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['ThreeHundredRupees']).to.equal(5);
            expect(getCustomizerSettings().custom.item.count['BottleWithGoldBee']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['OcarinaActive']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['PegasusBoots']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BombUpgrade5']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BombUpgrade10']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['ArrowUpgrade5']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['ArrowUpgrade10']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['HalfMagic']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['QuarterMagic']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['SilverArrowUpgrade']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['Rupoor']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['RedClock']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BlueClock']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['GreenClock']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['ProgressiveSword']).to.equal(4);
            expect(getCustomizerSettings().custom.item.count['ProgressiveShield']).to.equal(3);
            expect(getCustomizerSettings().custom.item.count['ProgressiveArmor']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['ProgressiveGlove']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['ProgressiveBow']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['Triforce']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['TriforcePiece']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['MapA2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD7']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD4']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapP3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD5']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD6']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapD2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapA1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['MapP2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapP1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['MapH1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['MapH2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassA2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD7']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD4']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassP3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD5']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD6']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassD2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassA1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['CompassP2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassP1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['CompassH1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['CompassH2']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BigKeyA2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD7']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD4']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyP3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD5']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD6']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyD2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyA1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BigKeyP2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyP1']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['BigKeyH1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['BigKeyH2']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['KeyA2']).to.equal(4);
            expect(getCustomizerSettings().custom.item.count['KeyD7']).to.equal(4);
            expect(getCustomizerSettings().custom.item.count['KeyD4']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['KeyP3']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['KeyD5']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['KeyD3']).to.equal(3);
            expect(getCustomizerSettings().custom.item.count['KeyD6']).to.equal(3);
            expect(getCustomizerSettings().custom.item.count['KeyD1']).to.equal(6);
            expect(getCustomizerSettings().custom.item.count['KeyD2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['KeyA1']).to.equal(2);
            expect(getCustomizerSettings().custom.item.count['KeyP2']).to.equal(1);
            expect(getCustomizerSettings().custom.item.count['KeyP1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['KeyH1']).to.equal(0);
            expect(getCustomizerSettings().custom.item.count['KeyH2']).to.equal(1);
        });

        it('default drops', function () {
            expect(getCustomizerSettings().custom.drop.count['Bee']).to.equal(0);
            expect(getCustomizerSettings().custom.drop.count['BeeGood']).to.equal(0);
            expect(getCustomizerSettings().custom.drop.count['Heart']).to.equal(13);
            expect(getCustomizerSettings().custom.drop.count['RupeeGreen']).to.equal(9);
            expect(getCustomizerSettings().custom.drop.count['RupeeBlue']).to.equal(7);
            expect(getCustomizerSettings().custom.drop.count['RupeeRed']).to.equal(6);
            expect(getCustomizerSettings().custom.drop.count['BombRefill1']).to.equal(7);
            expect(getCustomizerSettings().custom.drop.count['BombRefill4']).to.equal(1);
            expect(getCustomizerSettings().custom.drop.count['BombRefill8']).to.equal(2);
            expect(getCustomizerSettings().custom.drop.count['MagicRefillSmall']).to.equal(6);
            expect(getCustomizerSettings().custom.drop.count['MagicRefillFull']).to.equal(3);
            expect(getCustomizerSettings().custom.drop.count['ArrowRefill5']).to.equal(5);
            expect(getCustomizerSettings().custom.drop.count['ArrowRefill10']).to.equal(3);
            expect(getCustomizerSettings().custom.drop.count['Fairy']).to.equal(1);
        });
    });
});