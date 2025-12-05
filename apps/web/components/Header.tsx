'use client';

import Link from 'next/link';
import Button from './Button';
import Button2 from './Button2';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/app/i18n';

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 w-full glass-surface z-50 border-b border-white/40 dark:border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="font-bold text-xl flex items-center gap-3">
          <Link href="/" className="block h-12 w-12">
            <Image
              src="/images/peacock_icon_rounded_head.png"
              alt="Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <Button2 href="/stotte">{t('header', 'support')}</Button2>
            <Button href="http://app.sceneblikk.no/login">{t('header', 'login')}</Button>
          </div>
        </div>
      </div>
    </header>
  );
}



