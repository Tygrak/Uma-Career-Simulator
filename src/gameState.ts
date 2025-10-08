import { SupportCard, SupportCardEffectType, SupportCardType } from "./supportCard";

import * as trainingData from "./data/trainingData.json";

export class GameState {
    turn: number = 0;
    turnsRemaining: number = 77;
    energy: number = 100;
    startEnergy: number = 100;
    maxEnergy: number = 100;
    mood: number = 2;

    speed = 100;
    stamina = 100;
    power = 100;
    guts = 100;
    wit = 100;
    skillPoints = 0;

    objectiveRaces: number[] = [11, 22, 28, 41, 52, 59, 66, 67, 73, 75, 77];
    raceBonus = 0;

    speedGrowth = 0.2;
    staminaGrowth = 0;
    powerGrowth = 0;
    gutsGrowth = 0.1;
    witGrowth = 0;

    failedTrainings = 0;
    wellRested = 0;
    allRefreshed = 0;
    sleepDeprived = 0;

    sparksSpeed = [0, 0, 0];
    sparksStamina = [0, 0, 0];
    sparksPower = [0, 0, 0];
    sparksGuts = [0, 0, 0];
    sparksWit = [0, 0, 0];

    cardLevels: number[] = [50, 50, 50, 50, 50, 50];
    cards: SupportCard[] = [];
    cardPositions: number[] = [-1, -1, -1, -1, -1, -1];
    cardBonds: number[] = [0, 0, 0, 0, 0, 0];

    trainings: TrainingFacility[] = [new TrainingFacility(trainingData[0]), new TrainingFacility(trainingData[1]), new TrainingFacility(trainingData[2]), new TrainingFacility(trainingData[3]), new TrainingFacility(trainingData[4])];

