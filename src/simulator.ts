import { GameState } from "./gameState";
import { SupportCard, SupportCardEffectType, SupportCardType } from "./supportCard";

export class Simulator {
    results: GameState[] = [];
    cards: SupportCard[] = [];
    cardLevels: number[] = [];
    
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
    
    sparksSpeed = [0, 0, 0];
    sparksStamina = [0, 0, 0];
    sparksPower = [0, 0, 0];
    sparksGuts = [0, 0, 0];
    sparksWit = [0, 0, 0];

    log = "";
    logs: string[] = [];

    RunSimulator(runs: number) {
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
            gameState.sparksSpeed = this.sparksSpeed;
            gameState.sparksStamina = this.sparksStamina;
            gameState.sparksPower = this.sparksPower;
            gameState.sparksGuts = this.sparksGuts;
            gameState.sparksWit = this.sparksWit;
            gameState.initRun();

            gameState.getCardPositions();

            this.log += "start " + i + "\n";
            this.log += "cards " + gameState.cards.map(c => c.CardName) + " (race bonus: " + gameState.raceBonus + ")\n";
            while (gameState.turnsRemaining > 0) {
                this.log += "turn: " + gameState.turn + "\n";
                this.log += "state: " + gameState.getStatsString() + " (energy: " + gameState.energy + ")\n";
                this.log += "pos: " + gameState.cardPositions + "\n";
                let id = this.ChooseBestTraining(gameState);
                if (id == -1) {
                    gameState.doRest();
                } else {
                    gameState.doTraining(id);
                }
                if (gameState.turn == 24 || gameState.turn == 48) {
                    this.log += "post-inherit state: " + gameState.getStatsString() + " (turn: " + gameState.turn + ")\n";
                }
                this.log += "selected: " + id + "\n";
            }
            this.results.push(gameState);
            console.log(gameState);
            console.log(gameState.getStatsString());
            this.log += "finalstate: " + gameState.getStatsString()+ "\n\n";
            this.logs[i] = this.log;
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
            let effect = gameState.getTrainingEffect(i);
            results.push(effect);
            let distSpeed = effect.speed*(1.1-Math.min((gameState.speed+effect.speed)/this.targetSpeed, 1)*0.5);
            let distStamina = effect.stamina*(1.1-Math.min((gameState.stamina+effect.stamina)/this.targetStamina, 1)*0.5);
            let distPower = effect.power*(1.1-Math.min((gameState.power+effect.power)/this.targetPower, 1)*0.5);
            let distGuts = effect.guts*(1.1-Math.min((gameState.guts+effect.guts)/this.targetGuts, 1)*0.5);
            let distWit = effect.wit*(1.1-Math.min((gameState.wit+effect.wit)/this.targetWit, 1)*0.5);
            let value = (distSpeed+distStamina+distPower+distGuts+distWit)*(1-effect.failureChance*0.01);
            if (effect.energy > 0 && gameState.energy+effect.energy <= 100) {
                value += Math.min(effect.energy, 100-gameState.energy);
            }
            this.log += i+": " + effect.speed + ", " + effect.stamina + ", " + effect.power + ", " + effect.guts + ", " + effect.wit + " = " + value.toFixed(2) + " (fail: " + effect.failureChance + ", lvl: " + gameState.trainings[i].level + ")\n";
            if (value > valueMax) {
                valueMax = value;
                valueMaxId = i;
                valueMaxFailure = effect.failureChance;
            }
        }
        if ((gameState.energy < 50 && valueMax < 30) || valueMaxFailure > 30) {
            return -1;
        }
        return valueMaxId;
    }

    GetDistFromTargetSum(gameState: GameState) {
        return gameState.speed/this.targetSpeed + gameState.stamina/this.targetStamina + gameState.power/this.targetPower + gameState.guts/this.targetGuts + gameState.wit/this.targetWit;
    }
}