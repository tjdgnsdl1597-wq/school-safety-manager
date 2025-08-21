'use client';

import MaterialManager from '../../components/MaterialManager';
import CopyrightFooter from '@/components/CopyrightFooter';

export default function EducationalMaterialsPage() {
  return (
    <>
      <MaterialManager 
        category="교육자료" 
        title="교육 자료 관리"
      />
      <CopyrightFooter className="mt-8" />
    </>
  );
}