(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector(".hero-prev");
      var next = carousel.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          play();
        });
      });

      show(0);
      play();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.parentElement.querySelector("[data-search-scope]");
      if (!scope) {
        return;
      }

      var input = panel.querySelector(".filter-input");
      var select = panel.querySelector(".filter-year");
      var clear = panel.querySelector(".filter-clear");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var year = select ? select.value : "";

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var yearMatch = !year || card.dataset.year === year;
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(yearMatch && queryMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (select) {
        select.addEventListener("change", apply);
      }

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (select) {
            select.value = "";
          }
          apply();
        });
      }
    });
  });
}());
