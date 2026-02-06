/* ==========================================================================
   1. دوال الحسابات الهندسية (موجودة هنا لمنع مشاكل الاستدعاء)
   ========================================================================== */

// منطق حساب Fixed Base Plate
function calculateFixedBaseLogic({ M, N, L, B, Fcu }) {
    const area = L * B;
    // معادلة تقريبية للإجهاد (للعرض فقط)
    const stress = (N * 1000) / area; 
    const status = stress < (0.3 * Fcu) ? "SAFE" : "UNSAFE";
    const color = status === "SAFE" ? "#25D366" : "#ff4b4b";
    
    return `
        <div style="padding:15px; color:#fff;">
            <h4 style="color:#ff9800; margin-bottom:10px;">Analysis Result</h4>
            <p><strong>Contact Stress:</strong> ${stress.toFixed(2)} kg/cm²</p>
            <p><strong>Status:</strong> <span style="color:${color}; font-weight:bold;">${status}</span></p>
            <p style="font-size:12px; color:#aaa; margin-top:5px;">* Based on simplified contact pressure.</p>
        </div>
    `;
}

// منطق حساب Hinged Base Plate
function calculateHingedBaseLogic({ N, L, B, Fcu, grade }) {
    const area = L * B;
    const stress = (N * 1000) / area;
    const allow = 0.3 * Fcu;
    const status = stress < allow ? "SAFE" : "UNSAFE";
    const color = status === "SAFE" ? "#25D366" : "#ff4b4b";

    return `
        <div style="padding:15px; color:#fff;">
            <h4 style="color:#ff9800; margin-bottom:10px;">Analysis Result</h4>
            <p><strong>Bearing Stress:</strong> ${stress.toFixed(2)} kg/cm²</p>
            <p><strong>Allowable:</strong> ${allow.toFixed(2)} kg/cm²</p>
            <p><strong>Status:</strong> <span style="color:${color}; font-weight:bold;">${status}</span></p>
        </div>
    `;
}

/* ==========================================================================
   2. إعدادات Firebase (Auth & Database)
   ========================================================================== */
const ADMIN_EMAIL = "eng.mohamedayman1@gmail.com";
let auth = null;
let db = null;
let storage = null;

