// 1. إعدادات Firebase (نفس الموجودة في script.js)
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
const auth = firebase.auth();
const db = firebase.firestore();

// 2. التحقق من الصلاحيات عند التحميل
auth.onAuthStateChanged(user => {
    if (user) {
        // التحقق مما إذا كان المستخدم هو الأدمن
        db.collection('users').doc(user.uid).get().then(doc => {
            const data = doc.data();
            // السماح فقط للأدمن أو الإيميل المحدد
            if (doc.exists && (data.role === 'admin' || user.email === "moayman.work@gmail.com")) {
                loadUsers(); // تحميل البيانات لو أدمن
            } else {
                alert("Access Denied: Admins only area.");
                window.location.href = "index.html";
            }
        }).catch(err => {
            console.error("Auth Error:", err);
            window.location.href = "index.html";
        });
    } else {
        window.location.href = "index.html"; // تحويل لصفحة الدخول لو مش مسجل
    }
});

// 3. دالة جلب المستخدمين وعرضهم في الجدول
function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Loading users... <i class="fas fa-spinner fa-spin"></i></td></tr>';

    db.collection('users').orderBy('createdAt', 'desc').get().then(snapshot => {
        tbody.innerHTML = '';
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found.</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const user = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:bold; color: #fff;">${user.name || 'No Name'}</td>
                <td style="color: #a8b2d1;">${user.email}</td>
                <td>
                    <input type="number" id="free-${doc.id}" value="${user.freeCredits || 0}" 
                           style="width: 70px; padding: 5px; border-radius: 5px; border: 1px solid #444; background: #1a2a33; color: #ff9800; text-align: center;">
                </td>
                <td>
                    <input type="number" id="paid-${doc.id}" value="${user.paidCredits || 0}" 
                           style="width: 70px; padding: 5px; border-radius: 5px; border: 1px solid #444; background: #1a2a33; color: #25d366; text-align: center;">
                </td>
                <td><span class="badge-count" style="background: ${user.role === 'admin' ? '#ff4b4b' : '#444'};">${user.role || 'user'}</span></td>
                <td>
                    <button onclick="updateUserCredits('${doc.id}')" class="btn-glass btn-orange" style="padding: 5px 15px; font-size: 12px; min-height: auto;">
                        <i class="fas fa-save"></i> Save
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }).catch(err => {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #ff4b4b;">Error loading data.</td></tr>';
    });
}

// 4. دالة تحديث الرصيد
window.updateUserCredits = function(userId) {
    const freeVal = parseInt(document.getElementById(`free-${userId}`).value) || 0;
    const paidVal = parseInt(document.getElementById(`paid-${userId}`).value) || 0;

    db.collection('users').doc(userId).update({
        freeCredits: freeVal,
        paidCredits: paidVal
    }).then(() => {
        alert("User credits updated successfully! ✅");
    }).catch(err => {
        alert("Error updating: " + err.message);
    });
};

// 5. البحث في الجدول
document.getElementById('searchUser').addEventListener('input', function(e) {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});