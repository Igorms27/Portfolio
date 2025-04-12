(function ($, window, document, undefined) {
  var Starfield = function (el, options) {
    this.el = el;
    this.$el = $(el);
    this.options = options;

    this.that = this;
  };

  var isPlaying;
  var isInited = false;
  var canCanvas = false;
  var animId;
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  (function () {
    var lastTime = 0;
    var vendors = ["ms", "moz", "webkit", "o"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame =
        window[vendors[x] + "RequestAnimationFrame"];
      window.cancelAnimationFrame =
        window[vendors[x] + "CancelAnimationFrame"] ||
        window[vendors[x] + "CancelRequestAnimationFrame"];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
  })();

  Starfield.prototype = {
    defaults: {
      starColor: "rgba(255,255,255,1)",
      bgColor: "rgba(0,0,0,8)",
      mouseMove: true,
      mouseColor: "rgba(0,0,0,0.2)",
      mouseSpeed: 0.09,
      fps: 15,
      speed: 1,
      quantity: isMobile ? 256 : 512,
      ratio: 256,
      divclass: "starfield",
    },

    resizer: function () {
      var oldStar = this.star;
      var initW = this.context.canvas.width;
      var initH = this.context.canvas.height;

      this.w = this.$el.width();
      this.h = this.$el.height();
      this.x = Math.round(this.w / 150);
      this.y = Math.round(this.h / 200);

      this.portrait = this.w < this.h;

      var ratX = this.w / initW;
      var ratY = this.h / initH;

      this.context.canvas.width = this.w;
      this.context.canvas.height = this.h;

      window.requestAnimationFrame(() => {
        for (var i = 0; i < this.n; i++) {
          this.star[i][0] = oldStar[i][0] * ratX;
          this.star[i][1] = oldStar[i][1] * ratY;

          this.star[i][3] =
            this.x + (this.star[i][0] / this.star[i][2]) * this.star_ratio;
          this.star[i][4] =
            this.y + (this.star[i][1] / this.star[i][2]) * this.star_ratio;
        }

        this.context.fillStyle = this.settings.bgColor;
        this.context.strokeStyle = this.settings.starColor;
      });
    },

    init: function () {
      this.settings = $.extend({}, this.defaults, this.options);

      const urlParams = new URLSearchParams(window.location.search);
      this.n = parseInt(urlParams.get('n')) || this.settings.quantity;

      this.flag = true;
      this.test = true;
      this.w = 0;
      this.h = 0;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.star_color_ratio = 0;
      this.star_x_save = 0;
      this.star_y_save = 0;
      this.star_ratio = this.settings.ratio;
      this.star_speed = this.settings.speed;
      this.star_speed_save = 0;
      this.star = new Array(this.n);
      this.color = this.settings.starColor;
      this.opacity = 0.1;

      this.cursor_x = 0;
      this.cursor_y = 0;
      this.mouse_x = 0;
      this.mouse_y = 0;

      this.canvas_x = 0;
      this.canvas_y = 0;
      this.canvas_w = 0;
      this.canvas_h = 0;

      this.fps = this.settings.fps;

      this.desktop = !isMobile;
      this.orientationSupport = window.DeviceOrientationEvent !== undefined;
      this.portrait = null;

      var canvasInit = () => {
        this.w = this.$el.width();
        this.h = this.$el.height();

        this.initW = this.w;
        this.initH = this.h;

        this.portrait = this.w < this.h;

        this.wrapper = $("<canvas />").addClass(this.settings.divclass);

        this.wrapper.appendTo(this.el);

        this.starz = $("canvas", this.el);

        if (this.starz[0].getContext) {
          this.context = this.starz[0].getContext("2d");
          canCanvas = true;
        }

        this.context.canvas.width = this.w;
        this.context.canvas.height = this.h;
      };
      canvasInit();

      var starInit = () => {
        if (canCanvas) {
          this.x = Math.round(this.w / 2);
          this.y = Math.round(this.h / 2);
          this.z = (this.w + this.h) / 2;
          this.star_color_ratio = 1 / this.z;
          this.cursor_x = this.x;
          this.cursor_y = this.y;

          this.star = Array.from({ length: this.n }, () => {
            return [
              Math.random() * this.w * 2 - this.x * 2,
              Math.random() * this.h * 2 - this.y * 2,
              Math.round(Math.random() * this.z),
              0,
              0
            ];
          });

          this.context.fillStyle = this.settings.bgColor;
          this.context.strokeStyle = this.settings.starColor;
        }
      };
      starInit();

      isInited = true;
    },

    anim: function () {
      this.mouse_x = this.cursor_x - this.x;
      this.mouse_y = this.cursor_y - this.y;
      this.context.fillRect(0, 0, this.w, this.h);

      for (var i = 0; i < this.n; i++) {
        this.test = true;
        this.star_x_save = this.star[i][3];
        this.star_y_save = this.star[i][4];
        this.star[i][0] += this.mouse_x >> 7;

        if (this.star[i][0] > this.x << 1) {
          this.star[i][0] -= this.w << 1;
          this.test = false;
        } else if (this.star[i][0] < -this.x << 1) {
          this.star[i][0] += this.w << 1;
          this.test = false;
        }

        this.star[i][1] += this.mouse_y >> 7;
        if (this.star[i][1] > this.y << 1) {
          this.star[i][1] -= this.h << 1;
          this.test = false;
        } else if (this.star[i][1] < -this.y << 1) {
          this.star[i][1] += this.h << 1;
          this.test = false;
        }

        this.star[i][2] -= this.star_speed;
        if (this.star[i][2] > this.z) {
          this.star[i][2] -= this.z;
          this.test = false;
        } else if (this.star[i][2] < 0) {
          this.star[i][2] += this.z;
          this.test = false;
        }

        this.star[i][3] =
          this.x + (this.star[i][0] / this.star[i][2]) * this.star_ratio;
        this.star[i][4] =
          this.y + (this.star[i][1] / this.star[i][2]) * this.star_ratio;

        if (
          this.star_x_save > 0 &&
          this.star_x_save < this.w &&
          this.star_y_save > 0 &&
          this.star_y_save < this.h &&
          this.test
        ) {
          this.context.lineWidth =
            (1 - this.star_color_ratio * this.star[i][2]) * 2;
          this.context.beginPath();
          this.context.moveTo(this.star_x_save, this.star_y_save);
          this.context.lineTo(this.star[i][3], this.star[i][4]);
          this.context.stroke();
          this.context.closePath();
        }
      }
    },

    loop: function () {
      this.anim();

      if (isMobile) {
        setTimeout(() => {
          animId = window.requestAnimationFrame(() => this.loop());
        }, 1000 / 30);
      } else {
        animId = window.requestAnimationFrame(() => this.loop());
      }
    },

    move: function () {
      var doc = document.documentElement;
      
      const throttle = (fn, delay) => {
        let lastCall = 0;
        return function(...args) {
          const now = new Date().getTime();
          if (now - lastCall < delay) {
            return;
          }
          lastCall = now;
          return fn(...args);
        };
      };

      if (this.orientationSupport && !this.desktop) {
        window.addEventListener("deviceorientation", throttle(handleOrientation, 50), false);
      } else {
        window.addEventListener("mousemove", throttle(handleMousemove, 50), false);
      }

      const handleOrientation = (event) => {
        if (event.beta !== null && event.gamma !== null) {
          var x = event.gamma,
            y = event.beta;

          if (!this.portrait) {
            x = event.beta * -1;
            y = event.gamma;
          }

          this.cursor_x = this.w / 2 + x * 5;
          this.cursor_y = this.h / 2 + y * 5;
        }
      };

      const handleMousemove = (event) => {
        this.cursor_x =
          event.pageX || event.clientX + doc.scrollLeft - doc.clientLeft;
        this.cursor_y =
          event.pageY || event.clientY + doc.scrollTop - doc.clientTop;
      };
    },

    stop: function () {
      window.cancelAnimationFrame(animId);
      isPlaying = false;
    },

    start: function () {
      if (!isInited) {
        isInited = true;
        this.init();
      }

      if (!isPlaying) {
        isPlaying = true;
        this.loop();
      }

      const debounce = (fn, delay) => {
        let timeoutId;
        return function(...args) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
            fn.apply(this, args);
          }, delay);
        };
      };

      window.addEventListener(
        "resize", 
        debounce(() => this.resizer(), 200), 
        false
      );

      window.addEventListener(
        "orientationchange",
        debounce(() => this.resizer(), 200),
        false
      );

      if (this.settings.mouseMove) {
        this.move();
      }

      return this;
    },
  };

  Starfield.defaults = Starfield.prototype.defaults;

  $.fn.starfield = function (options) {
    return this.each(function () {
      new Starfield(this, options).start();
    });
  };

  window.Starfield = Starfield;
})(jQuery, window, document);

