import { Parent } from "./parent";
import { Simulator } from "./simulator";

import "./styles.css";

import { SupportCard, SupportCardEffect, SupportCardEffectType, SupportCardRarity, SupportCardType } from "./supportCard";
import { testTrainings } from "./testGameState";

const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
const removeCardButton = document.getElementById("removeCardButton") as HTMLButtonElement;
const addCardButton = document.getElementById("addCardButton") as HTMLButtonElement;
const clearAllButton = document.getElementById("clearAllButton") as HTMLButtonElement;
const cardPresetsSelect = document.getElementById("cardPreset") as HTMLSelectElement;
const logDiv = document.getElementById("log") as HTMLDivElement;
const availableCardsDiv = document.getElementById("availableCards") as HTMLDivElement;
const cardSelects = document.getElementsByClassName("fixedCard") as HTMLCollectionOf<HTMLSelectElement>;
const cardLevels = document.getElementsByClassName("fixedLevel") as HTMLCollectionOf<HTMLInputElement>;

let availableCardBrs: HTMLBRElement[] = [];
let availableCardSelects: HTMLSelectElement[] = [];
let availableCardLevels: HTMLInputElement[] = [];
let availableCardButtons: HTMLButtonElement[] = [];

submitButton.onclick = (e) => {
    console.log("Run");
    let cardjsons = [];
    let levelStrings = [];
    for (let i = 0; i < cardSelects.length; i++) {
        if (cardSelects[i].value == "Empty") {
            cardjsons.push({});
        } else {
            cardjsons.push(SupportCard.getAllCards().find(c => c.CardName == cardSelects[i].value));
        }
        levelStrings.push(cardLevels[i].value);
    }
    let cards = cardjsons.map(c => SupportCard.fromJSON(c));
    let levels = levelStrings.map(l => parseInt(l));
    console.log(cards);
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].ChainEvents[0].name == "default") {
            console.warn(cards[i].CardName + " doesn't have event data ready. Using default placeholder events.");
        }
    }
    
    let availableCards = [];
    let availableLevels = [];
    for (let i = 0; i < availableCardSelects.length; i++) {
        let card = SupportCard.fromJSON(SupportCard.getAllCards().find(c => c.CardName == availableCardSelects[i].value));
        availableCards.push(card);
        availableLevels.push(parseInt(availableCardLevels[i].value));
        if (card.ChainEvents[0].name == "default") {
            console.warn(card.CardName + " doesn't have event data ready. Using default placeholder events.");
        }
    }

    let simulator = new Simulator();
    simulator.fixedCards = cards;
    simulator.fixedCardLevels = levels;
    simulator.availableCards = availableCards;
    simulator.availableCardLevels = availableLevels;
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
    let parentSparks = document.getElementsByClassName("parentSpark") as HTMLCollectionOf<HTMLSelectElement>;
    let grandparentSparks = document.getElementsByClassName("grandparentSpark") as HTMLCollectionOf<HTMLSelectElement>;
    for (let i = 0; i < parentSparks.length; i++) {
        simulator.sparksParent.push(Parent.fromString(parentSparks[i].value));
    }
    for (let i = 0; i < grandparentSparks.length; i++) {
        simulator.sparksGrandparent.push(Parent.fromString(grandparentSparks[i].value));
    }
    let percentile = parseInt((document.getElementById("showPercentile") as HTMLInputElement).value);
    let result = simulator.FindOptimalDeck(parseInt((document.getElementById("simulatedRuns") as HTMLInputElement).value), percentile);
    
    let percentile75 = simulator.bestRuns[0];
    console.log(percentile75.gameState);
    let logText = percentile75.gameState.getStatsString() + ", " + percentile75.gameState.getStatsSum() + ", " + simulator.GetDistFromTargetSum(percentile75.gameState).toFixed(2) + ", " + percentile75.gameState.getTrainingsString() + "\n";
    logText += percentile75.log;
    logDiv.innerText = result + "\n\n\n" + logText;
};

//todo: add  find borrow card option (automatically check all SSRs that aren't already in deck)

addCardButton.onclick = (e) => {
    AddAvailableCard();
}

