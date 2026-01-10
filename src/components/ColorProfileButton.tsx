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
      className={`color-profile ${!value ? 'color-profile-muted' : ''}`}
      disabled={!value}
      onClick={() => value && onClick(value)}
      type="button"
    >
      {value || placeholder}
    </button>
  );
}
