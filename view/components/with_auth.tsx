import {useRouter} from 'next/navigation';
import React, {ComponentType, useEffect, useState} from 'react';
import {useToken} from "@/hooks/useToken";

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
                        router.replace('/login');
                    }
                    setLoading(false);
                })();
            } else {
                router.replace('/login');
            }
        }, [token.communicationToken]);

        if (loading) {
            return <div>Loading...</div>;
        }
        return <WrappedComponent {...props} />;
    };
}