    getCardPositions() {
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const level = this.cardLevels[i];
            let priority = card.getEffectStrengthAtLevel(level, SupportCardEffectType.SpecialtyPriority);
            let weights = [100, 100, 100, 100, 100, 50];
            if (card.getSupportCardTypeEnum() == SupportCardType.Speed) {
                weights[0] += priority;
            } else if (card.getSupportCardTypeEnum() == SupportCardType.Stamina) {
                weights[1] += priority;
            } else if (card.getSupportCardTypeEnum() == SupportCardType.Power) {
                weights[2] += priority;
            } else if (card.getSupportCardTypeEnum() == SupportCardType.Guts) {
                weights[3] += priority;
            } else if (card.getSupportCardTypeEnum() == SupportCardType.Wit) {
                weights[4] += priority;
            }
            let random = Math.random()*(550+priority);
            let total = 0;
            let pos = 0;
            for (let j = 0; j < weights.length; j++) {
                if (random < total+weights[j]) {
                    pos = j;
                    if (pos == 5) {
                        pos = -1;
                    }
                    break;
                }
                total += weights[j];
            }
            this.cardPositions[i] = pos;
        }
    }

    getTrainingEffect(id: number) {
        const facility = this.trainings[id];
        let base = Object.assign({}, facility.levels[facility.level]);
        if (this.getIsSummerCamp()) {
            base = Object.assign({}, facility.levels[4]);
        }
        let moodEffect = 1;
        let trainingEffect = 1;
        let friendshipBonus = 1;
        let energyCostReduction = 0;
        let failureProtection = 0;
        let skillPointBonus = 0;
        let numCards = 0;
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cardPositions[i] == id) {
                numCards++;
                const card = this.cards[i];
                moodEffect += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.MoodEffect)*0.01;
                trainingEffect += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.TrainingEffectiveness)*0.01;
                if (this.cardBonds[i] > 80 && card.getSupportCardTypeEnum() == id) {
                    friendshipBonus *= (1+card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.FriendshipBonus)*0.01);
                    if (id == 4) {
                        base.energy += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.WitFriendshipRecovery);
                    }
                }
                if (base.speed > 0) {
                    base.speed += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.SpeedBonus);
                }
                if (base.stamina > 0) {
                    base.stamina += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.StaminaBonus);
                }
                if (base.power > 0) {
                    base.power += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.PowerBonus);
                }
                if (base.guts > 0) {
                    base.guts += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.GutsBonus);
                }
                if (base.wit > 0) {
                    base.wit += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.WitBonus);
                }
                energyCostReduction += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.EnergyCostReduction)*0.01;
                failureProtection += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.FailureProtection)*0.01;
                skillPointBonus += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.SkillPointBonus);
            }
        }
        let effect = new TrainingEffect();
        effect.speed = Math.floor(this.getTrainingResult(base.speed, moodEffect, trainingEffect, friendshipBonus, numCards)*(1+this.speedGrowth));
        effect.stamina = Math.floor(this.getTrainingResult(base.stamina, moodEffect, trainingEffect, friendshipBonus, numCards)*(1+this.staminaGrowth));
        effect.power = Math.floor(this.getTrainingResult(base.power, moodEffect, trainingEffect, friendshipBonus, numCards)*(1+this.powerGrowth));
        effect.guts = Math.floor(this.getTrainingResult(base.guts, moodEffect, trainingEffect, friendshipBonus, numCards)*(1+this.gutsGrowth));
        effect.wit = Math.floor(this.getTrainingResult(base.wit, moodEffect, trainingEffect, friendshipBonus, numCards)*(1+this.witGrowth));
        if (effect.speed+this.speed > 1200) {
            effect.speed = 1200-this.speed;
        }
        if (effect.stamina+this.stamina > 1200) {
            effect.stamina = 1200-this.stamina;
        }
        if (effect.power+this.power > 1200) {
            effect.power = 1200-this.power;
        }
        if (effect.guts+this.guts > 1200) {
            effect.guts = 1200-this.guts;
        }
        if (effect.wit+this.wit > 1200) {
            effect.wit = 1200-this.wit;
        }
        effect.energy = base.energy*(1-energyCostReduction);
        effect.failureChance = this.getFailureChance(effect.energy, facility)*(1-failureProtection);
        effect.skillPoints = 2+skillPointBonus;
        return effect;
    }

    initRun() {
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            this.cardBonds[i] = card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialFriendshipGauge);
            this.speed += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialSpeed);
            this.stamina += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialStamina);
            this.power += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialPower);
            this.guts += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialGuts);
            this.wit += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.InitialWit);
            this.raceBonus += card.getEffectStrengthAtLevel(this.cardLevels[i], SupportCardEffectType.RaceBonus)*0.01;
        }
        this.speed += this.sparksSpeed[0]*5+this.sparksSpeed[1]*12+this.sparksSpeed[2]*21;
        this.stamina += this.sparksStamina[0]*5+this.sparksStamina[1]*12+this.sparksStamina[2]*21;
        this.power += this.sparksPower[0]*5+this.sparksPower[1]*12+this.sparksPower[2]*21;
        this.guts += this.sparksGuts[0]*5+this.sparksGuts[1]*12+this.sparksGuts[2]*21;
        this.wit += this.sparksWit[0]*5+this.sparksWit[1]*12+this.sparksWit[2]*21;
    }

    doInherit() {
        for (let i = 0; i < 3; i++) {
            this.speed += this.getInheritSparkMultiple(this.sparksSpeed[i], i);
            this.stamina += this.getInheritSparkMultiple(this.sparksStamina[i], i);
            this.power += this.getInheritSparkMultiple(this.sparksPower[i], i);
            this.guts += this.getInheritSparkMultiple(this.sparksGuts[i], i);
            this.wit += this.getInheritSparkMultiple(this.sparksWit[i], i);
        }
    }

    doEndTurn() {
        this.turnsRemaining--;
        this.turn++;
        if (this.turn == 32 || this.turn == 56) {
            this.doInherit();
        }
        while (this.objectiveRaces.includes(this.turn)) {
            this.doRace();
        }
        if (this.turnsRemaining == 0) {
            this.doResults();
        }
        this.doEvent();
        this.getCardPositions();
    }

    doRace() {
        let index = this.objectiveRaces.indexOf(this.turn);
        if (index >= this.objectiveRaces.length-3) {
            this.doGainAllStats(Math.floor(10*(1+this.raceBonus)));
        } else {
            this.doGainAllStats(Math.floor(3*(1+this.raceBonus)));
        }
        this.turn++;
        this.turnsRemaining--;
    }

    doEvent() {
        if (this.turn == 23) {
            if (this.energy < 95) {
                this.doGainEnergy(20);
            } else {
                this.speed += 10;
            }
        } else if (this.turn == 47) {
            if (this.energy < 90) {
                this.doGainEnergy(30);
            } else {
                this.doGainAllStats(5);
            }
        }
    }

    doResults() {
        this.doGainAllStats(5);
        this.doGainAllStats(15);
        this.doGainAllStats(5);
    }

    doGainAllStats(amount: number) {
        this.speed = Math.min(this.speed + amount, 1200);
        this.stamina = Math.min(this.stamina + amount, 1200);
        this.power = Math.min(this.power + amount, 1200);
        this.guts = Math.min(this.guts + amount, 1200);
        this.wit = Math.min(this.wit + amount, 1200);
    }

    doGainEnergy(amount: number) {
        this.energy = Math.max(Math.min(this.energy + amount, 100), 0);
    }

    doGainMood(amount: number) {
        this.mood = Math.max(Math.min(this.mood + amount, 2), -2);
    }

    getDaysBeforeSummerCamp() {
        if (this.turn <= 35) {
            return 36-this.turn;
        }
        if (this.turn <= 59) {
            return 60-this.turn;
        }
        return 100;
    }

    getIsSummerCamp() {
        if (this.turn >= 36 && this.turn <= 39) {
            return true;
        }
        if (this.turn >= 60 && this.turn <= 63) {
            return true;
        }
        return false;
    }

    getInheritSparkMultiple(num: number, stars: number) {
        let result = 0;
        for (let i = 0; i < num; i++) {
            result += this.getInheritSpark(stars);
        }
        return result;
    }

    getInheritSpark(stars: number) {
        let compatibility = 0.2;
        let random = Math.random()*100;
        let chance = stars == 0 ? 70 : (stars == 1 ? 80 : 90);
        chance = chance*(1+compatibility);
        if (random < chance) {
            return Math.floor(Math.random()*(stars == 0 ? 10 : (stars == 1 ? 16 : 28)));
        }
        return 0;
    }

    doTraining(id: number) {
        let effect = this.getTrainingEffect(id);
        let random = Math.random()*100;
        if (random > effect.failureChance) {
            this.speed += effect.speed;
            this.stamina += effect.stamina;
            this.power += effect.power;
            this.guts += effect.guts;
            this.wit += effect.wit;
            this.energy += effect.energy;
            this.skillPoints += effect.skillPoints;
        } else {
            this.failedTrainings++;
        }

        this.speed = Math.min(1200, this.speed);
        this.stamina = Math.min(1200, this.stamina);
        this.power = Math.min(1200, this.power);
        this.guts = Math.min(1200, this.guts);
        this.wit = Math.min(1200, this.wit);
        this.energy = Math.min(100, Math.max(0, this.energy));
        
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cardPositions[i] == id) {
                //training gives +7, with charming +9, hints +5
                this.cardBonds[i] += 7;
            }
        }

        if (!this.getIsSummerCamp()) {
            this.trainings[id].trainingsDone++;
            if (this.trainings[id].trainingsDone >= 16) {
                this.trainings[id].level = 4;
            } else if (this.trainings[id].trainingsDone >= 12) {
                this.trainings[id].level = 3;
            } else if (this.trainings[id].trainingsDone >= 8) {
                this.trainings[id].level = 2;
            } else if (this.trainings[id].trainingsDone >= 4) {
                this.trainings[id].level = 1;
            }
        }
        this.doEndTurn();
    }

    doRest() {
        if (this.getIsSummerCamp()) {
            this.doGainEnergy(40);
            this.doGainMood(1);
        } else {
            let random = Math.random()*100;
            if (random < 56) {
                this.doGainEnergy(50);
                this.allRefreshed++;
            } else if (random < 84) {
                this.doGainEnergy(70);
                this.wellRested++;
            } else {
                this.doGainEnergy(30);
                this.sleepDeprived++;
            }
        }
        this.doEndTurn();
    }

    getTrainingResult(base: number, moodEffect: number, trainingEffect: number, friendshipBonus: number, numCards: number) {
        return base * (1 + this.mood * 0.1 * moodEffect) * trainingEffect * friendshipBonus * (1 + 0.05 * numCards);
    }

    //thanks to Transparent Dino
    getFailureChance(energyCost: number, facility: TrainingFacility) {
        let failureModifier = 530;
        if (facility.name == "speed") {
            failureModifier = 520+facility.level*4;
        } else if (facility.name == "stamina") {
            failureModifier = 516+facility.level*4;
        } else if (facility.name == "power") {
            failureModifier = 507+facility.level*4;
        } else if (facility.name == "guts") {
            failureModifier = 532+facility.level*4;
        } else if (facility.name == "wit") {
            failureModifier = 320+facility.level*1;
        }
        let baseRate = (this.energy - 100) * (this.energy * 10 - failureModifier) / 400;
        return Math.min(Math.max(baseRate, 0), 100);
    }

    getStatsString() {
        return "speed: " + this.speed + ", stamina: " + this.stamina + ", power: " + this.power + ", guts: " + this.guts + ", wit: " + this.wit;
    }

    getTrainingsString() {
        return "trainings: speed: " + this.trainings[0].trainingsDone + ", stamina: " + this.trainings[1].trainingsDone + ", power: " + this.trainings[2].trainingsDone + ", guts: " + this.trainings[3].trainingsDone + ", wit: " + this.trainings[4].trainingsDone + "";
    }

    getStatsSum() {
        return this.speed + this.stamina + this.power + this.guts + this.wit;
    }

    //209

    //(StartingEnergy - ExtraMaxEnergy/3) / (100 - ExtraMaxEnergy/3 + EnergyUsageWithOffsetForLvl4And5)
    //(BaseValue + Sum of StatBonus) * (1 + MoodMultiplier * (Sum of MoodEffect)) * (Sum of TrainingBonus) * (Product of FriendshipBonus) * (1 + 0.05 * NumberOfSupportCards)
}

