import React, { ReactNode } from 'react';
import useTitle from 'hooks/use-title';

type DocumentTitleProps = {
  children: ReactNode;
  title: string;
};

// TODO: Remove Fragment to avoid Typescript complaining
const DocumentTitle = ({ children, title }: DocumentTitleProps) => {
  useTitle(`${title} | Huebo`);
  return <>{children}</>;
};

export default DocumentTitle;
