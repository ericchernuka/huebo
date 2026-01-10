interface DocumentTitleProps {
  title: string;
}

export default function DocumentTitle({ title }: DocumentTitleProps) {
  return <title>{`${title} | Huebo`}</title>;
}
