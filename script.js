// ======================
// Worms from apple (p5.js) - SNAKE-LIKE MOVEMENT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    const apple = document.getElementById("corner-worm");
  
    // p5 sketch overlay
    new p5((sketch) => {
      let worms = [];
      let spawnX, spawnY;
  
      class Worm {
        constructor(x, y) {
          this.segments = [];
          this.segmentCount = sketch.random(3, 10); // Random length between 8-20 segments
          this.pixelSize = 5; // Size of each square pixel
          
          // Snap spawn position to grid
          const gridX = Math.floor(x / this.pixelSize) * this.pixelSize;
          const gridY = Math.floor(y / this.pixelSize) * this.pixelSize;
          
          // Initialize all segments at spawn point
          for (let i = 0; i < this.segmentCount; i++) {
            this.segments.push({ x: gridX, y: gridY });
          }
          
          this.moveCounter = 0;
          this.moveInterval = sketch.random(2, 8); // Move every 4-8 frames for varied speed
          this.turnChance = 0.25; // 15% chance to turn each move
          
          // Start with initial direction away from spawn (bottom-right)
          // Heavily bias towards left and up to keep worms on screen
          const initialDirs = [
            { x: -1, y: 0 },  // left
            { x: -1, y: 0 },  // left (weighted)
            { x: -1, y: 0 },  // left (weighted)
            { x: 0, y: -1 },  // up  
            { x: 0, y: -1 },  // up (weighted)
          ];
          this.dir = sketch.random(initialDirs);
          
          // All possible directions for turning
          this.allDirs = [
            { x: -1, y: 0 },  // left
            { x: 1, y: 0 },   // right
            { x: 0, y: -1 },  // up
            { x: 0, y: 1 }    // down
          ];
        }

        move() {
          this.moveCounter++;
          
          // Only move at intervals to create discrete pixel movement like Snake
          if (this.moveCounter >= this.moveInterval) {
            this.moveCounter = 0;
            
            // Randomly decide to turn (worm-like behavior)
            if (sketch.random() < this.turnChance) {
              // Pick a new direction with heavy bias towards left and up
              const biasedDirs = [
                { x: -1, y: 0 },  // left
                { x: -1, y: 0 },  // left (weighted)
                { x: -1, y: 0 },  // left (weighted)
                { x: 0, y: -1 },  // up  
                { x: 0, y: -1 },  // up (weighted)
                { x: 1, y: 0 },   // right (rare)
                { x: 0, y: 1 }    // down (rare)
              ];
              
              // Filter out opposite direction to prevent reversing
              const validDirs = biasedDirs.filter(dir => {
                return !(dir.x === -this.dir.x && dir.y === -this.dir.y);
              });
              
              this.dir = sketch.random(validDirs);
            }
            
            // Get current head position
            const head = this.segments[0];
            
            // Move exactly one pixel grid step in the chosen direction
            const newX = head.x + (this.dir.x * this.pixelSize);
            const newY = head.y + (this.dir.y * this.pixelSize);
            
            // Add new head position to front
            this.segments.unshift({ x: newX, y: newY });
            
            // Remove tail to maintain length (Snake-like behavior)
            if (this.segments.length > this.segmentCount) {
              this.segments.pop();
            }
          }
        }

        show() {
          sketch.fill(0);
          sketch.noStroke();
          
          // Draw each segment as a solid square pixel (like classic Snake)
          for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            sketch.rect(segment.x, segment.y, this.pixelSize, this.pixelSize);
          }
        }
        
        // Check if worm is completely off screen
        isOffScreen() {
          return this.segments[0].x < -50 || this.segments[0].x > sketch.width + 50 || 
                 this.segments[0].y < -50 || this.segments[0].y > sketch.height + 50;
        }
      }
  
      sketch.setup = () => {
        let cnv = sketch.createCanvas(window.innerWidth, window.innerHeight);
        cnv.position(0, 0);
        cnv.style("pointer-events", "none"); // don't block clicks
        sketch.clear();
      };
  
      sketch.draw = () => {
        sketch.clear();
        
        // Update and draw worms
        for (let i = worms.length - 1; i >= 0; i--) {
          worms[i].move();
          worms[i].show();
          
          // Remove worms that are completely off screen
          if (worms[i].isOffScreen()) {
            worms.splice(i, 1);
          }
        }
      };
  
      sketch.windowResized = () => {
        sketch.resizeCanvas(window.innerWidth, window.innerHeight);
      };
  
      // trigger worms on hover
      if (apple) {
        apple.addEventListener("mouseenter", () => {
          const rect = apple.getBoundingClientRect();
          spawnX = rect.left + rect.width / 2;
          spawnY = rect.top + rect.height / 2;
  
          // Clear existing worms
          worms = [];
          
          // Create worms
          for (let i = 0; i < 10; i++) {
            worms.push(new Worm(spawnX, spawnY));
          }
        });
      }
    });
  });


