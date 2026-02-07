import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

const cards = [
  {icon: '📝', title: '项目想法', text: '快速记录功能需求...'},
  {icon: '🔗', title: 'Vue.js 官方文档', text: 'vuejs.org'},
  {icon: '✓', title: '今日待办', text: '3 个待完成任务'},
];

export const Sidebar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 侧边栏滑入（0.5秒开始）
  const sidebarProgress = spring({
    frame: frame - 15,
    fps,
    config: {mass: 0.5},
  });

  const sidebarOpacity = interpolate(sidebarProgress, [0, 1], [0, 1]);
  const sidebarX = interpolate(sidebarProgress, [0, 1], [50, 0]);

  // 分割线展开（1.3秒开始）
  const dividerProgress = spring({
    frame: frame - 39,
    fps,
    config: {mass: 0.3},
  });

  return (
    <div
      style={{
        width: 320,
        height: 500,
        background: '#f8fafc',
        borderRadius: 12,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        padding: 24,
        opacity: sidebarOpacity,
        transform: `translateX(${sidebarX}px)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Slidememos
      </div>

      {/* Divider */}
      <div
        style={{
          height: 3,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          borderRadius: 2,
          marginBottom: 20,
          transform: `scaleX(${dividerProgress})`,
          transformOrigin: 'left',
        }}
      />

      {/* Cards */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, position: 'relative'}}>
        {/* 新卡片（从上方滑入，7秒时） */}
        <NewCard frame={frame} fps={fps} />

        {/* 旧卡片（依次出现，然后向下移动） */}
        {cards.map((card, index) => (
          <Card key={index} card={card} index={index} frame={frame} fps={fps} />
        ))}
      </div>
    </div>
  );
};

const Card: React.FC<{
  card: {icon: string; title: string; text: string};
  index: number;
  frame: number;
  fps: number;
}> = ({card, index, frame, fps}) => {
  // 卡片出现动画（1.8s, 2.2s, 2.6s）
  const appearProgress = spring({
    frame: frame - (54 + index * 12),
    fps,
    config: {
      damping: 200,
      mass: 1,
      stiffness: 100,
    },
  });

  const opacity = interpolate(appearProgress, [0, 1], [0, 1]);
  const y = interpolate(appearProgress, [0, 1], [20, 0]);

  // 向下移动动画（7秒时）
  const slideDownProgress = spring({
    frame: frame - 210,
    fps,
    config: {
      damping: 200,
      mass: 1,
      stiffness: 100,
    },
  });

  const slideY = interpolate(slideDownProgress, [0, 1], [0, 76]);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        opacity,
        transform: `translateY(${y + slideY}px)`,
      }}
    >
      <div style={{fontSize: 20, flexShrink: 0}}>{card.icon}</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#334155',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {card.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {card.text}
        </div>
      </div>
    </div>
  );
};

const NewCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  // 新卡片从上方滑入（7.2秒时）
  const slideInProgress = spring({
    frame: frame - 216,
    fps,
    config: {
      damping: 15,
      mass: 0.5,
      stiffness: 100,
    },
  });

  const opacity = interpolate(slideInProgress, [0, 1], [0, 1]);
  const y = interpolate(slideInProgress, [0, 1], [-100, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{fontSize: 20, flexShrink: 0}}>✨</div>
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'white',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          新笔记
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          刚刚添加
        </div>
      </div>
    </div>
  );
};
