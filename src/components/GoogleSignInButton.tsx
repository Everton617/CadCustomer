import { FC, ReactNode } from 'react';
import { Button } from './ui/button';

interface GoogleSignInButtonProps {
  children: ReactNode;
}
const GoogleSignInButton: FC<GoogleSignInButtonProps> = ({ children }) => {
  const loginWithGoogle = () => console.log('login with google');

  return (
    <Button onClick={loginWithGoogle} className='w-full max-w-[400px]'>
      {children}
    </Button>
  );
};

export default GoogleSignInButton;
