import supportCardsData from "./data/supportCardsData.json";
import supportCardsEventData from "./data/supportCardEvents.json";

export enum SupportCardType {
    Speed = 0,
    Stamina = 1,
    Power = 2,
    Guts = 3,
    Wit = 4,
    Friend = 999
}

export enum SupportCardRarity {
    R = 1,
    SR = 2,
    SSR = 3
}

export enum SupportCardEffectType {
    None = 0,
    FriendshipBonus = 1,
    MoodEffect = 2,
    SpeedBonus = 3,
    StaminaBonus = 4,
    PowerBonus = 5,
    GutsBonus = 6,
    WitBonus = 7,
    TrainingEffectiveness = 8,
    InitialSpeed = 9,
    InitialStamina = 10,
    InitialPower = 11,
    InitialGuts = 12,
    InitialWit = 13,
    InitialFriendshipGauge = 14,
    RaceBonus = 15,
    FanBonus = 16,
    HintLevels = 17,
    HintFrequency = 18,
    SpecialtyPriority = 19,
    MaxSpeed = 20,
    MaxStamina = 21,
    MaxPower = 22,
    MaxGuts = 23,
    MaxWit = 24,
    EventRecovery = 25,
    EventEffectiveness = 26,
    FailureProtection = 27,
    EnergyCostReduction = 28,
    MinigameEffectiveness = 29,
    SkillPointBonus = 30,
    WitFriendshipRecovery = 31
}

export class SupportCard {
    Id = 0;
    CharaId = 0;
    Rarity = 0;
    EffectTableId = 0;
    UniqueId = 0;
    CommandType = 0;
    CommandId = 0;
    SupportCardType = 0;
    SupportCardEffects: SupportCardEffect[] = [];

    UniqueLv = -1;
    UniqueType0 = 0;
    UniqueValue0 = 0;
    UniqueType1 = 0;
    UniqueValue1 = 0;
    UniqueTypeName0 = '';
    UniqueTypeName1 = '';

    CardName = '';

    static fromJSON(data: any): SupportCard {
        const card = new SupportCard();
        Object.assign(card, data);
        card.SupportCardEffects = (data.SupportCardEffects || []).map(
            (e: any) => SupportCardEffect.fromJSON(e)
        );
        return card;
    }

    static getByName(name: string): SupportCard {
        let card = this.getAllCards().find(c => c.CardName.includes(name) && c.Rarity == 3);
        if (card === undefined) {
            card = this.getAllCards().find(c => c.CardName.includes(name) && c.Rarity == 2);
        }
        if (card === undefined) {
            card = this.getAllCards().find(c => c.CardName.includes(name) && c.Rarity == 1);
        }
        return this.fromJSON(card);
    }

    static getByNameAndRarity(name: string, rarity: number): SupportCard {
        let card = this.getAllCards().find(c => c.CardName.includes(name) && c.Rarity == rarity);
        return this.fromJSON(card);
    }
    
    static allcards: SupportCard[] = [];

    static getAllCards(): SupportCard[] {
        if (this.allcards.length == 0) {
            let cardsJson: any[] = supportCardsData;
            let cards = cardsJson.map(c => this.fromJSON(c));
            this.allcards = cards;
            return cards;
        }
        return this.allcards;
    }

    toString(): string {
        let result = `card: ${this.CardName} - ${this.Id}, ${this.CharaId}, ${this.getSupportCardRarityEnum()}, ${this.getSupportCardTypeEnum()}`;
        for (const effect of this.SupportCardEffects) {
            result += `\n${effect.toString()}`;
        }
        result += `\nunique: lv - ${this.UniqueLv}, ${this.UniqueValue0} ${this.UniqueTypeName0} (${this.UniqueType0}), ${this.UniqueValue1} ${this.UniqueTypeName1} (${this.UniqueType1})`;
        return result;
    }

    getSupportCardTypeEnum(): SupportCardType {
        switch (this.CommandId) {
            case 101:
                return SupportCardType.Speed;
            case 102:
                return SupportCardType.Power;
            case 103:
                return SupportCardType.Guts;
            case 105:
                return SupportCardType.Stamina;
            case 106:
                return SupportCardType.Wit;
            default:
                return SupportCardType.Friend;
        }
    }

