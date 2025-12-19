/**
 * 2025 Hero Section - Interactive 3D Elements & Mouse Follow Effects
 * Subtle parallax effects for premium feel without motion sickness
 */
(function() {
  'use strict';

  function initHeroInteractive() {
    var heroSection = document.querySelector('.hero-2025');
    if (!heroSection) return;

    var interactiveElements = {
      gameCube: document.querySelector('.hero-game-cube'),
      particles: document.querySelectorAll('.hero-particle')
    };

    var mouse = { x: 0, y: 0 };
    var targetMouse = { x: 0, y: 0 };

    // Smooth mouse tracking
    function handleMouseMove(e) {
      var rect = heroSection.getBoundingClientRect();
      targetMouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetMouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    // Smooth interpolation for parallax (prevents jittery movement)
    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function animate() {
      // Smooth mouse interpolation
      mouse.x = lerp(mouse.x, targetMouse.x, 0.05);
      mouse.y = lerp(mouse.y, targetMouse.y, 0.05);

      // Apply subtle parallax to game cube (very gentle movement)
      if (interactiveElements.gameCube) {
        var translateX = mouse.x * 20;
        var translateY = mouse.y * 20;
        var rotateX = -15 + mouse.y * 5;
        var rotateY = 25 + mouse.x * 5;
        interactiveElements.gameCube.style.transform = 
          'translate3d(calc(-50% + ' + translateX + 'px), calc(-50% + ' + translateY + 'px), 0) ' +
          'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      }

      // Gentle particle movement
      interactiveElements.particles.forEach(function(particle, index) {
        var speed = (index % 3 + 1) * 0.5;
        var translateX = mouse.x * speed * 5;
        var translateY = mouse.y * speed * 5;
        particle.style.transform = 
          'translate3d(' + translateX + 'px, ' + translateY + 'px, 0)';
      });

      requestAnimationFrame(animate);
    }

    // Event listeners
    heroSection.addEventListener('mousemove', handleMouseMove);
    
    // Start animation loop
    animate();

    // Game selector dropdown interaction
    var gameSelector = document.getElementById('hero-game-selector');
    var gameSelectorButton = document.querySelector('.hero-game-selector-btn');
    var gameDropdown = document.querySelector('.hero-game-dropdown');

    if (gameSelectorButton && gameDropdown) {
      gameSelectorButton.addEventListener('click', function(e) {
        e.stopPropagation();
        gameDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', function() {
        gameDropdown.classList.add('hidden');
      });

      var gameOptions = gameDropdown.querySelectorAll('.hero-game-option');
      gameOptions.forEach(function(option) {
        option.addEventListener('click', function(e) {
          e.stopPropagation();
          var value = this.getAttribute('data-value');
          var label = this.textContent.trim();
          gameSelector.value = value;
          gameSelectorButton.querySelector('.hero-game-selected').textContent = label;
          gameDropdown.classList.add('hidden');
        });
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroInteractive);
  } else {
    initHeroInteractive();
  }
})();