clearAllButton.onclick = (e) => {
    ClearAvailableCards();
    cardPresetsSelect.value = "none";
}

removeCardButton.onclick = (e) => {
    RemoveAvailableCard();
}

cardPresetsSelect.onchange = (e) => {
    if (cardPresetsSelect.value == "mileCM") {
        cardSelects[0].value = "[Fire at My Heels] Kitasan Black";
        cardLevels[0].value = "50";
        cardSelects[1].value = "[First-Rate Plan] King Halo";
        cardLevels[1].value = "45";
        cardSelects[2].value = "[5:00 a.m.\u2014Right on Schedule] Eishin Flash";
        cardLevels[2].value = "45";
        cardSelects[3].value = "[Messing Around] Nice Nature";
        cardLevels[3].value = "45";
        cardSelects[4].value = "[A Marvelous \u2606 Plan] Marvelous Sunday";
        cardLevels[4].value = "45";
        cardSelects[5].value = "Empty";
        cardLevels[5].value = "50";
        (document.getElementById("speedTarget") as HTMLInputElement).value = "1150";
        (document.getElementById("staminaTarget") as HTMLInputElement).value = "550";
        (document.getElementById("powerTarget") as HTMLInputElement).value = "800";
        (document.getElementById("gutsTarget") as HTMLInputElement).value = "0";
        (document.getElementById("witTarget") as HTMLInputElement).value = "800";
    } else if (cardPresetsSelect.value == "mediumCM") {
        cardSelects[0].value = "[Fire at My Heels] Kitasan Black";
        cardLevels[0].value = "50";
        cardSelects[1].value = "[Two Pieces] Narita Brian";
        cardLevels[1].value = "50";
        cardSelects[2].value = "[5:00 a.m.\u2014Right on Schedule] Eishin Flash";
        cardLevels[2].value = "45";
        cardSelects[3].value = "[Piece of Mind] Super Creek";
        cardLevels[3].value = "35";
        cardSelects[4].value = "[Cute \u002B Cute = ?] Mayano Top Gun";
        cardLevels[4].value = "45";
        cardSelects[5].value = "Empty";
        cardLevels[5].value = "50";
        (document.getElementById("speedTarget") as HTMLInputElement).value = "1150";
        (document.getElementById("staminaTarget") as HTMLInputElement).value = "1000";
        (document.getElementById("powerTarget") as HTMLInputElement).value = "300";
        (document.getElementById("gutsTarget") as HTMLInputElement).value = "0";
        (document.getElementById("witTarget") as HTMLInputElement).value = "0";
    } else if (cardPresetsSelect.value == "mediumCMguts") {
        cardSelects[0].value = "[Fire at My Heels] Kitasan Black";
        cardLevels[0].value = "50";
        cardSelects[1].value = "[Urara\u0027s Day Off!] Haru Urara";
        cardLevels[1].value = "50";
        cardSelects[2].value = "[Nothing Escapes the Vice Prez] Air Groove";
        cardLevels[2].value = "45";
        cardSelects[3].value = "[Piece of Mind] Super Creek";
        cardLevels[3].value = "35";
        cardSelects[4].value = "[Just Keep Going] Matikanetannhauser";
        cardLevels[4].value = "50";
        cardSelects[5].value = "Empty";
        cardLevels[5].value = "50";
        (document.getElementById("speedTarget") as HTMLInputElement).value = "1150";
        (document.getElementById("staminaTarget") as HTMLInputElement).value = "700";
        (document.getElementById("powerTarget") as HTMLInputElement).value = "300";
        (document.getElementById("gutsTarget") as HTMLInputElement).value = "1200";
        (document.getElementById("witTarget") as HTMLInputElement).value = "0";
    } else if (cardPresetsSelect.value == "allSR") {
        ClearAvailableCards();
        let cards = SupportCard.getAllCards().filter(c => c.Rarity == 2);
        for (let i = 0; i < cards.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == cards[i].CardName) === undefined) {
                AddAvailableCard(cards[i].CardName);
            }
        }
    } else if (cardPresetsSelect.value == "allFutureSSR") {
        ClearAvailableCards();
        let ssrs = SupportCard.getAllCards().filter(c => c.Rarity == 3 && c.CardName.includes("Future SSR"));
        for (let i = 0; i < ssrs.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == ssrs[i].CardName) === undefined) {
                AddAvailableCard(ssrs[i].CardName);
            }
        }
    } else if (cardPresetsSelect.value == "allSSR") {
        ClearAvailableCards();
        let ssrs = SupportCard.getAllCards().filter(c => c.Rarity == 3 && !c.CardName.includes("Future SSR") && !c.CardName.includes("Upcoming SSR"));
        for (let i = 0; i < ssrs.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == ssrs[i].CardName) === undefined) {
                AddAvailableCard(ssrs[i].CardName);
            }
        }
    } else if (cardPresetsSelect.value == "allSSRupcoming") {
        ClearAvailableCards();
        let ssrs = SupportCard.getAllCards().filter(c => c.Rarity == 3 && !c.CardName.includes("Future SSR"));
        for (let i = 0; i < ssrs.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == ssrs[i].CardName) === undefined) {
                AddAvailableCard(ssrs[i].CardName);
            }
        }
    } else if (cardPresetsSelect.value == "allBigTE") {
        ClearAvailableCards();
        let ssrs = SupportCard.getAllCards().filter(c => c.Rarity >= 2 && c.getEffectStrengthAtLevel(50, SupportCardEffectType.TrainingEffectiveness) >= 15);
        for (let i = 0; i < ssrs.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == ssrs[i].CardName) === undefined) {
                AddAvailableCard(ssrs[i].CardName);
            }
        }
    } else if (cardPresetsSelect.value == "welfare") {
        ClearAvailableCards();
        let cards = SupportCard.getAllCards().filter(c => c.Rarity >= 2);
        for (let i = 0; i < cards.length; i++) {
            if (Array.from(cardSelects).find(c => c.value == cards[i].CardName) === undefined) {
                AddAvailableCard(cards[i].CardName);
            }
        }
    }
}

