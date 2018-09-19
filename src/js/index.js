'use strict';

window.onload = () => {
	(() => {
		const canvas = document.querySelector('canvas');
		const ctx = canvas.getContext('2d');
		const controls = document.querySelector('#controls');
		let timer = setTimeout(null);

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		const minimizeControls = () => {
			controls.classList.add('minimized');
		};
		const unminimizeControls = () => {
			controls.classList.remove('minimized');
		};
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
		const smaller = (num1, num2) => num1 < num2 ? num1 : num2;

		resizeCanvas();

		const NUM_SAMPLES = 128;
		let audioElement = document.querySelector('audio');
		let audioCtx = new AudioContext();
		let analyzerNode = audioCtx.createAnalyser();
		analyzerNode.fftSize = NUM_SAMPLES;
		let sourceNode = audioCtx.createMediaElementSource(audioElement);
		sourceNode.connect(analyzerNode);
		analyzerNode.connect(audioCtx.destination);

		update();

		function update() {
			requestAnimationFrame(update);

			let data = new Uint8Array(analyzerNode.frequencyBinCount);
			analyzerNode.getByteFrequencyData(data);

			const frequencies = {
				bass: range(data,0,5),
				low: range(data,6,20),
				mid: range(data,21,35),
				high: range(data,36,data.length)
			};

			const center = {
				x: canvas.width/2,
				y: canvas.height/2
			};

			ctx.clearRect(0,0,canvas.width,canvas.height);

			//Big Bass Circle
			let grad = ctx.createRadialGradient(center.x,center.y,smaller(canvas.width,canvas.height)/5,
				center.x,center.y,(smaller(canvas.width,canvas.height)/4)*(1+average(frequencies.bass)/500));
			grad.addColorStop(0,'#e1ba74');
			grad.addColorStop(1,'#232020');
			ctx.fillStyle = grad;

			//Low Range Circle


			ctx.fillRect(0,0,canvas.width,canvas.height);
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
};
