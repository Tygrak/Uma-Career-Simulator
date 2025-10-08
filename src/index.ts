import * as supportCardsData from "./data/supportCardsData.json";
import { Simulator } from "./simulator";

import "./styles.css";

import { SupportCard, SupportCardEffect, SupportCardEffectType, SupportCardRarity, SupportCardType } from "./supportCard";
import { testTrainings } from "./testGameState";

const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
const logDiv = document.getElementById("log") as HTMLDivElement;
const cardSelects = document.getElementsByClassName("card") as HTMLCollectionOf<HTMLSelectElement>;
const cardLevels = document.getElementsByClassName("cardLevel") as HTMLCollectionOf<HTMLInputElement>;

submitButton.onclick = (e) => {
    console.log("Run");
    let cardjsons = [];
    let levelStrings = [];
    for (let i = 0; i < cardSelects.length; i++) {
        cardjsons.push(supportCardsData.find(c => c.CardName == cardSelects[i].value));
        levelStrings.push(cardLevels[i].value);
    }
    let cards = cardjsons.map(c => SupportCard.fromJSON(c));
    let levels = levelStrings.map(l => parseInt(l));
    console.log(cards);
    console.log(cards[0].getEffectStrengthAtLevel(levels[0], SupportCardEffectType.TrainingEffectiveness));

    let simulator = new Simulator();
    simulator.cards = cards;
    simulator.cardLevels = levels;
    simulator.speedGrowth = parseInt((document.getElementById("speedGrowth") as HTMLInputElement).value);
    simulator.staminaGrowth = parseInt((document.getElementById("staminaGrowth") as HTMLInputElement).value);
    simulator.powerGrowth = parseInt((document.getElementById("powerGrowth") as HTMLInputElement).value);
    simulator.gutsGrowth = parseInt((document.getElementById("gutsGrowth") as HTMLInputElement).value);
    simulator.witGrowth = parseInt((document.getElementById("witGrowth") as HTMLInputElement).value);
    simulator.targetSpeed = parseInt((document.getElementById("speedTarget") as HTMLInputElement).value);
    simulator.targetStamina = parseInt((document.getElementById("staminaTarget") as HTMLInputElement).value);
    simulator.targetPower = parseInt((document.getElementById("powerTarget") as HTMLInputElement).value);
    simulator.targetGuts = parseInt((document.getElementById("gutsTarget") as HTMLInputElement).value);
    simulator.targetWit = parseInt((document.getElementById("witTarget") as HTMLInputElement).value);
    for (let i = 1; i <= 3; i++) {
        simulator.sparksSpeed[i-1] = parseInt((document.getElementById("speedSparks"+i) as HTMLInputElement).value);
        simulator.sparksStamina[i-1] = parseInt((document.getElementById("staminaSparks"+i) as HTMLInputElement).value);
        simulator.sparksPower[i-1] = parseInt((document.getElementById("powerSparks"+i) as HTMLInputElement).value);
        simulator.sparksGuts[i-1] = parseInt((document.getElementById("gutsSparks"+i) as HTMLInputElement).value);
        simulator.sparksWit[i-1] = parseInt((document.getElementById("witSparks"+i) as HTMLInputElement).value);
    }
    simulator.RunSimulator(parseInt((document.getElementById("simulatedRuns") as HTMLInputElement).value));
    let percentile = parseInt((document.getElementById("showPercentile") as HTMLInputElement).value);
    let percentile74 = simulator.GetResultsPercentile(percentile-1);
    let percentile75 = simulator.GetResultsPercentile(percentile);
    let percentile76 = simulator.GetResultsPercentile(percentile+1);
    console.log(percentile75.gameState);
    let logText = percentile74.gameState.getStatsString() + ", " + percentile74.gameState.getStatsSum() + ", " + simulator.GetDistFromTargetSum(percentile74.gameState).toFixed(2) + ", " + percentile74.gameState.getTrainingsString() + ", " + "\n";
    logText += percentile75.gameState.getStatsString() + ", " + percentile75.gameState.getStatsSum() + ", " + simulator.GetDistFromTargetSum(percentile75.gameState).toFixed(2) + ", " + percentile75.gameState.getTrainingsString() + "\n";
    logText += percentile76.gameState.getStatsString() + ", " + percentile76.gameState.getStatsSum() + ", " + simulator.GetDistFromTargetSum(percentile76.gameState).toFixed(2) + ", " + percentile76.gameState.getTrainingsString() + "\n\n";
    logText += percentile75.log;
    logDiv.innerText = logText;
};

function InitializeCardSelects() {
    let namesSSR = [];
    let namesSR = [];
    let namesR = [];
    for (let i = 0; i < supportCardsData.length; i++) {
        let name = supportCardsData[i].CardName;
        if (supportCardsData[i].Rarity == 1) {
            namesR.push(name);
        } else if (supportCardsData[i].Rarity == 2) {
            namesSR.push(name);
        } else if (supportCardsData[i].Rarity == 3) {
            namesSSR.push(name);
        }
    }
    namesSSR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    namesSR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    namesR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    for (let i = 0; i < cardSelects.length; i++) {
        let optgroup = document.createElement('optgroup');
        optgroup.label = "SSR";
        for (let j = 0; j < namesSSR.length; j++) {
            let option = document.createElement('option');
            option.value = namesSSR[j];
            option.innerHTML = namesSSR[j];
            optgroup.appendChild(option);
        }
        cardSelects[i].appendChild(optgroup);

        optgroup = document.createElement('optgroup');
        optgroup.label = "SR";
        for (let j = 0; j < namesSR.length; j++) {
            let option = document.createElement('option');
            option.value = namesSR[j];
            option.innerHTML = namesSR[j];
            optgroup.appendChild(option);
        }
        cardSelects[i].appendChild(optgroup);

        optgroup = document.createElement('optgroup');
        optgroup.label = "R";
        for (let j = 0; j < namesR.length; j++) {
            let option = document.createElement('option');
            option.value = namesR[j];
            option.innerHTML = namesR[j];
            optgroup.appendChild(option);
        }
        cardSelects[i].appendChild(optgroup);
    }

    cardSelects[0].value = "[Fire at My Heels] Kitasan Black";
    cardLevels[0].value = "50";
    cardSelects[0].onchange = (e) => {onCardSelectUpdated(0)};
    cardSelects[1].value = "[First-Rate Plan] King Halo";
    cardLevels[1].value = "45";
    cardSelects[1].onchange = (e) => {onCardSelectUpdated(1)};
    cardSelects[2].value = "[5:00 a.m.\u2014Right on Schedule] Eishin Flash";
    cardLevels[2].value = "45";
    cardSelects[2].onchange = (e) => {onCardSelectUpdated(2)};
    cardSelects[3].value = "[Messing Around] Nice Nature";
    cardLevels[3].value = "45";
    cardSelects[3].onchange = (e) => {onCardSelectUpdated(3)};
    cardSelects[4].value = "[A Marvelous \u2606 Plan] Marvelous Sunday";
    cardLevels[4].value = "45";
    cardSelects[4].onchange = (e) => {onCardSelectUpdated(4)};
    cardSelects[5].value = "[Wave of Gratitude] Fine Motion";
    cardLevels[5].value = "50";
    cardSelects[5].onchange = (e) => {onCardSelectUpdated(5)};
}

function onCardSelectUpdated(id: number) {
    let card = SupportCard.getByName(cardSelects[id].value);
    cardLevels[id].value = (card.Rarity == 3 ? 50 : (card.Rarity == 2 ? 45 : 40)).toString();
}

function Initialize() {
    InitializeCardSelects();
}

Initialize();

testTrainings();
