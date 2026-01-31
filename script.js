/* ===============================
   Scroll Reveal (About Me / Sections)
================================ */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* ===============================
   Skills Cards Logic (Progress Bars & Counters)
================================ */
document.querySelectorAll('.skill-section').forEach(card => {
    
    card.addEventListener('click', function(e) {
        // منع القفل لو الضغط على لينكات التحميل
        if (e.target.tagName === 'A' || e.target.closest('.skill-links')) return;

        const isOpen = this.classList.contains('is-open');

        // 1. قفل الكروت التانية وتصفيرها تماماً (خطوط وأرقام)
        document.querySelectorAll('.skill-section').forEach(otherCard => {
            if (otherCard !== this) {
                otherCard.classList.remove('is-open');
                otherCard.querySelectorAll('.progress-bar').forEach(bar => bar.style.width = "0");
                otherCard.querySelectorAll('.percentage-text').forEach(t => t.innerText = "0%");
            }
        });

        // 2. تبديل حالة الكارت الحالي
        this.classList.toggle('is-open');

        // 3. لو الكارت اتفتح، شغل الأنميشن
        if (this.classList.contains('is-open')) {
            
            // --- أ: تحريك خطوط التحميل (الزحف) ---
            const progressBars = this.querySelectorAll('.progress-bar');
            // تأخير 50ms عشان نضمن إن الـ CSS Transition يلقط الحركة من صفر
            setTimeout(() => {
                progressBars.forEach(bar => {
// بنجيب القيمة اللي إنت كاتبها في الـ style جوه الـ HTML
        // سواء كانت 40% أو 70% أو 100%
        let targetW = bar.style.getPropertyValue('--w') || 
                      bar.getAttribute('style').match(/--w:\s*(\d+)/)[1] + '%';
        
        // بنطبق القيمة دي بالظبط على الـ width
        bar.style.width = targetW; 
    });
}, 100);
            // --- ب: تشغيل عداد الأرقام ---
            const counters = this.querySelectorAll('.percentage-text');
            counters.forEach(counter => {
                counter.innerText = "0%"; 
                const target = +counter.getAttribute('data-target'); 
                const duration = 2000; // ثانيتين ليتوافق مع الخط
                const startTime = performance.now();

                function updateNumber(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // EaseOut ليكون ناعم ومتزامن مع الخط
                    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
                    const currentNumber = Math.floor(easeOutQuad * target);
                    
                    counter.innerText = currentNumber + "%";

                    if (progress < 1) {
                        requestAnimationFrame(updateNumber);
                    } else {
                        counter.innerText = target + "%";
                    }
                }
                requestAnimationFrame(updateNumber);
            });
        } else {
            // 4. لو الكارت اتقفل، صفر كل حاجة عشان الحركة تعيد نفسها المرة الجاية
            this.querySelectorAll('.progress-bar').forEach(bar => bar.style.width = "0");
            this.querySelectorAll('.percentage-text').forEach(t => t.innerText = "0%");
        }
    });
});


document.querySelectorAll('.skill-section').forEach(card => {
    card.addEventListener('click', function(e) {
        if (e.target.closest('.skill-links')) return;

        const isExpanding = !this.classList.contains('active-card');

        if (isExpanding) {
            // 1. تفعيل الكارت الحالي
            this.classList.add('is-open', 'active-card');
            
            // 2. إخفاء باقي الكروت
            document.querySelectorAll('.skill-section').forEach(other => {
                if (other !== this) {
                    other.classList.add('hidden-card');
                }
            });

            // 3. تشغيل أنميشن الزحف والعد (نفس كودك القديم)
            startAnimations(this);

        } else {
            // 4. لو ضغطت عليه وهو مفتوح.. يرجع كل حاجة مكانها
            resetAllCards();
        }
    });
});

function resetAllCards() {
    const allCards = document.querySelectorAll('.skill-section');
    const activeCard = document.querySelector('.skill-section.active-card');

    if (activeCard) {
        // 1. قفل محتوى المهارات الأول (الخطوط والأرقام)
        activeCard.classList.remove('is-open');
        activeCard.querySelectorAll('.progress-bar').forEach(b => b.style.width = "0");
        
        // 2. رجوع الكارت لحجمه الطبيعي
        activeCard.classList.remove('active-card');

        // 3. تأخير بسيط (200ms) قبل إظهار باقي الكروت عشان نمنع التعليقة
        setTimeout(() => {
            allCards.forEach(card => {
                card.classList.remove('hidden-card');
            });
        }, 200); 
    }
}

function startAnimations(container) {
    const bars = container.querySelectorAll('.progress-bar');
    setTimeout(() => {
        bars.forEach(bar => {
            const targetW = bar.getAttribute('style').match(/--w:\s*(\d+%)/);
            if (targetW) bar.style.width = targetW[1];
        });
    }, 300); // تأخير بسيط لحد ما الكارت يخلص تمدد
    
    // كود العداد الرقمي (animateValue) اللي معاك سيبه زي ما هو
}




card.addEventListener('click', function() {
    this.classList.add('is-open');
    
    // بنستنى 500ms (وقت فتح الكارت) وبعدين نظهر اللي جوه
    setTimeout(() => {
        this.querySelector('.skills-container').style.opacity = '1';
    }, 500);
});