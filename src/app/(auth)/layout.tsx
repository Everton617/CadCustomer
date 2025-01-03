import Image from 'next/image';
import { FC, ReactNode } from 'react';
import logo from '@/assets/imgs/logo.jpg'

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex flex-row items-center justify-center h-screen w-screen">
      <Image
        src={logo}
        alt="Logo"
        fill
        className="object-cover"
      />
      <div className="min-w-[600px] min-h-[500px] absolute bg-white/80 p-10 rounded-md backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;