export class TrainingEffect {
    energy: number = 0;
    speed: number = 0;
    stamina: number = 0;
    power: number = 0;
    guts: number = 0;
    wit: number = 0;
    skillPoints: number = 2;
    failureChance: number = 0;

    toString() {
        let result = this.energy+": ";
        let statResult = "";
        if (this.speed != 0) {
            statResult += "spd-"+this.speed;
        }
        if (this.stamina != 0) {
            if (statResult != "") {
                statResult += ", ";
            }
            statResult += "sta-"+this.stamina;
        }
        if (this.power != 0) {
            if (statResult != "") {
                statResult += ", ";
            }
            statResult += "pow-"+this.power;
        }
        if (this.guts != 0) {
            if (statResult != "") {
                statResult += ", ";
            }
            statResult += "gut-"+this.guts;
        }
        if (this.wit != 0) {
            if (statResult != "") {
                statResult += ", ";
            }
            statResult += "wit-"+this.wit;
        }
        result += statResult;
        result += " (fail:"+(this.failureChance).toFixed(2)+")";
        return result;
    }
}

export class TrainingFacility {
    name = "";
    level = 0;
    trainingsDone = 0;
    levels: {
        energy: number;
        speed: number;
        stamina: number;
        power: number;
        guts: number;
        wit: number;
    }[] = [];

    public constructor(init?:Partial<TrainingFacility>) {
        Object.assign(this, init);
    }
}
