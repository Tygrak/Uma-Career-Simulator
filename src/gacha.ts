import "./styles.css";

import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);
Chart.defaults.color = "white";

const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
const logDiv = document.getElementById("log") as HTMLDivElement;
const log2Div = document.getElementById("log2") as HTMLDivElement;
const graphCanvas = document.getElementById("graph") as HTMLCanvasElement;

function runTarget1Card() {
    let runs = parseInt((document.getElementById("numRuns") as HTMLInputElement).value);
    let num = parseInt((document.getElementById("numPulls") as HTMLInputElement).value);
    let chance1 = parseFloat((document.getElementById("chanceCard1") as HTMLInputElement).value);
    let results = [];
    let resultsCount = [0, 0, 0, 0, 0, 0];
    for (let run = 0; run < runs; run++) {
        let card1 = 0;
        let otherSSR = 0;
        let i = 0;
        for (i = 1; i <= num; i++) {
            let random = Math.random() * 100;
            if (random < chance1) {
                card1++;
            }
            if (card1 + Math.floor(i / 200) >= 5) {
                results.push(i);
                resultsCount[5]++;
                break;
            }
        }
        if (card1 + Math.floor(i / 200) < 5) {
            results.push(-1);
            resultsCount[card1 + Math.floor(i / 200)]++;
        }
    }
    const stats = new Map<number, number>();
    for (let numPulls of results) {
        let bin = Math.floor(numPulls / 10) * 10;
        stats.set(bin, (stats.get(bin) || 0) + 1);
    }
    const sortedStats = Array.from(stats.entries()).sort((a, b) => b[0] - a[0]);
    let result = "Pulls to mlb: \n";
    for (const [numPulls, count] of sortedStats) {
        const percent = ((count / runs) * 100).toFixed(2);
        result += `${numPulls == -10 ? "not mlb" : numPulls} => ${count} runs (${percent}%)\n`;
    }
    let result2 = "Result breakdown: \n";
    for (let i = 0; i <= 5; i++) {
        if (i == 5) {
            result2 += "card mlb: ";
        } else if (i == 0) {
            result2 += "card none: ";
        } else {
            result2 += "card " + (i - 1) + "lb: ";
        }
        result2 += resultsCount[i] + " (" + ((resultsCount[i] / runs) * 100).toFixed(2) + "%)\n";
    }

    logDiv.innerText = result;
    log2Div.innerText = result2;

    const ascendingStats = [...sortedStats].sort((a, b) => a[0] - b[0]);

    let cumulative = 0;

    const labels: number[] = [];
    const data: number[] = [];

    for (const [bin, count] of ascendingStats) {
        if (bin < 0) continue;

        cumulative += count;

        labels.push(bin);
        data.push(cumulative / runs);
    }

    graphCanvas.hidden = false;

    const chart = new Chart(graphCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "P(MLB by N pulls)",
                    data,
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.2,
                    borderColor: "white",
                    backgroundColor: "white",
                    pointBackgroundColor: "white",
                    pointBorderColor: "white",
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Pulls (binned by 10)"
                    },
                    ticks: {
                        color: "white"
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.2)"
                    }
                },
                y: {
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: "Cumulative probability"
                    },
                    ticks: {
                        color: "white",
                        callback: value => `${(Number(value) * 100).toFixed(0)}%`
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.2)"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const pulls = ctx.label;
                            const prob = ctx.parsed.y;
                            return `P(MLB by ${pulls} pulls): ${((prob == null ? 0 : prob) * 100).toFixed(2)}%`;
                        }
                    }
                }
            },
            interaction: {
                mode: "nearest",
                intersect: false
            }
        }
    });

    (graphCanvas as any)._chart = chart;
}

