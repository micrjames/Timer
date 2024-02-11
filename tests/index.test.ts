const { Timer } = require("../Timer");

const createTimer = function(timerEl, secsRemaining, doEnd) {
    let secsRemainingText;
    let timer = new Timer(1000);
    timer.start(() => {
        secsRemaining--;
        if(secsRemaining >= 10) {
            secsRemainingText = secsRemaining;
        } else {
            if(secsRemaining < 1) {
                timer.cancel();
              
                // game is over when the timer clock runs out
                doEnd();
            }
            secsRemainingText = `0${secsRemaining}`;
        }
        timerEl.textContent = secsRemainingText;
    });

    return timer;
};
