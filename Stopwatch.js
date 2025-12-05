export const formatTime = (ms) => {
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return (
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`
    );
}

export const getStopwatch = (displayElement) => {
    let startTime = 0;
    let elapsedTime = 0;
    let timerInterval = null;
    let isRunning = false;
    
    displayElement.textContent = formatTime(elapsedTime);

    const updateDisplay = () => {
        elapsedTime = Date.now() - startTime;
        displayElement.textContent = formatTime(elapsedTime);
    };

    const start = () => {
        if (!isRunning) {
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(updateDisplay, 10);
            isRunning = true;
        }
    };

    const stop = () => {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
        }
    };

    const reset = () => {
        clearInterval(timerInterval);
        elapsedTime = 0;
        isRunning = false;
        displayElement.textContent = formatTime(0);
    };

    const getElapsedtime = () => elapsedTime;

    return {
        start,
        stop,
        reset,
        getElapsedtime
    };
};