/** @type {HTMLInputElement[]} */
const inputs = [
    document.getElementById("A"),
    document.getElementById("B"),
    document.getElementById("C"),
    document.getElementById("D"),
]

inputs.forEach(x => {
    x.onchange = recalculate;
    x.onkeyup = recalculate;
    x.onclick = (ev) => {
        if (!ev.shiftKey)
            return;

        const di = getDisabledInput();
        di.disabled = false;
        di.value = ev.target.value;

        ev.target.disabled = true;
        ev.target.value = 0;

        recalculate()
    };
})

const pFormula = document.getElementById("p-formula");

const pErr = document.getElementById("p-err");

/** @type {HTMLInputElement} */
const dp = document.querySelector("#digits input[type=number]");
dp.onchange = (ev) => {
    ev.target.value = Math.floor(ev.target.value);
    recalculate();
}

document.getElementById("btn-clear").onclick = () => inputs.forEach(x => x.value = x.disabled ? 0 : "")

const copyIcons = document.querySelectorAll(".copy-icon").forEach((el, index) => {
    el.onclick = () => toClipBoard(inputs[index].value);
});

document.getElementById("AB").onclick = () => switchInput(0, 1);
document.getElementById("CD").onclick = () => switchInput(2, 3);
document.getElementById("AC").onclick = () => switchInput(0, 2);
document.getElementById("BD").onclick = () => switchInput(1, 3);

function getDisabledInput() {
    return inputs.find(x => x.disabled);
}

function switchInput(a, b) {
    const temp = inputs[a].value;

    if (!inputs[a].disabled)
        inputs[a].value = inputs[b].value;

    if (!inputs[b].disabled)
        inputs[b].value = temp;

    recalculate()
}

async function toClipBoard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function recalculate() {
    let errText = "";

    let c = inputs.length;
    inputs.forEach(x => {
        if (/\S/.test(x.value))
            c--;
        else
            errText += "Input " + x.id + " is invalid<br/>";
    })

    // console.log(c);
    if (c === 0) {
        // a * d = b * c 
        inputs.every((el, i) => {
            if (!el.disabled)
                return true;

            // 1 0 0 1
            // 2 3 3 2
            // 0 1 2 3
            // let [a,b] = index === 0 || index === 3 ? [1,2] : [0,3];

            const i0 = inputs[Math.floor(i * (i - 3) / 2 + 1)];
            const i1 = inputs[Math.floor(i * (-i + 3) / 2 + 2)];
            const i2 = inputs[inputs.length - i - 1];
            const r = inputs[i];
            
            if(i2.value !== "0"){
                const value = parseFloat(i0.value) * parseFloat(i1.value) / parseFloat(i2.value);
                r.value = Number.isInteger(value) ? value : value.toFixed(dp.value);
                pFormula.innerHTML = `${r.id} (${r.value}) = ${i0.id} (${i0.value}) * ${i1.id} (${i1.value}) / ${i2.id} (${i2.value})`;
            }
            else
                errText += `The divisor <b>${i2.id}</b> is 0`;

            return false;
        })
    }

    if (errText === "") {
        pErr.style.display = "none";
        pErr.innerHTML = "";
    }
    else {
        pErr.style.display = "";
        pErr.innerHTML = errText;
    }

}
