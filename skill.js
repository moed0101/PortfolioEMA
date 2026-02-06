/* ==========================================================================
   SKILLS SECTION LOGIC (نظام إدارة المهارات المنفصل)
   ========================================================================== */

// تشغيل الكود مباشرة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkills);
} else {
    initSkills();
}

function initSkills() {
    const skillSections = document.querySelectorAll('.skill-section');
    
    if (skillSections.length === 0) return;

    console.log("Skills Module Loaded...");

    // 0. إضافة عداد المهارات بجانب العنوان (Skills Counter)
    const totalSkills = document.querySelectorAll('.skill-item-group').length;
    const skillsTitleEl = document.querySelector('#skills .section-title');
    if (skillsTitleEl && totalSkills > 0 && !skillsTitleEl.querySelector('.skill-count')) {
        const countSpan = document.createElement('span');
        countSpan.className = 'skill-count';
        countSpan.innerText = ` (${totalSkills})`;
        countSpan.style.cssText = "font-size: 0.6em; opacity: 0.7; vertical-align: middle; margin-left: 10px;";
        skillsTitleEl.appendChild(countSpan);
    }

    // --- هام جداً: تفعيل أنميشن الظهور للعناصر الجديدة ---
    const newReveals = document.querySelectorAll('#skills .reveal, #skills.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    newReveals.forEach(el => observer.observe(el));
    // ---------------------------------------------------

    // 1. تعيين مستويات خبرة عشوائية (مؤقتاً كما طلبت)
    // سيتم تطبيق هذا فقط إذا لم تكن النسبة محددة يدوياً في HTML
    document.querySelectorAll('.skill-item-group').forEach(item => {
        const percentText = item.querySelector('.percentage-text');
        const progressBar = item.querySelector('.progress-bar');
        
        // توليد رقم عشوائي بين 65 و 98
        const randomPercent = Math.floor(Math.random() * (98 - 65 + 1) + 65);
        
        // تحديد اللون بناءً على النسبة
        let barColor = '#ff4b4b'; // أحمر (ضعيف)
        if (randomPercent >= 85) barColor = '#25D366'; // أخضر (قوي)
        else if (randomPercent >= 70) barColor = '#ff9800'; // برتقالي (متوسط)

        if(percentText && progressBar) {
            // تحديث القيم في الواجهة
            percentText.setAttribute('data-target', randomPercent);
            percentText.innerText = "0%"; // تصفير العداد للبدء
            percentText.style.color = barColor; // تلوين الرقم
            
            // تحديث متغير CSS الخاص بالشريط
            progressBar.style.setProperty('--w', `${randomPercent}%`);
            progressBar.style.setProperty('--bar-color', barColor); // تمرير اللون للـ CSS

            // --- إضافة أيقونة المستوى (الاقتراح الأول) ---
            let iconClass = 'fa-book-open'; // مستوى مبتدئ (< 70%)
            let levelName = 'Beginner';
            
            if (randomPercent >= 95) { iconClass = 'fa-trophy'; levelName = 'Expert'; }
            else if (randomPercent >= 85) { iconClass = 'fa-star'; levelName = 'Advanced'; }
            else if (randomPercent >= 70) { iconClass = 'fa-fire'; levelName = 'Intermediate'; }
            
            const iconEl = document.createElement('i');
            iconEl.className = `fas ${iconClass} skill-level-icon`;
            iconEl.style.color = barColor;
            iconEl.style.marginLeft = '10px';
            iconEl.style.fontSize = '1.2rem';
            
            // إضافة التلميح (Tooltip)
            iconEl.setAttribute('data-tooltip', levelName);
            iconEl.classList.add('has-tooltip');
            
            // وضع الأيقونة بجانب النسبة
            percentText.parentNode.insertBefore(iconEl, percentText.nextSibling);
        }
    });

    // 2. تفعيل نظام الأكورديون (فتح/غلق الأقسام)
    skillSections.forEach(section => {
        // إزالة أي مستمعين سابقين لتجنب التكرار (Clean start)
        const newSection = section.cloneNode(true);
        section.parentNode.replaceChild(newSection, section);
        
        // إضافة زر الإغلاق (X) ديناميكياً
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-skill-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        newSection.appendChild(closeBtn);

        // إضافة سهم التوجيه (مخفي افتراضياً)
        const arrowHint = document.createElement('div');
        arrowHint.className = 'click-hint-arrow';
        arrowHint.innerHTML = '<i class="fas fa-chevron-down"></i>';
        newSection.appendChild(arrowHint);

        // تفعيل زر الإغلاق
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع تفعيل ضغطة الكارت نفسه
            closeAllSections();
        });
    });

    // إعادة تحديد العناصر بعد الاستنساخ
    const activeSections = document.querySelectorAll('.skill-section');
    
    activeSections.forEach(section => {
        section.addEventListener('click', (e) => {
            // منع الفتح عند الضغط على الروابط الداخلية
            if (e.target.closest('a') || e.target.closest('button')) return;
            
            // تبديل حالة الفتح
            const wasOpen = section.classList.contains('is-open');
            
            // فتح القسم الحالي إذا لم يكن مفتوحاً
            if (!wasOpen) {
                // تغبيش جميع الأقسام الأخرى (Blur Effect - الاقتراح الثاني)
                activeSections.forEach(s => {
                    if (s !== section) {
                        s.classList.remove('is-open', 'active-card');
                        s.classList.add('blurred-card'); // تغبيش بدلاً من إخفاء
                    }
                });

                section.classList.add('is-open');
                section.classList.add('active-card');
                section.classList.remove('hidden-card', 'blurred-card');
                animateSkillsIn(section); // تشغيل العدادات
            }
        });
    });

    // 3. تفعيل الضغط على العنوان الرئيسي لإعادة الفتح
    const skillsTitle = document.querySelector('#skills .section-title');
    const skillsWrapper = document.querySelector('.skills-wrapper');
    const closeWrapperBtn = document.querySelector('.close-wrapper-btn');

    if (skillsTitle && skillsWrapper) {
        skillsTitle.style.cursor = 'pointer'; // تغيير شكل الماوس ليد
        
        skillsTitle.addEventListener('click', () => {
            // لو القائمة مخفية -> اظهرها
            if (skillsWrapper.classList.contains('collapsed')) {
                skillsWrapper.classList.remove('collapsed');
            } else {
                // لو ظاهرة -> اخفيها (Collapse)
                skillsWrapper.classList.add('collapsed');
                // إعادة تعيين الكروت الداخلية بعد انتهاء الأنميشن لضمان بداية نظيفة المرة القادمة
                setTimeout(() => closeAllSections(), 600);
            }
        });
    }

    // تفعيل زر الإغلاق الرئيسي للقائمة
    if (closeWrapperBtn && skillsWrapper) {
        closeWrapperBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع انتشار الحدث
            skillsWrapper.classList.add('collapsed');
            setTimeout(() => closeAllSections(), 600);
        });
    }

    // تفعيل زر طي الكل (Collapse All)
    const collapseAllBtn = document.querySelector('.collapse-all-btn');
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllSections();
        });
    }

    function showClickHints() {
        const arrows = document.querySelectorAll('.click-hint-arrow');
        arrows.forEach(arrow => {
            arrow.style.opacity = '1';
        });

        // إخفاء الأسهم بعد 3 ثواني
        setTimeout(() => {
            arrows.forEach(arrow => {
                arrow.style.opacity = '0';
            });
        }, 3000);
    }

    function closeAllSections() {
        activeSections.forEach(s => {
            s.classList.remove('is-open', 'active-card', 'hidden-card', 'blurred-card');
        });
    }
}

// 3. دالة تحريك العدادات والبارات عند الفتح
function animateSkillsIn(section) {
    const numbers = section.querySelectorAll('.percentage-text');

    numbers.forEach(num => {
        const target = +num.getAttribute('data-target');
        const duration = 1500; // مدة العد (مللي ثانية)
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // معادلة الحركة (Ease Out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            num.innerText = Math.floor(easeProgress * target) + "%";
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                num.innerText = target + "%"; // ضمان الوصول للرقم النهائي
            }
        };
        window.requestAnimationFrame(step);
    });
}
