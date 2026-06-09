'use client';

import { useState } from 'react';
import ELBODeepDiveModal, { ELBODeepDiveButton } from './ELBODeepDiveModal';

export default function ELBOSectionWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ELBODeepDiveButton onClick={() => setIsModalOpen(true)} />
      <ELBODeepDiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
