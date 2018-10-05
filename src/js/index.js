'use strict';

window.onload = () => {
	(() => {
		// getting references to DOM elements
		let canvas = document.querySelector('canvas');
		let ctx = canvas.getContext('2d');
		let controls = document.querySelector('#controls');
		let audioElement = document.querySelector('audio');

		// user controls
		const invertCheck = document.querySelector('#invertCheck');
		const waveformCheck = document.querySelector('#waveformCheck');
		const songSelect = document.querySelector('#songSelect');
		const hexPicker = document.querySelector('#hexPicker');
		const sampleSelect = document.querySelector('#sampleSelect');
		const widthSlider = document.querySelector('#widthSlider');
		const controlMinimizer = document.querySelector('#controlMinimizer');
		const clickBar = document.querySelector('#clickBar');
		const intensitySlider = document.querySelector('#intensitySlider');
		const dashCheck = document.querySelector('#dashCheck');

		// variable for invert functionality
		let invert = 1;
		let waveform = false;
		// default line color of white
		let lineColor = '#fff';
		let lineIntensity = 2;
		let lineWidth;
		let minimized = true;
		let paused = true;
		let dashed = false;

		// number of samples (actually half of this)
		let numSamples = 4096;
		let frequenciesPerLine = 32;
		let lineAmount = numSamples / frequenciesPerLine / 2;

		// audio hook ups
		let audioCtx = new AudioContext();
		let analyzerNode = audioCtx.createAnalyser();
		analyzerNode.fftSize = numSamples;
		let sourceNode = audioCtx.createMediaElementSource(audioElement);
		sourceNode.connect(analyzerNode);
		analyzerNode.connect(audioCtx.destination);

		// responsive design
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		// generates values for the number of samples select
		const listSamples = () => {
			const max = 8192;
			for (let i = 64; i < max; i *= 2) {
				let option = document.createElement('option');
				option.appendChild(document.createTextNode(i.toString()));
				option.value = i;
				sampleSelect.appendChild(option);
			}
			sampleSelect.value = numSamples;
		};

		listSamples();
		resizeCanvas();
		update();

		// called every frame
		function update() {
			// recursively calling itself
			requestAnimationFrame(update);

			const renderFrequencyData = () => {
				// object to hold center of window
				const center = {
					x: canvas.width / 2,
					y: canvas.height / 2
				};

				// array of displayed lines
				let lineArray = new Array(lineAmount);

				// for line, create an array of segments
				for (let i = 0; i < lineAmount; i++) {
					lineArray[i] = new Array(frequenciesPerLine);
					for (let j = 0; j < frequenciesPerLine; j++) {
						lineArray[i][j] = data[(i * frequenciesPerLine) + j];
					}
				}

				// clearing the canvas every frame
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// setting line color
				ctx.strokeStyle = lineColor;
				// setting line width
				ctx.lineWidth = lineWidth;

				// spacing the lines out evenly on the y axis
				for (let i = 0; i < lineAmount - 4; i++) {
					let yOffset = (center.y / 2) +  (i * center.y) / 50;
					ctx.beginPath();

					// length of transition between margins and the middle
					const transitionLength = 3;

					// used for transition
					let counterUp = 1;
					let counterDown = transitionLength + 1;

					// for each segment in a line
					for (let j = 1; j < frequenciesPerLine; j++) {
						let frequency = lineArray[i][j];

						// margins
						if (j < frequenciesPerLine / 4 || j > 3 * (frequenciesPerLine / 4)) {
							frequency /= 10;
						}
						// middle
						else {
							frequency /= lineIntensity;
						}

						// left side transition
						if (j >= frequenciesPerLine / 4 && j <= (frequenciesPerLine / 4) + transitionLength) {
							frequency /= 5 / counterUp;
							counterUp++;
						}
						// right side transition
						if (j >= (3 * (frequenciesPerLine / 4)) - transitionLength && j <= 3 * (frequenciesPerLine / 4)) {
							frequency /= 5 / counterDown;
							counterDown--;
						}

						// finishing the line segment
						ctx.lineTo(center.x / 2 + j * center.x / 32, yOffset - frequency * invert);
					}
					// stroke the lines
					ctx.stroke();
				}
			};

			const renderWaveformData = () => {
				// object to hold center of window
				const center = {
					x: canvas.width / 2,
					y: canvas.height / 2
				};

				// clearing the canvas every frame
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				// setting line color
				ctx.strokeStyle = lineColor;
				// setting line width
				ctx.lineWidth = lineWidth;

				// spacing the lines out evenly on the y axis
				for (let i = 0; i < lineAmount / 4; i++) {
					let yOffset = center.y + (i * center.y) / 15;
					ctx.beginPath();

					// for each segment in a line
					for (let i = 0; i < data.length; i++) {
						// finishing the line segment
						ctx.lineTo(center.x / 2 + i * center.x / data.length, yOffset - data[i]);
					}
					// stroke the lines
					ctx.stroke();
				}

			};

			// setting number of samples
			analyzerNode.fftSize = numSamples;

			let data = new Uint8Array(analyzerNode.frequencyBinCount);
			if (!waveform) {
				// frequency data
				analyzerNode.getByteFrequencyData(data);
				renderFrequencyData();
			}
			else {
				// waveform data
				analyzerNode.getByteTimeDomainData(data);
				renderWaveformData();
			}
		}

        invertCheck.onchange = () => {
          invert *= -1;
        };
		waveformCheck.onchange = () => {
			waveform = !waveform;
		};
        songSelect.onchange = e => {
              audioElement.src = 'assets/' + e.target.value + '.wav'
        };
        hexPicker.onchange = e => {
              lineColor = '#' + e.target.value;
        };
        sampleSelect.onchange = e => {
          	numSamples = e.target.value;
        };
        widthSlider.oninput = e => {
        	lineWidth = e.target.value;
		};
		intensitySlider.oninput = e => {
			lineIntensity = e.target.value;
		};
		dashCheck.onchange = () => {
			dashed = !dashed;
		};
		// Flips the minimized bool and then changes the classes of the controls div and the minimize button itself
		clickBar.onclick = () => {
			minimized = !minimized;
			if(minimized) {
				controlMinimizer.classList.remove('minimized');
				controls.classList.add('minimized');
			}
			else {
				controlMinimizer.classList.add('minimized');
				controls.classList.remove('minimized');
			}
		};

		window.onresize = resizeCanvas;
		window.onkeypress = e => {
			if(e.key === ' ') {
				paused = !paused;
				if(paused) {
					audioElement.play();
				}
				else {
					audioElement.pause();
				}
			}
		}
	})();
};