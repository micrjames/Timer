const Timer = function(interval) {
    let timerID;

    this.start = function(callback) {
	    timerID = setInterval(callback, interval);
	};

    this.cancel = function() {
	    clearInterval(timerID);
	};
};

export { Timer };