submitButton.onclick = (e) => {
    console.log("Run");

    // Destroy previous chart if rerun
    if ((graphCanvas as any)._chart) {
        (graphCanvas as any)._chart.destroy();
    }

    let runs = parseInt((document.getElementById("numRuns") as HTMLInputElement).value);
    let num = parseInt((document.getElementById("numPulls") as HTMLInputElement).value);
    let chance1 = parseFloat((document.getElementById("chanceCard1") as HTMLInputElement).value);
    let chance2 = parseFloat((document.getElementById("chanceCard2") as HTMLInputElement).value);
    let chance3 = parseFloat((document.getElementById("chanceCard3") as HTMLInputElement).value);
    let target1Card = (document.getElementById("targetCard1") as HTMLInputElement).checked;
    if (target1Card) {
        runTarget1Card();
        return;
    } else {
        graphCanvas.hidden = true;
    }
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
            let random = Math.random() * 100;
            if (random < chance1) {
                if (card1 < 5) {
                    card1++;
                }
                continue;
            } else if (random < chance1 + chance2) {
                if (card2 < 5) {
                    card2++;
                }
                continue;
            } else if (random < chance1 + chance2 + chance3) {
                if (card3 < 5) {
                    card3++;
                }
                continue;
            } else if (random < chance1 + chance2 + chance3 + (3 - chance1 - chance2)) {
                otherSSR++;
                continue;
            }
        }
        if (card1 + card2 + Math.floor(num / 200) >= 10) {
            mlbBothCount++;
        }
        if (card1 + Math.floor(num / 200) >= 5 || card2 + Math.floor(num / 200) >= 5) {
            mlbOneCount++;
        }
        if (card3 >= 5) {
            mlbRareCount++;
        }
        resultsSSR.push(otherSSR);
        results.push({ card1, card2, card3 });
    }

    const stats = new Map<string, number>();

    let statsCard1 = [0, 0, 0, 0, 0, 0];
    let statsCard2 = [0, 0, 0, 0, 0, 0];

    for (const { card1, card2, card3 } of results) {
        statsCard1[card1]++;
        statsCard2[card2]++;
        let c = [card1, card2];
        c.sort((a, b) => a - b)
        const key = `${c[1]}-${c[0]}(${card3})`;
        stats.set(key, (stats.get(key) || 0) + 1);
    }

    const sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);

    const sortedSSR = resultsSSR.sort((a, b) => a - b);

    let result = "";

    result += "Mlb both: " + ((mlbBothCount / runs) * 100).toFixed(2) + "%\n";
    result += "Mlb one: " + ((mlbOneCount / runs) * 100).toFixed(2) + "%\n";
    result += "Mlb rare: " + ((mlbRareCount / runs) * 100).toFixed(2) + "%\n";
    result += "Median random other SSR: " + (sortedSSR[Math.floor(sortedSSR.length / 2)]) + "\n";
    for (const [combo, count] of sortedStats) {
        const percent = ((count / runs) * 100).toFixed(2);
        result += `${combo.padEnd(15)} => ${count} runs (${percent}%)\n`;
    }

    let result2 = "Individual cards breakdown: \n";
    for (let i = 0; i <= 5; i++) {
        if (i == 5) {
            result2 += "card 1 mlb: ";
        } else if (i == 0) {
            result2 += "card 1 none: ";
        } else {
            result2 += "card 1 " + (i - 1) + "lb: ";
        }
        result2 += statsCard1[i] + " (" + ((statsCard1[i] / runs) * 100).toFixed(2) + "%)\n";
    }

    result2 += "\n";
    for (let i = 0; i <= 5; i++) {
        if (i == 5) {
            result2 += "card 2 mlb: ";
        } else if (i == 0) {
            result2 += "card 2 none: ";
        } else {
            result2 += "card 2 " + (i - 1) + "lb: ";
        }
        result2 += statsCard2[i] + " (" + ((statsCard2[i] / runs) * 100).toFixed(2) + "%)\n";
    }

    result2 += "\n+" + Math.floor(num / 200) + " sparks\n";

    logDiv.innerText = result;
    log2Div.innerText = result2;
};

