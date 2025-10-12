import { GameState } from "./gameState";
import { Parent } from "./parent";
import { SupportCard, SupportCardEffectType, SupportCardType } from "./supportCard";

export class Simulator {
    results: GameState[] = [];
    cards: SupportCard[] = [];
    cardLevels: number[] = [];
    
    fixedCards: SupportCard[] = [];
    fixedCardLevels: number[] = [];
    availableCards: SupportCard[] = [];
    availableCardLevels: number[] = [];
    
    speedGrowth = 0.2;
    staminaGrowth = 0;
    powerGrowth = 0;
    gutsGrowth = 0.1;
    witGrowth = 0;

    targetSpeed = 1200;
    targetStamina = 1000;
    targetPower = 600;
    targetGuts = 300;
    targetWit = 600;

    statFocusBlend = 0.85;

    sparksParent: Parent[] = [];
    sparksGrandparent: Parent[] = [];

    log = "";
    logs: string[] = [];
    
    bestRuns: {gameState: GameState, log: string}[] = [];

    FindOptimalDeck(runs: number, percentile: number) {
        this.results = [];
        this.logs = [];
        this.bestRuns = [];
        
        let emptySlots = [];
        for (let i = 0; i < this.fixedCards.length; i++) {
            if (this.fixedCards[i].CardName ==  "") {
                emptySlots.push(i);
            }
        }
        if (this.availableCards.length < emptySlots.length) {
            console.warn("Not enough available cards selected");
            return "Not enough available cards selected";
        }
        if (emptySlots.length == 0) {
            this.RunSimulator(runs);
            this.bestRuns.push(this.GetResultsPercentile(percentile));
            return "No empty slots, running for selected deck";
        }
        

        let combinationsScores = [];
        let combinations = this.getCombinations(emptySlots.length, this.availableCards.length);
        for (let c = 0; c < combinations.length; c++) {
            if (c > 100) {
                console.warn("Too many combinations, ending");
                break;
            }
            this.makeDeckForCombination(combinations[c]);
            this.RunSimulator(runs);
            let result = this.GetResultsPercentile(percentile);
            combinationsScores.push(this.GetDistFromTargetSum(result.gameState));
        }
        let result = "";
        let combos = combinations.map((c, id) => {return {combination: c, score: combinationsScores[id]};});
        
        combos.sort((a, b) => b.score - a.score);
        for (let i = 0; i < 100; i++) {
            if (i >= combos.length) {
                break;
            }
            this.makeDeckForCombination(combos[i].combination);
            this.RunSimulator(runs);
            let percentile74 = this.GetResultsPercentile(percentile-1);
            let percentile75 = this.GetResultsPercentile(percentile);
            let percentile76 = this.GetResultsPercentile(percentile+1);

            this.bestRuns.push(percentile75);
            
            let logText = percentile74.gameState.getStatsString() + ", " + percentile74.gameState.getStatsSum() + ", " + this.GetDistFromTargetSum(percentile74.gameState).toFixed(2) + ", " + percentile74.gameState.getTrainingsString() + ", " + "\n";
            logText += percentile75.gameState.getStatsString() + ", " + percentile75.gameState.getStatsSum() + ", " + this.GetDistFromTargetSum(percentile75.gameState).toFixed(2) + ", " + percentile75.gameState.getTrainingsString() + "\n";
            logText += percentile76.gameState.getStatsString() + ", " + percentile76.gameState.getStatsSum() + ", " + this.GetDistFromTargetSum(percentile76.gameState).toFixed(2) + ", " + percentile76.gameState.getTrainingsString() + "\n\n";
            result += (i+1) + ". " + this.cards.map(c => " " + c.CardName) + ", race bonus: " + percentile75.gameState.raceBonus.toFixed(2) + " (score: " + combos[i].score.toFixed(4) + ")\n"+logText+"\n\n";
        }
        return result;
    }

    RunSimulator(runs: number) {
        this.results = [];
        this.logs = [];
        if (this.cards.length == 0) {
            this.cards = this.fixedCards;
            this.cardLevels = this.fixedCardLevels;
        }
        for (let i = 0; i < runs; i++) {
            this.log = "";
            let gameState = new GameState(); 
            gameState.cards = this.cards;
            gameState.cardLevels = this.cardLevels;
            gameState.speedGrowth = this.speedGrowth;
            gameState.staminaGrowth = this.staminaGrowth;
            gameState.powerGrowth = this.powerGrowth;
            gameState.gutsGrowth = this.gutsGrowth;
            gameState.witGrowth = this.witGrowth;
            gameState.sparksParent = this.sparksParent;
            gameState.sparksGrandparent = this.sparksGrandparent;
            gameState.initRun();

            gameState.doCardPositions();

            this.log += "start " + i + "\n";
            this.log += "cards " + gameState.cards.map(c => c.CardName) + " (race bonus: " + gameState.raceBonus.toFixed(2) + ")\n";
            while (gameState.turnsRemaining > 0) {
                this.log += "turn: " + gameState.turn + "\n";
                if (gameState.getIsSummerCamp()) {
                    this.log += "is summer camp\n";
                }
                this.log += "state: " + gameState.getStatsString() + " (energy: " + gameState.energy + ")\n";
                this.log += "pos: " + gameState.cardPositions + " (" + gameState.cardHints + "|" + gameState.cardBonds + ")\n";

                let previousEvent = gameState.lastEvent;
                let previousFails = gameState.failedTrainings;
                let id = this.ChooseBestTraining(gameState);
                if (id == -1) {
                    gameState.doRest();
                } else if (id == -2) {
                    gameState.doRecreation();
                } else {
                    gameState.doTraining(id);
                }
                if (gameState.turn == 32 || gameState.turn == 56) {
                    this.log += "post-inherit state: " + gameState.getStatsString() + " (turn: " + gameState.turn + ")\n";
                }
                this.log += "selected: " + id + "\n";
                if (previousFails != gameState.failedTrainings) {
                    this.log += "fail!\n";
                }

                if (previousEvent != gameState.lastEvent) {
                    this.log += "event: " + gameState.lastEvent!.name + "\n";
                }
            }
            this.results.push(gameState);
            //console.log(gameState);
            //console.log(gameState.getStatsString());
            this.log += "finalstate: " + gameState.getStatsString()+ "\n\n";
            this.logs.push(this.log);
        }
    }

