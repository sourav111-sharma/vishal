// Global Quiz Function
window.toggleQuiz = function(quizId) {
    const el = document.getElementById(quizId);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // --- DOPPLER SIMULATION CANVAS ---
    const canvas = document.getElementById('dopplerCanvas');
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('speedSlider');
    const speedValueDisplay = document.getElementById('speedValue');
    const btnPlay = document.getElementById('btnPlay');
    const btnReset = document.getElementById('btnReset');

    // State variables
    let width, height;
    let isPlaying = false;
    let animationId;
    
    let sourceX;
    let sourceY;
    let sourceSpeed = 0; 
    let waveSpeed = 4; 
    let waves = [];
    let framesSinceLastWave = 0;
    const waveInterval = 20; 
    
    let observerX;
    let observerY;

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        width = canvas.width;
        height = canvas.height;
        
        sourceY = height / 2;
        observerX = width * 0.8; 
        observerY = height / 2 + 30; 
        
        if(!isPlaying && waves.length === 0) {
            resetSim();
        }
    }
    window.addEventListener('resize', resize);

    function resetSim() {
        sourceX = width * 0.1; 
        waves = [];
        framesSinceLastWave = 0;
        draw();
    }

    function update() {
        if (!isPlaying) return;
        sourceX += sourceSpeed;
        framesSinceLastWave++;
        
        if (framesSinceLastWave >= waveInterval) {
            waves.push({ x: sourceX, y: sourceY, radius: 0 });
            framesSinceLastWave = 0;
        }

        for (let i = 0; i < waves.length; i++) {
            waves[i].radius += waveSpeed;
        }

        if (waves.length > 0 && waves[0].radius > width * 1.5) {
            waves.shift();
        }

        if (sourceX > width + 50) {
            sourceX = -50;
        }
    }

    function draw() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.moveTo(0, sourceY);
        ctx.lineTo(width, sourceY);
        ctx.strokeStyle = '#333333';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]); 

        ctx.lineWidth = 2;
        for (let i = 0; i < waves.length; i++) {
            ctx.beginPath();
            ctx.arc(waves[i].x, waves[i].y, waves[i].radius, 0, Math.PI * 2);
            let alpha = Math.max(0, 1 - (waves[i].radius / (width * 0.8)));
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; 
            ctx.stroke();
        }

        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.arc(observerX, observerY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.fillText('Observer', observerX - 25, observerY + 20);

        ctx.fillStyle = '#EF4444'; 
        ctx.fillRect(sourceX - 15, sourceY - 10, 30, 20);
        
        if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = '#3B82F6'; 
            ctx.beginPath();
            ctx.arc(sourceX, sourceY - 10, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop() {
        update();
        draw();
        if (isPlaying) {
            animationId = requestAnimationFrame(loop);
        }
    }

    // Controls Event Listeners
    slider.addEventListener('input', (e) => {
        sourceSpeed = parseFloat(e.target.value);
        if (sourceSpeed === 0) {
            speedValueDisplay.textContent = "Stationary (0 m/s)";
            speedValueDisplay.className = "text-gray-400 font-bold";
        } else if (sourceSpeed < waveSpeed) {
            speedValueDisplay.textContent = "Moving (" + sourceSpeed + " m/s)";
            speedValueDisplay.className = "text-blue-400 font-bold";
        } else if (sourceSpeed === waveSpeed) {
            speedValueDisplay.textContent = "Mach 1 (Sound Barrier)";
            speedValueDisplay.className = "text-red-400 font-bold";
        } else {
            speedValueDisplay.textContent = "Supersonic (Mach " + (sourceSpeed/waveSpeed).toFixed(1) + ")";
            speedValueDisplay.className = "text-purple-400 font-bold";
        }
        
        if(!isPlaying && sourceSpeed > 0) {
            isPlaying = true;
            btnPlay.innerHTML = '<i class="fa-solid fa-pause mr-2"></i> Pause';
            loop();
        }
    });

    btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            btnPlay.innerHTML = '<i class="fa-solid fa-pause mr-2"></i> Pause';
            loop();
        } else {
            btnPlay.innerHTML = '<i class="fa-solid fa-play mr-2"></i> Play';
            cancelAnimationFrame(animationId);
        }
    });

    btnReset.addEventListener('click', () => {
        isPlaying = false;
        btnPlay.innerHTML = '<i class="fa-solid fa-play mr-2"></i> Play';
        cancelAnimationFrame(animationId);
        slider.value = 0;
        sourceSpeed = 0;
        speedValueDisplay.textContent = "Stationary (0 m/s)";
        speedValueDisplay.className = "text-gray-400 font-bold";
        resetSim();
    });

    setTimeout(() => {
        resize();
        resetSim();
    }, 100);
});
