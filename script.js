let array = [];
let arraySize = 30;  // Limit array size to 30
let isPaused = false;
let isRunning = false;
let selectedAlgorithm = null;

const arrayContainer = document.getElementById("array-container");
const xAxis = document.querySelector(".x-axis");
const yAxis = document.querySelector(".y-axis");

document.getElementById("generate-array").addEventListener("click", generateArray);
document.getElementById("start").addEventListener("click", startSorting);
document.getElementById("pause").addEventListener("click", pauseSorting);
document.getElementById("bubble-sort").addEventListener("click", () => selectAlgorithm(bubbleSort));
document.getElementById("selection-sort").addEventListener("click", () => selectAlgorithm(selectionSort));
document.getElementById("insertion-sort").addEventListener("click", () => selectAlgorithm(insertionSort));
document.getElementById("quick-sort").addEventListener("click", () => selectAlgorithm(quickSort));
document.getElementById("merge-sort").addEventListener("click", () => selectAlgorithm(mergeSort));
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("array-size").addEventListener("change", function() {
    arraySize = Math.min(30, parseInt(this.value));  // Limit the array size to 30
    generateArray();
});
document.getElementById("custom-array").addEventListener("change", function() {
    const input = this.value.split(',').map(Number).filter(num => !isNaN(num) && num <= 100); // Limit values to 100
    array = input;
    generateCustomArray();
});

function generateArray() {
    array = [];
    arrayContainer.innerHTML = '';
    xAxis.innerHTML = '';
    yAxis.innerHTML = '';
    for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * 100) + 1);  // Limit value to 100
    }
    displayArray();
    displayAxes();
}

function generateCustomArray() {
    arrayContainer.innerHTML = '';
    xAxis.innerHTML = '';
    displayArray();
    displayAxes();
}

function displayArray() {
    arrayContainer.innerHTML = '';
    for (let i = 0; i < array.length; i++) {
        let bar = document.createElement("div");
        bar.classList.add("array-bar");
        bar.style.height = `${array[i] * 3}px`;  // Adjust height scale
        bar.style.width = `${100 / arraySize}%`;

        // Add label for each bar (displaying the value)
        let label = document.createElement("div");
        label.classList.add("bar-label");
        label.innerText = array[i];
        label.style.color = "black";
        label.style.fontSize = "10px";
        bar.appendChild(label);

        arrayContainer.appendChild(bar);
    }
}

function displayAxes() {
    // Y-axis (value labels)
    const yAxisMax = 100;
    for (let i = 5; i >= 0; i--) {
        let label = document.createElement("div");
        label.innerText = Math.floor((yAxisMax / 5) * i);
        yAxis.appendChild(label);
    }

    // X-axis (array values)
    xAxis.innerHTML = '';
    for (let i = 0; i < array.length; i++) {
        let label = document.createElement("div");
        label.innerText = array[i];  // Display actual array values on x-axis
        xAxis.appendChild(label);
    }
}

function startSorting() {
    if (selectedAlgorithm && !isRunning) {
        isRunning = true;
        selectedAlgorithm();
    } else if (isPaused) {
        isPaused = false;
    }
}

function pauseSorting() {
    isPaused = true;
}

function selectAlgorithm(algo) {
    selectedAlgorithm = algo;
}

async function bubbleSort() {
    let bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            if (isPaused) await waitForResume();
            await highlightBars(bars, j, j + 1);
            if (array[j] > array[j + 1]) {
                await swap(bars, j, j + 1);
            }
            resetBarColor(bars, j, j + 1);
        }
        bars[array.length - i - 1].style.backgroundColor = "green"; // Sorted
    }
    bars[0].style.backgroundColor = "green"; // Final sorted element
    isRunning = false; // Stop sorting when done
}

