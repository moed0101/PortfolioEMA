document.addEventListener('DOMContentLoaded', function() {
    // 1. تأثير الكتابة (Typewriter Effect) للنص الظاهر
    const textToType = "أؤمن بأن الجودة ليست مجرد كلمة؛ هي التزام يومي يدفعني للتميز في كل مشروع أعمله.";
    const typeWriterElement = document.querySelector('.type-writer-text');
    
    if (typeWriterElement) {
        let i = 0;
        // إضافة مؤشر الكتابة
        typeWriterElement.style.borderLeft = "2px solid var(--primary-color)";
        typeWriterElement.style.paddingLeft = "5px";

        function typeWriter() {
            if (i < textToType.length) {
                typeWriterElement.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 40); // سرعة الكتابة
            } else {
                typeWriterElement.style.borderLeft = "none"; // إزالة المؤشر بعد الانتهاء
            }
        }
        setTimeout(typeWriter, 1000);
    }

    // 2. زر Read More / Read Less مع حركة ناعمة
    const readMoreBtn = document.getElementById('readMoreBtn');
    const bioWrapper = document.getElementById('bioWrapper');
    const bioText = document.querySelector('.bio-hidden'); 
    const readingTimeEl = document.getElementById('readingTime');

    if(readMoreBtn && bioWrapper && bioText) {
        // حساب وقت القراءة
        const textContent = bioText.textContent || bioText.innerText;
        const wordCount = textContent.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); 
        if(readingTimeEl) readingTimeEl.textContent = `⏱️ ${readingTime} min read`;

        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            if (bioWrapper.style.maxHeight === '0px' || bioWrapper.style.maxHeight === '') {
                bioWrapper.style.padding = "20px";
                bioWrapper.classList.add('bio-pulse'); 
                
                bioWrapper.style.maxHeight = (bioWrapper.scrollHeight + 50) + "px"; 
                bioWrapper.style.opacity = "1";
                
                bioText.style.animation = "none"; 
                bioText.offsetHeight; 
                bioText.style.animation = "fadeInUpText 1s ease forwards";

                readMoreBtn.textContent = "Read Less";
                if(readingTimeEl) {
                    readingTimeEl.style.display = "inline-block";
                    setTimeout(() => readingTimeEl.style.opacity = "1", 100);
                }
            } else {
                bioWrapper.style.maxHeight = "0px";
                bioWrapper.style.opacity = "0";
                bioWrapper.style.padding = "0px"; 
                bioWrapper.classList.remove('bio-pulse'); 
                
                readMoreBtn.textContent = "Read More";
                if(readingTimeEl) {
                    readingTimeEl.style.opacity = "0";
                    setTimeout(() => readingTimeEl.style.display = "none", 500);
                }
            }
        });
    }

    // 3. منطق الأسئلة الشائعة (FAQ Accordion)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if(question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // إغلاق جميع العناصر الأخرى
                faqItems.forEach(i => {
                    i.classList.remove('active');
                    const ans = i.querySelector('.faq-answer');
                    if(ans) ans.style.maxHeight = null;
                });

                // فتح العنصر الحالي إذا لم يكن مفتوحاً
                if (!isActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.faq-answer');
                    if(answer) answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });

    // 3.5 منطق زر المشاركة في FAQ
    document.querySelectorAll('.share-faq-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // منع فتح الأكورديون عند الضغط على زر المشاركة
            
            const item = btn.closest('.faq-item');
            const question = item.querySelector('h4').innerText;
            const answer = item.querySelector('.faq-answer p').innerText;
            const shareText = `Q: ${question}\n\nA: ${answer}\n\nShared from Eng. Mohamed Ayman Portfolio`;

            if (navigator.share) {
                try {
                    await navigator.share({ title: 'FAQ Answer', text: shareText, url: window.location.href });
                } catch (err) { console.log('Share canceled'); }
            } else {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText)
                        .then(() => alert('تم نسخ السؤال والإجابة للحافظة!'))
                        .catch(() => alert('فشل النسخ التلقائي، يرجى النسخ يدوياً.'));
                } else {
                    alert('المشاركة غير مدعومة في هذا المتصفح.');
                }
            }
        });
    });

    // 4. منطق نافذة التقييم (Review Modal)
    const reviewModal = document.getElementById('reviewModal');
    const openReviewBtn = document.getElementById('openReviewModal');
    const closeReviewBtn = document.getElementById('closeReviewModal');
    const stars = document.querySelectorAll('.rating-input .stars i');
    const ratingValue = document.getElementById('ratingValue');

    if(openReviewBtn && reviewModal) {
        openReviewBtn.addEventListener('click', () => reviewModal.classList.add('active'));
        if(closeReviewBtn) closeReviewBtn.addEventListener('click', () => reviewModal.classList.remove('active'));
        reviewModal.addEventListener('click', (e) => {
            if(e.target === reviewModal) reviewModal.classList.remove('active');
        });

        // تفاعل النجوم
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                if(ratingValue) ratingValue.value = index + 1;
                stars.forEach((s, i) => {
                    if(i <= index) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }

    // 5. منطق المدونة (Blog Modal Logic)
    const blogModal = document.getElementById('blogModal');
    const closeBlogBtn = document.getElementById('closeBlogModal');
    const printArticleBtn = document.getElementById('printArticleBtn');
    const savePdfBtn = document.getElementById('savePdfBtn');
    
    // بيانات المقالات (يمكنك تعديل المحتوى هنا)
    const blogPosts = {
        1: {
            title: "The Future of BIM in Egypt",
            date: "Oct 15, 2025",
            category: "BIM Technology",
            image: "https://via.placeholder.com/800x400/1a2a33/ffffff?text=BIM+Future",
            content: `
                <p>نمذجة معلومات البناء (BIM) لم تعد مجرد رفاهية في سوق البناء المصري، بل أصبحت ضرورة ملحة للمشاريع الكبرى. في السنوات الأخيرة، شهدنا توجهاً حكومياً قوياً نحو التحول الرقمي في قطاع التشييد.</p>
                <h4>لماذا الـ BIM الآن؟</h4>
                <p>يساعد الـ BIM في تقليل الهدر في المواد بنسبة تصل إلى 20%، واكتشاف التعارضات (Clash Detection) قبل البدء في التنفيذ، مما يوفر الملايين من الجنيهات.</p>
                <h4>التحديات والفرص</h4>
                <p>رغم التقدم، لا تزال هناك تحديات تتعلق بتكلفة البرمجيات وتدريب الكوادر. لكن مع تزايد عدد المهندسين المتقنين لبرامج مثل Revit و Tekla، أصبح المستقبل واعداً جداً.</p>
            `
        },
        2: {
            title: "Optimizing Steel Connections",
            date: "Sep 22, 2025",
            category: "Steel Design",
            image: "https://via.placeholder.com/800x400/1a2a33/ffffff?text=Steel+Connections",
            content: `
                <p>تصميم الوصلات المعدنية هو الفن الذي يجمع بين الأمان والاقتصاد. استخدام برامج مثل IDEA StatiCa أحدث ثورة في كيفية تحليل الوصلات المعقدة.</p>
                <h4>أهمية الـ CBFEM</h4>
                <p>طريقة العناصر المحدودة المعتمدة على المكونات (CBFEM) تتيح لنا فهم توزيع الإجهادات داخل الوصلة بدقة متناهية، بدلاً من الاعتماد على المعادلات التقريبية القديمة.</p>
                <p>في هذا المقال، نستعرض دراسة حالة لوصلة Moment Connection تعرضت لأحمال زلازل وكيف تم تحسينها لتقليل وزن الحديد المستخدم.</p>
            `
        },
        3: {
            title: "Automating Structural Analysis",
            date: "Aug 10, 2025",
            category: "Engineering Coding",
            image: "https://via.placeholder.com/800x400/1a2a33/ffffff?text=Automation",
            content: `
                <p>لماذا نقضي ساعات في مهام مكررة بينما يمكن للبرمجة القيام بها في ثوانٍ؟ استخدام Python و C# مع واجهات برمجة التطبيقات (API) لبرامج مثل ETABS و Tekla هو المستقبل.</p>
                <h4>أمثلة عملية</h4>
                <ul>
                    <li>استخراج ردود الأفعال (Reactions) تلقائياً لتصميم القواعد.</li>
                    <li>نمذجة المنشآت النمطية (Warehouses) بضغطة زر.</li>
                </ul>
                <p>الأتمتة لا تستبدل المهندس، بل تمنحه الوقت للتركيز على الإبداع وحل المشكلات المعقدة.</p>
            `
        }
    };

    document.querySelectorAll('.read-blog-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const post = blogPosts[id];
            
            if(post && blogModal) {
                blogModal.querySelector('.blog-modal-title').textContent = post.title;
                blogModal.querySelector('.blog-modal-date').innerHTML = `<i class="far fa-calendar-alt"></i> ${post.date}`;
                blogModal.querySelector('.blog-modal-category').innerHTML = `<i class="far fa-folder"></i> ${post.category}`;
                blogModal.querySelector('.blog-modal-image').src = post.image;
                blogModal.querySelector('.blog-modal-body').innerHTML = post.content;
                
                blogModal.classList.add('active');

                // زيادة عداد المشاهدات بشكل وهمي
                const viewCountEl = btn.closest('.blog-content').querySelector('.view-count');
                if(viewCountEl) {
                    let currentViews = parseInt(viewCountEl.getAttribute('data-base')) || 0;
                    // زيادة عشوائية بين 1 و 5
                    let newViews = currentViews + Math.floor(Math.random() * 5) + 1;
                    viewCountEl.setAttribute('data-base', newViews);
                    viewCountEl.innerText = newViews > 1000 ? (newViews/1000).toFixed(1) + 'k' : newViews;
                }
            }
        });
    });

    if(closeBlogBtn) {
        closeBlogBtn.addEventListener('click', () => blogModal.classList.remove('active'));
    }
    
    // إغلاق المودال عند الضغط خارجه
    if(blogModal) {
        blogModal.addEventListener('click', (e) => {
            if(e.target === blogModal) blogModal.classList.remove('active');
        });
    }

    // 6. زر مشاركة المقال (Share Article Button)
    const shareArticleBtn = document.getElementById('shareArticleBtn');
    if(shareArticleBtn) {
        shareArticleBtn.addEventListener('click', async () => {
            const title = document.querySelector('.blog-modal-title').innerText;
            const text = `Check out this article: "${title}" by Eng. Mohamed Ayman.\n${window.location.href}`;
            
            if (navigator.share) {
                try {
                    await navigator.share({ title: title, text: text, url: window.location.href });
                } catch (err) { console.log('Share canceled'); }
            } else {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text)
                        .then(() => alert('Article link copied to clipboard!'))
                        .catch(() => alert('Failed to copy link.'));
                } else {
                    alert('Sharing is not supported on this browser.');
                }
            }
        });
    }

    // 7. زر طباعة المقال (Print Article Button)
    if(printArticleBtn) {
        printArticleBtn.addEventListener('click', () => {
            const title = document.querySelector('.blog-modal-title').innerText;
            const content = document.querySelector('.blog-modal-body').innerHTML;
            const image = document.querySelector('.blog-modal-image').src;
            
            // إنشاء iframe مخفي للطباعة (أفضل من فتح نافذة جديدة)
            let printFrame = document.getElementById('printFrame');
            if (!printFrame) {
                printFrame = document.createElement('iframe');
                printFrame.id = 'printFrame';
                printFrame.style.display = 'none';
                document.body.appendChild(printFrame);
            }

            const doc = printFrame.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 20px; }
                        img { max-width: 100%; height: auto; margin-bottom: 20px; border-radius: 5px; }
                        h1 { color: #000; border-bottom: 2px solid #ff9800; padding-bottom: 10px; margin-bottom: 20px; }
                        p { line-height: 1.6; color: #333; font-size: 14pt; text-align: justify; }
                        h4 { color: #ff9800; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <img src="${image}" />
                    ${content}
                    <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">
                        Printed from Eng. Mohamed Ayman Portfolio
                    </div>
                </body>
                </html>
            `);
            doc.close();

            // انتظار تحميل الصور ثم الطباعة
            printFrame.contentWindow.focus();
            setTimeout(() => {
                printFrame.contentWindow.print();
            }, 500);
        });
    }

    // 8. زر حفظ كـ PDF (Save as PDF Button)
    if(savePdfBtn) {
        savePdfBtn.addEventListener('click', () => {
            const element = document.querySelector('.blog-modal-content');
            const opt = {
                margin:       10,
                filename:     'article.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true }, // useCORS مهم للصور
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // إخفاء الأزرار مؤقتاً قبل التحويل
            const btns = element.querySelectorAll('button, .close-modal-btn');
            btns.forEach(b => b.style.display = 'none');

            html2pdf().set(opt).from(element).save().then(() => {
                // إعادة إظهار الأزرار بعد التحميل
                btns.forEach(b => b.style.display = '');
            });
        });
    }

    // 9. منطق فتح تفاصيل الكتاب (Book View Modal)
    const bookViewModal = document.getElementById('bookViewModal');
    const closeBookViewBtn = document.getElementById('closeBookViewModal');
    const bookCardsForClick = document.querySelectorAll('.book-card');

    if (bookViewModal && bookCardsForClick.length > 0) {
        bookCardsForClick.forEach(card => {
            card.addEventListener('click', () => {
                const coverSrc = card.querySelector('.book-cover img').src;
                const title = card.querySelector('.book-info h3').innerText;
                const author = card.querySelector('.book-author').innerText;
                const desc = card.querySelector('.book-desc').innerText;
                const bookUrl = card.getAttribute('data-book-url');

                // تعبئة البيانات في المودال
                document.getElementById('modalBookCover').src = coverSrc;
                document.getElementById('modalBookTitle').innerText = title;
                document.getElementById('modalBookAuthor').innerText = author;
                document.getElementById('modalBookDesc').innerText = desc;
                
                const downloadBtn = document.getElementById('modalBookDownload');
                if (bookUrl && bookUrl !== '#') {
                    downloadBtn.href = bookUrl;
                    downloadBtn.style.display = 'inline-flex';
                    downloadBtn.style.pointerEvents = 'auto'; // إصلاح المشكلة: إعادة تفعيل الزر
                    downloadBtn.innerHTML = 'Download / Read <i class="fas fa-file-pdf" style="margin-left: 8px;"></i>';
                } else {
                    downloadBtn.href = '#';
                    downloadBtn.innerHTML = 'Not Available Yet <i class="fas fa-lock" style="margin-left: 8px;"></i>';
                    downloadBtn.style.pointerEvents = 'none';
                    downloadBtn.style.opacity = '0.6';
                }

                bookViewModal.classList.add('active');
            });
        });

        if(closeBookViewBtn) {
            closeBookViewBtn.addEventListener('click', () => bookViewModal.classList.remove('active'));
        }
        
        bookViewModal.addEventListener('click', (e) => {
            if (e.target === bookViewModal) bookViewModal.classList.remove('active');
        });
    }

    // 10. منطق البحث في الكتب (Book Search)
    const bookSearchInput = document.getElementById('bookSearchInput');
    if(bookSearchInput) {
        bookSearchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            document.querySelectorAll('.book-card').forEach(card => {
                const title = card.querySelector('h3').innerText.toLowerCase();
                const author = card.querySelector('.book-author').innerText.toLowerCase();
                if(title.includes(val) || author.includes(val)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 11. منطق شريط تقدم القراءة (Reading Progress)
    document.querySelectorAll('.progress-range').forEach(range => {
        // تحديد مفتاح فريد للكتاب (العنوان) لحفظ التقدم
        const card = range.closest('.book-card');
        const bookTitle = card ? card.querySelector('h3')?.innerText.trim() : null;
        const storageKey = bookTitle ? `reading_progress_${bookTitle}` : null;
        const label = range.previousElementSibling ? range.previousElementSibling.querySelector('.progress-val') : null;

        // أ) استرجاع القيمة المحفوظة عند التحميل
        if (storageKey) {
            const savedVal = localStorage.getItem(storageKey);
            if (savedVal !== null) {
                range.value = savedVal;
                if (label) label.innerText = savedVal + '%';
            }
        }

        // ب) حفظ القيمة عند التغيير
        range.addEventListener('input', (e) => {
            const val = e.target.value;
            if(label) label.innerText = val + '%';
            
            if (storageKey) {
                localStorage.setItem(storageKey, val);
            }
        });
    });
});

// 5. إخفاء شاشة التحميل عند اكتمال تحميل الصفحة
window.addEventListener('load', () => {
    const loader = document.getElementById('about-loader');
    // منع السكرول أثناء التحميل
    document.body.style.overflow = 'hidden';

    const quoteEl = document.getElementById('loaderQuote');
    
    // قائمة المقولات التحفيزية والهندسية
    const quotes = [
        "“إن لم تفشل فأنت لم تحاول.”",
        "“لكي تحصل على شيء لم يسبق لك أن ملكته، يجب أن تفعل أشياء لم يسبق لك فعلها.”",
        "“سرعتك ليست مهمة إذا كنت تسير في الاتجاه الخطأ.”"
    ];

    if(quoteEl) {
        // اختيار مقولة عشوائية
        quoteEl.innerText = quotes[Math.floor(Math.random() * quotes.length)];
    }

    if (loader) {
        // زيادة الوقت قليلاً (2.5 ثانية) ليتمكن الزائر من قراءة المقولة
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto'; // إعادة تفعيل السكرول
        }, 1500); // تقليل الزمن إلى 1.5 ثانية
    }

    // 7. منطق فلاتر المكتبة (Library Filters)
    const libFilterBtns = document.querySelectorAll('.library-filters .filter-btn');
    const bookCards = document.querySelectorAll('.book-card');

    if(libFilterBtns.length > 0 && bookCards.length > 0) {
        libFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // إزالة الكلاس النشط من الجميع
                libFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                bookCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || filter === category) {
                        card.style.display = 'flex';
                        // إعادة تشغيل الأنميشن
                        card.style.animation = 'none';
                        card.offsetHeight; /* trigger reflow */
                        card.style.animation = 'fadeInUpText 0.5s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 8. منطق نافذة اقتراح كتاب (Suggest Book Modal)
    const suggestBookModal = document.getElementById('suggestBookModal');
    const openSuggestBookBtn = document.getElementById('openSuggestBookModal');
    const closeSuggestBookBtn = document.getElementById('closeSuggestBookModal');
    const suggestBookForm = document.getElementById('suggestBookForm');

    if (openSuggestBookBtn && suggestBookModal) {
        openSuggestBookBtn.addEventListener('click', () => suggestBookModal.classList.add('active'));
        if(closeSuggestBookBtn) closeSuggestBookBtn.addEventListener('click', () => suggestBookModal.classList.remove('active'));
        
        suggestBookModal.addEventListener('click', (e) => {
            if (e.target === suggestBookModal) suggestBookModal.classList.remove('active');
        });

        if(suggestBookForm) {
            suggestBookForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const title = document.getElementById('bookTitle').value;
                const author = document.getElementById('bookAuthor').value;
                const email = document.getElementById('bookSuggesterEmail').value;
                const submitBtn = suggestBookForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;

                // Validation: Check title length
                if (title.trim().length < 3) {
                    alert("Please enter a valid book title (at least 3 characters).");
                    return;
                }

                // تغيير شكل الزر أثناء الإرسال
                submitBtn.innerText = 'Sending...';
                submitBtn.disabled = true;

                // تجهيز البيانات للإرسال
                const data = {
                    name: "Website Visitor (Book Suggestion)",
                    email: email || "no-reply@portfolio.com", // استخدام الإيميل المدخل أو الافتراضي
                    message: `New Book Suggestion:\n\nTitle: ${title}\nAuthor: ${author || 'Not specified'}\nSuggester Email: ${email || 'Not provided'}`
                };

                // تحديد رابط السيرفر (نفس المنطق المستخدم في script.js)
                const isLiveServer = window.location.hostname === 'localhost' && (window.location.port === '5500' || window.location.port === '5501');
                const apiEndpoint = isLiveServer ? 'http://localhost:3000/send-email' : '/send-email';

                try {
                    const response = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        // إخفاء الفورم وإظهار رسالة النجاح
                        suggestBookForm.style.display = 'none';
                        document.querySelector('#suggestBookModal h3').style.display = 'none';
                        document.getElementById('suggestSuccessMsg').style.display = 'block';
                        suggestBookForm.reset();
                    } else {
                        alert('Error sending suggestion. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Could not connect to server. Make sure server.js is running.');
                } finally {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        // دالة لإعادة تهيئة المودال (إظهار الفورم وإخفاء رسالة النجاح)
        const resetSuggestModal = () => {
            suggestBookForm.style.display = 'block';
            const modalTitle = suggestBookModal.querySelector('h3');
            if(modalTitle) modalTitle.style.display = 'block';
            const successMsg = document.getElementById('suggestSuccessMsg');
            if(successMsg) successMsg.style.display = 'none';
        };

        // إعادة التهيئة عند الإغلاق (بعد انتهاء أنميشن الاختفاء)
        if(closeSuggestBookBtn) {
            closeSuggestBookBtn.addEventListener('click', () => setTimeout(resetSuggestModal, 300));
        }
        
        suggestBookModal.addEventListener('click', (e) => {
            if (e.target === suggestBookModal) setTimeout(resetSuggestModal, 300);
        });

        // زر "اقتراح كتاب آخر"
        const suggestAnotherBtn = document.getElementById('suggestAnotherBtn');
        if(suggestAnotherBtn) {
            suggestAnotherBtn.addEventListener('click', (e) => {
                e.preventDefault();
                resetSuggestModal();
            });
        }
    }
});