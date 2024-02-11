const { Timer } = require("./Timer");

export class Countdown extends Timer {
   private secsRemaining: number;

   constructor(secsRemaining: number, doEachSec: (remainingTime: number) => void, doAtEnd: () => void) {
	  super(1000);
	  this.secsRemaining = secsRemaining;
	  super.start(() => {
		 this.secsRemaining--;
		 doEachSec(this.secsRemaining);
		 if(this.secsRemaining < 1) {
			super.cancel();
				 
			// countdown is over when the timer clock runs out
			doAtEnd();
		 }
	  });
   }
}