async function selectionSort() {
    let bars = document.getElementsByClassName("array-bar");
    for (let i = 0; i < array.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            if (isPaused) await waitForResume();
            await highlightBars(bars, j, minIndex);
            if (array[j] < array[minIndex]) {
                if (minIndex !== i) {
                    bars[minIndex].style.backgroundColor = "blue"; // Reset previous min index
                }
                minIndex = j;
            }
            resetBarColor(bars, j, minIndex);
        }
        await swap(bars, i, minIndex);
        bars[minIndex].style.backgroundColor = "green"; // Final sorted element
    }
}

async function insertionSort() {
    let bars = document.getElementsByClassName("array-bar");
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            if (isPaused) await waitForResume();
            await highlightBars(bars, j, i);
            array[j + 1] = array[j];
            j--;
            resetBarColor(bars, j + 1, i);
        }
        array[j + 1] = key;
        if (isPaused) await waitForResume();
        await displayArray();
    }
    for (let i = 0; i < array.length; i++) {
        bars[i].style.backgroundColor = "green"; // Final sorted element
    }
}

async function quickSort(arr, left, right) {
    if (left < right) {
        let pivotIndex = await partition(arr, left, right);
        if (isPaused) await waitForResume();
        await quickSort(arr, left, pivotIndex - 1);
        await quickSort(arr, pivotIndex + 1, right);
    }
    await displayArray();
}

async function partition(arr, left, right) {
    let pivot = arr[right];
    let i = left - 1;
    let bars = document.getElementsByClassName("array-bar");

    for (let j = left; j < right; j++) {
        if (isPaused) await waitForResume();
        await highlightBars(bars, j, right);
        if (arr[j] < pivot) {
            i++;
            await swap(bars, i, j);
        }
        resetBarColor(bars, j, right);
    }
    await swap(bars, i + 1, right);
    return i + 1;
}

async function mergeSort(left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (isPaused) await waitForResume();
        await mergeSort(left, mid);
        await mergeSort(mid + 1, right);
        await merge(left, mid, right);
    }
    await displayArray();
}

async function merge(left, mid, right) {
    const leftArray = array.slice(left, mid + 1);
    const rightArray = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    let bars = document.getElementsByClassName("array-bar");
    while (i < leftArray.length && j < rightArray.length) {
        if (isPaused) await waitForResume();
        await highlightBars(bars, k, mid + 1);
        if (leftArray[i] <= rightArray[j]) {
            array[k] = leftArray[i];
            i++;
        } else {
            array[k] = rightArray[j];
            j++;
        }
        k++;
        await displayArray();
    }

    while (i < leftArray.length) {
        array[k] = leftArray[i];
        i++;
        k++;
    }

    while (j < rightArray.length) {
        array[k] = rightArray[j];
        j++;
        k++;
    }
}

// The other sorting algorithms will follow the same pattern as bubbleSort

async function waitForResume() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (!isPaused) {
                clearInterval(interval);
                resolve();
            }
        }, 100); // Check every 100ms
    });
}

async function highlightBars(bars, i, j) {
    bars[i].style.backgroundColor = "red";
    bars[j].style.backgroundColor = "red";
    await sleep(100);  // Static speed
}

async function resetBarColor(bars, ...indexes) {
    for (let index of indexes) {
        if (index >= 0) {
            bars[index].style.backgroundColor = "blue";
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function swap(bars, i, j) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let tempHeight = bars[i].style.height;
            bars[i].style.height = bars[j].style.height;
            bars[j].style.height = tempHeight;

            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;

            // Update number labels below bars
            bars[i].querySelector(".bar-label").innerText = array[i];
            bars[j].querySelector(".bar-label").innerText = array[j];

            // Update X-axis values after swap
            xAxis.children[i].innerText = array[i];
            xAxis.children[j].innerText = array[j];

            resolve();
        }, 100);
    });
}

// Reset function
function reset() {
    isRunning = false;
    isPaused = false;
    generateArray();
}

// Initial array generation
generateArray();