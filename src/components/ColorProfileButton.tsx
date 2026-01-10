interface Props {
  onClick: (value: string) => void;
  placeholder?: string;
  value: string | null;
}

export default function ColorProfileButton({
  onClick,
  placeholder = '–',
  value,
  ...props
}: Props) {
  return (
    <button
      {...props}
      onClick={() => value && onClick(value)}
      type="button"
      disabled={!value}
      className={`color-profile ${!value ? 'color-profile-muted' : ''}`}
    >
      {value || placeholder}
    </button>
  );
}