function ClearAvailableCards() {
    while (availableCardSelects.length > 0) {
        RemoveAvailableCard();
    }
}

function AddAvailableCard(name: string = "") {
    console.log("Added card");

    let br = document.createElement('br');
    let input = document.createElement('input');
    input.type = "number";
    input.classList = "cardLevel smallNumber";
    input.value = "50";

    let select = document.createElement('select');
    select.onchange = (e) => {onCardSelectUpdated(select, input)};
    select.classList = "card";
    InitializeCardSelect(select, false);

    let button = document.createElement('button');
    button.onclick = (e) => {RemoveAvailableCard(select)};
    button.classList = "cardRemoveButton";
    button.innerText = "x";

    availableCardBrs.push(br);
    availableCardSelects.push(select);
    availableCardLevels.push(input);
    availableCardButtons.push(button);
    availableCardsDiv.appendChild(select);
    availableCardsDiv.appendChild(input);
    availableCardsDiv.appendChild(button);
    availableCardsDiv.appendChild(br);

    if (name != "") {
        select.value = SupportCard.getByName(name).CardName;
    }
}

function RemoveAvailableCard(select: null | HTMLSelectElement = null) {
    if (select == null) {
        select = availableCardSelects[availableCardBrs.length-1];
    }
    let index = availableCardSelects.findIndex(s => s == select);
    if (availableCardSelects.length > 0) {
        console.log("Removed card");
        availableCardsDiv.removeChild(availableCardButtons[index]);
        availableCardsDiv.removeChild(availableCardBrs[index]);
        availableCardsDiv.removeChild(availableCardSelects[index]);
        availableCardsDiv.removeChild(availableCardLevels[index]);
        availableCardBrs.splice(index, 1);
        availableCardSelects.splice(index, 1);
        availableCardLevels.splice(index, 1);
        availableCardButtons.splice(index, 1);
    }
}

