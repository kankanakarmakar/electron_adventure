import { useRef, useEffect, useCallback } from 'react';
import { CircuitMode, CircuitValues, Electron } from './types';
import { useCircuitCalculations } from './useCircuitCalculations';

interface CircuitCanvasProps {
  mode: CircuitMode;
  values: CircuitValues;
}

export function CircuitCanvas({ mode, values }: CircuitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const electronsRef = useRef<Electron[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const computed = useCircuitCalculations(mode, values);

  // Generate optimized circuit paths - centered and proportional
  const getCircuitPaths = useCallback((width: number, height: number) => {
    const padding = Math.min(width, height) * 0.08;
    const centerX = width / 2;
    const centerY = height / 2;

    // Scale circuit to fit nicely
    const scale = Math.min(width, height) / 500;
    const circuitWidth = Math.min(width - padding * 2, 600 * scale);
    const circuitHeight = Math.min(height - padding * 2, 350 * scale);

    const left = centerX - circuitWidth / 2;
    const right = centerX + circuitWidth / 2;
    const top = centerY - circuitHeight / 2;
    const bottom = centerY + circuitHeight / 2;

    const componentSize = 40 * scale;

    switch (mode) {
      case 'combination':
        // Simple circuit - RECTANGULAR LAYOUT like reference image
        // Battery on left, components on top horizontal wire
        const batteryWidth = componentSize * 1.4;
        const batteryHeight = componentSize * 2.6;
        const batteryX = left + componentSize * 0.8;
        const batteryCenterX = batteryX + batteryWidth / 2;
        const batteryY = centerY - batteryHeight / 2;
        const batteryPosTerminal = batteryY;
        const batteryNegTerminal = batteryY + batteryHeight;

        // Top wire level - where components sit ON TOP of
        const simpleTopWireY = top + componentSize * 2.5;
        const bottomWireY = bottom - componentSize * 1.2;

        // Resistor on top wire
        const r1Width = componentSize * 2.0;
        const r1Height = componentSize * 0.9;
        const r1X = centerX - componentSize * 1.5;
        const r1Y = simpleTopWireY - r1Height / 2;
        const r1LeftLead = r1X;
        const r1RightLead = r1X + r1Width;

        // Bulb on top wire - positioned to the right, sitting OVER the wire terminal
        const bulbWidth = componentSize * 1.8;
        const bulbHeight = componentSize * 2.2;
        const bulbX = right - componentSize * 3.0;
        const bulbCenterX = bulbX + bulbWidth / 2;
        const bulbY = simpleTopWireY; // Wire terminal Y where the bulb base connects

        const rightWireX = right - componentSize * 1.0;

        return {
          mainPath: [
            // From battery positive terminal up to top wire
            { x: batteryCenterX, y: batteryPosTerminal },
            { x: batteryCenterX, y: simpleTopWireY },
            // Along top wire through resistor
            { x: r1LeftLead, y: simpleTopWireY },
            { x: r1RightLead, y: simpleTopWireY },
            // To bulb center (base contact)
            { x: bulbCenterX, y: simpleTopWireY },
            // Continue to right corner
            { x: rightWireX, y: simpleTopWireY },
            // Down to bottom wire
            { x: rightWireX, y: bottomWireY },
            // Along bottom wire back to battery
            { x: batteryCenterX, y: bottomWireY },
            // To battery negative terminal
            { x: batteryCenterX, y: batteryNegTerminal },
          ],
          components: {
            battery: { x: batteryX, y: batteryY, width: batteryWidth, height: batteryHeight },
            r1: { x: r1X, y: r1Y, width: r1Width, height: r1Height, label: 'R1' },
            bulb: { x: bulbX, y: bulbY, width: bulbWidth, height: bulbHeight },
          },
          branches: null,
        };

      case 'series':
        // Series circuit - RECTANGULAR LAYOUT like reference image
        const seriesBatteryWidth = componentSize * 1.4;
        const seriesBatteryHeight = componentSize * 2.6;
        const seriesBatteryX = left + componentSize * 0.8;
        const seriesBatteryCenterX = seriesBatteryX + seriesBatteryWidth / 2;
        const seriesBatteryY = centerY - seriesBatteryHeight / 2;
        const seriesBatteryTop = seriesBatteryY;
        const seriesBatteryBottom = seriesBatteryY + seriesBatteryHeight;

        // Top wire where components sit on top of
        const seriesTopRailY = top + componentSize * 2.5;
        const seriesBottomRailY = bottom - componentSize * 1.2;

        // R1 on top wire
        const seriesR1Width = componentSize * 1.7;
        const seriesR1Height = componentSize * 0.85;
        const seriesR1X = centerX - componentSize * 3.0;
        const seriesR1Y = seriesTopRailY - seriesR1Height / 2;
        const seriesR1Left = seriesR1X;
        const seriesR1Right = seriesR1X + seriesR1Width;

        // R2 on top wire
        const seriesR2Width = componentSize * 1.7;
        const seriesR2Height = componentSize * 0.85;
        const seriesR2X = centerX + componentSize * 0.2;
        const seriesR2Y = seriesTopRailY - seriesR2Height / 2;
        const seriesR2Left = seriesR2X;
        const seriesR2Right = seriesR2X + seriesR2Width;

        // Bulb on top wire - sitting OVER the wire terminal
        const seriesBulbWidth = componentSize * 1.8;
        const seriesBulbHeight = componentSize * 2.2;
        const seriesBulbX = right - componentSize * 3.0;
        const seriesBulbCenterX = seriesBulbX + seriesBulbWidth / 2;
        const seriesBulbY = seriesTopRailY; // Wire terminal Y where the bulb base connects

        const seriesRightWireX = right - componentSize * 1.0;

        return {
          mainPath: [
            // From battery positive terminal up to top wire
            { x: seriesBatteryCenterX, y: seriesBatteryTop },
            { x: seriesBatteryCenterX, y: seriesTopRailY },
            // Through R1
            { x: seriesR1Left, y: seriesTopRailY },
            { x: seriesR1Right, y: seriesTopRailY },
            // Through R2
            { x: seriesR2Left, y: seriesTopRailY },
            { x: seriesR2Right, y: seriesTopRailY },
            // Through bulb (center contact)
            { x: seriesBulbCenterX, y: seriesTopRailY },
            // To right corner
            { x: seriesRightWireX, y: seriesTopRailY },
            // Down to bottom wire
            { x: seriesRightWireX, y: seriesBottomRailY },
            // Back to battery
            { x: seriesBatteryCenterX, y: seriesBottomRailY },
            { x: seriesBatteryCenterX, y: seriesBatteryBottom },
          ],
          components: {
            battery: { x: seriesBatteryX, y: seriesBatteryY, width: seriesBatteryWidth, height: seriesBatteryHeight },
            r1: { x: seriesR1X, y: seriesR1Y, width: seriesR1Width, height: seriesR1Height, label: 'R1' },
            r2: { x: seriesR2X, y: seriesR2Y, width: seriesR2Width, height: seriesR2Height, label: 'R2' },
            bulb: { x: seriesBulbX, y: seriesBulbY, width: seriesBulbWidth, height: seriesBulbHeight },
          },
          branches: null,
        };

      case 'parallel':
      default:
        // Parallel circuit - Clean layout like reference image
        // R1 on top, R2 on bottom, vertical wires connecting on left and right
        const parallelBatteryWidth = componentSize * 1.4;
        const parallelBatteryHeight = componentSize * 2.6;
        const parallelBatteryX = left + componentSize * 0.8;
        const parallelBatteryCenterX = parallelBatteryX + parallelBatteryWidth / 2;
        const parallelBatteryY = centerY - parallelBatteryHeight / 2;
        const parallelBatteryTop = parallelBatteryY;
        const parallelBatteryBottom = parallelBatteryY + parallelBatteryHeight;

        // Branch levels aligned with battery center (horizontal alignment)
        const batteryCenter = parallelBatteryY + parallelBatteryHeight / 2;
        const topBranchY = batteryCenter - componentSize * 3.5;
        const bottomBranchY = batteryCenter - componentSize * 1.5;

        // Wire levels
        const topWireY = top + componentSize * 1.8; // Top wire
        const bottomReturnY = bottom - componentSize * 1.5; // Bottom return wire

        // Left vertical line (splits current) and right vertical line (joins current)
        const leftVerticalX = left + componentSize * 3.2;
        const rightVerticalX = centerX + componentSize * 0.5; // Compact parallel section

        // R1 on top branch - CENTERED on wire line
        const parallelR1Width = componentSize * 2.2;
        const parallelR1Height = componentSize * 0.8;
        const parallelR1X = (leftVerticalX + rightVerticalX) / 2 - parallelR1Width / 2;
        const parallelR1Y = topBranchY - parallelR1Height / 2; // Centered on wire
        const parallelR1Left = parallelR1X;
        const parallelR1Right = parallelR1X + parallelR1Width;

        // R2 on bottom branch - CENTERED on wire line
        const parallelR2Width = componentSize * 2.2;
        const parallelR2Height = componentSize * 0.8;
        const parallelR2X = (leftVerticalX + rightVerticalX) / 2 - parallelR2Width / 2;
        const parallelR2Y = bottomBranchY - parallelR2Height / 2; // Centered on wire
        const parallelR2Left = parallelR2X;
        const parallelR2Right = parallelR2X + parallelR2Width;

        // Bulb on top wire AFTER the parallel junction - sitting OVER the wire terminal
        const parallelBulbWidth = componentSize * 1.6;
        const parallelBulbHeight = componentSize * 2.0;
        const parallelBulbX = right - componentSize * 2.8;
        const parallelBulbCenterX = parallelBulbX + parallelBulbWidth / 2;
        const parallelBulbY = topWireY; // Wire terminal Y where the bulb base connects

        const parallelRightWireX = right - componentSize * 1.0;

        return {
          mainPath: [
            // Battery positive to horizontal, then to left vertical split point
            { x: parallelBatteryCenterX, y: parallelBatteryTop },
            { x: parallelBatteryCenterX, y: topWireY },
            { x: leftVerticalX, y: topWireY },
          ],
          branches: {
            top: [
              // Top branch: from split up to R1, through R1, down to join
              { x: leftVerticalX, y: topWireY },
              { x: leftVerticalX, y: topBranchY },
              { x: parallelR1Left, y: topBranchY },
              { x: parallelR1Right, y: topBranchY },
              { x: rightVerticalX, y: topBranchY },
              { x: rightVerticalX, y: topWireY },
            ],
            bottom: [
              // Bottom branch: from split down to R2, through R2, up to join
              { x: leftVerticalX, y: topWireY },
              { x: leftVerticalX, y: bottomBranchY },
              { x: parallelR2Left, y: bottomBranchY },
              { x: parallelR2Right, y: bottomBranchY },
              { x: rightVerticalX, y: bottomBranchY },
              { x: rightVerticalX, y: topWireY },
            ],
            after: [
              // After junction: to bulb, down to return wire, back to battery
              { x: rightVerticalX, y: topWireY },
              { x: parallelBulbCenterX, y: topWireY }, // Through bulb
              { x: parallelRightWireX, y: topWireY },
              { x: parallelRightWireX, y: bottomReturnY },
              { x: parallelBatteryCenterX, y: bottomReturnY },
              { x: parallelBatteryCenterX, y: parallelBatteryBottom },
            ],
          },
          components: {
            battery: { x: parallelBatteryX, y: parallelBatteryY, width: parallelBatteryWidth, height: parallelBatteryHeight },
            r1: { x: parallelR1X, y: parallelR1Y, width: parallelR1Width, height: parallelR1Height, label: 'R1' },
            r2: { x: parallelR2X, y: parallelR2Y, width: parallelR2Width, height: parallelR2Height, label: 'R2' },
            bulb: { x: parallelBulbX, y: parallelBulbY, width: parallelBulbWidth, height: parallelBulbHeight },
          },
        };
    }
  }, [mode]);

  // Enhanced wire drawing with better aesthetics
  const drawWire = useCallback((ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], pulseIntensity: number = 0) => {
    if (points.length < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Black outer border for wire visibility
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Main copper wire - darker, richer copper
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
    gradient.addColorStop(0, '#8B5A2B');
    gradient.addColorStop(0.5, '#CD853F');
    gradient.addColorStop(1, '#8B5A2B');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Wire highlight - brighter for contrast
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = 'rgba(255, 235, 200, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  // Realistic battery - VERTICAL orientation: + TOP, - BOTTOM
  const drawBattery = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, voltage: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Battery body - metallic vertical cylinder
    const bodyGradient = ctx.createLinearGradient(x, y, x + width, y);
    bodyGradient.addColorStop(0, '#1a1a1a');
    bodyGradient.addColorStop(0.3, '#3a3a3a');
    bodyGradient.addColorStop(0.5, '#2a2a2a');
    bodyGradient.addColorStop(0.7, '#3a3a3a');
    bodyGradient.addColorStop(1, '#1a1a1a');

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(x, y + height * 0.08, width, height * 0.84, 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // TOP TERMINAL - Positive (+) - RED - connects to wire
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.25, y, width * 0.5, height * 0.1, 3);
    ctx.fill();

    // Plus symbol on top terminal
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(14, width * 0.35)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', centerX, y + height * 0.05);

    // Terminal shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.15, y + 2, width * 0.3, height * 0.04, 2);
    ctx.fill();

    // BOTTOM TERMINAL - Negative (-) - BLUE - connects to wire
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(centerX - width * 0.2, y + height * 0.92, width * 0.4, height * 0.08, 2);
    ctx.fill();

    // Minus symbol on bottom terminal
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(12, width * 0.3)}px Inter`;
    ctx.fillText('−', centerX, y + height * 0.96);

    // Battery label area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x + width * 0.12, y + height * 0.25, width * 0.76, height * 0.5, 4);
    ctx.fill();

    // Voltage display - large and centered
    ctx.fillStyle = '#22c55e';
    ctx.font = `bold ${Math.max(16, width * 0.4)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${voltage}V`, centerX, centerY);

    // Battery type label
    ctx.fillStyle = '#888';
    ctx.font = `600 ${Math.max(8, width * 0.18)}px Inter`;
    ctx.fillText('DC', centerX, y + height * 0.85);

    // Battery label BESIDE the battery (to the left) - BLACK
    ctx.fillStyle = '#000000';
    ctx.font = `800 ${Math.max(12, width * 0.35)}px Inter`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.fillText('Battery', x - 10, y + height * 0.15);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }, []);

  // Realistic resistor with color bands
  const drawResistor = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, value: number, label: string) => {
    const centerY = y + height / 2;
    const bodyWidth = width * 0.7;
    const bodyHeight = height * 0.8;
    const bodyX = x + (width - bodyWidth) / 2;

    // Lead wires
    ctx.strokeStyle = '#b87333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(bodyX, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyX + bodyWidth, centerY);
    ctx.lineTo(x + width, centerY);
    ctx.stroke();

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Resistor body - beige/tan color like real resistors
    const bodyGradient = ctx.createLinearGradient(bodyX, centerY - bodyHeight / 2, bodyX, centerY + bodyHeight / 2);
    bodyGradient.addColorStop(0, '#e8d4b8');
    bodyGradient.addColorStop(0.5, '#d4b896');
    bodyGradient.addColorStop(1, '#c4a882');

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(bodyX, centerY - bodyHeight / 2, bodyWidth, bodyHeight, 4);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Color bands (simplified - 3 bands based on value)
    const bandWidth = bodyWidth * 0.08;
    const bandPositions = [0.2, 0.35, 0.5, 0.75];
    const colors = ['#8B4513', '#ff0000', '#ff8c00', '#d4af37']; // Brown, Red, Orange, Gold

    bandPositions.forEach((pos, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(bodyX + bodyWidth * pos, centerY - bodyHeight / 2 + 2, bandWidth, bodyHeight - 4);
    });

    // Label above with BLACK color - More prominent
    ctx.fillStyle = '#000000';
    ctx.font = `800 ${Math.max(14, height * 0.6)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // White shadow for visibility on light background
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.fillText(label, x + width / 2, y - 5);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Value below - BLACK for maximum visibility
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.max(12, height * 0.5)}px Inter`;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(`${value}Ω`, x + width / 2, y + height + 5);
    ctx.shadowBlur = 0;
  }, []);

  // Realistic light bulb sitting ABOVE the wire (like reference image)
  // Wire passes through the base, bulb glass is above
  const drawBulb = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, brightness: number) => {
    const centerX = x + width / 2;
    // Wire level is the Y position passed in (this is where the wire runs)
    const wireY = y;

    // Bulb dimensions
    const bulbRadius = Math.min(width, height) * 0.38;
    const baseWidth = bulbRadius * 0.65;
    const baseHeight = bulbRadius * 1.1;

    // Position bulb ABOVE the wire - base connects at wire level
    const baseBottom = wireY;
    const baseTop = baseBottom - baseHeight;
    const bulbCenterY = baseTop - bulbRadius + 5;

    // Glow effect when lit - MUCH BRIGHTER
    if (brightness > 0.1) {
      const glowLayers = 5;
      for (let i = glowLayers; i >= 0; i--) {
        const radius = bulbRadius * (2.0 + i * 1.0);
        const alpha = brightness * 0.35 * (1 - i / glowLayers);
        const gradient = ctx.createRadialGradient(centerX, bulbCenterY, 0, centerX, bulbCenterY, radius);
        gradient.addColorStop(0, `rgba(255, 240, 100, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 200, 50, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 180, 30, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, bulbCenterY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glass bulb (the round part on top)
    const glassGradient = ctx.createRadialGradient(
      centerX - bulbRadius * 0.3, bulbCenterY - bulbRadius * 0.3, 0,
      centerX, bulbCenterY, bulbRadius
    );

    // Much more distinct on/off colors
    const glowColor = brightness > 0.2
      ? `rgba(255, 255, 180, ${0.9 + brightness * 0.1})`  // Bright yellow-white when on
      : 'rgba(200, 200, 195, 0.9)';  // Gray when off
    const innerGlow = brightness > 0.2
      ? `rgba(255, 230, 80, ${0.8 + brightness * 0.2})`   // Intense yellow core
      : 'rgba(180, 180, 175, 0.7)';  // Dull gray when off

    glassGradient.addColorStop(0, glowColor);
    glassGradient.addColorStop(0.6, innerGlow);
    glassGradient.addColorStop(1, brightness > 0.2 ? 'rgba(255, 200, 100, 0.8)' : 'rgba(150, 150, 145, 0.6)');

    ctx.fillStyle = glassGradient;
    ctx.beginPath();
    ctx.arc(centerX, bulbCenterY, bulbRadius, 0, Math.PI * 2);
    ctx.fill();

    // Glass outline - SOLID BLACK for clear visibility
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glass highlight (reflection)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(centerX - bulbRadius * 0.35, bulbCenterY - bulbRadius * 0.35, bulbRadius * 0.22, bulbRadius * 0.12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Filament inside the bulb
    const filamentY = bulbCenterY + bulbRadius * 0.15;
    ctx.beginPath();
    ctx.moveTo(centerX - bulbRadius * 0.35, filamentY + 3);
    ctx.quadraticCurveTo(centerX - bulbRadius * 0.15, filamentY - bulbRadius * 0.4, centerX, filamentY + 3);
    ctx.quadraticCurveTo(centerX + bulbRadius * 0.15, filamentY - bulbRadius * 0.4, centerX + bulbRadius * 0.35, filamentY + 3);

    if (brightness > 0.2) {
      ctx.strokeStyle = `rgba(255, 220, 50, ${0.9 + brightness * 0.1})`;
      ctx.shadowColor = 'rgba(255, 200, 0, 1)';
      ctx.shadowBlur = 15;
    } else {
      ctx.strokeStyle = '#777';
      ctx.shadowBlur = 0;
    }
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Neck transition from glass to base
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(centerX - bulbRadius * 0.4, bulbCenterY + bulbRadius * 0.9);
    ctx.lineTo(centerX - baseWidth / 2, baseTop + 4);
    ctx.lineTo(centerX + baseWidth / 2, baseTop + 4);
    ctx.lineTo(centerX + bulbRadius * 0.4, bulbCenterY + bulbRadius * 0.9);
    ctx.closePath();
    ctx.fill();

    // Screw base (metallic gray/silver)
    const baseGradient = ctx.createLinearGradient(centerX - baseWidth / 2, baseTop, centerX + baseWidth / 2, baseTop);
    baseGradient.addColorStop(0, '#4a4a4a');
    baseGradient.addColorStop(0.3, '#6a6a6a');
    baseGradient.addColorStop(0.5, '#5a5a5a');
    baseGradient.addColorStop(0.7, '#6a6a6a');
    baseGradient.addColorStop(1, '#4a4a4a');

    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.roundRect(centerX - baseWidth / 2, baseTop + 4, baseWidth, baseHeight - 4, [0, 0, 3, 3]);
    ctx.fill();

    // Screw threads on base
    const threadCount = 3;
    const threadSpacing = (baseHeight - 12) / threadCount;
    for (let i = 0; i < threadCount; i++) {
      const threadY = baseTop + 10 + i * threadSpacing;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - baseWidth / 2, threadY);
      ctx.lineTo(centerX + baseWidth / 2, threadY);
      ctx.stroke();
    }

    // Bottom contact point (connects to wire)
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(centerX, baseBottom, baseWidth * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label below the wire
    ctx.fillStyle = '#374151';
    ctx.font = `600 ${Math.max(11, width * 0.24)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Bulb', centerX, wireY + 12);
  }, []);

  // Smaller, precise electron with crisp glow
  const drawElectron = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number = 1) => {
    const size = 5; // Constant size for uniform electrons

    // Compact glow layers - less overwhelming
    for (let i = 3; i >= 0; i--) {
      const layerSize = size * (1.8 + i * 0.6);
      const layerAlpha = (0.35 - i * 0.08) * brightness;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
      gradient.addColorStop(0, `rgba(0, 224, 255, ${layerAlpha})`);
      gradient.addColorStop(0.5, `rgba(14, 165, 233, ${layerAlpha * 0.6})`);
      gradient.addColorStop(1, 'rgba(0, 224, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core with clean gradient
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    coreGradient.addColorStop(0, '#e0f2fe');
    coreGradient.addColorStop(0.4, '#38bdf8');
    coreGradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Bright center highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Get position along path
  const getPositionOnPath = useCallback((path: { x: number, y: number }[], progress: number) => {
    if (path.length < 2) return path[0];

    const totalLength = path.reduce((acc, point, i) => {
      if (i === 0) return 0;
      const dx = point.x - path[i - 1].x;
      const dy = point.y - path[i - 1].y;
      return acc + Math.sqrt(dx * dx + dy * dy);
    }, 0);

    const targetLength = progress * totalLength;
    let currentLength = 0;

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (currentLength + segmentLength >= targetLength) {
        const t = (targetLength - currentLength) / segmentLength;
        return {
          x: path[i - 1].x + dx * t,
          y: path[i - 1].y + dy * t,
        };
      }

      currentLength += segmentLength;
    }

    return path[path.length - 1];
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const electronCount = 20;
    electronsRef.current = Array.from({ length: electronCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      pathIndex: 0,
      progress: i / electronCount, // Evenly spaced
      speed: 0.007, // Same speed for all to prevent clumping
      branch: Math.random() > 0.5 ? 'top' : 'bottom',
    }));

    let time = 0;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();

      // Clear and draw lighter blue background
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Create radial gradient from center - LIGHTER blue shades
      const bgGradient = ctx.createRadialGradient(
        rect.width / 2, rect.height / 2, 0,
        rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height) * 0.8
      );
      bgGradient.addColorStop(0, '#f0f9ff');    // Very light blue center
      bgGradient.addColorStop(0.3, '#e0f2fe');  // Light cyan-blue
      bgGradient.addColorStop(0.6, '#bae6fd');  // Soft light blue
      bgGradient.addColorStop(1, '#93c5fd');    // Light blue edge
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw concept explanation dialog box at top-left corner
      const conceptTexts: Record<CircuitMode, string> = {
        'combination': '💡 Simple: One resistor limits current flow (I = V/R)',
        'series': '🔗 Series: Resistors add up (R_total = R1 + R2)',
        'parallel': '⚡ Parallel: Current splits between paths (1/R = 1/R1 + 1/R2)'
      };

      const conceptText = conceptTexts[mode];
      const boxPadding = 10;
      const boxMargin = 15;

      // Measure text
      ctx.font = 'bold 13px Inter';
      const textMetrics = ctx.measureText(conceptText);
      const boxWidth = textMetrics.width + boxPadding * 2;
      const boxHeight = 32;

      // Draw dialog box background with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      // Box with rounded corners
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(boxMargin, boxMargin, boxWidth, boxHeight, 8);
      ctx.fill();

      // Border
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(conceptText, boxMargin + boxPadding, boxMargin + boxHeight / 2);

      const paths = getCircuitPaths(rect.width, rect.height);
      const { components } = paths;

      const maxCurrent = 2;
      const brightness = Math.min(computed.current / maxCurrent, 1);

      // Electron speed inversely proportional to resistance
      // Higher resistance = slower electrons (more accurate physics)
      const baseSpeed = 0.8;
      const minResistance = 1;
      const maxResistance = 200; // Approximate max when both R1 and R2 are at 100
      const normalizedResistance = Math.min(computed.totalResistance, maxResistance) / maxResistance;
      // Speed factor: high resistance -> low speed, low resistance -> high speed
      const speedFactor = baseSpeed * (1 - normalizedResistance * 0.85) + 0.15; // Keeps minimum speed at 0.15

      const pulseIntensity = Math.sin(time * 0.05) * 0.5 + 0.5;
      time++;

      // Draw wires
      if (paths.mainPath) {
        drawWire(ctx, paths.mainPath, pulseIntensity * brightness);
      }

      if (paths.branches) {
        if (paths.branches.top) drawWire(ctx, paths.branches.top, pulseIntensity * brightness);
        if (paths.branches.bottom) drawWire(ctx, paths.branches.bottom, pulseIntensity * brightness);
        if (paths.branches.after) drawWire(ctx, paths.branches.after, pulseIntensity * brightness);
      }

      // Draw components
      if (components.battery) {
        drawBattery(ctx, components.battery.x, components.battery.y, components.battery.width, components.battery.height, values.voltage);
      }

      if (components.r1) {
        drawResistor(ctx, components.r1.x, components.r1.y, components.r1.width, components.r1.height, values.r1, components.r1.label || 'R1');
      }

      if (components.r2) {
        drawResistor(ctx, components.r2.x, components.r2.y, components.r2.width, components.r2.height, values.r2, components.r2.label || 'R2');
      }

      // Draw bulb - single bulb for all circuit modes
      if (components.bulb) {
        drawBulb(ctx, components.bulb.x, components.bulb.y, components.bulb.width, components.bulb.height, brightness);
      }

      // Calculate probability of electron going through each branch based on resistance
      // Lower resistance = higher probability (inverse relationship)
      const r1Conductance = 1 / values.r1; // Conductance = 1/R
      const r2Conductance = 1 / values.r2;
      const totalConductance = r1Conductance + r2Conductance;
      const probTopBranch = r1Conductance / totalConductance; // Probability of taking top branch

      // Calculate branch-specific speed factors for parallel mode
      // Using inverse relationship (1/R) for more realistic physics
      // If R is high, speed drops significantly. If R is low, speed is high.
      const speedFactor1 = Math.min(baseSpeed * (20 / Math.max(values.r1, 1)), baseSpeed * 1.5);
      const speedFactor2 = Math.min(baseSpeed * (20 / Math.max(values.r2, 1)), baseSpeed * 1.5);

      // Update and draw electrons
      electronsRef.current.forEach(electron => {
        // Determine speed based on mode and branch
        let currentSpeedFactor = speedFactor; // Default global speed

        if (mode === 'parallel') {
          // In parallel, speed depends on which branch the electron is in
          // This simulates "current" (I = V/R) - higher R means slower flow
          currentSpeedFactor = electron.branch === 'top' ? speedFactor1 : speedFactor2;

          // Optionally, we could make them fast in the main wire and slow only in the branch,
          // but simpler is to make the "branch electron" slow overall, representing that path's current.
        }

        electron.progress += electron.speed * currentSpeedFactor;

        let fullPath: { x: number, y: number }[] = [];

        if (mode === 'series' || mode === 'combination') {
          fullPath = paths.mainPath || [];
        } else if (paths.branches) {
          const beforeJunction = paths.mainPath || [];
          const branch = electron.branch === 'top' ? paths.branches.top : paths.branches.bottom;
          const afterJunction = paths.branches.after || [];
          fullPath = [...beforeJunction, ...(branch || []).slice(1), ...(afterJunction || []).slice(1)];
        }

        if (electron.progress >= 1) {
          electron.progress = 0;
          if (mode !== 'series' && mode !== 'combination') {
            // Assign branch based on conductance ratio (probability)
            electron.branch = Math.random() < probTopBranch ? 'top' : 'bottom';
          }
        }

        if (fullPath.length > 0) {
          const pos = getPositionOnPath(fullPath, electron.progress);

          // Calculate individual electron brightness
          // For parallel, brightness matches the speed/current of that branch
          let electronBrightness = brightness;

          if (mode === 'parallel') {
            // Scale brightness with speed, capped at 1.0
            const factor = electron.branch === 'top' ? speedFactor1 : speedFactor2;
            // Normalize against base speed to get a 0-1 range
            electronBrightness = Math.min(factor / (baseSpeed * 0.5), 1) * brightness;
          }

          drawElectron(ctx, pos.x, pos.y, electronBrightness);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, values, computed, getCircuitPaths, drawWire, drawBattery, drawResistor, drawBulb, drawElectron, getPositionOnPath]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ backgroundColor: 'transparent' }}
    />
  );
}
