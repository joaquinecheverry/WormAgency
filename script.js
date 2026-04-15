let bassOscillator = null;
let bassVolume = null;
let audioStarted = false;
let audioNeedsClick = true;

const FIRST_NOTE_VOLUME = -25;
const LAST_NOTE_VOLUME = -5;

async function initializeBackgroundBass() {
  if (audioStarted) return;
  
  try {
    console.log("Attempting to start Tone.js...");
    console.log("AudioContext state before:", Tone.context.state);
    
    await Tone.start();
    console.log("Tone.js started successfully");
    console.log("AudioContext state after:", Tone.context.state);
    audioStarted = true;
    
    bassVolume = new Tone.Volume(FIRST_NOTE_VOLUME).toDestination();
    
    bassOscillator = new Tone.Oscillator({
      frequency: 55,
      type: "sine"
    }).connect(bassVolume);
    
    bassOscillator.start();
    console.log("Bass oscillator started");
    
  } catch (error) {
    console.error("Audio initialization failed:", error);
    // Still allow visual effects even if audio fails
    audioStarted = false;
  }
}

// Initialize audio on first user interaction
document.addEventListener('click', async function initAudio() {
  if (audioNeedsClick) {
    console.log("First click detected, initializing audio...");
    await initializeBackgroundBass();
    audioNeedsClick = false;
  }
}, { once: true });

