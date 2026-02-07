import {Composition} from 'remotion';
import {Video} from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        durationInFrames={360}
        fps={30}
        width={1280}
        height={800}
      />
    </>
  );
};
