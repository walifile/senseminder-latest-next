"use client";

import React, {
    useState,
    useContext,
    useCallback,
    createContext,
} from "react";

const BillingRefreshContext = createContext({
    refreshKey: 0,
    triggerRefresh: () => { },
});

export const BillingRefreshProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <BillingRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </BillingRefreshContext.Provider>
    );
};

export const useBillingRefresh = () => useContext(BillingRefreshContext);
