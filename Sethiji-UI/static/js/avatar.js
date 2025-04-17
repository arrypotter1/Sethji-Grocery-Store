// Avatar Animation Controller
let avatarActive = false;
const avatarContainer = document.getElementById('avatarContainer');
const avatarAnimation = document.querySelector('.avatar-animation');
const avatarRings = document.querySelector('.avatar-rings');

// Audio elements for call sound
let callAudio = null;

// Function to activate the avatar with electrifying animations
function activateAvatar() {
    if (!avatarContainer) return;
    
    // Clear any existing animation timeouts
    clearTimeout(window.avatarDeactivateTimeout);
    
    // Already active, refresh the animation
    if (avatarActive) {
        refreshAvatarAnimation();
        return;
    }
    
    // Set state to active
    avatarActive = true;
    
    // Play call ringtone
    playCallSound();
    
    // Add active classes for various animations
    avatarContainer.classList.add('active');
    if (avatarAnimation) avatarAnimation.classList.add('active');
    if (avatarRings) avatarRings.classList.add('active');
    
    // Create lightning effects
    createLightningEffects();
    
    // Create sparkles
    createSparkleEffects();
    
    // Pulse the rings
    pulseRings();
    
    // Set a timeout to deactivate after 20 seconds (as requested)
    window.avatarDeactivateTimeout = setTimeout(deactivateAvatar, 20000);
}

// Function to play call sound
function playCallSound() {
    // Stop any existing audio
    if (callAudio) {
        callAudio.pause();
        callAudio.currentTime = 0;
    }
    
    // Create new audio element
    callAudio = new Audio('/static/audio/call-ringtone.mp3');
    
    // Add error handling for fallback
    callAudio.onerror = function() {
        console.log('Primary audio failed, trying fallback');
        callAudio = new Audio('/static/audio/phone-ring.mp3');
        callAudio.play().catch(err => console.error('Fallback audio failed:', err));
    };
    
    // Play the audio with volume control
    callAudio.volume = 0.7;
    callAudio.play().catch(err => console.error('Audio play failed:', err));
}

// Function to deactivate the avatar
function deactivateAvatar() {
    if (!avatarContainer) return;
    
    avatarActive = false;
    
    // Stop call audio
    if (callAudio) {
        callAudio.pause();
        callAudio.currentTime = 0;
    }
    
    // Remove active classes
    avatarContainer.classList.remove('active');
    if (avatarAnimation) avatarAnimation.classList.remove('active');
    if (avatarRings) avatarRings.classList.remove('active');
    
    // Remove all animation elements
    const elementsToRemove = avatarContainer.querySelectorAll('.sparkle, .lightning, .ring-flare');
    elementsToRemove.forEach(element => {
        element.remove();
    });
    
    // Reset ring animations
    const rings = avatarContainer.querySelectorAll('.ring');
    rings.forEach(ring => {
        ring.style.animation = 'none';
        ring.style.opacity = '0';
    });
    
    // Force reflow
    void avatarContainer.offsetWidth;
    
    // Reset ring default animations
    setTimeout(() => {
        rings.forEach((ring, index) => {
            ring.style.animation = `ring${index+1}Animation 3s infinite`;
        });
    }, 50);
}

// Function to refresh the animation
function refreshAvatarAnimation() {
    if (!avatarActive || !avatarContainer) return;
    
    // Remove existing animation elements
    const elementsToRemove = avatarContainer.querySelectorAll('.sparkle, .lightning');
    elementsToRemove.forEach(element => {
        element.remove();
    });
    
    // Create new effects
    createLightningEffects();
    createSparkleEffects();
    
    // Reset the deactivation timeout
    clearTimeout(window.avatarDeactivateTimeout);
    window.avatarDeactivateTimeout = setTimeout(deactivateAvatar, 20000);
}

// Function to create multiple lightning effects
function createLightningEffects() {
    if (!avatarContainer) return;
    
    // Create multiple lightning bolts at different intervals
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            if (!avatarActive) return;
            createLightning();
        }, i * 700 + Math.random() * 1000);
    }
}

