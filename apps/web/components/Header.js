import Link from 'next/link';
import Button from './Button';
import Button2 from './Button2';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full bg-transparent z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
                {/* Logo */}
                <div className="font-bold text-xl pt-4">
                    <Link href="/" className="block w-25 h-25">
                        <Image
                            src="/images/peacock_icon_rounded_head.png"
                            alt="Logo"
                            width={100}
                            height={100}
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