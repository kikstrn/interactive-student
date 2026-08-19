"use client";

import dynamic from "next/dynamic";

const ProductTour = dynamic(
    () => import("./product-tour"),
    {
        ssr: false,
        loading: () => null,
    }
);

type ProductTourLoaderProps = {
    autoStart: boolean;
    forceStart?: boolean;
    initialStep?: number;
};

export default function ProductTourLoader(
    props: ProductTourLoaderProps
) {
    return <ProductTour {...props} />;
}
