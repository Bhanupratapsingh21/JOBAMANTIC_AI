"use client";
import { ReactNode, useEffect } from "react";
import { useUserStore } from "@/store/userStore";

type Props = {
    children: ReactNode;
};

export default function UserProvider({ children }: Props) {
    const fetchUser = useUserStore((state) => state.fetchUser);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return <>{children}</>;
}
