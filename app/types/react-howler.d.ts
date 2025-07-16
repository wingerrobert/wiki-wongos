// types/react-howler.d.ts
declare module 'react-howler' {
  import * as React from 'react';

  interface ReactHowlerProps {
    src: string | string[];
    playing?: boolean;
    loop?: boolean;
    mute?: boolean;
    volume?: number;
    preload?: boolean;
    html5?: boolean;
    format?: string[];
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onEnd?: () => void;
    onLoad?: () => void;
    onLoadError?: (id: number, error: any) => void;
    onPlayError?: (id: number, error: any) => void;
    ref?: React.Ref<any>;
  }

  const ReactHowler: React.FC<ReactHowlerProps>;
  export default ReactHowler;
}