    getSupportCardRarityEnum(): SupportCardRarity {
        switch (this.Rarity) {
            case 1:
                return SupportCardRarity.R;
            case 2:
                return SupportCardRarity.SR;
            default:
                return SupportCardRarity.SSR;
        }
    }

    getEffectStrengthAtLevel(level: number, supportCardEffectType: SupportCardEffectType): number {
        const supportCardEffect = this.SupportCardEffects.find(e => e.Type === supportCardEffectType);
        let value = 0;

        if (supportCardEffect) {
            value += supportCardEffect.getEffectAtLevel(level);
        }

        if (supportCardEffectType == SupportCardEffectType.FriendshipBonus) {
            if (this.UniqueType0 === supportCardEffectType && level >= this.UniqueLv) {
                value += this.UniqueValue0;
            }
            if (this.UniqueType1 === supportCardEffectType && level >= this.UniqueLv) {
                value += this.UniqueValue1;
            }
        } else {
            if (this.UniqueType0 === supportCardEffectType && level >= this.UniqueLv) {
                value += this.UniqueValue0;
            }
            if (this.UniqueType1 === supportCardEffectType && level >= this.UniqueLv) {
                value += this.UniqueValue1;
            }
        }

        return value;
    }
}

export class SupportCardEffect {
    Type: number = 0;
    Init: number = 0;
    Limit_lv5: number = 0;
    Limit_lv10: number = 0;
    Limit_lv15: number = 0;
    Limit_lv20: number = 0;
    Limit_lv25: number = 0;
    Limit_lv30: number = 0;
    Limit_lv35: number = 0;
    Limit_lv40: number = 0;
    Limit_lv45: number = 0;
    Limit_lv50: number = 0;
    TypeName: string = "";

    static fromJSON(data: any): SupportCardEffect {
        const effect = new SupportCardEffect();
        Object.assign(effect, data);
        return effect;
    }

    getEffectArray(): number[] {
        return [
            this.Init,
            this.Limit_lv5,
            this.Limit_lv10,
            this.Limit_lv15,
            this.Limit_lv20,
            this.Limit_lv25,
            this.Limit_lv30,
            this.Limit_lv35,
            this.Limit_lv40,
            this.Limit_lv45,
            this.Limit_lv50,
        ];
    }

    getEffectAtLevel(level: number): number {
        let currLevel = 1;
        let downLevel = -1;
        let upLevel = -1;
        let downEffect = -1;
        let upEffect = -1;

        for (const effect of this.getEffectArray()) {
            if (effect !== -1 && currLevel === level) {
                return effect;
            }
            if (effect !== -1 && currLevel < level) {
                downEffect = effect;
                downLevel = currLevel;
            }
            if (effect !== -1 && currLevel > level) {
                upEffect = effect;
                upLevel = currLevel;
            }

            currLevel += currLevel === 1 ? 4 : 5;
        }

        if (downLevel === -1) {
            return 0;
        }

        if (upLevel === -1) {
            return downEffect;
        }

        return Math.floor(
            ((level - downLevel) / (upLevel - downLevel)) * (upEffect - downEffect) + downEffect
        );
    }
}

export class SupportCardEvent {
    name: string = "";
    choices: SupportCardEventResult[][] = [];

    static fromJSON(data: any): SupportCardEvent {
        const event = new SupportCardEvent();
        Object.assign(event, data);
        event.choices = (data.choices || []).map(
            (e: any) => e.map((r: any) => SupportCardEventResult.fromJSON(r))
        );
        return event;
    }
}

export class SupportCardEventResult {
    probability = 50;
    energy = 0;
    mood = 0;
    bond = 0;
    speed = 0;
    stamina = 0;
    power = 0;
    guts = 0;
    wit = 0;
    skillPoints = 0;
    skillHints: string[] = []; 

    static fromJSON(data: any): SupportCardEventResult {
        const result = new SupportCardEventResult();
        Object.assign(result, data);
        return result;
    }
}
