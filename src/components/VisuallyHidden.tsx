import React from 'react';

let style: any = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  width: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
};

const VisuallyHidden = (props: React.HTMLProps<HTMLSpanElement>) => {
  return <span style={style} {...props} />;
};

export default VisuallyHidden;
