'use strict';

window.onload = () => {
	(() => {
		// getting references to DOM elements
		let canvas = document.querySelector('canvas');
		let ctx = canvas.getContext('2d');
		let controls = document.querySelector('#controls');
		let controlsTooltip = document.querySelector('#controlsTooltip');
        let audioElement = document.querySelector('audio');

		// timer for control minimization
        let timer = setTimeout(null);

        // user controls
        const invertCheck = document.querySelector('#invertCheck');
        const songSelect = document.querySelector('#songSelect');
        const hexPicker = document.querySelector('#hexPicker');
        const sampleSelect = document.querySelector('#sampleSelect');
        const numLinesSelect = document.querySelector('#numLinesSelect');

        // variable for invert functionality
		let invert = 1;
		// default line color of white
		let lineColor = '#fff';

        // number of samples (actually half of this)
        let NUM_SAMPLES = 4096;
        let FREQUENCIES_PER_LINE = 32;
        let LINE_AMOUNT = NUM_SAMPLES / FREQUENCIES_PER_LINE;

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
		const pxToInt = string => {
			return parseInt(string.slice(0,-2));
		}

		// generates values for the number of samples select
        const listSamples = () => {
            const max = 8192;
            for (let i = 64; i < max; i *= 2) {
                let option = document.createElement('option');
                option.appendChild(document.createTextNode(i.toString()));
                option.value = i;
                sampleSelect.appendChild(option);
            }
        };

		listSamples();
		resizeCanvas();
		update();

		// called every frame
		function update() {
			// recursively calling itself
			requestAnimationFrame(update);

			// setting number of samples
			analyzerNode.fftSize = NUM_SAMPLES;

			// frequency data array
			let data = new Uint8Array(analyzerNode.frequencyBinCount);
			analyzerNode.getByteFrequencyData(data);

			// object to hold center of window
			const center = {
				x: canvas.width / 2,
				y: canvas.height / 2
			};

			// array of displayed lines
			let lineArray = new Array(LINE_AMOUNT);

			// for line, create an array of segments
			for (let i = 0; i < LINE_AMOUNT; i++) {
                lineArray[i] = new Array(FREQUENCIES_PER_LINE);
                for (let j = 0; j < FREQUENCIES_PER_LINE; j++) {
                    lineArray[i][j] = data[(i * FREQUENCIES_PER_LINE) + j];
                }
			}

			// clearing the canvas every frame
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// setting line color
			ctx.strokeStyle = lineColor;

			// spacing the lines out evenly on the y axis
			for (let i = 0; i < LINE_AMOUNT; i++) {
			    let yOffset = (center.y / 3) +  (i * center.y) / 42;
			    ctx.beginPath();

			    // used for transition TODO
                let counterUp = 1;
                let counterDown = 5;

                // for each segment in a line
                for (let j = 0; j < FREQUENCIES_PER_LINE; j++) {
                    let frequency = lineArray[i][j];

                    // margins
                    if (j < FREQUENCIES_PER_LINE / 4 || j > 3 * (FREQUENCIES_PER_LINE / 4)) {
                    frequency /= 10;
                    }
                    // middle
                    else {
                    frequency /= 2;
                    }

                    // length of transition between margins and the middle
                    const transitionLength = 3;

                    // left side transition
                    if (j >= FREQUENCIES_PER_LINE / 4 && j <= (FREQUENCIES_PER_LINE / 4) + transitionLength) {
                        frequency /= 10 / (counterUp * 2);
                        counterUp++;
                    }

                    // right side transition
                    if (j >= (3 * (FREQUENCIES_PER_LINE / 4)) - transitionLength && j <= 3 * (FREQUENCIES_PER_LINE / 4)) {
                        frequency /= 10 / (counterDown * 2);
                        counterDown--;
                    }

                    // finishing the line segment
                    ctx.lineTo(center.x / 2 + j * center.x / 32, yOffset - frequency * invert);
                }
                // stroke the lines
                ctx.stroke();
			}
		}

        invertCheck.onchange = () => {
          invert *= -1;
        };
        songSelect.onchange = e => {
              audioElement.src = 'assets/' + e.target.value + '.mp3'
        };
        hexPicker.onchange = e => {
              lineColor = '#' + e.target.value;
        };
        sampleSelect.onchange = e => {
          NUM_SAMPLES = e.target.value;
          numLinesSelect.max = NUM_SAMPLES/(2*3); // 2 is because there are actually half the samples
        };
        numLinesSelect.onchange = e => {

        };

		window.onresize = resizeCanvas;
		window.onmouseout = () => {
			clearTimeout(timer);
			timer = setTimeout(minimizeControls,1000);
		};
		window.onmousemove = e => {
			clearTimeout(timer);
			let mousePos = {
				x: e.clientX,
				y: e.clientY
			};
			let controlStyles = window.getComputedStyle(controls);
			if(mousePos.y >= window.innerHeight - (pxToInt(controlStyles.height) + pxToInt(controlStyles.padding)*2)) {
				controlsTooltip.classList.add('fadeOut');
				unminimizeControls();
			}
			else {
				timer = setTimeout(minimizeControls,2000);
			}
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
