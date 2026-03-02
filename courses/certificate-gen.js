/**
 * Certificate Generator - Nored Farms
 *
 * Canvas-based certificate rendering with download and print support.
 * Generates a landscape botanical-themed certificate.
 *
 * Depends on: supabase-config.js, auth.js
 */

/**
 * Render certificate on a canvas element
 * @param {HTMLCanvasElement} canvas
 * @param {Object} data - { displayName, courseTitle, certificateNumber, issuedAt, tierLevel }
 */
function renderCertificate(canvas, data) {
    const ctx = canvas.getContext('2d');
    const W = 1200;
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#fefdfb';
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#1c3a13';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Inner border (decorative)
    ctx.strokeStyle = '#b8d4a8';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Corner accents (botanical leaf motif using arcs)
    drawCornerAccent(ctx, 50, 50, 0);
    drawCornerAccent(ctx, W - 50, 50, Math.PI / 2);
    drawCornerAccent(ctx, W - 50, H - 50, Math.PI);
    drawCornerAccent(ctx, 50, H - 50, -Math.PI / 2);

    // Header text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c3a13';
    ctx.font = '14px Inter, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('NORED FARMS', W / 2, 120);

    // "Certificate of Completion"
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '600 42px Inter, sans-serif';
    ctx.fillText('Certificate of Completion', W / 2, 190);

    // Divider line
    ctx.strokeStyle = '#1c3a13';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, 210);
    ctx.lineTo(W / 2 + 150, 210);
    ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('This certifies that', W / 2, 270);

    // Student name
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '600 36px Inter, sans-serif';
    ctx.fillText(data.displayName || 'Student', W / 2, 320);

    // Underline below name
    const nameWidth = ctx.measureText(data.displayName || 'Student').width;
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2 - 20, 332);
    ctx.lineTo(W / 2 + nameWidth / 2 + 20, 332);
    ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('has successfully completed all requirements for', W / 2, 380);

    // Course title
    ctx.fillStyle = '#1c3a13';
    ctx.font = '600 28px Inter, sans-serif';
    wrapText(ctx, data.courseTitle || 'Course', W / 2, 425, W - 200, 36);

    // Tier info
    const tierNames = {
        1: 'Home Grower',
        2: 'Advanced Practitioner',
        3: 'Small Business',
        4: 'Industrial Operations'
    };
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Tier ${data.tierLevel || 1} - ${tierNames[data.tierLevel] || 'Home Grower'}`, W / 2, 490);

    // Date
    const dateStr = data.issuedAt
        ? new Date(data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    ctx.fillStyle = '#374151';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Issued: ' + dateStr, W / 2, 540);

    // Certificate number
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Certificate No: ' + (data.certificateNumber || 'PETX-XXX-0000-0000'), W / 2, 570);

    // Signature line (left)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 680);
    ctx.lineTo(450, 680);
    ctx.stroke();

    ctx.fillStyle = '#374151';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Instructor', 325, 705);

    // Signature line (right)
    ctx.beginPath();
    ctx.moveTo(750, 680);
    ctx.lineTo(1000, 680);
    ctx.stroke();

    ctx.fillText('Nored Farms', 875, 705);

    // Verification URL
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Verify at: noredfarms.netlify.app/courses/certificate.html?id=' + (data.certificateNumber || ''), W / 2, 780);

    // Droplet logo (center bottom)
    drawDropletLogo(ctx, W / 2, 740, 18);
}

function drawCornerAccent(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = '#b8d4a8';
    ctx.lineWidth = 1.5;

    // Simple leaf-like curves
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(15, -5, 30, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-5, 15, 0, 30);
    ctx.stroke();

    ctx.restore();
}

function drawDropletLogo(ctx, cx, cy, size) {
    ctx.save();
    ctx.fillStyle = '#1c3a13';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx - size, cy - size / 3, cx - size, cy + size / 2, cx, cy + size);
    ctx.bezierCurveTo(cx + size, cy + size / 2, cx + size, cy - size / 3, cx, cy - size);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line.trim(), x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
}

/**
 * Download certificate as PNG
 */
function downloadCertificate(canvas, certNumber) {
    const link = document.createElement('a');
    link.download = `PureExtractsTX-Certificate-${certNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Print certificate
 */
function printCertificate(canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head><title>Certificate - Nored Farms</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
            <img src="${dataUrl}" style="max-width:100%; max-height:100vh;">
        </body>
        </html>
    `);
    win.document.close();
    win.onload = () => {
        win.print();
        win.close();
    };
}
