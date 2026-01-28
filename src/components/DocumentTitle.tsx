interface DocumentTitleProps {
  title: string;
}

export function DocumentTitle({ title }: DocumentTitleProps) {
  return <title>{`${title} | Huebo`}</title>;
}
