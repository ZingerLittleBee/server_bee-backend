import {useRouter} from 'next/navigation';
import React, {ComponentType, useEffect, useState} from 'react';
import {useToken} from "@/hooks/useToken";
import {Loader2} from "lucide-react";
export default function WithAuth(WrappedComponent: ComponentType) {
    return (props: any) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const {token, isVerified} = useToken()

        useEffect(() => {
            if (token.communicationToken) {
                (async () => {
                    const isValid = await isVerified()
                    if (!isValid) {
                        setTimeout(() => {
                            router.replace('/login')
                        }, 500)
                    } else {
                        setLoading(false);
                    }
                })();
            } else {
                router.replace('/login');
            }
        }, [token.communicationToken]);

        if (loading) {
            return (
                <div className="h-full flex justify-center items-center">
                    <Loader2 size={60} className="animate-spin"/>
                </div>
            )
        }

        return <WrappedComponent {...props} />;
    };
}
