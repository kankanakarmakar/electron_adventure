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
        // Simple circuit - NEAT RECTANGULAR LAYOUT
        const batteryWidth = componentSize * 1.4;
        const batteryHeight = componentSize * 2.6;
        const batteryX = left + componentSize * 1.0;
        const batteryCenterX = batteryX + batteryWidth / 2;
        const batteryY = centerY - batteryHeight / 2;
        const batteryPosTerminal = batteryY;
        const batteryNegTerminal = batteryY + batteryHeight;
        
        const topWireY = top + componentSize * 1.5;
        const bottomWireY = bottom - componentSize * 1.5;
        
        const r1Width = componentSize * 2.0;
        const r1Height = componentSize * 0.9;
        const r1X = left + componentSize * 3.5;
        const r1Y = topWireY - r1Height / 2;
        const r1CenterY = topWireY;
        const r1LeftLead = r1X;
        const r1RightLead = r1X + r1Width;
        
        const bulbWidth = componentSize * 2.0;
        const bulbHeight = componentSize * 2.0;
        const bulbX = right - componentSize * 3.5;
        const bulbY = topWireY - bulbHeight / 2;
        const bulbCenterY = topWireY;
        const terminalWidth = bulbWidth * 0.08;
        const bulbLeftTerminal = bulbX - terminalWidth;
        const bulbRightTerminal = bulbX + bulbWidth + terminalWidth;
        
        const rightWireX = right - componentSize * 1.0;
        const leftWireX = left + componentSize * 1.0;
        
        return {
          mainPath: [
            { x: batteryCenterX, y: batteryPosTerminal },
            { x: batteryCenterX, y: topWireY },
            { x: r1LeftLead, y: topWireY },
            { x: r1RightLead, y: topWireY },
            { x: bulbLeftTerminal, y: topWireY },
            { x: bulbRightTerminal, y: topWireY },
            { x: rightWireX, y: topWireY },
            { x: rightWireX, y: bottomWireY },
            { x: batteryCenterX, y: bottomWireY },
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
        // Series circuit - NEAT HORIZONTAL LAYOUT
        const seriesBatteryWidth = componentSize * 1.4;
        const seriesBatteryHeight = componentSize * 2.6;
        const seriesBatteryX = left + componentSize * 1.0;
        const seriesBatteryCenterX = seriesBatteryX + seriesBatteryWidth / 2;
        const seriesBatteryY = centerY - seriesBatteryHeight / 2;
        const seriesBatteryTop = seriesBatteryY;
        const seriesBatteryBottom = seriesBatteryY + seriesBatteryHeight;
        
        const seriesTopRailY = top + componentSize * 1.5;
        const seriesBottomRailY = bottom - componentSize * 1.5;
        
        const seriesR1Width = componentSize * 1.7;
        const seriesR1Height = componentSize * 0.85;
        const seriesR1X = left + componentSize * 3.5;
        const seriesR1Y = seriesTopRailY - seriesR1Height / 2;
        const seriesR1CenterY = seriesTopRailY;
        const seriesR1Left = seriesR1X;
        const seriesR1Right = seriesR1X + seriesR1Width;
        
        const seriesR2Width = componentSize * 1.7;
        const seriesR2Height = componentSize * 0.85;
        const seriesR2X = centerX + componentSize * 0.5;
        const seriesR2Y = seriesTopRailY - seriesR2Height / 2;
        const seriesR2CenterY = seriesTopRailY;
        const seriesR2Left = seriesR2X;
        const seriesR2Right = seriesR2X + seriesR2Width;
        
        const seriesBulbWidth = componentSize * 2.0;
        const seriesBulbHeight = componentSize * 2.0;
        const seriesBulbX = right - componentSize * 3.5;
        const seriesBulbY = seriesTopRailY - seriesBulbHeight / 2;
        const seriesBulbCenterY = seriesTopRailY;
        const seriesBulbTerminalWidth = seriesBulbWidth * 0.08;
        const seriesBulbLeft = seriesBulbX - seriesBulbTerminalWidth;
        const seriesBulbRight = seriesBulbX + seriesBulbWidth + seriesBulbTerminalWidth;
        
        const seriesRightWireX = right - componentSize * 1.0;
        const seriesLeftWireX = left + componentSize * 1.0;
        
        return {
          mainPath: [
            { x: seriesBatteryCenterX, y: seriesBatteryTop },
            { x: seriesBatteryCenterX, y: seriesTopRailY },
            { x: seriesR1Left, y: seriesTopRailY },
            { x: seriesR1Right, y: seriesTopRailY },
            { x: seriesR2Left, y: seriesTopRailY },
            { x: seriesR2Right, y: seriesTopRailY },
            { x: seriesBulbLeft, y: seriesTopRailY },
            { x: seriesBulbRight, y: seriesTopRailY },
            { x: seriesRightWireX, y: seriesTopRailY },
            { x: seriesRightWireX, y: seriesBottomRailY },
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
        // Parallel circuit - SIMPLIFIED HORIZONTAL LAYOUT
        const parallelBatteryWidth = componentSize * 1.4;
        const parallelBatteryHeight = componentSize * 2.6;
        const parallelBatteryX = left + componentSize * 0.8;
        const parallelBatteryCenterX = parallelBatteryX + parallelBatteryWidth / 2;
        const parallelBatteryY = centerY - parallelBatteryHeight / 2;
        const parallelBatteryTop = parallelBatteryY;
        const parallelBatteryBottom = parallelBatteryY + parallelBatteryHeight;
        
        // Simple branch positions - extended horizontal wire from battery
        const topBranchY = centerY - componentSize * 1.2;
        const bottomBranchY = centerY + componentSize * 1.2;
        const branchSplitX = left + componentSize * 3.5;
        const branchJoinX = right - componentSize * 2.8;
        
        // R1 and R2 horizontally aligned in center
        const parallelR1Width = componentSize * 1.7;
        const parallelR1Height = componentSize * 0.8;
        const parallelR1Y = topBranchY - parallelR1Height / 2;
        const parallelR1X = centerX - parallelR1Width / 2;
        const parallelR1Left = parallelR1X;
        const parallelR1Right = parallelR1X + parallelR1Width;
        
        const parallelR2Width = componentSize * 1.7;
        const parallelR2Height = componentSize * 0.8;
        const parallelR2Y = bottomBranchY - parallelR2Height / 2;
        const parallelR2X = centerX - parallelR2Width / 2;
        const parallelR2Left = parallelR2X;
        const parallelR2Right = parallelR2X + parallelR2Width;
        
        // Bulb on right side - positioned further right to avoid wire overlap
        const parallelBottomY = bottom - componentSize * 1.2;
        const parallelBulbWidth = componentSize * 2.0;
        const parallelBulbHeight = componentSize * 2.0;
        const parallelBulbX = right - componentSize * 2.5;
        const parallelBulbY = centerY - parallelBulbHeight / 2;
        const parallelBulbTerminalWidth = parallelBulbWidth * 0.08;
        const parallelBulbLeft = parallelBulbX - parallelBulbTerminalWidth;
        const parallelBulbRight = parallelBulbX + parallelBulbWidth + parallelBulbTerminalWidth;
        
        return {
          mainPath: [
            { x: parallelBatteryCenterX, y: parallelBatteryTop },
            { x: parallelBatteryCenterX, y: centerY },
            { x: branchSplitX, y: centerY },
          ],
          branches: {
            top: [
              { x: branchSplitX, y: centerY },
              { x: branchSplitX, y: topBranchY },
              { x: parallelR1Left, y: topBranchY },
              { x: parallelR1Right, y: topBranchY },
              { x: branchJoinX, y: topBranchY },
              { x: branchJoinX, y: centerY },
            ],
            bottom: [
              { x: branchSplitX, y: centerY },
              { x: branchSplitX, y: bottomBranchY },
              { x: parallelR2Left, y: bottomBranchY },
              { x: parallelR2Right, y: bottomBranchY },
              { x: branchJoinX, y: bottomBranchY },
              { x: branchJoinX, y: centerY },
            ],
            after: [
              { x: branchJoinX, y: centerY },
              { x: parallelBulbLeft, y: centerY },
              { x: parallelBulbRight, y: centerY },
              { x: parallelBulbRight + componentSize * 0.5, y: centerY },
              { x: parallelBulbRight + componentSize * 0.5, y: parallelBottomY },
              { x: parallelBatteryCenterX, y: parallelBottomY },
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
  const drawWire = useCallback((ctx: CanvasRenderingContext2D, points: {x: number, y: number}[], pulseIntensity: number = 0) => {
    if (points.length < 2) return;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Outer glow
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + pulseIntensity * 0.2})`;
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Mid glow
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = `rgba(100, 150, 200, ${0.3 + pulseIntensity * 0.2})`;
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Main copper wire
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[points.length-1].x, points[points.length-1].y);
    gradient.addColorStop(0, '#b87333');
    gradient.addColorStop(0.5, '#d4956a');
    gradient.addColorStop(1, '#b87333');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Wire highlight
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = 'rgba(255, 220, 180, 0.4)';
    ctx.lineWidth = 1.5;
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
    const bodyGradient = ctx.createLinearGradient(bodyX, centerY - bodyHeight/2, bodyX, centerY + bodyHeight/2);
    bodyGradient.addColorStop(0, '#e8d4b8');
    bodyGradient.addColorStop(0.5, '#d4b896');
    bodyGradient.addColorStop(1, '#c4a882');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(bodyX, centerY - bodyHeight/2, bodyWidth, bodyHeight, 4);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Color bands (simplified - 3 bands based on value)
    const bandWidth = bodyWidth * 0.08;
    const bandPositions = [0.2, 0.35, 0.5, 0.75];
    const colors = ['#8B4513', '#ff0000', '#ff8c00', '#d4af37']; // Brown, Red, Orange, Gold
    
    bandPositions.forEach((pos, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(bodyX + bodyWidth * pos, centerY - bodyHeight/2 + 2, bandWidth, bodyHeight - 4);
    });
    
    // Label above with premium color - LARGER AND MORE PROMINENT
    const labelGradient = ctx.createLinearGradient(x, y - 12, x + width, y - 12);
    labelGradient.addColorStop(0, '#f59e0b');
    labelGradient.addColorStop(0.5, '#ff8c00');
    labelGradient.addColorStop(1, '#d97706');
    ctx.fillStyle = labelGradient;
    ctx.font = `800 ${Math.max(14, height * 0.6)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Enhanced text shadow for depth and prominence
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillText(label, x + width / 2, y - 5);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Value below - LARGER AND MORE VISIBLE
    ctx.fillStyle = '#9ca3af';
    ctx.font = `600 ${Math.max(11, height * 0.45)}px Inter`;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 1;
    ctx.fillText(`${value}Ω`, x + width / 2, y + height + 5);
    ctx.shadowBlur = 0;
  }, []);

  // Realistic light bulb with horizontal wire terminals (NOT merged)
  const drawBulb = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, brightness: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const bulbRadius = Math.min(width, height) * 0.32;
    const bulbCenterY = centerY - height * 0.08;
    
    // Glow effect
    if (brightness > 0.1) {
      const glowLayers = 4;
      for (let i = glowLayers; i >= 0; i--) {
        const radius = bulbRadius * (1.5 + i * 0.8);
        const alpha = brightness * 0.15 * (1 - i / glowLayers);
        const gradient = ctx.createRadialGradient(centerX, bulbCenterY, 0, centerX, bulbCenterY, radius);
        gradient.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, bulbCenterY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Glass bulb
    const glassGradient = ctx.createRadialGradient(
      centerX - bulbRadius * 0.3, bulbCenterY - bulbRadius * 0.3, 0,
      centerX, bulbCenterY, bulbRadius
    );
    
    const glowColor = brightness > 0.3 
      ? `rgba(255, 240, 200, ${0.8 + brightness * 0.2})`
      : 'rgba(240, 240, 245, 0.9)';
    const innerGlow = brightness > 0.3 
      ? `rgba(255, 200, 80, ${brightness * 0.8})`
      : 'rgba(220, 220, 225, 0.7)';
    
    glassGradient.addColorStop(0, glowColor);
    glassGradient.addColorStop(0.7, innerGlow);
    glassGradient.addColorStop(1, 'rgba(200, 200, 205, 0.6)');
    
    ctx.fillStyle = glassGradient;
    ctx.beginPath();
    ctx.arc(centerX, bulbCenterY, bulbRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Glass outline
    ctx.strokeStyle = 'rgba(100, 100, 110, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Glass highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX - bulbRadius * 0.35, bulbCenterY - bulbRadius * 0.35, bulbRadius * 0.25, bulbRadius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Filament
    const filamentY = bulbCenterY + bulbRadius * 0.1;
    ctx.beginPath();
    ctx.moveTo(centerX - bulbRadius * 0.4, filamentY + 5);
    ctx.quadraticCurveTo(centerX - bulbRadius * 0.2, filamentY - bulbRadius * 0.5, centerX, filamentY + 5);
    ctx.quadraticCurveTo(centerX + bulbRadius * 0.2, filamentY - bulbRadius * 0.5, centerX + bulbRadius * 0.4, filamentY + 5);
    
    if (brightness > 0.3) {
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.8 + brightness * 0.2})`;
      ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
      ctx.shadowBlur = 6;
    } else {
      ctx.strokeStyle = '#888';
      ctx.shadowBlur = 0;
    }
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Screw base (below the glass bulb)
    const baseTop = bulbCenterY + bulbRadius;
    const baseWidth = bulbRadius * 0.75;
    const baseHeight = height * 0.28;
    
    // Base neck - trapezoid shape
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(centerX - bulbRadius * 0.38, baseTop);
    ctx.lineTo(centerX - baseWidth / 2, baseTop + 3);
    ctx.lineTo(centerX - baseWidth / 2, baseTop + baseHeight);
    ctx.lineTo(centerX + baseWidth / 2, baseTop + baseHeight);
    ctx.lineTo(centerX + baseWidth / 2, baseTop + 3);
    ctx.lineTo(centerX + bulbRadius * 0.38, baseTop);
    ctx.closePath();
    ctx.fill();
    
    // Base threads
    const threadCount = 2;
    for (let i = 0; i < threadCount; i++) {
      const threadY = baseTop + 5 + i * (baseHeight - 8) / threadCount;
      ctx.fillStyle = '#333';
      ctx.fillRect(centerX - baseWidth / 2, threadY, baseWidth, 1.5);
    }
    
    // LEFT TERMINAL - precise wire connection (extends LEFT from bulb)
    const terminalWidth = width * 0.08;
    const terminalHeight = height * 0.14;
    
    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#d4a574'; // Brass/copper color
    ctx.strokeStyle = '#8b5a3c';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.roundRect(x - terminalWidth, centerY - terminalHeight/2, terminalWidth, terminalHeight, 1);
    ctx.fill();
    ctx.stroke();
    
    // RIGHT TERMINAL - precise wire connection (extends RIGHT from bulb)
    ctx.beginPath();
    ctx.roundRect(x + width, centerY - terminalHeight/2, terminalWidth, terminalHeight, 1);
    ctx.fill();
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Contact point
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(centerX, baseTop + baseHeight + 2, baseWidth * 0.22, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.fillStyle = '#6b7280';
    ctx.font = `600 ${Math.max(9, width * 0.2)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Bulb', centerX, y + height + 4);
  }, []);

  // Smaller, precise electron with crisp glow
  const drawElectron = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number = 1) => {
    const size = 4 + brightness * 2;
    
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
  const getPositionOnPath = useCallback((path: {x: number, y: number}[], progress: number) => {
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
      progress: i / electronCount,
      speed: 0.006 + Math.random() * 0.003,
      branch: Math.random() > 0.5 ? 'top' : 'bottom',
    }));

    let time = 0;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Transparent background to match capacitor/inductor style
      ctx.clearRect(0, 0, rect.width, rect.height);

      const paths = getCircuitPaths(rect.width, rect.height);
      const { components } = paths;

      const maxCurrent = 2;
      const brightness = Math.min(computed.current / maxCurrent, 1);
      const speedFactor = 0.5 + brightness * 1.5;
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

      if (components.bulb) {
        drawBulb(ctx, components.bulb.x, components.bulb.y, components.bulb.width, components.bulb.height, brightness);
      }

      // Update and draw electrons
      electronsRef.current.forEach(electron => {
        electron.progress += electron.speed * speedFactor;
        
        let fullPath: {x: number, y: number}[] = [];
        
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
            electron.branch = Math.random() > 0.5 ? 'top' : 'bottom';
          }
        }
        
        if (fullPath.length > 0) {
          const pos = getPositionOnPath(fullPath, electron.progress);
          drawElectron(ctx, pos.x, pos.y, brightness);
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
