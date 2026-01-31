document.addEventListener('DOMContentLoaded', function() {
    
    /* ===============================
       1. Scroll Progress Circle
    ================================ */
    const progressWrap = document.querySelector('.progress-wrap');
    const progressPath = document.querySelector('.progress-wrap path');
    
    if (progressPath) {
        const pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

        const updateProgress = () => {
            const scroll = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        };

        updateProgress();
        window.addEventListener('scroll', updateProgress);

        progressWrap.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ===============================
       2. Scroll Reveal (About Sections)
    ================================ */
    const reveals = document.querySelectorAll(".reveal");
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 100) {
                el.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    /* ===============================
       3. Skills Logic (Fixed Margin Issue)
    ================================ */
    const allSkillSections = document.querySelectorAll('.skill-section');

    allSkillSections.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.skill-links') || e.target.tagName === 'A') return;

            const isExpanding = !this.classList.contains('active-card');

            if (isExpanding) {
                allSkillSections.forEach(other => {
                    other.classList.remove('is-open', 'active-card');
                    // حل مشكلة المارجن: نستخدم التعتيم بدل الإخفاء التام
                    other.style.opacity = "0.2"; 
                    other.style.filter = "blur(2px)";
                    other.querySelectorAll('.progress-bar').forEach(b => b.style.width = "0");
                    other.querySelectorAll('.percentage-text').forEach(t => t.innerText = "0%");
                });

                this.classList.add('is-open', 'active-card');
                this.style.opacity = "1";
                this.style.filter = "blur(0)";
                
                // تشغيل الأنميشن
                const bars = this.querySelectorAll('.progress-bar');
                setTimeout(() => {
                    bars.forEach(bar => {
                        const styleAttr = bar.getAttribute('style') || "";
                        const match = styleAttr.match(/--w:\s*(\d+%)/);
                        if (match) bar.style.width = match[1];
                    });
                }, 400);

                const counters = this.querySelectorAll('.percentage-text');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateNumber(counter, 0, target, 2000);
                });

            } else {
                resetAllCards();
            }
        });
    });

    function resetAllCards() {
        allSkillSections.forEach(card => {
            card.classList.remove('is-open', 'active-card');
            card.style.opacity = "1";
            card.style.filter = "blur(0)";
            card.querySelectorAll('.progress-bar').forEach(b => b.style.width = "0");
            card.querySelectorAll('.percentage-text').forEach(t => t.innerText = "0%");
        });
    }

    function animateNumber(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); 
            obj.innerHTML = Math.floor(easeOut * (end - start) + start) + "%";
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

}); // إغلاق الـ DOMContentLoaded بشكل سليم