// Function to create a single lightning effect
function createLightning() {
    if (!avatarContainer) return;
    
    const lightning = document.createElement('div');
    lightning.classList.add('lightning');
    
    // Random angle around the avatar
    const angle = Math.random() * Math.PI * 2;
    
    // Random length between 40px and 80px
    const length = 40 + Math.random() * 40;
    
    // Start point (on the circle)
    const radius = avatarContainer.offsetWidth / 2 - 15;
    const centerX = avatarContainer.offsetWidth / 2;
    const centerY = avatarContainer.offsetHeight / 2;
    
    const startX = centerX + Math.cos(angle) * radius;
    const startY = centerY + Math.sin(angle) * radius;
    
    // Calculate the lightning rotation to point outward from the center
    const rotation = (angle * 180 / Math.PI) + 90; // Convert to degrees and add 90
    
    // Set lightning styles
    lightning.style.left = `${startX}px`;
    lightning.style.top = `${startY}px`;
    lightning.style.height = `${length}px`;
    lightning.style.transform = `rotate(${rotation}deg)`;
    lightning.style.opacity = '0';
    
    // Add to container
    avatarContainer.appendChild(lightning);
    
    // Animate
    setTimeout(() => {
        lightning.style.opacity = '0.8';
    }, 50);
    
    // Randomize thickness for variety
    lightning.style.width = `${2 + Math.random() * 2}px`;
    
    // Random blue hue
    const blueHue = 210 + Math.random() * 30;
    lightning.style.background = `linear-gradient(to bottom, rgba(${blueHue}, ${blueHue}, 255, 0) 0%, rgba(${blueHue}, ${blueHue}, 255, 0.8) 50%, rgba(${blueHue}, ${blueHue}, 255, 0) 100%)`;
    
    // Remove after animation completes
    setTimeout(() => {
        if (lightning.parentNode === avatarContainer) {
            lightning.style.opacity = '0';
            setTimeout(() => lightning.remove(), 200);
        }
    }, 200 + Math.random() * 300);
}

// Function to create multiple sparkle effects
function createSparkleEffects() {
    if (!avatarContainer) return;
    
    // Create multiple sparkles at different intervals
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            if (!avatarActive) return;
            createSparkle();
        }, i * 200 + Math.random() * 500);
    }
}

// Function to create a single sparkle effect
function createSparkle() {
    if (!avatarContainer) return;
    
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    // Random position around or on the avatar
    const angle = Math.random() * Math.PI * 2;
    const distance = (Math.random() > 0.3) ? 
                    70 + Math.random() * 40 : // Outside the avatar
                    Math.random() * 60;      // Inside the avatar
    
    // Calculate position
    const centerX = avatarContainer.offsetWidth / 2;
    const centerY = avatarContainer.offsetHeight / 2;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Random size for variety
    const size = 3 + Math.random() * 10;
    
    // Set sparkle styles
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    // Randomize the animation duration
    sparkle.style.animationDuration = `${0.4 + Math.random() * 0.8}s`;
    
    // Random blue shade
    const blue = 180 + Math.floor(Math.random() * 70);
    sparkle.style.background = `radial-gradient(circle, rgba(120, ${blue}, 255, 0.9) 0%, rgba(70, 130, 255, 0) 70%)`;
    sparkle.style.boxShadow = `0 0 ${5 + Math.random() * 10}px rgba(70, 130, 255, 0.8)`;
    
    // Add to container
    avatarContainer.appendChild(sparkle);
    
    // Remove after animation completes
    setTimeout(() => {
        if (sparkle.parentNode === avatarContainer) {
            avatarContainer.removeChild(sparkle);
        }
    }, 1200);
}

// Pulse the rings with a more dynamic effect
function pulseRings() {
    if (!avatarRings) return;
    
    const rings = avatarRings.querySelectorAll('.ring');
    
    // Make rings highly visible
    rings.forEach((ring, index) => {
        // Stop current animation
        ring.style.animation = 'none';
        ring.style.opacity = '0.9';
        ring.style.borderColor = 'rgba(59, 130, 246, 0.7)';
        ring.style.borderWidth = '3px';
        
        // Force reflow
        void ring.offsetWidth;
        
        // Set new animation
        setTimeout(() => {
            ring.style.animation = `activeRing${index+1} 3s infinite`;
        }, index * 200);
    });
    
    // Add occasional flares to rings
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            if (!avatarActive) return;
            createRingFlare();
        }, i * 2000);
    }
}

