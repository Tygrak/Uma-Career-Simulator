import { GameState } from "./gameState";
import { SupportCard } from "./supportCard";

export function testTrainings() {
    testfailure();
    testTraining1();
    testTraining2();
    testTraining3();
    testTraining4();
    testTraining5();
}

function testfailure() {
    let gameState = new GameState();
    for (let i = 0; i < 11; i++) {
        gameState.energy = 50-i*5;
        let effect = gameState.getTrainingEffect(0);
        console.log(effect.toString());
    }
}

//speed lv1 - good, +13 speed, +5 pow, +2 sp
function testTraining1() {
    let gameState = new GameState();
    gameState.speedGrowth = 0.2;
    gameState.powerGrowth = 0;
    gameState.mood = 1;
    let effect = gameState.getTrainingEffect(0);
    testEquals(Math.floor(effect.speed), 13);
    testEquals(Math.floor(effect.power), 5);
}

//power lv1 - good, airgroove45, +10 pow, +6 stamina, +2 sp
function testTraining2() {

}

//power lv1 - good, airgroove45, +10 pow, +6 stamina, +2 sp
function testTraining3() {
    let gameState = new GameState();
    gameState.mood = 1;
    gameState.staminaGrowth = 0;
    gameState.powerGrowth = 0;
    gameState.cards.push(SupportCard.getByNameAndRarity("Air Groove", 2));
    gameState.cardPositions[0] = 2;
    let effect = gameState.getTrainingEffect(2);
    testEquals(Math.floor(effect.power), 10);
    testEquals(Math.floor(effect.stamina), 6);
}

//stamina lv1 - good, matikanefu30, muteki50, +12 stamina, +6 guts, +2 sp
function testTraining4() {
    let gameState = new GameState();
    gameState.mood = 1;
    gameState.staminaGrowth = 0;
    gameState.gutsGrowth = 0.1;
    gameState.cards.push(SupportCard.getByNameAndRarity("Matikanefukukitaru", 2));
    gameState.cardLevels[0] = 30;
    gameState.cards.push(SupportCard.getByNameAndRarity("Yaeno Muteki", 3));
    gameState.cardPositions[0] = 1;
    gameState.cardPositions[1] = 1;
    let effect = gameState.getTrainingEffect(1);
    testEquals(Math.floor(effect.stamina), 12);
    testEquals(Math.floor(effect.guts), 6);
}

//wit lv1 - great, flower40, tachyon45, airgroove45, +20 wit, +7 speed, +10 sp
function testTraining5() {
    let gameState = new GameState();
    gameState.mood = 2;
    gameState.witGrowth = 0;
    gameState.speedGrowth = 0.2;
    gameState.cards.push(SupportCard.getByNameAndRarity("Even the Littlest Bud", 3));
    gameState.cardLevels[0] = 40;
    gameState.cards.push(SupportCard.getByNameAndRarity("Experimental Studies on Subject A", 2));
    gameState.cards.push(SupportCard.getByNameAndRarity("Nothing Escapes the Vice Prez", 2));
    gameState.cardPositions[0] = 4;
    gameState.cardPositions[1] = 4;
    gameState.cardPositions[2] = 4;
    gameState.cardBonds[0] = 100;
    gameState.cardBonds[2] = 100;
    let effect = gameState.getTrainingEffect(4);
    testEquals(Math.floor(effect.wit), 20);
    testEquals(Math.floor(effect.speed), 7);
}

function testEquals(a: any, b: any) {
    if (a != b) {
        console.warn("test failed: " + a + " != " + b);
        throw new Error("test failed: " + a + " != " + b);
    }
}
