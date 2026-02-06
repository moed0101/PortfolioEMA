document.addEventListener('DOMContentLoaded', () => {
    // التأكد من أن ملف البيانات محمل
    if (typeof sectionsData === 'undefined') {
        console.error("خطأ: ملف sections-db.js لم يتم تحميله بشكل صحيح!");
        return;
    }

    const sectionType = document.getElementById('sectionType');
    const sectionSize = document.getElementById('sectionSize');
    const calcBtn = document.querySelector('.calculate-btn');
    const reportArea = document.getElementById('report-area');

    // 1. تحديث قائمة المقاسات فور اختيار النوع
    if (sectionType && sectionSize) {
        sectionType.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            // البحث في قاعدة البيانات عن المفتاح المختار
            const sizes = sectionsData[selectedValue] || [];
            
            sectionSize.innerHTML = '<option value="">-- اختر المقاس --</option>';
            sizes.forEach(size => {
                const opt = document.createElement('option');
                opt.value = size;
                opt.textContent = size;
                sectionSize.appendChild(opt);
            });
            console.log("تم تحديث المقاسات لـ: " + selectedValue);
        });
    }

    // 2. معالج زر الحساب والتقرير
    if (calcBtn) {
        calcBtn.onclick = function() {
            const axial = parseFloat(document.getElementById('axialLoad')?.value) || 0;
            
            // جلب قيمة الحديد المختار من الكروت
            const materialGradeRadio = document.querySelector('input[name="materialGrade"]:checked');
            const materialGrade = materialGradeRadio ? materialGradeRadio.value : "37";
            
            // تحديد قيمة Fy
            let Fy = materialGrade == "37" ? 2.4 : (materialGrade == "44" ? 2.8 : 3.6);

            if (!sectionSize.value) {
                alert("برجاء اختيار مقاس القطاع أولاً");
                return;
            }

            // الحسابات باستخدام Fy الحقيقية
            const asdResult = (axial * 1.67 / Fy).toFixed(2); 
            const lrfdResult = (axial * 1.2 / Fy).toFixed(2);

            // إنشاء التقرير
            const reportHTML = `
                <div class="report-box glass animate__animated animate__fadeInUp" style="margin-top:20px; padding:20px; border:1px solid #ff9800; border-radius:10px;">
                    <h4 style="color:#ff9800;">Engineering Analysis Report</h4>
                    <p>Section: <b>${sectionSize.value}</b> | Steel: <b>St ${materialGrade}</b></p>
                    <div class="comparison-container" style="display:flex; gap:20px; margin-top:15px;">
                        <div style="flex:1; background:rgba(255,152,0,0.1); padding:10px; border-radius:5px; text-align:center;">
                            <p style="font-size:12px; color:#aaa;">ASD Method</p>
                            <strong>${asdResult} t</strong>
                        </div>
                        <div style="flex:1; background:rgba(0,212,255,0.1); padding:10px; border-radius:5px; text-align:center;">
                            <p style="font-size:12px; color:#aaa;">LRFD Method</p>
                            <strong>${lrfdResult} t</strong>
                        </div>
                    </div>
                    <p style="margin-top:10px; font-size:14px; color:#ddd;">💡 استخدام LRFD يوفر وزن أكثر في هذه الحالة.</p>
                </div>
            `;
            
            if (reportArea) {
                reportArea.innerHTML = reportHTML;
                reportArea.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
});