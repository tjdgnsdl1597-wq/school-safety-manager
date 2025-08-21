'use client';

import PhotoCardManager from '../../components/PhotoCardManager';
import CopyrightFooter from '@/components/CopyrightFooter';

export default function IndustrialAccidentsPage() {
  return (
    <>
      <PhotoCardManager 
        category="산업재해" 
        title="중대재해 알리미"
      />
      <CopyrightFooter className="mt-8" />
    </>
  );
}