document.addEventListener('DOMContentLoaded', function() {

  const clientList = document.querySelector('#right ul');
  const clients = Array.from(clientList.querySelectorAll('li'));
  
  clients.sort((a, b) => {
    return a.textContent.trim().localeCompare(b.textContent.trim());
  });
  
  clientList.innerHTML = '';
  clients.forEach(client => clientList.appendChild(client));

  const musicNotes = document.querySelectorAll('#mus span');
  let currentVolume = FIRST_NOTE_VOLUME;
  
  function updateStyling(volumeLevel) {
    const intensity = (volumeLevel - FIRST_NOTE_VOLUME) / (LAST_NOTE_VOLUME - FIRST_NOTE_VOLUME);
    const clampedIntensity = Math.max(0, Math.min(1, intensity));

    const greyValue = 255 - Math.floor(clampedIntensity * 50); 
    const bgColor = `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    document.body.style.backgroundColor = bgColor;

    const strokeWidth = clampedIntensity * 1.1;
    const strokeColor = "#ff00ff";

    const textElements = document.querySelectorAll('h1, p, li, a, #clients, .social-links a');
    textElements.forEach(element => {
      if (element.closest('#mus')) return;

      if (strokeWidth > 0.1) {
        element.style.webkitTextStroke = `${strokeWidth}px ${strokeColor}`;
        element.style.textStroke = `${strokeWidth}px ${strokeColor}`;
        element.style.textShadow = `
          -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
          ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
          -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
          ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
        `;
      } else {
        element.style.webkitTextStroke = '';
        element.style.textStroke = '';
        element.style.textShadow = '';
      }
    });

    const musicNotes = document.querySelectorAll('#mus span');
    musicNotes.forEach(note => {
      note.style.color = bgColor;
      note.style.webkitTextStroke = 'none';
      note.style.textStroke = 'none';
      note.style.textShadow = 'none';
    });
    
    window.currentStrokeWidth = strokeWidth;
  }

  musicNotes.forEach((note, index) => {
    note.addEventListener('mouseenter', async function() {
      // Ensure audio is initialized first
      if (audioNeedsClick) {
        console.log("Audio needs click - visual effects only");
        // Still show visual effects even without audio
        const volumeRange = LAST_NOTE_VOLUME - FIRST_NOTE_VOLUME;
        const volumeStep = volumeRange / (musicNotes.length - 1);
        const targetVolume = FIRST_NOTE_VOLUME + (index * volumeStep);
        updateStyling(targetVolume);
        return;
      }

      // Try to start audio if not already started
      if (!audioStarted) {
        try {
          await Tone.start();
          audioStarted = true;
          console.log("AudioContext unlocked by hover");
          
          bassVolume = new Tone.Volume(FIRST_NOTE_VOLUME).toDestination();
          bassOscillator = new Tone.Oscillator({
            frequency: 55,
            type: "sine"
          }).connect(bassVolume);
          bassOscillator.start();
          console.log("Bass started on hover");
        } catch (err) {
          console.error("Tone start failed on hover:", err);
        }
      }

      if (bassVolume && audioStarted) {
        const volumeRange = LAST_NOTE_VOLUME - FIRST_NOTE_VOLUME;
        const volumeStep = volumeRange / (musicNotes.length - 1);
        const targetVolume = FIRST_NOTE_VOLUME + (index * volumeStep);

        currentVolume = targetVolume;
        bassVolume.volume.setValueAtTime(targetVolume, Tone.now());
        updateStyling(targetVolume);
        console.log(`Volume set to: ${targetVolume}`);
      } else {
        // Fallback: just visual effects
        const volumeRange = LAST_NOTE_VOLUME - FIRST_NOTE_VOLUME;
        const volumeStep = volumeRange / (musicNotes.length - 1);
        const targetVolume = FIRST_NOTE_VOLUME + (index * volumeStep);
        updateStyling(targetVolume);
        console.log("Visual effects only - audio not ready");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const apple = document.getElementById("corner-worm");

  new p5((sketch) => {
    let worms = [];
    let spawnX, spawnY;

    class Worm {
      constructor(x, y) {
        this.segments = [];
        this.segmentCount = sketch.random(3, 10);
        this.pixelSize = 5;
        
        const gridX = Math.floor(x / this.pixelSize) * this.pixelSize;
        const gridY = Math.floor(y / this.pixelSize) * this.pixelSize;
        
        for (let i = 0; i < this.segmentCount; i++) {
          this.segments.push({ x: gridX, y: gridY });
        }
        
        this.moveCounter = 0;
        this.moveInterval = sketch.random(2, 8);
        this.turnChance = 0.25;
        
        const initialDirs = [
          { x: -1, y: 0 },
          { x: -1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: -1 },
        ];
        this.dir = sketch.random(initialDirs);
        
        this.allDirs = [
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: 1 }
        ];
      }

      move() {
        this.moveCounter++;
        
        if (this.moveCounter >= this.moveInterval) {
          this.moveCounter = 0;
          
          if (sketch.random() < this.turnChance) {
            const biasedDirs = [
              { x: -1, y: 0 },
              { x: -1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: -1 },
              { x: 0, y: -1 },
              { x: 1, y: 0 },
              { x: 0, y: 1 }
            ];
            
            const validDirs = biasedDirs.filter(dir => {
              return !(dir.x === -this.dir.x && dir.y === -this.dir.y);
            });
            
            this.dir = sketch.random(validDirs);
          }
          
          const head = this.segments[0];
          
          const newX = head.x + (this.dir.x * this.pixelSize);
          const newY = head.y + (this.dir.y * this.pixelSize);
          
          this.segments.unshift({ x: newX, y: newY });
          
          if (this.segments.length > this.segmentCount) {
            this.segments.pop();
          }
        }
      }

      show() {
        sketch.fill(0);
        
        if (window.currentStrokeWidth && window.currentStrokeWidth > 0.1) {
          sketch.stroke("#ff00ff");
          sketch.strokeWeight(window.currentStrokeWidth);
        } else {
          sketch.noStroke();
        }
        
        for (let i = 0; i < this.segments.length; i++) {
          const segment = this.segments[i];
          sketch.rect(segment.x, segment.y, this.pixelSize, this.pixelSize);
        }
      }
      
      isOffScreen() {
        return this.segments[0].x < -50 || this.segments[0].x > sketch.width + 50 || 
               this.segments[0].y < -50 || this.segments[0].y > sketch.height + 50;
      }
    }

    sketch.setup = () => {
      let cnv = sketch.createCanvas(window.innerWidth, window.innerHeight);
      cnv.position(0, 0);
      cnv.style("pointer-events", "none");
      sketch.clear();
    };

    sketch.draw = () => {
      sketch.clear();
      
      for (let i = worms.length - 1; i >= 0; i--) {
        worms[i].move();
        worms[i].show();
        
        if (worms[i].isOffScreen()) {
          worms.splice(i, 1);
        }
      }
    };

    sketch.windowResized = () => {
      sketch.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    if (apple) {
      apple.addEventListener("mouseenter", () => {
        const rect = apple.getBoundingClientRect();
        spawnX = rect.left + rect.width / 2;
        spawnY = rect.top + rect.height / 2;

        worms = [];
        
        for (let i = 0; i < 10; i++) {
          worms.push(new Worm(spawnX, spawnY));
        }
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const samEmail = document.getElementById('sam-email');
  const cristinaEmail = document.getElementById('cristina-email');
  const clients = document.querySelectorAll('#right li');
  const h1 = document.querySelector('h1');
  const cornerWorm = document.getElementById('corner-worm');

  let clickedClient = null;

  // Initialize visual effects to work independently of audio
  window.currentStrokeWidth = 0;

  const originalText = h1.textContent;
  h1.innerHTML = '';
  
  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];
    const span = document.createElement('span');
    span.textContent = char;
    span.dataset.original = char;
    
    span.addEventListener('mouseenter', function() {
      this.textContent = '♪';
    });
    
    span.addEventListener('mouseleave', function() {
      this.textContent = this.dataset.original;
    });
    
    h1.appendChild(span);
  }

  function highlightEmails(client) {
    samEmail.style.color = '';
    samEmail.style.webkitTextStroke = '';
    samEmail.style.fontFamily = '';
    cristinaEmail.style.color = '';
    cristinaEmail.style.webkitTextStroke = '';
    cristinaEmail.style.fontFamily = '';

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
    "Olswel": {
      Spotify: "https://open.spotify.com/artist/5aFfTz3PUiklCHbgz2Aylb?si=WshQBRegRwmLLjAUlyM8Gg",
      Instagram: "https://www.instagram.com/olswelolswel/",
      Youtube: "https://www.youtube.com/@olswel8008",
      TikTok: "https://www.tiktok.com/@olswel"
    },
    "TECH G1RLS": {
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
    "Darby": {
      Spotify: "https://open.spotify.com/artist/6rErJmMCoNHUX0Z99uBB8m?si=-cys2pm2QqOpVQaCkVL1Ew",
      Instagram: "https://www.instagram.com/darbysounds/",
      Youtube: "https://www.youtube.com/@darbysounds",
      TikTok: "https://www.tiktok.com/@darbysounds"
    },
    "Doecaine": {
      Spotify: "#",
      Instagram: "https://www.instagram.com/doecaine/",
      Youtube: "#",
      TikTok: "https://www.tiktok.com/@doecaine"
    },
    "Bickle": {
      Spotify: "https://open.spotify.com/artist/1xFMeZFEf4ZUfuKwrfs5lB?si=PWdfWJtOSHCQ-Df_cP4Nig",
      Instagram: "https://www.instagram.com/bickleworldwide/",
      Youtube: "https://www.youtube.com/@BickleFilm",
      TikTok: "#"
    },
    "CRUSH3d": {
      Spotify: "https://open.spotify.com/artist/5Qvgao5nFsaKRPeL42Dnpf?si=7nmctv37Q0Wcv8Qo7p09XA",
      Instagram: "https://www.instagram.com/crush.3d/",
      Soundcloud: "https://soundcloud.com/crush_3d",
      TikTok: "https://www.tiktok.com/@crush.3d"
    },
    "Tommy Fleece": {
      Spotify: "https://open.spotify.com/artist/4vv1Y8dwByLcOJ8Wdsxrfg?si=dzIR_9ZMR4C-RLj7DuOsJA",
      Instagram: "https://www.instagram.com/tommysfleece/",
      Soundcloud: "https://soundcloud.com/user-562680767",
      TikTok: "https://www.tiktok.com/@tommyfleece" 
    },
    "Angel Money": {
      Spotify: "https://open.spotify.com/artist/2LWLa3SxLX5CQlT9GdVkSp?si=HtmzKxyVRIqmg5dbLaCZfg",
      Instagram: "https://www.instagram.com/angelmoneymafia/",
      Soundcloud: "https://soundcloud.com/babydreamgirl",
      TikTok: "#" 
    },
    "Mindset": {
      Spotify: "https://open.spotify.com/artist/4P03jzcBS0JcBVx5cl9YhC?si=RHKWkqGhSFqtcTriYLg76w",
      Instagram: "https://www.instagram.com/mindsetbass/",
      Soundcloud: "https://soundcloud.com/mindsetbass",
      TikTok: "https://www.tiktok.com/@mindsetbass"
    },
    "Acyan": {
      Spotify: "https://open.spotify.com/artist/0o70ZPcBroPuIcUOOLWDI4?si=3tMCGWHWSgKgJCyend6Icg",
      Instagram: "https://www.instagram.com/acyanmusic/",
      Soundcloud: "https://soundcloud.com/acyanmusic",
      TikTok: "https://www.tiktok.com/@acyanmusic"
    },
    "Slow Magic": {
      Spotify: "https://open.spotify.com/artist/3htNAy3vYWWYV8RZFeyRMT?si=bb7U6V0CTSyFoyO9H4TFDA",
      Instagram: "https://www.instagram.com/slowmagic/",
      Soundcloud: "https://soundcloud.com/slowmagic",
      TikTok: "https://www.tiktok.com/@slowwwmagic"
    },
    "beastboi.": {
      Spotify: "https://open.spotify.com/artist/0e87rlA12iAl7kIonLl2e4?si=xjaBdGnaQieQPS6zNCcmLQ",
      Instagram: "https://www.instagram.com/beastboisucks/",
      Soundcloud: "https://soundcloud.com/beastboisucks",
      TikTok: "https://www.tiktok.com/@beastboisucks"
    },
    "Ilykimchi": {
      Spotify: "https://open.spotify.com/artist/6cCXgBhHKKuftmzJTL9Omb?si=etjbaUkRQumO6BJHnQZmww",
      Instagram: "https://www.instagram.com/ilykimchi/",
      Soundcloud: "https://soundcloud.com/ilykimchi",
      TikTok: "https://www.tiktok.com/@ilykimchi"
    },
    "Yung Bae": {
      Spotify: "https://open.spotify.com/artist/30FDJPN3RtwJZ20g5YGCRX?si=fqcXcO2LSJ2-wDc-M1L4AA",
      Instagram: "https://www.instagram.com/yungbae/",
      Soundcloud: "https://soundcloud.com/yungestbae",
      TikTok: "https://www.tiktok.com/@yungbae"      
    },
    "poptropicaslutz!": {
      Spotify: "https://open.spotify.com/artist/08DN8ZbOSeuTELiQjc4Jl8?si=krK6zAs_QkOUd3VhGNOYUQ",
      Instagram: "https://www.instagram.com/poptropicaslutz/",
      YouTube: "https://www.youtube.com/channel/UCCW6F3OhY-JgD0jgdaevaWg",
      TikTok: "https://www.tiktok.com/@poptropicaslutz"   
    },
    "Nation": {
      Spotify: "https://open.spotify.com/artist/03D2b6ATNCne8B3D251ncQ?si=xALfx5vcSYyz-RWXiVFJXg",
      Instagram: "https://www.instagram.com/nation_soldier/",
      Soundcloud: "https://soundcloud.com/nationsoldier",
      YouTube: "https://www.youtube.com/@Nation_"  
    },
    "pinponpanpon": {
      Spotify: "https://open.spotify.com/artist/4f2l5pSKd1oUMEMx7SZBng?si=aJHgb0MrRHGI_nJGpfcg0Q",
      Instagram: "https://www.instagram.com/pinponpanpon9/",
      Soundcloud: "https://soundcloud.com/pinponpanpon",
      TikTok: "https://www.tiktok.com/@pinponpanpon.jp"  
    }
  };

  clients.forEach(client => {
    client.addEventListener('mouseenter', function() {
      highlightEmails(this);
    });

    client.addEventListener('mouseleave', function() {
      if (clickedClient !== this) {
        resetEmails();
        if (clickedClient) {
          highlightEmails(clickedClient);
        }
      }
    });

    client.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const existingSocial = this.nextElementSibling;
      if (existingSocial && existingSocial.classList.contains('social-links')) {
        existingSocial.remove();
        clickedClient = null;
        resetEmails();
        return;
      }

      const existingSocials = document.querySelectorAll('.social-links');
      existingSocials.forEach(social => social.remove());

      clickedClient = this;
      highlightEmails(this);

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
          
          if (window.currentStrokeWidth && window.currentStrokeWidth > 0.1) {
            const strokeColor = "#ff00ff";
            const strokeWidth = window.currentStrokeWidth;
            link.style.webkitTextStroke = `${strokeWidth}px ${strokeColor}`;
            link.style.textStroke = `${strokeWidth}px ${strokeColor}`;
            link.style.textShadow = `
              -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
              ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
              -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
              ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
            `;
          }
          
          socialLinks.appendChild(link);
        });
      }

      this.parentNode.insertBefore(socialLinks, this.nextSibling);
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#right li') && !e.target.closest('.social-links')) {
      const existingSocials = document.querySelectorAll('.social-links');
      existingSocials.forEach(social => social.remove());
      clickedClient = null;
      resetEmails();
    }
  });

  // Add a visual indicator for audio status (optional)
  function createAudioStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'audio-status';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      font-size: 12px;
      border-radius: 3px;
      z-index: 1000;
      display: none;
    `;
    indicator.textContent = audioNeedsClick ? 'Click to enable audio' : 'Audio ready';
    document.body.appendChild(indicator);
    
    // Show indicator briefly on load
    setTimeout(() => {
      indicator.style.display = 'block';
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 3000);
    }, 1000);
    
    // Update indicator when audio starts
    document.addEventListener('click', function() {
      if (!audioNeedsClick) {
        indicator.textContent = 'Audio ready';
      }
    }, { once: true });
  }
  
  // Uncomment the line below to show audio status indicator
  // createAudioStatusIndicator();
});
