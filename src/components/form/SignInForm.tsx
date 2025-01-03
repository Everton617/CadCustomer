'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import GoogleSignInButton from '../GoogleSignInButton';
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation';


const FormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have than 8 characters'),
});

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn('credentials', {
      email: values.email,
      password: values.password, 
      redirect: false,
    })

    if(signInData?.error){
      console.log(signInData.error)
    } else {
      router.refresh()
      router.push('/form')
    }
  };

  return (
    <div>
      <h1 className='text-2xl text-center font-bold pb-4'>Faça o seu login </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col items-center justify-center gap-4'>
          <div className=' space-y-2 flex flex-col items-center justify-center '>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className='min-w-[400px] max-w-[400px]' placeholder='mail@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                    className='min-w-[400px] max-w-[600px]'
                      type='password'
                      placeholder='Digite sua senha'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className='w-full mt-6 max-w-[400px]' type='submit'>
            Acessar
          </Button>
        </form>
        <div className='mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400'>
          ou
        </div>
        <div className='flex justify-center items-center'>
          <GoogleSignInButton>Acessar com o Google</GoogleSignInButton>
        </div>
        <p className='text-center text-sm text-gray-600 mt-2 '>
          Não tem uma conta? 
          <Link className='ml-2 text-blue-500 hover:underline' href='/sign-up'>
          Faça o seu cadastro
          </Link>
        </p>
      </Form>
    </div>
  );
};

export default SignInForm;