$(document).ready(function() {
  // Verificar se o elemento starfield existe antes de inicializar
  if ($(".starfield").length) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const isLowPowerDevice = isMobile && navigator.deviceMemory && navigator.deviceMemory < 4;
    
    let starOptions = {};
    
    // Configurações baseadas no tipo de dispositivo e tamanho da tela
    if (isLowPowerDevice) {
      // Dispositivos de baixa capacidade
      starOptions = {
        quantity: 100,
        speed: 0.3,
        fps: 20
      };
    } else if (isMobile || screenWidth < 480) {
      // Smartphones
      starOptions = {
        quantity: 150,
        speed: 0.5,
        fps: 30
      };
    } else if (screenWidth < 768) {
      // Tablets menores
      starOptions = {
        quantity: 250,
        speed: 0.6,
        fps: 30
      };
    } else if (screenWidth < 1200) {
      // Tablets maiores e laptops
      starOptions = {
        quantity: 300,
        speed: 0.8
      };
    } else if (screenWidth >= 1920) {
      // Telas grandes
      starOptions = {
        quantity: 600,
        speed: 1.2
      };
    }
    
    // Orientação paisagem em dispositivo móvel (ajuste para melhor desempenho)
    if (isMobile && screenWidth > screenHeight) {
      starOptions.quantity = Math.floor(starOptions.quantity * 0.7);
    }
    
    // Inicializar o campo de estrelas
    $(".starfield").starfield(starOptions);
    
    // Atualizar quando a orientação mudar
    window.addEventListener('orientationchange', function() {
      setTimeout(function() {
        const newWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const newHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        if (isMobile) {
          // Reajustar quantidade em orientação paisagem
          if (newWidth > newHeight) {
            $(".starfield").starfield({
              ...starOptions,
              quantity: Math.floor(starOptions.quantity * 0.7)
            });
          } else {
            $(".starfield").starfield(starOptions);
          }
        }
      }, 300);
    });
  }
  
  // Função para corrigir a navegação em links internos
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // Configurar navegação suave
  setupSmoothScroll();
  
  // Garantir que a rolagem funcione mesmo depois de carregar a página
  setTimeout(setupSmoothScroll, 1000);
  
  // Corrigir a seta de rolagem
  document.querySelector('.scroll-indicator')?.addEventListener('click', function() {
    const experienciaElement = document.querySelector('#experiencia');
    if (experienciaElement) {
      experienciaElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Carrossel de Certificados
document.addEventListener('DOMContentLoaded', function() {
  const nextButton = document.getElementById('next-certificate');
  const prevButton = document.getElementById('prev-certificate');
  const certificateItems = document.querySelectorAll('.certificate-item');
  const totalItems = certificateItems.length;
  let isAnimating = false;
  
  // Função para atualizar as posições dos certificados
  function updatePositions() {
    certificateItems.forEach(item => {
      const position = parseInt(item.getAttribute('data-position'));
      const newPosition = (position % totalItems) || totalItems;
      item.setAttribute('data-position', newPosition);
    });
  }
  
  // Mover para o próximo certificado
  function moveNext() {
    if (isAnimating) return;
    isAnimating = true;
    
    certificateItems.forEach(item => {
      let currentPosition = parseInt(item.getAttribute('data-position'));
      let newPosition = currentPosition - 1;
      if (newPosition <= 0) {
        newPosition = totalItems;
      }
      item.setAttribute('data-position', newPosition);
    });
    
    // Adicionar classe de animação
    const carousel = document.querySelector('.certificates-carousel');
    carousel.classList.add('rotating');
    
    // Remover classe após a animação
    setTimeout(() => {
      carousel.classList.remove('rotating');
      isAnimating = false;
    }, 600);
  }
  
  // Mover para o certificado anterior
  function movePrev() {
    if (isAnimating) return;
    isAnimating = true;
    
    certificateItems.forEach(item => {
      let currentPosition = parseInt(item.getAttribute('data-position'));
      let newPosition = currentPosition + 1;
      if (newPosition > totalItems) {
        newPosition = 1;
      }
      item.setAttribute('data-position', newPosition);
    });
    
    // Adicionar classe de animação
    const carousel = document.querySelector('.certificates-carousel');
    carousel.classList.add('rotating');
    
    // Remover classe após a animação
    setTimeout(() => {
      carousel.classList.remove('rotating');
      isAnimating = false;
    }, 600);
  }
  
  // Adicionar evento aos botões
  if (nextButton && prevButton) {
    nextButton.addEventListener('click', moveNext);
    prevButton.addEventListener('click', movePrev);
  }
  
  // Rotação automática a cada 3 segundos
  let autoRotate = setInterval(moveNext, 3000);
  
  // Parar rotação automática quando o mouse estiver sobre o carrossel
  const carouselContainer = document.querySelector('.certificates-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => {
      clearInterval(autoRotate);
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
      clearInterval(autoRotate); // Limpar qualquer intervalo existente
      autoRotate = setInterval(moveNext, 3000);
    });
  }
  
  // Adicionar suporte para gestos de swipe em dispositivos móveis
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      // Parar rotação automática durante o toque
      clearInterval(autoRotate);
    }, { passive: true });
    
    carouselContainer.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      
      // Reiniciar rotação automática após o toque
      clearInterval(autoRotate);
      autoRotate = setInterval(moveNext, 3000);
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe para esquerda - próximo
        moveNext();
      } else if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe para direita - anterior
        movePrev();
      }
    }
  }
  
  // Inicializar as posições
  updatePositions();
});
