'use client'

import { FaRegUser } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { IoSunnyOutline } from "react-icons/io5";


const UserAccountnav = () => {
    const { data: session } = useSession();
    return (
        <div>
            <HoverCard>
                <HoverCardTrigger><FaRegUser className="h-5 w-5" /></HoverCardTrigger>
                <HoverCardContent className="flex justify-center align-center flex-col gap-2 max-w-[150px]">
                    <div className="text-center">
                        <p className="">Bem-Vindo!</p>
                        <p>{session?.user?.username}</p>
                    </div>
                    <div className="flex justify-center">
                        <Button className="max-w-[100px]"
                            onClick={() => signOut({
                                redirect: true,
                                callbackUrl: `${window.location.origin}/sign-in`
                            })
                            }>
                            Deslogar
                        </Button >
                    </div>
                    <div className="flex justify-center">
                        <Button className="max-w-[100px]">
                            <IoSunnyOutline className="h-5 w-5" />
                        </Button>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>

    )
}; export default UserAccountnav;
