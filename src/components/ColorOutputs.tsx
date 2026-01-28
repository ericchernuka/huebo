import copy from 'copy-to-clipboard';
import { useCallback, useState } from 'react';
import { useColorFormats } from '../hooks/useColorFormats';
import { ColorFormat } from './ColorFormat';
import { ColorProfileButton } from './ColorProfileButton';

const COPY_FEEDBACK_DURATION_MS = 2000;

interface Props {
  brightness: number | undefined;
  hue: number;
  saturation: number | undefined;
}

export function ColorOutputs({ brightness, hue, saturation }: Props) {
  const [copiedColorFormat, setCopiedColorFormat] = useState<string | null>(
    null,
  );

  const handleCopyColor = useCallback((value: string) => {
    copy(value);
    setCopiedColorFormat(value);
    setTimeout(() => setCopiedColorFormat(null), COPY_FEEDBACK_DURATION_MS);
  }, []);

  const formats = useColorFormats(hue, saturation, brightness);

  return (
    <div>
      {formats.map((format) => (
        <ColorFormat
          copied={copiedColorFormat === format.value}
          data-testid={format.testId}
          key={format.testId}
          label={format.label}
        >
          <ColorProfileButton
            onClick={handleCopyColor}
            placeholder={format.placeholder}
            value={format.value}
          />
        </ColorFormat>
      ))}
    </div>
  );
}
