/* Profile Nav - Scroll tracking & smooth scroll for plant profile pages */
(function() {
    'use strict';
    var nav = document.querySelector('.profile-nav');
    if (!nav) return;

    var links = nav.querySelectorAll('a[href^="#"]');
    var sections = [];
    var navHeight = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72);
    var profileNavHeight = nav.offsetHeight || 48;
    var offset = navHeight + profileNavHeight + 20;

    // Build sections array
    links.forEach(function(link) {
        var id = link.getAttribute('href').slice(1);
        var el = document.getElementById(id);
        if (el) sections.push({ id: id, el: el, link: link });
    });

    // Smooth scroll on click
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var id = this.getAttribute('href').slice(1);
            var target = document.getElementById(id);
            if (target) {
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // Scroll spy - highlight active section
    var ticking = false;
    function updateActive() {
        var scrollPos = window.pageYOffset + offset + 10;
        var current = null;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].el.offsetTop <= scrollPos) {
                current = sections[i];
            }
        }
        links.forEach(function(l) { l.classList.remove('active'); });
        if (current) {
            current.link.classList.add('active');
            // Scroll the nav to keep active link visible
            var navInner = nav.querySelector('.profile-nav-inner');
            if (navInner && current.link.offsetLeft) {
                var linkLeft = current.link.offsetLeft - navInner.offsetLeft;
                var navWidth = navInner.clientWidth;
                var linkWidth = current.link.offsetWidth;
                if (linkLeft < navInner.scrollLeft || linkLeft + linkWidth > navInner.scrollLeft + navWidth) {
                    navInner.scrollTo({ left: linkLeft - 16, behavior: 'smooth' });
                }
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateActive);
            ticking = true;
        }
    });

    // Initial highlight
    updateActive();
})();
