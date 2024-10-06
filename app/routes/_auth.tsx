import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
    return (
        <div className="p-2 flex flex-col gap-2 items-center justify-center w-full h-screen">
            <Outlet />
        </div>
    )
}