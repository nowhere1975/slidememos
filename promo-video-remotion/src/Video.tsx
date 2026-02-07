import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import {Sidebar} from './components/Sidebar';
import {TextContent} from './components/TextContent';
import {EndScreen} from './components/EndScreen';

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 背景光晕动画
  const pulseProgress = spring({
    frame: frame % 120,
    fps,
    config: {
      damping: 200,
    },
  });

  // 主内容淡出（10秒时）
  const contentOpacity = interpolate(
    frame,
    [300, 330],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // 结束画面淡入（10秒时）
  const endScreenOpacity = interpolate(
    frame,
    [300, 330],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        overflow: 'hidden',
      }}
    >
      {/* 装饰性光晕 */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-15%',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          opacity: 0.3 + pulseProgress * 0.2,
          transform: `scale(${1 + pulseProgress * 0.1})`,
        }}
      />

      {/* 主内容 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 80,
          opacity: contentOpacity,
        }}
      >
        <Sidebar />
        <TextContent />
      </div>

      {/* 结束画面 */}
      <div style={{opacity: endScreenOpacity}}>
        <EndScreen />
      </div>
    </AbsoluteFill>
  );
};

