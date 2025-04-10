// Posture Analysis using TensorFlow.js and PoseNet
let net;
let video;
let canvas;
let ctx;
let isAnalyzing = false;
let lastFeedbackTime = 0;
const FEEDBACK_COOLDOWN = 30000; // 30 seconds

// Initialize PoseNet model
async function initPoseNet() {
    try {
        // Load PoseNet model
        net = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
        });
        console.log('PoseNet model loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading PoseNet model:', error);
        return false;
    }
}

// Start webcam
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        console.log('Webcam started');
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Unable to access webcam. Please ensure you have granted camera permissions.');
    }
}

// Stop webcam
function stopWebcam() {
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

// Draw keypoints on canvas
function drawKeypoints(keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        if (keypoint.score > 0.2) {
            ctx.beginPath();
            ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
        }
    }
}

// Draw skeleton on canvas
function drawSkeleton(keypoints) {
    const adjacentKeyPoints = [
        ['leftShoulder', 'rightShoulder'],
        ['leftShoulder', 'leftElbow'],
        ['leftElbow', 'leftWrist'],
        ['rightShoulder', 'rightElbow'],
        ['rightElbow', 'rightWrist'],
        ['leftShoulder', 'leftHip'],
        ['rightShoulder', 'rightHip'],
        ['leftHip', 'rightHip'],
        ['leftHip', 'leftKnee'],
        ['leftKnee', 'leftAnkle'],
        ['rightHip', 'rightKnee'],
        ['rightKnee', 'rightAnkle']
    ];

    adjacentKeyPoints.forEach(([first, second]) => {
        const firstPoint = keypoints.find(kp => kp.part === first);
        const secondPoint = keypoints.find(kp => kp.part === second);

        if (firstPoint && secondPoint && firstPoint.score > 0.2 && secondPoint.score > 0.2) {
            ctx.beginPath();
            ctx.moveTo(firstPoint.position.x, firstPoint.position.y);
            ctx.lineTo(secondPoint.position.x, secondPoint.position.y);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// Analyze posture based on keypoints
function analyzePosture(keypoints) {
    const analysis = {
        status: 'good',
        feedback: []
    };
    
    // Get relevant keypoints
    const leftShoulder = keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.part === 'rightShoulder');
    const leftHip = keypoints.find(kp => kp.part === 'leftHip');
    const rightHip = keypoints.find(kp => kp.part === 'rightHip');
    const nose = keypoints.find(kp => kp.part === 'nose');
    
    if (leftShoulder && rightShoulder && leftHip && rightHip && nose) {
        // Check shoulder alignment
        const shoulderDiff = Math.abs(leftShoulder.position.y - rightShoulder.position.y);
        if (shoulderDiff > 20) {
            analysis.status = 'warning';
            analysis.feedback.push('Your shoulders are not level. Try to keep them aligned.');
        }
        
        // Check hip alignment
        const hipDiff = Math.abs(leftHip.position.y - rightHip.position.y);
        if (hipDiff > 20) {
            analysis.status = 'warning';
            analysis.feedback.push('Your hips are not level. Try to keep them aligned.');
        }
        
        // Check head position
        const headOffset = Math.abs(nose.position.y - ((leftShoulder.position.y + rightShoulder.position.y) / 2));
        if (headOffset > 50) {
            analysis.status = 'error';
            analysis.feedback.push('Your head is too far forward or backward. Try to keep it aligned with your shoulders.');
        }
    }
    
    return analysis;
}

// Update posture status indicator
function updateStatusIndicator(analysis) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.posture-status span');
    
    statusIndicator.className = 'status-indicator';
    statusIndicator.classList.add(analysis.status);
    
    if (analysis.feedback.length > 0) {
        statusText.textContent = analysis.feedback[0];
    } else {
        statusText.textContent = 'Good posture!';
    }
}

// Send feedback to chat
function sendPostureFeedback(analysis) {
    const now = Date.now();
    if (now - lastFeedbackTime < FEEDBACK_COOLDOWN) {
        return;
    }
    
    if (analysis.status !== 'good') {
        const message = {
            type: 'bot',
            content: `Posture Feedback: ${analysis.feedback.join(' ')}`,
            timestamp: new Date().toLocaleTimeString()
        };
        addMessageToChat(message);
        lastFeedbackTime = now;
    }
}

// Main pose detection loop
async function detectPose() {
    if (!isAnalyzing) return;
    
    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false
    });
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawKeypoints(pose.keypoints);
    drawSkeleton(pose.keypoints);
    
    const analysis = analyzePosture(pose.keypoints);
    updateStatusIndicator(analysis);
    sendPostureFeedback(analysis);
    
    requestAnimationFrame(detectPose);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    video = document.getElementById('webcam');
    canvas = document.getElementById('posture-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 640;
    canvas.height = 480;
    
    // Initialize PoseNet
    await initPoseNet();
    
    // Webcam button click handler
    const webcamBtn = document.getElementById('open-webcam');
    const webcamPopup = document.querySelector('.webcam-popup');
    const closeBtn = document.querySelector('.close-btn');
    const startAnalysisBtn = document.querySelector('.start-analysis-btn');
    
    webcamBtn.addEventListener('click', async () => {
        webcamPopup.classList.add('active');
        await startWebcam();
    });
    
    closeBtn.addEventListener('click', () => {
        webcamPopup.classList.remove('active');
        stopWebcam();
        isAnalyzing = false;
    });
    
    startAnalysisBtn.addEventListener('click', () => {
        isAnalyzing = !isAnalyzing;
        if (isAnalyzing) {
            startAnalysisBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Analysis';
            detectPose();
        } else {
            startAnalysisBtn.innerHTML = '<i class="fas fa-play"></i> Start Analysis';
        }
    });
}); 