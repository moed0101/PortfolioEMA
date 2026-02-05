/**
 * Calculates the design for a fixed base plate based on provided loads and dimensions.
 * This logic is based on the formulas from "FIXED BASE (rev.2.10).csv".
 *
 * @param {object} params - The input parameters for the calculation.
 * @param {number} params.M - Moment M in m.t.
 * @param {number} params.N - Axial load N in tons.
 * @param {number} params.L - Base plate length in cm.
 * @param {number} params.B - Base plate width in cm.
 * @param {number} params.Fcu - Concrete characteristic strength in kg/cm².
 * @returns {string} An HTML string representing the calculation result report.
 */
export function calculateFixedBase({ M = 0, N = 0, L = 0, B = 0, Fcu = 300 }) {
    if (L <= 0 || B <= 0 || N <= 0) {
        return '<span style="color: #ff4b4b;">Please enter valid Moment (M), Axial (N), Length (L), and Width (B).</span>';
    }

    const e = (M * 100) / N;
    const limit = L / 6;

    let f_max = 0;
    let T_bolt = 0;

    if (e <= limit) {
        // Small Eccentricity
        const Area = L * B;
        const Z = (B * L * L) / 6;
        f_max = (N * 1000 / Area) + (M * 100000 / Z);
    } else {
        // Big Eccentricity
        const cover = 5; // Assuming a constant cover of 5 cm for anchor bolts
        T_bolt = ((M * 100) - (N * (L / 2 - cover))) / (L - 2 * cover);
        const C = N + T_bolt;
        // Approximation for the length of the compression block 'a'
        const a = 0.55 * L;
        f_max = (2 * C * 1000) / (B * a);
    }

    const f_allow = 0.3 * Fcu;
    const statusConc = f_max <= f_allow ? "SAFE" : "UNSAFE";
    const colorConc = statusConc === "SAFE" ? "#25D366" : "#ff4b4b";

    // Return the result as an HTML string
    return `
        <div class="result-header"><span style="color:#fff">Fixed Base Report</span> <span class="status-badge" style="background:${colorConc}20; color:${colorConc}">${statusConc}</span></div>
        <div class="table-responsive" style="margin-top:10px; border:1px solid rgba(255,255,255,0.1); border-radius:8px;">
            <table class="admin-table" style="margin:0;">
                <tr><td>Eccentricity (e)</td><td>${e.toFixed(2)} cm</td><td>${e > limit ? '(e > L/6)' : '(e <= L/6)'}</td></tr>
                <tr><td>Concrete Stress (f_max)</td><td style="color:${colorConc}; font-weight:bold;">${f_max.toFixed(2)} kg/cm²</td><td>Allow: ${f_allow.toFixed(2)} kg/cm²</td></tr>
                <tr><td>Bolt Tension (T)</td><td>${T_bolt > 0 ? T_bolt.toFixed(2) + ' ton' : '0.00 ton'}</td><td>&nbsp;</td></tr>
            </table>
        </div>
    `;
}