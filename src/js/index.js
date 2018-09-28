'use strict';

window.onload = () => {
	(() => {
		// getting references to DOM elements
		let canvas = document.querySelector('canvas');
		let ctx = canvas.getContext('2d');
		let controls = document.querySelector('#controls');
        let audioElement = document.querySelector('audio');

		// timer for control minimization
		const canvas = document.querySelector('canvas');
		const ctx = canvas.getContext('2d');
		const controls = document.querySelector('#controls');
    const invertCheck = document.querySelector('#invertCheck');
    const songSelect = document.querySelector('#songSelect');
    const hexPicker = document.querySelector('#hexPicker');
    const sampleSelect = document.querySelector('#sampleSelect');
    const numLinesSelect = document.querySelector('#numLinesSelect');
		let timer = setTimeout(null);
		let invert = 1;
		let lineColor = '#fff';


        // number of samples (actually half of this)
        const NUM_SAMPLES = 4096;

        // audio hook ups
        let audioCtx = new AudioContext();
        let analyzerNode = audioCtx.createAnalyser();
        analyzerNode.fftSize = NUM_SAMPLES;
        let sourceNode = audioCtx.createMediaElementSource(audioElement);
        sourceNode.connect(analyzerNode);
        analyzerNode.connect(audioCtx.destination);

		// responsive design
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		// minimize controls
		const minimizeControls = () => {
			controls.classList.add('minimized');
		};
		// unminimize controls
		const unminimizeControls = () => {
			controls.classList.remove('minimized');
		};
		// const average = array => {
		// 	let sum = 0;
		// 	for(let num of array) {
		// 		sum += num;
		// 	}
		// 	return sum/array.length;
		// };
		// const range = (array, start, end) => {
		// 	let result = [];
		// 	for(let i = start; i < end; i++) {
		// 		result.push(array[i]);
		// 	}
		// 	return result;
		// };
		// const smaller = (num1, num2) => num1 < num2 ? num1 : num2;
		const average = array => {
			let sum = 0;
			for(let num of array) {
				sum += num;
			}
			return sum/array.length;
		};
		const range = (array, start, end) => {
			let result = [];
			for(let i = start; i < end; i++) {
				result.push(array[i]);
			}
			return result;
		};
    const listSamples = () => {
      for(let i = 64; i < 8192; i *= 2) {
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(i.toString()));
        option.value = i;
        sampleSelect.appendChild(option);
      }
    }
		const smaller = (num1, num2) => num1 < num2 ? num1 : num2;

		listSamples();
		resizeCanvas();
		update();

		// called every frame
		function update() {
			// recursively calling itself
			requestAnimationFrame(update);
			analyzerNode.fftSize = NUM_SAMPLES;

			// frequency data array
			let data = new Uint8Array(analyzerNode.frequencyBinCount);
			analyzerNode.getByteFrequencyData(data);

			const center = {
				x: canvas.width / 2,
				y: canvas.height / 2
			};

      let lineArray = new Array(LINE_AMOUNT);

      for (let i = 0; i < LINE_AMOUNT; i++) {
        lineArray[i] = new Array(FREQUENCIES_PER_LINE);
        for (let j = 0; j < FREQUENCIES_PER_LINE; j++) {
          lineArray[i][j] = data[i*FREQUENCIES_PER_LINE+j];
        }
      }
			ctx.clearRect(0,0,canvas.width,canvas.height);

			ctx.strokeStyle = lineColor;
			for (let i = 0; i < LINE_AMOUNT; i++) {
			  let yOffset =  center.y/3 + i*center.y/42;
        ctx.beginPath();
        let counterUp = 1;
        let counterDown = 5;

        if (i%2 !== 0) {
          lineArray[i] = lineArray[i].reverse();
        }

        for (let j = 0; j < FREQUENCIES_PER_LINE; j++) {
          let frequency = lineArray[i][j];
          if(j < FREQUENCIES_PER_LINE/4 || j >= 3*FREQUENCIES_PER_LINE/4) {
            frequency /= 10;
          }
          else {
            frequency /= 2;
          }

          const transitionLength = 3;

          // left side transition
          if (j >= FREQUENCIES_PER_LINE / 4 && j <= (FREQUENCIES_PER_LINE / 4) + transitionLength) {
            frequency /= 10/(counterUp * 2);
            counterUp++;
          }

          // right side transition
		  if (j >= (3 * (FREQUENCIES_PER_LINE / 4)) - transitionLength && j <= 3 * (FREQUENCIES_PER_LINE / 4)) {
            frequency /= 10/(counterDown * 2);
            counterDown--;
          }

          ctx.lineTo(center.x/2 + j*center.x/32, yOffset - frequency*invert);
        }
        ctx.stroke();
      }

			//Big Bass Circle
			// let grad = ctx.createRadialGradient(center.x,center.y,smaller(canvas.width,canvas.height)/5,
			// 	center.x,center.y,(smaller(canvas.width,canvas.height)/4)*(1+average(frequencies.bass)/500));
			// grad.addColorStop(0,'#e1ba74');
			// grad.addColorStop(1,'#232020');
			// ctx.fillStyle = grad;



			// ctx.fillRect(0,0,canvas.width,canvas.height);
			// ctx.fillStyle = '#232020';
			// ctx.beginPath();
      // ctx.arc(center.x,center.y,smaller(canvas.width,canvas.height)/5,0,Math.PI*2);
      // ctx.closePath();
      // ctx.fill();
		}


    invertCheck.onchange = () => {
      invert *= -1;
    }
    songSelect.onchange = e => {
		  audioElement.src = 'assets/' + e.target.value + '.mp3'
    }
    hexPicker.onchange = e => {
		  lineColor = '#' + e.target.value;
    }
    sampleSelect.onchange = e => {
      NUM_SAMPLES = e.target.value;
      numLinesSelect.max = NUM_SAMPLES/(2*3); // 2 is because there are actually half the samples
    }
    numLinesSelect.onchange = e => {

    }

		window.onresize = resizeCanvas;
		window.onmouseout = () => {
			clearTimeout(timer);
			timer = setTimeout(minimizeControls,1000);
		};
		window.onmousemove = () => {
			unminimizeControls();
			clearTimeout(timer);
			timer = setTimeout(minimizeControls,4000);
		};
	})();

	const randomAlignment = () => {
		for (let i = 0; i < LINE_AMOUNT; i++) {
            let alignmentArray;

            // gets random number between max and min
            let max = 5;
            let min = -5;
            let random = Math.random() * (max - min) + min;
        }
	}
};