function InitializeCardSelects() {
    for (let i = 0; i < cardSelects.length; i++) {
        InitializeCardSelect(cardSelects[i]);
    }

    cardSelects[0].value = "[Fire at My Heels] Kitasan Black";
    cardLevels[0].value = "50";
    cardSelects[0].onchange = (e) => {onCardSelectUpdated(cardSelects[0], cardLevels[0])};
    cardSelects[1].value = "[First-Rate Plan] King Halo";
    cardLevels[1].value = "45";
    cardSelects[1].onchange = (e) => {onCardSelectUpdated(cardSelects[1], cardLevels[1])};
    cardSelects[2].value = "[5:00 a.m.\u2014Right on Schedule] Eishin Flash";
    cardLevels[2].value = "45";
    cardSelects[2].onchange = (e) => {onCardSelectUpdated(cardSelects[2], cardLevels[2])};
    cardSelects[3].value = "[Messing Around] Nice Nature";
    cardLevels[3].value = "45";
    cardSelects[3].onchange = (e) => {onCardSelectUpdated(cardSelects[3], cardLevels[3])};
    cardSelects[4].value = "[A Marvelous \u2606 Plan] Marvelous Sunday";
    cardLevels[4].value = "45";
    cardSelects[4].onchange = (e) => {onCardSelectUpdated(cardSelects[4], cardLevels[4])};
    cardSelects[5].value = "[Wave of Gratitude] Fine Motion";
    cardLevels[5].value = "50";
    cardSelects[5].onchange = (e) => {onCardSelectUpdated(cardSelects[5], cardLevels[5])};
}

function InitializeCardSelect(select: HTMLSelectElement, hasEmptyOption: boolean = true) {
    let namesSSR = [];
    let namesFutureSSR = [];
    let namesSR = [];
    let namesR = [];
    for (let i = 0; i < SupportCard.getAllCards().length; i++) {
        let name = SupportCard.getAllCards()[i].CardName;
        if (SupportCard.getAllCards()[i].Rarity == 1) {
            namesR.push(name);
        } else if (SupportCard.getAllCards()[i].Rarity == 2) {
            namesSR.push(name);
        } else if (SupportCard.getAllCards()[i].Rarity == 3 && name.includes("Future SSR")) {
            namesFutureSSR.push(name);
        } else if (SupportCard.getAllCards()[i].Rarity == 3) {
            namesSSR.push(name);
        }
    }
    namesSSR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    namesFutureSSR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    namesSR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));
    namesR.sort((a, b) => a.replace(/\[.+\]/, "").localeCompare(b.replace(/\[.+\]/, "")));

    if (hasEmptyOption) {
        let emptyOption = document.createElement('option');
        emptyOption.value = "Empty";
        emptyOption.innerHTML = "Empty";
        select.appendChild(emptyOption);
    }

    let optgroup = document.createElement('optgroup');
    optgroup.label = "SSR";
    for (let j = 0; j < namesSSR.length; j++) {
        let option = document.createElement('option');
        option.value = namesSSR[j];
        option.innerHTML = namesSSR[j];
        optgroup.appendChild(option);
    }
    select.appendChild(optgroup);

    optgroup = document.createElement('optgroup');
    optgroup.label = "SR";
    for (let j = 0; j < namesSR.length; j++) {
        let option = document.createElement('option');
        option.value = namesSR[j];
        option.innerHTML = namesSR[j];
        optgroup.appendChild(option);
    }
    select.appendChild(optgroup);

    optgroup = document.createElement('optgroup');
    optgroup.label = "R";
    for (let j = 0; j < namesR.length; j++) {
        let option = document.createElement('option');
        option.value = namesR[j];
        option.innerHTML = namesR[j];
        optgroup.appendChild(option);
    }
    select.appendChild(optgroup);
    

    optgroup = document.createElement('optgroup');
    optgroup.label = "Future SSR";
    for (let j = 0; j < namesFutureSSR.length; j++) {
        let option = document.createElement('option');
        option.value = namesFutureSSR[j];
        option.innerHTML = namesFutureSSR[j];
        optgroup.appendChild(option);
    }
    select.appendChild(optgroup);
}

function onCardSelectUpdated(cardSelect: HTMLSelectElement, cardLevel: HTMLInputElement) {
    let card = SupportCard.getByName(cardSelect.value);
    cardLevel.value = (card.Rarity == 3 ? 50 : (card.Rarity == 2 ? 45 : 40)).toString();
}

function Initialize() {
    InitializeCardSelects();
}

Initialize();

testTrainings();