// Create a flare effect on the rings
function createRingFlare() {
    if (!avatarRings) return;
    
    const flare = document.createElement('div');
    flare.classList.add('ring-flare');
    
    // Position at center
    flare.style.left = '50%';
    flare.style.top = '50%';
    flare.style.transform = 'translate(-50%, -50%)';
    
    // Add to rings container
    avatarRings.appendChild(flare);
    
    // Remove after animation
    setTimeout(() => {
        if (flare.parentNode === avatarRings) {
            avatarRings.removeChild(flare);
        }
    }, 1000);
}

// Add dynamic CSS for the advanced animations
function addAdvancedAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Active avatar container */
        #avatarContainer.active {
            transform: scale(1.05);
            transition: transform 0.5s ease-out;
        }
        
        /* Enhanced pulse animation */
        .avatar-animation.active {
            animation: enhancedPulse 1.5s infinite;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
        }
        
        @keyframes enhancedPulse {
            0% {
                transform: scale(0.92);
                opacity: 0.7;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%);
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
                background: radial-gradient(circle, rgba(99, 179, 237, 0.5) 0%, rgba(59, 130, 246, 0) 70%);
            }
            100% {
                transform: scale(0.92);
                opacity: 0.7;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%);
            }
        }
        
        /* Enhanced sparkle */
        .sparkle {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(120, 200, 255, 0.9) 0%, rgba(70, 130, 255, 0) 70%);
            box-shadow: 0 0 10px rgba(70, 130, 255, 0.8);
            z-index: 15;
            opacity: 0;
            animation: enhancedSparkleAnimation 0.8s forwards;
        }
        
        @keyframes enhancedSparkleAnimation {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
            }
            20% {
                transform: scale(1.5) rotate(45deg);
                opacity: 1;
            }
            70% {
                transform: scale(1) rotate(90deg);
                opacity: 0.8;
            }
            100% {
                transform: scale(2.5) rotate(180deg);
                opacity: 0;
            }
        }
        
        /* Lightning effect */
        .lightning {
            position: absolute;
            width: 3px;
            height: 40px;
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(59, 130, 246, 0) 100%);
            border-radius: 3px;
            z-index: 12;
            filter: blur(1px) drop-shadow(0 0 3px rgba(59, 130, 246, 0.6));
            transform-origin: center top;
            transition: opacity 0.1s ease-in;
        }
        
        /* Active ring animations */
        @keyframes activeRing1 {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
                border-color: rgba(59, 130, 246, 0.7);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 0.4;
                border-color: rgba(99, 179, 237, 0.9);
            }
        }
        
        @keyframes activeRing2 {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1.05);
                opacity: 0.7;
                border-color: rgba(59, 130, 246, 0.6);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.15);
                opacity: 0.3;
                border-color: rgba(99, 179, 237, 0.8);
            }
        }
        
        @keyframes activeRing3 {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1.1);
                opacity: 0.6;
                border-color: rgba(59, 130, 246, 0.5);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.2;
                border-color: rgba(99, 179, 237, 0.7);
            }
        }
        
        /* Ring flare effect */
        .ring-flare {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(59, 130, 246, 0.4) 30%, rgba(59, 130, 246, 0) 70%);
            opacity: 0;
            z-index: 11;
            animation: flareAnimation 1s ease-out forwards;
        }
        
        @keyframes flareAnimation {
            0% {
                transform: translate(-50%, -50%) scale(0.3);
                opacity: 0;
            }
            20% {
                opacity: 0.9;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.4);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addAdvancedAnimationStyles();
    
    // Make avatar image circular
    const avatarImage = document.getElementById('avatarImage');
    if (avatarImage) {
        avatarImage.style.borderRadius = '50%';
        avatarImage.style.objectFit = 'cover';
    }
});
