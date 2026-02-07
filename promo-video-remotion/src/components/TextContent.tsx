import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

const features = [
  'Markdown 一键预览',
  '智能链接识别',
  '跨设备自动同步',
];

export const TextContent: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 主标题淡入（3.5秒）
  const titleProgress = spring({
    frame: frame - 105,
    fps,
    config: {mass: 0.5},
  });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [30, 0]);

  // 副标题淡入（4秒）
  const subTitleProgress = spring({
    frame: frame - 120,
    fps,
    config: {mass: 0.5},
  });

  const subTitleOpacity = interpolate(subTitleProgress, [0, 1], [0, 1]);

  // CTA 按钮弹出（8秒）
  const ctaProgress = spring({
    frame: frame - 240,
    fps,
    config: {mass: 0.5},
  });

  const ctaOpacity = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaProgress, [0, 1], [0.9, 1]);

  return (
    <div style={{maxWidth: 500, color: 'white'}}>
      {/* 主标题 */}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 16,
          background: 'linear-gradient(90deg, #fff, #cbd5e1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        侧边栏便签本
      </h1>

      {/* 副标题 */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 300,
          color: '#e2e8f0',
          lineHeight: 1.4,
          marginBottom: 32,
          opacity: subTitleOpacity,
          letterSpacing: 0.5,
          fontStyle: 'italic',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        always by your side
      </p>

      {/* 特性列表 */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {features.map((feature, index) => (
          <Feature key={index} feature={feature} index={index} frame={frame} fps={fps} />
        ))}
      </div>

      {/* CTA 按钮 */}
      <button
        style={{
          marginTop: 40,
          padding: '16px 32px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          color: 'white',
          fontSize: 18,
          fontWeight: 600,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Chrome 扩展
      </button>
    </div>
  );
};

const Feature: React.FC<{
  feature: string;
  index: number;
  frame: number;
  fps: number;
}> = ({feature, index, frame, fps}) => {
  // 特性依次滑入（4.5s, 4.8s, 5.1s）
  const progress = spring({
    frame: frame - (135 + index * 9),
    fps,
    config: {mass: 0.5},
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [-20, 0]);

  // 打字机效果（仅第一个特性，5秒开始）
  const isFirstFeature = index === 0;
  const typingProgress = isFirstFeature
    ? interpolate(frame, [150, 195], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const visibleChars = Math.floor(feature.length * typingProgress);
  const displayText = isFirstFeature ? feature.slice(0, visibleChars) : feature;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 16,
        color: '#cbd5e1',
        opacity,
        transform: `translateX(${x}px)`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          background: '#3b82f6',
          borderRadius: '50%',
          flexShrink: 0,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
        }}
      />
      <span>
        {displayText}
        {isFirstFeature && typingProgress < 1 && (
          <span style={{borderRight: '2px solid #3b82f6', marginLeft: 2}} />
        )}
      </span>
    </div>
  );
};