/* ======================
   Existing site JS
   ====================== */
document.addEventListener('DOMContentLoaded', function() {
  const samEmail = document.getElementById('sam-email');
  const cristinaEmail = document.getElementById('cristina-email');
  const clients = document.querySelectorAll('#right li');
  const h1 = document.querySelector('h1');
  const cornerWorm = document.getElementById('corner-worm');

  // Track which client is currently clicked (for persistent email highlighting)
  let clickedClient = null;

  // H1 character replacement functionality
  const originalText = h1.textContent;
  h1.innerHTML = '';
  
  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];
    const span = document.createElement('span');
    span.textContent = char;
    span.dataset.original = char;
    
    // Add hover listeners to each character
    span.addEventListener('mouseenter', function() {
      this.textContent = '♪';
    });
    
    span.addEventListener('mouseleave', function() {
      this.textContent = this.dataset.original;
    });
    
    h1.appendChild(span);
  }

  // Function to highlight emails based on client type
  function highlightEmails(client) {
    // Reset both emails first
    samEmail.style.color = '';
    samEmail.style.webkitTextStroke = '';
    samEmail.style.fontFamily = '';
    cristinaEmail.style.color = '';
    cristinaEmail.style.webkitTextStroke = '';
    cristinaEmail.style.fontFamily = '';

    // Highlight appropriate email(s)
    if (client.classList.contains('sam-client')) {
      samEmail.style.color = '#FFEE00';
      samEmail.style.webkitTextStroke = '1.2px black';
      samEmail.style.fontFamily = 'Redaction35B';
    }
    
    if (client.classList.contains('both-client')) {
      samEmail.style.color = '#FFEE00';
      samEmail.style.webkitTextStroke = '1.2px black';
      samEmail.style.fontFamily = 'Redaction35B';
      cristinaEmail.style.color = '#FFEE00';
      cristinaEmail.style.webkitTextStroke = '1.2px black';
      cristinaEmail.style.fontFamily = 'Redaction35B';
    }
  }

  // Function to reset emails (only if no client is currently clicked)
  function resetEmails() {
    if (!clickedClient) {
      samEmail.style.color = '';
      samEmail.style.webkitTextStroke = '';
      samEmail.style.fontFamily = '';
      cristinaEmail.style.color = '';
      cristinaEmail.style.webkitTextStroke = '';
      cristinaEmail.style.fontFamily = '';
    }
  }

  // Define socials per client
  const socials = {
    "Tara Yummy": {
      Spotify: "https://open.spotify.com/artist/47Seq2EAGTRuGyV9Fq3WPd",
      Instagram: "https://www.instagram.com/tarayummyy/",
      Youtube: "https://www.youtube.com/channel/UCTIvWbKDaa3cv-gYjKlJbHQ",
      TikTok: "https://www.tiktok.com/@tarayummy?lang=en"
    },
    "Chet Porter": {
      Spotify: "https://open.spotify.com/artist/1BjaGDkxwa2fb2pSCXlFXb?si=Hs0dFq_GRX2xFTMA5T98BA",
      Instagram: "https://www.instagram.com/chetporter/",
      Youtube: "https://www.youtube.com/@chetporter",
      TikTok: "https://www.tiktok.com/@chetporter"
    },
    "Lord Genmu": {
      Spotify: "https://open.spotify.com/artist/1hVeyfiKrAOsS0ZwZg0tWm?si=bThS8tHSRe-1JeWs1C_srg",
      Instagram: "https://www.instagram.com/lordgenmu/",
      Youtube: "https://www.youtube.com/channel/UCA2Cnl1Gbl6UD0xJnLpRvgQ",
      TikTok: "#"
    },
    "CFCF": {
      Spotify: "https://open.spotify.com/artist/73IRHBhotETMmgvRCEyTCS?si=kpAN5COxR02nT-kSBH88gA",
      Instagram: "https://www.instagram.com/cfcfmusic/",
      Youtube: "https://www.youtube.com/@cfcf",
      TikTok: "#"
    },
    "ESP": {
      Spotify: "https://open.spotify.com/artist/0G2H8XIsqcdI5GJrYdRRPa?si=z1A6LW1lRwSOYD-5lqy92g",
      Instagram: "https://www.instagram.com/espforever/",
      Youtube: "https://www.youtube.com/@esp4evr/videos",
      TikTok: "#"
    },
    "Olswel": {
      Spotify: "https://open.spotify.com/artist/5aFfTz3PUiklCHbgz2Aylb?si=WshQBRegRwmLLjAUlyM8Gg",
      Instagram: "https://www.instagram.com/olswelolswel/",
      Youtube: "https://www.youtube.com/@olswel8008",
      TikTok: "https://www.tiktok.com/@olswel"
    },
    "TECHG1RLS": {
      Spotify: "#",
      Instagram: "https://www.instagram.com/techg1rls/",
      Youtube: "https://www.youtube.com/@techg1rls",
      TikTok: "https://www.tiktok.com/@techg1rlss"
    },
    "DJ Thank You": {
      Spotify: "#",
      Instagram: "https://www.instagram.com/djthankyou/",
      Soundcloud:"https://soundcloud.com/djthankyou311",
      TikTok: "#"
    },
    "AG": {
      Spotify: "#",
      Instagram: "#",
      Youtube: "#",
      TikTok: "#"
    },
    "Darby": {
      Spotify: "https://open.spotify.com/artist/6rErJmMCoNHUX0Z99uBB8m?si=-cys2pm2QqOpVQaCkVL1Ew",
      Instagram: "https://www.instagram.com/darbysounds/",
      Youtube: "https://www.youtube.com/@darbysounds",
      TikTok: "https://www.tiktok.com/@darbysounds"
    }
  };

  // Client functionality
  clients.forEach(client => {
    // Hover functionality for email highlighting
    client.addEventListener('mouseenter', function() {
      highlightEmails(this);
    });

    client.addEventListener('mouseleave', function() {
      // Only reset if this client isn't currently clicked
      if (clickedClient !== this) {
        resetEmails();
        // If another client is clicked, keep its highlighting
        if (clickedClient) {
          highlightEmails(clickedClient);
        }
      }
    });

    // Click functionality for social links
    client.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Check if this client already has social links open
      const existingSocial = this.nextElementSibling;
      if (existingSocial && existingSocial.classList.contains('social-links')) {
        // Close if already open
        existingSocial.remove();
        clickedClient = null;
        resetEmails();
        return;
      }

      // Remove any existing social links
      const existingSocials = document.querySelectorAll('.social-links');
      existingSocials.forEach(social => social.remove());

      // Set this as the clicked client and keep email highlighting
      clickedClient = this;
      highlightEmails(this);

      // Create social links div
      const socialLinks = document.createElement('div');
      socialLinks.className = 'social-links';
      
      const name = this.textContent.trim();
      const clientSocials = socials[name];

      if (clientSocials) {
        Object.entries(clientSocials).forEach(([platform, url]) => {
          const link = document.createElement('a');
          link.href = url;
          link.textContent = platform;
          link.target = '_blank';
          socialLinks.appendChild(link);
        });
      }

      // Insert social links after the clicked client
      this.parentNode.insertBefore(socialLinks, this.nextSibling);
    });
  });

  // Close social links when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#right li') && !e.target.closest('.social-links')) {
      const existingSocials = document.querySelectorAll('.social-links');
      existingSocials.forEach(social => social.remove());
      clickedClient = null;
      resetEmails();
    }
  });
});