try {
    if (typeof firebase !== 'undefined') {
        const firebaseConfig = {
            apiKey: "AIzaSyDYHq7cvVBU_Z8X3H-PkL_ApmQXpa-ooXA",
            authDomain: "portfolioema-1.firebaseapp.com",
            projectId: "portfolioema-1",
            storageBucket: "portfolioema-1.firebasestorage.app",
            messagingSenderId: "601561055999",
            appId: "1:601561055999:web:bb8142834cb824f9f9c2ca",
            measurementId: "G-G50XF6F14R"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
    } else {
        console.warn("Firebase SDK not loaded.");
    }
} catch (e) {
    console.error("Firebase Init Error:", e);
}

/* ==========================================================================
   3. كود الموقع الرئيسي (DOM Ready)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    // منع السكرول أثناء التحميل
    document.body.style.overflow = 'hidden';
    
    // --- أ) إصلاح الأنيميشن وحركة الهيدر (Missing Animations) ---

    // 0. Top Loading Bar Logic (شريط التحميل العلوي)
    const loader = document.createElement('div');
    loader.id = 'top-loader';
    document.body.prepend(loader);

    // محاكاة اكتمال التحميل عند فتح الصفحة
    setTimeout(() => {
        loader.style.width = '100%';
        setTimeout(() => {
            loader.style.opacity = '0';
            document.body.style.overflow = 'auto'; // إعادة تفعيل السكرول
            setTimeout(() => {
                loader.style.width = '0';
            }, 200);
        }, 500); // تقليل زمن الانتظار (كان 800)
    }, 50); // تقليل زمن البدء (كان 100)

    // تشغيل الشريط عند الضغط على الروابط الداخلية
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // التأكد من أنه رابط داخلي وليس رابط خارجي أو إيميل
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && target !== '_blank') {
                loader.style.opacity = '1';
                loader.style.width = '70%'; // يتحرك لـ 70% ويوهم المستخدم بالتحميل
            }
        });
    });

    // 0. تشغيل حلقة السهم (Scroll Progress Ring)
    const progressPath = document.querySelector('.progress-wrap path');
    if (progressPath) {
        const pathLength = progressPath.getTotalLength();
        
        // إعدادات الرسم الأولية
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

        const updateProgress = function () {
            const scroll = window.scrollY || window.pageYOffset;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
        updateProgress(); // تشغيل مرة في البداية
        window.addEventListener('scroll', updateProgress);
    }

    // 1. حركة السكرول (الهيدر + شريط التقدم + زر الصعود)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        // حساب شريط التقدم (Progress Bar)
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const myBar = document.getElementById("myBar");
        if (myBar) myBar.style.width = scrolled + "%";

        // تغيير شكل الهيدر عند النزول (Glass Effect)
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }

        // إظهار زر الصعود للأعلى
        const progressWrap = document.querySelector('.progress-wrap');
        if (progressWrap) {
            if (window.scrollY > 100) progressWrap.classList.add('active-progress');
            else progressWrap.classList.remove('active-progress');
        }

        // تدوير السهم حسب اتجاه السكرول
        const scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow) {
            if (winScroll > lastScrollTop) {
                // نازل -> السهم يبص لتحت
                scrollArrow.style.transform = 'translate(-50%, -50%) rotate(180deg)';
                scrollArrow.classList.add('pointing-down'); // تغيير اللون
            } else {
                // طالع -> السهم يبص لفوق
                scrollArrow.style.transform = 'translate(-50%, -50%) rotate(0deg)';
                scrollArrow.classList.remove('pointing-down'); // استعادة اللون الأصلي
            }
        }
        lastScrollTop = winScroll <= 0 ? 0 : winScroll;
    });

    // تشغيل زر الصعود للأعلى عند الضغط
    const progressWrap = document.querySelector('.progress-wrap');
    if(progressWrap) {
        progressWrap.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 2. تأثير الكتابة التلقائية (Typewriter Effect) للوظيفة
const jobTitleElement = document.querySelector('.hero-job');
if (jobTitleElement) {
    const titles = ["BIM & Steel Structure Specialist", "Civil Engineer", "Tekla Developer"];
    
    // تعريف الألوان بناءً على هويتك (برتقالي، أزرق، ومزيج بينهما)
    const gradients = [
        "linear-gradient(to right, #ff9800, #f57c00)", // برتقالي (للتخصص الأول)
        "linear-gradient(to right, #00d4ff, #0097a7)", // أزرق (للمهندس المدني)
        "linear-gradient(to right, #ff9800, #00d4ff)"  // مزيج (للمطور)
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function typeWriter() {
        const currentTitle = titles[titleIndex];
        
        // --- الجزء الخاص بتغيير الألوان ---
        jobTitleElement.style.backgroundImage = gradients[titleIndex];
        jobTitleElement.style.webkitBackgroundClip = "text";
        jobTitleElement.style.webkitTextFillColor = "transparent";
        jobTitleElement.style.display = "inline-block"; // لضمان ظهور التدرج بشكل صحيح
        // --------------------------------

        if (isDeleting) {
            jobTitleElement.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            jobTitleElement.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }
    
    typeWriter();
}

    // 3. عداد الأرقام (Number Counter Animation)
    // دالة العد (تم تحسينها لتقبل الرموز مثل + و %)
    function startCount(el) {
        const target = parseInt(el.getAttribute('data-target'));
        if(isNaN(target)) return;
        
        // حفظ الرموز الموجودة جنب الرقم (زي + أو %)
        const originalText = el.textContent || "";
        const suffix = originalText.replace(/[0-9]/g, '').trim(); 
        
        const duration = 2000; // مدة العد 2 ثانية
        const step = target / (duration / 16); 
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.ceil(current) + suffix;
            }
        }, 16);
    }

    // مراقبة الأقسام التي تحتوي على أرقام (Hero Section و About Section)
    const statsSections = document.querySelectorAll('.hero-stats, .about-stats, .skill-section');

    if (statsSections.length > 0) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // البحث عن الأرقام داخل القسم الظاهر فقط (.num للقديم و .stat-number للجديد)
                    const numbers = entry.target.querySelectorAll('.num, .stat-number, .percentage-text');
                    
                    numbers.forEach((num) => {
                        // شرط لمنع تكرار العد لو اشتغل قبل كده
                        if (!num.classList.contains('counted')) {
                            startCount(num);
                            num.classList.add('counted');
                        }
                    });

                    // التوقف عن مراقبة هذا القسم بعد تشغيل العداد
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 }); // يشتغل لما 50% من السكشن يظهر

        statsSections.forEach(section => {
            statsObserver.observe(section);
        });
    }
 



    

    // 4. انميشن ظهور العناصر (Scroll Reveal)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // 5. القائمة الجانبية للموبايل (Mobile Menu)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('toggle');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            // التحكم في السكرول يتم عبر CSS class 'menu-open'
        });

        // إغلاق القائمة عند الضغط على أي رابط
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('toggle');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // 6. تغيير الثيم (Dark/Light Mode)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
            const icon = themeToggle.querySelector('i');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            if (icon) {
                if (document.body.classList.contains('light-mode')) {
                    icon.classList.replace('fa-moon', 'fa-sun');
                    localStorage.setItem('theme', 'light');
                } else {
                    icon.classList.replace('fa-sun', 'fa-moon');
                    localStorage.setItem('theme', 'dark');
                }
            }
        });
    }


 // --- أ) متغيرات النظام الأساسية ---
let currentUser = null;
let isPro = false;
let userCredits = 0; // إجمالي الرصيد (مجاني + مدفوع)

// --- ب) مراقبة حالة المستخدم (التحقق + النقاط + القائمة) ---
firebase.auth().onAuthStateChanged((user) => {
    const authItem = document.getElementById('authItem');
    const profileItem = document.getElementById('profileItem');
    const adminNav = document.getElementById('adminNav');
    const avatar = document.getElementById('userAvatar');

    if (user) {
        // 1. التحقق من البريد الإلكتروني (إجباري لو سجل بإيميل وباسورد)
        if (!user.emailVerified && user.providerData[0].providerId === 'password') {
            alert("يا هندسة فعل الحساب من الإيميل الأول! تم إرسال رابط التحقق لك.");
            user.sendEmailVerification(); // إعادة إرسال الرابط للتأكيد
            firebase.auth().signOut();
            return;
        }

        currentUser = user;
        
        // إظهار البروفايل وإخفاء زرار الدخول
        if (authItem) authItem.style.display = 'none';
        if (profileItem) {
            profileItem.style.display = 'flex';
            if (avatar) avatar.src = user.photoURL || 'images/default-avatar.png';
        }

        // 2. جلب بيانات المستخدم والنقاط من Firestore
        const userDocRef = db.collection('users').doc(user.uid);
        userDocRef.onSnapshot((doc) => {
            if (!doc.exists) {
                // إنشاء سجل لمستخدم جديد
                userDocRef.set({
                    email: user.email,
                    name: user.displayName || "User",
                    freeCredits: 3,
                    paidCredits: 0,
                    isPro: false,
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                const data = doc.data();
                isPro = data.isPro;
                
                // تحديث الأرقام في القائمة المنسدلة (تأكد من وجود الـ IDs دي في الـ HTML)
                if (document.getElementById('freeLabel')) document.getElementById('freeLabel').innerText = data.freeCredits || 0;
                if (document.getElementById('paidLabel')) document.getElementById('paidLabel').innerText = data.paidCredits || 0;
                
                // تحديث الرصيد الإجمالي للـ UI القديم
                userCredits = (data.freeCredits || 0) + (data.paidCredits || 0);
                updateCreditsUI();

                // التحقق من صلاحيات الأدمن
                if (data.role === 'admin' || user.email === "moayman.work@gmail.com") {
                    if (adminNav) adminNav.style.display = 'block';
                }
            }
        });

    } else {
        // حالة تسجيل الخروج
        currentUser = null;
        userCredits = 0;
        if (authItem) authItem.style.display = 'block';
        if (profileItem) profileItem.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
    }
});

// --- ج) دوال الواجهة (UI) ---

// فتح وقفل القائمة عند الضغط على الصورة
window.toggleMyMenu = function(e) {
    if(e) e.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }
};

// إغلاق القائمة لو ضغطت في أي مكان بره
window.onclick = function() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.style.display = 'none';
};

// تحديث عداد الرصيد المكتوب في الصفحة
function updateCreditsUI() {
    const creditEl = document.getElementById('userCredits');
    if (!creditEl) return;
    if (isPro) {
        creditEl.innerHTML = '<i class="fas fa-infinity"></i> Pro';
        creditEl.style.color = '#00d4ff';
    } else {
        creditEl.innerText = `${userCredits} Credits`;
        creditEl.style.color = userCredits > 0 ? '#ff9800' : '#ff4b4b';
    }
}

// --- د) تسجيل الدخول والخصم ---

// --- د) نظام تسجيل الدخول (المحسن لمنع تداخل النوافذ) ---
// ... الكود اللي قبله (نظام الـ UI والـ Theme)

// --- د) نظام تسجيل الدخول (المحسن لمنع الحجب وتداخل النوافذ) ---
const loginBtn = document.getElementById('loginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. فحص سريع لو العملية شغالة فعلاً
        if (loginBtn.disabled) return;

        const provider = new firebase.auth.GoogleAuthProvider();
        
        // تغيير شكل الزرار
        const originalContent = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loginBtn.disabled = true;

        // 2. محاولة فتح الـ Popup فوراً
        firebase.auth().signInWithPopup(provider)
            .then(() => {
                console.log("تم تسجيل الدخول بنجاح!");
            })
            .catch((error) => {
                console.error("Login Error:", error);

                // 3. لو المتصفح عمل Block للـ Popup، نستخدم الحل البديل فوراً
                if (error.code === 'auth/popup-blocked') {
                    console.warn("Popup blocked! Switching to Redirect...");
                    firebase.auth().signInWithRedirect(provider);
                } 
                else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = originalContent;
                } else {
                    alert("عذراً، حدث خطأ: " + error.message);
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = originalContent;
                }
            })
            .finally(() => {
                if (firebase.auth().currentUser) {
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = originalContent;
                }
            });
    });
}

// ... كمل باقي الكود (دالة خصم الرصيد والأدوات)

// دالة خصم الرصيد الذكية (تخصم من المجاني أولاً)
window.checkAndDeductCredit = async function() {
    if (!currentUser) {
        alert("يرجى تسجيل الدخول أولاً لاستخدام الأدوات.");
        return false;
    }
    if (isPro) return true;

    const userDocRef = db.collection('users').doc(currentUser.uid);
    const doc = await userDocRef.get();
    const data = doc.data();
    let free = data.freeCredits || 0;
    let paid = data.paidCredits || 0;

    if (free > 0) {
        await userDocRef.update({ freeCredits: free - 1 });
        return true;
    } else if (paid > 0) {
        await userDocRef.update({ paidCredits: paid - 1 });
        return true;
    } else {
        alert("لقد نفذ رصيدك (المجاني والمدفوع). يرجى الترقية.");
        return false;
    }
};
    // --- ج) الأدوات والحاسبات (Tools Logic) ---

    // 1. التنقل في القائمة الجانبية (Sidebar)
    const navSubItems = document.querySelectorAll('.nav-sub-item');
    const navHeaders = document.querySelectorAll('.nav-header');
    
    // فتح القوائم الفرعية
    navHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = this.parentElement;
            const subMenu = item.querySelector('.nav-sub');
            
            // إغلاق القوائم الأخرى
            document.querySelectorAll('.nav-item').forEach(i => {
                if(i !== item) {
                    i.classList.remove('open');
                    const sub = i.querySelector('.nav-sub');
                    if(sub) { sub.style.maxHeight = null; sub.style.opacity = "0"; }
                }
            });

            const isOpen = item.classList.toggle('open');
            if(subMenu) {
                if(isOpen) {
                    subMenu.style.visibility = "visible";
                    subMenu.style.opacity = "1";
                    const height = subMenu.scrollHeight;
                    // إصلاح: لو الارتفاع المحسوب 0، نستخدم قيمة ثابتة لضمان فتح القائمة
                    subMenu.style.maxHeight = height > 10 ? height + "px" : "1000px";
                } else {
                    subMenu.style.maxHeight = null;
                    subMenu.style.opacity = "0";
                    setTimeout(() => { if(!item.classList.contains('open')) subMenu.style.visibility = "hidden"; }, 300);
                }
            }
        });
    });

    // اختيار الأداة
    navSubItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-sub-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.tool-view').forEach(view => view.classList.remove('active'));
            
            const toolId = item.getAttribute('data-tool');
            const targetView = document.getElementById(`tool-${toolId}`);
            const activeToolContainer = document.getElementById('active-tool-container');
            const toolTitle = document.getElementById('tool-title');
            const sectionType = document.getElementById('sectionType');

            if (targetView) {
                targetView.classList.add('active');
            } else {
                activeToolContainer.classList.add('active');
            }

            // تحديث العنوان
            const toolName = item.querySelector('span').textContent;
            if(toolTitle) toolTitle.textContent = toolName;

            // ربط الأداة بنوع القطاع
            const toolMap = {
                'rolled-beam': 'IPE', 
                'built-up-beam': 'BEAM_BUILT_UP',
                'built-up-column': 'COLUMN_BUILT_UP',
                'rolled-column': 'HEA',
                'box-section': 'Box'
            };
            
            if(toolMap[toolId] && sectionType) {
                sectionType.value = toolMap[toolId];
                const event = new Event('change');
                sectionType.dispatchEvent(event);
            }
        });
    });

    // 2. حاسبة الاستيل (Steel Calculator)
    const calcBtn = document.getElementById('calculate-btn');
    if(calcBtn) {
        calcBtn.addEventListener('click', () => {
            // التحقق من الرصيد قبل الحساب
            if (typeof window.checkAndDeductCredit === 'function') {
                window.checkAndDeductCredit().then(allowed => {
                    if(allowed) performSteelCalculation();
                });
            } else {
                performSteelCalculation();
            }
        });
    }

    // --- ج.2) منطق القائمة المنسدلة المخصصة (Custom Select Dropdown) ---
    const customSelect = document.querySelector('.custom-select-wrapper');
    if (customSelect) {
        const trigger = customSelect.querySelector('.custom-select-trigger');
        const optionsPanel = customSelect.querySelector('.custom-options');
        const optionsList = customSelect.querySelector('.options-list');
        const hiddenSelect = customSelect.querySelector('#sectionSize');
        const searchInput = customSelect.querySelector('#sectionSearch');

        // فتح/غلق القائمة
        trigger.addEventListener('click', () => {
            customSelect.classList.toggle('open');
        });

        // إغلاق القائمة عند الضغط خارجها
        window.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });

        // اختيار عنصر من القائمة
        optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (option) {
                // إزالة التحديد من العنصر القديم
                const currentlySelected = optionsList.querySelector('.selected');
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                
                // تحديد العنصر الجديد
                option.classList.add('selected');
                trigger.querySelector('span').textContent = option.textContent;
                hiddenSelect.value = option.dataset.value;
                
                // تفعيل حدث 'change' ليتمكن أي كود آخر من الاستماع له
                hiddenSelect.dispatchEvent(new Event('change'));
                
                customSelect.classList.remove('open');
            }
        });

        // البحث داخل القائمة
        searchInput.addEventListener('input', () => {
            const filter = searchInput.value.toLowerCase();
            const allOptions = optionsList.querySelectorAll('.custom-option');
            allOptions.forEach(option => {
                const text = option.textContent.toLowerCase();
                if (text.includes(filter)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            });
        });

        // هذه الدالة يجب أن يتم استدعاؤها من الكود الذي يجلب بيانات القطاعات
        window.updateCustomSelect = (items) => {
            optionsList.innerHTML = ''; // مسح القائمة القديمة
            hiddenSelect.innerHTML = ''; // مسح الـ select المخفي
            
            items.forEach(item => {
                const optionEl = document.createElement('div');
                optionEl.className = 'custom-option';
                optionEl.textContent = item.name; // Assuming item has name/value
                optionEl.dataset.value = item.value;
                optionsList.appendChild(optionEl);

                const nativeOption = new Option(item.name, item.value);
                hiddenSelect.appendChild(nativeOption);
            });
            
            if (items.length > 0) {
                trigger.querySelector('span').textContent = items[0].name;
                hiddenSelect.value = items[0].value;
                optionsList.querySelector('.custom-option')?.classList.add('selected');
            } else {
                trigger.querySelector('span').textContent = '-- Select Size --';
            }
        };
    }

    function performSteelCalculation() {
        const resultDisplay = document.getElementById('calcResult');
        const resultActions = document.getElementById('result-actions');
        
        // نتيجة وهمية للتجربة (يمكنك استبدالها بالمنطق الكامل لاحقاً)
        resultDisplay.innerHTML = `
            <div class="result-header">
                <span style="color: #fff; font-size: 18px;">Analysis Report</span>
                <span class="result-status comp-safe">SAFE</span>
            </div>
            <div style="padding: 10px; color: #ccc;">
                <p>Calculation performed successfully.</p>
                <p><strong>Ratio:</strong> 0.75</p>
            </div>
        `;
        resultDisplay.classList.remove('hidden-result');
        if(resultActions) resultActions.style.display = 'flex';
    }

    // 3. دوال حساب القواعد (ربط الدوال المحلية بالـ Window)
    
    window.calculateFixedBase = function() {
        const M = parseFloat(document.getElementById('fb_M').value) || 0;
        const N = parseFloat(document.getElementById('fb_N').value) || 0;
        const L = parseFloat(document.getElementById('fb_L').value) || 0;
        const B = parseFloat(document.getElementById('fb_B').value) || 0;
        const Fcu = parseFloat(document.getElementById('fb_Fcu').value) || 300;
        
        const resultDiv = document.getElementById('fb_Result');
        const resultHTML = calculateFixedBaseLogic({ M, N, L, B, Fcu });
        
        if(resultDiv) {
            resultDiv.innerHTML = resultHTML;
            resultDiv.classList.remove('hidden-result');
        }
    };

    window.calculateHingedBase = function() {
        const N = parseFloat(document.getElementById('hb_N').value) || 0;
        const L = parseFloat(document.getElementById('hb_L').value) || 0;
        const B = parseFloat(document.getElementById('hb_B').value) || 0;
        const Fcu = parseFloat(document.getElementById('hb_Fcu').value) || 250;
        const grade = document.getElementById('hb_grade').value;
        
        const resultDiv = document.getElementById('hb_Result');
        const resultHTML = calculateHingedBaseLogic({ N, L, B, Fcu, grade });
        
        if(resultDiv) {
            resultDiv.innerHTML = resultHTML;
            resultDiv.classList.remove('hidden-result');
        }
    };

    // --- د) أدوات إضافية (الساعة والسعر) ---
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const [time, ampm] = timeString.split(' ');
        if(document.getElementById('cairoTime')) document.getElementById('cairoTime').innerText = time;
        if(document.getElementById('cairoAmpm')) document.getElementById('cairoAmpm').innerText = ampm;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // سعر الحديد (ثابت مؤقتاً)
    const priceEl = document.getElementById('dailySteelPrice');
    if(priceEl) {
        priceEl.innerText = "49,500"; 
    }

    // --- هـ) نظام البحث (Search System) ---
    const searchTrigger = document.querySelector('.search-trigger-btn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearchBtn = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchCountEl = document.getElementById('searchCount');

    if (searchTrigger && searchOverlay && closeSearchBtn && searchInput) {
        let searchIndex = [];

        // بناء فهرس البحث
        const buildSearchIndex = () => {
            searchIndex = [];
            // فهرسة المهارات
            document.querySelectorAll('.skill-item-group').forEach(el => {
                const title = el.querySelector('.skill-card span')?.textContent.trim();
                if (title) {
                    searchIndex.push({
                        title: title,
                        category: 'Skill',
                        element: el
                    });
                }
            });
            // فهرسة المشاريع
            document.querySelectorAll('#projects .project-card').forEach(el => {
                const title = el.querySelector('h3')?.textContent.trim();
                const description = el.querySelector('p')?.textContent.trim();
                if (title) {
                    searchIndex.push({
                        title: title,
                        category: 'Project',
                        description: description,
                        element: el
                    });
                }
            });
             // فهرسة الشهادات
            document.querySelectorAll('#certificates .project-card').forEach(el => {
                const title = el.querySelector('h3')?.textContent.trim();
                const description = el.querySelector('p')?.textContent.trim();
                if (title) {
                    searchIndex.push({
                        title: title,
                        category: 'Certificate',
                        description: description,
                        element: el
                    });
                }
            });
        };

        // دالة البحث
        const performSearch = (query) => {
            if (!query) {
                searchResultsContainer.innerHTML = '';
                if(searchCountEl) searchCountEl.textContent = '';
                return;
            }
            const lowerQuery = query.toLowerCase();
            const results = searchIndex.filter(item => 
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerQuery))
            );

            searchResultsContainer.innerHTML = '';
            if(searchCountEl) searchCountEl.textContent = `${results.length} results found`;

            if (results.length === 0) {
                searchResultsContainer.innerHTML = '<p style="color: #aaa; text-align: center;">No results found.</p>';
            } else {
                results.forEach(item => {
                    const resultEl = document.createElement('div');
                    resultEl.className = 'search-result-item';
                    resultEl.innerHTML = `<h4>${item.title}</h4><p>${item.category}</p>`;
                    resultEl.addEventListener('click', () => {
                        closeSearch();
                        item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        item.element.classList.add('highlight-target');
                        setTimeout(() => {
                            item.element.classList.remove('highlight-target');
                        }, 2000);
                    });
                    searchResultsContainer.appendChild(resultEl);
                });
            }
        };

        // فتح نافذة البحث
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchIndex.length === 0) buildSearchIndex();
            searchOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            setTimeout(() => searchInput.focus(), 300);
        });

        // إغلاق نافذة البحث
        const closeSearch = () => {
            searchOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        };

        closeSearchBtn.addEventListener('click', closeSearch);
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearch();
        });

        // البحث عند الكتابة
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            if(clearSearchBtn) clearSearchBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(searchInput.value);
            }, 250);
        });

        // وظيفة زر المسح
        if(clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                performSearch('');
                clearSearchBtn.style.display = 'none';
            });
        }
    }

    // --- ح) تفعيل نموذج التواصل (Contact Form) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log("✅ Contact Form Found! Attaching event listener...");

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            console.log("🚀 Form Submitted! Default action prevented.");
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            // تغيير شكل الزر أثناء الإرسال
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            console.log("📦 Data to send:", data);

            // تحديد رابط السيرفر ديناميكياً (عشان يشتغل لوكال أو مرفوع)
            const isLiveServer = window.location.hostname === 'localhost' && (window.location.port === '5500' || window.location.port === '5501');
            const apiEndpoint = isLiveServer ? 'http://localhost:3000/send-email' : '/send-email';

            try {
                console.log(`🌐 Sending fetch request to ${apiEndpoint}...`);
                const response = await fetch(apiEndpoint, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

                if (response.ok) {
                    console.log("✅ Email sent successfully!");
                    
                    // إظهار شاشة التهنئة بدلاً من التنبيه العادي
                    const successOverlay = document.getElementById('successOverlay');
                    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
                    
                    if (successOverlay) {
                        successOverlay.classList.add('active');
                        if(closeSuccessBtn) closeSuccessBtn.onclick = () => successOverlay.classList.remove('active');
                    }
                    
                    contactForm.reset();
                } else {
                    console.error("❌ Server responded with error:", response.status, response.statusText);
                    alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('تعذر الاتصال بالسيرفر. تأكد من تشغيل ملف server.js');
            } finally {
                // استعادة الزر لحالته الأصلية
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
            }
        });
    } else {
        console.error("❌ Error: Contact form element #contactForm not found in DOM!");
    }

    // --- ط) نظام عرض الشهادات الاحترافي (Certificates Lightbox) ---
    const certSection = document.getElementById('certificates');
    if (certSection) {
        // 1. إنشاء المودال (النافذة المنبثقة) ديناميكياً
        const modal = document.createElement('div');
        modal.id = 'certModal'; // إضافة ID للتحكم
        modal.className = 'cert-modal';
        modal.innerHTML = `
            <div class="cert-modal-content">
                <span class="close-cert">&times;</span>
                <img src="" alt="Certificate" class="cert-modal-img">
                <div class="cert-caption"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const modalImg = modal.querySelector('.cert-modal-img');
        const captionText = modal.querySelector('.cert-caption');
        const closeBtn = modal.querySelector('.close-cert');

        // 2. تفعيل المودال عند الضغط على أي كارت شهادة
        certSection.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // لو الضغط على رابط داخل الكارت، متفتحش المودال
                if(e.target.tagName === 'A') return;
                e.stopPropagation(); // منع انتشار الحدث

                const img = this.querySelector('img');
                const title = this.querySelector('h3')?.textContent || '';
                
                if (img) {
                    modal.classList.add('active');
                    modalImg.src = img.src;
                    captionText.textContent = title;
                    document.body.style.overflow = 'hidden'; // منع السكرول في الخلفية
                }
            });
        });

        // 3. إغلاق المودال
        const closeModal = () => { modal.classList.remove('active'); document.body.style.overflow = 'auto'; };
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    // --- ي) عداد المستخدمين أونلاين (Online Users Simulation) ---
    const onlineCountEl = document.getElementById('onlineCount');
    if (onlineCountEl) {
        let count = Math.floor(Math.random() * (25 - 12 + 1) + 12); // رقم عشوائي بين 12 و 25
        onlineCountEl.innerText = count;

        setInterval(() => {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            count += change;
            if (count < 8) count = 8; // الحد الأدنى
            if (count > 45) count = 45; // الحد الأقصى
            onlineCountEl.innerText = count;
        }, 5000); // تحديث كل 5 ثواني
    }

    // --- ك) منطق المدونة (Blog Toggle) ---
    const blogSection = document.querySelector('.blog-section');
    if (blogSection) {
        const blogGrid = blogSection.querySelector('.blog-grid');
        const sectionTitle = blogSection.querySelector('.section-title'); // العنوان "My Engineering Blog"
        
        if (blogGrid && sectionTitle) {
            // إعداد الحالة الأولية
            blogGrid.style.maxHeight = '0';
            blogGrid.style.overflow = 'hidden';
            blogGrid.style.opacity = '0';
            blogGrid.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // إضافة سهم توجيهي للعنوان
            const arrow = document.createElement('i');
            arrow.className = 'fas fa-chevron-down blog-toggle-arrow';
            arrow.style.marginLeft = '10px';
            arrow.style.transition = 'transform 0.3s ease';
            sectionTitle.appendChild(arrow);
            sectionTitle.style.cursor = 'pointer';

            sectionTitle.addEventListener('click', () => {
                const isOpen = blogGrid.style.maxHeight !== '0px';
                
                if (isOpen) {
                    blogGrid.style.maxHeight = '0px';
                    blogGrid.style.opacity = '0';
                    arrow.style.transform = 'rotate(0deg)';
                } else {
                    blogGrid.style.maxHeight = blogGrid.scrollHeight + 500 + 'px'; // مساحة كافية
                    blogGrid.style.opacity = '1';
                    arrow.style.transform = 'rotate(180deg)';
                    
                    // تحريك العناصر للأسفل بسلاسة
                    setTimeout(() => {
                        blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                }
            });
        }
    }

    // --- ل) منطق المكتبة (Library Load More) ---
    const libraryGrid = document.querySelector('.library-grid');
    if (libraryGrid) {
        // إضافة الكتب الجديدة من روابط Drive
        const newBooks = [
            { url: "https://drive.google.com/file/d/1NrppUvp3TbiBwZITCzPJk-yhInB_zI5l/view?usp=sharing", title: "Engineering Book 1" },
            { url: "https://drive.google.com/file/d/1uQ1XkPv2JXM1Nnkn2sWhqujZP8L6Qa18/view?usp=drive_link", title: "Engineering Book 2" },
            { url: "https://drive.google.com/file/d/1iAbpIH6JsF6fJdJYLITiJ8688uGTcCkS/view?usp=drive_link", title: "Engineering Book 3" },
            { url: "https://drive.google.com/file/d/1x2sIOPoJ7rDGvS5eqeT8zncMxC4L0wZv/view?usp=drive_link", title: "Engineering Book 4" },
            { url: "https://drive.google.com/file/d/1Cj8Zt0kZ4r_tOVtN-V1XlCh3aElG6fp_/view?usp=drive_link", title: "Engineering Book 5" },
            { url: "https://drive.google.com/file/d/1GIQ_0lS2atH_BIsU-_ZCJ0yYDhSLgXk6/view?usp=drive_link", title: "Engineering Book 6" },
            { url: "https://drive.google.com/file/d/1aed1tkcZw2vuXB1Iq1nrq2Tt91MPF7vA/view?usp=drive_link", title: "Engineering Book 7" }
        ];

        newBooks.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-card';
            div.setAttribute('data-category', 'Engineering');
            div.setAttribute('data-book-url', book.url);
            div.innerHTML = `
                <div class="book-cover">
                    <img src="https://via.placeholder.com/100x140?text=PDF" alt="${book.title}">
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <div class="book-author">PDF Document</div>
                    <div class="book-desc">Click to download or read.</div>
                    <div class="book-progress">
                        <label>Reading Progress <span class="progress-val">0%</span></label>
                        <input type="range" class="progress-range" value="0" min="0" max="100">
                    </div>
                </div>
            `;
            libraryGrid.appendChild(div);
        });

        const books = libraryGrid.querySelectorAll('.book-card');
        const limit = 3; // عدد الكتب الظاهرة مبدئياً
        
        if (books.length > limit) {
            // إخفاء الكتب الزائدة
            books.forEach((book, index) => {
                if (index >= limit) book.style.display = 'none';
            });

            // إنشاء زر "عرض المزيد"
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.innerText = 'Show More Books';
            loadMoreBtn.className = 'btn-glass btn-orange';
            loadMoreBtn.style.margin = '30px auto';
            loadMoreBtn.style.display = 'block';
            
            loadMoreBtn.addEventListener('click', () => {
                books.forEach(book => {
                    book.style.display = 'flex'; // أو block حسب التصميم
                    book.classList.add('animate__animated', 'animate__fadeInUp');
                });
                loadMoreBtn.style.display = 'none'; // إخفاء الزر بعد العرض
            });

            libraryGrid.after(loadMoreBtn);
        }
    }

// --- م) إضافة رأي العميل (Testimonial Submission) ---
    window.openTestimonialForm = function() {
        const review = prompt("Please enter your review:");
        if (review) {
            const name = prompt("Your Name:");
            if (name && db) {
                db.collection('testimonials').add({
                    name: name,
                    review: review,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    approved: false 
                }).then(() => {
                    alert("Thank you! Your review has been submitted for approval.");
                }).catch((error) => {
                    console.error("Error adding review: ", error);
                    alert("Error submitting review.");
                });
            }
        }
    };
}); // <--- تأكد إن ده هو آخر سطر في الملف ومفيش بعده أي حاجة

