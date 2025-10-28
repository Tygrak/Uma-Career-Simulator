import "./styles.css";

const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
const logDiv = document.getElementById("log") as HTMLDivElement;

submitButton.onclick = (e) => {
    console.log("Run");
    
    let runs = parseInt((document.getElementById("numRuns") as HTMLInputElement).value);
    let num = parseInt((document.getElementById("numPulls") as HTMLInputElement).value);
    let chance1 = parseFloat((document.getElementById("chanceCard1") as HTMLInputElement).value);
    let chance2 = parseFloat((document.getElementById("chanceCard2") as HTMLInputElement).value);
    let chance3 = parseFloat((document.getElementById("chanceCard3") as HTMLInputElement).value);
    let results = [];
    let resultsSSR = [];
    let mlbBothCount = 0;
    let mlbOneCount = 0;
    let mlbRareCount = 0;
    for (let run = 0; run < runs; run++) {
        let card1 = 0;
        let card2 = 0;
        let card3 = 0;
        let otherSSR = 0;
        for (let i = 0; i < num; i++) {
            let random = Math.random()*100;
            if (random < chance1) {
                if (card1 < 5) {
                    card1++;
                }
                continue;
            } else if (random < chance1+chance2) {
                if (card2 < 5) {
                    card2++;
                }
                continue;
            } else if (random < chance1+chance2+chance3) {
                if (card3 < 5) {
                    card3++;
                }
                continue;
            } else if (random < chance1+chance2+chance3+(3-chance1-chance2)) {
                otherSSR++;
                continue;
            }
        }
        if (card1+card2+Math.floor(num/200) >= 10) {
            mlbBothCount++;
        }
        if (card1+Math.floor(num/200) >= 5 || card2+Math.floor(num/200) >= 5) {
            mlbOneCount++;
        }
        if (card3 >= 5) {
            mlbRareCount++;
        }
        resultsSSR.push(otherSSR);
        results.push({card1, card2, card3});
    }
    
    const stats = new Map<string, number>();

    for (const { card1, card2, card3 } of results) {
        let c = [card1, card2];
        c.sort((a, b) => a - b)
        const key = `${c[1]}-${c[0]}(${card3})`;
        stats.set(key, (stats.get(key) || 0) + 1);
    }

    const sortedStats = Array.from(stats.entries()).sort((a, b) => {
        return b[1]-a[1];
    });

    const sortedSSR = resultsSSR.sort((a, b) => a-b);

    let result = "";

    result += "Mlb both: " + ((mlbBothCount/runs) * 100).toFixed(2) + "%\n";
    result += "Mlb one: " + ((mlbOneCount/runs) * 100).toFixed(2) + "%\n";
    result += "Mlb rare: " + ((mlbRareCount/runs) * 100).toFixed(2) + "%\n";
    result += "Median random other SSR: " + (sortedSSR[Math.floor(sortedSSR.length / 2)]) + "\n";
    for (const [combo, count] of sortedStats) {
        const percent = ((count / runs) * 100).toFixed(2);
        result += `${combo.padEnd(15)} => ${count} runs (${percent}%)\n`;
    }
    
    logDiv.innerText = result;
};

