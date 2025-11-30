import Link from 'next/link';
import Button from './Button';
import Button2 from './Button2';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full glass-surface z-50 border-b border-white/40 dark:border-white/10">
            <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
                {/* Logo */}
                <div className="font-bold text-xl flex items-center">
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
                <div className="flex items-center space-x-4">
                    {/* Støtte Button */}
                    <Button2 href="/stotte">Støtte</Button2>

                    {/* Logg inn Button */}
                    <Button href="http://app.sceneblikk.no/login">Logg inn</Button>
                </div>
            </div>
        </header>
    );
}