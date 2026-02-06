/**
 * Calculates the design for a hinged base plate.
 *
 * @param {object} params
 * @param {number} params.N - Axial load N in tons.
 * @param {number} params.L - Base plate length in cm.
 * @param {number} params.B - Base plate width in cm.
 * @param {number} params.Fcu - Concrete characteristic strength in kg/cm².
 * @param {string} params.grade - Steel grade ("37", "44", "52").
 * @returns {string} HTML result string.
 */
export function calculateHingedBase({ N = 0, L = 0, B = 0, Fcu = 250, grade = "52" }) {
    if (L <= 0 || B <= 0) {
        return '<span style="color: #ff4b4b;">Please enter valid dimensions (L, B).</span>';
    }

    const fy = (grade === "37") ? 2.4 : (grade === "44" ? 2.8 : 3.6);
    
    const area = L * B;
    const actualStress = (N * 1000) / area;
    const allowStress = 0.3 * Fcu;
    
    // Assumptions for column dimensions (approximate for calculation)
    const h_col = 25; 
    const b_col = 30; 
    
    const m = (L - 0.95 * h_col) / 2;
    const n = (B - 0.8 * b_col) / 2;
    const cantilever = Math.max(m, n);
    
    const M_plate = (actualStress * Math.pow(cantilever, 2)) / 2;
    const t_req = Math.sqrt((6 * M_plate / 1000) / (0.58 * fy));

    const status = actualStress <= allowStress ? "SAFE" : "UNSAFE";
    const color = status === "SAFE" ? "#25D366" : "#ff4b4b";

    return `
        <div class="result-header"><span style="color:#fff">Hinged Base Report</span> <span class="status-badge" style="background:${color}20; color:${color}">${status}</span></div>
        <div class="table-responsive" style="margin-top:10px; border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
            <table class="admin-table" style="margin:0;">
                <tr><td>Bearing Stress</td><td style="color:${color}; font-weight:bold;">${actualStress.toFixed(2)} kg/cm²</td><td>Allow: ${allowStress.toFixed(2)}</td></tr>
                <tr><td>Cantilever (m, n)</td><td>${m.toFixed(2)} cm, ${n.toFixed(2)} cm</td><td>Max: ${cantilever.toFixed(2)} cm</td></tr>
                <tr><td>Req. Thickness (tp)</td><td style="color:#ff9800; font-weight:bold;">${(t_req*10).toFixed(1)} mm</td><td>Based on St. ${grade}</td></tr>
            </table>
        </div>
    `;
}