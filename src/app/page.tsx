import Layout from "@/components/Navbar";
import Sidebar from "@/components/Navbar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return( 

    <div>
      <h1 className='text-4xl'>Home</h1>
      <Link className={buttonVariants()} href='/admin'>Open My Admin</Link>
    </div>
  
);
}
