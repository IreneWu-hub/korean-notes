import React, { type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import PracticeMarker from '@site/src/components/PracticeMarker';

export default function Root({ children }: { children: ReactNode }): ReactNode {
  const { pathname } = useLocation();
  const isPracticePage = /\/docs\/practice\//i.test(pathname);

  return (
    <>
      {children}
      {isPracticePage && <PracticeMarker />}
    </>
  );
}