    GetResultsPercentile(percentile: number) {
        let sorted = [...this.results];
        sorted.sort((a, b) => this.GetDistFromTargetSum(a)-this.GetDistFromTargetSum(b));
        let result = sorted[Math.floor(sorted.length*percentile*0.01)];
        return {gameState: result, log: this.logs[this.results.findIndex(r => r == result)]};
    }

    ChooseBestTraining(gameState: GameState): number {
        let results = [];
        let valueMaxId = 0;
        let valueMax = 0;
        let valueMaxFailure = 0;
        for (let i = 0; i < 5; i++) {
            let numUnfriended = gameState.cardPositions.filter((p, index) => p == i && gameState.cardBonds[index] < 80).length;
            let numHintsUnfriended = gameState.cardPositions.filter((p, index) => p == i && gameState.cardHints[index] == 1 && gameState.cardBonds[index] < 80).length;
            let effect = gameState.getTrainingEffect(i);
            results.push(effect);
            let distSpeed = effect.speed*(1.1-Math.min((gameState.speed+effect.speed)/this.targetSpeed, 1)*this.statFocusBlend);
            let distStamina = effect.stamina*(1.1-Math.min((gameState.stamina+effect.stamina)/this.targetStamina, 1)*this.statFocusBlend);
            let distPower = effect.power*(1.1-Math.min((gameState.power+effect.power)/this.targetPower, 1)*this.statFocusBlend);
            let distGuts = effect.guts*(1.1-Math.min((gameState.guts+effect.guts)/this.targetGuts, 1)*this.statFocusBlend);
            let distWit = effect.wit*(1.1-Math.min((gameState.wit+effect.wit)/this.targetWit, 1)*this.statFocusBlend);
            let sumStats = (effect.speed+effect.stamina+effect.power+effect.guts+effect.wit)*0.02;
            let value = (distSpeed+distStamina+distPower+distGuts+distWit+sumStats);
            value += effect.skillPoints*0.25;
            if (effect.energy > 0 && gameState.energy+effect.energy <= 100) {
                value += Math.min(effect.energy, 100-gameState.energy);
            }
            value += numUnfriended*3.5;
            value += numHintsUnfriended*2.5;
            value *= 1-effect.failureChance*0.01;
            if (gameState.getDaysBeforeSummerCamp() < 3) {
                value += (Math.min(effect.energy+gameState.energy, 100)-80)*(3-gameState.getDaysBeforeSummerCamp())*0.45;
            }
            this.log += i+": " + effect.speed + ", " + effect.stamina + ", " + effect.power + ", " + effect.guts + ", " + effect.wit + " = " + value.toFixed(2) + " (fail: " + effect.failureChance.toFixed(2) + ", lvl: " + (gameState.getIsSummerCamp() ? 4 : gameState.trainings[i].level) + ", unfr: " + numUnfriended + ", hint: " + numHintsUnfriended + ")\n";
            if (value > valueMax) {
                valueMax = value;
                valueMaxId = i;
                valueMaxFailure = effect.failureChance;
            }
        }
        if (gameState.mood < 2) {
            return -2;
        }
        if ((gameState.energy < 65 && valueMax < -5) || (gameState.energy < 60 && valueMax < 6) || (gameState.energy < 50 && valueMax < 12) || (gameState.energy < 40 && valueMax < 20) || (gameState.energy < 30 && valueMax < 50) || valueMaxFailure > valueMax || valueMaxFailure > 30) {
            if (gameState.turn >= 76) {
                this.log += "last turn wit\n";
                return 4;
            }
            return -1;
        }
        return valueMaxId;
    }

    GetDistFromTargetSum(gameState: GameState) {
        let result = Math.min(gameState.speed/this.targetSpeed, 1);
        result += Math.min(gameState.stamina/this.targetStamina, 1);
        result += Math.min(gameState.power/this.targetPower, 1);
        result += Math.min(gameState.guts/this.targetGuts, 1);
        result += Math.min(gameState.wit/this.targetWit, 1);
        let sumStats = (gameState.stamina+gameState.power+gameState.guts+gameState.wit)*0.0001;
        result += sumStats;
        return result;
    }
    
    getCombinations(length: number, maxValue: number): number[][] {
        const result: number[][] = [];

        function backtrack(start: number, combo: number[]): void {
            if (combo.length === length) {
                result.push([...combo]);
                return;
            }

            for (let i = start; i < maxValue; i++) {
                combo.push(i);
                backtrack(i + 1, combo);
                combo.pop();
            }
        }

        backtrack(0, []);
        return result;
    }
    
    makeDeckForCombination(combination: number[]) {
        let emptySlots = [];
        for (let i = 0; i < this.fixedCards.length; i++) {
            if (this.fixedCards[i].CardName ==  "") {
                emptySlots.push(i);
            }
        }
        let deck = [...this.fixedCards];
        let levels = [...this.fixedCardLevels];
        for (let i = 0; i < emptySlots.length; i++) {
            deck[emptySlots[i]] = this.availableCards[combination[i]];
            levels[emptySlots[i]] = this.availableCardLevels[combination[i]];
        }
        this.cards = deck;
        this.cardLevels = levels;
    }
}